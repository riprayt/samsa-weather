import { getWeatherSuggestion } from "./weatherAI.js"; 

function showErrorModal(errorMessage) {
  document.getElementById("errorModalMessage").textContent = errorMessage;
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
  errorModal.show();
}


async function fetchWeather(city) {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}&lang=tr`);
  if (!response.ok) {
    showErrorModal("Şehir bulunamadı. Lütfen doğru yazdığınızdan emin olun.");
    return null;
  }

  const data = await response.json();


  const weatherIcon = document.getElementById("weather-icon");
  const iconMapping = {
    "01d": "clear-day.svg",
    "01n": "clear-night.svg",
    "02d": "partly-cloudy-day.svg",
    "02n": "partly-cloudy-night.svg",
    "03d": "cloudy.svg",
    "03n": "cloudy.svg",
    "04d": "overcast.svg",
    "04n": "overcast.svg",
    "09d": "rain.svg",
    "09n": "rain.svg",
    "10d": "rain.svg",
    "10n": "rain.svg",
    "11d": "thunderstorms.svg",
    "11n": "thunderstorms.svg",
    "13d": "snow.svg",
    "13n": "snow.svg",
    "50d": "mist.svg",
    "50n": "mist.svg",
  };

  const iconCode = data.weather[0].icon;
  const iconFileName = iconMapping[iconCode] || "default.svg";
  weatherIcon.src = `assets/icons/${iconFileName}`;


  const humidity = data.main.humidity;
  const humidityDescriptions = [
    { level: "Düşük", color: "bg-success", textColor: "text-success" },
    { level: "Orta", color: "bg-warning", textColor: "text-warning" },
    { level: "Yüksek", color: "bg-danger", textColor: "text-danger" },
  ];
  let humidityLevel;
  if (humidity <= 30) {
    humidityLevel = humidityDescriptions[0];
  } else if (humidity <= 60) {
    humidityLevel = humidityDescriptions[1];
  } else {
    humidityLevel = humidityDescriptions[2];
  }
  document.getElementById("humidity-value").textContent = `${humidity}%`;
  document.getElementById("humidity-description").textContent = humidityLevel.level;
  document.getElementById("humidity-description").className = `fw-bold ${humidityLevel.textColor}`;
  document.getElementById("humidity-bar").style.width = `${humidity}%`;
  document.getElementById("humidity-bar").className = `progress-bar ${humidityLevel.color}`;

  return data;
}

function updateWeatherCard(data) {
  if (data) {
    document.getElementById("weather-city").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("ai-summary-text").textContent =
      `${data.name} için yapay zeka önerisi oluşturulmadı. Oluşturmak için butona dokun...`;
    document.getElementById("weather-temperature").textContent = `${Math.round(data.main.temp)}° `;
    document.getElementById("weather-text").textContent =
      data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    document.getElementById("temp-range").textContent =
      `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;
    document.getElementById("feels-like").textContent = `Hissedilen ${Math.round(data.main.feels_like)}°`;
  }
}


async function fetchCoordinates(city) {
  const response = await fetch(`/api/geo?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    alert("Hava kalitesi için koordinatlar alınırken hata oluştu. Lütfen tekrar deneyin.");
    return null;
  }
  const data = await response.json();
  if (data.length === 0) {
    alert("Şehir bulunamadı.");
    return null;
  }
  return { lat: data[0].lat, lon: data[0].lon };
}


async function fetchUVIndex(lat, lon) {
  const response = await fetch(`/api/uv?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    document.getElementById("uv-index-value").textContent = "N/A";
    document.getElementById("uv-index-description").textContent = "UV index verisi mevcut değil.";
    document.getElementById("uv-index-bar").style.width = "0%";
    document.getElementById("uv-index-bar").className = "progress-bar bg-secondary";
    return;
  }
  const data = await response.json();
  const uvIndex = data.value;

  const uvIndexDescriptions = [
    { level: "Düşük", color: "bg-success", textColor: "text-success" },
    { level: "Orta", color: "bg-warning", textColor: "text-warning" },
    { level: "Yüksek", color: "bg-orange", textColor: "text-orange" },
    { level: "Çok Yüksek", color: "bg-danger", textColor: "text-danger" },
    { level: "Aşırı Yüksek", color: "bg-dark", textColor: "text-dark" },
  ];

  let uvLevel;
  if (uvIndex <= 2) {
    uvLevel = uvIndexDescriptions[0];
  } else if (uvIndex <= 5) {
    uvLevel = uvIndexDescriptions[1];
  } else if (uvIndex <= 7) {
    uvLevel = uvIndexDescriptions[2];
  } else if (uvIndex <= 10) {
    uvLevel = uvIndexDescriptions[3];
  } else {
    uvLevel = uvIndexDescriptions[4];
  }
  document.getElementById("uv-index-value").textContent = uvIndex;
  document.getElementById("uv-index-description").textContent = uvLevel.level;
  document.getElementById("uv-index-description").className = `fw-bold ${uvLevel.textColor}`;
  document.getElementById("uv-index-bar").style.width = `${(uvIndex / 11) * 100}%`;
  document.getElementById("uv-index-bar").className = `progress-bar ${uvLevel.color}`;
}


