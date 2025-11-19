/**
 * Weather Service
 * Integrates with WeatherAPI.com for weather data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const weatherApiKey = process.env.WEATHER_API_KEY!;

export interface WeatherData {
  location: string;
  currentTemp: number;
  feelsLike: number;
  condition: string;
  conditionCode: string;
  conditionIcon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  forecast: ForecastDay[];
  alerts: WeatherAlert[];
  cachedAt: Date;
  expiresAt: Date;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  conditionIcon: string;
  chanceOfRain: number;
  chanceOfSnow: number;
}

export interface WeatherAlert {
  headline: string;
  severity: string;
  urgency: string;
  event: string;
  effective: string;
  expires: string;
  description: string;
}

/**
 * Fetch weather data from WeatherAPI.com
 */
async function fetchWeatherFromAPI(location: string): Promise<any> {
  if (!weatherApiKey) {
    throw new Error('WEATHER_API_KEY not configured');
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(
    location
  )}&days=7&aqi=no&alerts=yes`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Weather API error: ${response.status} ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Parse WeatherAPI.com response into our format
 */
function parseWeatherData(apiData: any, location: string): Omit<WeatherData, 'cachedAt' | 'expiresAt'> {
  const current = apiData.current;
  const forecast = apiData.forecast?.forecastday || [];
  const alerts = apiData.alerts?.alert || [];

  return {
    location,
    currentTemp: current.temp_f,
    feelsLike: current.feelslike_f,
    condition: current.condition.text,
    conditionCode: current.condition.code.toString(),
    conditionIcon: `https:${current.condition.icon}`,
    humidity: current.humidity,
    windSpeed: current.wind_mph,
    windDirection: current.wind_dir,
    forecast: forecast.slice(0, 7).map((day: any) => ({
      date: day.date,
      maxTemp: day.day.maxtemp_f,
      minTemp: day.day.mintemp_f,
      condition: day.day.condition.text,
      conditionIcon: `https:${day.day.condition.icon}`,
      chanceOfRain: day.day.daily_chance_of_rain,
      chanceOfSnow: day.day.daily_chance_of_snow,
    })),
    alerts: alerts.map((alert: any) => ({
      headline: alert.headline,
      severity: alert.severity,
      urgency: alert.urgency,
      event: alert.event,
      effective: alert.effective,
      expires: alert.expires,
      description: alert.desc,
    })),
  };
}

/**
 * Get weather data for a user (with caching)
 */
export async function getWeatherForUser(userId: string, location?: string): Promise<WeatherData> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check cache first
  const { data: cachedWeather } = await supabase
    .from('weather_cache')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date();

  // Return cached data if it's still valid
  if (cachedWeather && new Date(cachedWeather.expires_at) > now) {
    return {
      location: cachedWeather.location,
      currentTemp: parseFloat(cachedWeather.current_temp),
      feelsLike: parseFloat(cachedWeather.feels_like),
      condition: cachedWeather.condition,
      conditionCode: cachedWeather.condition_code,
      conditionIcon: cachedWeather.condition_icon,
      humidity: cachedWeather.humidity,
      windSpeed: parseFloat(cachedWeather.wind_speed),
      windDirection: cachedWeather.wind_direction,
      forecast: cachedWeather.forecast_data,
      alerts: cachedWeather.alerts,
      cachedAt: new Date(cachedWeather.cached_at),
      expiresAt: new Date(cachedWeather.expires_at),
    };
  }

  // Determine location to use
  let weatherLocation = location;
  if (!weatherLocation) {
    // Use cached location if available, otherwise throw error
    if (cachedWeather?.location) {
      weatherLocation = cachedWeather.location;
    } else {
      throw new Error('No location specified and no cached location available');
    }
  }

  // Fetch fresh data
  console.log(`[Weather] Fetching fresh data for ${weatherLocation}`);
  const apiData = await fetchWeatherFromAPI(weatherLocation);
  const weatherData = parseWeatherData(apiData, weatherLocation);

  const cachedAt = new Date();
  const expiresAt = new Date(cachedAt.getTime() + 60 * 60 * 1000); // 1 hour

  // Update cache
  const cacheData = {
    user_id: userId,
    location: weatherLocation,
    current_temp: weatherData.currentTemp,
    feels_like: weatherData.feelsLike,
    condition: weatherData.condition,
    condition_code: weatherData.conditionCode,
    condition_icon: weatherData.conditionIcon,
    humidity: weatherData.humidity,
    wind_speed: weatherData.windSpeed,
    wind_direction: weatherData.windDirection,
    forecast_data: weatherData.forecast,
    alerts: weatherData.alerts,
    cached_at: cachedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  await supabase.from('weather_cache').upsert(cacheData, {
    onConflict: 'user_id',
  });

  return {
    ...weatherData,
    cachedAt,
    expiresAt,
  };
}

/**
 * Refresh all weather caches (for cron job)
 */
export async function refreshAllWeatherCaches(): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all users with cached weather data
  const { data: caches } = await supabase.from('weather_cache').select('user_id, location');

  if (!caches || caches.length === 0) {
    console.log('[Weather Refresh] No caches to refresh');
    return { success: 0, failed: 0, errors: [] };
  }

  console.log(`[Weather Refresh] Refreshing ${caches.length} weather caches`);

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const cache of caches) {
    try {
      await getWeatherForUser(cache.user_id, cache.location);
      success++;
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`User ${cache.user_id}: ${errorMsg}`);
      console.error(`[Weather Refresh] Error for user ${cache.user_id}:`, error);
    }
  }

  console.log(`[Weather Refresh] Complete: ${success} success, ${failed} failed`);

  return { success, failed, errors };
}
