import React, { useState } from 'react';
import {
  Wind,
  Sun,
  Sunset,
  Droplets,
  Umbrella,
  Shirt,
  Sparkles,
  Smile,
  Compass,
  Bike,
  Sprout,
  Baby,
  HeartPulse,
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Activity,
  Layers,
  Thermometer,
  CloudRain,
} from 'lucide-react';
import { WeatherData, ProfileId } from '../types/weather';
import { PersonalizedAnalysis } from '../utils/personalizationEngine';

interface AppleBentoGridProps {
  weather: WeatherData;
  tempUnit: 'C' | 'F';
  activeProfileId?: ProfileId;
  analysis?: PersonalizedAnalysis;
}

export const AppleBentoGrid: React.FC<AppleBentoGridProps> = ({
  weather,
  tempUnit,
  activeProfileId = 'parent',
  analysis,
}) => {
  const [showStandardMetrics, setShowStandardMetrics] = useState(false);

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const current = weather.current || {
    temp: 28,
    feelsLike: 28,
    humidity: 55,
    windSpeed: 10,
    aqi: 120,
    conditionCode: 'partly_cloudy',
    condition: 'Partly Cloudy',
    pressureHpa: 1012,
    uvIndex: 5,
    dewPoint: 18,
    visibilityMeters: 6000,
  };
  const hourly = Array.isArray(weather.hourly) ? weather.hourly : [];
  const daily = Array.isArray(weather.daily) ? weather.daily : [];
  const aqi = current.aqi ?? 120;
  const isRainy =
    current.conditionCode === 'rain' ||
    current.conditionCode === 'heavy_rain' ||
    current.conditionCode === 'thunderstorm';
  const rainChance = hourly.length > 0 ? Math.max(...hourly.slice(0, 4).map((h) => h.pop ?? 0)) : 10;

  /* -------------------------------------------------------------
   * 1. FARMER CUSTOMIZED TILES
   * ------------------------------------------------------------- */
  const renderFarmerGrid = () => {
    const windSafeForSpray = (current.windSpeed ?? 10) <= 14;
    const rainFreeAhead = !hourly.slice(0, 6).some((h) => (h.pop ?? 0) > 40);
    const spraySuitable = windSafeForSpray && rainFreeAhead;
    const sevenDayRain = daily.reduce((acc, d) => acc + (d.expectedRainMm ?? 0), 0).toFixed(1);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 select-none">
        {/* Tile 1: Best Time to Plant & Spray (Wide) */}
        <div className="sm:col-span-2 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Best Time to Plant & Spray</span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  spraySuitable
                    ? 'text-emerald-200 bg-emerald-950/60 border-emerald-400/40 shadow-xs'
                    : 'text-amber-200 bg-amber-950/60 border-amber-400/40 shadow-xs'
                }`}
              >
                {spraySuitable ? '🌱 Optimal Spray & Sowing Window' : '⚠️ Hold Chemical Sprays'}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Morning 06:00 - 09:30 AM
            </div>

            <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed max-w-2xl">
              {spraySuitable
                ? `Winds are calm at ${current.windSpeed} km/h (safe limit: <14 km/h). Low rain risk in next 6 hours ensures pesticide and foliar fertilizer absorption without wash-off.`
                : `Current winds are ${current.windSpeed} km/h with potential drift. Next 6-hour rain probability is elevated. Wait for calm morning air before foliar application.`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/15">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Spray Drift Wind</div>
              <div className="text-base font-bold text-white mt-0.5">{current.windSpeed} km/h</div>
              <div className="text-[10px] text-emerald-600 font-semibold">{windSafeForSpray ? 'Safe (<14 km/h)' : 'High Drift'}</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">6-Hour Washout Risk</div>
              <div className="text-base font-bold text-white mt-0.5">{rainFreeAhead ? 'Low (<20%)' : 'Rain Likely'}</div>
              <div className="text-[10px] text-white/70">Chemical safe</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Seedbed Warmth</div>
              <div className="text-base font-bold text-white mt-0.5">{current.soilTempCelsius}°C</div>
              <div className="text-[10px] text-white/70">Germination zone</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Daily Water Need (ET₀)</div>
              <div className="text-base font-bold text-white mt-0.5">{current.evapotranspirationMmDay} mm</div>
              <div className="text-[10px] text-white/70">Crop loss rate</div>
            </div>
          </div>
        </div>

        {/* Tile 2: Soil Moisture & Irrigation Balance */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Soil Moisture & Irrigation</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              Topsoil: {current.soilMoistureTop15cmPercent}% Moisture
            </div>

            <div className="mt-2.5 w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${current.soilMoistureTop15cmPercent}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {current.soilMoistureTop15cmPercent > 55
              ? 'Soil has adequate field capacity! Hold heavy canal watering today to prevent root rot.'
              : 'Soil moisture is dipping below 50%. Schedule light drip or furrow irrigation in early morning.'}
          </div>
        </div>

        {/* Tile 3: Upcoming Rainfall & 7-Day Monsoon Outlook */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <CloudRain className="w-4 h-4 text-sky-600" />
              <span>Upcoming 7-Day Rain Outlook</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {sevenDayRain} mm Expected
            </div>

            <div className="text-xs font-semibold text-white/80 mt-1">
              Past 24 hours: {current.rainfallPast24hMm} mm observed at station
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {Number(sevenDayRain) > 20
              ? 'Substantial rainfall forecast over the next week. Clear field drainage channels to avoid water stagnation.'
              : 'Mostly dry spell ahead. Rely on groundwater/canal irrigation to sustain vegetative crop stages.'}
          </div>
        </div>

        {/* Tile 4: Pest, Dew & Crop Risk Alert */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Dew & Crop Health</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              Dew Point: {displayTemp(current.dewPoint)}°
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Night humidity is {current.humidity}%. Morning dew formation is expected. Monitor wheat/mustard crops for early fungal blight or aphid colonies.
          </div>
        </div>

        {/* Tile 5: Seedbed Soil Temperature */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>Seedbed Soil Temperature</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {current.soilTempCelsius}°C at 5cm Depth
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Soil temperature is ideal for seed germination and root propagation. High solar radiation provides {current.firstLight} to {current.sunset} daylight.
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
   * 2. FITNESS ENTHUSIAST CUSTOMIZED TILES
   * ------------------------------------------------------------- */
  const renderFitnessGrid = () => {
    const bestHour = [...hourly].sort((a, b) => (b.runningScore || 0) - (a.runningScore || 0))[0];
    const hydrationRate = Math.round(
      450 + (current.temp > 25 ? (current.temp - 25) * 35 : 0) + (current.humidity > 70 ? 120 : 0)
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 select-none">
        {/* Tile 1: Best Time to Cycle & Run Today (Wide) */}
        <div className="sm:col-span-2 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider">
                <Bike className="w-4 h-4 text-blue-600" />
                <span>Best Time to Cycle & Run</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full border text-emerald-200 bg-emerald-950/60 border-emerald-400/40 shadow-xs">
                ⭐ Prime Slot: {bestHour?.time || '06:00 AM'}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Top Athletic Window: {bestHour?.time || '06:00 AM'}
            </div>

            <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed max-w-2xl">
              Conditions around {bestHour?.time || '06:00 AM'} feature a comfortable temperature of {displayTemp(bestHour?.temp || current.temp)}°, minimal solar radiation, and smooth air density. Exertion comfort score is {bestHour?.runningScore || 88}/100.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/15">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Cycling Score</div>
              <div className="text-base font-bold text-white mt-0.5">{bestHour?.runningScore || 88}/100</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Optimal cardio</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Hydration Intake</div>
              <div className="text-base font-bold text-white mt-0.5">{hydrationRate} ml/h</div>
              <div className="text-[10px] text-white/70">Water target</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Headwind Speed</div>
              <div className="text-base font-bold text-white mt-0.5">{current.windSpeed} km/h</div>
              <div className="text-[10px] text-white/70">{current.windDirectionText} flow</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Thermal Strain</div>
              <div className="text-base font-bold text-white mt-0.5">Feels {displayTemp(current.feelsLike)}°</div>
              <div className="text-[10px] text-white/70">WBGT adjusted</div>
            </div>
          </div>
        </div>

        {/* Tile 2: Wind & Cycling Resistance */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Wind className="w-4 h-4 text-sky-500" />
              <span>Cycling Wind Resistance</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {current.windSpeed} km/h
                </div>
                <div className="text-xs text-white/70 font-medium mt-0.5">
                  Flow: {current.windDirectionText} · Gusts: {current.windGust} km/h
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-600">
                <Compass
                  className="w-6 h-6 transition-transform duration-500"
                  style={{ transform: `rotate(${current.windDirectionDeg}deg)` }}
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {current.windSpeed < 15
              ? 'Low aerodynamic resistance! Great for fast sprint intervals and outdoor time-trials.'
              : 'Moderate headwind! Ride in an aero drop position; watch out for crosswinds on highway bridges.'}
          </div>
        </div>

        {/* Tile 3: Sweat Rate & Hydration Target */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <span>Sweat Rate & Hydration</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {hydrationRate} ml / hour of exertion
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Humidity is {current.humidity}%. Take 2-3 sips of electrolyte-enhanced water every 15 minutes during rides to prevent cramping.
          </div>
        </div>

        {/* Tile 4: Thermal Load & WBGT Safety */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>Thermal Exertion Load</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              Feels Like {displayTemp(current.feelsLike)}°
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {current.feelsLike > 32
              ? 'Elevated heat index. Avoid high-intensity zone 4/5 intervals in direct midday sunshine.'
              : 'Comfortable thermal envelope! Full aerobic capacity can be safely utilized.'}
          </div>
        </div>

        {/* Tile 5: Sun & Skin UV Defense */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Sun & UV Protection</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              UV {current.uvIndex} · {current.uvIndex >= 6 ? 'High Solar Radiation' : 'Mild Sun'}
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Apply sweat-resistant SPF 30+ sports sunscreen and wear UV-filtering cycling sunglasses.
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
   * 3. PARENT (KIDS & SCHOOL) CUSTOMIZED TILES
   * ------------------------------------------------------------- */
  const renderParentGrid = () => {
    const afternoonHour = hourly.find((h) => h.hour === 16) || hourly[0] || { kidsPlayScore: 80, temp: (current.temp ?? 28) - 2 };
    const kidsScore = afternoonHour.kidsPlayScore || 80;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 select-none">
        {/* Tile 1: Best Time for Kids Outdoor Play (Wide) */}
        <div className="sm:col-span-2 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider">
                <Baby className="w-4 h-4 text-amber-500" />
                <span>Best Time for Kids Outdoor Play</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full border text-emerald-200 bg-emerald-950/60 border-emerald-400/40 shadow-xs">
                ⭐ 4:30 PM - 6:30 PM
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Late Afternoon Park Window (Score {kidsScore}/100)
            </div>

            <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed max-w-2xl">
              Between 4:30 PM and 6:30 PM, the harsh midday sun subsides, temperatures drop to a comfortable {displayTemp(afternoonHour.temp)}°, and UV radiation drops below 3. Perfect for running, slides, and cycling in the park!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/15">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Park Temp</div>
              <div className="text-base font-bold text-white mt-0.5">{displayTemp(afternoonHour.temp)}°</div>
              <div className="text-[10px] text-white/70">At 4:30 PM</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Playground Rain</div>
              <div className="text-base font-bold text-white mt-0.5">{afternoonHour.pop}%</div>
              <div className="text-[10px] text-white/70">Chance of rain</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Sunburn Danger</div>
              <div className="text-base font-bold text-white mt-0.5">Low</div>
              <div className="text-[10px] text-white/70">After 4:30 PM</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Air Safety</div>
              <div className="text-base font-bold text-white mt-0.5">Safe</div>
              <div className="text-[10px] text-emerald-600 font-semibold">For sports</div>
            </div>
          </div>
        </div>

        {/* Tile 2: School Transit & Backpack Checklist */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Shirt className="w-4 h-4 text-indigo-500" />
              <span>School Bag & Clothes Checklist</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {isRainy ? 'Pack Umbrella & Raincoat ☔' : 'Light Cotton Uniform 👕'}
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed space-y-1">
            <div>• 💧 <strong>Water bottle:</strong> Pack filled cold water.</div>
            <div>• 🧢 <strong>Cap:</strong> Good for outdoor assembly.</div>
            <div>• 🧥 <strong>Attire:</strong> {current.temp > 28 ? 'Light breathable cotton' : 'Light sweater for early morning transit'}.</div>
          </div>
        </div>

        {/* Tile 3: Sun & UV Protection for Children */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Children Sun Protection</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              Peak UV: {current.uvIndex} ({current.uvIndex >= 6 ? 'High' : 'Moderate'})
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {current.uvIndex >= 6
              ? 'Apply SPF 30 sunscreen before noon recess. Encourage playing in shaded areas under trees or awnings.'
              : 'Mild UV level today. Kids can safely enjoy playtime without risk of sunburn.'}
          </div>
        </div>

        {/* Tile 4: Air Quality for Young Lungs */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Air Quality for Young Lungs</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              AQI {aqi} · {aqi <= 100 ? 'Clean & Fresh' : 'Moderate'}
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {aqi <= 100
              ? 'Air is clean! Great for running games, football, and outdoor sports without coughing.'
              : 'Moderate dust in the air. Remind kids to drink water after high-energy running.'}
          </div>
        </div>

        {/* Tile 5: Umbrella & Rain Alert */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Umbrella className="w-4 h-4 text-blue-500" />
              <span>School Drop-off & Rain</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {rainChance > 30 ? `${rainChance}% Rain Chance` : 'No Rain Expected'}
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {isRainy
              ? 'Rain is falling now! Put on rain boots and carry an umbrella.'
              : rainChance > 30
              ? 'Passing showers possible in afternoon. Slip a small folding umbrella in the school backpack.'
              : 'Clear skies for transit! No rain gear needed today.'}
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
   * 4. HEALTH-CONSCIOUS (CLEAN AIR & RESPIRATORY) TILES
   * ------------------------------------------------------------- */
  const renderHealthGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 select-none">
        {/* Tile 1: Safe Breathing & Ventilation Schedule (Wide) */}
        <div className="sm:col-span-2 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Safe Breathing & Ventilation Windows</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full border text-cyan-200 bg-cyan-950/60 border-cyan-400/40 shadow-xs">
                🌿 Best Air: 1:30 PM - 5:00 PM
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Midday Thermal Eddy Dispersal Peak
            </div>

            <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed max-w-2xl">
              Solar radiation creates vertical convection eddies in the afternoon, lifting surface particulate smog. Open windows for fresh air between 1:30 PM and 4:30 PM. Keep windows sealed in early morning when temperature inversion traps exhaust fumes.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/15">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">PM2.5 (Fine)</div>
              <div className="text-base font-bold text-white mt-0.5">{current.pm25} µg/m³</div>
              <div className="text-[10px] text-white/70">Limit: 30 µg/m³</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">PM10 (Coarse)</div>
              <div className="text-base font-bold text-white mt-0.5">{current.pm10} µg/m³</div>
              <div className="text-[10px] text-white/70">Limit: 60 µg/m³</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Ozone (O₃)</div>
              <div className="text-base font-bold text-white mt-0.5">{current.o3} µg/m³</div>
              <div className="text-[10px] text-white/70">Photochemical</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Mask Guidance</div>
              <div className="text-base font-bold text-white mt-0.5">{aqi > 200 ? 'N95 Needed' : 'Normal / Optional'}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Respiratory safety</div>
            </div>
          </div>
        </div>

        {/* Tile 2: Air Quality Index Gauge */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>National AQI Rating</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              AQI {aqi} · {current.aqiStatus}
            </div>

            <div className="mt-2.5 w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-600 relative overflow-hidden">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-slate-900"
                style={{ left: `${Math.min(95, (aqi / 400) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {aqi <= 100
              ? 'Air quality is satisfactory. Safe for outdoor cardio and morning brisk walking.'
              : 'Elevated particle levels. Individuals with asthma or bronchitis should limit strenuous outdoor activity.'}
          </div>
        </div>

        {/* Tile 3: Pulmonary & Respiratory Strain */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Airway Strain Index</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {aqi > 200 ? 'Elevated Strain' : 'Low Irritation'}
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Operate home HEPA air purifiers in bedroom. Keep saline nasal spray handy if experiencing dry throat or sinus irritation.
          </div>
        </div>

        {/* Tile 4: Safe Sunlight & Vitamin D */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Vitamin D Sunlight Window</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              UV {current.uvIndex} · Safe Exposure 20-30 min
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Early morning sunlight between 07:30 and 09:00 AM provides natural Vitamin D synthesis without excessive UV erythema damage.
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
   * 5. COMMUTER CUSTOMIZED TILES
   * ------------------------------------------------------------- */
  const renderCommuterGrid = () => {
    const visKm = (current.visibilityMeters / 1000).toFixed(1);
    const sprayRisk = current.rainfallPast24hMm > 10 || current.rainfallRateMmHr > 2;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 select-none">
        {/* Tile 1: Peak-Hour Transit & Road Spray Index (Wide) */}
        <div className="sm:col-span-2 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider">
                <Car className="w-4 h-4 text-indigo-600" />
                <span>Peak-Hour Commute Forecast</span>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  sprayRisk
                    ? 'text-amber-200 bg-amber-950/60 border-amber-400/40 shadow-xs'
                    : 'text-emerald-200 bg-emerald-950/60 border-emerald-400/40 shadow-xs'
                }`}
              >
                {sprayRisk ? '⚠️ Wet Tarmac / Slow Transit' : '🚗 Clear Roads & Fast Transit'}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Morning Rush (8-10 AM) & Evening (5-8 PM)
            </div>

            <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed max-w-2xl">
              Surface visibility is {visKm} km. {sprayRisk ? 'Tarmac friction is compromised by rain puddles. Increase vehicle following distance to 4 seconds.' : 'Roads are dry and stable across arterial flyovers. Normal transit speeds.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/15">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Optical Visibility</div>
              <div className="text-base font-bold text-white mt-0.5">{visKm} km</div>
              <div className="text-[10px] text-emerald-600 font-semibold">{current.visibilityMeters > 3000 ? 'Clear line of sight' : 'Fog present'}</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Road Spray Risk</div>
              <div className="text-base font-bold text-white mt-0.5">{sprayRisk ? 'Moderate' : 'Low'}</div>
              <div className="text-[10px] text-white/70">Traction safety</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Two-Wheeler Safety</div>
              <div className="text-base font-bold text-white mt-0.5">{current.windSpeed > 25 ? 'High Crosswinds' : 'Safe & Stable'}</div>
              <div className="text-[10px] text-white/70">Bike balance</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Rain Umbrella</div>
              <div className="text-base font-bold text-white mt-0.5">{isRainy ? 'Essential' : 'Not needed'}</div>
              <div className="text-[10px] text-white/70">Transit gear</div>
            </div>
          </div>
        </div>

        {/* Tile 2: Road Surface Visibility */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Surface Visibility</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {visKm} km Distance
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            {current.visibilityMeters < 2000
              ? 'Dense mist or smog restricting highway visibility. Switch on low-beam headlights.'
              : 'Clear atmospheric visibility across ring roads and highways.'}
          </div>
        </div>

        {/* Tile 3: Two-Wheeler & Bike Rider Safety */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Wind className="w-4 h-4 text-sky-500" />
              <span>Two-Wheeler Crosswinds</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              {current.windSpeed} km/h (Gusts: {current.windGust} km/h)
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Safe balance conditions for scooters and motorcycles. Maintain steady grip on elevated highway corridors.
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
   * 6. TRAVELLER & OTHER PERSONAS
   * ------------------------------------------------------------- */
  const renderTravellerGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 select-none">
        {/* Tile 1: Sightseeing Window (Wide) */}
        <div className="sm:col-span-2 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider">
                <Compass className="w-4 h-4 text-violet-600" />
                <span>Best Sightseeing & Outing Hours</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full border text-emerald-200 bg-emerald-950/60 border-emerald-400/40 shadow-xs">
                ✨ 08:30 - 11:30 AM & 04:00 - 06:30 PM
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Comfortable Walking & Photo Weather
            </div>

            <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed max-w-2xl">
              Current ambient temperature is {displayTemp(current.temp)}° with gentle breeze. Midday heat peaks between 12:00 and 3:00 PM; plan heritage walks, outdoor markets, and monument visits during morning or golden evening hours.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/15">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Walking Comfort</div>
              <div className="text-base font-bold text-white mt-0.5">High</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Pleasant outdoor</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Flight / Rail Risk</div>
              <div className="text-base font-bold text-white mt-0.5">Zero Delays</div>
              <div className="text-[10px] text-white/70">Airport clear</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Packing Gear</div>
              <div className="text-base font-bold text-white mt-0.5">Sun Hat + Shoes</div>
              <div className="text-[10px] text-white/70">Comfortable shoes</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="text-[10px] text-white/70 font-medium">Sunset View</div>
              <div className="text-base font-bold text-white mt-0.5">{current.sunset}</div>
              <div className="text-[10px] text-white/70">Golden hour</div>
            </div>
          </div>
        </div>

        {/* Tile 2: What to Pack in Luggage */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Shirt className="w-4 h-4 text-purple-500" />
              <span>Travel Packing Recommendations</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              Light Cotton + Sunglasses 🕶️
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            High of {displayTemp(daily[0]?.maxTemp || (current.temp ?? 28) + 4)}°. Pack breathable day wear, sunglasses, and a reusable water bottle for city exploration.
          </div>
        </div>

        {/* Tile 3: 7-Day Travel Weather Outlook */}
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Multi-Day Trip Stability</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-white">
              Stable Weather Week
            </div>
          </div>

          <div className="text-xs text-white/90 mt-3 pt-3 border-t border-white/15 leading-relaxed">
            Synoptic forecast indicates stable weather conditions with low rain interruption throughout your upcoming stay.
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------
   * STANDARD METRICS (Shown as optional expandable below)
   * ------------------------------------------------------------- */
  const renderStandardMetrics = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-white/15 animate-in fade-in duration-300">
        <div className="p-4 rounded-2xl bg-white/15 border border-white/15">
          <div className="text-xs font-semibold text-white/70 mb-1">Air Quality (AQI)</div>
          <div className="text-2xl font-bold text-white">{aqi}</div>
          <div className="text-xs text-white/80 mt-1">{current.aqiStatus}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/15 border border-white/15">
          <div className="text-xs font-semibold text-white/70 mb-1">Wind & Direction</div>
          <div className="text-2xl font-bold text-white">{current.windSpeed} km/h</div>
          <div className="text-xs text-white/80 mt-1">{current.windDirectionText} (Gusts {current.windGust} km/h)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/15 border border-white/15">
          <div className="text-xs font-semibold text-white/70 mb-1">Humidity & Dew Point</div>
          <div className="text-2xl font-bold text-white">{current.humidity}%</div>
          <div className="text-xs text-white/80 mt-1">Dew point: {displayTemp(current.dewPoint)}°</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/15 border border-white/15">
          <div className="text-xs font-semibold text-white/70 mb-1">Sunset & Sunrise</div>
          <div className="text-2xl font-bold text-white">{current.sunset}</div>
          <div className="text-xs text-white/80 mt-1">Sunrise: {current.sunrise}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/15 border border-white/15">
          <div className="text-xs font-semibold text-white/70 mb-1">Visibility</div>
          <div className="text-2xl font-bold text-white">{(current.visibilityMeters / 1000).toFixed(0)} km</div>
          <div className="text-xs text-white/80 mt-1">Atmospheric clarity</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/15 border border-white/15">
          <div className="text-xs font-semibold text-white/70 mb-1">Barometric Pressure</div>
          <div className="text-2xl font-bold text-white">{current.pressureHpa} hPa</div>
          <div className="text-xs text-white/80 mt-1">Sea level atmospheric pressure</div>
        </div>
      </div>
    );
  };

  // Select the appropriate customized view based on the active user customization
  const renderCustomizedGrid = () => {
    switch (activeProfileId) {
      case 'farmer':
        return renderFarmerGrid();
      case 'fitness_enthusiast':
        return renderFitnessGrid();
      case 'health_conscious':
        return renderHealthGrid();
      case 'commuter':
        return renderCommuterGrid();
      case 'traveller':
      case 'beachgoer':
      case 'event_planner':
        return renderTravellerGrid();
      case 'parent':
      default:
        return renderParentGrid();
    }
  };

  return (
    <div className="space-y-4">
      {/* The Dynamically Customized Grid Tailored Exclusively for This User */}
      {renderCustomizedGrid()}

      {/* Optional Clean Toggle to Peek at Raw Atmospheric Metrics if Desired */}
      <div className="pt-2 text-center select-none">
        <button
          onClick={() => setShowStandardMetrics(!showStandardMetrics)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white/90 hover:text-white text-xs font-semibold border border-white/20 shadow-xs transition-all cursor-pointer backdrop-blur-xl"
        >
          <Layers className="w-3.5 h-3.5 text-white/60" />
          <span>{showStandardMetrics ? 'Hide Standard Weather Readings' : 'Show Standard Readings (Wind, Humidity, Pressure)'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showStandardMetrics ? 'rotate-180' : ''}`} />
        </button>

        {showStandardMetrics && renderStandardMetrics()}
      </div>
    </div>
  );
};
