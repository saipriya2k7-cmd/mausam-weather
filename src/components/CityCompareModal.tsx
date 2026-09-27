import React from 'react';
import { CITIES } from '../data/cities';
import { generateWeatherData } from '../utils/weatherGenerator';
import { analyzeAndPersonalize } from '../utils/personalizationEngine';
import { CityProfile, ProfileId, UserProfileConfig } from '../types/weather';
import { USER_PROFILES } from '../data/profiles';
import { MapPin, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CityCompareModalProps {
  activeProfileId: ProfileId;
  onSelectCity: (city: CityProfile) => void;
  tempUnit: 'C' | 'F';
}

export const CityCompareModal: React.FC<CityCompareModalProps> = ({
  activeProfileId,
  onSelectCity,
  tempUnit,
}) => {
  const profile = USER_PROFILES.find((p) => p.id === activeProfileId) || USER_PROFILES[0];

  const cityComparisons = CITIES.map((city) => {
    const weather = generateWeatherData(city.id);
    const analysis = analyzeAndPersonalize(activeProfileId, weather);
    return {
      city,
      weather,
      analysis,
    };
  });

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Multi-City Synoptic Comparison for {profile.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare derived suitability scores, primary alerts, and telemetry for your active profile across major Indian meteorological centers.
          </p>
        </div>
        <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-md self-start sm:self-auto">
          Active: {profile.hindiName}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cityComparisons.map(({ city, weather, analysis }) => {
          const hero = analysis.primaryDerivedIndicator;
          const topAlert = analysis.prioritizedAlerts[0];

          return (
            <div
              key={city.id}
              className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl p-4 transition-all flex flex-col justify-between"
            >
              <div>
                {/* City name & Temp */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{city.name}</span>
                      <span className="text-xs text-slate-500 font-normal">({city.hindiName})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{city.state}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                      {displayTemp(weather.current.temp)}°{tempUnit}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      AQI {weather.current.aqi}
                    </div>
                  </div>
                </div>

                {/* Profile Derived Score */}
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                      {hero.title}
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {hero.score}/100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full ${
                        hero.score > 75
                          ? 'bg-emerald-500'
                          : hero.score > 50
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${hero.score}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {hero.statusText}
                  </div>
                </div>

                {/* Top Alert */}
                {topAlert && (
                  <div className="text-[11px] p-2 rounded-md bg-white border border-slate-200/70 mb-3">
                    <div className="flex items-center gap-1 text-slate-800 font-semibold mb-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          topAlert.severity === 'red'
                            ? 'bg-rose-500'
                            : topAlert.severity === 'orange'
                            ? 'bg-amber-500'
                            : topAlert.severity === 'yellow'
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="truncate">{topAlert.category}</span>
                    </div>
                    <div className="text-slate-500 line-clamp-1">
                      {topAlert.headline}
                    </div>
                  </div>
                )}
              </div>

              {/* Select City Button */}
              <button
                onClick={() => onSelectCity(city)}
                className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Switch to {city.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
