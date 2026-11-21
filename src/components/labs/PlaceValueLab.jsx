import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, ArrowLeft, ArrowRight, RefreshCw, Sparkles, MoveHorizontal } from 'lucide-react';
import Fraction from '../common/Fraction.jsx';

export default function PlaceValueLab() {
  const [digits, setDigits] = useState({
    hundreds: 3,
    tens: 4,
    ones: 5,
    tenths: 6,
    hundredths: 7,
    thousandths: 8,
  });

  const [compareNum2, setCompareNum2] = useState("345.650");

  const scrollContainerRef = useRef(null);
  const decimalPointRef = useRef(null);

  // Auto-center the place value table on mobile on initial load
  const centerTable = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetScroll = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  const scrollToLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollToRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ left: container.scrollWidth - container.clientWidth, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timer = setTimeout(centerTable, 150);
    return () => clearTimeout(timer);
  }, []);

  const updateDigit = (place, delta) => {
    setDigits(prev => {
      const newVal = (prev[place] + delta + 10) % 10;
      return { ...prev, [place]: newVal };
    });
  };

  const getStandardNumber = () => {
    const whole = digits.hundreds * 100 + digits.tens * 10 + digits.ones;
    return `${whole}.${digits.tenths}${digits.hundredths}${digits.thousandths}`;
  };

  const currentVal = parseFloat(getStandardNumber());

  const handleMultiply10 = () => {
    // shift values to left (increase place value)
    setDigits(prev => ({
      hundreds: prev.tens,
      tens: prev.ones,
      ones: prev.tenths,
      tenths: prev.hundredths,
      hundredths: prev.thousandths,
      thousandths: 0
    }));
  };

  const handleDivide10 = () => {
    // shift values to right (decrease place value)
    setDigits(prev => ({
      hundreds: 0,
      tens: prev.hundreds,
      ones: prev.tens,
      tenths: prev.ones,
      hundredths: prev.tenths,
      thousandths: prev.hundredths
    }));
  };

  const resetDigits = () => {
    setDigits({
      hundreds: 3,
      tens: 4,
      ones: 5,
      tenths: 6,
      hundredths: 7,
      thousandths: 8,
    });
    setTimeout(centerTable, 50);
  };

  const compVal2 = parseFloat(compareNum2) || 0;
  const comparisonResult = currentVal > compVal2 ? '>' : currentVal < compVal2 ? '<' : '=';

  const columns = [
    {
      id: 'hundreds',
      name: 'مئات',
      sub: '(100)',
      color: 'cyan',
      val: digits.hundreds,
      displayVal: digits.hundreds * 100,
      isPoint: false
    },
    {
      id: 'tens',
      name: 'عشرات',
      sub: '(10)',
      color: 'cyan',
      val: digits.tens,
      displayVal: digits.tens * 10,
      isPoint: false
    },
    {
      id: 'ones',
      name: 'آحاد',
      sub: '(1)',
      color: 'cyan',
      val: digits.ones,
      displayVal: digits.ones,
      isPoint: false
    },
    {
      id: 'point',
      name: 'العلامة',
      sub: '(.) فاصلة',
      color: 'rose',
      val: '.',
      displayVal: '(.)',
      isPoint: true
    },
    {
      id: 'tenths',
      name: 'جزء من 10',
      sub: '(0.1)',
      color: 'amber',
      val: digits.tenths,
      displayVal: `0.${digits.tenths}`,
      isPoint: false
    },
    {
      id: 'hundredths',
      name: 'جزء من 100',
      sub: '(0.01)',
      color: 'amber',
      val: digits.hundredths,
      displayVal: `0.0${digits.hundredths}`,
      isPoint: false
    },
    {
      id: 'thousandths',
      name: 'جزء من 1000',
      sub: '(0.001)',
      color: 'amber',
      val: digits.thousandths,
      displayVal: `0.00${digits.thousandths}`,
      isPoint: false
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 space-y-5 sm:space-y-6">
      
      {/* Lab Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold text-[#39A9D0] uppercase tracking-wider block">معمل المرحلة الأولى</span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            لوحة القيمة المكانية التفاعلية للكسور العشرية
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetDigits}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs border border-slate-300 dark:border-white/10 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> إعادة الضبط
          </button>
        </div>
      </div>

      {/* Mobile Quick Navigation & Centering Shortcuts */}
      <div className="flex sm:hidden items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 text-[11px]" dir="rtl">
        <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 shrink-0">
          <MoveHorizontal className="w-3.5 h-3.5 text-[#39A9D0]" />
          <span>تنقل:</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={scrollToLeft}
            className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[#39A9D0] font-bold text-[10px] transition border border-cyan-500/20"
          >
            ← الصحيحة
          </button>
          <button
            onClick={centerTable}
            className="px-2.5 py-1 rounded-lg bg-[#E5A91B]/15 hover:bg-[#E5A91B]/25 text-[#E5A91B] font-black text-[10px] transition border border-amber-500/30 shadow-sm"
          >
            العلامة (.) 🎯
          </button>
          <button
            onClick={scrollToRight}
            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[#E5A91B] font-bold text-[10px] transition border border-amber-500/20"
          >
            العشرية →
          </button>
        </div>
      </div>

      {/* Main Interactive Place Value Table (strictly aligned 3-slot grid) */}
      <div 
        ref={scrollContainerRef} 
        className="overflow-x-auto py-2 scroll-smooth scrollbar-thin"
        dir="ltr"
      >
        <div className="min-w-[500px] sm:min-w-[620px] grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {columns.map((col) => {
            const isCyan = col.color === 'cyan';
            const isRose = col.color === 'rose';

            return (
              <div
                key={col.id}
                ref={col.isPoint ? decimalPointRef : null}
                className={`flex flex-col justify-between h-[155px] sm:h-[175px] rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 transition-all shadow-sm ${
                  isRose
                    ? 'bg-rose-50 dark:bg-[#B51F3A]/20 border border-rose-300 dark:border-[#B51F3A]/40'
                    : isCyan
                    ? 'bg-slate-50 dark:bg-slate-800/90 border border-cyan-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/90 border border-amber-500/30'
                }`}
              >
                {/* Slot 1: Card Header (Fixed height h-11 sm:h-12) */}
                <div className="h-11 sm:h-12 flex flex-col justify-center items-center text-center px-0.5">
                  <span className={`text-[10px] sm:text-xs font-bold leading-tight block whitespace-nowrap ${
                    isRose ? 'text-[#B51F3A]' : isCyan ? 'text-cyan-700 dark:text-cyan-400' : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {col.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-math font-semibold mt-0.5 whitespace-nowrap">
                    {col.sub}
                  </span>
                </div>

                {/* Slot 2: Digit & Controls (Fixed height h-12 sm:h-14 & perfectly centered on the same baseline) */}
                <div className="h-12 sm:h-14 flex items-center justify-center">
                  {col.isPoint ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#B51F3A] shadow-glow-crimson animate-pulse" />
                  ) : (
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
                      <button
                        onClick={() => updateDigit(col.id, -1)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center text-[10px] sm:text-xs transition font-bold shrink-0 ${
                          isCyan ? 'hover:bg-cyan-500 hover:text-white' : 'hover:bg-amber-500 hover:text-white'
                        }`}
                        title="تقليل 1"
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-math w-5 sm:w-7 text-center">
                        {col.val}
                      </span>
                      <button
                        onClick={() => updateDigit(col.id, 1)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center text-[10px] sm:text-xs transition font-bold shrink-0 ${
                          isCyan ? 'hover:bg-cyan-500 hover:text-white' : 'hover:bg-amber-500 hover:text-white'
                        }`}
                        title="زيادة 1"
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Slot 3: Numerical Value (Fixed height h-6 sm:h-7 & perfectly centered) */}
                <div className="h-6 sm:h-7 flex items-center justify-center">
                  <span className={`text-[10px] sm:text-xs font-math font-bold ${
                    isRose ? 'text-[#B51F3A] text-sm' : isCyan ? 'text-cyan-700 dark:text-cyan-300' : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {col.displayVal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Forms Display (In RTL Flow, with LTR equations inside) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
        
        {/* Standard Form */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm text-right">
          <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">الصيغة القياسية (Standard Form):</span>
          <div className="text-xl sm:text-2xl font-black text-[#39A9D0] font-math tracking-wider" dir="ltr">
            {getStandardNumber()}
          </div>
        </div>

        {/* Expanded Form with Decimals (Strictly LTR sequence: 300 + 40 + 5 + 0.6 + 0.07 + 0.008) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm text-right">
          <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">الصيغة الممتدة العشرية:</span>
          <div className="text-xs sm:text-sm font-bold text-amber-700 dark:text-[#E5A91B] font-math leading-relaxed" dir="ltr">
            {digits.hundreds > 0 && `${digits.hundreds * 100} + `}
            {digits.tens > 0 && `${digits.tens * 10} + `}
            {digits.ones > 0 && `${digits.ones} + `}
            {`0.${digits.tenths} + 0.0${digits.hundredths} + 0.00${digits.thousandths}`}
          </div>
        </div>

        {/* Expanded Form with Fractions (بسط ومقام) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-cyan-200 dark:border-cyan-500/30 shadow-sm text-right">
          <span className="text-xs text-[#39A9D0] font-bold block mb-1">الصيغة بالكسور الاعتيادية (بسط ومقام):</span>
          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-math leading-relaxed flex items-center flex-wrap gap-1.5 py-1" dir="ltr">
            {digits.hundreds > 0 && `${digits.hundreds * 100} + `}
            {digits.tens > 0 && `${digits.tens * 10} + `}
            {digits.ones > 0 && `${digits.ones} + `}
            <Fraction num={digits.tenths} den={10} size="sm" /> +
            <Fraction num={digits.hundredths} den={100} size="sm" /> +
            <Fraction num={digits.thousandths} den={1000} size="sm" />
          </div>
        </div>

      </div>

      {/* Operation Simulator: Multiply & Divide by 10 */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-4" dir="rtl">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#E5A91B]" /> تجربة قوى العدد 10 (حركة العلامة وتغير القيمة)
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            لاحظ كيف تزداد أو تقل قيمة العدد العشري وتتحرك أرقامه خانة كاملة.
          </p>
        </div>

        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={handleDivide10}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-rose-50 hover:text-[#B51F3A] dark:hover:bg-[#B51F3A]/20 dark:hover:text-[#B51F3A] border border-slate-300 dark:border-white/10 hover:border-[#B51F3A]/40 text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            <ArrowRight className="w-3.5 h-3.5" /> قسمة ÷ 10
          </button>
          <button
            onClick={handleMultiply10}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-cyan-50 hover:text-[#39A9D0] dark:hover:bg-[#39A9D0]/20 dark:hover:text-[#39A9D0] border border-slate-300 dark:border-white/10 hover:border-[#39A9D0]/40 text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            ضرب × 10 <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Decimal Comparison Sandbox */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm" dir="rtl">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">مقارنة العدد الحالي مع عدد عشري آخر:</span>
        <div className="flex flex-wrap items-center gap-4" dir="ltr">
          
          <div className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-cyan-400 dark:border-cyan-500/30 text-lg font-black font-math text-slate-900 dark:text-white shadow-sm">
            {getStandardNumber()}
          </div>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl font-math shadow-sm ${
            comparisonResult === '>' ? 'bg-cyan-100 text-cyan-700 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/50' :
            comparisonResult === '<' ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/50' :
            'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/50'
          }`}>
            {comparisonResult}
          </div>

          <input
            type="number"
            step="0.001"
            value={compareNum2}
            onChange={(e) => setCompareNum2(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/20 text-lg font-black font-math text-slate-900 dark:text-white w-36 focus:outline-none focus:border-[#39A9D0] shadow-sm"
          />

          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold" dir="rtl">
            {comparisonResult === '>' && 'العدد الأول أكبر من العدد الثاني'}
            {comparisonResult === '<' && 'العدد الأول أصغر من العدد الثاني'}
            {comparisonResult === '=' && 'العددان متساويان تماماً'}
          </span>
        </div>
      </div>

    </div>
  );
}
