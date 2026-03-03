import { useState } from 'react';
import * as Location from 'expo-location';
import { WeatherService } from '../services/weatherService';
import { WeatherData } from '../interfaces/Weather';

export function useWeather() {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [locationOptions, setLocationOptions] = useState<import('../interfaces/Weather').Location[] | null>(null);

const fetchWeatherByQuery = async (query: string) => {
        setLoading(true);
        setError(null);
        setLocationOptions(null);
        try {
            const locations = await WeatherService.searchLocations(query);
            if (locations.length === 0) {
                setError('Location not found.');
                return;
            }
            if (locations.length > 1) {
                setLocationOptions(locations);
                setLoading(false);
                return;
            }
            const result = await WeatherService.getWeather(locations[0].latitude, locations[0].longitude, locations[0]);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch weather data.');
        } finally {
            setLoading(false);
        }
    };

    const selectLocation = async (location: import('../interfaces/Weather').Location) => {
        setLocationOptions(null);
        setLoading(true);
        setError(null);
        try {
            const result = await WeatherService.getWeather(location.latitude, location.longitude, location);
            setData(result);
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
        } catch (err: any) {
            setError(err.message || 'Failed to fetch current location weather.');
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        locationOptions,
        fetchWeatherByQuery,
        selectLocation,
        fetchWeatherByCurrentLocation,
    };
}
