import React, { useState } from 'react';
import { 
  X, Compass, Sparkles, Award, BookOpen, FlaskConical, 
  ShieldCheck, CheckCircle2, GraduationCap, Users, HeartHandshake,
  Volume2, ArrowRight, ArrowLeft, Share2, Printer, Star
} from 'lucide-react';
import { edesignShieldWhite, edesignShieldColor } from '../../data/brandingIcons';

export default function PlatformGuideModal({
  isOpen,
  onClose,
  theme = 'dark',
  onOpenShare
}) {
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem('mathverse_user_role') || 'prompt'; // 'prompt' | 'student' | 'parent'
  });

  if (!isOpen) return null;

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    try {
      localStorage.setItem('mathverse_user_role', role);
    } catch (e) {}
  };

  const handleFinishGuide = () => {
    try {
      localStorage.setItem('mathverse_guide_viewed', 'true');
    } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn" dir="rtl">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        
        {/* Top Header */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
              <img
                src={theme === 'light' ? edesignShieldColor : edesignShieldWhite}
                alt="eDesign Shield Logo"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
                style={{
                  filter: theme === 'light'
                    ? 'drop-shadow(0 2px 4px rgba(57, 169, 208, 0.4))'
                    : 'drop-shadow(0 0 8px rgba(57, 169, 208, 0.45))'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  دليل منصة MathVerse 5 🚀
                </h3>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-[#39A9D0]/15 text-[#39A9D0] border border-[#39A9D0]/30 font-math">
                  eDesign Agency
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                المنهج المصري الحديث • الصف الخامس الابتدائي 2027
              </p>
            </div>
          </div>

          <button
            onClick={handleFinishGuide}
            className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="إغلاق الدليل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. INITIAL ROLE SELECTION (Shown if role is 'prompt') */}
          {selectedRole === 'prompt' ? (
            <div className="space-y-6 text-center py-3">
              <div className="space-y-2">
                <span className="text-2xl sm:text-3xl">👋</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  أهلاً بك في عالم الرياضيات التفاعلي!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  منصة تعليمية مبتكرة برعاية <strong>eDesign Agency</strong> وفق المنهج المصري الحديث. اختر صفتك لنعرض لك دليلك المخصص:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                
                {/* Option 1: Student */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className="p-5 rounded-3xl bg-gradient-to-b from-[#39A9D0]/15 via-[#39A9D0]/5 to-transparent hover:from-[#39A9D0]/25 border-2 border-[#39A9D0]/30 hover:border-[#39A9D0] transition group text-right space-y-3 shadow-sm hover:shadow-glow-primary"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#39A9D0]/20 text-[#39A9D0] flex items-center justify-center text-2xl group-hover:scale-110 transition shrink-0">
                    🚀
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
                      <span>أنا طالب متميز</span>
                      <ArrowLeft className="w-4 h-4 text-[#39A9D0] group-hover:-translate-x-1 transition" />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      استكشف المغامرة، استمع للسبورة الناطقة، العب بالمعامل، واكسب شهادة إتقان كبرى!
                    </p>
                  </div>
                </button>

                {/* Option 2: Parent / Teacher */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('parent')}
                  className="p-5 rounded-3xl bg-gradient-to-b from-[#E5A91B]/15 via-[#E5A91B]/5 to-transparent hover:from-[#E5A91B]/25 border-2 border-[#E5A91B]/30 hover:border-[#E5A91B] transition group text-right space-y-3 shadow-sm hover:shadow-glow-gold"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E5A91B]/20 text-[#E5A91B] flex items-center justify-center text-2xl group-hover:scale-110 transition shrink-0">
                    🎓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
                      <span>أنا ولي أمر / معلم</span>
                      <ArrowLeft className="w-4 h-4 text-[#E5A91B] group-hover:-translate-x-1 transition" />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      تعرف على أهداف المنهج الوزاري، أمان المنصة بدون إعلانات، وكيفية متابعة درجات الطفل.
                    </p>
                  </div>
                </button>

              </div>
            </div>
          ) : (
            
            /* 2. DETAILED PERSONALIZED GUIDANCE TABS */
            <div className="space-y-5">
              
              {/* Role Switcher Pills */}
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedRole === 'student'
                      ? 'bg-[#39A9D0] text-slate-950 shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>🚀 دليل الطالب</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('parent')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedRole === 'parent'
                      ? 'bg-[#E5A91B] text-slate-950 shadow-md font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>🎓 دليل ولي الأمر والمعلم</span>
                </button>
              </div>

              {/* A. STUDENT GUIDE CONTENT */}
              {selectedRole === 'student' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-700 dark:text-cyan-300 font-semibold leading-relaxed">
                    🌟 <strong>أهلاً بك يا بطل!</strong> صممت لك هذه المنصة خصيصاً لتفهم منهج الرياضيات بكل سهولة وتستمتع كأنك تلعب لعبة مغامرات شيقة!
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <span className="w-7 h-7 rounded-lg bg-[#39A9D0]/20 text-[#39A9D0] flex items-center justify-center text-xs font-black">1</span>
                        <span>السبورة الناطقة المتزامنة 🎙️</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        استمع لشرح المعلم بصوت نقي بالذكاء الاصطناعي، وراقب الأرقام والخطوات وهي تضيء وتتحرك أمامك في نفس اللحظة!
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-black">2</span>
                        <span>المعامل الرقمية التفاعلية 🧪</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        جرب بنفسك تحريك أشرطة القيمة المكانية، تقسيم مساحة المستطيل، وتلوين شبكات الكسور لتفهم الفكرة بعينيك.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
                        <span>فيديوهات بنقاط التفتيش ⚡</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        الفيديو يتوقف تلقائياً ليطرح عليك سؤالاً ذكياً يتأكد من فهمك للخطوة قبل الانتقال للتالية.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">4</span>
                        <span>شهادة الإتقان الكبرى 🏆</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        اجتز اختبارات المراحل الست ثم تفوق في الامتحان النهائي لتحصل على شهادة رسمية ملونة باسمك جاهزة للطباعة!
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* B. PARENT & TEACHER GUIDE CONTENT */}
              {selectedRole === 'parent' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">
                    🎓 <strong>عزيزي ولي الأمر والمعلم الفاضل:</strong> صممت منصة MathVerse 5 لتكون رفيق المذاكرة الموثوق، لرفع عبء تدريس الرياضيات المعقدة عن كاهلك بأساليب تعليمية تفاعلية حديثة.
                  </div>

                  <div className="space-y-3 pt-1">
                    
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          مطابقة كاملة لمعايير المنهج المصري الحديث (2027)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          تغطي المنصة كافة مفاهيم ووحدات الفصل الدراسي الأول للصف الخامس: (الكسور العشرية حتى جزء من ألف، جمع وطرح وضرب وقسمة الكسور، خوارزمية الضرب المعيارية، نموذج مساحة المستطيل، وخوارزمية القسمة المطولة، وع.م.أ وم.م.أ، وترتيب العمليات الحسابية PEMDAS).
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-[#39A9D0] shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          بيئة آمنة 100% ومجانية بالكامل (Zero Ads & Zero Tracking)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          المنصة خالية تماماً من أي إعلانات مزعجة أو روابط مشبوهة، ولا تطلب أي أرقام هواتف أو بيانات بنكية، مما يضمن أقصى تركيز وأمان لطفلك أثناء التعلم المستقل.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          شهادات إتقان رقمية معتمدة وقابلة للطباعة PDF
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          يحصل الطالب عند إتمام المنهج والامتحان النهائي على شهادة رسمية مرموقة برعاية <strong>eDesign Agency</strong> برقم تسلسلي خاص باسم الطالب ومدرسته، لتحفيزه على التفوق ومشاركتها مع العائلة والمدرسة.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-white/10 p-3 sm:p-4 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            {onOpenShare && (
              <button
                type="button"
                onClick={() => {
                  handleFinishGuide();
                  onOpenShare();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
                title="مشاركة رابط المنصة مع المجموعات"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">مشاركة المنصة 📢</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleFinishGuide}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#39A9D0] to-cyan-400 hover:from-cyan-400 hover:to-[#39A9D0] text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <span>انطلق إلى عالم الرياضيات 🚀</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
