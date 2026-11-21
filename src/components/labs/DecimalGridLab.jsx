import React, { useState } from 'react';
import { Palette, RefreshCw, Plus, Minus, HelpCircle } from 'lucide-react';

export default function DecimalGridLab() {
  const [mode, setMode] = useState('addition'); // 'addition' | 'subtraction'
  const [valA, setValA] = useState(35); // 0.35 -> 35 squares
  const [valB, setValB] = useState(42); // 0.42 -> 42 squares

  const totalSum = (valA + valB) / 100;
  const totalDiff = Math.max(0, (valA - valB)) / 100;

  const setPreset = (a, b, m) => {
    setValA(a);
    setValB(b);
    setMode(m);
  };

  const resetGrid = () => {
    setValA(35);
    setValB(42);
    setMode('addition');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold text-[#E5A91B] uppercase tracking-wider block">معمل المرحلة الثانية</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            معمل شبكة المائة لجمع وطرح الكسور العشرية
          </h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setMode('addition')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              mode === 'addition' ? 'bg-[#39A9D0] text-white shadow-glow-primary' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> نموذج الجمع
          </button>
          <button
            onClick={() => setMode('subtraction')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              mode === 'subtraction' ? 'bg-[#B51F3A] text-white shadow-glow-crimson' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Minus className="w-3.5 h-3.5" /> نموذج الطرح
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-600 dark:text-slate-400 font-semibold">أمثلة جاهزة من كتاب الوزارة:</span>
        <button onClick={() => setPreset(35, 42, 'addition')} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 font-math border border-cyan-400/30">0.35 + 0.42</button>
        <button onClick={() => setPreset(50, 25, 'addition')} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 font-math border border-cyan-400/30">0.50 + 0.25</button>
        <button onClick={() => setPreset(84, 31, 'subtraction')} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-700 dark:text-red-300 font-math border border-red-400/30">0.84 - 0.31</button>
        <button onClick={() => setPreset(75, 40, 'subtraction')} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-700 dark:text-red-300 font-math border border-red-400/30">0.75 - 0.40</button>
        <button onClick={resetGrid} className="mr-auto px-2 py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"><RefreshCw className="w-3 h-3" /> إعادة الضبط</button>
      </div>

      {/* Grid and Controls layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 10x10 Grid View (Takes 7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
            {Array.from({ length: 100 }).map((_, index) => {
              const num = index + 1;
              let isColoredA = false;
              let isColoredB = false;
              let isSubtracted = false;

              if (mode === 'addition') {
                isColoredA = num <= valA;
                isColoredB = num > valA && num <= (valA + valB);
              } else {
                isColoredA = num <= valA;
                isSubtracted = num > (valA - valB) && num <= valA;
              }

              return (
                <div
                  key={index}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-sm transition-all duration-150 flex items-center justify-center text-[9px] font-math select-none ${
                    isColoredA && !isSubtracted
                      ? 'bg-[#39A9D0] text-white font-bold shadow-sm'
                      : isColoredB
                      ? 'bg-[#E5A91B] text-slate-950 font-bold shadow-sm'
                      : isSubtracted
                      ? 'bg-[#B51F3A]/70 text-white line-through border border-[#B51F3A]'
                      : 'bg-slate-200 dark:bg-slate-800/60 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                  title={`مربع ${num} / 100 = ${(num/100).toFixed(2)}`}
                >
                  {isSubtracted ? '✕' : ''}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#39A9D0]"></span>
              <span className="text-slate-700 dark:text-slate-300">الكسر الأول: <strong className="font-math text-cyan-700 dark:text-cyan-300">{(valA/100).toFixed(2)}</strong></span>
            </div>
            {mode === 'addition' ? (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#E5A91B]"></span>
                <span className="text-slate-700 dark:text-slate-300">الكسر الثاني: <strong className="font-math text-amber-700 dark:text-amber-300">{(valB/100).toFixed(2)}</strong></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#B51F3A]"></span>
                <span className="text-slate-700 dark:text-slate-300">المطروح (المشطوب): <strong className="font-math text-rose-700 dark:text-red-300">{(valB/100).toFixed(2)}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Sliders & Formula Card (Takes 5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Result Equation Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-lg text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              {mode === 'addition' ? 'معادلة الجمع الناتجة' : 'معادلة الطرح الناتجة'}
            </span>
            <div className="text-3xl font-black font-math text-slate-900 dark:text-white" dir="ltr">
              {mode === 'addition' ? (
                <>
                  <span className="text-[#39A9D0]">{(valA/100).toFixed(2)}</span>
                  <span className="mx-2 text-slate-400">+</span>
                  <span className="text-amber-600 dark:text-[#E5A91B]">{(valB/100).toFixed(2)}</span>
                  <span className="mx-2 text-slate-400">=</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{totalSum.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <span className="text-[#39A9D0]">{(valA/100).toFixed(2)}</span>
                  <span className="mx-2 text-slate-400">-</span>
                  <span className="text-[#B51F3A]">{(valB/100).toFixed(2)}</span>
                  <span className="mx-2 text-slate-400">=</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{totalDiff.toFixed(2)}</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
              {mode === 'addition' 
                ? `مجموع المربعات الملونة = ${valA} + ${valB} = ${valA + valB} مربعاً = ${totalSum.toFixed(2)}`
                : `المربعات المتبقية = ${valA} - ${valB} = ${valA - valB} مربعاً = ${totalDiff.toFixed(2)}`
              }
            </p>
          </div>

          {/* Slider for A */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-cyan-400/30 dark:border-cyan-500/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-700 dark:text-cyan-400 font-bold">الكسر الأول (اللون الأزرق السماوي):</span>
              <span className="text-slate-900 dark:text-white font-math font-bold text-sm">{(valA/100).toFixed(2)} ({valA} مربعاً)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={valA}
              onChange={(e) => setValA(parseInt(e.target.value))}
              className="w-full accent-[#39A9D0] cursor-pointer"
            />
          </div>

          {/* Slider for B */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-amber-400/30 dark:border-amber-500/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className={mode === 'addition' ? "text-amber-700 dark:text-amber-400 font-bold" : "text-rose-700 dark:text-red-400 font-bold"}>
                {mode === 'addition' ? 'الكسر الثاني (اللون الذهبي):' : 'المطروح (المشطوب بالأحمر):'}
              </span>
              <span className="text-slate-900 dark:text-white font-math font-bold text-sm">{(valB/100).toFixed(2)} ({valB} مربعاً)</span>
            </div>
            <input
              type="range"
              min="0"
              max={mode === 'addition' ? 100 - valA : valA}
              value={valB}
              onChange={(e) => setValB(parseInt(e.target.value))}
              className={`w-full cursor-pointer ${mode === 'addition' ? 'accent-[#E5A91B]' : 'accent-[#B51F3A]'}`}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
