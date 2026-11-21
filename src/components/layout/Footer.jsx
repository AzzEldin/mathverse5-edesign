import React from 'react';
import { BarChart2 } from 'lucide-react';
import { edesignShieldWhite, edesignShieldColor } from '../../data/brandingIcons';

export default function Footer({ appVersion = "v1.0.0", theme = "dark", onOpenAnalytics }) {
  return (
    <footer 
      className="app-footer bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 px-2 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-colors duration-300"
      style={{ direction: "ltr" }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 w-full gap-2">
        <div className="footer-brand flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm shrink-0">
            <img 
              src={theme === 'light' ? edesignShieldColor : edesignShieldWhite} 
              alt="eDesign Shield Logo" 
              className="h-4 w-4 sm:h-5 sm:w-5 object-contain"
              style={{
                filter: theme === 'dark' ? 'drop-shadow(0 0 6px rgba(57, 169, 208, 0.4))' : 'drop-shadow(0 1px 3px rgba(57, 169, 208, 0.3))'
              }}
            />
          </div>
          <span className="text-slate-300 dark:text-white/20 shrink-0">|</span>

          {/* Mobile concise text (as shown in user attached screenshot) */}
          <span className="sm:hidden text-[10px] xs:text-[11px] truncate">
            © 2026 <strong>e<span className="text-[#39A9D0]">Design</span></strong> ▪ MV5 ▪ All Rights Reserved
          </span>

          {/* Desktop full text */}
          <span className="hidden sm:inline text-xs">
            © 2026 <strong>e<span className="text-[#39A9D0]">Design</span> Agency</strong> • MathVerse 5. All Rights Reserved
          </span>
        </div>
        
        <div className="footer-meta flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* General Analytics Quick Button (opens GeneralAnalyticsModal) */}
          {onOpenAnalytics && (
            <button
              type="button"
              onClick={onOpenAnalytics}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#39A9D0]/10 hover:bg-[#39A9D0]/20 border border-[#39A9D0]/30 text-[#39A9D0] transition shadow-sm cursor-pointer"
              title="فتح لوحة الإحصائيات العامة للمنصة"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#39A9D0]" />
              <span className="hidden sm:inline text-[11px] font-bold">الإحصائيات العامة</span>
            </button>
          )}

          {/* Version badge */}
          <span className="bg-[#39A9D0]/10 border border-[#39A9D0]/30 px-2.5 py-0.5 rounded-full text-[11px] text-[#39A9D0] font-bold font-math shadow-sm">
            {appVersion}
          </span>
        </div>
      </div>
    </footer>
  );
}
