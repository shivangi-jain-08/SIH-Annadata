// Weather Service for OpenWeatherMap API Integration
import { WEATHER_API_KEY } from '@env';

const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather Service Class
class WeatherService {
    
    // Get current weather by coordinates
    static async getCurrentWeather(latitude, longitude) {
        try {
            const url = `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
            
            console.log('Fetching weather from:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Weather API request failed');
            }
            
            return this.formatWeatherData(data);
        } catch (error) {
            console.error('Error fetching current weather:', error);
            throw new Error('Failed to fetch weather data. Please check your internet connection.');
        }
    }

    // Get weather forecast (5 days)
    static async getWeatherForecast(latitude, longitude) {
        try {
            const url = `${WEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Weather forecast API request failed');
            }
            
            return this.formatForecastData(data);
        } catch (error) {
            console.error('Error fetching weather forecast:', error);
            throw new Error('Failed to fetch weather forecast. Please check your internet connection.');
        }
    }

    // Format current weather data
    static formatWeatherData(data) {
        const weather = data.weather[0];
        const main = data.main;
        const wind = data.wind;
        
        return {
            // Basic weather info
            temperature: Math.round(main.temp),
            feelsLike: Math.round(main.feels_like),
            condition: weather.main,
            description: weather.description,
            icon: weather.icon,
            
            // Detailed weather data
            humidity: main.humidity,
            pressure: main.pressure,
            windSpeed: wind.speed,
            windDirection: wind.deg,
            visibility: data.visibility / 1000, // Convert to km
            
            // Location info
            city: data.name,
            country: data.sys.country,
            
            // Sun times
            sunrise: new Date(data.sys.sunrise * 1000),
            sunset: new Date(data.sys.sunset * 1000),
            
            // Additional data
            cloudiness: data.clouds.all,
            
            // Calculated fields
            rainProbability: this.calculateRainProbability(weather.main, data.clouds.all, main.humidity),
            weatherCondition: this.mapWeatherCondition(weather.main),
            weatherColor: this.getWeatherColor(weather.main),
            weatherIcon: this.getWeatherIcon(weather.main),
            
            // Raw data for debugging
            raw: data
        };
    }

    // Format forecast data
    static formatForecastData(data) {
        return {
            city: data.city.name,
            country: data.city.country,
            forecast: data.list.slice(0, 8).map(item => ({ // Next 24 hours (8 x 3-hour intervals)
                time: new Date(item.dt * 1000),
                temperature: Math.round(item.main.temp),
                condition: item.weather[0].main,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                humidity: item.main.humidity,
                windSpeed: item.wind.speed,
                rainProbability: this.calculateRainProbability(
                    item.weather[0].main, 
                    item.clouds.all, 
                    item.main.humidity
                )
            }))
        };
    }

    // Calculate rain probability based on weather conditions
    static calculateRainProbability(weatherMain, cloudiness, humidity) {
        let baseProbability = 0;
        
        // Base probability from weather condition
        switch (weatherMain.toLowerCase()) {
            case 'rain':
            case 'drizzle':
                baseProbability = 90;
                break;
            case 'thunderstorm':
                baseProbability = 95;
                break;
            case 'snow':
                baseProbability = 85;
                break;
            case 'mist':
            case 'fog':
                baseProbability = 30;
                break;
            case 'clouds':
                baseProbability = Math.max(20, cloudiness * 0.6);
                break;
            case 'clear':
                baseProbability = 5;
                break;
            default:
                baseProbability = 10;
        }
        
        // Adjust based on humidity
        const humidityFactor = humidity > 70 ? 1.2 : humidity > 50 ? 1.0 : 0.8;
        
        // Adjust based on cloudiness
        const cloudinessFactor = cloudiness > 80 ? 1.3 : cloudiness > 50 ? 1.1 : 0.9;
        
        const finalProbability = Math.min(95, Math.max(0, 
            Math.round(baseProbability * humidityFactor * cloudinessFactor)
        ));
        
        return finalProbability;
    }

