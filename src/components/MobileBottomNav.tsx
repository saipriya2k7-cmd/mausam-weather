import React from 'react';
import { CloudSun, MapPin } from 'lucide-react';

export type MobileTab = 'weather' | 'cities';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  activeProfileName?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-2xl border-t border-white/15 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl select-none">
      <div className="max-w-xs mx-auto grid grid-cols-2 gap-2">
        {/* Tab 1: Weather */}
        <button
          onClick={() => onSelectTab('weather')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl min-h-[44px] transition-all cursor-pointer ${
            activeTab === 'weather'
              ? 'text-white bg-white/25 font-bold border border-white/30 shadow-xs'
              : 'text-white/70 hover:text-white font-medium'
          }`}
        >
          <CloudSun className="w-5 h-5 shrink-0" />
          <span className="text-xs leading-tight">Weather</span>
        </button>

        {/* Tab 2: Cities */}
        <button
          onClick={() => onSelectTab('cities')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl min-h-[44px] transition-all cursor-pointer ${
            activeTab === 'cities'
              ? 'text-white bg-white/25 font-bold border border-white/30 shadow-xs'
              : 'text-white/70 hover:text-white font-medium'
          }`}
        >
          <MapPin className="w-5 h-5 shrink-0" />
          <span className="text-xs leading-tight">Cities</span>
        </button>
      </div>
    </nav>
  );
};
