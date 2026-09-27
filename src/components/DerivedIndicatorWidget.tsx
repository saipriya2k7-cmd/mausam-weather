import React from 'react';
import { Check, Info, ArrowUpRight } from 'lucide-react';
import { DerivedIndicator } from '../types/weather';

interface DerivedIndicatorWidgetProps {
  indicator: DerivedIndicator;
}

export const DerivedIndicatorWidget: React.FC<DerivedIndicatorWidgetProps> = ({ indicator }) => {
  return (
    <div className="bg-white/88 backdrop-blur-xl border border-white/70 rounded-2xl p-4 sm:p-5 shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-700">
              {indicator.category}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {indicator.title}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
              {indicator.statusText}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {indicator.summaryProse}
        </p>

        {/* Mini telemetry row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {indicator.metrics.map((m, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200/70 p-2 rounded-lg">
              <div className="text-[11px] text-slate-500 font-medium truncate">
                {m.label}
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {m.value}
              </div>
              {m.hint && (
                <div className="text-[10px] text-slate-400 truncate">
                  {m.hint}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action list */}
      <div className="pt-2.5 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">
          Action Guidelines:
        </div>
        <ul className="space-y-1">
          {indicator.actionItems.map((act, idx) => (
            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">›</span>
              <span className="leading-snug">{act}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
