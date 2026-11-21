import React, { useState } from 'react';
import { Layers, Play, RefreshCw, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function PemdasLab() {
  const [activeTab, setActiveTab] = useState('pemdas'); // 'pemdas' | 'powers10'

  // --- PEMDAS Interactive Expression State ---
  const exampleExpressions = [
    {
      id: 1,
      name: "24 - 4 × (3 + 2)",
      steps: [
        { expr: "24 - 4 × (3 + 2)", activeOp: "(3 + 2)", action: "فك القوس أولاً: 3 + 2 = 5", next: "24 - 4 × 5" },
        { expr: "24 - 4 × 5", activeOp: "4 × 5", action: "إجراء عملية الضرب: 4 × 5 = 20", next: "24 - 20" },
        { expr: "24 - 20", activeOp: "24 - 20", action: "إجراء عملية الطرح: 24 - 20 = 4", next: "4" },
        { expr: "4", activeOp: null, action: "الناتج النهائي = 4", next: null }
      ]
    },
    {
      id: 2,
      name: "5 + 3 × 4 - 6 ÷ 2",
      steps: [
        { expr: "5 + 3 × 4 - 6 ÷ 2", activeOp: "3 × 4", action: "الضرب والقسمة من اليسار لليمين: 3 × 4 = 12", next: "5 + 12 - 6 ÷ 2" },
        { expr: "5 + 12 - 6 ÷ 2", activeOp: "6 ÷ 2", action: "إجراء القسمة: 6 ÷ 2 = 3", next: "5 + 12 - 3" },
        { expr: "5 + 12 - 3", activeOp: "5 + 12", action: "الجمع والطرح من اليسار: 5 + 12 = 17", next: "17 - 3" },
        { expr: "17 - 3", activeOp: "17 - 3", action: "إجراء الطرح: 17 - 3 = 14", next: "14" },
        { expr: "14", activeOp: null, action: "الناتج النهائي = 14", next: null }
      ]
    },
    {
      id: 3,
      name: "(15 - 5) ÷ 2 + 3 × 2",
      steps: [
        { expr: "(15 - 5) ÷ 2 + 3 × 2", activeOp: "(15 - 5)", action: "فك الأقواس أولاً: 15 - 5 = 10", next: "10 ÷ 2 + 3 × 2" },
        { expr: "10 ÷ 2 + 3 × 2", activeOp: "10 ÷ 2", action: "إجراء القسمة من اليسار: 10 ÷ 2 = 5", next: "5 + 3 × 2" },
        { expr: "5 + 3 × 2", activeOp: "3 × 2", action: "إجراء الضرب: 3 × 2 = 6", next: "5 + 6" },
        { expr: "5 + 6", activeOp: "5 + 6", action: "إجراء الجمع: 5 + 6 = 11", next: "11" },
        { expr: "11", activeOp: null, action: "الناتج النهائي = 11", next: null }
      ]
    }
  ];

  const [selectedExample, setSelectedExample] = useState(exampleExpressions[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // --- Powers of 10 State ---
  const [baseDecimal, setBaseDecimal] = useState(4.56);
  const [multiplier, setMultiplier] = useState(10); // 10, 100, 1000, 0.1, 0.01

  const calculatedPower = (baseDecimal * multiplier).toFixed(
    multiplier < 1 ? (multiplier === 0.1 ? 3 : 4) : 2
  );

  const handleNextStep = () => {
    if (currentStepIdx < selectedExample.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  const selectEx = (ex) => {
    setSelectedExample(ex);
    setCurrentStepIdx(0);
  };

  const currentStepObj = selectedExample.steps[currentStepIdx];
  const isFinished = currentStepIdx === selectedExample.steps.length - 1;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-bold text-[#B51F3A] uppercase tracking-wider block">معمل المرحلة السادسة</span>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            محلل ترتيب العمليات وقوى العدد 10
          </h3>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('pemdas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'pemdas' ? 'bg-[#39A9D0] text-white shadow-glow-primary' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> ترتيب العمليات (PEMDAS)
          </button>
          <button
            onClick={() => setActiveTab('powers10')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'powers10' ? 'bg-[#E5A91B] text-slate-950 shadow-glow-gold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> قوى العدد 10
          </button>
        </div>
      </div>

      {activeTab === 'pemdas' ? (
        /* PEMDAS Tab Content */
        <div className="space-y-6">
          
          {/* Example Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">اختر تعبيراً رياضياً للتفكيك:</span>
            {exampleExpressions.map(ex => (
              <button
                key={ex.id}
                onClick={() => selectEx(ex)}
                className={`px-3 py-1 rounded-lg font-math font-bold transition ${
                  selectedExample.id === ex.id
                    ? 'bg-[#39A9D0] text-white shadow-glow-primary'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                }`}
              >
                {ex.name}
              </button>
            ))}
            <button onClick={handleReset} className="mr-auto px-2 py-1 text-slate-400 hover:text-white flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> إعادة الضبط
            </button>
          </div>

          {/* Interactive Stepper Board */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-6">
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">
                الخطوة {currentStepIdx + 1} من {selectedExample.steps.length}:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNextStep}
                  disabled={isFinished}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#39A9D0] to-[#E5A91B] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-glow-primary transition disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                >
                  {isFinished ? 'تم حل المسألة بالكامل ✓' : 'تنفيذ العملية ذات الأولوية التالية →'}
                </button>
              </div>
            </div>

            {/* Glowing Active Expression Box */}
            <div className="p-6 bg-slate-950 rounded-xl border border-white/10 text-center space-y-3">
              <div className="text-3xl sm:text-4xl font-black font-math text-white tracking-wider">
                {currentStepObj.expr}
              </div>

              {currentStepObj.activeOp && (
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold animate-pulse">
                  العملية الجاري حلها الآن: <span className="font-math">{currentStepObj.activeOp}</span>
                </div>
              )}
            </div>

            {/* Action Explanation */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-white/10 text-xs flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5A91B]"></span>
              <span className="text-slate-200 font-bold">{currentStepObj.action}</span>
            </div>

            {/* Prioritization Rules Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className={`p-3 rounded-xl border transition ${
                currentStepObj.activeOp?.includes('(') ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-glow-primary font-bold' : 'bg-slate-900 border-white/5 text-slate-500'
              }`}>
                1. الأقواس دائماً أولاً (Parentheses)
              </div>
              <div className={`p-3 rounded-xl border transition ${
                (currentStepObj.activeOp?.includes('×') || currentStepObj.activeOp?.includes('÷')) && !currentStepObj.activeOp?.includes('(')
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-gold font-bold' : 'bg-slate-900 border-white/5 text-slate-500'
              }`}>
                2. الضرب والقسمة (من اليسار لليمين)
              </div>
              <div className={`p-3 rounded-xl border transition ${
                (currentStepObj.activeOp?.includes('+') || currentStepObj.activeOp?.includes('-')) && !currentStepObj.activeOp?.includes('(') && !currentStepObj.activeOp?.includes('×') && !currentStepObj.activeOp?.includes('÷')
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-900 border-white/5 text-slate-500'
              }`}>
                3. الجمع والطرح (من اليسار لليمين)
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Powers of 10 Tab Content */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 block mb-1">العدد العشري الأساسي:</span>
                <input
                  type="number"
                  step="0.01"
                  value={baseDecimal}
                  onChange={(e) => setBaseDecimal(parseFloat(e.target.value) || 0)}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-white/20 text-2xl font-black font-math text-white w-40 focus:outline-none focus:border-[#39A9D0]"
                />
              </div>

              {/* Multiplier buttons */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">اختر قوة العدد 10:</span>
                <div className="flex flex-wrap gap-2">
                  {[10, 100, 1000, 0.1, 0.01].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMultiplier(m)}
                      className={`px-3 py-1.5 rounded-lg font-math font-bold text-xs transition ${
                        multiplier === m 
                          ? 'bg-[#E5A91B] text-slate-950 shadow-glow-gold scale-105' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                      }`}
                    >
                      {m > 1 ? `× ${m}` : `× ${m} (قسمة)`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Visualizer */}
            <div className="p-6 bg-slate-950 rounded-xl border border-white/10 text-center space-y-3">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">معادلة حركة الفاصلة العشرية</span>
              <div className="text-3xl sm:text-4xl font-black font-math text-white">
                <span className="text-[#39A9D0]">{baseDecimal}</span>
                <span className="mx-2 text-slate-400">×</span>
                <span className="text-[#E5A91B]">{multiplier}</span>
                <span className="mx-2 text-slate-400">=</span>
                <span className="text-emerald-400">{calculatedPower}</span>
              </div>
              <p className="text-xs text-slate-400 pt-2">
                {multiplier >= 10 && `تحركت الفاصلة العشرية ${Math.log10(multiplier)} خطوات نحو اليمين لأن الضرب في قوى 10 يزيد القيمة.`}
                {multiplier === 0.1 && `تحركت الفاصلة العشرية خطوة واحدة نحو اليسار لأن الضرب في 0.1 يعادل القسمة على 10.`}
                {multiplier === 0.01 && `تحركت الفاصلة العشرية خطوتين نحو اليسار لأن الضرب في 0.01 يعادل القسمة على 100.`}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
