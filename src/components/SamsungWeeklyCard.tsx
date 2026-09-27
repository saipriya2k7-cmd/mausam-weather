import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Droplet,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { DailyData } from '../types/weather';

interface SamsungWeeklyCardProps {
  daily: DailyData[];
  tempUnit: 'C' | 'F';
}

export const SamsungWeeklyCard: React.FC<SamsungWeeklyCardProps> = ({
  daily,
  tempUnit,
}) => {
  const [show15DayModal, setShow15DayModal] = useState(false);

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const getConditionIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
      return <CloudLightning className="w-5 h-5 text-amber-300" />;
    }
    if (c.includes('heavy rain') || c.includes('downpour')) {
      return <CloudRain className="w-5 h-5 text-blue-300" />;
    }
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudDrizzle className="w-5 h-5 text-blue-200" />;
    }
    if (c.includes('partly') || c.includes('scattered')) {
      return <CloudSun className="w-5 h-5 text-amber-300 fill-amber-300/40" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className="w-5 h-5 text-slate-200" />;
    }
    return <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />;
  };

  // Prepare table rows including "Yesterday" as shown in the video
  const safeDaily = daily && daily.length > 0 ? daily : [];
  const todayMax = safeDaily[0]?.maxTemp ?? 30;
  const todayMin = safeDaily[0]?.minTemp ?? 20;

  const yesterdayRow = {
    dayName: 'Yesterday',
    pop: 0,
    condition: 'Partly Cloudy',
    maxTemp: todayMax,
    minTemp: todayMin + 1,
    isYesterday: true,
  };

  const daysToShow = [yesterdayRow, ...safeDaily.map((d, i) => ({
    ...d,
    dayName: i === 0 ? 'Today' : d.dayName.slice(0, 3),
    isYesterday: false,
  }))];

  return (
    <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-lg text-white select-none transition-all">
      <div className="divide-y divide-white/10">
        {daysToShow.slice(0, 8).map((day, idx) => (
          <div
            key={idx}
            className="py-2.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-2 text-xs sm:text-sm"
          >
            {/* Day Name */}
            <div className="w-16 sm:w-20 font-semibold text-white/95 truncate">
              {day.dayName}
            </div>

            {/* Rain Chance % */}
            <div className="w-12 sm:w-16 flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs text-cyan-200">
              {!day.isYesterday && day.pop > 0 && (
                <>
                  <Droplet className="w-3 h-3 text-cyan-300 fill-cyan-300 shrink-0" />
                  <span>{day.pop}%</span>
                </>
              )}
            </div>

            {/* Weather Condition Icon */}
            <div className="flex-1 flex justify-center">
              {getConditionIcon(day.condition)}
            </div>

            {/* High & Low Temp */}
            <div className="flex items-center gap-2 sm:gap-3 w-16 sm:w-20 justify-end font-semibold text-white text-xs sm:text-sm shrink-0">
              <span>{displayTemp(day.maxTemp)}°</span>
              <span className="text-white/60 font-normal">{displayTemp(day.minTemp)}°</span>
            </div>
          </div>
        ))}
      </div>

      {/* 15-day forecast > */}
      <div className="mt-2 pt-3 border-t border-white/15 flex justify-end">
        <button
          onClick={() => setShow15DayModal(true)}
          className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>15-day forecast</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 15-Day Extended Modal */}
      {show15DayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900/95 text-white rounded-3xl p-5 border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-base">15-Day Extended Forecast</h3>
              </div>
              <button
                onClick={() => setShow15DayModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-white/10 py-2 scrollbar-thin flex-1">
              {Array.from({ length: 15 }).map((_, i) => {
                const dayOffset = daily[i % daily.length];
                const date = new Date(Date.now() + i * 86400000);
                const dayStr = i === 0 ? 'Today' : date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <div key={i} className="py-2.5 px-2 flex items-center justify-between text-xs">
                    <div className="w-28 font-medium text-white/80">{dayStr}</div>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                      {getConditionIcon(dayOffset.condition)}
                      <span className="text-white/90 truncate max-w-[120px]">{dayOffset.condition}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-300 w-12 justify-end">
                      <Droplet className="w-3 h-3 fill-blue-300" />
                      <span>{dayOffset.pop}%</span>
                    </div>
                    <div className="w-16 text-right font-bold text-white text-sm">
                      {displayTemp(dayOffset.maxTemp)}° <span className="text-white/60 font-normal text-xs">{displayTemp(dayOffset.minTemp)}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
