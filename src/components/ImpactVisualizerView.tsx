'use client';

import React, { useState } from 'react';
import { Activity, Cigarette, Leaf, ShieldCheck, Zap, Info } from 'lucide-react';
import { ImpactService } from '@/lib/services/impact.service';

interface ImpactVisualizerViewProps {
  outdoorAqi: number;
}

export const ImpactVisualizerView: React.FC<ImpactVisualizerViewProps> = ({ outdoorAqi }) => {
  const [hoursFiltered, setHoursFiltered] = useState<number>(14);
  const [commuteShift, setCommuteShift] = useState<'CAR_TO_METRO' | 'SOLO_CAR_TO_CARPOOL' | 'CAR_TO_CYCLE_INDOOR' | 'AVOIDED_COMMUTE_WFH' | 'NONE'>('CAR_TO_METRO');
  const [useExhaust, setUseExhaust] = useState<boolean>(true);
  const [avoidBurning, setAvoidBurning] = useState<boolean>(true);

  const impact = ImpactService.calculate({
    outdoorPm25: outdoorAqi * 0.65,
    hoursIndoorsWithPurifier: hoursFiltered,
    commuteShift,
    usedRangeHood: useExhaust,
    avoidedBiomassBurning: avoidBurning,
  });

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Direct Personal & Community Impact Quantification
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Quantifies the exact scientific benefit of your low-emission daily choices on both your family's respiratory health and your city's shared airshed.
        </p>

        {/* Sliders and choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hours Indoors With Clean Air Filtration: {hoursFiltered} hrs/day
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={hoursFiltered}
              onChange={(e) => setHoursFiltered(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 hrs (No filter)</span>
              <span>12 hrs (Night-time)</span>
              <span>24 hrs (Full-day)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Commute Mode Shift:
            </label>
            <select
              value={commuteShift}
              onChange={(e) => setCommuteShift(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium touch-target"
            >
              <option value="CAR_TO_METRO">Shifted Solo ICE Car to Electric Metro / Train</option>
              <option value="SOLO_CAR_TO_CARPOOL">Shifted Solo ICE Car to 3-Person Carpool</option>
              <option value="AVOIDED_COMMUTE_WFH">Avoided Commute via Remote Work (WFH)</option>
              <option value="CAR_TO_CYCLE_INDOOR">Indoor stationary cycle workout instead of roadside run</option>
              <option value="NONE">No Commute Change</option>
            </select>
          </div>
        </div>

        {/* Checkbox behaviors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="exhaust-hood"
              checked={useExhaust}
              onChange={(e) => setUseExhaust(e.target.checked)}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 touch-target"
            />
            <label htmlFor="exhaust-hood" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Kitchen exhaust hood operated during cooking & simmering
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="wood-burn"
              checked={avoidBurning}
              onChange={(e) => setAvoidBurning(e.target.checked)}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 touch-target"
            />
            <label htmlFor="wood-burn" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Avoided wood burning fireplace & garden leaf burning
            </label>
          </div>
        </div>
      </div>

      {/* Quantified Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PM2.5 Inhalation Avoided */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-2">
            <span className="text-xs font-bold uppercase">PM2.5 Inhaled Avoided</span>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {impact.pm25InhaledAvoidedMicrograms}
            </span>
            <span className="text-xs font-bold text-slate-500">µg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Toxic microscopic particulates prevented from crossing the alveoli barrier into blood.
          </p>
        </div>

        {/* Berkeley Earth Cigarette Equivalence */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase">Smog Cigarettes Avoided</span>
            <Cigarette className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {impact.cigarettesEquivalentAvoided}
            </span>
            <span className="text-xs font-bold text-slate-500">cig equiv.</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Based on Berkeley Earth peer-reviewed exposure formula ($22 \mu g/m^3 \times 24h = 1$ cigarette).
          </p>
        </div>

        {/* CO2 Emissions Cut */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase">Greenhouse Gas (CO2)</span>
            <Leaf className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {impact.co2EmissionsSavedKg}
            </span>
            <span className="text-xs font-bold text-slate-500">kg CO2</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Plus <strong>{impact.noxEmissionsSavedGrams}g NOx</strong> toxic gas saved from local air.
          </p>
        </div>

        {/* Respiratory Risk Drop */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase">Acute Risk Drop</span>
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              -{impact.respiratoryRiskReductionPercent}%
            </span>
            <span className="text-xs font-bold text-slate-500">asthma risk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Reduction in acute bronchial inflammation and cardiovascular stress events.
          </p>
        </div>
      </div>

      {/* Scientific Impact Breakdown Note */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-4">
        <Info className="w-6 h-6 text-sky-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1">
            How Your Daily Decisions Create Tangible Change
          </h4>
          <p className="leading-relaxed">
            {impact.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
