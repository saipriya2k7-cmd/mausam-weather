import React from 'react';

interface MausamLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const MausamLogo: React.FC<MausamLogoProps> = ({
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Attractive Modern Weather Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl p-0.5 bg-gradient-to-br from-amber-400 via-sky-400 to-blue-600 shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:scale-105 shrink-0`}
      >
        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-700 flex items-center justify-center overflow-hidden relative p-1">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-300/40 rounded-full blur-xs pointer-events-none" />

          {/* Precision SVG Weather Mark */}
          <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-sm">
            <defs>
              {/* Sun Gradient */}
              <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Cloud Highlight Gradient */}
              <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              {/* Rain Droplet Gradient */}
              <linearGradient id="dropGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Glowing Golden Sun */}
            <circle cx="32" cy="18" r="9" fill="url(#sunGrad)" />
            {/* Sun Rays Pulsing */}
            <line x1="32" y1="5" x2="32" y2="7.5" stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <line x1="43" y1="12" x2="41" y2="13.5" stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <line x1="45" y1="22" x2="42.5" y2="22" stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <line x1="20" y1="11" x2="22" y2="12.5" stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

            {/* Smooth 3D-styled Cloud */}
            <path
              d="M 14 36 
                 L 33 36 
                 A 7 7 0 0 0 35 23 
                 A 10 10 0 0 0 21 21 
                 A 8 8 0 0 0 13 29 
                 A 6.5 6.5 0 0 0 14 36 Z"
              fill="url(#cloudGrad)"
              filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.15))"
            />

            {/* Cyan Droplet accent */}
            <path
              d="M 23 39 C 23 39, 20.5 42.5, 20.5 44 C 20.5 45.4, 21.6 46.5, 23 46.5 C 24.4 46.5, 25.5 45.4, 25.5 44 C 25.5 42.5, 23 39, 23 39 Z"
              fill="url(#dropGrad)"
              opacity="0.95"
            />
          </svg>
        </div>
      </div>

      {/* Typography Lockup */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`${textSizes[size]} font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent block`}
          >
            Mausam
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white tracking-wide uppercase shadow-xs">
            Live
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[11px] font-medium text-slate-500 block tracking-tight">
            Personalized Weather
          </span>
        )}
      </div>
    </div>
  );
};
