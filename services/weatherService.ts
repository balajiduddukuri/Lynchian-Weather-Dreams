import { WeatherData, Coordinates, CityWeather } from '../types';
import { MAJOR_CITIES } from '../constants';

export const fetchWeatherData = async (coords: Coordinates): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,weather_code,wind_speed_10m`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    
    return {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      conditionCode: data.current.weather_code,
    };
  } catch (error) {
    console.error("Weather fetch error", error);
    throw error;
  }
};

export const fetchGlobalTemperatures = async (): Promise<CityWeather[]> => {
  try {
    const lats = MAJOR_CITIES.map(c => c.lat).join(',');
    const lngs = MAJOR_CITIES.map(c => c.lng).join(',');
    
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m`
    );

    if (!response.ok) return [];

    const data = await response.json();
    
    // Open-Meteo returns array of objects if multiple coords, or single object if one. 
    // But since we always request multiple, it should be an array of result objects 
    // OR a single object with arrays for 'current' values if batched differently?
    // Checking Open-Meteo docs: Multiple coords returns array of JSON objects.
    
    if (Array.isArray(data)) {
      return data.map((d, i) => ({
        name: MAJOR_CITIES[i].name,
        lat: MAJOR_CITIES[i].lat,
        lng: MAJOR_CITIES[i].lng,
        temperature: d.current.temperature_2m
      }));
    }
    
    return [];
  } catch (e) {
    console.warn("Global weather fetch failed", e);
    return [];
  }
};

export const getTerrainDescription = (lat: number, lng: number): string => {
  if (Math.abs(lat) > 60) return "frozen tundra";
  if (Math.abs(lat) < 20 && Math.abs(lng) < 30) return "dense jungle";
  if (Math.abs(lat) > 20 && Math.abs(lat) < 40 && Math.abs(lng) > 100) return "lonely desert highway";
  return "an industrial wasteland";
};