export default async function handler(req, res) {
  const { city, lang } = req.query; // Extract the lang parameter
  if (!city) {
    return res.status(400).json({ error: "Missing city parameter" });
  }
  // Use the provided lang parameter or default to English if not set
  const language = lang || "en";
  
  const apiKey = process.env.OW_API_KEY;
  // Include lang parameter in the URL
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}&lang=${language}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "City not found" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
