import React, { useState, useRef, useEffect } from 'react';
import { Award, RotateCcw, Sparkles, GraduationCap, Sun, Moon, User, School, CheckCircle, ChevronDown, Edit3, UserX, BarChart3 } from 'lucide-react';
import { edesignShieldWhite, edesignShieldColor } from '../../data/brandingIcons';
import { STAGES_DATA } from '../../data/curriculumData';

export default function Header({ 
  currentStageId, 
  onSelectStage, 
  userProgress, 
  onResetProgress,
  onOpenFinalExam,
  theme = 'dark',
  onToggleTheme,
  studentProfile,
  onOpenEditProfile,
  onResetStudent,
  onOpenCertificate,
  onOpenAnalytics
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const totalPoints = Object.values(userProgress?.quizScores || {}).reduce((acc, score) => acc + (score || 0), 0);
  const completedCount = (userProgress?.completedStages || []).length;
  const isFinalUnlocked = [1, 2, 3, 4, 5, 6].every(num => (userProgress?.completedStages || []).includes(num));
  const currentStageInfo = STAGES_DATA.find(s => s.id === currentStageId) || STAGES_DATA[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/95 dark:bg-[#0b0f19]/95 light:bg-white/95 backdrop-blur-md border-b border-white/10 dark:border-white/10 light:border-slate-200 px-2 sm:px-6 lg:px-8 py-2 sm:py-2.5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-4">
        
        {/* Right side in RTL: 1. Student Avatar Menu, 2. Quick Nav Dots, 3. Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* 1. Student Profile Dropdown Button & Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(prev => !prev)}
              className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl shadow-sm hover:border-[#39A9D0]/50 transition-all group shrink-0"
              title="ملف الطالب والتقدم"
            >
              {/* Avatar Icon */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#39A9D0]/30 to-[#E5A91B]/30 flex items-center justify-center text-sm sm:text-lg border border-white/15 group-hover:scale-110 transition-transform shrink-0">
                {studentProfile?.avatar || '🚀'}
              </div>

              {/* Student Name */}
              <div className="flex flex-col text-right leading-none max-w-[55px] xs:max-w-[85px] sm:max-w-[130px]">
                <span className="text-[9px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium hidden xs:inline">بطل الرياضيات</span>
                <span className="text-[11px] sm:text-xs font-black text-white dark:text-white light:text-slate-900 truncate">
                  {studentProfile?.name || 'طالب متميز'}
                </span>
              </div>

              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-[#39A9D0]' : ''}`} />
            </button>

            {/* Profile Dropdown Card */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/15 dark:border-white/15 light:border-slate-300 rounded-3xl shadow-2xl p-4 sm:p-5 z-50 text-right animate-fadeIn space-y-4" dir="rtl">
                
                {/* Profile Header */}
                <div className="flex items-center gap-3 border-b border-white/10 dark:border-white/10 light:border-slate-200 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#39A9D0] to-[#E5A91B] flex items-center justify-center text-2xl shadow-glow-primary shrink-0">
                    {studentProfile?.avatar || '🚀'}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-sm font-black text-white dark:text-white light:text-slate-900 truncate">
                      {studentProfile?.name || 'طالب متميز'}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 flex items-center gap-1 truncate">
                      <School className="w-3 h-3 text-[#39A9D0] shrink-0" />
                      <span>{studentProfile?.school || 'الصف الخامس الابتدائي'}</span>
                    </p>
                  </div>
                </div>

                {/* Points Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#E5A91B] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 block">إجمالي النقاط المحرزة</span>
                      <span className="text-xs font-semibold text-white dark:text-white light:text-slate-800">رصيد الاختبارات والتحديات</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-[#E5A91B] font-math">+{totalPoints}</span>
                    <span className="text-[10px] text-amber-300 font-bold block">نقطة</span>
                  </div>
                </div>

                {/* Progress Status Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 dark:text-slate-400 light:text-slate-500">مرحلة التقدم الحالية:</span>
                    <span className="text-[#39A9D0]">المرحلة {currentStageId} من 6</span>
                  </div>
                  <p className="text-xs text-white dark:text-white light:text-slate-800 font-medium truncate">
                    {currentStageInfo.title}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#39A9D0] to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / 6) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>المراحل المكتملة: {completedCount} / 6</span>
                    <span className="font-math font-bold">{Math.round((completedCount / 6) * 100)}%</span>
                  </div>
                </div>

                {/* Action Buttons in Dropdown */}
                <div className="space-y-1.5 pt-1">

                  {/* View Certificate if available or completed */}
                  {onOpenCertificate && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenCertificate();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent hover:from-amber-500/30 text-xs font-bold text-[#E5A91B] flex items-center justify-between transition border border-amber-500/30 shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-[#E5A91B]" />
                        <span>عرض وتنزيل شهادة الإتقان 📜</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black font-math">PDF</span>
                    </button>
                  )}
                  
                  {/* General Analytics Modal Button */}
                  {onOpenAnalytics && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenAnalytics();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#39A9D0]/20 via-[#39A9D0]/10 to-transparent hover:from-[#39A9D0]/30 text-xs font-bold text-[#39A9D0] flex items-center justify-between transition border border-[#39A9D0]/30 shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-[#39A9D0]" />
                        <span>لوحة الإحصائيات العامة 📊</span>
                      </span>
                      <span className="text-[10px] bg-[#39A9D0]/20 text-[#39A9D0] px-1.5 py-0.5 rounded font-black">إحصاء</span>
                    </button>
                  )}

                  {/* Edit profile */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onOpenEditProfile) onOpenEditProfile();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-700 flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5 text-[#39A9D0]" />
                      <span>تعديل الاسم والمدرسة والأفتار</span>
                    </span>
                    <span className="text-[10px] text-slate-400">✏️</span>
                  </button>

                  {/* Reset Progress */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onResetProgress) onResetProgress();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 flex items-center justify-between transition border border-rose-500/20"
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة ضبط تقدم الطالب والدرجات</span>
                    </span>
                    <span className="text-[10px] text-rose-300">تصفير</span>
                  </button>

                  {/* Reset Student / Switch Student */}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onResetStudent) onResetStudent();
                    }}
                    className="w-full py-2 px-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100 text-[11px] font-medium text-slate-400 dark:text-slate-400 light:text-slate-500 flex items-center justify-center gap-1.5 transition"
                  >
                    <UserX className="w-3 h-3" />
                    <span>تسجيل طالب جديد / خروج</span>
                  </button>

                </div>

              </div>
            )}
          </div>

          {/* 2. Stages Navigation Quick Dots (In the middle on large screens) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 px-3 py-1.5 rounded-full">
            {[1, 2, 3, 4, 5, 6].map((stageNum) => {
              const isCompleted = (userProgress?.completedStages || []).includes(stageNum);
              const isCurrent = currentStageId === stageNum;
              const isUnlocked = stageNum === 1 || (userProgress?.completedStages || []).includes(stageNum - 1);
              return (
                <button
                  key={stageNum}
                  onClick={() => {
                    if (isUnlocked) onSelectStage(stageNum);
                  }}
                  disabled={!isUnlocked}
                  className={`w-7 h-7 rounded-full text-xs font-bold font-math transition-all flex items-center justify-center ${
                    isCurrent 
                      ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary scale-110 font-black' 
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : !isUnlocked
                      ? 'bg-slate-900/40 text-slate-600 border border-white/5 cursor-not-allowed opacity-40'
                      : 'bg-slate-800 dark:bg-slate-800 light:bg-white text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 border border-white/5 light:border-slate-300'
                  }`}
                  title={isUnlocked ? `المرحلة ${stageNum}` : `المرحلة ${stageNum} مقفلة (اجتز اختبار المرحلة السابقة أولاً)`}
                >
                  {isCompleted ? '✓' : !isUnlocked ? '🔒' : stageNum}
                </button>
              );
            })}

            <div className="w-px h-5 bg-white/15 dark:bg-white/15 light:bg-slate-300 mx-1"></div>

            {/* Final Exam Quick Jump Button */}
            <button
              onClick={() => {
                if (isFinalUnlocked) onOpenFinalExam();
              }}
              disabled={!isFinalUnlocked}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isFinalUnlocked
                  ? 'bg-[#E5A91B]/20 text-[#E5A91B] border border-[#E5A91B]/50 hover:bg-[#E5A91B]/30 shadow-glow-gold animate-pulse'
                  : 'bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200 text-slate-600 border border-white/5 light:border-slate-300 cursor-not-allowed opacity-50'
              }`}
              title={isFinalUnlocked ? "الاختبار النهائي مفتوح!" : "يتطلب إنهاء جميع اختبارات المراحل الست أولاً"}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">الامتحان النهائي</span>
            </button>
          </div>

          {/* Mobile / Tablet Compact Stage Pill (Removed from inside top header, moved below) */}

          {/* 3. Day / Night Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-xl transition-all border border-white/10 dark:border-white/10 light:border-slate-200 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-[#E5A91B] hover:border-[#E5A91B]/50 shadow-sm shrink-0"
            title={theme === 'dark' ? "تفعيل الوضع النهاري (Day Mode)" : "تفعيل الوضع الليلي (Dark Mode)"}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E5A91B] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#39A9D0] transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* 4. General Platform Analytics Quick Button */}
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="p-1.5 sm:p-2 rounded-xl transition-all border border-[#39A9D0]/30 bg-[#39A9D0]/10 hover:bg-[#39A9D0]/20 text-[#39A9D0] shadow-sm shrink-0 flex items-center gap-1"
              title="عرض لوحة الإحصائيات العامة للمنصة"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-bold hidden md:inline">الإحصائيات</span>
            </button>
          )}

        </div>

        {/* Left side in RTL: Official eDesign Brand Shield & Platform Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0" dir="ltr">
          
          <button
            onClick={() => onSelectStage(1)}
            className="group relative flex items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105 focus:outline-none"
            title="eDesign Agency | منصة MathVerse 5"
          >
            <img 
              src={theme === 'light' ? edesignShieldColor : edesignShieldWhite} 
              alt="eDesign Shield Logo" 
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 object-contain transition-transform duration-300 group-hover:scale-110"
              style={{ 
                filter: theme === 'light' 
                  ? "drop-shadow(0 2px 6px rgba(57, 169, 208, 0.4))" 
                  : "drop-shadow(0 0 10px rgba(57, 169, 208, 0.45))" 
              }}
            />
          </button>

          <div className="h-6 sm:h-8 w-px bg-slate-300 dark:bg-white/15 hidden sm:block"></div>

          <div className="flex flex-col justify-center text-left">
            {/* Mobile View: e Design on top, MathVerse 5ب below */}
            <div className="sm:hidden flex flex-col leading-tight">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                e<span className="text-[#39A9D0]">Design</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-900 dark:text-white font-math tracking-wide">
                  MathVerse
                </span>
                <span className="text-[9px] bg-gradient-to-r from-[#B51F3A] to-[#E5A91B] text-white px-1.5 py-0.2 rounded-full font-math font-black shadow-sm">
                  5ب 🚀
                </span>
              </div>
            </div>

            {/* Tablet & Desktop View: Inline Layout */}
            <div className="hidden sm:flex items-center gap-1.5 leading-tight">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                e<span className="text-[#39A9D0]">Design</span>
              </span>
              <span className="text-sm md:text-base font-black text-slate-900 dark:text-white font-math tracking-wide">
                MathVerse
              </span>
              <span className="text-[10px] bg-gradient-to-r from-[#B51F3A] to-[#E5A91B] text-white px-1.5 py-0.5 rounded-full font-math font-black shadow-sm">
                5ب 🚀
              </span>
            </div>
            
            {/* Tablet Subtitle */}
            <span 
              className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-tight mt-0.5 hidden sm:block lg:hidden truncate max-w-[220px]" 
              dir="rtl"
            >
              رياضيات 5ب • ترم 1 (منهج 2027)
            </span>

            {/* Desktop Subtitle */}
            <span 
              className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight mt-0.5 hidden lg:block" 
              dir="rtl"
            >
              المنصة التفاعلية لطلاب الصف الخامس الابتدائي (الفصل الدراسي الأول)
            </span>
          </div>

        </div>

      </div>

      {/* Mobile Stages Bar: Directly below the header in the center with 100% width */}
      <div className="lg:hidden w-full border-t border-white/10 dark:border-white/10 light:border-slate-200 bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-100/90 py-1.5 px-2 mt-1">
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5, 6].map((stageNum) => {
            const isCompleted = (userProgress?.completedStages || []).includes(stageNum);
            const isCurrent = currentStageId === stageNum;
            const isUnlocked = stageNum === 1 || (userProgress?.completedStages || []).includes(stageNum - 1);
            return (
              <button
                key={stageNum}
                onClick={() => {
                  if (isUnlocked) onSelectStage(stageNum);
                }}
                disabled={!isUnlocked}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold font-math transition-all flex items-center justify-center ${
                  isCurrent 
                    ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary scale-110 font-black' 
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : !isUnlocked
                    ? 'bg-slate-900/40 text-slate-600 border border-white/5 cursor-not-allowed opacity-40'
                    : 'bg-slate-800 dark:bg-slate-800 light:bg-white text-slate-400 hover:text-white border border-white/5 light:border-slate-300'
                }`}
                title={isUnlocked ? `المرحلة ${stageNum}` : `المرحلة ${stageNum} مقفلة`}
              >
                {isCompleted ? '✓' : !isUnlocked ? '🔒' : stageNum}
              </button>
            );
          })}

          <div className="w-px h-5 bg-white/15 dark:bg-white/15 light:bg-slate-300 mx-0.5"></div>

          {/* Final Exam Quick Jump Button on Mobile */}
          <button
            onClick={() => {
              if (isFinalUnlocked) onOpenFinalExam();
            }}
            disabled={!isFinalUnlocked}
            className={`px-2 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
              isFinalUnlocked
                ? 'bg-[#E5A91B]/20 text-[#E5A91B] border border-[#E5A91B]/50 shadow-glow-gold animate-pulse'
                : 'bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200 text-slate-600 border border-white/5 cursor-not-allowed opacity-50'
            }`}
            title={isFinalUnlocked ? "الاختبار النهائي مفتوح!" : "يتطلب إنهاء جميع اختبارات المراحل"}
          >
            <GraduationCap className="w-3 h-3" />
            <span>الامتحان</span>
          </button>
        </div>
      </div>
    </header>
  );
}
