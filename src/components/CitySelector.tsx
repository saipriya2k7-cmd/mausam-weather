import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  CheckCircle2,
  X,
  Navigation,
  ChevronDown,
} from 'lucide-react';
import { CITIES } from '../data/cities';
import { CityProfile } from '../types/weather';

interface CitySelectorProps {
  currentCity: CityProfile;
  onSelectCity: (city: CityProfile, source?: 'gps' | 'ip' | 'manual' | 'preset') => void;
  onAutoDetect: () => void;
  isLocating: boolean;
  locationSource?: 'gps' | 'ip' | 'manual' | 'preset';
  locationStatusMessage?: string | null;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  currentCity,
  onSelectCity,
  onAutoDetect,
  isLocating,
  locationStatusMessage,
}) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Top popular cities for one-tap quick selection
  const popularCityNames = ['New Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Jaipur', 'Goa'];
  const popularCities = popularCityNames
    .map((name) => CITIES.find((c) => c.name === name))
    .filter((c): c is CityProfile => Boolean(c));

  const filteredCities = CITIES.filter((city) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      city.name.toLowerCase().includes(q) ||
      city.state.toLowerCase().includes(q) ||
      city.hindiName.includes(q)
    );
  });

  return (
    <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-lg transition-all select-none text-white">
      {/* Top Row: Current City & Fast Location Detection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/15">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-sky-400/20 to-blue-600/30 border border-cyan-300/40 flex items-center justify-center text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.35)] shrink-0"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
            ) : (
              <MapPin className="w-5 h-5 text-cyan-200 fill-cyan-400/30" />
            )}
          </div>
          <div>
            <div className="text-[11px] font-semibold text-cyan-200/80 uppercase tracking-wider">
              Selected Observatory
            </div>
            <div className="text-lg sm:text-xl font-bold text-white flex items-baseline gap-1.5 mt-0.5">
              <span>{currentCity.name}</span>
              <span className="text-xs font-medium text-white/60">({currentCity.state})</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Auto GPS & Search input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onAutoDetect}
            disabled={isLocating}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/25 to-blue-600/25 hover:from-cyan-500/35 hover:to-blue-600/35 border border-cyan-300/40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            title="Auto-detect nearest meteorological observatory"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3.5 h-3.5 text-cyan-300" />
                <span>Auto-Locate</span>
              </>
            )}
          </button>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search Indian cities..."
              className="w-full pl-8 pr-7 py-2 rounded-2xl bg-white/15 hover:bg-white/20 focus:bg-black/30 border border-white/25 focus:border-white/50 text-xs text-white placeholder-white/60 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location warning if browser blocked GPS */}
      {locationStatusMessage && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-900/60 border border-amber-400/40 text-xs text-amber-200">
          {locationStatusMessage}
        </div>
      )}

      {/* Quick-Pick Popular Cities (Tap to change city instantly) */}
      <div className="pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
            Quick Pick Cities:
          </span>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
          >
            <span>{showDropdown ? 'Hide List' : 'View All 30 Cities'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {popularCities.map((city) => {
            const isSelected = city.id === currentCity.id;
            return (
              <button
                key={city.id}
                onClick={() => {
                  onSelectCity(city, 'manual');
                  setShowDropdown(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/40 text-white border border-white/50 shadow-xs'
                    : 'bg-white/10 hover:bg-white/25 text-white/90 border border-white/15'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded 30+ Cities Grid Dropdown */}
      {showDropdown && (
        <div className="mt-3 pt-3 border-t border-white/15">
          <div className="text-[11px] font-semibold text-white/70 mb-2">
            All Meteorological Stations & Observatories ({filteredCities.length}):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {filteredCities.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCity(c, 'manual');
                  setShowDropdown(false);
                }}
                className={`p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  c.id === currentCity.id
                    ? 'bg-white/35 font-bold text-white border border-white/40'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
                }`}
              >
                <div className="truncate">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="text-[10px] text-white/60 truncate">{c.state}</div>
                </div>
                {c.id === currentCity.id && <span className="text-cyan-300 font-bold ml-1">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
