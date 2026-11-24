'use client';

import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Sun, CheckCircle2 } from 'lucide-react';
import { CityLocation } from '@/lib/types';

interface SmogForecastBannerProps {
  currentCity: CityLocation;
  allCities: CityLocation[];
  onSelectCity: (cityId: string) => void;
}

export const SmogForecastBanner: React.FC<SmogForecastBannerProps> = ({
  currentCity,
  allCities,
  onSelectCity,
}) => {
  const metrics = currentCity.currentAirQuality;

  const getAqiBadgeStyle = (aqi: number) => {
    if (aqi <= 50) return 'bg-emerald-500 text-white';
    if (aqi <= 100) return 'bg-amber-400 text-slate-900';
    if (aqi <= 150) return 'bg-orange-500 text-white';
    if (aqi <= 200) return 'bg-red-500 text-white';
    if (aqi <= 300) return 'bg-purple-600 text-white';
    return 'bg-red-950 text-red-100 border-2 border-red-500';
  };

  const getInversionBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 border-red-400';
      case 'HIGH':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-400';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-400';
      default:
        return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-400';
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8">
      {/* Top Header: City Selector & Current Time */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Real-Time Urban Airshed Monitoring
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {currentCity.name}, {currentCity.country}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="city-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Select Hotspot:
          </label>
          <select
            id="city-select"
            value={currentCity.id}
            onChange={(e) => onSelectCity(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 touch-target"
            aria-label="Select city location"
          >
            {allCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} ({city.country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary AQI & Inversion Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {/* AQI Gauge */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black ${getAqiBadgeStyle(metrics.aqi)}`}>
            <span className="text-2xl">{metrics.aqi}</span>
            <span className="text-[10px] uppercase font-bold tracking-tight">US AQI</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics.category.replace('_', ' ')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Dominant: <strong>{metrics.dominantPollutant} ({metrics.pm25} µg/m³)</strong>
            </p>
          </div>
        </div>

        {/* Temperature Inversion Risk */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Inversion Hazard</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${getInversionBadgeStyle(metrics.inversionRisk)}`}>
                {metrics.inversionRisk} HAZARD
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Cold layer ({metrics.temperature}°C, {metrics.humidity}% humidity) traps vehicle/smoke emissions at ground level.
            </p>
          </div>
        </div>

        {/* Safe Solar Ventilation Window */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Sun className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Solar Flush Window</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              11:30 AM — 02:30 PM
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Midday solar convection temporarily breaks inversion cap. Best time for brief home air flushing.
            </p>
          </div>
        </div>
      </div>

      {/* 24-Hour Hourly Inversion Curve */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              24-Hour Smog Inversion Curve & Activity Safety
            </h2>
          </div>
          <span className="text-xs text-slate-500">Dual Encoded: Color + Text Label</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {currentCity.hourlyForecast.map((hour, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                hour.safeForOutdoor
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{hour.hour}</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${getAqiBadgeStyle(hour.aqi)}`}>
                  {hour.aqi}
                </span>
              </div>
              <div className="my-2">
                <span className="text-[11px] text-slate-600 dark:text-slate-300 block">
                  PM2.5: {hour.pm25} µg/m³
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  {hour.inversionRisk} Inversion
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                {hour.safeForOutdoor ? (
                  <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Outdoor OK
                  </span>
                ) : (
                  <span className="text-red-700 dark:text-red-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Stay Inside
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
