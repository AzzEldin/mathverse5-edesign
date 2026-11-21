import React from 'react';
import Fraction from './Fraction.jsx';

/**
 * Cleans raw LaTeX math commands into clean Unicode math symbols
 */
export function cleanLatex(str) {
  if (!str) return "";
  return str
    .replace(/\\implies/g, " ⟹ ")
    .replace(/\\iff/g, " ⟺ ")
    .replace(/\\Rightarrow/g, " ⇒ ")
    .replace(/\\Leftarrow/g, " ⇐ ")
    .replace(/\\rightarrow/g, " → ")
    .replace(/\\leftarrow/g, " ← ")
    .replace(/\\to/g, " → ")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\approx/g, "≈")
    .replace(/\\cdot/g, "·")
    .replace(/\\pm/g, "±")
    .replace(/\\le(q)?/g, "≤")
    .replace(/\\ge(q)?/g, "≥")
    .replace(/\\ne(q)?/g, "≠")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\quad\s*\|\s*\\quad/g, " | ")
    .replace(/\\quad\s*,\s*\\quad/g, " ، ")
    .replace(/\\quad/g, " ");
}

/**
 * Helper to render pure math containing fractions (\frac{n}{d} or mixed or brackets)
 */
function RenderMathToken({ mathStr, size = "md", highlight = false }) {
  if (!mathStr) return null;

  // Regex to match \frac{num}{den} or mixed: whole \frac{num}{den} or [num/den]
  const regex = /(\d+)?\s*(?:\\frac\{(\d+)\}\{(\d+)\}|\[(\d+)\/(\d+)\])/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(mathStr)) !== null) {
    if (match.index > lastIndex) {
      parts.push(mathStr.substring(lastIndex, match.index));
    }

    const whole = match[1] || null;
    const num = match[2] || match[4];
    const den = match[3] || match[5];

    parts.push(
      <Fraction 
        key={`frac-${match.index}`}
        whole={whole}
        num={num}
        den={den}
        size={size}
        highlight={highlight}
      />
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < mathStr.length) {
    parts.push(mathStr.substring(lastIndex));
  }

  return (
    <span className="inline-flex items-center flex-wrap align-middle font-math" dir="ltr">
      {parts.map((p, idx) => {
        if (typeof p !== 'string') return p;
        if (/[\u0600-\u06FF]/.test(p)) {
          const subTokens = p.split(/([\u0600-\u06FF\s]+)/).filter(Boolean);
          return (
            <span key={idx} className="mx-0.5 tracking-normal whitespace-pre-wrap">
              {subTokens.map((st, sIdx) => 
                /[\u0600-\u06FF]/.test(st) ? (
                  <bdi key={sIdx} className="font-sans font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 mx-1">
                    {st.trim()}
                  </bdi>
                ) : (
                  <span key={sIdx}>{st}</span>
                )
              )}
            </span>
          );
        }
        return (
          <span key={idx} className="mx-0.5 tracking-normal whitespace-pre-wrap">
            {p}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Universal MathExpression parser:
 * 1. Sanitizes LaTeX tokens (\times -> ×, \div -> ÷, etc.)
 * 2. If pipe '|' exists, splits into separate distinct equation badges starting from the right (RTL tabs/order)
 * 3. If mixed with Arabic text, keeps overall text RTL and isolates math expressions in LTR <bdi> tokens to eliminate BiDi flipping (= حساب error)
 * 4. Stacks fractions cleanly with vertical numerator and denominator
 */
export default function MathExpression({ expr = "", size = "md", className = "", dir = "ltr" }) {
  if (!expr) return null;

  const sanitized = cleanLatex(expr);

  // Check if string contains Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(sanitized);

  // 1. If formula contains '|', split into multiple distinct equations/chips in LTR layout starting from the LEFT
  if (sanitized.includes('|')) {
    const subEqns = sanitized.split('|').map(s => s.trim()).filter(Boolean);
    return (
      <div className={`flex flex-wrap items-center justify-start gap-3 sm:gap-4 w-full ${className}`} dir="ltr">
        {subEqns.map((sub, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-300 shadow-sm"
          >
            <MathExpression expr={sub} size={size} dir={dir} />
          </div>
        ))}
      </div>
    );
  }

  // 2. If it contains Arabic text in RTL mode (mixed narrative + math for keypoints, problem text, and worked solutions)
  if (hasArabic && dir === "rtl") {
    // Regex matching math formulas, equations with fractions, or standalone fractions
    const mathRegex = /(?:(?:\d+\s*)?(?:\\frac\{\d+\}\{\d+\}|\[\d+\/\d+\])|\d+(?:\.\d+)?)(?:\s*[=×÷+\-≈≤≥≠<>]\s*(?:(?:\d+\s*)?(?:\\frac\{\d+\}\{\d+\}|\[\d+\/\d+\])|\d+(?:\.\d+)?))+|(?:\d+\s*)?(?:\\frac\{\d+\}\{\d+\}|\[\d+\/\d+\])/g;

    const tokens = [];
    let lastIdx = 0;
    let m;

    while ((m = mathRegex.exec(sanitized)) !== null) {
      if (m.index > lastIdx) {
        tokens.push({ type: 'text', val: sanitized.substring(lastIdx, m.index) });
      }
      tokens.push({ type: 'math', val: m[0] });
      lastIdx = mathRegex.lastIndex;
    }

    if (lastIdx < sanitized.length) {
      tokens.push({ type: 'text', val: sanitized.substring(lastIdx) });
    }

    return (
      <span className={`leading-relaxed text-right inline-block w-full ${className}`} dir="rtl">
        {tokens.map((token, i) => {
          if (token.type === 'text') {
            return <span key={i} className="font-sans">{token.val}</span>;
          }
          return (
            <span 
              key={i} 
              dir="ltr" 
              className="inline-flex items-center align-middle mx-1 px-1.5 py-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-50 border border-amber-500/30 text-amber-300 dark:text-amber-300 light:text-amber-800 font-math font-bold shadow-sm"
            >
              <RenderMathToken mathStr={token.val} size={size === 'lg' ? 'md' : 'sm'} />
            </span>
          );
        })}
      </span>
    );
  }

  // 3. Pure math expression or LTR formula box (starts from left with full fractions and symbols)
  return (
    <div className={`inline-flex items-center justify-start font-math ${className}`} dir="ltr">
      <RenderMathToken mathStr={sanitized} size={size} />
    </div>
  );
}
