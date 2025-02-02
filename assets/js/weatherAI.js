// Export a function that calls the endpoint
export async function getWeatherSuggestion(weatherData) {
    const lang = document.documentElement.lang || "en";
    try {
      const response = await fetch("/api/getWeatherSuggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weatherData, lang }),
      });
  
      if (!response.ok) {
        throw new Error("Server error when fetching suggestion");
      }
  
      const result = await response.json();
      return result.suggestion;
    } catch (error) {
      console.error("Error in getWeatherSuggestion:", error);
      if (lang === "tr") {
        return "Şu anda yanıt oluşturamıyorum, lütfen bir dakika bekleyin.";
      }
      return "Could not generate an AI overview, please wait a minute.";
    }
  }
  