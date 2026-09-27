import React from 'react';
import { Sprout, Droplets, Wind, ShieldCheck, Thermometer, Calendar, FileText } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface AgrometBulletinModalProps {
  weather: WeatherData;
}

export const AgrometBulletinModal: React.FC<AgrometBulletinModalProps> = ({ weather }) => {
  const { current } = weather;

  const cropAdvisories = [
    {
      crop: 'Wheat (गेहूं)',
      stage: 'Crown Root Initiation (CRI) / Tillering',
      advisory: `Topsoil moisture is currently ${current.soilMoistureTop15cmPercent}%. If no rainfall occurs within 48h, apply light irrigation. Avoid water stagnation to prevent yellowing of leaves.`,
      pestRisk: 'Low aphid activity; monitor field borders.',
      status: 'Favorable',
    },
    {
      crop: 'Mustard / Rapeseed (सरसों)',
      stage: 'Pod Formation / Flowering',
      advisory: `Morning relative humidity is ${current.humidity}%. High humidity favors Alternaria blight. Spray Dithane M-45 @ 2g/litre only when wind is under 12 km/h.`,
      pestRisk: 'Moderate white rust and aphid risk.',
      status: 'Caution',
    },
    {
      crop: 'Vegetables & Pulses (सब्जियां एवं दालें)',
      stage: 'Vegetative growth',
      advisory: 'Provide staking for tomato and pea crops to avoid soil-borne fungal contamination. Maintain shallow intercultural hoeing to break capillary evaporation.',
      pestRisk: 'Fruit borer monitoring advised.',
      status: 'Normal',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Official Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              GKMS · Gramin Krishi Mausam Sewa
            </span>
            <span className="text-xs text-slate-500">
              ग्रामीण कृषि मौसम सेवा
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            District Agromet Advisory Bulletin (AAS)
          </h2>
          <p className="text-xs text-slate-500">
            Issued jointly by India Meteorological Department (IMD) & ICAR Krishi Vigyan Kendra (KVK)
          </p>
        </div>

        <div className="text-right text-xs font-mono text-slate-500">
          <div>Bulletin No: IMD/GKMS/2026/09</div>
          <div className="text-slate-400">Valid for: {weather.cityName} District</div>
        </div>
      </div>

      {/* Agromet Physical Measurements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold mb-1">
            <Droplets className="w-4 h-4 text-amber-600" />
            <span>Root-Zone Soil Moisture</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {current.soilMoistureTop15cmPercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            0-15cm topsoil (Deep: {current.soilMoisture50cmPercent}%)
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span>Seedbed Soil Temp</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {current.soilTempCelsius}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Optimal germination range
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-blue-800 font-semibold mb-1">
            <Wind className="w-4 h-4 text-blue-600" />
            <span>Evapotranspiration (ET₀)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {current.evapotranspirationMmDay} <span className="text-xs font-sans font-normal">mm/d</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Atmospheric crop water demand
          </div>
        </div>

        <div className="bg-indigo-50/60 border border-indigo-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-indigo-800 font-semibold mb-1">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Foliar Spray Suitability</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {current.windSpeed <= 14 ? 'SAFE' : 'HOLD'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Wind: {current.windSpeed} km/h (Limit: 14 km/h)
          </div>
        </div>
      </div>

      {/* Crop-Specific Action Matrix */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Standing Crop Weather Advisories & Stage Recommendations
        </h3>
        <div className="space-y-3">
          {cropAdvisories.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="md:w-1/4">
                <div className="text-sm font-bold text-slate-900">{item.crop}</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">{item.stage}</div>
                <span
                  className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                    item.status === 'Favorable'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'Caution'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.status} Condition
                </span>
              </div>

              <div className="flex-1 text-xs text-slate-700 leading-relaxed">
                <div className="font-semibold text-slate-900 mb-1">Operational Action:</div>
                <p className="mb-2">{item.advisory}</p>
                <div className="text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{item.pestRisk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Livestock Advisory Footer */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 text-xs text-slate-800">
        <div className="font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-amber-700" />
          <span>Livestock & Dairy Management Guidance:</span>
        </div>
        <p className="leading-relaxed">
          Ensure shaded sheds and uninterrupted supply of cool drinking water for milch cattle. Maintain dry bedding to avert mastitis during humid evening hours. Vaccinate cattle against Foot & Mouth Disease (FMD) as per veterinary schedule.
        </p>
      </div>
    </div>
  );
};
