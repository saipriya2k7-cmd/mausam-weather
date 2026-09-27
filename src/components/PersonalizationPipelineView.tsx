import React from 'react';
import {
  Cpu,
  ArrowRight,
  Database,
  Sliders,
  CheckCircle2,
  Bell,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';
import { PersonalizedAnalysis } from '../utils/personalizationEngine';
import { WeatherData, ProfileId } from '../types/weather';
import { USER_PROFILES } from '../data/profiles';

interface PersonalizationPipelineViewProps {
  analysis: PersonalizedAnalysis;
  weather: WeatherData;
  activeProfileId: ProfileId;
  onSelectProfile: (id: ProfileId) => void;
}

export const PersonalizationPipelineView: React.FC<PersonalizationPipelineViewProps> = ({
  analysis,
  weather,
  activeProfileId,
  onSelectProfile,
}) => {
  const profile = analysis.profile;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              System Architecture & Research Model
            </span>
            <span className="text-xs text-slate-500">
              प्रणाली वास्तुकला
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Personalization Pipeline & Algorithmic Transformation
          </h2>
          <p className="text-xs text-slate-600">
            Interactive demonstration of how identical raw meteorological data is ingested, weighted, and rendered into a personalized operational interface.
          </p>
        </div>

        <div className="text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60 self-start sm:self-auto">
          Active Profile: {profile.name}
        </div>
      </div>

      {/* The 5 Pipeline Steps in Visual Flow */}
      <div className="space-y-4">
        {/* Step 1: User Profile Selection */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Stage 1: User Profile Selection
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 pl-8">
            The user identifies their persona ({profile.name} / {profile.hindiName}). The system retrieves the target domain configuration containing priority vectors and operational invariants.
          </p>
          <div className="pl-8 flex flex-wrap gap-2">
            {USER_PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                  p.id === activeProfileId
                    ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Weather Data Ingestion */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Stage 2: Standard IMD Weather Data Ingestion
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standard Dataset</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 pl-8">
            The same raw observations from <span className="font-semibold text-slate-800">{weather.stationName}</span> are ingested. Data is never fabricated or hidden; only prioritized.
          </p>
          <div className="pl-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">Temp</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.temp}°C</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">Rainfall 24h</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.rainfallPast24hMm} mm</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">NAQI</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.aqi}</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">Wind</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.windSpeed} km/h</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">Humidity</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.humidity}%</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">UV Index</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.uvIndex}</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">Visibility</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.visibilityMeters}m</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">Soil Moisture</div>
              <div className="font-mono font-bold text-slate-900">{weather.current.soilMoistureTop15cmPercent}%</div>
            </div>
          </div>
        </div>

        {/* Step 3: Analyze User Needs */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Stage 3: Domain Rules & Needs Analysis
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Algorithmic Matching</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 pl-8">
            The system maps raw weather inputs against domain-specific comfort, agronomic, or physiological limits:
          </p>
          <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 mb-1">Target Invariants:</div>
              <ul className="space-y-1 text-slate-600">
                {profile.primaryPriorities.map((item, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 mb-1">Computed Derived Indicators:</div>
              <div className="space-y-1">
                <div className="font-mono text-blue-700 font-bold">
                  {analysis.primaryDerivedIndicator.title} ({analysis.primaryDerivedIndicator.score}/100)
                </div>
                {analysis.secondaryDerivedIndicators[0] && (
                  <div className="font-mono text-slate-700">
                    {analysis.secondaryDerivedIndicators[0].title}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Prioritize Relevant Information */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Stage 4: Prioritize Information & Dynamic Layout
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ranked Layout</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 pl-8">
            The homepage dynamically reorganizes so the most relevant features appear at the top:
          </p>
          <div className="pl-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(profile.widgetWeights)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([key, weight], i) => (
                <div
                  key={key}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                    i === 0
                      ? 'bg-blue-600 text-white font-bold border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="capitalize truncate max-w-[110px]">
                    #{i + 1} {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-[11px] shrink-0">{weight}/10</span>
                </div>
              ))}
          </div>
        </div>

        {/* Step 5: Weather Alerts */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                5
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Stage 5: Personalized Weather Alerts
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Tailored Warning Matrix</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 pl-8">
            Alerts from the IMD Color-coded Warning System are filtered and matched so that critical warnings directly relevant to the user persona are highlighted.
          </p>
          <div className="pl-8 space-y-2">
            {analysis.prioritizedAlerts.map((alt) => (
              <div
                key={alt.id}
                className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      alt.severity === 'red'
                        ? 'bg-rose-600'
                        : alt.severity === 'orange'
                        ? 'bg-amber-500'
                        : alt.severity === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-900 truncate">
                    {alt.headline}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {alt.relevantProfiles.includes(activeProfileId) ? 'Directly Applicable' : 'Station Advisory'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
