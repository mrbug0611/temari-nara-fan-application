// src/contexts/WeatherContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WeatherContext = createContext(); 

export const useWeather = () => {
    const context = useContext(WeatherContext); 
    if (!context) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
}

export const WeatherProvider = ({ children }) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWeather(); 
    }, [])

const fetchWeather = async () => {
    // get users location 
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await axios.get('/weather', {
                    params: { lat: latitude, lon: longitude }
                });
                setWeather(response.data);
                setError(null);
            } 

            catch (err) {
                console.error('Weather fetch error:', err);
                setError('Failed to fetch weather data');
                setDefaultWeather(); 
            }

            finally {
                setLoading(false);
            }

        }, 
    () => {
        setError('Location access denied');
        setDefaultWeather(); 
        setLoading(false);
    });
    } else {
        setError('Geolocation not supported');
        setDefaultWeather(); 
        setLoading(false);
    }
};  

    const setDefaultWeather = () => {
        setWeather({
            type: 'gentle-breeze', 
            windSpeed: 5, 
            windDirection: 45, 
            temperature: 20, 
            description: 'clear sky',
            location: {name: 'Unknown', city: ''}
        });
    }; 

    const getWindIntensity = () => {
        if (!weather) {
            return 0.5; 
        }

        return Math.min(weather.windSpeed / 20, 1); // normalize to 0-1 
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