import React, { useState, useEffect } from 'react';
import {
  Bike,
  Activity,
  Sprout,
  Compass,
  Settings,
  ChevronLeft,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Tent,
  Trees,
  Car,
  Plane,
  Wind,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { WeatherData, ProfileId } from '../types/weather';

interface ActivityForecastCardProps {
  weather: WeatherData;
  activeProfileId?: ProfileId;
}

interface ActivityItem {
  id: string;
  name: string;
  category: string;
  iconName: string;
  enabled: boolean;
}

export const ActivityForecastCard: React.FC<ActivityForecastCardProps> = ({
  weather,
  activeProfileId = 'farmer',
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // User's customizable activities with toggle status
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 'commuter', name: 'Daily Commute', category: 'Commuter', iconName: 'Commuter', enabled: true },
    { id: 'traveller', name: 'Travel & Flights', category: 'Traveller', iconName: 'Traveller', enabled: true },
    { id: 'clean_air', name: 'Clean Air & Breathing', category: 'Clean Air', iconName: 'CleanAir', enabled: true },
    { id: 'running', name: 'Running & Cardio', category: 'Fitness', iconName: 'Running', enabled: true },
    { id: 'cycling', name: 'Road Cycling', category: 'Fitness', iconName: 'Cycling', enabled: false },
    { id: 'gardening', name: 'Gardening & Farming', category: 'Agriculture', iconName: 'Gardening', enabled: false },
    { id: 'hiking', name: 'Hiking & Trails', category: 'Outdoors', iconName: 'Hiking', enabled: false },
  ]);

  // Synchronize active slide when the persona pill is changed
  useEffect(() => {
    const enabled = activities.filter((a) => a.enabled);
    let targetId = '';

    if (activeProfileId === 'commuter') targetId = 'commuter';
    else if (activeProfileId === 'traveller') targetId = 'traveller';
    else if (activeProfileId === 'health_conscious') targetId = 'clean_air';
    else if (activeProfileId === 'farmer') targetId = 'gardening';
    else if (activeProfileId === 'fitness_enthusiast') targetId = 'running';
    else if (activeProfileId === 'parent') targetId = 'clean_air';

    if (targetId) {
      // Auto-enable if disabled
      setActivities((prev) =>
        prev.map((a) => (a.id === targetId ? { ...a, enabled: true } : a))
      );
      const idx = activities.filter((a) => a.enabled || a.id === targetId).findIndex((a) => a.id === targetId);
      if (idx !== -1) setActiveSlide(idx);
    }
  }, [activeProfileId]);

  const enabledActivities = activities.filter((a) => a.enabled);
  const totalSlides = enabledActivities.length + 1;

  const toggleActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, enabled: !a.enabled };
        }
        return a;
      })
    );
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Commuter':
        return <Car className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]" />;
      case 'Traveller':
        return <Plane className="w-8 h-8 text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]" />;
      case 'CleanAir':
        return <Wind className="w-8 h-8 text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]" />;
      case 'Running':
        return (
          <svg className="w-8 h-8 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="14" cy="4" r="2" fill="currentColor" />
            <path d="M7 21l3-4 2-2 4 1 3 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 13l-2-2 2-3 4 1 2 3-1 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 13l3-1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'Cycling':
        return <Bike className="w-8 h-8 text-blue-300" />;
      case 'Gardening':
        return <Sprout className="w-8 h-8 text-emerald-400" />;
      case 'Hiking':
        return <Trees className="w-8 h-8 text-emerald-300" />;
      case 'Camping':
        return <Tent className="w-8 h-8 text-amber-300" />;
      default:
        return <Activity className="w-8 h-8 text-white" />;
    }
  };

  // Activity condition ratings calculated dynamically from current & upcoming weather
  const getActivityData = (act: ActivityItem) => {
    const isRain =
      weather.current.conditionCode === 'rain' ||
      weather.current.conditionCode === 'heavy_rain' ||
      weather.current.rainfallRateMmHr > 0;
    const isStorm = weather.current.conditionCode === 'thunderstorm';
    const temp = weather.current.temp;
    const aqi = weather.current.aqi;
    const visibility = weather.current.visibilityMeters;
    const windSpeed = weather.current.windSpeed;

    let rating: 'Good' | 'Fair' | 'Poor' = 'Fair';
    let summary = `Fair conditions for ${act.name.toLowerCase()} right now`;

    if (act.id === 'commuter') {
      if (isStorm || weather.current.rainfallRateMmHr >= 2.5) {
        rating = 'Poor';
        summary = 'Heavy rain & slick asphalt; expect traffic delays & reduced braking';
      } else if (visibility < 2500 || weather.current.conditionCode === 'fog') {
        rating = 'Poor';
        summary = 'Reduced visibility & dense mist; drive with low beams on';
      } else if (isRain) {
        rating = 'Fair';
        summary = 'Wet pavement & light spray; allow extra following distance';
      } else if (windSpeed > 35) {
        rating = 'Fair';
        summary = 'Gusty crosswinds on open highways; steer with caution';
      } else {
        rating = 'Good';
        summary = 'Dry roads, clear visibility & smooth transit conditions';
      }
    } else if (act.id === 'traveller') {
      if (isStorm) {
        rating = 'Poor';
        summary = 'Convective thunderstorm active; potential flight & rail departure delays';
      } else if (visibility < 1500) {
        rating = 'Poor';
        summary = 'Low airport visibility; check airline schedule before heading out';
      } else if (isRain || temp > 37 || temp < 8) {
        rating = 'Fair';
        summary = `Unsettled weather (${temp}°C); pack light layer & umbrella for sightseeing`;
      } else {
        rating = 'Good';
        summary = 'Clear sky corridors, stable atmosphere & optimal travel weather';
      }
    } else if (act.id === 'clean_air') {
      if (aqi > 200) {
        rating = 'Poor';
        summary = `Unhealthy AQI ${aqi}; high particulate density, use N95 mask outdoors`;
      } else if (aqi > 100) {
        rating = 'Fair';
        summary = `Moderate AQI ${aqi}; sensitive individuals should limit intense exertion`;
      } else {
        rating = 'Good';
        summary = `Clean Air (AQI ${aqi}); crisp atmospheric ventilation, safe for deep breathing`;
      }
    } else if (act.id === 'gardening') {
      if (isStorm) {
        rating = 'Poor';
        summary = 'Avoid open fields during lightning strikes';
      } else if (windSpeed <= 16 && !isRain) {
        rating = 'Good';
        summary = 'Ideal calm conditions for weeding, planting, and irrigation';
      } else {
        rating = 'Fair';
        summary = 'Breezy winds; hold off on chemical spraying';
      }
    } else if (act.id === 'running' || act.id === 'cycling') {
      if (isStorm || isRain) {
        rating = 'Poor';
        summary = `Slick surfaces & water accumulation for ${act.name.toLowerCase()}`;
      } else if (aqi > 180) {
        rating = 'Poor';
        summary = `High particulate count (AQI ${aqi}); indoor workout recommended`;
      } else if (temp >= 16 && temp <= 27 && aqi < 100) {
        rating = 'Good';
        summary = `Prime atmospheric conditions for outdoor training`;
      } else {
        rating = 'Fair';
        summary = `Comfortable conditions; stay hydrated during training`;
      }
    }

    // Dynamic next 3 upcoming hours for badges
    const nextHours = weather.hourly.slice(0, 3);
    const hourlyForecasts = nextHours.map((h, idx) => {
      let hRating: 'Good' | 'Fair' | 'Poor' = 'Good';
      let emoji: 'good' | 'fair' | 'poor' = 'good';

      if (act.id === 'commuter') {
        if (h.pop > 45 || h.conditionCode === 'thunderstorm') {
          hRating = 'Poor';
          emoji = 'poor';
        } else if (h.pop > 20) {
          hRating = 'Fair';
          emoji = 'fair';
        }
      } else if (act.id === 'traveller') {
        if (h.pop > 50 || h.conditionCode === 'thunderstorm') {
          hRating = 'Poor';
          emoji = 'poor';
        } else if (h.pop > 25 || h.windSpeed > 25) {
          hRating = 'Fair';
          emoji = 'fair';
        }
      } else if (act.id === 'clean_air') {
        const hAqi = h.aqi ?? aqi;
        if (hAqi > 200) {
          hRating = 'Poor';
          emoji = 'poor';
        } else if (hAqi > 100) {
          hRating = 'Fair';
          emoji = 'fair';
        }
      } else {
        if (h.pop > 40) {
          hRating = 'Poor';
          emoji = 'poor';
        } else if (h.temp > 32 || h.temp < 12) {
          hRating = 'Fair';
          emoji = 'fair';
        }
      }

      return {
        time: idx === 0 ? 'Now' : h.time,
        rating: hRating,
        emoji,
      };
    });

    return { rating, summary, hourlyForecasts };
  };

  const currentActivity = enabledActivities[activeSlide];

  return (
    <div className="relative">
      {/* Settings Screen View */}
      {showSettings ? (
        <div className="bg-slate-950/90 text-white rounded-3xl p-5 border border-white/20 shadow-2xl backdrop-blur-2xl transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-3 border-b border-white/15">
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 -ml-1 text-white hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="font-bold text-lg">Activity & Persona Forecasts</h3>
          </div>

          <p className="text-xs text-white/70 py-3 leading-relaxed">
            Select suitable condition monitors to show (Commuter, Traveller, Clean Air, Fitness, and Farming).
          </p>

          <div className="space-y-1 divide-y divide-white/10 max-h-72 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="py-2.5 flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-3 font-semibold text-white">
                  <div className="w-7 h-7 flex items-center justify-center">
                    {act.id === 'commuter' && '🚗'}
                    {act.id === 'traveller' && '✈️'}
                    {act.id === 'clean_air' && '🌿'}
                    {act.id === 'running' && '🏃'}
                    {act.id === 'cycling' && '🚴'}
                    {act.id === 'gardening' && '🌾'}
                    {act.id === 'hiking' && '🥾'}
                  </div>
                  <div>
                    <div>{act.name}</div>
                    <div className="text-[10px] text-white/50 font-normal">{act.category}</div>
                  </div>
                </div>

                {/* Translucent Glass Toggle Switch */}
                <button
                  onClick={() => toggleActivity(act.id)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                    act.enabled ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                      act.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Activity Forecast Card Carousel */
        <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-lg text-white select-none transition-all min-h-[160px] flex flex-col justify-between">
          {/* Header Bar: Category pills for quick 1-tap switching */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1 pr-1">
              {enabledActivities.map((act, idx) => (
                <button
                  key={act.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeSlide === idx
                      ? 'bg-white/35 text-white border border-white/40 shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white/70'
                  }`}
                >
                  {act.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
              title="Customize Activities"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {activeSlide < enabledActivities.length && currentActivity ? (
            /* Active Activity Slide */
            (() => {
              const data = getActivityData(currentActivity);
              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Icon, Name, Rating, Subtitle */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
                        {getActivityIcon(currentActivity.iconName)}
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-[11px] font-semibold text-cyan-200/80 uppercase tracking-wider">
                          {currentActivity.category} Condition Rating
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {data.rating}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              data.rating === 'Good'
                                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                                : data.rating === 'Fair'
                                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                                : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                            }`}
                          >
                            {data.rating === 'Good' ? 'Optimal' : data.rating === 'Fair' ? 'Moderate' : 'Caution'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-white/90 mt-2 font-medium leading-relaxed">
                      {data.summary}
                    </div>
                  </div>

                  {/* Right: Hourly Badges */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                    {data.hourlyForecasts.map((hf, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/10 border border-white/15 flex-1 sm:flex-initial min-w-[54px] text-center"
                      >
                        <span className="text-[10px] text-white/80 font-medium">{hf.time}</span>
                        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                          {hf.emoji === 'good' ? (
                            <Smile className="w-4 h-4 text-emerald-300 drop-shadow-[0_0_6px_rgba(110,231,183,0.8)]" />
                          ) : hf.emoji === 'fair' ? (
                            <Meh className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" />
                          ) : (
                            <Frown className="w-4 h-4 text-rose-300 drop-shadow-[0_0_6px_rgba(253,164,175,0.8)]" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-white">{hf.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Settings Prompt Slide */
            <div className="py-4 text-center flex flex-col items-center justify-center gap-3">
              <p className="text-sm font-semibold text-white">
                Customize suitable conditions for commute, travel, clean air, and fitness.
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-2 rounded-2xl bg-white/25 hover:bg-white/35 text-white font-semibold text-xs tracking-tight transition-all cursor-pointer shadow-xs border border-white/30"
              >
                Configure Monitors
              </button>
            </div>
          )}

          {/* Pagination Navigation & Dots */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10 text-xs">
            <button
              onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))}
              className="text-white/60 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSlide === i ? 'w-5 bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))}
              className="text-white/60 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="text-[11px] hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
