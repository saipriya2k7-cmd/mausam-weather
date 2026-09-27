import React from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Crosshair,
  Loader2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Smile,
  Umbrella,
  Shirt,
  HeartPulse,
  Activity,
  Sprout,
  Baby,
  Car,
  Compass,
  Check,
  Bike,
} from 'lucide-react';
import { USER_PROFILES } from '../data/profiles';
import { PersonalizedAnalysis } from '../utils/personalizationEngine';
import { WeatherData, CityProfile, ProfileId } from '../types/weather';

interface UserAccountSidebarProps {
  analysis: PersonalizedAnalysis;
  weather: WeatherData;
  currentCity: CityProfile;
  activeProfileId: ProfileId;
  onSelectProfile: (id: ProfileId) => void;
  onAutoDetectLocation: () => void;
  isLocating: boolean;
  locationSource: 'gps' | 'ip' | 'manual' | 'preset';
  tempUnit: 'C' | 'F';
  onToggleTempUnit: () => void;
  onSelectView: (view: 'home' | 'pipeline' | 'agromet' | 'compare') => void;
}

export const UserAccountSidebar: React.FC<UserAccountSidebarProps> = ({
  analysis,
  weather,
  currentCity,
  activeProfileId,
  onSelectProfile,
  onAutoDetectLocation,
  isLocating,
  locationSource,
  tempUnit,
  onToggleTempUnit,
  onSelectView,
}) => {
  const profile = analysis.profile;
  const primary = analysis.primaryDerivedIndicator;
  const current = weather.current;
  const isRainy =
    current.conditionCode === 'rain' ||
    current.conditionCode === 'heavy_rain' ||
    current.conditionCode === 'thunderstorm';

  // Simplified friendly persona display
  const friendlyProfiles = [
    { id: 'farmer' as ProfileId, name: 'Farmer (Krishi)', emoji: '🌾', desc: 'Planting times, soil moisture & 7-day rain' },
    { id: 'fitness_enthusiast' as ProfileId, name: 'Sports & Cycling', emoji: '🚴', desc: 'Best cycling hours, wind & sweat rate' },
    { id: 'parent' as ProfileId, name: 'Kids & School', emoji: '🧒', desc: 'Playground comfort, school bag checklist' },
    { id: 'health_conscious' as ProfileId, name: 'Health & Clean Air', emoji: '🌿', desc: 'Safe breathing hours, PM2.5 & mask advice' },
    { id: 'commuter' as ProfileId, name: 'Daily Commute', emoji: '🚗', desc: 'Rush hours, road visibility & rain delay' },
    { id: 'traveller' as ProfileId, name: 'Travel & Outing', emoji: '✈️', desc: 'Sightseeing hours, luggage packing tips' },
  ];

  // Customized checklist tailored specifically to the user's role
  const renderCustomChecklist = () => {
    switch (activeProfileId) {
      case 'farmer':
        return (
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🌱</span>
              <div className="flex-1">
                <span className="font-bold">Planting & Spray:</span>
                <span className="text-slate-600 ml-1">
                  {current.windSpeed <= 14 ? 'Morning 6:00-9:30 AM (Calm winds)' : 'Postpone spray (High drift)'}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">💧</span>
              <div className="flex-1">
                <span className="font-bold">Field Moisture:</span>
                <span className="text-slate-600 ml-1">
                  Topsoil {current.soilMoistureTop15cmPercent}% ({current.soilMoistureTop15cmPercent > 55 ? 'Adequate' : 'Schedule light drip'})
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🌧️</span>
              <div className="flex-1">
                <span className="font-bold">7-Day Rain Outlook:</span>
                <span className="text-slate-600 ml-1">
                  {weather.daily.reduce((acc, d) => acc + d.expectedRainMm, 0).toFixed(1)} mm total expected
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🚜</span>
              <div className="flex-1">
                <span className="font-bold">Field Gear:</span>
                <span className="text-slate-600 ml-1">Rubber boots & broad sun hat</span>
              </div>
            </div>
          </div>
        );

      case 'fitness_enthusiast':
        return (
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🚴</span>
              <div className="flex-1">
                <span className="font-bold">Best Workout Time:</span>
                <span className="text-slate-600 ml-1">Morning 6:00 - 8:30 AM (Score 90/100)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">💧</span>
              <div className="flex-1">
                <span className="font-bold">Hydration Bottle:</span>
                <span className="text-slate-600 ml-1">
                  Target ~{Math.round(450 + (current.temp > 25 ? (current.temp - 25) * 35 : 0))} ml/hour
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">💨</span>
              <div className="flex-1">
                <span className="font-bold">Cycling Wind:</span>
                <span className="text-slate-600 ml-1">
                  {current.windSpeed} km/h from {current.windDirectionText}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🎽</span>
              <div className="flex-1">
                <span className="font-bold">Workout Gear:</span>
                <span className="text-slate-600 ml-1">Sweat-wicking jersey & UV sunglasses</span>
              </div>
            </div>
          </div>
        );

      case 'health_conscious':
        return (
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🌿</span>
              <div className="flex-1">
                <span className="font-bold">Clean Air Window:</span>
                <span className="text-slate-600 ml-1">1:30 PM - 5:00 PM (Best dispersal)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">😷</span>
              <div className="flex-1">
                <span className="font-bold">Mask Recommendation:</span>
                <span className="text-slate-600 ml-1">
                  {current.aqi > 200 ? 'N95 mask advised for outdoors' : 'Standard / optional'}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🪟</span>
              <div className="flex-1">
                <span className="font-bold">Home Ventilation:</span>
                <span className="text-slate-600 ml-1">Keep closed in early morning; open midday</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">💨</span>
              <div className="flex-1">
                <span className="font-bold">HEPA Purifier:</span>
                <span className="text-slate-600 ml-1">Run on medium in bedroom</span>
              </div>
            </div>
          </div>
        );

      case 'commuter':
        return (
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🚗</span>
              <div className="flex-1">
                <span className="font-bold">Rush Hour Transit:</span>
                <span className="text-slate-600 ml-1">8:00 - 10:00 AM & 5:30 - 8:00 PM</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">👁️</span>
              <div className="flex-1">
                <span className="font-bold">Highway Visibility:</span>
                <span className="text-slate-600 ml-1">
                  {(current.visibilityMeters / 1000).toFixed(1)} km (Clear road ahead)
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">☔</span>
              <div className="flex-1">
                <span className="font-bold">Road Spray & Rain:</span>
                <span className="text-slate-600 ml-1">
                  {isRainy ? 'Wet tarmac! Keep rain jacket' : 'Dry asphalt, smooth riding'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'traveller':
        return (
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded-2xl bg-violet-50/80 border border-violet-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🧭</span>
              <div className="flex-1">
                <span className="font-bold">Sightseeing Hours:</span>
                <span className="text-slate-600 ml-1">8:30 - 11:30 AM & 4:00 - 6:30 PM</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">👟</span>
              <div className="flex-1">
                <span className="font-bold">Comfortable Walking Shoes:</span>
                <span className="text-slate-600 ml-1">Great weather for walking tours</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">🕶️</span>
              <div className="flex-1">
                <span className="font-bold">Sun & Glasses:</span>
                <span className="text-slate-600 ml-1">Sunglasses and hat for daytime monuments</span>
              </div>
            </div>
          </div>
        );

      case 'parent':
      default:
        return (
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">⚽</span>
              <div className="flex-1">
                <span className="font-bold">Park Play Time:</span>
                <span className="text-slate-600 ml-1">4:30 PM - 6:30 PM (Mild sun & breeze)</span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">💧</span>
              <div className="flex-1">
                <span className="font-bold">Water Bottle:</span>
                <span className="text-slate-600 ml-1">Pack cold water for school</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isRainy ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50/80 border-slate-100 text-slate-800'
            }`}>
              <span className="text-base">{isRainy ? '☔' : '☀️'}</span>
              <div className="flex-1">
                <span className="font-bold">Umbrella:</span>
                <span className="text-slate-600 ml-1">
                  {isRainy ? 'Must carry! Rain active' : 'Not needed today'}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-2.5 text-slate-800">
              <span className="text-base">👕</span>
              <div className="flex-1">
                <span className="font-bold">School Uniform:</span>
                <span className="text-slate-600 ml-1">Light & breathable cotton</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-full lg:w-96 flex flex-col gap-4 select-none shrink-0">
      {/* 1. TOP: USER'S ACCOUNT INFORMATION CARD */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-sm transition-all">
        {/* User Identity Header */}
        <div className="flex items-center gap-3.5 pb-3.5 border-b border-slate-200/60">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-sm shrink-0">
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base truncate">Saipriya</span>
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            </div>
            <div className="text-xs text-slate-500 truncate">saipriya2k7@gmail.com</div>
            <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Personalized Portal Member</span>
            </div>
          </div>
        </div>

        {/* Account Observatory Station Info & Quick Actions */}
        <div className="pt-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Your City Station:</span>
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentCity.name}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Detection:</span>
            <span className="font-medium text-slate-700">
              {locationSource === 'gps' ? '🛰️ GPS Satellite' : locationSource === 'ip' ? '🌐 Network' : '📍 Selected City'}
            </span>
          </div>

          {/* Quick Action Buttons inside Account Info */}
          <div className="pt-1.5 flex items-center gap-2">
            <button
              onClick={onAutoDetectLocation}
              disabled={isLocating}
              className="flex-1 px-3 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Finding your location...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Find My Location</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleTempUnit}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              title="Switch between Celsius and Fahrenheit"
            >
              °{tempUnit}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DIRECTLY BELOW ACCOUNT INFO: ROLE CUSTOMIZATION SWITCHER */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-sm transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Smile className="w-4 h-4 text-blue-600" />
            <span>Customize Features For You:</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Tap to change
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-normal">
          The weather tiles and alerts automatically customize for what you care about:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {friendlyProfiles.map((p) => {
            const isSelected = activeProfileId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/90 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xl">{p.emoji}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 font-bold" />}
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold leading-tight">{p.name}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                    {p.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FEATURE 2B: CUSTOMIZED CHECKLIST FOR THIS USER */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-sm transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{profile.name} Checklist</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Tailored
          </span>
        </div>

        {renderCustomChecklist()}
      </div>

      {/* FEATURE 2C: TODAY'S TAILORED ADVICE */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-sm transition-all space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Smile className="w-4 h-4 text-emerald-600" />
            <span>Key Insight for {profile.name}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/80 text-xs text-slate-700 leading-relaxed">
          <div className="font-bold text-slate-900 mb-1">
            {primary.title}
          </div>
          <p>{primary.actionItems[0] || primary.summaryProse}</p>
        </div>
      </div>

      {/* FEATURE 2D: WEATHER SAFETY (Friendly & Reassuring) */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-sm transition-all space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Weather Safety Status</span>
        </div>

        {analysis.prioritizedAlerts.length > 0 ? (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-800 leading-relaxed">
            <div className="font-bold text-amber-950 mb-1">
              ⚠️ {analysis.prioritizedAlerts[0].headline}
            </div>
            <p className="text-slate-700">
              {analysis.prioritizedAlerts[0].actionGuidance}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <span className="text-base">✅</span>
            <span>All Clear! No storm or severe weather warnings today.</span>
          </div>
        )}
      </div>

      {/* FEATURE 2E: QUICK HELPFUL TOOLS */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/80 rounded-3xl p-4 shadow-sm transition-all space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Explore More
        </div>

        <button
          onClick={() => onSelectView('compare')}
          className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 text-left text-xs font-semibold text-slate-800 hover:text-indigo-900 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>🌍 Check Other Indian Cities</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => onSelectView('agromet')}
          className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-left text-xs font-semibold text-slate-800 hover:text-emerald-900 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>🌾 Farming & Gardening Bulletin</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </aside>
  );
};
