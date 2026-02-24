"use client";

import React, { useState } from 'react';
import { Timer, BarChart2, Tag, Shield, Play, CheckCircle } from 'lucide-react';
import { SectionTitle } from './SectionTitle';

const MOCK_BARS = [
  { label: 'Mon', pct: 40 },
  { label: 'Tue', pct: 65 },
  { label: 'Wed', pct: 25 },
  { label: 'Thu', pct: 80 },
  { label: 'Fri', pct: 55 },
  { label: 'Sat', pct: 100 },
  { label: 'Sun', pct: 70 },
];

export const Features = () => {
  const [timeTargetEnabled, setTimeTargetEnabled] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <SectionTitle
        title="Features"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Session Tracking ── */}
        <div className="md:col-span-2 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Timer className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Smart Session Tracking</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Start focused sessions with one click, set time targets, and build consistent habits.
            </p>
          </div>

          {/* Mirror of actual Dashboard CTA */}
          <div className="p-6">
            <div className="relative overflow-hidden rounded-2xl bg-mesh border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-8">
                <div className="flex flex-col gap-2 text-center">
                  <h2 className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold leading-tight">
                    Ready to focus?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
                    Hit the button below and start new working session.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                  <button className="flex w-full items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md cursor-default text-xs sm:text-sm">
                    <Play size={18} fill="currentColor" />
                    Start New Working Session
                  </button>

                  <div className="flex flex-col w-full gap-3 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Target</span>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={timeTargetEnabled}
                          onChange={() => setTimeTargetEnabled(!timeTargetEnabled)}
                        />
                        <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                      </div>
                    </label>

                    {timeTargetEnabled && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <input
                          type="number"
                          min="1"
                          placeholder="Enter minutes"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">min</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tags & Notes ── */}
        <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tags & Notes</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Categorize sessions with custom colored tags and detailed notes.
            </p>
          </div>

          {/* Mirror of actual SessionReport tag selector + notes */}
          <div className="p-6">
            <div className="bg-[#111418] dark:bg-[#1a2027] rounded-xl border border-[#283039] p-5 flex flex-col gap-5">
              {/* Tag selector */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Categorize Session <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-[#222831] border border-[#283039] min-h-10.5 items-center">
                  <div
                    className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6' }}
                  >
                    <Tag size={14} /> coding
                  </div>
                  <div
                    className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6' }}
                  >
                    <Tag size={14} /> landing-page
                  </div>
                  <span className="text-[#6b7280] text-sm ml-1">Add a tag...</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-[#9dabb9] text-xs px-2 py-1 rounded-md bg-[#283039] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>reading</span>
                  <span className="text-[#9dabb9] text-xs px-2 py-1 rounded-md bg-[#283039] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>studying</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Session Notes <span className="text-red-500">*</span></label>
                <div className="w-full rounded-lg bg-[#222831] border border-[#283039] p-3 text-sm text-[#6b7280] min-h-20">
                  Describe what you accomplished...
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 h-10 rounded-lg bg-transparent border border-[#3e4856] text-[#9dabb9] font-bold text-sm cursor-default">
                  Discard
                </button>
                <button className="flex-2 h-10 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 cursor-default shadow-lg shadow-primary/20">
                  <CheckCircle size={16} /> Save Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Analytics ── */}
        <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Deep Analytics</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Weekly and monthly charts with key insights to track your progress.
            </p>
          </div>

          {/* Mirror of actual ActivityChart */}
          <div className="p-6">
            <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-5">
              {/* Chart header */}
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">Weekly Activity</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">12h 30m</span>
                    <span className="text-xs font-medium text-slate-500">Total</span>
                  </div>
                </div>
                <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">Weekly</span>
                  <span className="px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">Monthly</span>
                </div>
              </div>

              {/* Bar chart (CSS only — matches actual ActivityChart bars) */}
              <div className="relative h-36 w-full flex items-end gap-1.5 sm:gap-2 justify-between pt-4 pb-6 border-b border-[#e5e7eb] dark:border-[#283039] pl-8">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-4 bottom-6 flex flex-col justify-between text-[10px] text-[#9dabb9] font-medium text-right pr-1 w-8">
                  <span>8h</span>
                  <span>4h</span>
                  <span>0h</span>
                </div>

                {MOCK_BARS.map((bar, i) => (
                  <div key={i} className="flex-1 h-full flex items-end">
                    <div
                      className="w-full rounded-t-sm bg-primary"
                      style={{ height: `${bar.pct}%` }}
                    ></div>
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between pt-2 text-[#9dabb9] text-[10px] font-medium pl-8">
                {MOCK_BARS.map((bar, i) => (
                  <span key={i} className={`flex-1 text-center ${i === 5 ? 'text-primary font-bold' : ''}`}>
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Security ── */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Secure & Private</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Your data stays yours. Robust JWT authentication and encrypted passwords keep your productivity habits private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
