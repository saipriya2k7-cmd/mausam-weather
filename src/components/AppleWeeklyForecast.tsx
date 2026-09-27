import React from 'react';
import {
  Calendar,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
} from 'lucide-react';
import { DailyData } from '../types/weather';

interface AppleWeeklyForecastProps {
  daily: DailyData[];
  tempUnit: 'C' | 'F';
  currentTemp?: number;
}

export const AppleWeeklyForecast: React.FC<AppleWeeklyForecastProps> = ({
  daily,
  tempUnit,
  currentTemp,
}) => {
  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const getConditionIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
      return <CloudLightning className="w-5 h-5 text-amber-500" />;
    }
    if (c.includes('heavy rain') || c.includes('downpour')) {
      return <CloudRain className="w-5 h-5 text-blue-600" />;
    }
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudDrizzle className="w-5 h-5 text-blue-500" />;
    }
    if (c.includes('partly') || c.includes('scattered')) {
      return <CloudSun className="w-5 h-5 text-amber-500" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className="w-5 h-5 text-slate-500" />;
    }
    return <Sun className="w-5 h-5 text-amber-500 fill-amber-400" />;
  };

  // Find overall min & max across the week for calibrated progress bar scale
  const globalMin = Math.min(...daily.map((d) => d.minTemp));
  const globalMax = Math.max(...daily.map((d) => d.maxTemp));
  const totalRange = Math.max(1, globalMax - globalMin);

  return (
    <div className="bg-white/75 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 sm:p-5 shadow-sm transition-all">
      {/* Apple style sub-header */}
      <div className="flex items-center gap-1.5 pb-3 border-b border-slate-200/50 mb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span>7-Day Forecast</span>
      </div>

      <div className="divide-y divide-slate-100/80">
        {daily.map((day, idx) => {
          const isToday = idx === 0;
          const leftPercent = ((day.minTemp - globalMin) / totalRange) * 100;
          const widthPercent = Math.max(12, ((day.maxTemp - day.minTemp) / totalRange) * 100);

          // Dot position for current temp on Today
          let currentDotPercent = 0;
          if (isToday && currentTemp !== undefined) {
            currentDotPercent = Math.min(
              100,
              Math.max(0, ((currentTemp - day.minTemp) / Math.max(1, day.maxTemp - day.minTemp)) * 100)
            );
          }

          return (
            <div
              key={idx}
              className="py-3 flex items-center justify-between gap-3 text-sm select-none"
            >
              {/* Day Name */}
              <div className="w-16 sm:w-20 font-semibold text-slate-900 truncate">
                {isToday ? 'Today' : day.dayName.slice(0, 3)}
              </div>

              {/* Weather Icon & Rain % */}
              <div className="flex items-center gap-1.5 w-16 justify-center">
                {getConditionIcon(day.condition)}
                {day.pop > 15 && (
                  <span className="text-[11px] font-bold text-blue-600">
                    {day.pop}%
                  </span>
                )}
              </div>

              {/* Min Temperature */}
              <div className="w-8 text-right font-medium text-slate-500 tabular-nums">
                {displayTemp(day.minTemp)}°
              </div>

              {/* Signature Apple Colored Temperature Range Bar */}
              <div className="flex-1 max-w-[150px] sm:max-w-[200px] h-1.5 bg-slate-200/70 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-500"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
                {/* Live dot for current temp if Today */}
                {isToday && currentTemp !== undefined && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-slate-900/30 rounded-full shadow-xs"
                    style={{
                      left: `calc(${leftPercent}% + (${widthPercent}% * ${currentDotPercent / 100}) - 5px)`,
                    }}
                  />
                )}
              </div>

              {/* Max Temperature */}
              <div className="w-8 font-semibold text-slate-900 tabular-nums text-left">
                {displayTemp(day.maxTemp)}°
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
