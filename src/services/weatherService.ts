import axios from 'axios';
import { Location, WeatherData, CurrentWeather, DailyForecast } from '../interfaces/Weather';

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export const WeatherService = {
    async searchLocation(query: string): Promise<Location | null> {
        try {
            const response = await axios.get(GEO_API_URL, {
                params: {
                    name: query,
                    count: 1,
                    language: 'en',
                    format: 'json',
                },
            });

            if (response.data.results && response.data.results.length > 0) {
                const result = response.data.results[0];
                return {
                    name: result.name,
                    latitude: result.latitude,
                    longitude: result.longitude,
                    country: result.country,
                    admin1: result.admin1,
                };
            }
            return null;
        } catch (error) {
            console.error('Error searching location:', error);
            throw new Error('Failed to find location. Please try again.');
        }
    },

    async getWeather(lat: number, lon: number, location: Location): Promise<WeatherData> {
        try {
            const response = await axios.get(WEATHER_API_URL, {
                params: {
                    latitude: lat,
                    longitude: lon,
                    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                    timezone: 'auto',
                },
            });

            const data = response.data;

            const current: CurrentWeather = {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                windSpeed: data.current.wind_speed_10m,
                weatherCode: data.current.weather_code,
                time: data.current.time,
            };

            const daily: DailyForecast[] = data.daily.time.map((time: string, index: number) => ({
                time: time,
                maxTemp: data.daily.temperature_2m_max[index],
                minTemp: data.daily.temperature_2m_min[index],
                weatherCode: data.daily.weather_code[index],
            })).slice(0, 5); // 5-day forecast

            return {
                location,
                current,
                daily,
            };
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw new Error('Failed to fetch weather data.');
        }
    },

    async getWeatherByQuery(query: string): Promise<WeatherData> {
        const location = await this.searchLocation(query);
        if (!location) {
            throw new Error('Location not found');
        }
        return this.getWeather(location.latitude, location.longitude, location);
    }
};
