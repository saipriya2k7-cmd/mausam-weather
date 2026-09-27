import React from 'react';
import { Calendar, Droplets, Sun, Wind, ChevronRight } from 'lucide-react';
import { DailyData } from '../types/weather';

interface WeeklyForecastWidgetProps {
  daily: DailyData[];
  tempUnit: 'C' | 'F';
}

export const WeeklyForecastWidget: React.FC<WeeklyForecastWidgetProps> = ({
  daily,
  tempUnit,
}) => {
  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  return (
    <div className="bg-white/88 backdrop-blur-xl border border-white/70 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              7-Day Synoptic Weather Outlook
            </h3>
            <div className="text-xs text-slate-500">
              IMD Medium-Range Numerical Weather Prediction (NWP)
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Updated 06:00 IST
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {daily.map((day, idx) => (
          <div
            key={idx}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
          >
            {/* Day name & Date */}
            <div className="w-36 shrink-0">
              <div className="text-sm font-bold text-slate-900">
                {day.dayName}
              </div>
              <div className="text-xs text-slate-500">
                {day.date} · {day.condition}
              </div>
            </div>

            {/* Precipitation & Synoptic Summary */}
            <div className="flex-1 text-xs text-slate-600 sm:px-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-blue-600 font-semibold font-mono">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{day.pop}%</span>
                </div>
                {day.expectedRainMm > 0 && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({day.expectedRainMm} mm)
                  </span>
                )}
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 text-[11px] font-mono">
                  AQI: ~{day.avgAqi}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 text-[11px] font-mono">
                  Max UV: {day.maxUv}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {day.summary}
              </p>
            </div>

            {/* Min / Max Temperature Bar */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {displayTemp(day.minTemp)}°
              </span>
              <div className="w-24 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-300 h-full rounded-l-full"
                  style={{ width: `${Math.max(10, day.minTemp * 2)}%` }}
                />
                <div
                  className="bg-amber-500 h-full rounded-r-full"
                  style={{ width: `${Math.max(20, (day.maxTemp - day.minTemp) * 4)}%` }}
                />
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {displayTemp(day.maxTemp)}°{tempUnit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
