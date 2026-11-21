import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Sparkles, 
  RefreshCw, 
  Calculator, 
  Layers, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Volume2,
  ArrowRight,
  Info
} from 'lucide-react';
import Fraction from '../common/Fraction.jsx';

export default function AreaModelLab() {
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' | 'area' | 'distributive'
  const [num1, setNum1] = useState(45);
  const [num2, setNum2] = useState(23);

  // Stepper state for Standard Algorithm
  const [stepIndex, setStepIndex] = useState(0); // 0: overview, 1: ones mult, 2: tens zero, 3: tens mult, 4: sum
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Decompose num1 into digits (ones, tens, hundreds)
  const o1 = num1 % 10;
  const t1 = Math.floor((num1 % 100) / 10);
  const h1 = Math.floor(num1 / 100);

  // Decompose num2 into digits (ones, tens)
  const o2 = num2 % 10;
  const t2 = Math.floor(num2 / 10);

  // Standard Algorithm Calculations
  // Step 1: ones product
  const line1Val = num1 * o2;
  // Step 2 & 3: tens product (with zero)
  const line2Val = num1 * (t2 * 10);
  // Total
  const totalProduct = num1 * num2;

  // Partial Products for Area Model & Distributive
  const p1 = (h1 > 0 ? h1 * 100 : t1 * 10) * (t2 * 10);
  const p2 = (h1 > 0 ? t1 * 10 : o1) * (t2 * 10);
  const p3 = (h1 > 0 ? o1 : 0) * (t2 * 10);

  const p4 = (h1 > 0 ? h1 * 100 : t1 * 10) * o2;
  const p5 = (h1 > 0 ? t1 * 10 : o1) * o2;
  const p6 = (h1 > 0 ? o1 : 0) * o2;

  const presets = [
    { n1: 45, n2: 23, label: "45 × 23 (كتاب الوزارة)" },
    { n1: 34, n2: 18, label: "34 × 18 (تطبيق مباشر)" },
    { n1: 52, n2: 14, label: "52 × 14 (مسائل التدريب)" },
    { n1: 125, n2: 16, label: "125 × 16 (3 أرقام × رقمين)" },
    { n1: 234, n2: 25, label: "234 × 25 (تحدي الأبطال)" },
  ];

  // Text description and audio speech for standard algorithm steps
  const getStepDetails = (idx) => {
    switch (idx) {
      case 0:
        return {
          title: "نظرة عامة على المسألة والمحاذاة الرأسية",
          desc: `نريد حساب حاصل ضرب ${num1} × ${num2}. نكتب العددين رأسياً بحيث تكون الآحاد فوق الآحاد والعشرات فوق العشرات. سنبدأ بضرب رقم الآحاد (${o2}) أولاً في كامل العدد العلوي.`,
          soundText: `المسألة: ${num1} في ${num2}. نكتب العددين رأسياً بمحاذاة الآحاد والعشرات.`
        };
      case 1: {
        const carryOver = Math.floor((o1 * o2) / 10);
        return {
          title: `الخطوة 1: ضرب رقم الآحاد (${o2} × ${num1})`,
          desc: `نضرب ${o2} في آحاد العدد العلوي (${o1}): ${o2} × ${o1} = ${o1 * o2} (نكتب ${ (o1 * o2) % 10 } ونرفع ${carryOver} حمل باليد فوق العشرات). ثم نضرب في العشرات ونضيف الحمل ليصبح ناتج السطر الأول = ${line1Val}.`,
          soundText: `الخطوة الأولى: نضرب رقم الآحاد ${o2} في ${num1}، فيكون الناتج ${line1Val}.`
        };
      }
      case 2:
        return {
          title: `الخطوة 2 (السر الذهبي 🌟): وضع صفر حفظ المنزلة`,
          desc: `قبل أن نضرب رقم العشرات (${t2})، يجب وضع صفر في خانة الآحاد بالسطر الثاني، لأن الرقم ${t2} يقع في خانة العشرات وقيمته الفعلية هي ${t2 * 10}! هذا الصفر أساسي جداً لحفظ المنزلة.`,
          soundText: `السر الذهبي: نضع صفراً في خانة الآحاد لأننا سنضرب في العشرات التي قيمتها ${t2 * 10}.`
        };
      case 3:
        return {
          title: `الخطوة 3: ضرب رقم العشرات (${t2}0 × ${num1})`,
          desc: `نضرب الآن ${t2} في العدد العلوي ${num1}: ${t2} × ${num1} = ${num1 * t2}، ومع وجود صفر الآحاد يصبح ناتج السطر الثاني = ${line2Val}.`,
          soundText: `الخطوة الثالثة: نضرب رقم العشرات ${t2} في ${num1} مع الصفر، فيكون الناتج ${line2Val}.`
        };
      case 4:
        return {
          title: `الخطوة 4: جمع ناتجي الضرب الجزئيين`,
          desc: `نجمع ناتج ضرب الآحاد (${line1Val}) مع ناتج ضرب العشرات (${line2Val}): ${line1Val} + ${line2Val} = ${totalProduct}. وهو الناتج النهائي الصحيح لعملية الضرب!`,
          soundText: `الخطوة الرابعة: نجمع السطر الأول ${line1Val} مع السطر الثاني ${line2Val}، والناتج النهائي هو ${totalProduct}.`
        };
      default:
        return { title: "", desc: "", soundText: "" };
    }
  };

  // Browser speech synthesis for explanation
  const speakStep = (text) => {
    if (!isAudioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA';
      utter.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('Arab'));
      if (arVoice) utter.voice = arVoice;
      window.speechSynthesis.speak(utter);
    } catch (e) {}
  };

  const handleNextStep = () => {
    setStepIndex(prev => {
      const next = prev < 4 ? prev + 1 : 4;
      speakStep(getStepDetails(next).soundText);
      return next;
    });
  };

  const handlePrevStep = () => {
    setStepIndex(prev => {
      const next = prev > 0 ? prev - 1 : 0;
      speakStep(getStepDetails(next).soundText);
      return next;
    });
  };

  const handleReset = () => {
    setStepIndex(0);
    setIsAutoPlaying(false);
    speakStep(getStepDetails(0).soundText);
  };

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= 4) {
            setIsAutoPlaying(false);
            return 4;
          }
          const next = prev + 1;
          speakStep(getStepDetails(next).soundText);
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, num1, num2]);

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-white/10 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#39A9D0] uppercase tracking-wider">
              المعمل الرياضي للمرحلة الرابعة ✖️
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              مطابق لمنهج الوزارة 2027
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            معمل استراتيجيات ضرب الأعداد الصحيحة والخوارزمية المعيارية
          </h3>
        </div>

        {/* Input Controls */}
        <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900/90 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5">
            <span className="text-xs text-[#39A9D0] font-bold">المضروب:</span>
            <input
              type="number"
              min="10"
              max="999"
              value={num1}
              onChange={(e) => {
                const val = Math.min(999, Math.max(10, parseInt(e.target.value) || 10));
                setNum1(val);
                setStepIndex(0);
              }}
              className="w-14 bg-transparent text-slate-900 dark:text-white font-math font-bold text-center focus:outline-none"
            />
          </div>

          <span className="text-slate-400 font-math font-black text-lg">×</span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5">
            <span className="text-xs text-[#E5A91B] font-bold">المضروب فيه:</span>
            <input
              type="number"
              min="10"
              max="99"
              value={num2}
              onChange={(e) => {
                const val = Math.min(99, Math.max(10, parseInt(e.target.value) || 10));
                setNum2(val);
                setStepIndex(0);
              }}
              className="w-12 bg-transparent text-slate-900 dark:text-white font-math font-bold text-center focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preset Buttons from Al-Adwaa Book */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#E5A91B]" />
          أمثلة نموذجية من كتاب الوزارة:
        </span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setNum1(p.n1);
              setNum2(p.n2);
              setStepIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-math font-bold transition border ${
              num1 === p.n1 && num2 === p.n2
                ? 'bg-[#39A9D0] text-slate-950 border-[#39A9D0] shadow-sm'
                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#39A9D0]/50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Mode Navigation Tabs (Standard Algorithm vs Area Model vs Distributive) */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10" dir="rtl">
        <button
          onClick={() => setActiveTab('standard')}
          className={`w-full sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
            activeTab === 'standard'
              ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>1. الخوارزمية المعيارية للضرب (الرأسي) ⚡</span>
        </button>

        <button
          onClick={() => setActiveTab('area')}
          className={`w-full sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
            activeTab === 'area'
              ? 'bg-[#E5A91B] text-slate-950 shadow-glow-gold scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>2. نموذج مساحة المستطيل (Area Model) 📐</span>
        </button>

        <button
          onClick={() => setActiveTab('distributive')}
          className={`w-full sm:flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
            activeTab === 'distributive'
              ? 'bg-[#B51F3A] text-white shadow-glow-crimson scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. خاصية التوزيع ونواتج الضرب الجزئية 🧩</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STANDARD ALGORITHM (الخوارزمية المعيارية للضرب) */}
      {/* ======================================================== */}
      {activeTab === 'standard' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Step Controller Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-cyan-400/30 dark:border-cyan-500/30 shadow-md" dir="rtl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-[#39A9D0]">مرحلة الحل:</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setStepIndex(idx);
                      setIsAutoPlaying(false);
                      speakStep(getStepDetails(idx).soundText);
                    }}
                    className={`w-7 h-7 rounded-xl font-math font-bold text-xs transition ${
                      stepIndex === idx
                        ? 'bg-[#39A9D0] text-slate-950 shadow-sm scale-110'
                        : stepIndex > idx
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {idx === 0 ? 'ابدأ' : idx}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStep}
                disabled={stepIndex === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                الخطوة السابقة
              </button>

              <button
                onClick={handleNextStep}
                disabled={stepIndex === 4}
                className="px-3.5 py-1.5 rounded-xl bg-[#39A9D0] text-slate-950 text-xs font-black hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-sm"
              >
                <span>الخطوة التالية</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsAutoPlaying(prev => !prev)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                  isAutoPlaying
                    ? 'bg-amber-500/20 text-[#E5A91B] border-amber-500/40 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                }`}
                title={isAutoPlaying ? "إيقاف التشغيل التلقائي" : "تشغيل تلقائي للخطوات"}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden sm:inline">{isAutoPlaying ? 'إيقاف' : 'عرض تلقائي'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition"
                title="إعادة تعيين الخطوات"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAudioEnabled(prev => !prev)}
                className={`p-1.5 rounded-xl border transition ${
                  isAudioEnabled 
                    ? 'bg-cyan-500/10 text-[#39A9D0] border-cyan-500/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/10'
                }`}
                title={isAudioEnabled ? "الصوت مفعل" : "الصوت مكتوم"}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Visual Algorithm Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Interactive Column Board (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center space-y-4 text-center">
              
              <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-3" dir="rtl">
                <span className="font-bold flex items-center gap-1.5 text-[#39A9D0]">
                  <Calculator className="w-4 h-4" />
                  اللوحة الحسابية الرأسية المعيارية
                </span>
                <span className="font-math font-bold text-slate-300">
                  {num1} × {num2}
                </span>
              </div>

              {/* The Vertical Multiplication Math Matrix */}
              <div className="font-math text-2xl sm:text-3xl font-black tracking-wider text-right py-4 px-8 rounded-2xl bg-slate-900/90 border border-white/10 inline-block shadow-inner space-y-1.5" dir="ltr">
                
                {/* Carry digits on top */}
                <div className="flex justify-end gap-3 text-xs font-bold text-[#B51F3A] h-5 pr-2">
                  {stepIndex >= 1 && (
                    <span className="animate-fadeIn bg-[#B51F3A]/20 border border-[#B51F3A]/40 px-1.5 rounded-md">
                      +{(Math.floor((o1 * o2) / 10))}
                    </span>
                  )}
                </div>

                {/* Top Number (num1) */}
                <div className="flex justify-end items-center gap-4 text-cyan-300">
                  <span>{num1}</span>
                </div>

                {/* Multiplier (num2) with × sign */}
                <div className="flex justify-end items-center gap-4 text-amber-300 border-b-2 border-white/30 pb-2">
                  <span className="text-slate-400 text-lg mr-2 font-math">×</span>
                  <span>{num2}</span>
                </div>

                {/* Line 1: Ones Product (num1 * o2) */}
                <div className={`flex justify-end items-center gap-4 transition-all duration-300 ${
                  stepIndex >= 1 ? 'opacity-100 text-emerald-400' : 'opacity-10 text-slate-600'
                }`}>
                  <span className="text-xs text-slate-400 font-sans mr-2">
                    {stepIndex >= 1 && `(${o2} × ${num1})`}
                  </span>
                  <span>{stepIndex >= 1 ? line1Val : '----'}</span>
                </div>

                {/* Line 2: Tens Product with the GOLDEN ZERO */}
                <div className={`flex justify-end items-center gap-4 transition-all duration-300 ${
                  stepIndex >= 2 ? 'opacity-100 text-blue-300' : 'opacity-10 text-slate-600'
                }`}>
                  <span className="text-xs text-slate-400 font-sans mr-2">
                    {stepIndex >= 3 && `(${t2}0 × ${num1})`}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {stepIndex >= 3 ? (
                      <span>{Math.floor(line2Val / 10)}</span>
                    ) : stepIndex >= 2 ? (
                      <span className="text-xs text-slate-500">...</span>
                    ) : null}
                    
                    {/* The Zero in Ones place */}
                    {stepIndex >= 2 && (
                      <span className="inline-block px-1 rounded bg-[#E5A91B]/20 border border-[#E5A91B] text-[#E5A91B] animate-pulse">
                        0
                      </span>
                    )}
                  </div>
                </div>

                {/* Addition Separator Line */}
                <div className={`border-b-2 border-white/40 pt-1 transition-opacity ${
                  stepIndex >= 4 ? 'opacity-100' : 'opacity-20'
                }`}></div>

                {/* Final Sum */}
                <div className={`flex justify-end items-center gap-4 pt-1 transition-all duration-500 ${
                  stepIndex >= 4 ? 'opacity-100 text-amber-400 scale-105' : 'opacity-10 text-slate-600'
                }`}>
                  <span className="text-xs text-slate-400 font-sans mr-2">
                    {stepIndex >= 4 && 'المجموع:'}
                  </span>
                  <span className="text-3xl text-emerald-300 font-black">
                    {stepIndex >= 4 ? totalProduct : '----'}
                  </span>
                </div>

              </div>

              {/* Zero Highlight Callout */}
              {stepIndex >= 2 && stepIndex < 4 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs text-right w-full flex items-start gap-2.5 animate-fadeIn" dir="rtl">
                  <AlertCircle className="w-4 h-4 text-[#E5A91B] shrink-0 mt-0.5" />
                  <p>
                    <strong>تنبيه الخوارزمية المعيارية:</strong> وضعنا الصفر الملون بالذهبي <strong>0</strong> في خانة الآحاد لأن الرقم <strong>{t2}</strong> هو في خانة العشرات وقيمته <strong>{t2 * 10}</strong>.
                  </p>
                </div>
              )}

            </div>

            {/* Right: Step Description & Guidance (5 cols) */}
            <div className="lg:col-span-5 space-y-4 text-right" dir="rtl">
              
              {/* Active Step Details Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-400/30 dark:border-cyan-500/30 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-[#39A9D0] text-xs font-bold border border-cyan-300 dark:border-cyan-500/40">
                    <Info className="w-3.5 h-3.5" />
                    شرح الخطوة الحالية
                  </span>
                  <button
                    onClick={() => speakStep(getStepDetails(stepIndex).soundText)}
                    className="p-1.5 rounded-xl bg-cyan-500/10 text-[#39A9D0] hover:bg-cyan-500/20 transition flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> استمع للشرح
                  </button>
                </div>

                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {getStepDetails(stepIndex).title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {getStepDetails(stepIndex).desc}
                </p>
              </div>

              {/* Summary Card for Student */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900/90 dark:to-slate-800/90 border border-slate-200 dark:border-white/10 space-y-3">
                <span className="text-xs font-black text-[#E5A91B] block">
                  ملخص خطوات الخوارزمية المعيارية للضرب:
                </span>
                
                <div className="space-y-2 text-xs">
                  <div className={`p-2 rounded-xl border flex items-center justify-between ${
                    stepIndex >= 1 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500'
                  }`}>
                    <span>1. ضرب رقم الآحاد ({o2} × {num1})</span>
                    <span className="font-math font-bold">{stepIndex >= 1 ? line1Val : '؟'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center justify-between ${
                    stepIndex >= 2 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300' : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500'
                  }`}>
                    <span>2. وضع صفر حفظ خانة العشرات</span>
                    <span className="font-math font-bold">{stepIndex >= 2 ? '0' : '؟'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center justify-between ${
                    stepIndex >= 3 ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-300' : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500'
                  }`}>
                    <span>3. ضرب رقم العشرات ({t2}0 × {num1})</span>
                    <span className="font-math font-bold">{stepIndex >= 3 ? line2Val : '؟'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center justify-between ${
                    stepIndex >= 4 ? 'bg-[#39A9D0]/10 border-[#39A9D0]/40 text-[#39A9D0] font-bold' : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-500'
                  }`}>
                    <span>4. الجمع والناتج النهائي</span>
                    <span className="font-math font-black">{stepIndex >= 4 ? totalProduct : '؟'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AREA MODEL (نموذج مساحة المستطيل) */}
      {/* ======================================================== */}
      {activeTab === 'area' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* Rectangle Visualizer (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/95 border border-white/10 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400" dir="rtl">
              <span className="font-bold text-[#39A9D0]">تقسيم أبعاد المستطيل بالصيغة الممتدة:</span>
              <span className="font-math font-bold text-white">
                {num1} = ({t1 * 10} + {o1}) ، {num2} = ({t2 * 10} + {o2})
              </span>
            </div>

            {/* Area Model Layout Grid */}
            <div className="border border-white/20 rounded-2xl p-4 bg-slate-950 shadow-inner">
              
              {/* Top Dimension Labels */}
              <div className="grid grid-cols-12 gap-2 mb-2 text-center text-xs font-math font-bold text-cyan-400">
                <div className="col-span-2"></div>
                <div className="col-span-6 bg-cyan-500/10 py-1.5 rounded-xl border border-cyan-500/30">
                  {t1 * 10} (العشرات)
                </div>
                <div className="col-span-4 bg-cyan-500/10 py-1.5 rounded-xl border border-cyan-500/30">
                  {o1} (الآحاد)
                </div>
              </div>

              {/* Row 1: t2 * 10 */}
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-2 flex items-center justify-center bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs font-math font-bold text-amber-400 p-2">
                  {t2 * 10}
                </div>
                <div className="col-span-6 h-24 bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-2 flex flex-col justify-center items-center">
                  <span className="text-[11px] text-slate-400 font-math">{t1 * 10} × {t2 * 10}</span>
                  <span className="text-xl font-black text-cyan-300 font-math">
                    {(t1 * 10) * (t2 * 10)}
                  </span>
                </div>
                <div className="col-span-4 h-24 bg-amber-950/40 border border-amber-500/40 rounded-xl p-2 flex flex-col justify-center items-center">
                  <span className="text-[11px] text-slate-400 font-math">{o1} × {t2 * 10}</span>
                  <span className="text-xl font-black text-amber-300 font-math">
                    {o1 * (t2 * 10)}
                  </span>
                </div>
              </div>

              {/* Row 2: o2 */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-2 flex items-center justify-center bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs font-math font-bold text-amber-400 p-2">
                  {o2}
                </div>
                <div className="col-span-6 h-20 bg-blue-950/40 border border-blue-500/40 rounded-xl p-2 flex flex-col justify-center items-center">
                  <span className="text-[11px] text-slate-400 font-math">{t1 * 10} × {o2}</span>
                  <span className="text-lg font-black text-blue-300 font-math">
                    {(t1 * 10) * o2}
                  </span>
                </div>
                <div className="col-span-4 h-20 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2 flex flex-col justify-center items-center">
                  <span className="text-[11px] text-slate-400 font-math">{o1} × {o2}</span>
                  <span className="text-lg font-black text-emerald-300 font-math">
                    {o1 * o2}
                  </span>
                </div>
              </div>

            </div>

            <p className="text-xs text-slate-400 text-center" dir="rtl">
              مساحة المستطيل الكلية = مجموع مساحات الأجزاء الأربعة الناتجة من تفكيك الأبعاد
            </p>
          </div>

          {/* Breakdown & Sum (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg text-center space-y-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                الناتج الكلي لمساحة المستطيل
              </span>
              <div className="text-3xl font-black font-math text-emerald-400 tracking-wider">
                {num1} × {num2} = {totalProduct}
              </div>
              <p className="text-xs text-slate-400">
                باستخدام تفكيك الأبعاد وجمع النواتج الجزئية
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 text-xs text-right" dir="rtl">
              <span className="font-bold text-slate-300 block mb-2">
                جمع النواتج الجزئية الأربعة (Partial Products):
              </span>
              
              <div className="flex justify-between items-center py-1.5 border-b border-white/5 font-math" dir="ltr">
                <span className="text-cyan-400 font-bold">{(t1 * 10) * (t2 * 10)}</span>
                <span className="text-slate-400">={t2 * 10} × {t1 * 10}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-white/5 font-math" dir="ltr">
                <span className="text-amber-400 font-bold">{o1 * (t2 * 10)}</span>
                <span className="text-slate-400">={t2 * 10} × {o1}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-white/5 font-math" dir="ltr">
                <span className="text-blue-400 font-bold">{(t1 * 10) * o2}</span>
                <span className="text-slate-400">={o2} × {t1 * 10}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-white/5 font-math" dir="ltr">
                <span className="text-emerald-400 font-bold">{o1 * o2}</span>
                <span className="text-slate-400">={o2} × {o1}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-sm font-bold font-math text-white" dir="ltr">
                <span className="text-emerald-400 font-black text-base">{totalProduct}</span>
                <span>المجموع الكلي =</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DISTRIBUTIVE PROPERTY (خاصية التوزيع) */}
      {/* ======================================================== */}
      {activeTab === 'distributive' && (
        <div className="space-y-6 animate-fadeIn text-right" dir="rtl">
          
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-[#B51F3A]/30 shadow-md space-y-3">
            <h4 className="text-base font-black text-[#B51F3A] flex items-center gap-2">
              <Layers className="w-5 h-5" />
              تطبيق خاصية التوزيع (Distributive Property):
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              تقوم خاصية التوزيع على تجزئة أحد العددين (أو كليهما) وفق قيمته المكانية، ثم ضرب كل جزء على حدة وجمع النواتج.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-math text-sm sm:text-base font-bold shadow-inner" dir="ltr">
              {num1} × {num2} = {num1} × ({t2 * 10} + {o2})
              <br />
              = ({num1} × {t2 * 10}) + ({num1} × {o2})
              <br />
              = {line2Val} + {line1Val} = {totalProduct}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#39A9D0] block">التجزئة المزدوجة لكلا العددين:</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ({t1 * 10} + {o1}) × ({t2 * 10} + {o2})
              </p>
              <div className="font-math text-xs text-slate-700 dark:text-slate-300 space-y-1" dir="ltr">
                <div>• ({t1 * 10} × {t2 * 10}) = {(t1 * 10) * (t2 * 10)}</div>
                <div>• ({t1 * 10} × {o2}) = {(t1 * 10) * o2}</div>
                <div>• ({o1} × {t2 * 10}) = {o1 * (t2 * 10)}</div>
                <div>• ({o1} × {o2}) = {o1 * o2}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 space-y-2 flex flex-col justify-center text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <h5 className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                مطابقة النتائج في كافة الاستراتيجيات
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                سواء استخدمت الخوارزمية المعيارية، أو نموذج مساحة المستطيل، أو خاصية التوزيع، فإن الناتج النهائي متطابق دائماً ويساوي:
              </p>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-math">
                {totalProduct}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}