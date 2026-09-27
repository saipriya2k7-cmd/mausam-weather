import React, { useState } from 'react';
import { Clock, CloudSun, Droplets, Wind, Sun, Activity, Baby, Sparkles } from 'lucide-react';
import { HourlyData, ProfileId } from '../types/weather';

interface HourlyForecastWidgetProps {
  hourly: HourlyData[];
  activeProfileId: ProfileId;
  tempUnit: 'C' | 'F';
}

export const HourlyForecastWidget: React.FC<HourlyForecastWidgetProps> = ({
  hourly,
  activeProfileId,
  tempUnit,
}) => {
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(0);

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const getProfileSpecificMetric = (hour: HourlyData) => {
    switch (activeProfileId) {
      case 'fitness_enthusiast':
        return {
          label: 'Run Score',
          value: `${hour.runningScore || 70}/100`,
          badge: (hour.runningScore || 70) > 80 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
        };
      case 'parent':
        return {
          label: 'Play Comfort',
          value: `${hour.kidsPlayScore || 75}/100`,
          badge: (hour.kidsPlayScore || 75) > 80 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100',
        };
      case 'farmer':
        return {
          label: 'Spray Wind',
          value: `${hour.windSpeed} km/h`,
          badge: hour.windSpeed < 14 && hour.pop < 30 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
        };
      case 'commuter':
        return {
          label: 'Visibility',
          value: `${(hour.visibility / 1000).toFixed(1)} km`,
          badge: hour.visibility > 4000 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
        };
      case 'health_conscious':
        return {
          label: 'Hourly AQI',
          value: `${hour.aqi}`,
          badge: hour.aqi < 100 ? 'text-emerald-700 bg-emerald-50' : hour.aqi < 200 ? 'text-yellow-700 bg-yellow-50' : 'text-rose-700 bg-rose-50',
        };
      case 'event_planner':
        return {
          label: 'Max Gust',
          value: `${hour.windGust} km/h`,
          badge: hour.windGust < 30 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50',
        };
      case 'beachgoer':
        return {
          label: 'UV Index',
          value: `UV ${hour.uvIndex}`,
          badge: hour.uvIndex > 7 ? 'text-rose-700 bg-rose-50' : 'text-blue-700 bg-blue-50',
        };
      default:
        return {
          label: 'Rain %',
          value: `${hour.pop}%`,
          badge: hour.pop > 40 ? 'text-blue-700 bg-blue-50' : 'text-slate-600 bg-slate-100',
        };
    }
  };

  const selectedHour = hourly[selectedHourIdx] || hourly[0];

  return (
    <div className="bg-white/88 backdrop-blur-xl border border-white/70 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              12-Hour Hourly Forecast
            </h3>
            <div className="text-xs text-slate-500">
              Next 12 hours prioritized for your active profile in 12-hour AM/PM format
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md self-start sm:self-auto flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tailored Derived Indicators Overlay</span>
        </div>
      </div>

      {/* Horizontal Hourly Strip */}
      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {hourly.map((h, idx) => {
          const isSelected = idx === selectedHourIdx;
          const profileMetric = getProfileSpecificMetric(h);

          return (
            <button
              key={idx}
              onClick={() => setSelectedHourIdx(idx)}
              className={`flex flex-col items-center justify-between p-3 rounded-xl border text-center transition-all min-w-[85px] cursor-pointer shrink-0 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
              }`}
            >
              <div className="text-xs font-bold text-slate-700 font-mono">
                {h.time}
              </div>

              {/* Rain pop indicator */}
              <div className="my-2">
                <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {displayTemp(h.temp)}°
                </div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-blue-600 font-medium">
                  <Droplets className="w-3 h-3" />
                  <span>{h.pop}%</span>
                </div>
              </div>

              {/* Profile Specific Metric Badge */}
              <div className="mt-1 pt-1.5 border-t border-slate-200/80 w-full">
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {profileMetric.label}
                </div>
                <div
                  className={`text-[11px] font-bold font-mono px-1 py-0.5 rounded-sm mt-0.5 ${profileMetric.badge}`}
                >
                  {profileMetric.value}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Hour Telemetry Inspection Box */}
      {selectedHour && (
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 font-mono text-sm">
              {selectedHour.time} Detail:
            </span>
            <span className="text-slate-700 font-medium">
              {selectedHour.condition}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">
              Feels like {displayTemp(selectedHour.feelsLike)}°{tempUnit}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600 font-mono">
            <div>
              <span className="text-slate-400">Wind: </span>
              <span className="font-semibold text-slate-800">
                {selectedHour.windSpeed} km/h ({selectedHour.windDirection})
              </span>
            </div>
            <div>
              <span className="text-slate-400">Humidity: </span>
              <span className="font-semibold text-slate-800">
                {selectedHour.humidity}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">UV: </span>
              <span className="font-semibold text-slate-800">
                {selectedHour.uvIndex}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Visibility: </span>
              <span className="font-semibold text-slate-800">
                {(selectedHour.visibility / 1000).toFixed(1)} km
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
