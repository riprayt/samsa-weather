// api/getWeatherSuggestion.js

export default async function handler(req, res) {
    // This endpoint accepts only POST requests.
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
  
    // Retrieve weatherData and language from the request body.
    const { weatherData, lang } = req.body;
    if (!weatherData) {
      res.status(400).json({ error: "Missing weatherData in request body" });
      return;
    }
    
    // Constants used for building the prompts.
    const baseURL = "https://openrouter.ai/api/v1";
    const AiModel = "google/gemini-flash-1.5-8b";
    const siteURL = "https://riprayt.github.io/ai_samsa_weather"; 
    const siteTitle = "Samsa Weather";                         
  
    // --- Re-create the determineClothing logic here ---
    const temp = Math.round(weatherData.main.temp);
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    
    let clothingSuggestionEN = "";
    let clothingSuggestionTR = "";
    
    if (temp <= 5) {
      clothingSuggestionEN = "T-shirt, thick sweatshirt, jeans or sweatpants, and a puffer jacket.";
      clothingSuggestionTR = "Tişört, kalın sweatshirt, jeans (veya eşofman altı) ve şişme mont giyin.";
    } else if (temp >= 6 && temp <= 10) {
      clothingSuggestionEN = "Wear a T-shirt, light sweatshirt, jeans or sweatpants, and a puffer jacket.";
      clothingSuggestionTR = "Tişört, ince sweatshirt, jeans (veya eşofman altı) ve şişme mont giyin.";
    } else if (temp >= 11 && temp <= 15) {
      clothingSuggestionEN = "Wear a T-shirt, light sweatshirt, jeans or sweatpants, and a light jacket.";
      clothingSuggestionTR = "Tişört, ince sweatshirt, jeans (veya eşofman altı) ve ince ceket giyin.";
    } else if (temp >= 16 && temp <= 20) {
      clothingSuggestionEN = "Wear a T-shirt, hoodie, jeans or sweatpants, no jacket needed.";
      clothingSuggestionTR = "Tişört, kapüşonlu, jeans (veya eşofman altı) giyin, ceket gerekli değil.";
    } else if (temp >= 21 && temp <= 25) {
      clothingSuggestionEN = "Wear a T-shirt, jorts, and a light jacket.";
      clothingSuggestionTR = "Tişört, şort ve ince ceket giyin.";
    } else {
      clothingSuggestionEN = "Wear a T-shirt and jorts, no jacket needed.";
      clothingSuggestionTR = "Tişört ve şort giyin, ceket gerekli değil.";
    }
    
    let windAdviceEN = "";
    let windAdviceTR = "";
    if (windSpeed > 15) {
      windAdviceEN = "Due to strong winds, consider layering more.";
      windAdviceTR = "Güçlü rüzgar nedeniyle daha kalın giyinmeyi düşünün.";
    }
    
    let humidityAdviceEN = "";
    let humidityAdviceTR = "";
    if (humidity > 90 && temp > 15) {
      humidityAdviceEN = " The humidity is high, so avoid excessive layering.";
      humidityAdviceTR = " Nem yüksek, bu yüzden kat kat giyinmekten kaçının.";
    }
    
    // Choose the language
    const clothingSuggestion = lang === "tr"
      ? `${clothingSuggestionTR} ${windAdviceTR}${humidityAdviceTR}`
      : `${clothingSuggestionEN} ${windAdviceEN}${humidityAdviceEN}`;
    // --- End determineClothing logic ---
  
    // Prepare an object with the weather details.
    const extractedData = {
      location: weatherData.name,
      temperature: Math.round(weatherData.main.temp),
      feels_like: Math.round(weatherData.main.feels_like),
      min_temp: Math.round(weatherData.main.temp_min),
      max_temp: Math.round(weatherData.main.temp_max),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      wind_speed: Math.round(weatherData.wind.speed),
      wind_direction: weatherData.wind.deg,
      weather_condition: weatherData.weather[0].main,
      weather_description:
        weatherData.weather[0].description.charAt(0).toUpperCase() +
        weatherData.weather[0].description.slice(1),
      visibility: weatherData.visibility,
      cloudiness: weatherData.clouds.all,
      sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
    };
  
    // Simple algorithm for umbrella recommendation.
    let umbrellaRecommendation = "";
    const rainConditionsEN = ["Rain", "Drizzle", "Thunderstorm", "Yağmur", "Çiseleme", "Gök gürültülü fırtına"];
    if (
      rainConditionsEN.includes(extractedData.weather_condition) ||
      extractedData.cloudiness > 80 ||
      extractedData.humidity > 90
    ) {
      umbrellaRecommendation = "Rain is likely, so recommend carrying an umbrella.";
    } else {
      umbrellaRecommendation = "An umbrella is unnecessary as there is no rain forecasted.";
    }
  
    // Build the prompts for the AI call.
    const systemPrompt = `
  You are a professional meteorologist providing accurate weather insights.
  Your goal is to deliver precise, concise, and expert-level weather analyses.
  - Use professional meteorological language while keeping the explanation clear and simple.
  - Give your response in the language ${lang}.
  - Your response should be 20-30 words long.
  Include:
  - A one-sentence summary of the weather conditions.
  - Clothing advice based on: ${clothingSuggestion}
  - A one-sentence statement on umbrella necessity.
    `;
    
    const userPrompt = `
  Weather data for ${extractedData.location}:
  - Temperature: ${extractedData.temperature}°C (Feels like: ${extractedData.feels_like}°C)
  - Min/Max: ${extractedData.min_temp}°C / ${extractedData.max_temp}°C
  - Humidity: ${extractedData.humidity}%
  - Pressure: ${extractedData.pressure} hPa
  - Wind: ${extractedData.wind_speed} m/s at ${extractedData.wind_direction}°
  - Condition: ${extractedData.weather_condition} (${extractedData.weather_description})
  - Visibility: ${extractedData.visibility} meters
  - Cloudiness: ${extractedData.cloudiness}%
  - Sunrise: ${extractedData.sunrise}, Sunset: ${extractedData.sunset}
  
  Suggestions:
  - Clothing: ${clothingSuggestion}
  - Umbrella: ${umbrellaRecommendation}
    `;
  
    // Call the OpenRouter API with a retry mechanism.
    const maxRetries = 5;
    let attempts = 0;
    const ORApiKey = process.env.OR_API_KEY; // Hidden API key from Vercel
  
    while (attempts < maxRetries) {
      try {
        const response = await fetch(`${baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ORApiKey}`,
            "HTTP-Referer": siteURL,
            "X-Title": siteTitle,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: AiModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 1000,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("system prompt:", systemPrompt);
        console.log("user prompt:", userPrompt);
        console.log("Open Router API Full Response:", JSON.stringify(data, null, 2));
  
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
          throw new Error("Invalid API response structure.");
        }
  
        // Return the suggestion as JSON.
        return res.status(200).json({ suggestion: data.choices[0].message.content });
      } catch (error) {
        console.error(`Attempt ${attempts + 1} - Error:`, error);
        attempts++;
        if (attempts >= maxRetries) {
          const fallbackMessage =
            lang === "tr"
              ? "Şu anda yanıt oluşturamıyorum, lütfen bir dakika bekleyin."
              : "Could not generate an AI overview, please wait a minute.";
          return res.status(500).json({ suggestion: fallbackMessage });
        }
      }
    }
  }
  