import { CITIES } from '../data/cities';
import { CityProfile, DailyData, HourlyData, WeatherAlert, WeatherData } from '../types/weather';

export function generateWeatherData(
  cityOrProfile: string | CityProfile = 'delhi',
  locationSource: 'gps' | 'ip' | 'manual' | 'preset' = 'preset'
): WeatherData {
  let city: CityProfile = CITIES[0];
  if (typeof cityOrProfile === 'string') {
    city = CITIES.find((c) => c.id === cityOrProfile) || CITIES[0];
  } else if (cityOrProfile && typeof cityOrProfile === 'object') {
    city = {
      ...CITIES[0],
      ...cityOrProfile,
      baseTemp: typeof cityOrProfile.baseTemp === 'number' ? cityOrProfile.baseTemp : (CITIES[0].baseTemp ?? 28),
      baseHumidity: typeof cityOrProfile.baseHumidity === 'number' ? cityOrProfile.baseHumidity : (CITIES[0].baseHumidity ?? 55),
      baseAqi: typeof cityOrProfile.baseAqi === 'number' ? cityOrProfile.baseAqi : (CITIES[0].baseAqi ?? 120),
      typicalCondition: cityOrProfile.typicalCondition || CITIES[0].typicalCondition || 'partly_cloudy',
    };
  }

  const now = new Date();
  const currentHour = now.getHours();

  // Baseline variations by city
  const temp = city.baseTemp ?? 28;
  const humidity = city.baseHumidity ?? 55;
  const aqi = city.baseAqi ?? 120;

  // Derive AQI Status
  let aqiStatus: WeatherData['current']['aqiStatus'] = 'Moderate';
  if (aqi <= 50) aqiStatus = 'Good';
  else if (aqi <= 100) aqiStatus = 'Satisfactory';
  else if (aqi <= 200) aqiStatus = 'Moderate';
  else if (aqi <= 300) aqiStatus = 'Poor';
  else if (aqi <= 400) aqiStatus = 'Very Poor';
  else aqiStatus = 'Severe';

  // Sub-pollutants according to Indian NAQI standard
  const pm25 = Math.round(aqi * 0.42);
  const pm10 = Math.round(aqi * 0.78);
  const no2 = Math.round(18 + (aqi / 10));
  const o3 = Math.round(25 + (temp * 0.8));
  const co = Number((0.6 + (aqi * 0.005)).toFixed(1));

  // Determine condition
  let conditionCode = city.typicalCondition;
  let condition = 'Partly Cloudy';
  if (city.id === 'mumbai') {
    conditionCode = 'rain';
    condition = 'Moderate Monsoon Showers';
  } else if (city.id === 'delhi') {
    conditionCode = aqi > 200 ? 'dust' : 'partly_cloudy';
    condition = aqi > 200 ? 'Hazy & Warm Sun' : 'Scattered Clouds';
  } else if (city.id === 'bengaluru') {
    conditionCode = 'partly_cloudy';
    condition = 'Pleasant Breeze with Mild Clouds';
  } else if (city.id === 'shimla') {
    conditionCode = 'partly_cloudy';
    condition = 'Crisp Mountain Breeze';
  } else if (city.id === 'goa') {
    conditionCode = 'sunny';
    condition = 'Bright Coastal Sunshine';
  } else if (city.id === 'ludhiana') {
    conditionCode = 'sunny';
    condition = 'Clear Sky & Agricultural Haze';
  }

  // Rainfall parameters
  const isRaining = conditionCode === 'rain' || conditionCode === 'heavy_rain' || conditionCode === 'thunderstorm';
  const rainfallPast24hMm = city.id === 'mumbai' ? 42.4 : city.id === 'chennai' ? 18.2 : city.id === 'kolkata' ? 12.0 : 0.0;
  const rainfallRateMmHr = isRaining ? (city.id === 'mumbai' ? 6.8 : 2.5) : 0;

  // Visibility
  let visibilityMeters = 6000;
  if (conditionCode === 'fog') visibilityMeters = 400;
  else if (conditionCode === 'dust' || aqi > 250) visibilityMeters = 2200;
  else if (isRaining) visibilityMeters = 3500;
  else if (city.id === 'shimla' || city.id === 'goa') visibilityMeters = 9500;

  // Wind speed & gusts
  const windSpeed = city.isCoastal ? 24 : city.id === 'shimla' ? 12 : 14;
  const windGust = Math.round(windSpeed * 1.5);
  const windDir = city.isCoastal ? 'WSW' : city.region === 'North' ? 'NW' : 'SE';

  // UV index
  const uvIndex = currentHour >= 11 && currentHour <= 15 ? (city.isCoastal ? 9 : 7) : currentHour >= 9 && currentHour <= 17 ? 4 : 0;

  // Feels-like calculation using simple heat index formula
  const feelsLike = Math.round(temp + (humidity > 70 ? 3.5 : 1.0));

  // Generate 12 Hourly entries in 12-hour AM/PM format
  const hourly: HourlyData[] = [];
  for (let i = 0; i < 12; i++) {
    const h = (currentHour + i) % 24;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const timeStr = `${hour12} ${period}`;

    // Diurnal temperature cycle
    const hourDelta = Math.sin(((h - 9) / 24) * 2 * Math.PI) * 4;
    const hourTemp = Math.round(temp + hourDelta);
    const hourFeels = Math.round(hourTemp + (humidity > 70 ? 3 : 1));

    // Diurnal humidity cycle (inversely proportional to temp)
    const hourHumidity = Math.max(35, Math.min(95, Math.round(humidity - (hourDelta * 2.5))));

    // Rain probability
    let pop = 10;
    if (city.id === 'mumbai') pop = (h >= 14 && h <= 20) ? 75 : 45;
    else if (city.id === 'bengaluru') pop = (h >= 16 && h <= 19) ? 40 : 15;
    else if (city.id === 'chennai') pop = 30;

    // UV index by hour
    let hourUv = 0;
    if (h >= 8 && h <= 17) {
      hourUv = Math.max(0, Math.round(Math.sin(((h - 6) / 12) * Math.PI) * (city.isCoastal ? 9.5 : 7.5)));
    }

    // Hourly AQI (often worse in early morning 5-8 AM due to inversion)
    let hourAqi = aqi;
    if (h >= 5 && h <= 9) hourAqi = Math.round(aqi * 1.25);
    else if (h >= 13 && h <= 17) hourAqi = Math.round(aqi * 0.85);

    // Running suitability score (0 - 100)
    // Optimal: temp 16-24C, humidity < 75%, AQI < 100, no heavy rain, daylight or dawn/dusk
    let runningScore = 80;
    if (hourTemp > 30) runningScore -= (hourTemp - 30) * 6;
    if (hourTemp < 12) runningScore -= (12 - hourTemp) * 3;
    if (hourHumidity > 80) runningScore -= 15;
    if (hourAqi > 150) runningScore -= (hourAqi - 150) * 0.35;
    if (pop > 60) runningScore -= 30;
    if (h >= 11 && h <= 15 && hourUv > 6) runningScore -= 20; // Midday solar stress
    runningScore = Math.max(10, Math.min(98, Math.round(runningScore)));

    // Kids outdoor play score
    let kidsScore = 85;
    if (hourUv > 7) kidsScore -= 35;
    if (hourTemp > 33) kidsScore -= 25;
    if (pop > 50) kidsScore -= 40;
    if (hourAqi > 180) kidsScore -= 30;
    kidsScore = Math.max(10, Math.min(99, Math.round(kidsScore)));

    // Outdoor event score (tents, stages, weddings)
    let eventScore = 88;
    if (pop > 40) eventScore -= pop * 0.7;
    const hourWind = Math.round(windSpeed + (Math.sin(h) * 5));
    if (hourWind > 25) eventScore -= (hourWind - 25) * 2.5;
    if (hourTemp > 34 || hourTemp < 10) eventScore -= 20;
    eventScore = Math.max(15, Math.min(96, Math.round(eventScore)));

    hourly.push({
      time: timeStr,
      hour: h,
      temp: hourTemp,
      feelsLike: hourFeels,
      condition: pop > 60 ? 'Passing Showers' : hourTemp > 32 ? 'Sunny & Hot' : 'Clear / Pleasant',
      conditionCode: pop > 60 ? 'rain' : hourUv > 5 ? 'sunny' : 'partly_cloudy',
      pop,
      rainMm: pop > 50 ? Number((pop * 0.08).toFixed(1)) : 0,
      windSpeed: hourWind,
      windGust: Math.round(hourWind * 1.4),
      windDirection: windDir,
      humidity: hourHumidity,
      uvIndex: hourUv,
      aqi: hourAqi,
      visibility: hourAqi > 200 ? 2500 : 7000,
      runningScore,
      kidsPlayScore: kidsScore,
      outdoorEventScore: eventScore,
    });
  }

  // 7-Day Synoptic Outlook
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daily: DailyData[] = [];
  for (let d = 0; d < 7; d++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + d);
    const dayName = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : days[targetDate.getDay()];
    const dateStr = targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const maxTemp = temp + (d % 2 === 0 ? 1 : -1) * (d * 0.5);
    const minTemp = maxTemp - (city.region === 'Himalayan' ? 9 : city.isCoastal ? 5 : 8);

    let dayPop = city.id === 'mumbai' ? 65 : city.id === 'bengaluru' ? 35 : 15;
    let expectedRain = dayPop > 40 ? Number((dayPop * 0.25).toFixed(1)) : 0;

    let dayCondition = 'Scattered Clouds';
    let dayCode: DailyData['conditionCode'] = 'partly_cloudy';
    if (dayPop > 60) {
      dayCondition = 'Monsoon Showers';
      dayCode = 'rain';
    } else if (maxTemp > 34) {
      dayCondition = 'Hot & Sunny';
      dayCode = 'sunny';
    }

    daily.push({
      date: dateStr,
      dayName,
      maxTemp: Math.round(maxTemp),
      minTemp: Math.round(minTemp),
      condition: dayCondition,
      conditionCode: dayCode,
      pop: dayPop,
      expectedRainMm: expectedRain,
      maxUv: city.isCoastal ? 9 : 8,
      avgAqi: Math.round(aqi * (1 + (d * 0.02))),
      windMax: Math.round(windSpeed * 1.2),
      humidity: humidity,
      summary: dayPop > 50 ? 'Gusty convective rain expected during late afternoon.' : 'Stable synoptic conditions with clear morning hours.',
    });
  }

  // Authentic IMD Color-coded Alerts based on city characteristics
  const alerts: WeatherAlert[] = [];

  if (city.id === 'delhi' && aqi > 200) {
    alerts.push({
      id: 'alert-aqi-delhi',
      severity: aqi > 300 ? 'red' : 'orange',
      category: 'National AQI & Smog Warning',
      headline: `${aqiStatus.toUpperCase()} AIR QUALITY (AQI ${aqi}) - Stagnant Winter Boundary Layer`,
      effectiveDate: 'Valid till 11:59 PM IST',
      expiresDate: 'Next 36 Hours',
      description: 'IMD-SAFAR synoptic analysis indicates calm surface winds (<08 km/h) causing accumulation of PM2.5/PM10 particulates across National Capital Region.',
      actionGuidance: 'Vulnerable individuals, seniors, and children must restrict intense outdoor exertion. Wear N95 filtration outdoors. Use indoor HEPA purification.',
      relevantProfiles: ['health_conscious', 'fitness_enthusiast', 'parent', 'commuter'],
    });
  }

  if (city.id === 'mumbai') {
    alerts.push({
      id: 'alert-rain-mumbai',
      severity: 'orange',
      category: 'Heavy Rainfall & High Tide Advisory',
      headline: 'ORANGE ALERT: Heavy to Very Heavy Rain at Isolated Coastal Pockets',
      effectiveDate: 'Active Bulletin #14',
      expiresDate: 'Next 24 Hours',
      description: 'Off-shore trough at mean sea level from South Gujarat coast to Kerala coast. Arabian Sea surface winds gusting to 45 km/h with 3.8m wave swell.',
      actionGuidance: 'Avoid low-lying waterlogged roads (Hindmata, Milan Subway). Fishermen and beachgoers advised not to venture into sea. Secure outdoor event tarps.',
      relevantProfiles: ['commuter', 'beachgoer', 'farmer', 'event_planner', 'traveller'],
    });
  }

  if (city.id === 'shimla') {
    alerts.push({
      id: 'alert-frost-shimla',
      severity: 'yellow',
      category: 'Western Disturbance & Frost Watch',
      headline: 'YELLOW WATCH: Fresh Western Disturbance over Western Himalayan Region',
      effectiveDate: 'Active Bulletin #07',
      expiresDate: 'Next 48 Hours',
      description: 'Isolated light snowfall/rain likely over higher reaches; ground frost risk in apple orchards during early morning hours.',
      actionGuidance: 'Apple and stone-fruit growers should apply light evening irrigation to mitigate frost injury. Travellers check mountain pass road conditions.',
      relevantProfiles: ['farmer', 'traveller', 'fitness_enthusiast'],
    });
  }

  if (city.isAgroHub && city.id === 'ludhiana') {
    alerts.push({
      id: 'alert-agro-ludhiana',
      severity: 'yellow',
      category: 'Krishi Agromet Spray Advisory',
      headline: 'AGROMET ADVISORY: High Relative Humidity favorable for fungal spore germination',
      effectiveDate: 'Gramin Krishi Mausam Sewa',
      expiresDate: 'Next 72 Hours',
      description: 'Morning RH >85% followed by warm sunshine creates conducive environment for aphid / rust infestation on standing crops.',
      actionGuidance: 'Carry out recommended foliar sprays during morning calm hours (07:00 - 10:30 AM) when wind speed is under 12 km/h.',
      relevantProfiles: ['farmer'],
    });
  }

  // Always have a baseline alert if none added
  if (alerts.length === 0) {
    alerts.push({
      id: 'alert-green-normal',
      severity: 'green',
      category: 'All-India Synoptic Summary',
      headline: 'GREEN: No Severe Meteorological Warning for this Station',
      effectiveDate: 'Current IMD Bulletin',
      expiresDate: 'Next 24 Hours',
      description: 'Prevailing weather parameters remain within normal seasonal climatological variances. No adverse convection or squall lines detected on radar.',
      actionGuidance: 'Routine outdoor activities, field cultivation, and logistics can proceed without significant weather disruption.',
      relevantProfiles: ['health_conscious', 'fitness_enthusiast', 'farmer', 'parent', 'commuter', 'beachgoer', 'traveller', 'event_planner'],
    });
  }

  return {
    cityId: city.id,
    cityName: city.name,
    stateName: city.state,
    stationName: city.isDetected
      ? `IMD Regional AWS, ${city.name} (${city.lat.toFixed(2)}°N, ${city.lon.toFixed(2)}°E)`
      : `IMD Meteorological Observatory, ${city.name}`,
    elevationMeters: city.id === 'shimla' ? 2206 : city.id === 'bengaluru' ? 920 : city.isCoastal ? 12 : 216,
    timestamp: 'Observed at 08:30 IST / Auto-updated',
    locationSource,
    detectedLocationInfo: city.isDetected
      ? {
          formattedAddress: `${city.name}, ${city.state}`,
          distanceToStationKm: city.distanceKm,
          latitude: city.lat,
          longitude: city.lon,
        }
      : undefined,
    current: {
      temp,
      feelsLike,
      condition,
      conditionCode,
      humidity,
      pressureHpa: 1012,
      dewPoint: Math.round(temp - ((100 - humidity) / 5)),
      windSpeed,
      windGust,
      windDirectionDeg: city.isCoastal ? 240 : 315,
      windDirectionText: windDir,
      visibilityMeters,
      uvIndex,
      rainfallPast24hMm,
      rainfallRateMmHr,
      cloudCoverPercent: isRaining ? 85 : conditionCode === 'partly_cloudy' ? 45 : 15,
      soilMoistureTop15cmPercent: city.id === 'mumbai' ? 68 : city.id === 'ludhiana' ? 48 : 34,
      soilMoisture50cmPercent: city.id === 'mumbai' ? 72 : city.id === 'ludhiana' ? 54 : 41,
      soilTempCelsius: Math.round(temp - 2.5),
      evapotranspirationMmDay: Number((3.8 + (temp * 0.08)).toFixed(1)),
      seaSurfaceTemp: city.isCoastal ? 28.5 : undefined,
      tideStatus: city.isCoastal ? 'High Tide Rising' : undefined,
      waveHeightMeters: city.isCoastal ? (city.id === 'mumbai' ? 2.4 : 1.2) : undefined,
      aqi,
      aqiStatus,
      pm25,
      pm10,
      no2,
      o3,
      co,
      sunrise: '06:14 AM',
      sunset: '06:22 PM',
      moonPhase: 'Waxing Gibbous (82%)',
      firstLight: '05:52 AM',
      lastLight: '06:45 PM',
      isDay: currentHour >= 6 && currentHour < 19,
    },
    hourly,
    daily,
    alerts,
  };
}
