import React, { useState, useEffect } from 'react';
import { Newspaper, ChevronRight, ChevronLeft } from 'lucide-react';

export const WeatherNewsCard: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const headlines = [
    { tag: 'Breaking Weather', title: 'IMD synoptic update: Stable air mass prevails across regional observatories' },
    { tag: 'Commuter Watch', title: 'Road visibility optimal; early morning haze clearing across major routes' },
    { tag: 'Monsoon Status', title: 'Seasonal transition brings calm surface winds and pleasant evenings' },
    { tag: 'Clean Air Alert', title: 'Boundary layer ventilation improves afternoon air dispersion' },
  ];

  // Gentle auto-rotation every 6 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % headlines.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, headlines.length]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-lg text-white select-none transition-all"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-cyan-200/90 uppercase tracking-wider">
          <Newspaper className="w-3.5 h-3.5 text-cyan-300" />
          <span>{headlines[activeIdx].tag}</span>
        </div>
        <div className="text-[10px] text-white/50 font-medium">
          {activeIdx + 1} of {headlines.length}
        </div>
      </div>

      <div className="text-sm sm:text-base font-semibold text-white tracking-tight py-1 min-h-[44px] flex items-center">
        {headlines[activeIdx].title}
      </div>

      {/* Interactive Controls & Pagination Dots */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
        <button
          onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : headlines.length - 1))}
          className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
          title="Previous headline"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {headlines.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIdx === i ? 'w-5 bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIdx((prev) => (prev + 1) % headlines.length)}
          className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
          title="Next headline"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
