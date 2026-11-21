import React from 'react';
import { CheckCircle2, Lock, Sparkles, Award, ArrowLeft, GraduationCap, BookOpen, FlaskConical, Video, Target, Compass } from 'lucide-react';
import { FINAL_EXAM_INFO } from '../../data/curriculumData.js';

export default function StageRoadmap({ 
  stages, 
  currentStageId, 
  onSelectStage, 
  userProgress,
  onOpenFinalExam 
}) {
  const completedStages = userProgress?.completedStages || [];
  const quizScores = userProgress?.quizScores || {};
  const isFinalUnlocked = [1, 2, 3, 4, 5, 6].every(num => completedStages.includes(num));
  const progressPercent = Math.round((completedStages.length / 6) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn" dir="rtl">
      
      {/* Roadmap Hero Header */}
      <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 dark:border-white/10 light:border-slate-200 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#39A9D0]/10 via-[#E5A91B]/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39A9D0]/10 border border-[#39A9D0]/30 text-[#39A9D0] text-xs font-black shadow-sm">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>خريطة مغامرات الرياضيات • الصف الخامس الابتدائي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              رحلة إتقان منهج الرياضيات <span className="text-[#39A9D0] font-math">2027</span> 🚀
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              أهلاً بك يا بطل الرياضيات! تنقل عبر 6 مراحل تعليمية شيقة مليئة بالشروحات الصوتية، والمعامل التفاعلية، والفيديوهات الشارحة، والتحديات الذكية.
            </p>
          </div>

          {/* Progress Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-200 min-w-[200px] sm:min-w-[240px] space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 dark:text-slate-400 light:text-slate-500">إنجاز كامل المنهج:</span>
              <span className="text-[#39A9D0] font-math font-black text-sm">{progressPercent}%</span>
            </div>
            
            <div className="w-full h-2.5 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-l from-[#39A9D0] via-[#E5A91B] to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>المراحل المنجزة: <strong className="text-white dark:text-white light:text-slate-900 font-math font-bold">{completedStages.length}</strong> / 6</span>
              <span>{completedStages.length === 6 ? '🏆 مؤهل للامتحان' : '⭐ في الطريق'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {stages.map((stage) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = currentStageId === stage.id;
          const isLocked = stage.id > 1 && !completedStages.includes(stage.id - 1);
          const score = quizScores[stage.quizId];

          return (
            <div
              key={stage.id}
              onClick={() => !isLocked && onSelectStage(stage.id)}
              className={`glass-card p-5 sm:p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between group ${
                isCurrent 
                  ? 'border-[#39A9D0] bg-slate-900/90 dark:bg-slate-900/90 light:bg-cyan-50/90 shadow-glow-primary scale-[1.02] ring-2 ring-[#39A9D0]/30' 
                  : isLocked
                  ? 'opacity-60 border-white/5 dark:border-white/5 light:border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100 cursor-not-allowed'
                  : 'hover:border-[#39A9D0]/50 hover:bg-slate-900/80 dark:hover:bg-slate-900/80 light:hover:bg-slate-50 hover:-translate-y-1 hover:shadow-xl cursor-pointer'
              }`}
            >
              {/* Card Header & Badges */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span 
                    className="px-3 py-1 rounded-xl text-xs font-black text-white shadow-sm flex items-center gap-1.5"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span>المرحلة {stage.id}</span>
                  </span>

                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>مكتملة ({score}%) 🏆</span>
                    </span>
                  ) : isLocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-800/40 px-2.5 py-1 rounded-xl border border-white/5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>مقفلة</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-black text-[#39A9D0] bg-[#39A9D0]/10 border border-[#39A9D0]/30 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#E5A91B]" />
                      <span>مهمتك التالية 🎯</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 block">
                    {stage.subtitle}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#39A9D0] transition-colors">
                    {stage.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-medium">
                  {stage.description}
                </p>

                {/* Stage Features Pill List */}
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 flex-wrap">
                  <span className="inline-flex items-center gap-1 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200/70 px-2 py-0.5 rounded-lg font-semibold">
                    <BookOpen className="w-3 h-3 text-[#39A9D0]" />
                    <span>{stage.lessons?.length || 0} دروس</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200/70 px-2 py-0.5 rounded-lg font-semibold">
                    <FlaskConical className="w-3 h-3 text-[#E5A91B]" />
                    <span>معمل</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200/70 px-2 py-0.5 rounded-lg font-semibold">
                    <Video className="w-3 h-3 text-[#B51F3A]" />
                    <span>فيديو</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200/70 px-2 py-0.5 rounded-lg font-semibold">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>اختبار</span>
                  </span>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="mt-5 pt-4 border-t border-white/10 dark:border-white/10 light:border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold text-[11px]">{stage.badge}</span>
                
                {!isLocked ? (
                  <button 
                    className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                      isCurrent
                        ? 'bg-[#39A9D0] text-slate-950 hover:brightness-110 shadow-glow-primary'
                        : 'bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 hover:bg-[#39A9D0] text-slate-200 dark:text-slate-200 light:text-slate-700 hover:text-slate-950'
                    }`}
                  >
                    <span>{isCurrent ? 'أنت هنا الآن' : 'انطلق للمرحلة'}</span>
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>أكمل المرحلة {stage.id - 1} لفتحها</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Exam Roadmap Banner */}
      <div 
        onClick={() => isFinalUnlocked && onOpenFinalExam()}
        className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl ${
          isFinalUnlocked
            ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-[#E5A91B]/50 shadow-glow-gold cursor-pointer hover:border-[#E5A91B] hover:scale-[1.01]'
            : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border-white/5 dark:border-white/5 light:border-slate-300 opacity-75 cursor-not-allowed'
        }`}
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#E5A91B] to-amber-400 text-slate-950 shadow-sm">
              التحدي الختامي الشامل 🏆
            </span>
            {isFinalUnlocked ? (
              <span className="text-xs font-black text-[#E5A91B] flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> مفتوح الآن لإصدار شهادة التفوق الكبرى!
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> يتطلب اجتياز اختبارات جميع المراحل الست أولاً
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {FINAL_EXAM_INFO.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {FINAL_EXAM_INFO.description} — احصل على نسبة 80% فما فوق لتحصل على وسام الامتياز وشهادة إتقان الرياضيات المعتمدة باسمك ومدرستك!
          </p>
        </div>

        <button
          disabled={!isFinalUnlocked}
          className={`w-full md:w-auto px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 ${
            isFinalUnlocked
              ? 'bg-gradient-to-r from-[#E5A91B] to-amber-400 text-slate-950 hover:brightness-110 hover:scale-105 shadow-glow-gold'
              : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>{isFinalUnlocked ? 'بدء الامتحان النهائي والشهادة 📜' : 'الامتحان النهائي مقفل 🔒'}</span>
        </button>
      </div>

    </div>
  );
}
