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
    feelsLike: number;
    windGusts: number;
    windDirection: number;
    uvIndex: number;
    visibility: number;
    pressure: number;
    cloudCover: number;
    precipitation: number;
}

export interface DailyForecast {
    time: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    precipitationSum: number;
    precipitationProbability: number;
    windSpeedMax: number;
    windGustsMax: number;
    windDirection: number;
    uvIndexMax: number;
    sunrise: string;
    sunset: string;
}

export interface WeatherData {
    location: Location;
    current: CurrentWeather;
    daily: DailyForecast[];
}
