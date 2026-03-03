export interface Location {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string; // state/region
}

export interface CurrentWeather {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    time: string;
}

export interface DailyForecast {
    time: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
}

export interface WeatherData {
    location: Location;
    current: CurrentWeather;
    daily: DailyForecast[];
}
