import React from 'react';
import { Wind, Shield, AlertCircle, Info } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface AqiDetailWidgetProps {
  weather: WeatherData;
}

export const AqiDetailWidget: React.FC<AqiDetailWidgetProps> = ({ weather }) => {
  const { current } = weather;
  const aqi = current.aqi;

  const getAqiColor = (val: number) => {
    if (val <= 50) return { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'Good', border: 'border-emerald-200' };
    if (val <= 100) return { bg: 'bg-lime-500', text: 'text-lime-700', label: 'Satisfactory', border: 'border-lime-200' };
    if (val <= 200) return { bg: 'bg-yellow-500', text: 'text-yellow-700', label: 'Moderate', border: 'border-yellow-200' };
    if (val <= 300) return { bg: 'bg-orange-500', text: 'text-orange-700', label: 'Poor', border: 'border-orange-200' };
    if (val <= 400) return { bg: 'bg-rose-500', text: 'text-rose-700', label: 'Very Poor', border: 'border-rose-200' };
    return { bg: 'bg-purple-800', text: 'text-purple-900', label: 'Severe', border: 'border-purple-300' };
  };

  const aqiInfo = getAqiColor(aqi);

  const pollutants = [
    { name: 'PM2.5', label: 'Fine Inhalable Particles', value: `${current.pm25} µg/m³`, limit: '30 µg/m³', status: current.pm25 > 60 ? 'Unhealthy' : 'Acceptable' },
    { name: 'PM10', label: 'Respirable Particulates', value: `${current.pm10} µg/m³`, limit: '60 µg/m³', status: current.pm10 > 100 ? 'Elevated' : 'Moderate' },
    { name: 'NO₂', label: 'Nitrogen Dioxide', value: `${current.no2} µg/m³`, limit: '80 µg/m³', status: 'Good' },
    { name: 'O₃', label: 'Ground-Level Ozone', value: `${current.o3} µg/m³`, limit: '100 µg/m³', status: 'Moderate' },
    { name: 'CO', label: 'Carbon Monoxide', value: `${current.co} mg/m³`, limit: '2.0 mg/m³', status: 'Good' },
  ];

  return (
    <div className="bg-white/88 backdrop-blur-xl border border-white/70 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              National Air Quality Index (NAQI)
            </h3>
            <div className="text-xs text-slate-500">
              CPCB / SAFAR Real-time Continuous Ambient Air Quality Station
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${aqiInfo.border} bg-slate-50 ${aqiInfo.text}`}>
            {aqiInfo.label} Air
          </span>
        </div>
      </div>

      {/* Main AQI Score Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-medium text-slate-500 block">
              Continuous Ambient AQI Value
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold text-slate-900 tabular-nums">
                {aqi}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                · {current.aqiStatus}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 max-w-sm">
            {aqi > 200
              ? 'Significant respiratory discomfort to people with lung disease, asthma, and prolonged outdoor exposure.'
              : aqi > 100
              ? 'Breathing discomfort to people with asthma and respiratory sensitive conditions.'
              : 'Minimal impact; ambient air conditions safe for unrestricted outdoor exposure.'}
          </div>
        </div>

        {/* CPCB Standard Scale Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>0 Good</span>
            <span>100 Satisfactory</span>
            <span>200 Moderate</span>
            <span>300 Poor</span>
            <span>400 Very Poor</span>
            <span>500 Severe</span>
          </div>
          <div className="w-full h-2.5 rounded-full flex overflow-hidden">
            <div className="w-[10%] bg-emerald-500" title="0-50 Good" />
            <div className="w-[10%] bg-lime-500" title="51-100 Satisfactory" />
            <div className="w-[20%] bg-yellow-400" title="101-200 Moderate" />
            <div className="w-[20%] bg-orange-500" title="201-300 Poor" />
            <div className="w-[20%] bg-rose-600" title="301-400 Very Poor" />
            <div className="w-[20%] bg-purple-900" title="401-500 Severe" />
          </div>
        </div>
      </div>

      {/* Sub-pollutants table */}
      <div>
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Prominent Sub-Pollutant Concentrations
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {pollutants.map((p, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg">
              <div className="text-xs font-bold text-slate-900">
                {p.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate mb-1">
                {p.label}
              </div>
              <div className="text-sm font-mono font-bold text-slate-800 tabular-nums">
                {p.value}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Std: {p.limit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