async function fetchAirQuality(city) {
  const coordinates = await fetchCoordinates(city);
  if (!coordinates) return;
  const { lat, lon } = coordinates;
  const response = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    document.getElementById("aqi-value").textContent = "N/A";
    document.getElementById("aqi-description").textContent = "Hava kalitesi bilgisi mevcut değil.";
    document.getElementById("aqi-bar").style.width = "0%";
    document.getElementById("aqi-bar").className = "progress-bar bg-secondary";
    return;
  }
  const data = await response.json();
  const aqi = data.list[0].main.aqi; 
  const aqiDescriptions = [
    { level: "İyi", color: "bg-success", textColor: "text-success" },
    { level: "Orta", color: "bg-info", textColor: "text-info" },
    { level: "Hafif Kirli", color: "bg-warning", textColor: "text-warning" },
    { level: "Kötü", color: "bg-danger", textColor: "text-danger" },
    { level: "Çok Kötü", color: "bg-dark", textColor: "text-dark" },
  ];
  const { level, color, textColor } = aqiDescriptions[aqi - 1];
  document.getElementById("aqi-value").textContent = aqi;
  document.getElementById("aqi-description").textContent = level;
  document.getElementById("aqi-description").className = `fw-bold ${textColor}`;
  const aqiBar = document.getElementById("aqi-bar");
  aqiBar.style.width = `${(aqi / 5) * 100}%`;
  aqiBar.className = `progress-bar ${color}`;
  fetchUVIndex(lat, lon);
}


