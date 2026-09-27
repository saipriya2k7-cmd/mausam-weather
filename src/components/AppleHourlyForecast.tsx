import React from 'react';
import {
  Clock,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Droplets,
  Bike,
  Baby,
  Sprout,
  HeartPulse,
} from 'lucide-react';
import { HourlyData, ProfileId } from '../types/weather';

interface AppleHourlyForecastProps {
  hourly: HourlyData[];
  tempUnit: 'C' | 'F';
  activeProfileId?: ProfileId;
}

export const AppleHourlyForecast: React.FC<AppleHourlyForecastProps> = ({
  hourly,
  tempUnit,
  activeProfileId = 'parent',
}) => {
  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const getConditionIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
      return <CloudLightning className="w-6 h-6 text-amber-500" />;
    }
    if (c.includes('heavy rain') || c.includes('downpour')) {
      return <CloudRain className="w-6 h-6 text-blue-600" />;
    }
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudDrizzle className="w-6 h-6 text-blue-500" />;
    }
    if (c.includes('partly') || c.includes('scattered')) {
      return <CloudSun className="w-6 h-6 text-amber-500" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className="w-6 h-6 text-slate-500" />;
    }
    return <Sun className="w-6 h-6 text-amber-500 fill-amber-400" />;
  };

  // Profile-specific subtitle in header
  const getSubHeader = () => {
    switch (activeProfileId) {
      case 'fitness_enthusiast':
        return '12-Hour Forecast & Cycling Suitability Score (0-100)';
      case 'farmer':
        return '12-Hour Forecast & Spray / Sowing Windows';
      case 'parent':
        return '12-Hour Forecast & Kids Playground Comfort';
      case 'health_conscious':
        return '12-Hour Forecast & Hourly Air Quality (AQI)';
      default:
        return '12-Hour Forecast';
    }
  };

  // Profile-specific hourly badge
  const renderHourlyCustomBadge = (h: HourlyData) => {
    switch (activeProfileId) {
      case 'fitness_enthusiast': {
        const score = h.runningScore || 75;
        const color = score >= 80 ? 'text-emerald-700 bg-emerald-50' : score >= 60 ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-50';
        return (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${color}`}>
            🚴 {score}
          </span>
        );
      }
      case 'farmer': {
        const windSafe = h.windSpeed <= 14;
        return (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-1 ${windSafe ? 'text-emerald-700 bg-emerald-50' : 'text-amber-800 bg-amber-50'}`}>
            {windSafe ? '🌱 Calm' : '💨 Drift'}
          </span>
        );
      }
      case 'parent': {
        const score = h.kidsPlayScore || 80;
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-1 text-slate-600 bg-slate-50">
            ⭐ {score}%
          </span>
        );
      }
      case 'health_conscious': {
        return (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${h.aqi < 100 ? 'text-teal-700 bg-teal-50' : 'text-orange-700 bg-orange-50'}`}>
            AQI {h.aqi}
          </span>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/75 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 sm:p-5 shadow-sm transition-all select-none">
      {/* Apple style sub-header with profile customization note */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{getSubHeader()}</span>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none select-none">
        {hourly.map((h, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-between min-w-[58px] sm:min-w-[66px] py-1 text-center shrink-0"
          >
            {/* Time label: "Now" for first entry, then formatted hour */}
            <span className="text-xs font-semibold text-slate-700">
              {idx === 0 ? 'Now' : h.time}
            </span>

            {/* Weather Icon & Rain % */}
            <div className="my-2.5 flex flex-col items-center gap-1">
              {getConditionIcon(h.condition)}
              {h.pop > 15 ? (
                <span className="text-[11px] font-bold text-blue-600 tracking-tight">
                  {h.pop}%
                </span>
              ) : (
                <span className="h-3" />
              )}
            </div>

            {/* Temperature */}
            <span className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              {displayTemp(h.temp)}°
            </span>

            {/* Custom profile metric pill */}
            {renderHourlyCustomBadge(h)}
          </div>
        ))}
      </div>
    </div>
  );
};
