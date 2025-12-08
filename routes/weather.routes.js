// routes/weather.routes.js - Weather Routes    
const { count, time } = require('console');
const express = require('express');
const router = express.Router(); // HTTP Client Library
const axios = require('axios');

// get weather data for dynamic backgrounds 
router.get('/', async (req, res) => {
  try {
    // Accept inputs from query OR body (query wins if present)
    const source = Object.keys(req.query).length ? req.query : req.body;
    const { lat, lon, city } = source;



    // Normalize empty-string / null -> undefined
    const latVal = (lat === '' || lat === null) ? undefined : lat;
    const lonVal = (lon === '' || lon === null) ? undefined : lon;
    const cityVal = (typeof city === 'string' && city.trim().length > 0) ? city.trim() : undefined;

    // Coerce to numbers when provided
    const latNum = (latVal !== undefined) ? Number(latVal) : undefined;
    const lonNum = (lonVal !== undefined) ? Number(lonVal) : undefined;

    // Determine presence: both lat & lon must be valid numbers
    const hasCoords = Number.isFinite(latNum) && Number.isFinite(lonNum);
    const hasCity = typeof cityVal === 'string' && cityVal.length > 0;


    if (!hasCoords && !hasCity) {
      return res.status(400).json({
        error: 'Please provide either both latitude and longitude, or a city name.'
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenWeather API key is not configured' });
    }

    // Prefer coords when both present (change if you want the opposite)
    let url;
    if (hasCoords) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lonNum}&appid=${apiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityVal)}&appid=${apiKey}&units=metric`;
    }

    const response = await axios.get(url);
    const data = response.data;

    // transform weather data for frontend wind effects 
    const weatherEffcts = {
      type: mapWeatherToEffect(data.weather[0].main, data.wind.speed),
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: {
        name: data.name,
        country: data.sys.country
      },
      timestamp: new Date().toISOString()
    };

    return res.json(weatherEffcts);

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data.message || 'Weather API error' });
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
});


// get forecast for extended weather effects
router.get('/forecast', async (req, res) => {
    try {
       
    // Accept inputs from query OR body (query wins if present)
    const source = Object.keys(req.query).length ? req.query : req.body;
    const { lat, lon, city } = source;



    // Normalize empty-string / null -> undefined
    const latVal = (lat === '' || lat === null) ? undefined : lat;
    const lonVal = (lon === '' || lon === null) ? undefined : lon;
    const cityVal = (typeof city === 'string' && city.trim().length > 0) ? city.trim() : undefined;

    // Coerce to numbers when provided
    const latNum = (latVal !== undefined) ? Number(latVal) : undefined;
    const lonNum = (lonVal !== undefined) ? Number(lonVal) : undefined;

    // Determine presence: both lat & lon must be valid numbers
    const hasCoords = Number.isFinite(latNum) && Number.isFinite(lonNum);
    const hasCity = typeof cityVal === 'string' && cityVal.length > 0;


    if (!hasCoords && !hasCity) {
      return res.status(400).json({
        error: 'Please provide either both latitude and longitude, or a city name NOT BOTH.'
      });
    }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'OpenWeather API key is not configured' });
        }

        let url;

        if (city) {
            url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        } 
        
        else {
            url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        }


        const response = await axios.get(url);
        const data = response.data;


        // get next 24 hours of forecast  
        const forecastEffects = data.list.slice(0, 8).map(item => ({
            timestamp: item.dt_txt,
            type: mapWeatherToEffect(item.weather[0].main, item.wind.speed),
            windSpeed: item.wind.speed,
            windDirection: item.wind.deg,
            temperature: item.main.temp,
            description: item.weather[0].description,
        }));


        res.json({
            location: {
                name: data.city.name,
                country: data.city.country  
            },
            forecastEffects
        });
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data.message || 'Weather API error' });
        }
        else {
            return res.status(500).json({ error: error.message });
        }
    }
});


// helper function to map weather conditions to effects
function mapWeatherToEffect(condition, windSpeed) {
    // categorize wind speed 
    const windCategory = windSpeed > 10 ? 'strong' : windSpeed > 5 ? 'moderate' : 'calm';

    switch (condition.toLowerCase()) {
        case 'clear':
             return windCategory === 'strong' ? 'strong-breeze' : 
             windCategory === 'moderate' ? 'gentle-breeze' : 'calm';
        
        case 'clouds':
            return windCategory === 'strong' ? 'windy-clouds' : 'cloudy';
    
        case 'rain':
        case 'drizzle':
            return windCategory === 'strong' ? 'storm' : 'rain';
        
        case 'thunderstorm':
            return 'storm';
        
        case 'snow':
            return windCategory === 'strong' ? 'blizzard' : 'snow';
        
        case 'mist':
        case 'fog':
        case 'haze':
            return 'misty';
        
        case 'dust':
        case 'sand':
            return 'sandstorm'; 
        
        default:
            return 'calm';
    }
}
module.exports = router;