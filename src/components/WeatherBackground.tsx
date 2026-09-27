import React, { useMemo } from 'react';

interface WeatherBackgroundProps {
  conditionCode: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'heavy_rain' | 'thunderstorm' | 'fog' | 'dust';
  isRaining?: boolean;
  isDay?: boolean;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  conditionCode,
  isRaining = false,
  isDay = true,
}) => {
  // Generate stable random stars for night skies (70 stars with twinkling animation)
  const stars = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: `${(i * 1.42 + Math.sin(i * 7) * 2.5 + (i * 19) % 97) % 98}%`,
      top: `${(i * 1.1 + Math.cos(i * 11) * 3 + (i * 13) % 75) % 75}%`,
      size: `${1.2 + (i % 3) * 0.9}px`,
      delay: `${(i % 15) * 0.28}s`,
      duration: `${1.8 + (i % 6) * 0.6}s`,
      opacity: 0.35 + (i % 5) * 0.15,
    }));
  }, []);

  // Generate realistic diagonal falling rain drops (60 drops across viewport)
  const rainDrops = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${(i * 1.67) + Math.sin(i * 13) * 1.4}%`,
      delay: `${(i % 14) * 0.09}s`,
      duration: `${0.55 + (i % 8) * 0.06}s`,
      height: `${38 + (i % 6) * 14}px`,
      opacity: isDay ? (0.45 + (i % 4) * 0.15) : (0.55 + (i % 4) * 0.15),
    }));
  }, [isDay]);

  // Generate dust particles for haze/dust
  const dustParticles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${(i * 4.1) % 96}%`,
      top: `${15 + (i * 3.3) % 70}%`,
      delay: `${(i % 7) * 0.45}s`,
      duration: `${3.5 + (i % 5) * 0.8}s`,
      size: `${3 + (i % 3) * 2}px`,
    }));
  }, []);

  // Determine dynamic atmospheric sky gradient based on DAY/NIGHT and WEATHER
  const getSkyGradient = () => {
    if (!isDay) {
      // NIGHT ATMOSPHERE
      switch (conditionCode) {
        case 'thunderstorm':
          return 'from-[#030712] via-[#100b20] to-[#040817]';
        case 'heavy_rain':
        case 'rain':
          return 'from-[#030712] via-[#09152b] to-[#0d1d3d]';
        case 'cloudy':
          return 'from-[#080d1a] via-[#111c33] to-[#0f172a]';
        case 'partly_cloudy':
          return 'from-[#040916] via-[#0c1935] to-[#122347]';
        case 'fog':
          return 'from-[#080f1e] via-[#131c2e] to-[#172238]';
        case 'dust':
          return 'from-[#0f0b07] via-[#1c130d] to-[#14121b]';
        case 'sunny':
        default:
          // Deep, stunning clear starry night
          return 'from-[#030712] via-[#09162e] to-[#0e2247]';
      }
    } else {
      // DAYLIGHT ATMOSPHERE
      switch (conditionCode) {
        case 'thunderstorm':
          return 'from-[#0f172a] via-[#241a3d] to-[#141d33]';
        case 'heavy_rain':
        case 'rain':
          return 'from-[#1e293b] via-[#294263] to-[#1c324f]';
        case 'cloudy':
          return 'from-[#475569] via-[#64748b] to-[#3b4e6b]';
        case 'fog':
          return 'from-[#64748b] via-[#94a3b8] to-[#64748b]';
        case 'dust':
          return 'from-[#92400e]/80 via-[#b45309]/80 to-[#78350f]';
        case 'partly_cloudy':
          return 'from-[#0284c7] via-[#2563eb] to-[#1d4ed8]';
        case 'sunny':
        default:
          // Bright, radiant sunny daylight
          return 'from-[#38bdf8] via-[#2563eb] to-[#1d4ed8]';
      }
    }
  };

  const isRainActive = conditionCode === 'rain' || conditionCode === 'heavy_rain' || conditionCode === 'thunderstorm' || isRaining;
  const isCloudActive = conditionCode === 'partly_cloudy' || conditionCode === 'cloudy' || isRainActive;
  const isSunnyDayActive = isDay && (conditionCode === 'sunny' || conditionCode === 'partly_cloudy');
  const isClearNightActive = !isDay && (conditionCode === 'sunny' || conditionCode === 'partly_cloudy');
  const isFogActive = conditionCode === 'fog';
  const isDustActive = conditionCode === 'dust';
  const isStormActive = conditionCode === 'thunderstorm';

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-all duration-1000 bg-gradient-to-b ${getSkyGradient()}`}
      aria-hidden="true"
    >
      {/* Ambient Vignette & Sky Depth */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/35" />

      {/* ========================================================
          1. NIGHT SKY ELEMENTS: STARS, MOON & TWINKLING ATMOSPHERE
         ======================================================== */}
      {!isDay && (
        <div className="absolute inset-0">
          {/* Twinkling Stars */}
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animation: `starTwinkle ${star.duration} ease-in-out infinite`,
                animationDelay: star.delay,
              }}
            />
          ))}

          {/* Shooting Star occasionally streaking across the sky */}
          {isClearNightActive && (
            <div
              className="absolute top-16 right-24 w-28 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-100 to-white rounded-full blur-[0.5px]"
              style={{ animation: 'shootingStar 9s ease-in-out infinite 3s' }}
            />
          )}

          {/* Luminous Crescent Moon with Atmospheric Halo */}
          {isClearNightActive && (
            <div className="absolute top-6 right-8 sm:top-10 sm:right-16 w-32 h-32 sm:w-40 sm:h-40 pointer-events-none">
              {/* Outer Moonlight Halo */}
              <div
                className="absolute inset-0 rounded-full bg-cyan-200/15 blur-3xl"
                style={{ animation: 'moonGlow 5s ease-in-out infinite' }}
              />
              {/* Inner Moon Radial Glow */}
              <div className="absolute inset-6 rounded-full bg-indigo-200/20 blur-xl" />
              {/* Detailed SVG Crescent Moon */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(224,242,254,0.6)]">
                <defs>
                  <radialGradient id="moonGrad" cx="40%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#f0f9ff" />
                    <stop offset="100%" stopColor="#e0f2fe" />
                  </radialGradient>
                </defs>
                <path
                  d="M 50 10 A 40 40 0 1 0 90 70 A 32 32 0 1 1 50 10 Z"
                  fill="url(#moonGrad)"
                />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          2. DAYTIME SUN, RAYS & CORONAL LENS FLARE
         ======================================================== */}
      {isSunnyDayActive && (
        <div className="absolute top-[-80px] right-[-60px] sm:top-[-40px] sm:right-[-20px] w-96 h-96 sm:w-[520px] sm:h-[520px]">
          {/* Outer Sun Glow Pulsing */}
          <div
            className="absolute inset-0 rounded-full bg-amber-400/25 blur-3xl"
            style={{ animation: 'sunPulse 6s ease-in-out infinite' }}
          />
          {/* Middle Sun Warmth */}
          <div
            className="absolute inset-12 rounded-full bg-gradient-to-br from-amber-300/40 via-yellow-200/35 to-transparent blur-2xl"
            style={{ animation: 'sunPulse 4s ease-in-out infinite' }}
          />
          {/* Rotating Solar Coronal Flare Rays */}
          <div
            className="absolute inset-20 opacity-45"
            style={{ animation: 'sunRotate 65s linear infinite' }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full text-yellow-100">
              <circle cx="100" cy="100" r="45" fill="currentColor" fillOpacity="0.5" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="100"
                  y1="8"
                  x2="100"
                  y2="28"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${i * 30} 100 100)`}
                />
              ))}
            </svg>
          </div>
          {/* Sun Core Radiant Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-radial from-white via-yellow-100 to-amber-300 shadow-[0_0_90px_rgba(251,191,36,0.65)]" />
        </div>
      )}

      {/* ========================================================
          3. REALISTIC DRIFTING LAYERED CLOUDS
         ======================================================== */}
      {isCloudActive && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Slow Background Cloud Layer */}
          <div
            className={`absolute top-4 left-0 right-0 h-72 ${
              isDay ? 'opacity-35 fill-white/80' : 'opacity-20 fill-slate-300/70'
            }`}
            style={{ animation: 'cloudDriftSlow 55s ease-in-out infinite' }}
          >
            <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 0,160 Q 150,110 320,150 Q 480,90 650,140 Q 820,80 980,130 Q 1100,100 1200,150 L 1200,0 L 0,0 Z" />
              <circle cx="280" cy="130" r="90" />
              <circle cx="580" cy="120" r="110" />
              <circle cx="890" cy="110" r="95" />
            </svg>
          </div>

          {/* Faster Foreground Cloud Layer */}
          <div
            className={`absolute top-14 left-0 right-0 h-64 ${
              isDay ? 'opacity-50 fill-white/90' : 'opacity-25 fill-slate-400/80'
            }`}
            style={{ animation: 'cloudDriftFast 38s ease-in-out infinite' }}
          >
            <svg viewBox="0 0 1200 260" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 0,180 Q 200,120 400,170 Q 600,100 800,160 Q 1000,110 1200,170 L 1200,0 L 0,0 Z" />
              <circle cx="180" cy="140" r="80" />
              <circle cx="480" cy="130" r="100" />
              <circle cx="780" cy="120" r="90" />
              <circle cx="1040" cy="140" r="85" />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================
          4. FALLING DIAGONAL RAIN STREAKS & SPLASH MIST
         ======================================================== */}
      {isRainActive && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Streaming Rain Drops */}
          {rainDrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute w-[1.5px] rounded-full"
              style={{
                left: drop.left,
                top: '-80px',
                height: drop.height,
                background: isDay
                  ? 'linear-gradient(to bottom, transparent, rgba(186, 230, 253, 0.9), rgba(255, 255, 255, 0.95))'
                  : 'linear-gradient(to bottom, transparent, rgba(125, 211, 252, 0.7), rgba(224, 242, 254, 0.9))',
                opacity: drop.opacity,
                animation: `rainDrop ${drop.duration} linear infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}

          {/* Bottom Ground Splash Mist */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-400/20 via-sky-300/10 to-transparent blur-md pointer-events-none"
            style={{ animation: 'rainMist 3s ease-in-out infinite' }}
          />
        </div>
      )}

      {/* ========================================================
          5. THUNDERSTORM LIGHTNING FLASHES
         ======================================================== */}
      {isStormActive && (
        <div
          className="absolute inset-0 bg-white pointer-events-none"
          style={{ animation: 'lightningFlash 7s infinite' }}
        />
      )}

      {/* ========================================================
          6. FOG & MIST DRIFTING HORIZONTALLY
         ======================================================== */}
      {isFogActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/35 to-transparent blur-2xl"
            style={{ animation: 'fogSlide1 18s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/4 inset-x-0 h-1/2 bg-gradient-to-r from-slate-100/25 via-white/35 to-slate-100/25 blur-3xl"
            style={{ animation: 'fogSlide2 24s ease-in-out infinite' }}
          />
        </div>
      )}

      {/* ========================================================
          7. DUST & HAZE PARTICLES
         ======================================================== */}
      {isDustActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-amber-600/20 mix-blend-overlay" />
          {dustParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-amber-200/70 blur-[0.5px]"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animation: `dustFloat ${p.duration} ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Ambient gradient overlay so text on translucent cards stays perfectly readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
};
