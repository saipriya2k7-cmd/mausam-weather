import { CityProfile, WeatherData, HourlyData, DailyData } from '../types/weather';
import { generateWeatherData } from '../utils/weatherGenerator';

// WMO Weather Interpretation Codes (WW) mapping
function interpretWmoCode(code: number): {
  condition: string;
  conditionCode: WeatherData['current']['conditionCode'];
} {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', conditionCode: 'sunny' };
    case 1:
      return { condition: 'Mainly Clear', conditionCode: 'sunny' };
    case 2:
      return { condition: 'Partly Cloudy', conditionCode: 'partly_cloudy' };
    case 3:
      return { condition: 'Overcast', conditionCode: 'cloudy' };
    case 45:
    case 48:
      return { condition: 'Fog & Mist', conditionCode: 'fog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', conditionCode: 'rain' };
    case 61:
    case 63:
      return { condition: 'Showers of Rain', conditionCode: 'rain' };
    case 65:
      return { condition: 'Heavy Rainfall', conditionCode: 'heavy_rain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snow Showers', conditionCode: 'rain' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', conditionCode: 'rain' };
    case 95:
      return { condition: 'Thunderstorm', conditionCode: 'thunderstorm' };
    case 96:
    case 99:
      return { condition: 'Severe Thunderstorm with Hail', conditionCode: 'thunderstorm' };
    default:
      return { condition: 'Partly Cloudy', conditionCode: 'partly_cloudy' };
  }
}

function degreesToCardinal(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
}

