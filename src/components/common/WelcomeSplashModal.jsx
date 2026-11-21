import React from 'react';
import { Sparkles, Award, BookOpen, FlaskConical, Target, CheckCircle2, ArrowLeft } from 'lucide-react';
import { edesignShieldWhite, edesignShieldColor } from '../../data/brandingIcons';

export default function WelcomeSplashModal({
  isOpen,
  studentProfile,
  onStartFirstLesson,
  theme = 'dark'
}) {
  if (!isOpen || !studentProfile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="max-w-xl w-full bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/95 dark:to-[#0b0f19] border-2 border-[#39A9D0]/40 rounded-3xl p-5 sm:p-9 shadow-2xl relative space-y-6 text-center overflow-hidden transition-colors" 
        dir="rtl"
      >
        {/* Glowing Decorative Background Orbs */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#39A9D0]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#E5A91B]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Branding Pill */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-md">
            <img 
              src={theme === 'light' ? edesignShieldColor : edesignShieldWhite} 
              alt="eDesign Shield Logo" 
              className="h-6 w-6 object-contain"
              style={{ filter: theme === 'light' ? "drop-shadow(0 1px 4px rgba(57, 169, 208, 0.4))" : "drop-shadow(0 0 6px rgba(57, 169, 208, 0.5))" }}
            />
          </div>
          <span className="text-xs font-black text-[#39A9D0] bg-[#39A9D0]/10 border border-[#39A9D0]/30 px-3 py-1 rounded-full uppercase tracking-wider">
            eDesign MathVerse 5 • الصف الخامس 2027
          </span>
        </div>

        {/* Hero Avatar with Celebration Ring */}
        <div className="relative inline-block mx-auto pt-1">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#39A9D0] via-[#E5A91B] to-[#B51F3A] p-1 shadow-glow-primary animate-pulse">
            <div className="w-full h-full rounded-[22px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-5xl sm:text-6xl">
              {studentProfile.avatar || '🚀'}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        {/* Welcome Message: اسم الطالب في سطر منفصل وبحجم كبير وبدون أي خط تحته */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <span className="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-200 block">
              مرحباً بك يا بطل الرياضيات 🌟
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#E5A91B] font-math tracking-tight drop-shadow-md">
              {studentProfile.name}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md mx-auto pt-1">
            نحن فخورون بانضمامك من <strong className="text-slate-900 dark:text-white">{studentProfile.school}</strong> إلى عالم الرياضيات التفاعلي. استعد لخوض رحلة تعليمية مشوقة ومبنية بالكامل وفقاً لـ <strong className="text-amber-500 dark:text-amber-400">منهج الوزارة 2027</strong>.
          </p>
        </div>

        {/* Features Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-right pt-1">
          
          <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex items-start gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-[#39A9D0] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">شروحات ومفاهيم</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">سرد صوتي وقوانين مبسطة</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex items-start gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-500/20 text-[#E5A91B] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">حل مسائل بالخطوات</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">تطبيقات نموذجية وأفكار ذكية</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex items-start gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">معامل بصرية تفاعلية</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">اكتشف المفاهيم عملياً</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex items-start gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-rose-500/20 text-[#B51F3A] shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">اختبارات وشهادات</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">نقاط وأوسمة تفوق معتمدة</span>
            </div>
          </div>

        </div>

        {/* Start First Lesson Call-to-Action Button */}
        <div className="pt-2">
          <button
            onClick={onStartFirstLesson}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-[#39A9D0] via-[#E5A91B] to-[#39A9D0] bg-[length:200%_auto] hover:bg-right text-slate-950 font-black text-base sm:text-lg shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-pulse"
          >
            <span>ابدأ الدرس الأول الآن 🚀</span>
            <ArrowLeft className="w-5 h-5 stroke-[3]" />
          </button>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block font-medium">
            المرحلة الأولى: القيمة المكانية والأعداد العشرية • الدرس 1 (بداية الشرح التلقائي)
          </span>
        </div>

      </div>
    </div>
  );
}
