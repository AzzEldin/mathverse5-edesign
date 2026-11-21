import React, { useState } from 'react';
import { GitFork, Sparkles, RefreshCw, Layers } from 'lucide-react';

// Helper: Prime factorization
function getPrimeFactors(n) {
  const factors = [];
  let d = 2;
  let temp = n;
  while (temp >= 2) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d++;
    }
  }
  return factors;
}

// Helper: GCF & LCM
function getGcfAndLcm(factorsA, factorsB) {
  const copyB = [...factorsB];
  const common = [];
  const onlyA = [];

  for (let f of factorsA) {
    const idx = copyB.indexOf(f);
    if (idx !== -1) {
      common.push(f);
      copyB.splice(idx, 1);
    } else {
      onlyA.push(f);
    }
  }
  const onlyB = copyB;

  const gcf = common.reduce((acc, val) => acc * val, 1);
  const lcm = [...onlyA, ...common, ...onlyB].reduce((acc, val) => acc * val, 1);

  return { common, onlyA, onlyB, gcf, lcm };
}

export default function FactorTreeLab() {
  const [numA, setNumA] = useState(12);
  const [numB, setNumB] = useState(18);

  const factorsA = getPrimeFactors(numA);
  const factorsB = getPrimeFactors(numB);
  const { common, onlyA, onlyB, gcf, lcm } = getGcfAndLcm(factorsA, factorsB);

  const presets = [
    { a: 12, b: 18, label: "12 و 18" },
    { a: 8, b: 12, label: "8 و 12" },
    { a: 15, b: 20, label: "15 و 20" },
    { a: 24, b: 36, label: "24 و 36" },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold text-[#B51F3A] uppercase tracking-wider block">معمل المرحلة الثالثة</span>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            شجرة العوامل ومخطط فن لحساب (GCF & LCM)
          </h3>
        </div>

        {/* Inputs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs text-cyan-400 font-bold">العدد A:</span>
            <input
              type="number"
              min="2"
              max="99"
              value={numA}
              onChange={(e) => setNumA(Math.min(99, Math.max(2, parseInt(e.target.value) || 2)))}
              className="w-12 bg-transparent text-white font-math font-bold text-center focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs text-amber-400 font-bold">العدد B:</span>
            <input
              type="number"
              min="2"
              max="99"
              value={numB}
              onChange={(e) => setNumB(Math.min(99, Math.max(2, parseInt(e.target.value) || 2)))}
              className="w-12 bg-transparent text-white font-math font-bold text-center focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold">أمثلة سريعة:</span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => { setNumA(p.a); setNumB(p.b); }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-math border border-white/10 transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Trees & Factorization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Factorization of A */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-cyan-400">تحليل العدد {numA} إلى عوامل أولية</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-math text-xs font-bold">A</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xl font-bold font-math text-white">{numA} =</span>
            {factorsA.map((factor, idx) => (
              <span key={idx} className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-math font-black flex items-center justify-center text-sm shadow-sm">
                  {factor}
                </span>
                {idx < factorsA.length - 1 && <span className="mx-1.5 text-slate-500 font-math font-bold">×</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Factorization of B */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-amber-400">تحليل العدد {numB} إلى عوامل أولية</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-math text-xs font-bold">B</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xl font-bold font-math text-white">{numB} =</span>
            {factorsB.map((factor, idx) => (
              <span key={idx} className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-math font-black flex items-center justify-center text-sm shadow-sm">
                  {factor}
                </span>
                {idx < factorsB.length - 1 && <span className="mx-1.5 text-slate-500 font-math font-bold">×</span>}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Interactive Venn Diagram Container */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 space-y-4 text-center">
        <h4 className="text-sm font-bold text-slate-300 flex items-center justify-center gap-2">
          <Layers className="w-4 h-4 text-[#39A9D0]" /> مخطط فن التفاعلي للعوامل المشتركة
        </h4>

        {/* Venn circles illustration */}
        <div className="relative max-w-lg mx-auto h-48 sm:h-56 flex items-center justify-center select-none">
          
          {/* Circle A */}
          <div className="absolute left-4 sm:left-12 w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-cyan-400/50 bg-cyan-500/10 backdrop-blur-sm flex flex-col items-start justify-center pl-6">
            <span className="text-xs font-bold text-cyan-400 absolute top-3 left-6">العدد {numA}</span>
            <div className="flex flex-wrap gap-1.5 max-w-[80px]">
              {onlyA.map((f, i) => (
                <span key={i} className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-math font-bold text-xs flex items-center justify-center">
                  {f}
                </span>
              ))}
              {onlyA.length === 0 && <span className="text-[10px] text-slate-500">لا يوجد</span>}
            </div>
          </div>

          {/* Circle B */}
          <div className="absolute right-4 sm:right-12 w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-amber-400/50 bg-amber-500/10 backdrop-blur-sm flex flex-col items-end justify-center pr-6">
            <span className="text-xs font-bold text-amber-400 absolute top-3 right-6">العدد {numB}</span>
            <div className="flex flex-wrap gap-1.5 max-w-[80px]">
              {onlyB.map((f, i) => (
                <span key={i} className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-math font-bold text-xs flex items-center justify-center">
                  {f}
                </span>
              ))}
              {onlyB.length === 0 && <span className="text-[10px] text-slate-500">لا يوجد</span>}
            </div>
          </div>

          {/* Intersection (Common) */}
          <div className="z-10 flex flex-col items-center justify-center space-y-1">
            <span className="text-[10px] font-bold text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
              عوامل مشتركة
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[90px]">
              {common.map((f, i) => (
                <span key={i} className="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 font-math font-black text-sm flex items-center justify-center shadow-md animate-pulse">
                  {f}
                </span>
              ))}
              {common.length === 0 && <span className="text-xs text-slate-400 font-math">1</span>}
            </div>
          </div>

        </div>

        {/* Calculation Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
          
          {/* GCF Card */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/40 space-y-1">
            <span className="text-xs font-bold text-emerald-400 block">العامل المشترك الأكبر (ع.م.أ / GCF)</span>
            <div className="text-2xl font-black font-math text-white">
              {common.length > 0 ? common.join(' × ') : '1'} = <span className="text-emerald-400">{gcf}</span>
            </div>
            <p className="text-[11px] text-slate-400">حاصل ضرب العوامل المشتركة في التقاطع فقط</p>
          </div>

          {/* LCM Card */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-purple-500/40 space-y-1">
            <span className="text-xs font-bold text-purple-400 block">المضاعف المشترك الأصغر (م.م.أ / LCM)</span>
            <div className="text-2xl font-black font-math text-white">
              <span className="text-purple-400">{lcm}</span>
            </div>
            <p className="text-[11px] text-slate-400">حاصل ضرب جميع العوامل دون تكرار المشترك</p>
          </div>

        </div>

      </div>

    </div>
  );
}
