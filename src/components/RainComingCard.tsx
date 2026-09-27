import React from 'react';
import { Umbrella, CloudRain, CloudLightning, Sun, Moon } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface RainComingCardProps {
  weather: WeatherData;
}

export const RainComingCard: React.FC<RainComingCardProps> = ({ weather }) => {
  const current = weather.current || { conditionCode: 'partly_cloudy', rainfallRateMmHr: 0, isDay: true };
  const hourly = Array.isArray(weather.hourly) ? weather.hourly : [];
  const isStorm = current.conditionCode === 'thunderstorm';
  const isRainNow =
    current.conditionCode === 'rain' ||
    current.conditionCode === 'heavy_rain' ||
    (current.rainfallRateMmHr ?? 0) > 0 ||
    ((hourly[0]?.pop ?? 0) >= 60 && (hourly[0]?.conditionCode === 'rain' || hourly[0]?.conditionCode === 'heavy_rain'));

  // Future rain starting STRICTLY from the upcoming hour onwards (never past or current hour)
  const nextRainHour = hourly.slice(1).find((h) => (h.pop ?? 0) >= 35);

  const currentHourPop = hourly[0]?.pop || 0;
  const hourlyPops = hourly.slice(0, 6).map((h) => h.pop ?? 0);
  const maxRainChance = Math.max(
    isRainNow ? 85 : 0,
    currentHourPop,
    ...(hourlyPops.length > 0 ? hourlyPops : [0])
  );

  const isRainExpected = isStorm || isRainNow || (nextRainHour !== undefined && maxRainChance >= 35);
  const displayChance = isRainExpected ? Math.max(35, maxRainChance) : Math.max(5, maxRainChance);
  const isNight = !current.isDay;

  let title = 'Precipitation Outlook';
  let subtitle = isNight
    ? 'Dry skies and clear weather expected tonight'
    : 'Dry conditions and clear skies expected today';

  if (isStorm) {
    title = 'Storms Active';
    subtitle = isRainNow
      ? 'Thunderstorms and rain active in your area'
      : nextRainHour
      ? `Thunderstorms possible around ${nextRainHour.time}`
      : 'Storm conditions possible later';
  } else if (isRainNow) {
    title = 'Rain Occurring Now';
    subtitle = 'Rainfall currently active across your area';
  } else if (nextRainHour) {
    title = 'Rain Expected';
    subtitle = `Rain possible around ${nextRainHour.time}`;
  } else if (maxRainChance >= 35) {
    title = 'Precipitation Outlook';
    subtitle = isNight ? 'Isolated showers possible tonight' : 'Chance of scattered rain later today';
  }

  return (
    <div className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 sm:p-5 shadow-lg text-white select-none transition-all flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
          {isStorm ? (
            <CloudLightning className="w-6 h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]" />
          ) : isRainNow || isRainExpected ? (
            <Umbrella className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]" />
          ) : isNight ? (
            <Moon className="w-6 h-6 text-cyan-200 fill-cyan-200/30" />
          ) : (
            <Sun className="w-6 h-6 text-amber-300 fill-amber-300/40" />
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">
            {title}
          </div>
          <div className="text-sm sm:text-base font-semibold text-white tracking-tight mt-0.5">
            {subtitle}
          </div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-3xl sm:text-4xl font-light text-white tracking-tight">
          {displayChance}%
        </div>
        <div className="text-[10px] text-white/60 uppercase tracking-wider font-medium">
          Probability
        </div>
      </div>
    </div>
  );
};
