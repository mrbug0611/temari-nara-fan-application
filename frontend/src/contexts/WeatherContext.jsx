// src/contexts/WeatherContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WeatherContext = createContext();

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return context;
};

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // FIX: Add /api prefix to the URL
              const response = await axios.get('/weather', {
                params: { lat: latitude, lon: longitude }
              });
              
              //  FIX: Validate that response is actually weather data
              if (response.data && typeof response.data === 'object' && response.data.windSpeed !== undefined) {
                setWeather(response.data);
                setError(null);
              } else {
                setDefaultWeather();
              }
            } catch (err) {
              setError(err); 
              setDefaultWeather();
            } finally {
              setLoading(false);
            }
          },
          (err) => {
            setDefaultWeather();
            setLoading(false);
          }
        );
      } else {
        setDefaultWeather();
        setLoading(false);
      }
    } catch (err) {
      setError(err); 
      setDefaultWeather();
      setLoading(false);
    }
  };

  const setDefaultWeather = () => {
    const defaultData = {
      type: 'gentle-breeze',
      windSpeed: 5,
      windDirection: 45,
      temperature: 20,
      description: 'clear sky',
      location: { name: 'Unknown', country: '' }
    };
    setWeather(defaultData);
    setLoading(false);
  };

  const getWindIntensity = () => {
    if (!weather) {
      return 0.5;
    }
    return Math.min(weather.windSpeed / 20, 1);
  };

  const getWindEffect = () => {
    if (!weather) {
      return 'calm';
    }
    return weather.type;
  };

  const value = {
    weather,
    loading,
    error,
    fetchWeather,
    getWindIntensity,
    getWindEffect
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};