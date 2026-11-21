import React from 'react';

/**
 * Reusable Fraction component displaying proper stacked numerator and denominator:
 *       numerator
 * whole ---------
 *      denominator
 */
export default function Fraction({ 
  whole = null, 
  num, 
  den, 
  size = "md", 
  className = "",
  highlight = false 
}) {
  const sizeMap = {
    xs: {
      text: "text-[11px]",
      padding: "px-0.5",
      line: "h-[1.5px] my-[1px]",
      whole: "text-xs mr-1"
    },
    sm: {
      text: "text-xs",
      padding: "px-1",
      line: "h-[1.5px] my-[1px]",
      whole: "text-sm mr-1"
    },
    md: {
      text: "text-sm sm:text-base",
      padding: "px-1.5",
      line: "h-[2px] my-[2px]",
      whole: "text-base sm:text-lg mr-1.5"
    },
    lg: {
      text: "text-base sm:text-lg",
      padding: "px-2",
      line: "h-[2px] my-[2px]",
      whole: "text-lg sm:text-xl mr-2"
    },
    xl: {
      text: "text-xl sm:text-2xl",
      padding: "px-2.5",
      line: "h-[3px] my-[3px]",
      whole: "text-2xl sm:text-3xl mr-2.5"
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <span 
      className={`inline-flex items-center align-middle mx-1 font-math font-bold select-none ${className}`}
      dir="ltr"
    >
      {/* العدد الصحيح إن وجد في الأعداد الكسرية */}
      {whole !== null && whole !== undefined && whole !== "" && (
        <span className={`font-black text-[#E5A91B] dark:text-[#E5A91B] ${currentSize.whole}`}>
          {whole}
        </span>
      )}

      {/* البسط والمقام وخط الكسر */}
      <span className={`inline-flex flex-col items-center justify-center leading-none text-center ${currentSize.text}`}>
        {/* البسط (Numerator) */}
        <span className={`${currentSize.padding} font-extrabold ${highlight ? 'text-[#B51F3A]' : 'text-[#39A9D0]'}`}>
          {num}
        </span>
        
        {/* خط الكسر الأفقي (Fraction Bar) */}
        <span className={`w-full bg-slate-400 dark:bg-slate-300 rounded-full ${currentSize.line}`}></span>
        
        {/* المقام (Denominator) */}
        <span className={`${currentSize.padding} font-extrabold text-[#E5A91B] dark:text-[#E5A91B]`}>
          {den}
        </span>
      </span>
    </span>
  );
}
