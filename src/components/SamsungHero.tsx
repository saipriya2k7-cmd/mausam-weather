import React, { useState } from 'react';
import { MapPin, ChevronDown, Search, Crosshair, Loader2, Sparkles } from 'lucide-react';
import { WeatherData, CityProfile, ProfileId } from '../types/weather';
import { CITIES } from '../data/cities';

interface SamsungHeroProps {
  weather: WeatherData;
  city: CityProfile;
  tempUnit: 'C' | 'F';
  onSelectCity: (city: CityProfile) => void;
  onAutoDetect: () => void;
  isLocating?: boolean;
  activeProfileId?: ProfileId;
  isFetching?: boolean;
}

export const SamsungHero: React.FC<SamsungHeroProps> = ({
  weather,
  city,
  tempUnit,
  onSelectCity,
  onAutoDetect,
  isLocating = false,
  activeProfileId = 'farmer',
  isFetching = false,
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [search, setSearch] = useState('');

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const high = displayTemp(weather.daily?.[0]?.maxTemp ?? (weather.current?.temp ?? 28) + 4);
  const low = displayTemp(weather.daily?.[0]?.minTemp ?? (weather.current?.temp ?? 28) - 5);
  const current = displayTemp(weather.current?.temp ?? 28);
  const feelsLike = displayTemp(weather.current?.feelsLike ?? 28);

  const filteredCities = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  const conditionCode = weather.current?.conditionCode || 'partly_cloudy';
  const isRain = conditionCode === 'rain' || conditionCode === 'heavy_rain';
  const isStorm = conditionCode === 'thunderstorm';
  const condStr = (weather.current?.condition || 'Partly Cloudy').toLowerCase();
  const isNight = condStr.includes('night');

  // Customized Advice according to user's selected persona
  const getCustomizedAdvice = () => {
    const isRainy = isRain || isStorm;
    const temp = weather.current.temp;

    switch (activeProfileId) {
      case 'farmer': {
        const windSafe = weather.current.windSpeed <= 14;
        if (isRainy) {
          return {
            icon: '🌧️',
            label: 'Farmer Advisory',
            text: 'Rainfall active! Hold off on chemical spraying or fertilizer till soil drains.',
            badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-400/40',
          };
        }
        return {
          icon: '🌾',
          label: 'Farmer Best Time',
          text: windSafe
            ? `Optimal planting & spray: Morning 6:00 - 9:30 AM (Calm winds at ${weather.current.windSpeed} km/h, soil temp ${weather.current.soilTempCelsius}°C).`
            : `Breezy winds (${weather.current.windSpeed} km/h)! Postpone spray operations to prevent drift.`,
          badgeBg: 'bg-amber-900/60 text-amber-200 border-amber-400/40',
        };
      }

      case 'fitness_enthusiast': {
        if (isRainy) {
          return {
            icon: '🚴',
            label: 'Cycling Warning',
            text: 'Wet roads & reduced traction. Shift to indoor trainer or take cautious paved routes.',
            badgeBg: 'bg-blue-900/60 text-blue-200 border-blue-400/40',
          };
        }
        if (temp > 33) {
          return {
            icon: '🚴',
            label: 'Cycling Window',
            text: 'Hot midday! Best time to cycle: Early morning 6:00 - 8:00 AM or evening after sunset.',
            badgeBg: 'bg-rose-900/60 text-rose-200 border-rose-400/40',
          };
        }
        return {
          icon: '🚴',
          label: 'Cycling Window',
          text: `Ideal time to cycle: Morning 6:30 - 8:30 AM (Comfortable ${displayTemp(temp - 3)}°${tempUnit}, dry tarmac, calm breeze).`,
          badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-400/40',
        };
      }

      case 'parent': {
        if (isRainy) {
          return {
            icon: '☔',
            label: 'Kids Care',
            text: 'Rain outside! Pack raincoat & boots; indoor board games or crafts recommended.',
            badgeBg: 'bg-indigo-900/60 text-indigo-200 border-indigo-400/40',
          };
        }
        return {
          icon: '🎈',
          label: 'Kids Comfort',
          text: 'Great weather for outdoor playground! Best play hours: 4:30 - 6:30 PM with gentle sun.',
          badgeBg: 'bg-sky-900/60 text-sky-200 border-sky-400/40',
        };
      }

      case 'health_conscious': {
        const aqi = weather.current.aqi;
        return {
          icon: '🌿',
          label: 'Air Quality Guide',
          text:
            aqi > 150
              ? `AQI is ${aqi} (Unhealthy). Keep windows closed; wear an N95 mask outside.`
              : `AQI is ${aqi} (Moderate). Best outdoor ventilation window: 11:00 AM - 3:00 PM.`,
          badgeBg: 'bg-teal-900/60 text-teal-200 border-teal-400/40',
        };
      }

      case 'commuter': {
        if (isRainy || isStorm) {
          return {
            icon: '🚗',
            label: 'Commute Alert',
            text: 'Wet roads & slowed traffic. Leave 15 mins early and maintain extra braking distance.',
            badgeBg: 'bg-amber-900/60 text-amber-200 border-amber-400/40',
          };
        }
        const visKm = Math.round(weather.current.visibilityMeters / 1000);
        return {
          icon: '🚗',
          label: 'Commuter Flow',
          text: `Clear road visibility (${visKm} km). Peak morning commute looks smooth.`,
          badgeBg: 'bg-slate-900/60 text-slate-200 border-slate-400/40',
        };
      }

      case 'traveller': {
        return {
          icon: '✈️',
          label: 'Travel Outlook',
          text: `Pleasant travel weather today (${current}°${tempUnit}). Pack light breathable layers.`,
          badgeBg: 'bg-cyan-900/60 text-cyan-200 border-cyan-400/40',
        };
      }

      default:
        return null;
    }
  };

  const advice = getCustomizedAdvice();

  return (
    <div className="relative pt-4 sm:pt-6 pb-2 px-2 select-none overflow-hidden">
      {/* Top Location Selector & Telemetry Status Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 mb-4">
        {/* Luminous, High-End Location Selector Button */}
        <button
          onClick={() => setShowLocationModal(true)}
          className="group relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-98 backdrop-blur-2xl border border-white/25 hover:border-cyan-300/60 transition-all duration-300 cursor-pointer shadow-[0_8px_28px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_32px_rgba(56,189,248,0.35)] text-left shrink-0"
          title="Click to change city or use GPS location"
        >
          {/* Glowing Squircle Pin Icon */}
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500/40 via-sky-400/30 to-blue-600/40 border border-cyan-300/40 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.5)] group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(56,189,248,0.8)] transition-all shrink-0">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-200 fill-cyan-400/30" />
          </div>

          {/* Location Names */}
          <div className="leading-tight">
            <div className="text-[10px] sm:text-[11px] font-semibold text-cyan-200/90 tracking-wide flex items-center gap-1.5">
              <span>{city.state}</span>
              <span className="w-1 h-1 rounded-full bg-cyan-300/80" />
              <span className="text-[9px] font-normal text-white/70 group-hover:text-cyan-200 transition-colors hidden sm:inline">Change</span>
            </div>
            <div className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 mt-0.5">
              <span>{city.name}</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-200/80 group-hover:text-cyan-200 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </button>

        {/* Live Observatory Telemetry Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-white/95 font-medium bg-black/30 backdrop-blur-xl border border-white/15 px-2.5 sm:px-3.5 py-1.5 rounded-full shadow-xs shrink-0 ml-auto sm:ml-0">
          {isFetching ? (
            <>
              <Loader2 className="w-3 h-3 text-cyan-300 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="tracking-wide font-medium">Live Weather</span>
            </>
          )}
        </div>
      </div>

      {/* Main Temperature and Condition row with Graphic Illustration on Right */}
      <div className="flex items-start justify-between relative min-h-[130px] sm:min-h-[160px] md:min-h-[175px]">
        {/* Left Side: Massive Temperature & Details */}
        <div className="z-10 pt-1">
          <div className="text-6xl sm:text-7xl md:text-8xl font-normal tracking-tight text-white font-sans drop-shadow-sm leading-none flex items-start">
            <span>{current}</span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-light -mt-1 ml-0.5">°</span>
          </div>

          <div className="text-lg sm:text-xl md:text-2xl font-medium text-white/95 mt-2 sm:mt-2.5 drop-shadow-xs">
            {weather.current.condition}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 mt-1.5 sm:mt-2">
            <span className="flex items-center">
              <span>↑ {high}°</span>
              <span className="mx-1">/</span>
              <span>↓ {low}°</span>
            </span>
            <span className="text-white/60">•</span>
            <span>Feels like {feelsLike}°</span>
          </div>
        </div>

        {/* Right Side: Scenic Character & Hill Illustration (Responsive on phones & tablets) */}
        <div className="absolute right-0 bottom-0 pointer-events-none w-36 sm:w-56 md:w-68 h-28 sm:h-40 md:h-48 flex items-end justify-end opacity-90 sm:opacity-100">
          <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-sm">
            <defs>
              <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#48bb78" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#276749" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#68d391" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2f855a" stopOpacity="0.9" />
              </linearGradient>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbd38d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#dd6b20" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Sun or Moon in Background */}
            {isNight ? (
              <g transform="translate(185, 25)">
                <circle cx="16" cy="16" r="14" fill="#faf089" />
                <circle cx="21" cy="12" r="13" fill="#1a365d" opacity="0.9" />
                <circle cx="0" cy="5" r="1.5" fill="#ffffff" opacity="0.8" />
                <circle cx="35" cy="10" r="1.2" fill="#ffffff" opacity="0.7" />
              </g>
            ) : (
              <g transform="translate(180, 20)">
                <circle cx="18" cy="18" r="28" fill="url(#sunGlow)" />
                <circle cx="18" cy="18" r="14" fill="#f6e05e" />
              </g>
            )}

            {/* Distant rolling hill */}
            <path d="M 40 180 Q 130 100 240 128 L 240 180 Z" fill="url(#hillBack)" />

            {/* Front grassy hill */}
            <path
              d="M 10 180 Q 95 120 185 140 Q 220 148 240 180 Z"
              fill="url(#hillGrad)"
            />

            {/* Grassy blades */}
            <path d="M 120 138 L 123 128 M 125 140 L 129 131" stroke="#9ae6b4" strokeWidth="2" strokeLinecap="round" />
            <path d="M 165 144 L 169 134 M 172 147 L 176 137" stroke="#9ae6b4" strokeWidth="2" strokeLinecap="round" />

            {/* Rain droplets if rainy */}
            {(isRain || isStorm) && (
              <g stroke="#bee3f8" strokeWidth="1.5" strokeLinecap="round" opacity="0.75">
                <line x1="80" y1="50" x2="72" y2="70" />
                <line x1="120" y1="40" x2="112" y2="60" />
                <line x1="160" y1="45" x2="152" y2="65" />
                <line x1="100" y1="80" x2="92" y2="100" />
                <line x1="140" y1="75" x2="132" y2="95" />
              </g>
            )}

            {/* Minimalist Scenic Character walking */}
            <g transform="translate(142, 62)">
              {/* Head & Hat */}
              <circle cx="20" cy="10" r="5" fill="#fbd38d" />
              <path d="M 13 8 Q 20 4 27 8 L 28 10 L 12 10 Z" fill="#dd6b20" />

              {/* Umbrella if rainy */}
              {(isRain || isStorm) && (
                <g transform="translate(5, -12)">
                  <path d="M 4 12 Q 22 -3 40 12 Z" fill="#3182ce" />
                  <line x1="22" y1="12" x2="22" y2="28" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 22 28 Q 22 32 18 32" stroke="#718096" strokeWidth="2" fill="none" strokeLinecap="round" />
                </g>
              )}

              {/* Yellow T-shirt body */}
              <path d="M 15 15 L 25 15 L 23 35 L 17 35 Z" fill="#ecc94b" />
              {/* Arm swinging */}
              <path d="M 15 18 L 8 28" stroke="#ecc94b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 25 18 L 30 26" stroke="#fbd38d" strokeWidth="2" strokeLinecap="round" />
              {/* Blue shorts */}
              <path d="M 16 35 L 24 35 L 25 45 L 15 45 Z" fill="#3182ce" />
              {/* Legs walking */}
              <path d="M 18 45 L 14 62" stroke="#fbd38d" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 22 45 L 28 60" stroke="#fbd38d" strokeWidth="2.5" strokeLinecap="round" />
              {/* Shoes */}
              <ellipse cx="12" cy="63" rx="3.5" ry="1.5" fill="#2d3748" />
              <ellipse cx="29" cy="61" rx="3.5" ry="1.5" fill="#2d3748" />
            </g>
          </svg>
        </div>
      </div>

      {/* Tailored Advice Banner directly underneath */}
      {advice && (
        <div
          className={`mt-2.5 p-3 rounded-2xl border backdrop-blur-xl shadow-xs flex items-center gap-2.5 text-xs transition-all ${advice.badgeBg}`}
        >
          <span className="text-base shrink-0">{advice.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="font-bold mr-1.5">{advice.label}:</span>
            <span className="font-normal opacity-95">{advice.text}</span>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950/85 backdrop-blur-2xl rounded-3xl p-5 border border-white/20 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <h3 className="font-bold text-lg text-white">Choose Location</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="my-3">
              <button
                onClick={() => {
                  onAutoDetect();
                  setShowLocationModal(false);
                }}
                disabled={isLocating}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/25 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting GPS Location...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4" />
                    <span>Use Current GPS Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Indian city or state..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
              {filteredCities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCity(c);
                    setShowLocationModal(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    c.id === city.id
                      ? 'bg-white/25 text-white font-bold border border-white/30'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-[10px] text-white/50">{c.state}</div>
                  </div>
                  {c.id === city.id && <span className="text-cyan-300 font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
