'use client';

import React, { useState, useEffect } from 'react';
import { Wind, Shield, ZoomIn, Eye, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVoice: () => void;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenVoice,
  onOpenAudit,
}) => {
  const [theme, setTheme] = useState<'standard' | 'oled' | 'solar'>('standard');
  const [textScale, setTextScale] = useState<number>(100);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-oled', 'theme-solar');
    if (theme === 'oled') root.classList.add('theme-oled');
    if (theme === 'solar') root.classList.add('theme-solar');
  }, [theme]);

  const handleScaleCycle = () => {
    const next = textScale === 100 ? 125 : textScale === 125 ? 150 : 100;
    setTextScale(next);
    document.documentElement.style.setProperty('--text-scale', String(next / 100));
  };

  const navItems = [
    { id: 'dashboard', label: 'Air Dashboard' },
    { id: 'routine', label: 'GenAI Routines' },
    { id: 'iaq', label: 'Indoor Air (IAQ)' },
    { id: 'impact', label: 'Impact Simulator' },
    { id: 'community', label: 'Community Watch' },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Wind className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  AeroSphere<span className="text-sky-600 dark:text-sky-400">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  WCAG AAA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Winter Smog & Community Air Defense
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main Navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all touch-target flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action buttons & Accessibility Kiosk */}
          <div className="flex items-center gap-2">
            {/* Vayu AI Voice Companion */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm shadow hover:opacity-95 transition touch-target"
              aria-label="Open Vayu AI Voice Clean-Air Companion"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Vayu AI Companion</span>
            </button>

            {/* Accessibility: Text Scaler */}
            <button
              onClick={handleScaleCycle}
              className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target"
              title={`Enlarge text size (Current: ${textScale}%)`}
              aria-label={`Cycle text size, current ${textScale}%`}
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Accessibility: Contrast Theme Toggle */}
            <button
              onClick={() => {
                const next = theme === 'standard' ? 'oled' : theme === 'oled' ? 'solar' : 'standard';
                setTheme(next);
              }}
              className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target"
              title={`Switch high-contrast theme (Current: ${theme.toUpperCase()})`}
              aria-label={`Cycle contrast theme, current ${theme}`}
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* Security Audit Log */}
            <button
              onClick={onOpenAudit}
              className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target"
              title="View Security & Compliance Audit Log"
              aria-label="Open Security Audit Log"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
