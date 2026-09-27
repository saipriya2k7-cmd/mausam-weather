import React from 'react';
import { MapPin, Navigation, Sparkles, Loader2, Radio } from 'lucide-react';
import { WeatherData, CityProfile, ProfileId } from '../types/weather';

interface AppleHeroHeaderProps {
  weather: WeatherData;
  city: CityProfile;
  tempUnit: 'C' | 'F';
  isAutoDetected?: boolean;
  activeProfileId?: ProfileId;
  isFetching?: boolean;
}

export const AppleHeroHeader: React.FC<AppleHeroHeaderProps> = ({
  weather,
  city,
  tempUnit,
  isAutoDetected,
  activeProfileId = 'parent',
  isFetching = false,
}) => {
  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const high = displayTemp(weather.daily[0]?.maxTemp ?? weather.current.temp + 4);
  const low = displayTemp(weather.daily[0]?.minTemp ?? weather.current.temp - 5);
  const current = displayTemp(weather.current.temp);

  // Profile-customized advice banner (e.g. best time to plant for farmer, best time to cycle for athlete)
  const getCustomizedAdvice = () => {
    const code = weather.current.conditionCode;
    const temp = weather.current.temp;
    const isRain = code === 'rain' || code === 'heavy_rain' || code === 'thunderstorm';

    switch (activeProfileId) {
      case 'farmer': {
        const windSafe = weather.current.windSpeed <= 14;
        if (isRain) {
          return {
            icon: '🌧️',
            label: 'Farmer Alert',
            text: 'Rainfall active! Hold off on chemical spraying or fertilizer until soil drains.',
            bg: 'bg-emerald-100/95 text-emerald-950 border-emerald-300',
          };
        }
        return {
          icon: '🌱',
          label: 'Farming Tip',
          text: windSafe
            ? `Best time to plant & spray: Morning 6:00 - 9:30 AM (Calm winds at ${weather.current.windSpeed} km/h, seedbed ${weather.current.soilTempCelsius}°C).`
            : `High winds (${weather.current.windSpeed} km/h)! Postpone spray operations to prevent drift; check soil moisture.`,
          bg: 'bg-amber-100/95 text-amber-950 border-amber-300',
        };
      }

      case 'fitness_enthusiast': {
        if (isRain) {
          return {
            icon: '🌧️',
            label: 'Cycling & Running',
            text: 'Wet roads & reduced tire grip. Best for indoor trainer / treadmill workout today!',
            bg: 'bg-blue-100/95 text-blue-950 border-blue-300',
          };
        }
        const bestHour = weather.hourly.find((h) => (h.runningScore || 0) >= 80) || weather.hourly[0];
        return {
          icon: '🚴',
          label: 'Fitness Schedule',
          text: `Best time to cycle & run: Around ${bestHour?.time || '06:00 AM'} (Crisp air, tailwind, comfort score ${bestHour?.runningScore || 85}/100).`,
          bg: 'bg-emerald-100/95 text-emerald-950 border-emerald-300',
        };
      }

      case 'health_conscious': {
        const isAqiClean = weather.current.aqi < 100;
        return {
          icon: '🌿',
          label: 'Air & Breathing',
          text: isAqiClean
            ? `Air is fresh (AQI ${weather.current.aqi})! Best time for outdoor walks: 1:30 PM - 5:00 PM.`
            : `AQI is ${weather.current.aqi} (${weather.current.aqiStatus}). Keep windows closed in morning; ventilate midday only.`,
          bg: 'bg-teal-100/95 text-teal-950 border-teal-300',
        };
      }

      case 'commuter': {
        const visKm = (weather.current.visibilityMeters / 1000).toFixed(0);
        return {
          icon: '🚗',
          label: 'Commute Outlook',
          text: isRain
            ? `Wet tarmac & road spray! Allow +15 mins for transit; ride carefully.`
            : `Clear roads! Visibility is ${visKm} km. Peak morning and evening transit are smooth.`,
          bg: 'bg-indigo-100/95 text-indigo-950 border-indigo-300',
        };
      }

      case 'traveller': {
        return {
          icon: '✈️',
          label: 'Travel & Outing',
          text: isRain
            ? 'Carry a travel umbrella! Sightseeing best in indoor museums and cafes today.'
            : `Pleasant ${temp}°C! Best sightseeing & photography window: 8:00 - 11:00 AM & 4:00 - 6:30 PM.`,
          bg: 'bg-violet-100/95 text-violet-950 border-violet-300',
        };
      }

      case 'beachgoer': {
        return {
          icon: '🌊',
          label: 'Coastal & Beach',
          text: `Sea breeze at ${weather.current.windSpeed} km/h. Best beach walk: 5:15 PM - 6:30 PM!`,
          bg: 'bg-cyan-100/95 text-cyan-950 border-cyan-300',
        };
      }

      case 'event_planner': {
        return {
          icon: '🎪',
          label: 'Event Setup',
          text: weather.current.windGust < 25
            ? 'Wind gusts safe (<25 km/h) for canopies and outdoor setups. Great weather window!'
            : `Breezy gusts up to ${weather.current.windGust} km/h recorded. Secure tent pegs.`,
          bg: 'bg-purple-100/95 text-purple-950 border-purple-300',
        };
      }

      case 'parent':
      default: {
        if (isRain) {
          return {
            icon: '🌧️',
            label: 'Kids & School',
            text: 'Rainy day! Don’t forget the umbrella and waterproof shoes for school drop-off!',
            bg: 'bg-blue-100/95 text-blue-950 border-blue-300',
          };
        }
        return {
          icon: '🧒',
          label: 'Kids & School',
          text: `Best time for kids park play: 4:30 PM - 6:30 PM (Comfortable ${displayTemp(weather.current.temp - 2)}°, mild sun, great for bicycling).`,
          bg: 'bg-emerald-100/95 text-emerald-950 border-emerald-300',
        };
      }
    }
  };

  const advice = getCustomizedAdvice();

  return (
    <div className="flex flex-col items-center justify-center text-center py-3 sm:py-5 select-none transition-all">
      {/* Live Sync Status Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-2xs text-[11px] font-semibold text-slate-700 mb-2">
        {isFetching ? (
          <>
            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Syncing Live Telemetry...</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Weather</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-500 font-normal">
              {weather.current.lastUpdatedTime || 'Updated just now'}
            </span>
          </>
        )}
      </div>

      {/* City & Station Subtitle */}
      <div className="flex items-center gap-2 text-slate-800 drop-shadow-xs">
        {isAutoDetected ? (
          <span className="p-1 rounded-full bg-blue-100 text-blue-700">
            <Navigation className="w-3.5 h-3.5 fill-blue-600 animate-pulse" />
          </span>
        ) : (
          <span className="p-1 rounded-full bg-slate-100 text-slate-700">
            <MapPin className="w-3.5 h-3.5" />
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
          {city.name}
        </h1>
      </div>

      <div className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5 flex items-center gap-2">
        <span>{city.state}</span>
        <span>·</span>
        <span>{city.hindiName}</span>
      </div>

      {/* Main Massive Temperature Display (Apple Signature Style) */}
      <div className="relative my-0.5 sm:my-1">
        <span className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tighter text-slate-900 drop-shadow-xs font-sans">
          {current}
        </span>
        <span className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-500 absolute top-2 -right-6 sm:-right-8">
          °
        </span>
      </div>

      {/* Weather Condition Description */}
      <div className="text-base sm:text-xl font-medium text-slate-800 capitalize tracking-wide">
        {weather.current.condition}
      </div>

      {/* High / Low Range */}
      <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600 mt-1">
        <span>High: {high}°</span>
        <span className="text-slate-300">•</span>
        <span>Low: {low}°</span>
        <span className="text-slate-300">•</span>
        <span>Feels like {displayTemp(weather.current.feelsLike)}°</span>
      </div>

      {/* Customized Advice Banner Tailored Specifically to the User's Persona */}
      <div className={`mt-3 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-xs transition-all max-w-xl text-left ${advice.bg}`}>
        <span className="text-xl shrink-0">{advice.icon}</span>
        <div>
          <span className="font-bold uppercase tracking-wider text-[10px] opacity-80 block">{advice.label}</span>
          <span>{advice.text}</span>
        </div>
      </div>
    </div>
  );
};
