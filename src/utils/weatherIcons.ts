export function getWeatherIconName(code: number): any {
    // WMO Weather interpretation codes (WW)
    // https://open-meteo.com/en/docs
    switch (true) {
        case code === 0:
            return 'weather-sunny';
        case code === 1:
        case code === 2:
            return 'weather-partly-cloudy';
        case code === 3:
            return 'weather-cloudy';
        case code === 45 || code === 48:
            return 'weather-fog';
        case code >= 51 && code <= 55:
            return 'weather-pouring';
        case code >= 61 && code <= 65:
            return 'weather-rainy';
        case code >= 71 && code <= 77:
            return 'weather-snowy';
        case code >= 80 && code <= 82:
            return 'weather-pouring';
        case code >= 85 && code <= 86:
            return 'weather-snowy';
        case code >= 95 && code <= 99:
            return 'weather-lightning';
        default:
            return 'weather-partly-cloudy';
    }
}

export function getWeatherDescription(code: number): string {
    switch (true) {
        case code === 0:
            return 'Clear sky';
        case code === 1:
            return 'Mainly clear';
        case code === 2:
            return 'Partly cloudy';
        case code === 3:
            return 'Overcast';
        case code === 45 || code === 48:
            return 'Fog';
        case code >= 51 && code <= 55:
            return 'Drizzle';
        case code >= 61 && code <= 65:
            return 'Rain';
        case code >= 71 && code <= 77:
            return 'Snow';
        case code >= 80 && code <= 82:
            return 'Rain Showers';
        case code >= 85 && code <= 86:
            return 'Snow Showers';
        case code >= 95 && code <= 99:
            return 'Thunderstorm';
        default:
            return 'Unknown';
    }
}
