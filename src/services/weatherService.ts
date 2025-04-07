import axios from 'axios';
import { WeatherData } from '@/types/outfit';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Mock weather data for demonstration
const mockWeatherData: WeatherData[] = [
  {
    date: new Date(),
    temperature: 28,
    description: 'overcast clouds',
    humidity: 65,
    windSpeed: 5,
  },
  {
    date: new Date(Date.now() + 86400000), // Tomorrow
    temperature: 25,
    description: 'light rain',
    humidity: 70,
    windSpeed: 8,
  },
  {
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    temperature: 22,
    description: 'clear sky',
    humidity: 60,
    windSpeed: 4,
  },
];

export async function getWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherData[]> {
  // In a real application, this would call a weather API
  // For now, we'll return mock data
  return mockWeatherData;
}

export async function getCurrentWeather(): Promise<WeatherData> {
  // In a real application, this would call a weather API
  // For now, we'll return today's mock data
  return mockWeatherData[0];
}

export function getOutfitRecommendation(weather: WeatherData): string {
  if (weather.temperature < 10) {
    return 'Wear warm, layered clothing to stay comfortable in cold weather.';
  } else if (weather.temperature < 20) {
    return 'Light, breathable clothing is recommended.';
  } else {
    return 'Light, breathable clothing is recommended.';
  }
} 