    // Map OpenWeatherMap conditions to app conditions
    static mapWeatherCondition(weatherMain) {
        switch (weatherMain.toLowerCase()) {
            case 'clear':
                return 'Sunny';
            case 'clouds':
                return 'Cloudy';
            case 'rain':
            case 'drizzle':
                return 'Rainy';
            case 'thunderstorm':
                return 'Stormy';
            case 'snow':
                return 'Snowy';
            case 'mist':
            case 'fog':
            case 'haze':
                return 'Foggy';
            default:
                return 'Partly Cloudy';
        }
    }

    // Get weather color for UI
    static getWeatherColor(weatherMain) {
        switch (weatherMain.toLowerCase()) {
            case 'clear':
                return '#FFB74D'; // Orange for sunny
            case 'clouds':
                return '#90A4AE'; // Gray for cloudy
            case 'rain':
            case 'drizzle':
                return '#5C6BC0'; // Blue for rainy
            case 'thunderstorm':
                return '#7B1FA2'; // Purple for storms
            case 'snow':
                return '#E1F5FE'; // Light blue for snow
            case 'mist':
            case 'fog':
            case 'haze':
                return '#B0BEC5'; // Light gray for fog
            default:
                return '#42A5F5'; // Default blue
        }
    }

    // Get weather icon name for the app's icon system
    static getWeatherIcon(weatherMain) {
        switch (weatherMain.toLowerCase()) {
            case 'clear':
                return 'Sun';
            case 'clouds':
                return 'Cloud';
            case 'rain':
            case 'drizzle':
                return 'CloudRain';
            case 'thunderstorm':
                return 'Zap';
            case 'snow':
                return 'CloudSnow';
            case 'mist':
            case 'fog':
            case 'haze':
                return 'CloudDrizzle';
            default:
                return 'CloudSun'; // Partly cloudy as default
        }
    }

    // Get user-friendly time format
    static formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Get user-friendly date format
    static formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    }

    // Check if it's currently daytime
    static isDaytime(sunrise, sunset) {
        const now = new Date();
        return now >= sunrise && now <= sunset;
    }

    // Get weather advice for farmers
    static getWeatherAdvice(weatherData) {
        const { condition, temperature, humidity, windSpeed, rainProbability } = weatherData;
        
        let advice = [];
        
        // Temperature advice
        if (temperature > 35) {
            advice.push("🌡️ Very hot weather. Increase irrigation frequency and provide shade to crops.");
        } else if (temperature < 10) {
            advice.push("❄️ Cold weather detected. Protect sensitive crops from frost damage.");
        }
        
        // Rain advice
        if (rainProbability > 70) {
            advice.push("🌧️ High chance of rain. Delay pesticide applications and harvest if crops are ready.");
        } else if (rainProbability < 20 && humidity < 40) {
            advice.push("☀️ Dry conditions expected. Consider increasing irrigation for water-sensitive crops.");
        }
        
        // Wind advice
        if (windSpeed > 10) {
            advice.push("💨 Strong winds forecasted. Secure loose farm equipment and check crop supports.");
        }
        
        // Humidity advice
        if (humidity > 80) {
            advice.push("🫧 High humidity levels. Monitor for fungal diseases and improve ventilation.");
        }
        
        // Condition-specific advice
        switch (condition.toLowerCase()) {
            case 'thunderstorm':
                advice.push("⛈️ Thunderstorm warning. Avoid outdoor activities and secure farm equipment.");
                break;
            case 'clear':
                if (temperature > 25) {
                    advice.push("☀️ Perfect weather for outdoor farm work. Good time for planting or harvesting.");
                }
                break;
        }
        
        return advice.length > 0 ? advice : ["🌱 Weather conditions are favorable for normal farming activities."];
    }
}

export default WeatherService;

// Helper function for easy import
export const getCurrentWeather = WeatherService.getCurrentWeather.bind(WeatherService);
export const getWeatherForecast = WeatherService.getWeatherForecast.bind(WeatherService);
export const getWeatherAdvice = WeatherService.getWeatherAdvice.bind(WeatherService);