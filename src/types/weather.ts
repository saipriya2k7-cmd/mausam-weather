export type ProfileId =
  | 'health_conscious'
  | 'fitness_enthusiast'
  | 'farmer'
  | 'parent'
  | 'commuter'
  | 'beachgoer'
  | 'traveller'
  | 'event_planner';

export type AlertSeverity = 'green' | 'yellow' | 'orange' | 'red';

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  headline: string;
  category: string; // e.g., 'Air Quality', 'Rainfall', 'Heat Wave', 'Squall', 'Visibility'
  effectiveDate: string;
  expiresDate: string;
  description: string;
  actionGuidance: string;
  relevantProfiles: ProfileId[];
}

export interface HourlyData {
  time: string; // '06:00', '07:00'
  hour: number;
  temp: number; // Celsius
  feelsLike: number;
  condition: string;
  conditionCode: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'thunderstorm' | 'fog' | 'dust';
  pop: number; // Probability of precipitation (%)
  rainMm: number;
  windSpeed: number; // km/h
  windGust: number;
  windDirection: string;
  humidity: number; // %
  uvIndex: number;
  aqi: number;
  visibility: number; // meters
  // Profile derived fitness/comfort score for this hour (0-100)
  runningScore?: number;
  kidsPlayScore?: number;
  outdoorEventScore?: number;
}

export interface DailyData {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  conditionCode: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'thunderstorm' | 'fog' | 'dust';
  pop: number;
  expectedRainMm: number;
  maxUv: number;
  avgAqi: number;
  windMax: number;
  humidity: number;
  summary: string;
}

export interface WeatherData {
  cityId: string;
  cityName: string;
  stateName: string;
  stationName: string;
  elevationMeters: number;
  timestamp: string;
  locationSource?: 'gps' | 'ip' | 'manual' | 'preset';
  detectedLocationInfo?: {
    formattedAddress: string;
    distanceToStationKm?: number;
    latitude: number;
    longitude: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    condition: string;
    conditionCode: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'thunderstorm' | 'fog' | 'dust';
    humidity: number;
    pressureHpa: number;
    dewPoint: number;
    windSpeed: number;
    windGust: number;
    windDirectionDeg: number;
    windDirectionText: string;
    visibilityMeters: number;
    uvIndex: number;
    rainfallPast24hMm: number;
    rainfallRateMmHr: number;
    cloudCoverPercent: number;
    // Agricultural / Agromet metrics
    soilMoistureTop15cmPercent: number;
    soilMoisture50cmPercent: number;
    soilTempCelsius: number;
    evapotranspirationMmDay: number;
    // Marine / Coastal
    seaSurfaceTemp?: number;
    tideStatus?: 'High Tide Rising' | 'Low Tide Slack' | 'High Tide Falling' | 'Low Tide Rising';
    waveHeightMeters?: number;
    // Air Quality
    aqi: number;
    aqiStatus: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
    // Astronomy
    sunrise: string;
    sunset: string;
    moonPhase: string;
    firstLight: string;
    lastLight: string;
    lastUpdatedTime?: string;
    isDay?: boolean;
  };
  hourly: HourlyData[];
  daily: DailyData[];
  alerts: WeatherAlert[];
}

export interface UserProfileConfig {
  id: ProfileId;
  name: string;
  hindiName: string;
  roleDescription: string;
  iconName: string;
  avatarColor: string;
  primaryPriorities: string[];
  // Priority weights for UI widgets (1 to 10 scale)
  widgetWeights: {
    aqi_air_quality: number;
    rainfall_precipitation: number;
    running_cycling_hours: number;
    soil_agromet: number;
    school_kids_comfort: number;
    commute_road_hazards: number;
    beach_tide_wind: number;
    flight_travel_outlook: number;
    event_wind_thermal: number;
    hourly_forecast: number;
    weekly_synoptic: number;
    sun_uv_radiation: number;
    wind_pressure: number;
  };
}

export interface DerivedIndicator {
  id: string;
  title: string;
  category: string;
  score: number; // 0 to 100
  statusText: string;
  statusLevel: 'optimal' | 'moderate' | 'caution' | 'hazardous';
  summaryProse: string;
  actionItems: string[];
  metrics: { label: string; value: string; hint?: string }[];
}

export interface CityProfile {
  id: string;
  name: string;
  hindiName: string;
  state: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East' | 'Himalayan' | 'Coastal';
  isCoastal: boolean;
  isAgroHub: boolean;
  lat: number;
  lon: number;
  baseTemp: number;
  baseHumidity: number;
  baseAqi: number;
  typicalCondition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'thunderstorm' | 'fog' | 'dust';
  isDetected?: boolean;
  distanceKm?: number;
}
