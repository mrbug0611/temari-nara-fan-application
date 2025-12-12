import React, { useState } from 'react';
import WindBackground from '../components/effects/WindBackground';
import { WeatherProvider, useWeather } from '../contexts/WeatherContext';
import { Wind } from 'lucide-react';

function WindBackgroundContent() {
  const weatherContext = useWeather();
  
  console.log('🔍 useWeather returned:', weatherContext);
  
  if (!weatherContext) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">❌ Context Error</h1>
          <p>WeatherContext is undefined!</p>
          <p className="text-sm mt-4">Check console for details</p>
        </div>
      </div>
    );
  }

  const { weather, loading, getWindIntensity, getWindEffect } = weatherContext;
  
  console.log('Weather data:', { weather, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Wind className="w-16 h-16 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-emerald-300 text-xl">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <WindBackground />
      
      <div className="relative z-10 p-8">
        <h1 className="text-5xl font-bold text-emerald-300 mb-8 text-center">
          Wind Background Test
        </h1>
        
        {weather ? (
          <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg p-6">
            <p className="text-emerald-300 mb-2">
              Wind Speed: {weather.windSpeed?.toFixed(1) ?? 'N/A'} m/s
            </p>
            <p className="text-cyan-300 mb-2">
              Direction: {weather.windDirection ?? 'N/A'}°
            </p>
            <p className="text-yellow-300">
              Intensity: {(getWindIntensity() * 100).toFixed(0)}%
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-300">No weather data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TestWindBackground() {
  console.log('🚀 TestWindBackground rendering');
  
  return (
    <WeatherProvider>
      <WindBackgroundContent />
    </WeatherProvider>
  );
}

export default TestWindBackground;