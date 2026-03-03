import axios from 'axios';
import { Location, WeatherData, CurrentWeather, DailyForecast } from '../interfaces/Weather';

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export const WeatherService = {
    async searchLocations(query: string): Promise<Location[]> {
        try {
            const response = await axios.get(GEO_API_URL, {
                params: {
                    name: query,
                    count: 5,
                    language: 'en',
                    format: 'json',
                },
            });

            if (response.data.results && response.data.results.length > 0) {
                return response.data.results.map((r: any) => ({
                    name: r.name,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    country: r.country,
                    admin1: r.admin1,
                }));
            }
            return [];
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
                    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,wind_gusts_10m,wind_direction_10m,uv_index,visibility,surface_pressure,cloud_cover,precipitation',
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset',
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
                feelsLike: data.current.apparent_temperature,
                windGusts: data.current.wind_gusts_10m,
                windDirection: data.current.wind_direction_10m,
                uvIndex: data.current.uv_index,
                visibility: data.current.visibility,
                pressure: data.current.surface_pressure,
                cloudCover: data.current.cloud_cover,
                precipitation: data.current.precipitation,
            };

            const daily: DailyForecast[] = data.daily.time.map((time: string, index: number) => ({
                time,
                maxTemp: data.daily.temperature_2m_max[index],
                minTemp: data.daily.temperature_2m_min[index],
                weatherCode: data.daily.weather_code[index],
                precipitationSum: data.daily.precipitation_sum[index],
                precipitationProbability: data.daily.precipitation_probability_max[index],
                windSpeedMax: data.daily.wind_speed_10m_max[index],
                windGustsMax: data.daily.wind_gusts_10m_max[index],
                windDirection: data.daily.wind_direction_10m_dominant[index],
                uvIndexMax: data.daily.uv_index_max[index],
                sunrise: data.daily.sunrise[index],
                sunset: data.daily.sunset[index],
            })).slice(0, 7); // 7-day forecast

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
        const locations = await this.searchLocations(query);
        if (locations.length === 0) {
            throw new Error('Location not found');
        }
        const location = locations[0];
        return this.getWeather(location.latitude, location.longitude, location);
    }
};
