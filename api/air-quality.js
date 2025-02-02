export default async function handler(req, res) {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ error: "Missing latitude or longitude" });
      return;
    }
  
    const apiKey = process.env.OW_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch air quality data" });
      }
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
