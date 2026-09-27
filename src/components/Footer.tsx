import React from 'react';

interface FooterProps {
  onSelectView?: (view: 'home' | 'pipeline' | 'agromet' | 'compare') => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="mt-12 border-t border-white/15 bg-black/20 backdrop-blur-xl py-6 text-xs text-white/70 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-2">
        <div className="text-sm font-light tracking-[0.2em] uppercase text-white/90">
          Mausam · Live Meteorological Observatory
        </div>
        <p className="text-[11px] text-white/60 max-w-lg mx-auto leading-relaxed">
          Dynamic atmospheric observations, air quality telemetry, and persona-driven forecasting.
        </p>
        <div className="text-[10px] text-white/40 pt-1">
          Synchronized with World Meteorological Organization (WMO) standards & Open-Meteo
        </div>
      </div>
    </footer>
  );
};
