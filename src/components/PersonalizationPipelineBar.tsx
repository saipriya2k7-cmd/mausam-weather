import React, { useState } from 'react';
import { ArrowRight, Cpu, Sliders, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { PersonalizedAnalysis } from '../utils/personalizationEngine';
import { WeatherData } from '../types/weather';

interface PersonalizationPipelineBarProps {
  analysis: PersonalizedAnalysis;
  weather: WeatherData;
}

export const PersonalizationPipelineBar: React.FC<PersonalizationPipelineBarProps> = ({
  analysis,
  weather,
}) => {
  const [expanded, setExpanded] = useState(false);

  const steps = [
    {
      label: '1. User Profile',
      value: analysis.profile.name,
      sub: analysis.profile.hindiName,
    },
    {
      label: '2. Ingest Weather',
      value: `${weather.cityName}`,
      sub: `${weather.current.temp}°C · AQI ${weather.current.aqi}`,
    },
    {
      label: '3. Analyse Needs',
      value: analysis.profile.primaryPriorities[0],
      sub: analysis.profile.primaryPriorities[1],
    },
    {
      label: '4. Prioritize Info',
      value: analysis.primaryDerivedIndicator?.title.slice(0, 24) + '...',
      sub: 'Dynamic Rank Engine',
    },
    {
      label: '5. Custom Homepage',
      value: `${analysis.prioritizedAlerts.length} Tailored Alerts`,
      sub: 'Derived Indices Active',
    },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-400 tracking-wide uppercase font-mono">
              IMD Personalization Pipeline
            </div>
            <div className="text-sm font-bold text-slate-100">
              User → Profile → Weather Data → Analyse Needs → Prioritize Info → Tailored Alerts
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{expanded ? 'Hide Pipeline Inspector' : 'Inspect Pipeline Logic'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>

      {/* Horizontal Flow Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-800">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-lg border ${
              idx === 4
                ? 'bg-blue-950/60 border-blue-500/40'
                : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>{step.label}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-slate-100 truncate">
              {step.value}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {step.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Pipeline Inspector Drawer */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Active Priorities */}
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="font-semibold text-slate-100 mb-1.5 flex items-center justify-between">
                <span>Vector Prioritization</span>
                <span className="text-[10px] font-mono text-blue-400">Step 3 & 4</span>
              </div>
              <p className="text-slate-400 text-[11px] mb-2 leading-relaxed">
                The meteorological input is evaluated against threshold invariants tuned for {analysis.profile.name}:
              </p>
              <ul className="space-y-1 font-mono text-[11px] text-slate-200">
                {analysis.profile.primaryPriorities.map((item, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-blue-400">›</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Widget Weight Matrix */}
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="font-semibold text-slate-100 mb-1.5 flex items-center justify-between">
                <span>Widget Weight Allocation</span>
                <span className="text-[10px] font-mono text-blue-400">Score (1-10)</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {Object.entries(analysis.profile.widgetWeights)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([widgetKey, weight]) => (
                    <div key={widgetKey} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 capitalize truncate max-w-[130px]">
                        {widgetKey.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${weight * 10}%` }}
                          />
                        </div>
                        <span className="font-mono text-blue-300 font-semibold">{weight}/10</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 3: Derived Indicators Summary */}
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="font-semibold text-slate-100 mb-1.5 flex items-center justify-between">
                <span>Derived Indicators Computed</span>
                <span className="text-[10px] font-mono text-emerald-400">Live</span>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-700/60">
                  <div className="font-semibold text-slate-100 text-[11px]">
                    {analysis.primaryDerivedIndicator.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {analysis.primaryDerivedIndicator.statusText} · Score: {analysis.primaryDerivedIndicator.score}/100
                  </div>
                </div>
                {analysis.secondaryDerivedIndicators[0] && (
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-700/60">
                    <div className="font-semibold text-slate-100 text-[11px]">
                      {analysis.secondaryDerivedIndicators[0].title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {analysis.secondaryDerivedIndicators[0].statusText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
