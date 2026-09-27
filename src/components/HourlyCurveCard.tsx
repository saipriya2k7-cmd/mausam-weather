import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  Sunset,
  Sunrise,
  Moon,
  CloudMoon,
  Droplet,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { HourlyData, WeatherData } from '../types/weather';

interface HourlyCurveCardProps {
  hourly: HourlyData[];
  weather: WeatherData;
  tempUnit: 'C' | 'F';
}

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const p = match[3]?.toLowerCase();
  if (p === 'pm' && h < 12) h += 12;
  if (p === 'am' && h === 12) h = 0;
  return h * 60 + m;
}

export const HourlyCurveCard: React.FC<HourlyCurveCardProps> = ({
  hourly,
  weather,
  tempUnit,
}) => {
  const [show48HourModal, setShow48HourModal] = useState(false);

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const lowTemp = displayTemp(weather.daily[0]?.minTemp ?? weather.current.temp - 5);

  const getConditionIcon = (condition: string, hourNum: number = 12, isSunset: boolean = false, isSunrise: boolean = false) => {
    if (isSunset) {
      return <Sunset className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
    }
    if (isSunrise) {
      return <Sunrise className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
    }
    const c = condition.toLowerCase();
    const isNight = hourNum >= 19 || hourNum < 6;

    if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
      return <CloudLightning className="w-5 h-5 text-amber-400" />;
    }
    if (c.includes('heavy rain') || c.includes('downpour')) {
      return <CloudRain className="w-5 h-5 text-cyan-300" />;
    }
    if (c.includes('rain') || c.includes('drizzle')) {
      return <CloudDrizzle className="w-5 h-5 text-cyan-200" />;
    }
    if (c.includes('partly') || c.includes('scattered')) {
      return isNight ? (
        <CloudMoon className="w-5 h-5 text-slate-200" />
      ) : (
        <CloudSun className="w-5 h-5 text-amber-300 fill-amber-300/40" />
      );
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className="w-5 h-5 text-slate-200" />;
    }
    return isNight ? (
      <Moon className="w-5 h-5 text-cyan-200 fill-cyan-200/30" />
    ) : (
      <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
    );
  };

  // Build the hourly list (up to 10 points)
  const safeHourly = Array.isArray(hourly) ? hourly : [];
  const baseSlice = safeHourly.slice(0, 10);
  const currentHour = baseSlice[0]?.hour ?? new Date().getHours();
  const currentMinutes = currentHour * 60 + new Date().getMinutes();

  const sunsetMinutes = parseTimeToMinutes(weather.current?.sunset);
  const sunriseMinutes = parseTimeToMinutes(weather.current?.sunrise);

  interface CurvePoint {
    time: string;
    temp: number;
    pop: number;
    condition: string;
    hour: number;
    isSunset?: boolean;
    isSunrise?: boolean;
  }

  const curvePoints: CurvePoint[] = baseSlice.map((h, idx) => ({
    time: idx === 0 ? 'Now' : (h.time || '').toLowerCase().replace(' ', ' '),
    temp: displayTemp(h.temp ?? 25),
    pop: h.pop ?? 0,
    condition: h.condition || 'Clear',
    hour: h.hour ?? idx,
  }));

  // Solar events logic:
  // 1. SUNSET: Only insert if Sunset is in the FUTURE today (currentMinutes < sunsetMinutes)
  // If currentMinutes >= sunsetMinutes (e.g. it's already 7 PM and sunset was 6:16 PM), Sunset is ALREADY IN THE PAST! Do not show it.
  if (sunsetMinutes !== null && currentMinutes < sunsetMinutes) {
    const sunsetHour = Math.floor(sunsetMinutes / 60);
    // Find slot where sunset occurs between two hours
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const h1 = curvePoints[i].hour;
      const h2 = curvePoints[i + 1].hour;
      if (h1 <= sunsetHour && h2 > sunsetHour) {
        curvePoints.splice(i + 1, 0, {
          time: weather.current.sunset ? weather.current.sunset.toLowerCase() : 'sunset',
          temp: Math.round((curvePoints[i].temp + curvePoints[i + 1].temp) / 2),
          pop: curvePoints[i].pop,
          condition: 'Sunset',
          hour: sunsetHour,
          isSunset: true,
        });
        break;
      }
    }
  }

  // 2. SUNRISE: If currently night and Sunrise is upcoming in the morning within the curve
  if (sunriseMinutes !== null && (currentHour >= 20 || currentHour < 6)) {
    const sunriseHour = Math.floor(sunriseMinutes / 60);
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const h1 = curvePoints[i].hour;
      const h2 = curvePoints[i + 1].hour;
      // crosses midnight or morning transition
      if (h1 <= sunriseHour && h2 > sunriseHour && h1 >= 4) {
        curvePoints.splice(i + 1, 0, {
          time: weather.current.sunrise ? weather.current.sunrise.toLowerCase() : 'sunrise',
          temp: Math.round((curvePoints[i].temp + curvePoints[i + 1].temp) / 2),
          pop: curvePoints[i].pop,
          condition: 'Sunrise',
          hour: sunriseHour,
          isSunrise: true,
        });
        break;
      }
    }
  }

  // Calculate SVG curve coordinates
  const minTemp = curvePoints.length > 0 ? Math.min(...curvePoints.map((p) => p.temp)) : 20;
  const maxTemp = curvePoints.length > 0 ? Math.max(...curvePoints.map((p) => p.temp)) : 30;
  const tempDiff = Math.max(1, maxTemp - minTemp);
  const pointSpacing = 68; // px between columns
  const svgWidth = curvePoints.length * pointSpacing;
  const svgHeight = 44;

  const points = curvePoints.map((p, i) => {
    const x = i * pointSpacing + pointSpacing / 2;
    // higher temp = lower y in SVG
    const y = 8 + ((maxTemp - p.temp) / tempDiff) * (svgHeight - 16);
    return { x, y, ...p };
  });

  // Construct SVG path for smooth line
  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-lg text-white select-none transition-all">
      {/* Top condition summary */}
      <div className="text-sm font-semibold text-white/95 mb-3 px-1 flex items-center justify-between">
        <span>{weather.current.condition}. Low {lowTemp}°{tempUnit}.</span>
        <span className="text-[11px] text-white/60 font-medium">Hourly Trend</span>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="overflow-x-auto pb-2 scrollbar-none relative">
        <div style={{ width: `${svgWidth}px` }} className="relative">
          {/* Top row: Times */}
          <div className="flex">
            {curvePoints.map((p, idx) => (
              <div
                key={idx}
                style={{ width: `${pointSpacing}px` }}
                className={`text-center text-[11px] font-medium ${
                  p.isSunset || p.isSunrise ? 'text-amber-200 font-bold' : 'text-white/80'
                }`}
              >
                {p.isSunset ? 'Sunset' : p.isSunrise ? 'Sunrise' : p.time}
              </div>
            ))}
          </div>

          {/* Second row: Weather Icons */}
          <div className="flex my-2">
            {curvePoints.map((p, idx) => (
              <div
                key={idx}
                style={{ width: `${pointSpacing}px` }}
                className="flex justify-center"
              >
                {getConditionIcon(p.condition, p.hour, p.isSunset, p.isSunrise)}
              </div>
            ))}
          </div>

          {/* Third row: Connected SVG Temperature Curve & Labels */}
          <div className="relative h-12 my-1">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
            >
              {/* Curve Line */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Glowing Dots */}
              {points.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className={
                    pt.isSunset || pt.isSunrise
                      ? 'fill-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                      : 'fill-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]'
                  }
                />
              ))}
            </svg>

            {/* Temperature Labels overlaying the curve */}
            <div className="flex absolute inset-0">
              {points.map((p, idx) => (
                <div
                  key={idx}
                  style={{ width: `${pointSpacing}px` }}
                  className="text-center text-xs font-semibold text-white"
                >
                  <span
                    className="inline-block"
                    style={{ transform: `translateY(${Math.max(0, p.y - 18)}px)` }}
                  >
                    {p.isSunset || p.isSunrise ? '' : `${p.temp}°`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fourth row: Rain Chance with drop icon */}
          <div className="flex mt-3 pt-1 border-t border-white/15">
            {curvePoints.map((p, idx) => (
              <div
                key={idx}
                style={{ width: `${pointSpacing}px` }}
                className="flex items-center justify-center gap-0.5 text-[10px] font-semibold text-white/90"
              >
                {!p.isSunset && !p.isSunrise && (
                  <>
                    <Droplet className="w-2.5 h-2.5 text-cyan-300 fill-cyan-300" />
                    <span>{p.pop}%</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Button: 48-hour forecast > */}
      <div className="mt-2 pt-3 border-t border-white/15 flex justify-end">
        <button
          onClick={() => setShow48HourModal(true)}
          className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>48-hour forecast</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 48-Hour Extended Forecast Modal */}
      {show48HourModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950/90 text-white rounded-3xl p-5 border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base">48-Hour Hourly Outlook</h3>
              </div>
              <button
                onClick={() => setShow48HourModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-white/10 py-2 scrollbar-thin flex-1">
              {hourly.map((h, i) => (
                <div key={i} className="py-2.5 px-2 flex items-center justify-between text-xs hover:bg-white/5 rounded-xl transition-colors">
                  <div className="w-20 font-medium text-white/80">{h.time}</div>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    {getConditionIcon(h.condition, h.hour)}
                    <span className="text-white/90">{h.condition}</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-300 w-14 justify-end">
                    <Droplet className="w-3 h-3 fill-cyan-300" />
                    <span>{h.pop}%</span>
                  </div>
                  <div className="w-12 text-right font-bold text-white text-sm">
                    {displayTemp(h.temp)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
