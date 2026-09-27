import React from 'react';
import { Layers, Compass, Sprout, RefreshCw, MapPin, Navigation, Loader2 } from 'lucide-react';
import { MausamLogo } from './MausamLogo';
import { ProfileId } from '../types/weather';
import { USER_PROFILES } from '../data/profiles';

interface HeaderProps {
  activeProfileId: ProfileId;
  onSelectProfile: (id: ProfileId) => void;
  activeView: 'home' | 'pipeline' | 'agromet' | 'compare';
  setActiveView: (view: 'home' | 'pipeline' | 'agromet' | 'compare') => void;
  tempUnit: 'C' | 'F';
  onToggleTempUnit: () => void;
  onRefreshData: () => void;
  cityName: string;
  isAutoDetected?: boolean;
  onTriggerLocation: () => void;
  isLocating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfileId,
  onSelectProfile,
  activeView,
  setActiveView,
  tempUnit,
  onToggleTempUnit,
  onRefreshData,
  cityName,
  isAutoDetected,
  onTriggerLocation,
  isLocating = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="text-left focus:outline-hidden cursor-pointer transition-transform active:scale-98"
            >
              <MausamLogo size="md" />
            </button>
          </div>

          {/* Zone 2: 4 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('home')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'home'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'hover:text-slate-900'
              }`}
            >
              ☀️ Weather Today
            </button>
            <button
              onClick={() => setActiveView('compare')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'compare'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'hover:text-slate-900'
              }`}
            >
              🌍 Other Cities
            </button>
            <button
              onClick={() => setActiveView('agromet')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'agromet'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'hover:text-slate-900'
              }`}
            >
              🌾 Plants & Farm
            </button>
            <button
              onClick={() => setActiveView('pipeline')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'pipeline'
                  ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                  : 'hover:text-slate-900'
              }`}
            >
              ⚙️ How It Works
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            {/* Quick Location Badge / Auto-detect trigger */}
            <button
              onClick={onTriggerLocation}
              disabled={isLocating}
              title={isAutoDetected ? 'Auto-detected location. Click to re-fetch GPS' : 'Click to auto-fetch your location'}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isAutoDetected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : isAutoDetected ? (
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="truncate max-w-[100px]">{cityName}</span>
            </button>

            {/* Quick Profile Dropdown */}
            <div className="relative">
              <select
                value={activeProfileId}
                onChange={(e) => onSelectProfile(e.target.value as ProfileId)}
                aria-label="Active Profile Selection"
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors cursor-pointer"
              >
                {USER_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Units Toggle */}
            <button
              onClick={onToggleTempUnit}
              title="Toggle Temperature Unit"
              className="text-xs font-mono font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              °{tempUnit}
            </button>

            {/* Live refresh button */}
            <button
              onClick={onRefreshData}
              title="Sync Meteorological Observations"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
