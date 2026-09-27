import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { WeatherBackground } from './components/WeatherBackground';
import { CitySelector } from './components/CitySelector';
import { SamsungHero } from './components/SamsungHero';
import { HourlyCurveCard } from './components/HourlyCurveCard';
import { RainComingCard } from './components/RainComingCard';
import { SamsungWeeklyCard } from './components/SamsungWeeklyCard';
import { ActivityForecastCard } from './components/ActivityForecastCard';
import { WeatherNewsCard } from './components/WeatherNewsCard';
import { AppleBentoGrid } from './components/AppleBentoGrid';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { generateWeatherData } from './utils/weatherGenerator';
import { fetchLiveWeather } from './services/realWeatherService';
import { analyzeAndPersonalize } from './utils/personalizationEngine';
import { autoDetectLocation } from './utils/locationService';
import { CITIES } from './data/cities';
import { CityProfile, ProfileId, WeatherData } from './types/weather';
import { Sparkles, Navigation } from 'lucide-react';

export default function App() {
  const [activeProfileId, setActiveProfileId] = useState<ProfileId>('farmer');
  const [currentCity, setCurrentCity] = useState<CityProfile>(() => {
    try {
      const saved = localStorage.getItem('mausam_current_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.name &&
          typeof parsed.lat === 'number' &&
          typeof parsed.lon === 'number'
        ) {
          return {
            ...CITIES[0],
            ...parsed,
          };
        }
      }
    } catch {
      // Fallback
    }
    return CITIES[0]; // New Delhi
  });

  const [locationSource, setLocationSource] = useState<'gps' | 'ip' | 'manual' | 'preset'>('preset');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string | null>(null);

  const [mobileTab, setMobileTab] = useState<MobileTab>('weather');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isFetchingWeather, setIsFetchingWeather] = useState<boolean>(false);

  // Weather data initialized with fast fallback, then updated with live telemetry
  const [weather, setWeather] = useState<WeatherData>(() =>
    generateWeatherData(currentCity, locationSource)
  );

  const [adaptationToast, setAdaptationToast] = useState<{
    message: string;
    type?: 'location' | 'profile' | 'refresh';
  } | null>(null);

  // Fetch real-time live weather from Open-Meteo & Air Quality APIs
  useEffect(() => {
    let isCancelled = false;
    async function loadLiveData() {
      setIsFetchingWeather(true);
      try {
        const live = await fetchLiveWeather(currentCity, locationSource);
        if (!isCancelled) {
          setWeather(live);
        }
      } catch {
        // Keeps current state if network is interrupted
      } finally {
        if (!isCancelled) {
          setIsFetchingWeather(false);
        }
      }
    }

    loadLiveData();
    return () => {
      isCancelled = true;
    };
  }, [currentCity, locationSource, refreshKey]);

  // Handler for automatic location detection
  const performAutoLocation = useCallback(async (isInitial: boolean = false) => {
    setIsLocating(true);
    setLocationStatusMessage(null);

    try {
      const result = await autoDetectLocation();
      setCurrentCity(result.city);
      setLocationSource(result.source);
      try {
        localStorage.setItem('mausam_current_city', JSON.stringify(result.city));
      } catch {
        // ignore
      }

      if (result.status === 'success') {
        const distStr = result.distanceToStationKm ? ` · ${result.distanceToStationKm} km to station` : '';
        setAdaptationToast({
          message: `📍 Auto-detected via GPS: ${result.city.name}${distStr}`,
          type: 'location',
        });
        setTimeout(() => setAdaptationToast(null), 4500);
      } else if (result.status === 'fallback_ip') {
        setAdaptationToast({
          message: `📍 Located via network: ${result.city.name} (${result.city.state})`,
          type: 'location',
        });
        setTimeout(() => setAdaptationToast(null), 4500);
      } else if (!isInitial && result.status === 'fallback_preset') {
        setLocationStatusMessage(
          'Browser GPS is unavailable or blocked in this environment. Showing National Capital Observatory (New Delhi). You can search or select any city below.'
        );
      }
    } catch {
      if (!isInitial) {
        setLocationStatusMessage('Location lookup timed out. Please select your station from the list below.');
      }
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Auto-detect user location automatically on initial mount
  useEffect(() => {
    performAutoLocation(true);
  }, [performAutoLocation]);

  // Run the core Personalization Engine pipeline
  const analysis = useMemo(() => {
    return analyzeAndPersonalize(activeProfileId, weather);
  }, [activeProfileId, weather]);

  const handleSelectProfile = (id: ProfileId) => {
    setActiveProfileId(id);
    const targetProfile = analysis.profile;
    setAdaptationToast({
      message: `Customized for ${targetProfile.name}`,
      type: 'profile',
    });
    setTimeout(() => setAdaptationToast(null), 3000);
  };

  const handleSelectCity = (city: CityProfile, source: 'gps' | 'ip' | 'manual' | 'preset' = 'manual') => {
    setCurrentCity(city);
    setLocationSource(source);
    setLocationStatusMessage(null);
    try {
      localStorage.setItem('mausam_current_city', JSON.stringify(city));
    } catch {
      // ignore
    }
    setAdaptationToast({
      message: `Live telemetry connected: ${city.name}`,
      type: 'location',
    });
    setTimeout(() => setAdaptationToast(null), 3000);
    // On mobile, automatically switch back to the weather tab
    setMobileTab('weather');
  };

  const activeCondition = weather.current.conditionCode;

  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-blue-500 selection:text-white relative pb-24 md:pb-8">
      {/* Dynamic Animated Weather Atmosphere Background with Day / Night and Weather-Matching Effects */}
      <WeatherBackground
        conditionCode={activeCondition}
        isRaining={activeCondition === 'rain' || activeCondition === 'heavy_rain' || activeCondition === 'thunderstorm'}
        isDay={weather.current.isDay}
      />

      {/* Toast Notification - Mobile & Tablet Responsive */}
      {adaptationToast && (
        <div className="fixed bottom-20 md:bottom-5 right-3 left-3 sm:left-auto sm:right-4 z-50 bg-black/80 backdrop-blur-2xl text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-white/25 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 sm:max-w-sm">
          {adaptationToast.type === 'location' ? (
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
          )}
          <span className="truncate flex-1">{adaptationToast.message}</span>
          <button
            onClick={() => setAdaptationToast(null)}
            className="text-white/60 hover:text-white p-1 text-sm leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Sleek Stylish Webpage Header - Responsive Typography */}
      <header className="pt-4 sm:pt-8 pb-2 sm:pb-3 text-center select-none relative max-w-2xl mx-auto px-4 w-full">
        <div className="inline-flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extralight tracking-[0.24em] sm:tracking-[0.28em] text-white drop-shadow-lg uppercase font-sans">
            Mausam
          </h1>
          <div className="h-[2px] w-20 sm:w-24 bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent mt-1.5 sm:mt-2 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.22em] sm:tracking-[0.25em] text-white/80 uppercase mt-1.5 sm:mt-2 drop-shadow-xs">
            Live Weather Observatory
          </p>
        </div>

        {/* Floating Subtle Temperature Unit Toggle */}
        <div className="absolute right-3 sm:right-4 top-5 sm:top-9 flex items-center">
          <button
            onClick={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
            className="px-3 py-1.5 min-h-[36px] rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-xs"
            title="Switch between °C and °F"
          >
            °{tempUnit}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-6 py-2 space-y-3.5 sm:space-y-4">
        {/* Tablet & Desktop City Selector (Translucent Glass) */}
        <div className="hidden md:block max-w-2xl mx-auto w-full">
          <CitySelector
            currentCity={currentCity}
            onSelectCity={handleSelectCity}
            onAutoDetect={() => performAutoLocation(false)}
            isLocating={isLocating}
            locationSource={locationSource}
            locationStatusMessage={locationStatusMessage}
          />
        </div>

        {/* Quick Persona Customization Pill Bar (Translucent Glass) */}
        <div className="flex items-center justify-between p-2 px-3 sm:px-4 rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/20 shadow-lg text-xs select-none gap-2 overflow-hidden max-w-2xl mx-auto w-full text-white">
          <span className="text-white/70 font-bold shrink-0 hidden sm:inline text-xs">
            Customize for:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full py-0.5 touch-pan-x">
            {[
              { id: 'farmer', name: 'Farmer 🌾' },
              { id: 'fitness_enthusiast', name: 'Fitness 🚴' },
              { id: 'parent', name: 'Kids 🧒' },
              { id: 'health_conscious', name: 'Clean Air 🌿' },
              { id: 'commuter', name: 'Commuter 🚗' },
              { id: 'traveller', name: 'Traveller ✈️' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectProfile(r.id as ProfileId)}
                className={`px-3 py-1.5 min-h-[36px] rounded-xl font-semibold transition-all cursor-pointer shrink-0 text-xs flex items-center ${
                  activeProfileId === r.id
                    ? 'bg-white/35 text-white border border-white/40 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                <span>{r.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Centered Translucent Weather Stream */}
        <div className="w-full max-w-2xl mx-auto space-y-3.5 sm:space-y-4">
          {/* When on mobile with 'cities' tab selected, display city selector */}
          {mobileTab === 'cities' ? (
            <div className="md:hidden">
              <CitySelector
                currentCity={currentCity}
                onSelectCity={handleSelectCity}
                onAutoDetect={() => performAutoLocation(false)}
                isLocating={isLocating}
                locationSource={locationSource}
                locationStatusMessage={locationStatusMessage}
              />
            </div>
          ) : (
            /* Primary Translucent Weather Canvas */
            <div className="w-full space-y-4 min-w-0">
              {/* 1. Samsung Hero Header: Location, Giant Temperature, Character & Grassy Hill Illustration, Tailored Advice */}
              <SamsungHero
                weather={weather}
                city={currentCity}
                tempUnit={tempUnit}
                onSelectCity={handleSelectCity}
                onAutoDetect={() => performAutoLocation(false)}
                isLocating={isLocating}
                activeProfileId={activeProfileId}
                isFetching={isFetchingWeather}
              />

              {/* 2. Hourly Temperature Curve Card with Sunset & 48-Hour outlook modal */}
              <HourlyCurveCard
                hourly={weather.hourly}
                weather={weather}
                tempUnit={tempUnit}
              />

              {/* 3. Rain / Precipitation Outlook Card */}
              <RainComingCard
                weather={weather}
              />

              {/* 4. Weekly Forecast Table (Yesterday, Today, etc.) with 15-Day outlook modal */}
              <SamsungWeeklyCard
                daily={weather.daily}
                tempUnit={tempUnit}
              />

              {/* 5. Activity Forecasts Card (Running, Cycling, Gardening, etc. with Face Badges & Settings) */}
              <ActivityForecastCard
                weather={weather}
                activeProfileId={activeProfileId}
              />

              {/* 6. Weather News Card Carousel */}
              <WeatherNewsCard />

              {/* 7. Persona-Customized Bento Tiles & Standard Environmental Readings (Translucent Glass) */}
              <AppleBentoGrid
                weather={weather}
                tempUnit={tempUnit}
                activeProfileId={activeProfileId}
                analysis={analysis}
              />
            </div>
          )}
        </div>
      </main>

      {/* Clean Translucent Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar (Visible only on mobile devices < lg) */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        activeProfileName={analysis.profile.name}
      />
    </div>
  );
}
