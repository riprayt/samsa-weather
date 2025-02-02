# Weather App with an AI Suggestion

## Check It Live

Visit the live demo at: [samsaw.vercel.app](https://samsaw.vercel.app)

## App Features

- **Live Weather Data**:  
  Fetches real-time weather data from the OpenWeatherMap API for any city around the world.

- **AI Suggestion**:  
  Uses Google's "Gemini Flash 1.5" model via the OpenRouter API to provide AI-generated suggestions for clothing and umbrella recommendations based on the weather.

- **Multilanguage Support**:  
  Choose your preferred language using the navbar button (supports at least English and Turkish).

- **Responsive Design**:  
  Built with Bootstrap to ensure a sleek, responsive user interface on both desktop and mobile devices.

## Technologies Used

### Frontend

- **HTML & Bootstrap**:  
  - The project uses HTML and Bootstrap classes for structure and styling.
  - Responsive features (like collapsing navbar and flexible grid layouts) are built with Bootstrap.
  
- **JavaScript**:  
  - Custom scripts (located in `assets/js/script.js` and `assets/js/script_tr.js`) handle weather data display and UI interactions.
  - Modern icons are used to visually represent various weather conditions.

- **Weather Icons**: Weather condition icons are provided by the [weather-icons repository](https://github.com/basmilius/weather-icons).

- **Favicons**:  
  Favicons for the project were generated using [RealFaviconGenerator](https://realfavicongenerator.net/).


### Backend & Serverless Functions

- **Node.js & Vercel Serverless Functions**:  
  - API calls to OpenWeatherMap and OpenRouter are handled by serverless functions (found in the `api/` directory) to securely hide API keys.
  - The frontend fetches weather data from `/api/weather` and AI suggestions from `/api/getWeatherSuggestion` without exposing sensitive credentials.
  
- **Secure API Integration**:  
  - Environment variables (set via Vercel or a local `.env` file) store the API keys, ensuring they remain secret.
  - Custom endpoints in the `api/` folder (e.g., `weather.js`, `geo.js`, `uv.js`, `air-quality.js`, `forecast.js`, and `getWeatherSuggestion.js`) securely proxy requests to external services.

- **AI Overview Generation**:  
  - The `/api/getWeatherSuggestion.js` endpoint first generates clothing and umbrella recommendations through a custom algorithm.
  - These suggestions, along with the weather data, are sent to the AI model with a custom system prompt to generate the final overview.


## Environment Variables

This project uses environment variables to securely manage API keys. Make sure to set the following in your deployment settings (or local `.env` file):

- **OW_API_KEY**: Your OpenWeatherMap API key.
- **OR_API_KEY**: Your OpenRouter API key for AI suggestions.

## License 

This project is licensed under the [GPL-3.0 license](https://github.com/riprayt/samsa-weather?tab=GPL-3.0-1-ov-file#)

## Contact
- **Email**: yusufemirsamsa@gmail.com


