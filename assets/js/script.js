
import { getWeatherSuggestion } from "./weatherAI.js"; 


function showErrorModal(errorMessage) {
    document.getElementById("errorModalMessage").textContent = errorMessage;
    const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
    errorModal.show();
  }

async function fetchWeather(city) {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    showErrorModal("City not found. Please make sure the city name is correct.");
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
  const iconFileName = iconMapping[iconCode] || "default.svg"; // Fallback to default icon
  weatherIcon.src = `assets/icons/${iconFileName}`;

    // Update humidity
    const humidity = data.main.humidity;

    // Humidity Descriptions and Colors
    const humidityDescriptions = [
        { level: "Low", color: "bg-success", textColor: "text-success" },
        { level: "Moderate", color: "bg-warning", textColor: "text-warning" },
        { level: "High", color: "bg-danger", textColor: "text-danger" },
    ];

    // Determine Humidity level
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
        document.getElementById("ai-summary-text").textContent = `No summary generated for ${data.name}. Tap the button to generate one...`; // Clear previous AI summary
        document.getElementById("weather-temperature").textContent = `${Math.round(data.main.temp)}° `;
        document.getElementById("weather-text").textContent = `${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`;
        document.getElementById("temp-range").textContent = `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;
        document.getElementById("feels-like").textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
    }
}
async function fetchCoordinates(city) {
  const response = await fetch(`/api/geo?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    alert("Failed to fetch coordinates for air quality. Please try again.");
    return null;
  }
  const data = await response.json();
  if (data.length === 0) {
    alert("City not found.");
    return null;
  }
  return { lat: data[0].lat, lon: data[0].lon };
}

async function fetchUVIndex(lat, lon) {
  const response = await fetch(`/api/uv?lat=${lat}&lon=${lon}`);
  if (!response.ok) {
    document.getElementById("uv-index-value").textContent = "N/A";
    document.getElementById("uv-index-description").textContent = "UV index data not available.";
    document.getElementById("uv-index-bar").style.width = "0%";
    document.getElementById("uv-index-bar").className = "progress-bar bg-secondary";
    return;
  }
  const data = await response.json();
  const uvIndex = data.value;

    // UV Index Descriptions and Colors
    const uvIndexDescriptions = [
        { level: "Low", color: "bg-success", textColor: "text-success" },
        { level: "Moderate", color: "bg-warning", textColor: "text-warning" },
        { level: "High", color: "bg-orange", textColor: "text-orange" },
        { level: "Very High", color: "bg-danger", textColor: "text-danger" },
        { level: "Extreme", color: "bg-dark", textColor: "text-dark" },
    ];

    // Determine UV Index level
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

    // Update UV Index
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
    document.getElementById("aqi-description").textContent = "Air quality data not available.";
    document.getElementById("aqi-bar").style.width = "0%";
    document.getElementById("aqi-bar").className = "progress-bar bg-secondary";
    return;
  }
  const data = await response.json();
    const aqi = data.list[0].main.aqi; // Air Quality Index
  
    // AQI Descriptions and Colors
    const aqiDescriptions = [
      { level: "Good", color: "bg-success", textColor: "text-success" },
      { level: "Fair", color: "bg-info", textColor: "text-info" },
      { level: "Moderate", color: "bg-warning", textColor: "text-warning" },
      { level: "Poor", color: "bg-danger", textColor: "text-danger" },
      { level: "Very Poor", color: "bg-dark", textColor: "text-dark" },
    ];
  
    // Get AQI level details
    const { level, color, textColor } = aqiDescriptions[aqi - 1];
  
    // Update AQI Value
    document.getElementById("aqi-value").textContent = aqi;
    document.getElementById("aqi-description").textContent = level;
    document.getElementById("aqi-description").className = `fw-bold ${textColor}`;
  
    // Update Progress Bar
    const aqiBar = document.getElementById("aqi-bar");
    aqiBar.style.width = `${(aqi / 5) * 100}%`; // Scale AQI to 100%
    aqiBar.className = `progress-bar ${color}`;

    // Fetch UV Index
    fetchUVIndex(lat, lon);
  }
  
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