async function generateHourlyForecast(city) {
  const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}&lang=tr`);
  if (!response.ok) {
    alert("Saatlik hava durumu bilgisi alınırken hata oluştu. Lütfen tekrar deneyin.");
    return;
  }
  const data = await response.json();
  const forecastContainer = document.getElementById("hourly-forecast");
  forecastContainer.innerHTML = "";
  const iconMapping = getIconMapping();
  const forecastList = data.list.slice(0, 24);


  const groupedDates = {};
  forecastList.forEach((hourData) => {
    const date = new Date(hourData.dt * 1000);
    const dateString = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    groupedDates[dateString] = groupedDates[dateString] || [];
    groupedDates[dateString].push(hourData);
  });

  const pillColors = ["bg-primary", "bg-info"];
  Object.entries(groupedDates).forEach(([dateStr, hours], index) => {
    const dateGroup = document.createElement("div");
    dateGroup.className = "date-group mb-3";
    const datePill = document.createElement("div");
    datePill.className = `badge bg-opacity-75 ${pillColors[index % pillColors.length]} mb-3 p-1 w-100`;
    datePill.textContent = dateStr;
    const hoursContainer = document.createElement("div");
    hoursContainer.className = "d-flex flex-nowrap overflow-x-auto pb-2";
    hours.forEach((hourData) => {
      const hour = new Date(hourData.dt * 1000);
      const hourString = hour.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      });
      const temp = Math.round(hourData.main.temp);
      const iconCode = hourData.weather[0].icon;
      const iconFileName = iconMapping[iconCode] || "default.svg";
      const hourlyItem = document.createElement("div");
      hourlyItem.className = "flex-shrink-0 me-2";
      hourlyItem.innerHTML = `
        <div class="card shadow-sm border-0" style="width: 90px;">
          <div class="card-body p-2 text-center">
            <div class="text-muted small mb-1">${hourString}</div>
            <img src="assets/icons/static/${iconFileName}" class="img-fluid mb-1" style="width: 40px;">
            <div class="fw-bold text-dark">${temp}°</div>
          </div>
        </div>
      `;
      hoursContainer.appendChild(hourlyItem);
    });
    dateGroup.appendChild(datePill);
    dateGroup.appendChild(hoursContainer);
    forecastContainer.appendChild(dateGroup);
  });
}

async function updateData(city) {
  const weatherData = await fetchWeather(city);
  if (!weatherData) return;
  updateWeatherCard(weatherData);
  fetchAirQuality(city);
  generateHourlyForecast(city);
}


window.addEventListener("load", async () => {
  try {
    console.log("Kullanıcının konumu ipapi üzerinden alınıyor...");
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("IP tabanlı konum verisi alınamadı.");
    const data = await response.json();
    const city = data.city || "Istanbul"; 
    console.log(`Tespit edilen şehir: ${city}`);
    updateData(city);
  } catch (error) {
    console.error("ipapi üzerinden konum alınırken hata:", error);
    updateData("Istanbul");
  }
});

document.getElementById("search-btn").addEventListener("click", function () {
  const city = document.getElementById("city-input").value.trim() || "Istanbul";

  updateData(city);
});
document.getElementById("city-input").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
      const city = document.getElementById("city-input").value.trim() || "Istanbul";

      updateData(city);
  }
});








function getIconMapping() {
  return {
    "01d": "clear-day.svg",
    "01n": "clear-night.svg",
    "02d": "partly-cloudy-day.svg",
    "02n": "partly-cloudy-night.svg",
    "03d": "cloudy.svg",
    "03n": "cloudy.svg",
    "04d": "overcast.svg",
    "04n": "overcast.svg",
    "09d": "rain.svg",
    "09n": "rain.svg",
    "10d": "rain.svg",
    "10n": "rain.svg",
    "11d": "thunderstorms.svg",
    "11n": "thunderstorms.svg",
    "13d": "snow.svg",
    "13n": "snow.svg",
    "50d": "mist.svg",
    "50n": "mist.svg",
  };
}


let lastAISummary = `Yapay zeka önerisi oluşturulmadı. Oluşturmak için butona dokun...`;
function assignIDs() {
  const desktopSummaryText = document.querySelector("#AI .card-body .ai-summary-text-desktop");
  const desktopGenerateBtn = document.querySelector("#AI .card-body .generate-summary-desktop");
  const mobileSummaryText = document.querySelector("#aiOverviewCollapse .card-body .ai-summary-text-mobile");
  const mobileGenerateBtn = document.querySelector("#aiOverviewCollapse .card-body .generate-summary-btn-mobile");

  if (window.innerWidth < 768) {
    if (desktopSummaryText?.id) desktopSummaryText.removeAttribute("id");
    if (desktopGenerateBtn?.id) desktopGenerateBtn.removeAttribute("id");
    if (mobileSummaryText) mobileSummaryText.id = "ai-summary-text";
    if (mobileGenerateBtn) mobileGenerateBtn.id = "generate-summary-btn";
  } else {
    if (mobileSummaryText?.id) mobileSummaryText.removeAttribute("id");
    if (mobileGenerateBtn?.id) mobileGenerateBtn.removeAttribute("id");
    if (desktopSummaryText) desktopSummaryText.id = "ai-summary-text";
    if (desktopGenerateBtn) desktopGenerateBtn.id = "generate-summary-btn";
  }
}

async function attachGenerateListener() {
  const generateBtn = document.getElementById("generate-summary-btn");
  if (!generateBtn) return;
  const newBtn = generateBtn.cloneNode(true);
  generateBtn.parentNode.replaceChild(newBtn, generateBtn);
  newBtn.addEventListener("click", async function () {
    const button = this;
    button.disabled = true;
    const city = document.getElementById("weather-city").textContent.split(",")[0].trim();
    const weatherData = await fetchWeather(city);
    if (!weatherData) {
      document.getElementById("ai-summary-text").textContent = "Hava verisi mevcut değil.";
      button.disabled = false;
      return;
    }
    const aiContainer = document.getElementById("AI");
    const summaryText = document.getElementById("ai-summary-text");
    if (!aiContainer || !summaryText) {
      button.disabled = false;
      return;
    }
    const initialHeight = aiContainer.offsetHeight;
    summaryText.textContent = `${city} için düşünüyorum...`;
    summaryText.classList.add("loading-text");

    try {
      const aiSummary = await getWeatherSuggestion(weatherData);
      summaryText.classList.remove("loading-text");
      summaryText.classList.add("fade-in");
      summaryText.textContent = aiSummary;
      aiContainer.style.height = "auto";
      const newHeight = aiContainer.scrollHeight + "px";
      aiContainer.style.height = initialHeight + "px";
      setTimeout(() => {
        aiContainer.style.height = newHeight;
      }, 20);
      setTimeout(() => {
        summaryText.classList.add("show");
        lastAISummary = summaryText.textContent;
      }, 100);
    } catch (error) {
      summaryText.textContent = "Bir hata oluştu. Lütfen tekrar deneyin.";
    } finally {
      button.disabled = false;
      setTimeout(() => {
        summaryText.classList.remove("fade-in", "show");
      }, 500);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  assignIDs();
  attachGenerateListener();
});

window.addEventListener("resize", () => {
  assignIDs();
  attachGenerateListener();
  document.getElementById("ai-summary-text").textContent = lastAISummary;
  if (window.innerWidth >= 768) {
    const mobileCollapseEl = document.getElementById("aiOverviewCollapse");
    if (mobileCollapseEl) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(mobileCollapseEl, { toggle: false });
      bsCollapse.hide();
    }
  } else {
    const desktopContainer = document.getElementById("AI");
    if (desktopContainer) {
      desktopContainer.style.removeProperty("height");
    }
  }
  const mobileCard = document.querySelector("#aiOverviewCollapse .card");
  if (mobileCard) {
    mobileCard.style.removeProperty("height");
  }
});

const cityLinks = document.querySelectorAll(".city-link");
cityLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    cityLinks.forEach((cityLink) => cityLink.classList.remove("active"));
    link.classList.add("active");
    const city = link.getAttribute("data-city");
    updateData(city);
  });
});


