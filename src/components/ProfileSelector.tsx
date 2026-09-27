import React from 'react';
import {
  HeartPulse,
  Activity,
  Sprout,
  Baby,
  Car,
  Waves,
  Compass,
  CalendarRange,
  Check,
  Sparkles,
} from 'lucide-react';
import { ProfileId } from '../types/weather';
import { USER_PROFILES } from '../data/profiles';

interface ProfileSelectorProps {
  activeProfileId: ProfileId;
  onSelectProfile: (id: ProfileId) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  activeProfileId,
  onSelectProfile,
}) => {
  const getIcon = (name: string, active: boolean) => {
    const className = `w-5 h-5 ${active ? 'text-blue-700' : 'text-slate-600'}`;
    switch (name) {
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Sprout':
        return <Sprout className={className} />;
      case 'Baby':
        return <Baby className={className} />;
      case 'Car':
        return <Car className={className} />;
      case 'Waves':
        return <Waves className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'CalendarRange':
        return <CalendarRange className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-white/70 rounded-2xl p-4 sm:p-5 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Select User Profile
            </h2>
            <span className="text-xs font-medium text-slate-500">
              · उपयोगकर्ता प्रोफ़ाइल चुनें
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Weather telemetry remains identical; presentation, priority ranking, and derived indices adapt immediately.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium bg-blue-50 px-3 py-1 rounded-md self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dynamic Rule Engine Active</span>
        </div>
      </div>

      {/* Grid of 8 profiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {USER_PROFILES.map((profile) => {
          const isActive = profile.id === activeProfileId;
          return (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile.id)}
              className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isActive
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div className="mb-2">
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center mb-2 ${
                    isActive ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}
                >
                  {getIcon(profile.iconName, isActive)}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                  {profile.name}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {profile.hindiName}
                </div>
              </div>

              <div className="mt-1 pt-1.5 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Top Priority
                </div>
                <div className="text-[11px] font-semibold text-slate-700 truncate">
                  {profile.primaryPriorities[0]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
