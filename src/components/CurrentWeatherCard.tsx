import React from 'react';
import {
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sun,
  CloudRain,
  Compass,
  Sunset,
  Sunrise,
  Layers,
} from 'lucide-react';
import { WeatherData } from '../types/weather';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: 'C' | 'F';
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  tempUnit,
}) => {
  const { current } = weather;

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  return (
    <div className="bg-white/88 backdrop-blur-xl border border-white/70 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
      {/* Station Information & Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 mb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
              {weather.stationName}
            </span>
            {weather.locationSource === 'gps' && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                GPS Verified
              </span>
            )}
            {weather.locationSource === 'ip' && (
              <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-sm">
                Network Located
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {weather.detectedLocationInfo?.distanceToStationKm ? (
              <span>
                {weather.detectedLocationInfo.distanceToStationKm} km from target coordinates · Elevation: {weather.elevationMeters}m MSL
              </span>
            ) : (
              <span>
                Elevation: {weather.elevationMeters}m MSL · Synoptic Observation Network
              </span>
            )}
          </div>
        </div>
        <div className="text-xs font-mono text-slate-500">
          {weather.timestamp}
        </div>
      </div>

      {/* Main Temp & Condition Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {displayTemp(current.temp)}°
              <span className="text-2xl text-slate-400 font-sans font-normal ml-1">
                {tempUnit}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-1">
              Feels like <span className="font-semibold text-slate-700">{displayTemp(current.feelsLike)}°{tempUnit}</span>
            </div>
          </div>

          <div className="h-12 w-px bg-slate-200" />

          <div>
            <div className="text-lg font-bold text-slate-900 leading-snug">
              {current.condition}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Cloud Cover: {current.cloudCoverPercent}%</span>
              <span>·</span>
              <span>Dew Point: {displayTemp(current.dewPoint)}°{tempUnit}</span>
            </div>
          </div>
        </div>

        {/* Sunrise & Sunset Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg text-xs self-start md:self-auto">
          <div className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-slate-400 block text-[10px]">Sunrise</span>
              <span className="font-mono font-semibold text-slate-800">{current.sunrise}</span>
            </div>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Sunset className="w-4 h-4 text-orange-500" />
            <div>
              <span className="text-slate-400 block text-[10px]">Sunset</span>
              <span className="font-mono font-semibold text-slate-800">{current.sunset}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Meteorological Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Humidity */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Relative Humidity</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {current.humidity}%
          </div>
          <div className="text-[11px] text-slate-400">
            {current.humidity > 75 ? 'Humid' : 'Comfortable'}
          </div>
        </div>

        {/* Wind */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-500" />
            <span>Surface Wind</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {current.windSpeed} <span className="text-xs font-sans font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Dir: {current.windDirectionText} ({current.windDirectionDeg}°)
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Visibility</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {(current.visibilityMeters / 1000).toFixed(1)} <span className="text-xs font-sans font-normal text-slate-500">km</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {current.visibilityMeters} m
          </div>
        </div>

        {/* Rainfall 24h */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            <span>Rainfall (24h)</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {current.rainfallPast24hMm} <span className="text-xs font-sans font-normal text-slate-500">mm</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Rate: {current.rainfallRateMmHr} mm/h
          </div>
        </div>

        {/* Atmospheric Pressure */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Gauge className="w-3.5 h-3.5 text-indigo-500" />
            <span>Pressure QNH</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {current.pressureHpa} <span className="text-xs font-sans font-normal text-slate-500">hPa</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Normal MSL
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>UV Index</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            {current.uvIndex} <span className="text-xs font-sans font-normal text-slate-500">/ 11+</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {current.uvIndex >= 8 ? 'Very High' : current.uvIndex >= 6 ? 'High' : 'Moderate'}
          </div>
        </div>
      </div>
    </div>
  );
};
