import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Send, ExternalLink } from 'lucide-react';
import { edesignShieldWhite, edesignShieldColor } from '../../data/brandingIcons';

export default function SharePlatformModal({
  isOpen,
  onClose,
  theme = 'dark'
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const platformUrl = "https://mathverse5.vercel.app";
  const shareText = `🚀 هل تبحث عن أفضل طريقة لمذاكرة رياضيات الصف الخامس الابتدائي وفق المنهج المصري الحديث؟

اكتشف منصة MathVerse 5 التفاعلية المجانية بالكامل 📐✨:
🎙️ شرح صوتي ذكي بالذكاء الاصطناعي مع سبورة متزامنة لحظة بلحظة.
🧪 6 معامل بصرية لتفكيك الأعداد ومساحة المستطيل والقسمة المطولة.
🏆 اختبارات ذكية وشهادات إتقان رقمية معتمدة باسم الطالب قابلة للطباعة PDF.
🛡️ خالية تماماً من الإعلانات وآمنة للأطفال 100%.

جربها الآن مجاناً عبر الرابط:
👉 ${platformUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // fallback
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(platformUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(platformUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'منصة MathVerse 5 لرياضيات الصف الخامس',
          text: shareText,
          url: platformUrl
        });
      } catch (err) {
        // user cancelled or failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-5 text-right transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl shrink-0">
              <Share2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                شارك المنصة وانشر العلم 🚀
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ساهم في إفادة زملائك وأولياء الأمور
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share Channels Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex flex-col items-center justify-center gap-1.5 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">واتساب</span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={handleFacebookShare}
            className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center gap-1.5 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <ExternalLink className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">فيسبوك</span>
          </button>

          {/* Telegram */}
          <button
            type="button"
            onClick={handleTelegramShare}
            className="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex flex-col items-center justify-center gap-1.5 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">تليجرام</span>
          </button>
        </div>

        {/* Quick Link Box */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            أو انسخ الرابط والرسالة الجاهزة:
          </span>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
            <input
              type="text"
              readOnly
              value={platformUrl}
              className="flex-1 bg-transparent text-xs font-math text-slate-700 dark:text-slate-300 px-2 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[#39A9D0] text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الدعوة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native Mobile Share Button if supported */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-[#39A9D0]" />
            <span>المشاركة عبر تطبيقات هاتفي 📱</span>
          </button>
        )}

      </div>
    </div>
  );
}