async function generateHourlyForecast(city) {
  const response = await fetch(`/api/forecast?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    alert("Failed to fetch hourly forecast. Please try again.");
    return;
  }
  const data = await response.json();
    const forecastContainer = document.getElementById("hourly-forecast");
    forecastContainer.innerHTML = "";

    const iconMapping = getIconMapping();
    const forecastList = data.list.slice(0, 24);

    // Group by date (DD/MM)
    const groupedDates = {};
    forecastList.forEach((hourData) => {
        const date = new Date(hourData.dt * 1000);
        const dateString = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        groupedDates[dateString] = groupedDates[dateString] || [];
        groupedDates[dateString].push(hourData);
    });

    // Bootstrap color classes for pills
    const pillColors = ['bg-primary', 'bg-info'];
    
    // Create UI elements
    Object.entries(groupedDates).forEach(([dateStr, hours], index) => {
        const dateGroup = document.createElement("div");
        dateGroup.className = "date-group mb-3";
        
        // Date pill using Bootstrap classes
        const datePill = document.createElement("div");
        datePill.className = `badge bg-opacity-75 ${pillColors[index % pillColors.length]} mb-3 p-1 w-100`;
        datePill.textContent = dateStr;

        // Hourly items container
        const hoursContainer = document.createElement("div");
        hoursContainer.className = "d-flex flex-nowrap overflow-x-auto pb-2";

        // Populate hourly items
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

async function updateData(city){
    const weatherData = await fetchWeather(city);
    if (!weatherData) return;
    updateWeatherCard(weatherData);
    fetchAirQuality(city);
    generateHourlyForecast(city);
}

window.addEventListener("load", async () => {
  try {
    // Fetch location data using ipapi
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("Failed to fetch IP-based location data.");
    }
    const data = await response.json();

    // Get city from the ipapi response
    const city = data.city || "Istanbul"; // Default to Istanbul if city is not found
    console.log(`Detected city: ${city}`);

    updateData(city); // Use the detected city for weather data
  } catch (error) {
    console.error("Error fetching location from ipapi:", error);
    updateData("Istanbul"); // Default to Istanbul on failure
  }
});

let lastAISummary = `No summary generated. Tap the button to generate one...`; // Store last AI summary for re-assignment
function assignIDs() {
    // Desktop references by class
    const desktopSummaryText = document.querySelector("#AI .card-body .ai-summary-text-desktop");
    const desktopGenerateBtn = document.querySelector("#AI .card-body .generate-summary-desktop");
  
    // Mobile references by class
    const mobileSummaryText = document.querySelector("#aiOverviewCollapse .card-body .ai-summary-text-mobile");
    const mobileGenerateBtn = document.querySelector("#aiOverviewCollapse .card-body .generate-summary-btn-mobile");
  
    if (window.innerWidth < 768) {
      // ---- MOBILE view ----
      // Remove IDs from desktop
      if (desktopSummaryText?.id) desktopSummaryText.removeAttribute("id");
      if (desktopGenerateBtn?.id) desktopGenerateBtn.removeAttribute("id");
  
      // Assign IDs to mobile
      if (mobileSummaryText) mobileSummaryText.id = "ai-summary-text";
      if (mobileGenerateBtn) mobileGenerateBtn.id = "generate-summary-btn";
  
    } else {
      // ---- DESKTOP view (>= 768px) ----
      // Remove IDs from mobile
      if (mobileSummaryText?.id) mobileSummaryText.removeAttribute("id");
      if (mobileGenerateBtn?.id) mobileGenerateBtn.removeAttribute("id");
  
      // Assign IDs to desktop
      if (desktopSummaryText) desktopSummaryText.id = "ai-summary-text";
      if (desktopGenerateBtn) desktopGenerateBtn.id = "generate-summary-btn";
    }
  }
  
  // Attach the click listener to whichever element ends up with the "generate-summary-btn" ID.
  async function attachGenerateListener() {
    const generateBtn = document.getElementById("generate-summary-btn");
    if (!generateBtn) return; // If desktop or mobile doesn't exist in this view
  
    // Remove old event listeners by cloning
    const newBtn = generateBtn.cloneNode(true);
    generateBtn.parentNode.replaceChild(newBtn, generateBtn);
  
    // Now attach the single listener to the fresh clone
    newBtn.addEventListener("click", async function () {
      const button = this;
      button.disabled = true; // Disable the button
  
      // Fetch city name
      const city = document
        .getElementById("weather-city")
        .textContent.split(",")[0]
        .trim();
      // Re-fetch weather
      const weatherData = await fetchWeather(city); 
      if (!weatherData) {
        document.getElementById("ai-summary-text").textContent =
          "Weather data is not available.";
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
      summaryText.textContent = `Thinking for ${city}...`; 
      summaryText.classList.add("loading-text");
  
      try {
        const aiSummary = await getWeatherSuggestion(weatherData);
        
        // Animate the expansion
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
        summaryText.textContent = "An error occurred. Please try again.";
      } finally {
        button.disabled = false;
        // Reset animations
        setTimeout(() => {
          summaryText.classList.remove("fade-in", "show");
        }, 500);
      }
    });
  }
  
  // Run everything on DOMContentLoaded.
  document.addEventListener("DOMContentLoaded", () => {
    assignIDs();            // Assign the correct IDs based on screen width
    attachGenerateListener(); // Attach the event to whichever button now has that ID
  });
  
  window.addEventListener("resize", () => {
    assignIDs();            // Reassign IDs if crossing the breakpoint
    attachGenerateListener(); // Reattach events to the newly assigned button
    // If we already had an AI summary, apply it to the new #ai-summary-text
   // If now in desktop view (>= 768px), force close the mobile collapse
   document.getElementById("ai-summary-text").textContent = lastAISummary;
   if (window.innerWidth >= 768) {
    const mobileCollapseEl = document.getElementById("aiOverviewCollapse");
    if (mobileCollapseEl) {
      // Get or create the Bootstrap Collapse instance
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(mobileCollapseEl, {
        toggle: false,
      });
      bsCollapse.hide();
      
    }
  } else {
    // If now in mobile view (< 768px), you can reset the desktop container if needed
    const desktopContainer = document.getElementById("AI");
    if (desktopContainer) {
      // Remove any leftover inline style that might keep it collapsed
      desktopContainer.style.removeProperty("height");
    }
  }

  // Also remove leftover inline height from the mobile card so it's fresh
  const mobileCard = document.querySelector("#aiOverviewCollapse .card");
  if (mobileCard) {
    mobileCard.style.removeProperty("height");
  }
  });
  

  const cityLinks = document.querySelectorAll(".city-link");
  
    cityLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
  
        // Remove the active class from all links
        cityLinks.forEach((cityLink) => cityLink.classList.remove("active"));
  
        // Add the active class to the clicked link
        link.classList.add("active");
  
        // Get the city name from the data attribute
        const city = link.getAttribute("data-city");

        // Update the weather data for the selected city
        updateData(city);

      });
    });