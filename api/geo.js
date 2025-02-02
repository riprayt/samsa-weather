// api/geo.js

export default async function handler(req, res) {
    const { city } = req.query;
    if (!city) {
      res.status(400).json({ error: "Missing city parameter" });
      return;
    }
  
    const apiKey = process.env.OW_API_KEY;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${apiKey}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch geocoding data" });
      }
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  