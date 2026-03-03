import { useState } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';
import { WeatherService } from '../services/weatherService';
import { WeatherData } from '../interfaces/Weather';

export function useWeather() {
    const [data, setData] = useState<WeatherData | null>(null);
    const [locationInfo, setLocationInfo] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWikiInfo = async (locationName: string) => {
        try {
            const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(locationName)}`);
            if (response.data && response.data.extract) {
                setLocationInfo(response.data.extract);
            } else {
                setLocationInfo(null);
            }
        } catch (e) {
            setLocationInfo(null); // Just ignore if Wikipedia doesn't have it
        }
    };

    const fetchWeatherByQuery = async (query: string) => {
        setLoading(true);
        setError(null);
        setLocationInfo(null);
        try {
            const result = await WeatherService.getWeatherByQuery(query);
            setData(result);
            fetchWikiInfo(result.location.name);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch weather data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchWeatherByCurrentLocation = async () => {
        setLoading(true);
        setError(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied');
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // We need to reverse geocode or at least get weather by lat/lon
            // We can use Expo Location reverseGeocodeAsync for a nice name
            let reverseGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
            let locationName = 'Unknown Location';
            let admin1 = undefined;
            let country = undefined;

            if (reverseGeo && reverseGeo.length > 0) {
                locationName = reverseGeo[0].city || reverseGeo[0].region || 'Current Location';
                admin1 = reverseGeo[0].region || undefined;
                country = reverseGeo[0].country || undefined;
            }

            const result = await WeatherService.getWeather(latitude, longitude, {
                name: locationName,
                latitude,
                longitude,
                country,
                admin1,
            });

            setData(result);
            fetchWikiInfo(locationName);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch current location weather.');
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        locationInfo,
        loading,
        error,
        fetchWeatherByQuery,
        fetchWeatherByCurrentLocation,
    };
}
