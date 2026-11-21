import React, { useState } from 'react';
import { Sparkles, User, School, Check, Award, X, Sun, Moon, AlertTriangle, Lock } from 'lucide-react';
import { edesignShieldWhite, edesignShieldColor } from '../../data/brandingIcons';

const AVATAR_OPTIONS = [
  { id: 'astronaut', emoji: '🚀', label: 'رائد فضاء' },
  { id: 'genius', emoji: '🧠', label: 'عبقري' },
  { id: 'champion', emoji: '🏆', label: 'بطل ذهبي' },
  { id: 'star', emoji: '🌟', label: 'نجم ساطع' },
  { id: 'scholar', emoji: '🎓', label: 'متفوق' },
  { id: 'lightning', emoji: '⚡', label: 'بطل السرعة' },
  { id: 'lion', emoji: '🦁', label: 'الشجاع' },
  { id: 'owl', emoji: '🦉', label: 'الحكيم' },
  { id: 'robot', emoji: '🤖', label: 'المستكشف' },
  { id: 'artist', emoji: '🎨', label: 'المبدع' },
];

export default function StudentRegistrationModal({
  initialProfile = null,
  isOpen,
  onSave,
  onClose,
  isFirstTime = false,
  theme = 'dark',
  onToggleTheme,
  onResetStudent
}) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [school, setSchool] = useState(initialProfile?.school || '');
  const [avatar, setAvatar] = useState(initialProfile?.avatar || '🚀');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('يرجى كتابة اسم الطالب بشكل صحيح (حرفين على الأقل)');
      return;
    }

    // إذا لم يتم إدخال اسم المدرسة، تصبح تلقائياً "مدرسة المنال الابتدائية"
    const trimmedSchool = school.trim() || 'مدرسة المنال الابتدائية';

    const profileData = {
      name: trimmedName,
      school: trimmedSchool,
      avatar: avatar || '🚀',
      registeredAt: initialProfile?.registeredAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(profileData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div
        className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl relative space-y-5 text-right transition-colors"
        dir="rtl"
      >
        {/* Top Control Bar: Theme Switcher & Close Button */}
        <div className="flex items-center justify-between w-full">
          {/* Day/Night Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-amber-400 transition shadow-sm flex items-center gap-1.5 text-xs font-bold"
              title="تبديل المظهر بين الوضع النهاري والليلي"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-[11px]">الوضع الليلي</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">الوضع النهاري</span>
                </>
              )}
            </button>
          )}

          {/* Close Button if editing profile */}
          {!isFirstTime && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-white/10 transition"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>

        {/* Brand Header: Logo Centered at Top */}
        <div className="text-center space-y-2 pt-0.5">
          <div className="inline-flex p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/15 shadow-xl mx-auto mb-1">
            <img
              src={theme === 'light' ? edesignShieldColor : edesignShieldWhite}
              alt="eDesign Shield Logo"
              className="h-12 w-12 object-contain"
              style={{
                filter: theme === 'light'
                  ? "drop-shadow(0 2px 8px rgba(57, 169, 208, 0.4))"
                  : "drop-shadow(0 0 10px rgba(57, 169, 208, 0.5))"
              }}
            />
          </div>
          <div>
            <div className="inline-block bg-[#39A9D0]/10 border border-[#39A9D0]/30 text-[#39A9D0] text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-1.5">
              منصة MathVerse 5 • الصف الخامس 2027
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isFirstTime ? 'مرحباً بك يا بطل الرياضيات! 🌟' : 'بيانات الطالب المسجل ✏️'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mt-1">
              {isFirstTime
                ? 'سجّل اسمك ومدرستك لتخصيص رحلتك التعليمية وحفظ نقاطك وشهاداتك.'
                : 'يمكنك تحديث اسم المدرسة أو اختيار أفتار جديد. (الاسم مقفل)'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avatar Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A91B]" />
              <span>اختر الأفتار الخاص بك:</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10">
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = avatar === item.emoji;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvatar(item.emoji)}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${isSelected
                      ? 'bg-[#39A9D0] shadow-glow-primary scale-110 border-2 border-white'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-white/5 border'
                      }`}
                    title={item.label}
                  >
                    <span>{item.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#39A9D0]" />
                <span>اسم الطالب الكامل: *</span>
              </label>
              {!isFirstTime && (
                <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> الاسم مقفل ومسجل
                </span>
              )}
            </div>

            <input
              type="text"
              value={name}
              disabled={!isFirstTime}
              readOnly={!isFirstTime}
              onChange={(e) => {
                if (isFirstTime) {
                  setName(e.target.value);
                  if (error) setError('');
                }
              }}
              placeholder="مثال: محمود عز الدين"
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold border transition ${!isFirstTime
                ? 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-900/60 dark:text-slate-400 dark:border-white/10 cursor-not-allowed'
                : 'bg-white text-slate-900 border-slate-300 placeholder-slate-400 dark:bg-slate-950 dark:text-white dark:border-white/15 dark:placeholder-slate-500 focus:outline-none focus:border-[#39A9D0] focus:ring-1 focus:ring-[#39A9D0]'
                }`}
              autoFocus={isFirstTime}
            />

            {/* Warning Notice under Student Name */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-right">
              <AlertTriangle className="w-4 h-4 text-[#E5A91B] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-bold">
                  تنبيه: لا يمكن تغيير اسم الطالب لاحقاً إلا من خلال إعادة ضبط ومحو كافة التقدم المحرز في المنصة والدرجات، حفاظاً على موثوقية الشهادات والنتائج المعتمدة.
                </p>
                {!isFirstTime && onResetStudent && (
                  <button
                    type="button"
                    onClick={onResetStudent}
                    className="text-[11px] text-rose-600 dark:text-rose-400 font-black underline hover:text-rose-700 dark:hover:text-rose-300 block pt-0.5"
                  >
                    هل ترغب في تغيير الاسم ومحو التقدم لتسجيل طالب جديد؟ اضغط هنا
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* School Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-[#E5A91B]" />
              <span>اسم المدرسة:</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">(اختياري - الافتراضي: مدرسة المنال الابتدائية)</span>
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="مثال: مدرسة المنال الابتدائية"
              className="w-full bg-white text-slate-900 border-slate-300 placeholder-slate-400 dark:bg-slate-950 dark:text-white dark:border-white/15 dark:placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#E5A91B] focus:ring-1 focus:ring-[#E5A91B]"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-rose-500 dark:text-rose-400 font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#39A9D0] to-[#E5A91B] text-slate-950 font-black text-sm shadow-glow-primary hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isFirstTime ? 'انطلق إلى عالم الرياضيات 🚀' : 'حفظ التعديلات'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
