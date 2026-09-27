import { USER_PROFILES } from '../data/profiles';
import { DerivedIndicator, ProfileId, UserProfileConfig, WeatherAlert, WeatherData } from '../types/weather';

export interface PersonalizedAnalysis {
  profile: UserProfileConfig;
  primaryDerivedIndicator: DerivedIndicator;
  secondaryDerivedIndicators: DerivedIndicator[];
  prioritizedAlerts: WeatherAlert[];
  orderedWidgetKeys: string[];
  userNeedsSummary: string[];
  topRecommendations: string[];
  pipelineSteps: {
    stepNumber: number;
    title: string;
    description: string;
    details: string;
    status: 'completed' | 'active';
  }[];
}

export function analyzeAndPersonalize(
  profileId: ProfileId,
  weather: WeatherData
): PersonalizedAnalysis {
  const profile = USER_PROFILES.find((p) => p.id === profileId) || USER_PROFILES[0];
  const { current, hourly, alerts } = weather;

  // 1. Analyze User Needs and Calculate Derived Indicators
  const derivedIndicators: DerivedIndicator[] = [];

  switch (profileId) {
    case 'health_conscious': {
      // Respiratory Risk Score (0 = Clean, 100 = Hazardous)
      let respRisk = Math.min(100, Math.round((current.pm25 / 120) * 60 + (current.pm10 / 200) * 25 + (current.humidity > 80 ? 15 : 0)));
      const respStatus = respRisk > 75 ? 'hazardous' : respRisk > 45 ? 'caution' : respRisk > 25 ? 'moderate' : 'optimal';

      derivedIndicators.push({
        id: 'respiratory_risk',
        title: 'Respiratory & Pulmonary Strain Index',
        category: 'Health & Air Quality',
        score: respRisk,
        statusText: respRisk > 75 ? 'Severe Irritation Risk' : respRisk > 45 ? 'Elevated Airway Stress' : 'Acceptable Ambient Air',
        statusLevel: respStatus,
        summaryProse: `Current PM2.5 level is ${current.pm25} µg/m³ (NAQI: ${current.aqi} - ${current.aqiStatus}). Fine particulates easily penetrate lower bronchioles.`,
        actionItems: [
          current.aqi > 200 ? 'Mandatory N95 particulate respirator when stepping outdoors' : 'Standard surgical mask sufficient for sensitive groups',
          'Keep home windows shut; operate HEPA air purifier on medium/high speed',
          'Avoid morning brisk walks during 05:00 - 08:30 AM when surface thermal inversion traps exhaust fumes',
        ],
        metrics: [
          { label: 'PM2.5 (Fine)', value: `${current.pm25} µg/m³`, hint: 'Safe limit: 30 µg/m³' },
          { label: 'PM10 (Coarse)', value: `${current.pm10} µg/m³`, hint: 'Safe limit: 60 µg/m³' },
          { label: 'Ozone (O₃)', value: `${current.o3} µg/m³`, hint: 'Photochemical smog' },
          { label: 'Best Window', value: '14:00 - 17:30', hint: 'Dispersal peak' },
        ],
      });

      // Safe Breathing Hours Timeline
      derivedIndicators.push({
        id: 'safe_breathing_window',
        title: 'Daily Air Quality & Ventilation Schedule',
        category: 'Ambient Exposure Guide',
        score: Math.max(10, 100 - Math.round(current.aqi * 0.3)),
        statusText: 'Afternoon Natural Dispersal Recommended',
        statusLevel: 'moderate',
        summaryProse: 'Solar heating generates vertical thermal eddies between 13:00 and 17:00, improving particulate dispersion before evening ground cooling begins.',
        actionItems: [
          'Ventilate living spaces between 13:30 - 16:30 IST only',
          'Perform cardiovascular or respiratory breathing exercises indoors with purified air',
        ],
        metrics: [
          { label: 'Morning AQI', value: `${Math.round(current.aqi * 1.2)}`, hint: 'Worst window' },
          { label: 'Midday AQI', value: `${Math.round(current.aqi * 0.85)}`, hint: 'Cleanest window' },
          { label: 'Evening AQI', value: `${Math.round(current.aqi * 1.15)}`, hint: 'Inversion returns' },
        ],
      });
      break;
    }

    case 'fitness_enthusiast': {
      // Find top running hours from hourly data
      const bestHours = [...hourly]
        .sort((a, b) => (b.runningScore || 0) - (a.runningScore || 0))
        .slice(0, 3);

      const currentScore = hourly[0]?.runningScore || 70;
      const statusLevel = currentScore >= 80 ? 'optimal' : currentScore >= 60 ? 'moderate' : 'caution';

      // Sweat & hydration calculation
      const hydrationRate = Math.round(450 + (current.temp > 25 ? (current.temp - 25) * 35 : 0) + (current.humidity > 70 ? 120 : 0));

      derivedIndicators.push({
        id: 'running_cycling_comfort',
        title: 'Athletic Running & Cycling Suitability',
        category: 'Outdoor Aerobic Performance',
        score: currentScore,
        statusText: currentScore >= 80 ? 'Optimal Aerobic Conditions' : currentScore >= 60 ? 'Moderate Heat/Wind Load' : 'High Exertion Strain',
        statusLevel,
        summaryProse: `Ambient temperature is ${current.temp}°C (Feels like ${current.feelsLike}°C) with ${current.windSpeed} km/h wind and ${current.humidity}% humidity.`,
        actionItems: [
          `Top recommended training slots today: ${bestHours.map((h) => h.time).join(', ')}`,
          `Electrolyte intake guideline: Hydrate at ~${hydrationRate} ml per hour of intense aerobic training`,
          current.temp > 30 ? 'High thermal stress: Shift tempo runs to early morning; cap zone 4/5 efforts' : 'Favorable wind & atmospheric drag: Great for outdoor intervals',
        ],
        metrics: [
          { label: 'Hydration Target', value: `${hydrationRate} ml/h`, hint: 'Based on sweat rate' },
          { label: 'Wind Resistance', value: `${current.windSpeed} km/h`, hint: `${current.windDirectionText} flow` },
          { label: 'Heat Index', value: `${current.feelsLike}°C`, hint: 'WBGT adjusted' },
          { label: 'Best Hour', value: bestHours[0]?.time || '06:00', hint: `Score: ${bestHours[0]?.runningScore}/100` },
        ],
      });

      derivedIndicators.push({
        id: 'heat_stress_wbgt',
        title: 'Wet-Bulb Globe Temp (WBGT) & Heat Cramp Risk',
        category: 'Thermal Stress Safety',
        score: Math.max(20, 100 - (current.feelsLike - 20) * 4),
        statusText: current.feelsLike > 35 ? 'High Heat Illness Caution' : 'Normal Physiological Range',
        statusLevel: current.feelsLike > 35 ? 'caution' : 'optimal',
        summaryProse: 'High relative humidity inhibits sweat evaporation cooling. Monitor heart rate recovery between sets.',
        actionItems: [
          'Wear moisture-wicking technical fabrics with UPF 30+ sun protection',
          'Pre-hydrate with 300ml cold water 15 minutes before warm-up',
        ],
        metrics: [
          { label: 'WBGT Equivalent', value: `${Math.round(current.temp * 0.7 + current.dewPoint * 0.3)}°C`, hint: 'Wet bulb estimate' },
          { label: 'Dew Point', value: `${current.dewPoint}°C`, hint: 'Evaporative efficacy' },
          { label: 'UV Index', value: `${current.uvIndex}`, hint: 'Skin solar load' },
        ],
      });
      break;
    }

    case 'farmer': {
      // Krishi Agromet Derived Indicators
      const windSafeForSpray = current.windSpeed >= 4 && current.windSpeed <= 14;
      const rainFreeAhead = !hourly.slice(0, 6).some((h) => h.pop > 40);
      const spraySuitable = windSafeForSpray && rainFreeAhead;

      const sprayScore = spraySuitable ? 92 : windSafeForSpray ? 60 : 35;

      derivedIndicators.push({
        id: 'krishi_agromet_spray',
        title: 'Gramin Krishi Agromet Spray Suitability',
        category: 'Pesticide & Foliar Operations',
        score: sprayScore,
        statusText: spraySuitable ? 'Excellent Spray Window' : !windSafeForSpray ? 'High Drift Wind Hazard' : 'Rain Washout Risk Ahead',
        statusLevel: spraySuitable ? 'optimal' : 'caution',
        summaryProse: `Wind speed is ${current.windSpeed} km/h (Limit: <14 km/h to prevent spray drift). Next 6-hour rain probability remains low.`,
        actionItems: [
          spraySuitable ? 'Safe to proceed with foliar micronutrients and pest-control sprays' : 'Postpone spray operations until surface winds subside under 14 km/h',
          'Calibrate nozzle droplet size to medium-coarse to reduce atmospheric volatilization',
          `Soil moisture at root zone (15cm) is ${current.soilMoistureTop15cmPercent}%; schedule canal or drip run accordingly`,
        ],
        metrics: [
          { label: 'Wind for Spray', value: `${current.windSpeed} km/h`, hint: windSafeForSpray ? 'Within safe limits' : 'Excessive drift' },
          { label: '6h Rain Risk', value: rainFreeAhead ? 'Low (<20%)' : 'Rain likely', hint: 'Washout test' },
          { label: 'Topsoil Moisture', value: `${current.soilMoistureTop15cmPercent}%`, hint: 'Root zone 0-15cm' },
          { label: 'Subsoil Moisture', value: `${current.soilMoisture50cmPercent}%`, hint: 'Deep zone 50cm' },
        ],
      });

      derivedIndicators.push({
        id: 'irrigation_crop_need',
        title: 'Soil Moisture & Evapotranspiration Balance',
        category: 'Field Water Management',
        score: Math.min(100, Math.round(current.soilMoistureTop15cmPercent * 1.3)),
        statusText: current.soilMoistureTop15cmPercent > 55 ? 'Adequate Field Capacity' : 'Irrigation Recommended',
        statusLevel: current.soilMoistureTop15cmPercent > 55 ? 'optimal' : 'moderate',
        summaryProse: `Daily reference crop evapotranspiration (ET₀) is estimated at ${current.evapotranspirationMmDay} mm/day under current solar radiation and vapor deficit.`,
        actionItems: [
          current.soilMoistureTop15cmPercent < 45 ? 'Apply light irrigation to rabi/kharif crops during morning calm hours' : 'Withhold heavy watering to avoid root hypoxia and fungal rot',
          'Monitor for rust or aphid activity given night dew formation',
        ],
        metrics: [
          { label: 'Daily ET₀', value: `${current.evapotranspirationMmDay} mm/day`, hint: 'Atmospheric demand' },
          { label: 'Soil Temp', value: `${current.soilTempCelsius}°C`, hint: 'Seedbed warmth' },
          { label: 'Past 24h Rain', value: `${current.rainfallPast24hMm} mm`, hint: 'Observed gauge' },
          { label: '7-Day Rain Outlook', value: `${weather.daily.reduce((acc, d) => acc + d.expectedRainMm, 0).toFixed(1)} mm`, hint: 'Synoptic sum' },
        ],
      });
      break;
    }

    case 'parent': {
      // Kids playground comfort & school transit
      const currentHour = new Date().getHours();
      const afternoonHour = hourly.find((h) => h.hour === 16) || hourly[0];
      const kidsScore = afternoonHour.kidsPlayScore || 75;

      derivedIndicators.push({
        id: 'kids_outdoor_comfort',
        title: 'Children Outdoor Play & Park Comfort',
        category: 'Child Health & Safety',
        score: kidsScore,
        statusText: kidsScore >= 75 ? 'Great for Evening Park Play' : kidsScore >= 50 ? 'Moderate Play Conditions' : 'Indoor Play Advised',
        statusLevel: kidsScore >= 75 ? 'optimal' : kidsScore >= 50 ? 'moderate' : 'caution',
        summaryProse: `Peak UV Index is ${current.uvIndex}. Evening park hours (16:30 - 18:30) offer comfortable ${afternoonHour.temp}°C air with minimal thermal stress.`,
        actionItems: [
          current.uvIndex >= 6 ? 'Apply broad-spectrum SPF 30+ sunscreen 20 min before afternoon outdoor play' : 'Low solar danger; comfortable for outdoor games',
          'Pack an extra water bottle and a light sun cap in children’s school bags',
          current.aqi > 180 ? 'Limit high-intensity running on playground; replace with indoor activities' : 'Air quality suitable for outdoor park play',
        ],
        metrics: [
          { label: 'Peak UV Index', value: `${current.uvIndex}`, hint: current.uvIndex > 6 ? 'Burn time: 20 min' : 'Mild exposure' },
          { label: 'School Pickup Temp', value: `${afternoonHour.temp}°C`, hint: 'At 15:30 IST' },
          { label: 'Rain Possibility', value: `${afternoonHour.pop}%`, hint: 'Afternoon window' },
          { label: 'Playground Score', value: `${kidsScore}/100`, hint: 'Thermal & air rating' },
        ],
      });

      derivedIndicators.push({
        id: 'school_pack_checklist',
        title: 'School Transit & Attire Advisory',
        category: 'Daily School Bag Prep',
        score: 88,
        statusText: 'Light Cotton Attire + Rain Gear Ready',
        statusLevel: 'optimal',
        summaryProse: 'Morning temperatures are mild with low fog probability. Afternoon may see isolated cloud build-up.',
        actionItems: [
          hourly.some((h) => h.pop > 40) ? 'Pack lightweight folding umbrella or compact raincoat' : 'No rain gear required for transit',
          'Use insect repellent patch for evening play to safeguard against mosquito activity',
        ],
        metrics: [
          { label: 'Morning Commute', value: `${hourly[0]?.temp || current.temp}°C`, hint: '07:30 IST transit' },
          { label: 'Pickup Commute', value: `${afternoonHour.temp}°C`, hint: '14:30 IST transit' },
          { label: 'Mosquito Index', value: current.humidity > 70 ? 'Moderate' : 'Low', hint: 'Humidity dependent' },
        ],
      });
      break;
    }

    case 'commuter': {
      // Commuter transit risk: visibility + road spray + waterlogging
      const visKm = (current.visibilityMeters / 1000).toFixed(1);
      const sprayRisk = current.rainfallPast24hMm > 15 || current.rainfallRateMmHr > 2;
      const roadScore = current.visibilityMeters < 1500 ? 40 : sprayRisk ? 55 : 88;

      derivedIndicators.push({
        id: 'commute_road_hazards',
        title: 'Peak-Hour Transit & Road Spray Index',
        category: 'Urban Mobility & Traffic',
        score: roadScore,
        statusText: roadScore >= 80 ? 'Clear Roads & Rapid Transit' : roadScore >= 50 ? 'Wet Surfaces & Slow Movement' : 'Dense Fog / Waterlogging Alert',
        statusLevel: roadScore >= 80 ? 'optimal' : roadScore >= 50 ? 'caution' : 'hazardous',
        summaryProse: `Surface visibility is ${visKm} km (${current.visibilityMeters}m). Roadway traction is ${sprayRisk ? 'compromised by wet tarmac' : 'dry and stable'}.`,
        actionItems: [
          current.visibilityMeters < 2000 ? 'Low visibility: Use low-beam fog lights and maintain minimum 4-second vehicle spacing' : 'High visibility; normal highway cruise speeds permissible',
          sprayRisk ? 'Two-wheeler riders: Exercise extreme caution on flyover expansion joints and painted lane markings' : 'Safe two-wheeler conditions with steady crosswinds',
          'Monitor metro and local train frequency during the 17:30 - 20:00 return rush',
        ],
        metrics: [
          { label: 'Road Visibility', value: `${visKm} km`, hint: `${current.visibilityMeters} meters` },
          { label: 'Waterlogging Risk', value: sprayRisk ? 'Elevated' : 'Negligible', hint: 'Subway drain load' },
          { label: 'Wind Gusts', value: `${current.windGust} km/h`, hint: 'Two-wheeler balance' },
          { label: 'Peak 18h Rain', value: `${hourly.find((h) => h.hour === 18)?.pop || 10}%`, hint: 'Evening return commute' },
        ],
      });

      derivedIndicators.push({
        id: 'transit_delay_probability',
        title: 'Public Transit & Rail Delay Propensity',
        category: 'Multimodal Transit Health',
        score: roadScore > 60 ? 82 : 45,
        statusText: roadScore > 60 ? 'Timely Bus & Metro Schedules' : 'Expect 15-25 Min Transit Delays',
        statusLevel: roadScore > 60 ? 'optimal' : 'caution',
        summaryProse: 'Track adhesion and road flyover throughput are governed by convective rain squalls and ambient visibility.',
        actionItems: [
          'Buffer 15 additional minutes for inter-city bus and metro connections',
          'Ensure vehicle wipers and defoggers are fully operational',
        ],
        metrics: [
          { label: 'Transit Impact', value: sprayRisk ? '+15 min' : 'On-Time', hint: 'Estimated delay' },
          { label: 'Peak Wind Cross', value: `${current.windSpeed} km/h`, hint: 'Flyover sway' },
        ],
      });
      break;
    }

    case 'beachgoer': {
      // Coastal & Marine indicators
      const waveHeight = current.waveHeightMeters || 1.2;
      const tideState = current.tideStatus || 'High Tide Rising';
      const beachScore = current.uvIndex > 9 ? 65 : waveHeight > 2.5 ? 45 : 90;

      derivedIndicators.push({
        id: 'beach_tide_wind',
        title: 'Coastal Swell & Sea Breeze Suitability',
        category: 'Marine & Shoreline Conditions',
        score: beachScore,
        statusText: waveHeight > 2.0 ? 'Rough Sea - Caution for Swimmers' : 'Pleasant Coastal Waters',
        statusLevel: waveHeight > 2.0 ? 'caution' : 'optimal',
        summaryProse: `Offshore wave swell is ${waveHeight}m with ${current.windSpeed} km/h ${current.windDirectionText} sea breeze. Current tide state: ${tideState}.`,
        actionItems: [
          waveHeight > 2.0 ? 'IMD Red Flag alert at shoreline: Restrict swimming to designated lifeguard zones' : 'Calm near-shore waters; safe for recreational wading and swimming',
          `Very high UV Index (${current.uvIndex}): Reapply water-resistant sunscreen every 90 minutes`,
          `Optimal beach promenade hours today: 16:30 - 18:45 IST during sunset cooling`,
        ],
        metrics: [
          { label: 'Wave Swell', value: `${waveHeight} m`, hint: waveHeight > 2.0 ? 'Rough breakers' : 'Gentle surf' },
          { label: 'Tidal State', value: tideState, hint: 'Astronomical cycle' },
          { label: 'Sea Breeze', value: `${current.windSpeed} km/h`, hint: `${current.windDirectionText} direction` },
          { label: 'Water Temp', value: current.seaSurfaceTemp ? `${current.seaSurfaceTemp}°C` : '27°C', hint: 'Surface layer' },
        ],
      });

      derivedIndicators.push({
        id: 'sun_exposure_burn_timer',
        title: 'Solar UV-B Radiation & Burn Threshold',
        category: 'Photobiology & Sun Safety',
        score: Math.max(20, 100 - current.uvIndex * 8),
        statusText: current.uvIndex >= 8 ? 'Very High UV - Rapid Erythema Risk' : 'Moderate UV Levels',
        statusLevel: current.uvIndex >= 8 ? 'caution' : 'optimal',
        summaryProse: 'Direct equatorial solar angle causes rapid UV-A/B photon absorption on unshaded sandy beaches.',
        actionItems: [
          'Wear UV400 rated sunglasses to prevent corneal photokeratitis',
          'Use beach umbrella or canopy during peak solar hours (11:00 - 15:00 IST)',
        ],
        metrics: [
          { label: 'UV Index', value: `${current.uvIndex}`, hint: 'Index scale 0-11+' },
          { label: 'Burn Time', value: current.uvIndex > 7 ? '18 mins' : '45 mins', hint: 'Unprotected fair skin' },
          { label: 'SPF Needed', value: 'SPF 50+', hint: 'Broad spectrum' },
        ],
      });
      break;
    }

    case 'traveller': {
      // Flight, airport, packing & multi-day tourist outlook
      const flightScore = current.visibilityMeters < 1000 || current.windGust > 45 ? 40 : 92;

      derivedIndicators.push({
        id: 'flight_travel_outlook',
        title: 'Airport Operations & Sightseeing Suitability',
        category: 'Travel & Aerodrome Advisory',
        score: flightScore,
        statusText: flightScore >= 80 ? 'Normal Runway & Air Traffic Flow' : 'Potential Flight Holdings / Delays',
        statusLevel: flightScore >= 80 ? 'optimal' : 'caution',
        summaryProse: `Aerodrome visibility is ${current.visibilityMeters}m with calm runway surface winds at ${current.windSpeed} km/h. CAT-I/II ILS operations standard.`,
        actionItems: [
          flightScore < 70 ? 'Check live airline flight status prior to departing for the airport' : 'Flights operating on schedule; no weather holding patterns detected',
          'Multi-day sightseeing forecast shows stable conditions with daytime highs of ~31°C',
          'Carry breathable footwear and a compact travel umbrella for variable conditions',
        ],
        metrics: [
          { label: 'Runway Visibility', value: `${current.visibilityMeters} m`, hint: 'ILS CAT minimum' },
          { label: 'Wind Shear Risk', value: 'Low', hint: 'Steady boundary layer' },
          { label: '7-Day Rain Days', value: `${weather.daily.filter((d) => d.pop > 40).length} of 7`, hint: 'Synoptic outlook' },
          { label: 'Sightseeing Index', value: '88/100', hint: 'Tourist comfort' },
        ],
      });

      derivedIndicators.push({
        id: 'travel_packing_guide',
        title: 'Curated Luggage & Packing Recommendations',
        category: 'Tourist Preparedness',
        score: 95,
        statusText: 'All-Weather Travel Kit Recommended',
        statusLevel: 'optimal',
        summaryProse: 'Regional temperature spread between minimum and maximum is moderate (~8°C).',
        actionItems: [
          'Pack light cotton shirts, UV-blocking sunglasses, and travel electrolytes',
          weather.daily.some((d) => d.pop > 40) ? 'Pack lightweight waterproof jacket or poncho' : 'Dry forecast: Standard casual wear sufficient',
        ],
        metrics: [
          { label: 'Day Temp', value: `${current.temp}°C`, hint: 'High peak' },
          { label: 'Night Temp', value: `${weather.daily[0]?.minTemp || 22}°C`, hint: 'Overnight low' },
          { label: 'Luggage Weight', value: 'Light layers', hint: 'No heavy woolens needed' },
        ],
      });
      break;
    }

    case 'event_planner': {
      // Wind gusts, tent safety, hour-by-hour rain, thermal comfort for guests
      const maxGust = Math.max(...hourly.slice(0, 12).map((h) => h.windGust));
      const rainRisk = hourly.slice(0, 12).some((h) => h.pop > 50);
      const canopySafe = maxGust < 35;
      const eventScore = canopySafe && !rainRisk ? 90 : canopySafe ? 65 : 40;

      derivedIndicators.push({
        id: 'event_wind_thermal',
        title: 'Outdoor Stage & Canopy Structural Safety',
        category: 'Event Operations & Production',
        score: eventScore,
        statusText: canopySafe ? 'Safe Wind Velocity for Tents & Trusses' : 'HIGH GUST WARNING: Secure Ballasts',
        statusLevel: canopySafe ? 'optimal' : 'caution',
        summaryProse: `Sustained wind is ${current.windSpeed} km/h with peak gusts reaching ${maxGust} km/h (Safety threshold: 35 km/h for temporary marquees).`,
        actionItems: [
          canopySafe ? 'Wind loads are well within structural safety margins for temporary canopies and audio arrays' : 'CRITICAL: Add minimum 150kg water/concrete ballast per marquee leg',
          rainRisk ? 'High precipitation probability during evening window: Ensure waterproof cable covers and ground elevation' : 'Rain probability under 25%: Open-air seating viable',
          `Guest thermal comfort: High humidity (${current.humidity}%) suggests misting fans or evaporative cooling for outdoor lawns`,
        ],
        metrics: [
          { label: 'Peak Wind Gust', value: `${maxGust} km/h`, hint: 'Marquee limit: 35 km/h' },
          { label: 'Rain Certainty', value: rainRisk ? 'High (>50%)' : 'Low (<20%)', hint: 'Next 12 hours' },
          { label: 'Guest Heat Index', value: `${current.feelsLike}°C`, hint: 'Thermal comfort' },
          { label: 'Setup Window', value: '08:00 - 13:00', hint: 'Calmest wind hours' },
        ],
      });

      derivedIndicators.push({
        id: 'hour_by_hour_rain_probability',
        title: 'Production Timeline & Weather Precision',
        category: 'Show Logistics & Seating',
        score: 84,
        statusText: 'Stable Synoptic Setup Window',
        statusLevel: 'optimal',
        summaryProse: 'Convective thunderstorm cell generation is low over the immediate 15km radar radius.',
        actionItems: [
          'Schedule generator load-ins during morning calm window',
          'Deploy moisture-proof tarpaulins over stage lighting consoles during standby',
        ],
        metrics: [
          { label: 'RH Condensation', value: `${current.humidity}%`, hint: 'AV lens fogging risk' },
          { label: 'Evening Drop', value: '-3.5°C', hint: 'Post-sunset cooling' },
        ],
      });
      break;
    }
  }

  // 2. Prioritize Widgets Based on Config Weights
  const widgetWeights = profile.widgetWeights;
  const orderedWidgetKeys = Object.entries(widgetWeights)
    .sort(([, weightA], [, weightB]) => weightB - weightA)
    .map(([key]) => key);

  // 3. Filter and Prioritize Alerts tailored to this user profile
  const prioritizedAlerts = [...alerts].sort((a, b) => {
    const aRel = a.relevantProfiles.includes(profileId) ? 1 : 0;
    const bRel = b.relevantProfiles.includes(profileId) ? 1 : 0;
    return bRel - aRel;
  });

  // 4. Synthesize User Needs & Recommendations
  const userNeedsSummary = [
    `Analyzing profile parameters for: ${profile.name} (${profile.hindiName})`,
    `Prioritized operational vectors: ${profile.primaryPriorities.join(' · ')}`,
    `Synthesizing meteorological parameters from ${weather.stationName}`,
    `Recalibrating specialized indices: ${derivedIndicators.map((d) => d.title).join(', ')}`,
  ];

  const topRecommendations = derivedIndicators[0]?.actionItems || [
    'Monitor updated IMD Doppler radar scans for local cell development',
    'Follow standard seasonal weather guidelines for this region',
  ];

  // 5. Construct Visual Representation of the Pipeline
  const pipelineSteps = [
    {
      stepNumber: 1,
      title: 'User Profile Selected',
      description: profile.name,
      details: `Active role: ${profile.roleDescription}`,
      status: 'completed' as const,
    },
    {
      stepNumber: 2,
      title: 'Weather Data Ingested',
      description: `${weather.cityName}, ${weather.stateName}`,
      details: `${current.temp}°C, ${current.condition}, AQI ${current.aqi}, Wind ${current.windSpeed} km/h`,
      status: 'completed' as const,
    },
    {
      stepNumber: 3,
      title: 'Analyze User Needs',
      description: `${profile.primaryPriorities[0]} & ${profile.primaryPriorities[1]}`,
      details: `Weighted scoring engine configured for ${profile.name} requirements`,
      status: 'completed' as const,
    },
    {
      stepNumber: 4,
      title: 'Prioritize Relevant Info',
      description: `Primary Hero: ${derivedIndicators[0]?.title || 'Key Indicator'}`,
      details: `Widgets sorted by domain relevance (Top priority weight: ${Math.max(...Object.values(widgetWeights))}/10)`,
      status: 'completed' as const,
    },
    {
      stepNumber: 5,
      title: 'Personalized Homepage & Alerts',
      description: `${prioritizedAlerts.length} Tailored IMD Alerts Active`,
      details: `Homepage tailored dynamically with custom derived indicators`,
      status: 'active' as const,
    },
  ];

  return {
    profile,
    primaryDerivedIndicator: derivedIndicators[0],
    secondaryDerivedIndicators: derivedIndicators.slice(1),
    prioritizedAlerts,
    orderedWidgetKeys,
    userNeedsSummary,
    topRecommendations,
    pipelineSteps,
  };
}
