export interface WeatherApiResponse {
    location: {
        [key1: string]: any;
    },
    forecast: {
        forecastday: Array<any>;
    }
}