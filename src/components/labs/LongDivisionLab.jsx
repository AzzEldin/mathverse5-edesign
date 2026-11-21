import React, { useState } from 'react';
import { Divide, ArrowDown, Play, SkipForward, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function LongDivisionLab() {
  const [dividend, setDividend] = useState(845);
  const [divisor, setDivisor] = useState(5);
  const [currentStep, setCurrentStep] = useState(0);

  // Generate division steps
  const generateSteps = (dend, dsor) => {
    const steps = [];
    const digits = dend.toString().split('').map(Number);
    let currentVal = 0;
    let quotientStr = "";

    for (let i = 0; i < digits.length; i++) {
      currentVal = currentVal * 10 + digits[i];
      const qDigit = Math.floor(currentVal / dsor);
      const product = qDigit * dsor;
      const remainder = currentVal - product;
      quotientStr += qDigit.toString();

      steps.push({
        stepIndex: i,
        digitBroughtDown: digits[i],
        workingValue: currentVal,
        quotientDigit: qDigit,
        quotientSoFar: parseInt(quotientStr),
        product: product,
        remainder: remainder,
        description: `خطوة ${i + 1}: نقسم ${currentVal} ÷ ${dsor} = ${qDigit}، نضرب ${qDigit} × ${dsor} = ${product}، نطرح ${currentVal} - ${product} = ${remainder}`
      });

      currentVal = remainder;
    }

    return steps;
  };

  const steps = generateSteps(dividend, divisor);
  const finalQuotient = Math.floor(dividend / divisor);
  const finalRemainder = dividend % divisor;

  const presets = [
    { dd: 845, dv: 5, label: "845 ÷ 5" },
    { dd: 624, dv: 6, label: "624 ÷ 6" },
    { dd: 752, dv: 4, label: "752 ÷ 4" },
    { dd: 125, dv: 5, label: "125 ÷ 5" },
    { dd: 87, dv: 7, label: "87 ÷ 7 (مع باقٍ)" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold text-[#E5A91B] uppercase tracking-wider block">معمل المرحلة الخامسة</span>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            مساعد خوارزمية القسمة المطولة خطوة بخطوة
          </h3>
        </div>

        {/* Inputs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs text-amber-400 font-bold">المقسوم:</span>
            <input
              type="number"
              min="10"
              max="999"
              value={dividend}
              onChange={(e) => {
                setDividend(Math.min(999, Math.max(10, parseInt(e.target.value) || 10)));
                setCurrentStep(0);
              }}
              className="w-14 bg-transparent text-white font-math font-bold text-center focus:outline-none"
            />
          </div>

          <span className="text-slate-500 font-math font-bold">÷</span>

          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs text-cyan-400 font-bold">المقسوم عليه:</span>
            <input
              type="number"
              min="2"
              max="20"
              value={divisor}
              onChange={(e) => {
                setDivisor(Math.min(20, Math.max(2, parseInt(e.target.value) || 2)));
                setCurrentStep(0);
              }}
              className="w-10 bg-transparent text-white font-math font-bold text-center focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold">أمثلة كتاب الوزارة:</span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => { setDividend(p.dd); setDivisor(p.dv); setCurrentStep(0); }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-math border border-white/10 transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Long Division Stepper Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Step-by-Step Bracket Visualizer (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">لوحة الخوارزمية المعيارية للقسمة:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" /> من البداية
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep >= steps.length - 1}
                className="px-3 py-1 rounded bg-[#E5A91B] text-slate-950 font-bold text-xs flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400"
              >
                الخطوة التالية <SkipForward className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Division Bracket Illustration */}
          <div className="p-6 bg-slate-950 rounded-xl border border-white/10 font-math text-lg flex flex-col items-center">
            
            {/* Quotient on top */}
            <div className="w-48 text-right pr-6 pb-1 text-2xl font-black text-emerald-400 tracking-widest border-b-2 border-white/40">
              {steps.slice(0, currentStep + 1).map(s => s.quotientDigit).join('')}
            </div>

            {/* Division Line & House */}
            <div className="w-64 flex items-center text-xl font-black pt-1">
              {/* Divisor */}
              <span className="w-16 text-center text-cyan-400">{divisor}</span>
              {/* House border and Dividend */}
              <span className="border-r-2 border-white/40 pr-3 text-white tracking-widest">
                {dividend}
              </span>
            </div>

            {/* Step breakdown stack */}
            <div className="w-64 pl-16 pt-3 space-y-2 text-sm font-math">
              {steps.slice(0, currentStep + 1).map((s, idx) => (
                <div key={idx} className="border-t border-white/10 pt-1 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>- {s.product}</span>
                    <span className="text-xs text-slate-500 font-sans">ضرب ({s.quotientDigit} × {divisor})</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-300">
                    <span>= {s.remainder}</span>
                    <span className="text-xs text-slate-500 font-sans">باقي الخطوة</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Active Step Description */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 text-center font-medium">
            {steps[currentStep]?.description}
          </div>

        </div>

        {/* Results & Verification Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Final Result Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-lg text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">خارج القسمة والباقي النهائي</span>
            <div className="text-3xl font-black font-math text-white">
              {dividend} ÷ {divisor} = <span className="text-emerald-400">{finalQuotient}</span>
            </div>
            {finalRemainder > 0 ? (
              <div className="text-sm font-bold text-amber-400 font-math">
                والباقي: <span className="text-red-400 font-black">{finalRemainder}</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-400">
                بدون باقٍ (قسمة منتهية)
              </div>
            )}
          </div>

          {/* Verification Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <CheckCircle2 className="w-4 h-4" /> التحقق من صحة ناتج القسمة:
            </div>
            <p className="text-slate-400 text-[11px]">
              المقسوم = (المقسوم عليه × خارج القسمة) + الباقي
            </p>
            <div className="p-3 bg-slate-950 rounded-lg font-math font-bold text-white text-center text-sm border border-white/10">
              ({divisor} × {finalQuotient}) + {finalRemainder} = {dividend}
            </div>
          </div>

          {/* The 4 Magic Steps Reminder */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-2 text-xs">
            <span className="font-bold text-slate-300 block mb-1">دورة خطوات القسمة الأربعة:</span>
            <div className="grid grid-cols-4 gap-1.5 text-center font-bold">
              <div className="p-2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">1. اقسم ÷</div>
              <div className="p-2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">2. اضرب ×</div>
              <div className="p-2 rounded bg-red-500/10 text-red-300 border border-red-500/20">3. اطرح -</div>
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">4. أنزل ↓</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