function formatIsoTimeTo12Hour(isoString: string): string {
  try {
    const date = new Date(isoString);
    let hours = date.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:00 ${period}`;
  } catch {
    return '12:00 PM';
  }
}

function formatSunTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  } catch {
    return '06:00 AM';
  }
}

// In-memory cache to ensure speed and prevent excessive requests
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchLiveWeather(
  city: CityProfile,
  locationSource: 'gps' | 'ip' | 'manual' | 'preset' = 'preset'
): Promise<WeatherData> {
  const cacheKey = `${city.id}-${city.lat.toFixed(2)}-${city.lon.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Base fallback dataset to merge and guarantee 100% field presence
  const fallback = generateWeatherData(city, locationSource);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    // 1. Fetch real meteorological weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`;

    // 2. Fetch air quality from Open-Meteo Air Quality API
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,us_aqi`;

    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(aqiUrl, { signal: controller.signal }),
    ]);

    clearTimeout(timeoutId);

    if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
      return fallback;
    }

    const weatherJson = await weatherRes.value.json();
    const currentMeteo = weatherJson.current;
    const dailyMeteo = weatherJson.daily;
    const hourlyMeteo = weatherJson.hourly;

    if (!currentMeteo) return fallback;

    // Parse AQI if available
    let aqi = fallback.current.aqi;
    let pm25 = fallback.current.pm25;
    let pm10 = fallback.current.pm10;
    let o3 = fallback.current.o3;
    let no2 = fallback.current.no2;

    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      try {
        const aqiJson = await aqiRes.value.json();
        if (aqiJson.current) {
          if (aqiJson.current.us_aqi) aqi = Math.round(aqiJson.current.us_aqi);
          if (aqiJson.current.pm2_5) pm25 = Math.round(aqiJson.current.pm2_5);
          if (aqiJson.current.pm10) pm10 = Math.round(aqiJson.current.pm10);
          if (aqiJson.current.ozone) o3 = Math.round(aqiJson.current.ozone);
          if (aqiJson.current.nitrogen_dioxide) no2 = Math.round(aqiJson.current.nitrogen_dioxide);
        }
      } catch {
        // use fallback AQI
      }
    }

    // Determine status
    let aqiStatus: WeatherData['current']['aqiStatus'] = 'Moderate';
    if (aqi <= 50) aqiStatus = 'Good';
    else if (aqi <= 100) aqiStatus = 'Satisfactory';
    else if (aqi <= 200) aqiStatus = 'Moderate';
    else if (aqi <= 300) aqiStatus = 'Poor';
    else if (aqi <= 400) aqiStatus = 'Very Poor';
    else aqiStatus = 'Severe';

    const isDay = currentMeteo.is_day !== undefined
      ? currentMeteo.is_day === 1
      : (new Date().getHours() >= 6 && new Date().getHours() < 19);

    let { condition, conditionCode } = interpretWmoCode(currentMeteo.weather_code);
    if (!isDay && (conditionCode === 'sunny' || condition === 'Clear Sky')) {
      condition = 'Clear Night';
    } else if (!isDay && condition === 'Mainly Clear') {
      condition = 'Mainly Clear Night';
    }

    const temp = Math.round(currentMeteo.temperature_2m);
    const feelsLike = Math.round(currentMeteo.apparent_temperature ?? temp);
    const humidity = Math.round(currentMeteo.relative_humidity_2m ?? 55);
    const windSpeed = Math.round(currentMeteo.wind_speed_10m ?? 8);
    const windGust = Math.round(currentMeteo.wind_gusts_10m ?? windSpeed + 5);
    const windDirectionDeg = Math.round(currentMeteo.wind_direction_10m ?? 180);
    const windDirectionText = degreesToCardinal(windDirectionDeg);
    const pressureHpa = Math.round(currentMeteo.surface_pressure ?? 1012);
    const rainfallPast24hMm = Number((dailyMeteo?.precipitation_sum?.[0] ?? currentMeteo.precipitation ?? 0).toFixed(1));
    const rainfallRateMmHr = Number((currentMeteo.rain ?? currentMeteo.precipitation ?? 0).toFixed(1));
    const uvIndex = Math.round(dailyMeteo?.uv_index_max?.[0] ?? fallback.current.uvIndex);

    const sunrise = dailyMeteo?.sunrise?.[0] ? formatSunTime(dailyMeteo.sunrise[0]) : fallback.current.sunrise;
    const sunset = dailyMeteo?.sunset?.[0] ? formatSunTime(dailyMeteo.sunset[0]) : fallback.current.sunset;

    // Build real 12-Hour Forecast starting from current hour
    const hourlyTimes: string[] = hourlyMeteo?.time || [];
    const hourlyTemps: number[] = hourlyMeteo?.temperature_2m || [];
    const hourlyPops: number[] = hourlyMeteo?.precipitation_probability || [];
    const hourlyWinds: number[] = hourlyMeteo?.wind_speed_10m || [];
    const hourlyCodes: number[] = hourlyMeteo?.weather_code || [];

    // Find index of current hour based on local time from Open-Meteo
    const currentTimeStr = currentMeteo.time || '';
    const currentPrefix = currentTimeStr ? currentTimeStr.slice(0, 13) : '';
    let startIdx = -1;
    if (currentPrefix) {
      startIdx = hourlyTimes.findIndex((t) => t.startsWith(currentPrefix));
    }
    if (startIdx === -1 && currentTimeStr) {
      startIdx = hourlyTimes.findIndex((t) => t >= currentTimeStr);
    }
    if (startIdx === -1) {
      const nowH = new Date().getHours();
      startIdx = hourlyTimes.findIndex((t) => {
        const h = parseInt(t.slice(11, 13), 10);
        return h === nowH;
      });
      if (startIdx === -1) startIdx = 0;
    }

    const currentObsHour = hourlyTimes[startIdx]
      ? parseInt(hourlyTimes[startIdx].slice(11, 13), 10)
      : new Date().getHours();

    const hourly: HourlyData[] = [];
    for (let i = 0; i < 12; i++) {
      const idx = (startIdx + i) % (hourlyTimes.length || 24);
      const hIso = hourlyTimes[idx];
      const hTemp = Math.round(hourlyTemps[idx] ?? temp);
      const hPop = Math.round(hourlyPops[idx] ?? (conditionCode === 'rain' ? 60 : 10));
      const hWind = Math.round(hourlyWinds[idx] ?? windSpeed);
      const hCode = hourlyCodes[idx] ?? currentMeteo.weather_code;
      const { condition: hCondition, conditionCode: hCondCode } = interpretWmoCode(hCode);

      // Extract accurate local hour number from the ISO timestamp
      const hourNum = hIso ? parseInt(hIso.slice(11, 13), 10) : (currentObsHour + i) % 24;
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const h12 = hourNum % 12 || 12;
      const timeStr = `${h12} ${period}`;

      // Running & sports score based on temperature, rain, wind
      const heatPenalty = Math.max(0, (hTemp - 24) * 3);
      const rainPenalty = hPop > 40 ? 30 : 0;
      const windPenalty = hWind > 20 ? 15 : 0;
      const runningScore = Math.max(30, Math.min(100, Math.round(95 - heatPenalty - rainPenalty - windPenalty)));
      const kidsPlayScore = Math.max(25, Math.min(100, Math.round(90 - heatPenalty * 1.2 - rainPenalty)));

      hourly.push({
        time: timeStr,
        hour: hourNum,
        temp: hTemp,
        feelsLike: Math.round(hTemp + (humidity > 70 ? 2 : 0)),
        condition: hCondition,
        conditionCode: hCondCode,
        pop: hPop,
        rainMm: hPop > 30 ? 1.2 : 0,
        windSpeed: hWind,
        windGust: Math.round(hWind * 1.3),
        windDirection: degreesToCardinal(windDirectionDeg),
        humidity: Math.round(hourlyMeteo?.relative_humidity_2m?.[idx] ?? humidity),
        uvIndex: hourNum >= 10 && hourNum <= 16 ? Math.min(10, uvIndex) : 1,
        aqi: Math.round(aqi + (hourNum >= 12 && hourNum <= 16 ? -15 : 10)),
        visibility: 4000,
        runningScore,
        kidsPlayScore,
      });
    }

    // Build real 7-Day Daily Forecast
    const daily: DailyData[] = [];
    const dailyTimes: string[] = dailyMeteo?.time || [];
    const dailyMaxTemps: number[] = dailyMeteo?.temperature_2m_max || [];
    const dailyMinTemps: number[] = dailyMeteo?.temperature_2m_min || [];
    const dailyCodes: number[] = dailyMeteo?.weather_code || [];
    const dailyPrecip: number[] = dailyMeteo?.precipitation_sum || [];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < Math.min(7, dailyTimes.length || 7); i++) {
      const dDate = dailyTimes[i] ? new Date(dailyTimes[i]) : new Date(Date.now() + i * 86400000);
      const dayName = i === 0 ? 'Today' : dayNames[dDate.getDay()];
      const dCode = dailyCodes[i] ?? currentMeteo.weather_code;
      const { condition: dCondition, conditionCode: dCondCode } = interpretWmoCode(dCode);
      const maxTemp = Math.round(dailyMaxTemps[i] ?? temp + 3);
      const minTemp = Math.round(dailyMinTemps[i] ?? temp - 4);
      const expectedRainMm = Number((dailyPrecip[i] ?? (dCondCode === 'rain' ? 8 : 0)).toFixed(1));

      daily.push({
        date: dailyTimes[i] || dDate.toISOString().slice(0, 10),
        dayName,
        maxTemp,
        minTemp,
        condition: dCondition,
        conditionCode: dCondCode,
        pop: expectedRainMm > 0 ? Math.min(95, Math.round(expectedRainMm * 10)) : 10,
        expectedRainMm,
        maxUv: uvIndex,
        avgAqi: aqi,
        windMax: windSpeed + 4,
        humidity,
        summary: `${dCondition} with high of ${maxTemp}°C and low of ${minTemp}°C.`,
      });
    }

    const liveResult: WeatherData = {
      ...fallback,
      current: {
        ...fallback.current,
        temp,
        feelsLike,
        condition,
        conditionCode,
        humidity,
        windSpeed,
        windGust,
        windDirectionDeg,
        windDirectionText,
        pressureHpa,
        uvIndex,
        aqi,
        aqiStatus,
        pm25,
        pm10,
        no2,
        o3,
        sunrise,
        sunset,
        rainfallPast24hMm,
        rainfallRateMmHr,
        isDay,
        lastUpdatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      hourly: hourly.length > 0 ? hourly : fallback.hourly,
      daily: daily.length > 0 ? daily : fallback.daily,
    };

    weatherCache.set(cacheKey, { data: liveResult, timestamp: Date.now() });
    return liveResult;
  } catch {
    return fallback;
  }
}
