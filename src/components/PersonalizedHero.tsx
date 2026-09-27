import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { DerivedIndicator, ProfileId, UserProfileConfig } from '../types/weather';

interface PersonalizedHeroProps {
  indicator: DerivedIndicator;
  profile: UserProfileConfig;
  tempUnit: 'C' | 'F';
}

export const PersonalizedHero: React.FC<PersonalizedHeroProps> = ({
  indicator,
  profile,
  tempUnit,
}) => {
  const getStatusColor = (level: DerivedIndicator['statusLevel']) => {
    switch (level) {
      case 'optimal':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          scoreBar: 'bg-emerald-500',
          accent: 'text-emerald-700',
        };
      case 'moderate':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          scoreBar: 'bg-blue-500',
          accent: 'text-blue-700',
        };
      case 'caution':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          scoreBar: 'bg-amber-500',
          accent: 'text-amber-700',
        };
      case 'hazardous':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          scoreBar: 'bg-rose-600',
          accent: 'text-rose-700',
        };
    }
  };

  const statusTheme = getStatusColor(indicator.statusLevel);

  return (
    <div className="bg-white/88 backdrop-blur-xl border-2 border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-md shadow-blue-900/5 relative overflow-hidden transition-all">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/60 to-transparent pointer-events-none -mr-16 -mt-16 rounded-full" />

      {/* Top Header Row with Profile Priority Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 mb-4 border-b border-slate-100 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider font-mono">
                Priority 1 Widget · {profile.name}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({profile.hindiName})
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {indicator.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${statusTheme.badge}`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{indicator.statusText}</span>
          </div>

          <div
            title="Algorithmically prioritized based on your active profile invariants and current meteorological readings"
            className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Why this first?</span>
          </div>
        </div>
      </div>

      {/* Hero Content: Left Score & Prose, Right Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Left Side: Score & Prose */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Score Progress Bar */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Suitability / Safety Index
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                    {indicator.score}
                  </span>
                  <span className="text-sm font-mono text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${statusTheme.scoreBar}`}
                  style={{ width: `${Math.max(5, indicator.score)}%` }}
                />
              </div>
            </div>

            {/* Context Summary Prose */}
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              {indicator.summaryProse}
            </p>
          </div>

          {/* Concrete Tailored Action Items */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Tailored Operational Recommendations</span>
            </div>
            <ul className="space-y-1.5">
              {indicator.actionItems.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-blue-600 font-bold leading-none mt-1">›</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Key Telemetry Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 content-start">
          {indicator.metrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 transition-colors flex flex-col justify-between"
            >
              <div className="text-xs font-medium text-slate-500 mb-1">
                {metric.label}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums leading-tight">
                  {metric.value}
                </div>
                {metric.hint && (
                  <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                    {metric.hint}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
