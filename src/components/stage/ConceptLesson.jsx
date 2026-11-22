import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Lightbulb, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  ArrowLeft,
  Calculator,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Eye,
  EyeOff,
  FileText,
  Target
} from 'lucide-react';
import MathExpression from '../common/MathExpression.jsx';
import Fraction from '../common/Fraction.jsx';
import audioManifest from '../../data/audioManifest.json';

export default function ConceptLesson({ 
  stage,
  activeLessonIdx = 0,
  onSelectLessonIdx,
  activeTabMode = 'concepts',
  onSelectTabMode,
  autoPlayKey = null,
  isPlayingAudio,
  isPausedAudio,
  audioRate,
  currentSentenceIdx,
  onToggleAudioPlay,
  onStopAudio,
  onRateChange,
  onStartSpeakingSentence,
  maxUnlockedLessonIdx,
  onLockedLessonClick,
  isSummaryActive = false,
  isPracticeThinkingActive = false,
  onSolutionRevealed
}) {
  const [internalLessonIdx, setInternalLessonIdx] = useState(0);
  const [internalTabMode, setInternalTabMode] = useState('concepts'); // 'concepts' | 'practice'
  const [revealedSolutions, setRevealedSolutions] = useState({});

  const selectedLessonIdx = onSelectLessonIdx !== undefined ? activeLessonIdx : internalLessonIdx;
  const setSelectedLessonIdx = (idx) => {
    if (onSelectLessonIdx) onSelectLessonIdx(idx);
    else setInternalLessonIdx(idx);
  };

  const lessonTabMode = onSelectTabMode !== undefined ? activeTabMode : internalTabMode;
  const setLessonTabMode = (mode) => {
    if (onSelectTabMode) onSelectTabMode(mode);
    else setInternalTabMode(mode);
  };

  const currentLesson = stage.lessons[selectedLessonIdx] || stage.lessons[0];
  const isSingleSection = currentLesson.sections.length === 1;

  const manifestKey = `lesson-${stage.id}-${currentLesson.id}`;
  const recordedAudioInfo = audioManifest[manifestKey];
  const sentences = recordedAudioInfo?.sentences || [];

  // Determine active visual targets synchronized with real-time audio playback
  const getActiveTargets = () => {
    if (!isPlayingAudio || currentSentenceIdx < 0 || !sentences[currentSentenceIdx]) {
      return { activeSectionIdx: -1, isFormulaActive: false, activeKeyPointIdx: -1, activePartName: '' };
    }
    const curSent = sentences[currentSentenceIdx];
    const curText = curSent.text;

    // 1. Identify Active Section (for multi-section lessons, e.g. lesson-2-2-2, lesson-6-6-2)
    let activeSectionIdx = 0;
    if (currentLesson.sections.length > 1) {
      if (curText.includes('المفهوم الثاني') || (currentLesson.sections[1] && curText.includes(currentLesson.sections[1].heading.slice(0, 10)))) {
        activeSectionIdx = 1;
      } else if (currentSentenceIdx >= Math.floor(sentences.length / 2) && (curText.includes('القسمة') || curText.includes('الطرح'))) {
        activeSectionIdx = 1;
      }
    }

    const currentSection = currentLesson.sections[activeSectionIdx] || currentLesson.sections[0];

    // 2. Sentence 0 is ALWAYS the lesson introduction (المفهوم الأساسي)
    if (currentSentenceIdx === 0) {
      return {
        activeSectionIdx: 0,
        isFormulaActive: false,
        activeKeyPointIdx: -1,
        activePartName: 'المفهوم الرياضي الأساسي 💡'
      };
    }

    // 3. Multi-section intros (e.g. "المفهوم الثاني:")
    if (curText.startsWith('المفهوم الثاني') || curText.startsWith('المفهوم الأول')) {
      return {
        activeSectionIdx,
        isFormulaActive: false,
        activeKeyPointIdx: -1,
        activePartName: 'المفهوم الرياضي الأساسي 💡'
      };
    }

    // 4. Identify Key Point / Solution Steps (الأولى، الثانية، المستويات...)
    let activeKeyPointIdx = -1;
    const stepPatterns = [
      [/أولاً|الخطوة الأولى|المستوى الأول/],
      [/ثانياً|الخطوة الثانية|المستوى الثاني/],
      [/ثالثاً|الخطوة الثالثة|المستوى الثالث/],
      [/رابعاً|الخطوة الرابعة|المستوى الرابع/],
      [/خامساً|الخطوة الخامسة|المستوى الخامس/],
      [/سادساً|الخطوة السادسة/]
    ];

    stepPatterns.forEach((patternList, pIdx) => {
      if (patternList.some(rx => rx.test(curText))) {
        activeKeyPointIdx = pIdx;
      }
    });

    // Fallback for rule-intro sentences without explicit ordinals (only if sentenceIdx >= 2)
    if (activeKeyPointIdx === -1 && currentSentenceIdx >= 2) {
      if (curText.startsWith('وقاعدة الحسم') && currentSection.keyPoints && currentSection.keyPoints.length > 1) {
        activeKeyPointIdx = currentSection.keyPoints.length - 1;
      } else if (curText.startsWith('خطوات') || curText.startsWith('القواعد الأساسية') || curText.startsWith('القاعدة الذهبية')) {
        activeKeyPointIdx = 0;
      }
    }

    // 5. Formula & Equation detection (only when not a step/rule sentence)
    let isFormulaActive = false;
    if (activeKeyPointIdx === -1) {
      const isFormulaIntro = curText.startsWith('القانون والمعادلة') || curText.startsWith('القانون') || curText.startsWith('معادلة') || curText.startsWith('المعادلة');
      const containsFormulaPhrase = curText.includes('معادلة الضرب') || curText.includes('معادلة القسمة') || curText.includes('معادلة الجمع') || curText.includes('معادلة الطرح') || curText.includes('معادلة التحقق');
      if (isFormulaIntro || containsFormulaPhrase) {
        // Guard against sentences that are rule headers rather than formulas
        if (!curText.startsWith('قواعد') && !curText.startsWith('مستويات سلم')) {
          isFormulaActive = true;
        }
      }
    }

    let activePartName = 'المفهوم والقيمة المكانية 💡';
    if (isFormulaActive) activePartName = 'القانون والمعادلة الرياضية 📐';
    else if (activeKeyPointIdx >= 0) activePartName = `قاعدة وخطوة الحل رقم ${activeKeyPointIdx + 1} ⚡`;

    return { activeSectionIdx, isFormulaActive, activeKeyPointIdx, activePartName };
  };

  const { activeSectionIdx, isFormulaActive, activeKeyPointIdx, activePartName } = getActiveTargets();

  // Reverse seek helper: resolves exact sentence index when student clicks a formula, card or rule
  const getSeekIndex = (sIdx, targetType, pIdx = 0) => {
    if (!sentences || sentences.length === 0) return 0;
    const midpoint = Math.floor(sentences.length / 2);

    if (targetType === 'section') {
      if (sIdx === 0) return 0;
      const idx2 = sentences.findIndex((s, i) => i > 1 && (s.text.includes('المفهوم الثاني') || (currentLesson.sections[1] && s.text.includes(currentLesson.sections[1].heading.slice(0, 8)))));
      return idx2 !== -1 ? idx2 : midpoint;
    }

    if (targetType === 'formula') {
      const fIdx = sentences.findIndex((s, i) => {
        if (i === 0) return false;
        const inRange = currentLesson.sections.length > 1 ? (sIdx === 0 ? i < midpoint : i >= midpoint) : true;
        const matchesFormula = s.text.startsWith('القانون') || s.text.startsWith('معادلة') || s.text.startsWith('المعادلة') || s.text.includes('معادلة الضرب') || s.text.includes('معادلة القسمة') || s.text.includes('معادلة الجمع') || s.text.includes('معادلة الطرح');
        return inRange && matchesFormula && !s.text.startsWith('قواعد');
      });
      return fIdx !== -1 ? fIdx : (sIdx === 0 ? 1 : midpoint);
    }

    if (targetType === 'keypoint') {
      const stepPatterns = [
        [/أولاً|الخطوة الأولى|المستوى الأول/],
        [/ثانياً|الخطوة الثانية|المستوى الثاني/],
        [/ثالثاً|الخطوة الثالثة|المستوى الثالث/],
        [/رابعاً|الخطوة الرابعة|المستوى الرابع/],
        [/خامساً|الخطوة الخامسة|المستوى الخامس/],
        [/سادساً|الخطوة السادسة/]
      ];
      const rxList = stepPatterns[pIdx];
      if (rxList) {
        const kIdx = sentences.findIndex((s, i) => {
          if (i === 0) return false;
          const inRange = currentLesson.sections.length > 1 ? (sIdx === 0 ? i < midpoint : i >= midpoint) : true;
          return inRange && rxList.some(rx => rx.test(s.text));
        });
        if (kIdx !== -1) return kIdx;
      }
      const genIdx = sentences.findIndex((s, i) => {
        if (i <= 1) return false;
        const inRange = currentLesson.sections.length > 1 ? (sIdx === 0 ? i < midpoint : i >= midpoint) : true;
        return inRange && (s.text.startsWith('خطوات') || s.text.startsWith('القواعد') || s.text.startsWith('القاعدة'));
      });
      return genIdx !== -1 ? genIdx : (sIdx === 0 ? 2 : midpoint);
    }
    return 0;
  };

  const sectionRefs = useRef([]);
  const introRefs = useRef([]);
  const formulaRefs = useRef([]);
  const keyPointRefs = useRef({});
  const summaryRef = useRef(null);
  const practiceProblemsRef = useRef(null);
  const problemCardRef = useRef(null);

  // Auto-scroll to Lesson Summary when narration ends
  useEffect(() => {
    if (isSummaryActive && summaryRef.current) {
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isSummaryActive]);

  // Auto-scroll to Problem Statement when narrator says "فكر في حل..."
  useEffect(() => {
    if (isPracticeThinkingActive) {
      setTimeout(() => {
        const target = problemCardRef.current || practiceProblemsRef.current;
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [isPracticeThinkingActive]);

  // Auto-scroll into view during live narration (especially crucial on mobile devices)
  useEffect(() => {
    if (!isPlayingAudio) return;

    let targetEl = null;
    if (isFormulaActive && formulaRefs.current[activeSectionIdx]) {
      targetEl = formulaRefs.current[activeSectionIdx];
    } else if (activeKeyPointIdx >= 0 && keyPointRefs.current[`${activeSectionIdx}_${activeKeyPointIdx}`]) {
      targetEl = keyPointRefs.current[`${activeSectionIdx}_${activeKeyPointIdx}`];
    } else if (introRefs.current[activeSectionIdx] && activeSectionIdx >= 0) {
      targetEl = introRefs.current[activeSectionIdx];
    } else if (sectionRefs.current[activeSectionIdx]) {
      targetEl = sectionRefs.current[activeSectionIdx];
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      // On mobile and desktop: If element is scrolled out of comfortable reading zone, smoothly bring it to center
      if (rect.top < 85 || rect.bottom > window.innerHeight - 85) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSectionIdx, isFormulaActive, activeKeyPointIdx, currentSentenceIdx, isPlayingAudio]);

  const toggleSolution = (key) => {
    setRevealedSolutions(prev => {
      const willShow = !prev[key];
      if (willShow && onSolutionRevealed) {
        onSolutionRevealed();
      }
      return {
        ...prev,
        [key]: willShow
      };
    });
  };

  const localSpeakTimeoutRef = React.useRef(null);

  const speakText = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (localSpeakTimeoutRef.current) {
        clearTimeout(localSpeakTimeoutRef.current);
        localSpeakTimeoutRef.current = null;
      }
      window.speechSynthesis.cancel();

      localSpeakTimeoutRef.current = setTimeout(() => {
        try {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = 'ar-SA';
          utter.rate = 0.95;
          const voices = window.speechSynthesis.getVoices();
          const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('Arab'));
          if (arVoice) utter.voice = arVoice;
          window.speechSynthesis.speak(utter);
        } catch (e) {}
      }, 50);
    } catch (e) {}
  };

  // Immediate cleanup on unmount, tab switch, or lesson change to guarantee no pending speech is queued
  React.useEffect(() => {
    return () => {
      if (localSpeakTimeoutRef.current) {
        clearTimeout(localSpeakTimeoutRef.current);
        localSpeakTimeoutRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lessonTabMode, selectedLessonIdx]);

  // Reset revealed solutions whenever switching tabs or changing lessons so practice solutions are always hidden by default
  React.useEffect(() => {
    setRevealedSolutions({});
  }, [lessonTabMode, selectedLessonIdx]);

  return (
    <div className="space-y-6">
      
      {/* Lesson Selector Circles: Centered circles with numbers + Active lesson title directly below */}
      <div className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-2 text-center" dir="rtl">
        {/* Row of circular lesson buttons centered in the middle of page width */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {stage.lessons.map((lesson, idx) => {
            const isLessonUnlocked = maxUnlockedLessonIdx !== undefined ? idx <= maxUnlockedLessonIdx : true;
            const isSelected = selectedLessonIdx === idx;

            return (
              <button
                key={lesson.id}
                onClick={() => {
                  if (!isLessonUnlocked) {
                    if (onLockedLessonClick) onLockedLessonClick(idx);
                    return;
                  }
                  if (onStopAudio) onStopAudio();
                  setSelectedLessonIdx(idx);
                  if (onSelectLessonIdx) onSelectLessonIdx(idx);
                  setRevealedSolutions({});
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-black font-math transition-all flex items-center justify-center shadow-sm ${
                  !isLessonUnlocked
                    ? 'opacity-50 bg-slate-200 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-white/5 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary scale-110 ring-2 ring-[#39A9D0]/60 border border-[#39A9D0]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-white/10 hover:scale-105'
                }`}
                title={!isLessonUnlocked ? `الدرس ${idx + 1} مقفل! أكمل الدرس السابق وحل مسائله أولاً` : `الدرس ${idx + 1}: ${lesson.title}`}
              >
                {!isLessonUnlocked ? '🔒' : idx + 1}
              </button>
            );
          })}
        </div>

        {/* Directly beneath: Active Lesson Title */}
        <div className="pt-1.5 border-t border-slate-200/60 dark:border-white/5">
          <h3 className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[#39A9D0]">الدرس {selectedLessonIdx + 1}:</span>
            <span>{currentLesson.title}</span>
          </h3>
        </div>
      </div>

      {/* Anchor: اسفل قائمة الدروس مباشرا */}
      <div id="after-lessons-list" className="scroll-mt-20"></div>

      {/* Tabs Mode Switcher: الشرح والمفاهيم VS بنك حل المسائل والتطبيقات */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10" dir="rtl">
        <button
          onClick={() => {
            if (onStopAudio) onStopAudio();
            setLessonTabMode('concepts');
            if (onSelectTabMode) onSelectTabMode('concepts');
          }}
          className={`w-full sm:flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
            lessonTabMode === 'concepts'
              ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>1. الشرح والقوانين والمفاهيم 💡</span>
        </button>

        <button
          onClick={() => {
            if (onStopAudio) onStopAudio();
            setLessonTabMode('practice');
            if (onSelectTabMode) onSelectTabMode('practice');
          }}
          className={`w-full sm:flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
            lessonTabMode === 'practice'
              ? 'bg-[#E5A91B] text-slate-950 shadow-glow-gold scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>2. تبويب حل المسائل والتطبيقات النموذجية 📝</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: CONCEPTS & RULES (الشرح والقوانين والمفاهيم) */}
      {/* ======================================================== */}
      {lessonTabMode === 'concepts' && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Mini Audio Bar: شريط تحكم عائم مدمج وتفاعلي بأعلى منطقة الشرح */}
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-[#39A9D0]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-right" dir="rtl">
            
            {/* Right side: Play/Pause button + Status details */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onToggleAudioPlay}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md shrink-0 ${
                  isPlayingAudio && !isPausedAudio
                    ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary scale-105'
                    : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-[#39A9D0] hover:bg-[#39A9D0]/20 border border-[#39A9D0]/40'
                }`}
                title={isPlayingAudio && !isPausedAudio ? 'إيقاف مؤقت' : 'تشغيل الشرح الصوتي التفاعلي'}
              >
                {isPlayingAudio && !isPausedAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current -scale-x-100 mr-0.5" />
                )}
              </button>

              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white dark:text-white light:text-slate-900 truncate">
                    {isPlayingAudio && !isPausedAudio ? (
                      <span className="text-[#39A9D0] flex items-center gap-1.5">
                        <span>الأستاذ يشرح الآن:</span>
                        <span className="text-[#E5A91B]">{activePartName}</span>
                      </span>
                    ) : isPausedAudio ? (
                      <span className="text-amber-400">الشرح الصوتي متوقف مؤقتاً ⏸️</span>
                    ) : (
                      <span>الشرح الصوتي التفاعلي المباشر</span>
                    )}
                  </span>

                  {/* Animated Sound Wave bars when playing */}
                  {isPlayingAudio && !isPausedAudio && (
                    <div className="flex items-end gap-0.5 h-4 px-1 shrink-0">
                      <span className="w-1 bg-[#39A9D0] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                      <span className="w-1 bg-[#E5A91B] rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                      <span className="w-1 bg-[#39A9D0] rounded-full animate-bounce [animation-delay:-0.45s] h-2.5" />
                      <span className="w-1 bg-[#E5A91B] rounded-full animate-bounce h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-cyan-500/10 text-[#39A9D0] font-bold border border-cyan-500/20 text-[10px]">
                    Silma AI 🎙️
                  </span>
                  <span>
                    {isPlayingAudio && currentSentenceIdx >= 0 
                      ? `المقطع ${currentSentenceIdx + 1} من ${sentences.length || 1}` 
                      : 'متزامن لحظياً مع القوانين والخطوات'}
                  </span>
                </div>
              </div>
            </div>

            {/* Left side: Speed control & Restart */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/10">
              <button
                onClick={() => onStartSpeakingSentence && onStartSpeakingSentence(0)}
                className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:border-white/10 shadow-sm text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                title="إعادة الشرح من البداية"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#39A9D0]" />
                <span className="text-[11px]">من البداية ↺</span>
              </button>

              <button
                onClick={() => {
                  const rates = [0.8, 1.0, 1.2];
                  const nextIdx = (rates.indexOf(audioRate) + 1) % rates.length;
                  if (onRateChange) onRateChange(rates[nextIdx]);
                }}
                className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 text-amber-600 border-amber-500/30 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-[#E5A91B] dark:border-amber-500/20 shadow-sm text-xs font-black transition flex items-center gap-1 shrink-0 font-math"
                title="تغيير سرعة الصوت"
              >
                <FastForward className="w-3.5 h-3.5 -scale-x-100" />
                <span>{audioRate}x</span>
              </button>
            </div>
          </div>

          {/* Cards Grid: البطاقات التفاعلية مع التزامن البصري */}
          <div className={`grid grid-cols-1 ${currentLesson.sections.length > 1 ? 'lg:grid-cols-2' : 'w-full'} gap-4 sm:gap-6`}>
            {currentLesson.sections.map((section, sIdx) => {
              const isCardActive = activeSectionIdx === sIdx && isPlayingAudio;
              const isCurrentFormulaActive = isCardActive && isFormulaActive;
              const isIntroActive = isCardActive && !isFormulaActive && activeKeyPointIdx === -1;

              return (
                <div 
                  key={sIdx}
                  ref={el => { sectionRefs.current[sIdx] = el; }}
                  className={`glass-panel p-4 sm:p-7 rounded-2xl sm:rounded-3xl border space-y-4 transition-all duration-500 flex flex-col justify-between relative overflow-hidden ${
                    isCardActive
                      ? 'border-[#39A9D0] shadow-[0_0_30px_rgba(57,169,208,0.22)] ring-1 ring-[#39A9D0]/60 bg-gradient-to-b from-[#39A9D0]/[0.05] via-transparent to-transparent'
                      : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/40'
                  }`}
                  dir="rtl"
                >
                  {/* Top glowing line when card is actively being explained */}
                  {isCardActive && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#39A9D0] to-transparent animate-pulse" />
                  )}

                  {/* Top Header: Heading, Live Badge & Audio Trigger */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-[#39A9D0] font-black text-base sm:text-lg">
                      <Lightbulb className={`w-5 h-5 shrink-0 transition-transform ${isCardActive ? 'text-[#E5A91B] scale-110 drop-shadow-[0_0_8px_rgba(229,169,27,0.7)]' : 'text-[#E5A91B]'}`} />
                      <h4>{section.heading}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCardActive && (
                        <span className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#39A9D0]/15 border border-[#39A9D0]/40 text-[#39A9D0] text-[11px] font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-[#39A9D0] animate-ping" />
                          <span>الأستاذ يشرح الآن 🎙️</span>
                        </span>
                      )}

                      <button
                        onClick={() => {
                          const seekIdx = getSeekIndex(sIdx, 'section');
                          if (onStartSpeakingSentence) onStartSpeakingSentence(seekIdx);
                        }}
                        className="p-1.5 px-2.5 rounded-xl bg-[#39A9D0]/10 hover:bg-[#39A9D0]/20 text-[#39A9D0] border border-[#39A9D0]/20 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
                        title="استمع لشرح هذا المفهوم والقانون بصوت تفاعلي"
                      >
                        <Volume2 className="w-4 h-4 text-[#39A9D0]" />
                        <span className="text-[11px] hidden xs:inline">استمع 🔊</span>
                      </button>
                    </div>
                  </div>

                  {/* Body: Responsive layout (Side-by-side on desktop for single section, or stacked for multi-section) */}
                  {isSingleSection ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
                      {/* Right Column: Narrative content and mathematical formula */}
                      <div className="lg:col-span-7 space-y-4 text-right">
                        {/* Interactive Concept Paragraph (الفقرة الأولى - الشرح والمفهوم التفاعلي) */}
                        <div 
                          ref={el => { introRefs.current[sIdx] = el; }}
                          onClick={() => {
                            const seekIdx = getSeekIndex(sIdx, 'section');
                            if (onStartSpeakingSentence) onStartSpeakingSentence(seekIdx);
                          }}
                          className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer text-right space-y-1.5 ${
                            isIntroActive
                              ? 'bg-[#39A9D0]/10 border border-[#39A9D0]/50 ring-1 ring-[#39A9D0]/40 shadow-[0_0_20px_rgba(57,169,208,0.22)] scale-[1.01]'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30'
                          }`}
                          title="اضغط للاستماع لشرح هذا المفهوم الرياضي 🎧"
                        >
                          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#39A9D0]">
                            <span className="flex items-center gap-1.5">
                              <span>💡 المفهوم الرياضي الأساسي:</span>
                              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(اضغط للاستماع)</span>
                            </span>
                            {isIntroActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#39A9D0] text-slate-950 text-[10px] font-black animate-pulse shadow-sm">
                                🎙️ جاري شرح المفهوم...
                              </span>
                            )}
                          </div>
                          <p className={`text-xs sm:text-base leading-relaxed font-medium transition-colors duration-300 ${
                            isIntroActive
                              ? 'text-slate-900 dark:text-white font-bold'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {section.content}
                          </p>
                        </div>

                        {section.formula && (
                          <div 
                            ref={el => { formulaRefs.current[sIdx] = el; }}
                            onClick={() => {
                              const seekIdx = getSeekIndex(sIdx, 'formula');
                              if (onStartSpeakingSentence) onStartSpeakingSentence(seekIdx);
                            }}
                            className={`space-y-1.5 pt-1 rounded-2xl p-3 transition-all duration-300 cursor-pointer ${
                              isCurrentFormulaActive
                                ? 'bg-[#E5A91B]/10 ring-2 ring-[#E5A91B] shadow-[0_0_25px_rgba(229,169,27,0.35)] scale-[1.015]'
                                : 'hover:bg-slate-800/40 bg-slate-900/30 border border-slate-200/50 dark:border-white/5'
                            }`}
                            title="اضغط للاستماع لشرح هذا القانون الرياضي 🎧"
                          >
                            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#39A9D0]">
                              <span className="flex items-center gap-1.5">
                                <span>📐 المعادلة الرياضية والقانون:</span>
                                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(اضغط للاستماع)</span>
                              </span>
                              {isCurrentFormulaActive && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5A91B] text-slate-950 text-[10px] font-black animate-pulse shadow-sm">
                                  ✨ جاري الشرح والقراءة...
                                </span>
                              )}
                            </div>
                            <div className={`p-4 sm:p-5 rounded-2xl bg-slate-950 text-amber-300 font-math font-bold text-sm sm:text-lg tracking-wide overflow-x-auto shadow-inner flex items-center justify-start min-h-[64px] border transition-all ${
                              isCurrentFormulaActive
                                ? 'border-[#E5A91B] text-amber-200'
                                : 'border-white/10'
                            }`} dir="ltr">
                              <MathExpression expr={section.formula} size="lg" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Left Column: Key Points Bullet List */}
                      {section.keyPoints && section.keyPoints.length > 0 && (
                        <div className="lg:col-span-5 space-y-2 lg:border-r lg:border-slate-200 lg:dark:border-white/10 lg:pr-6 text-right">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <span>قواعد وخطوات الحل الأساسية:</span>
                              <span className="text-[11px] text-[#39A9D0] font-normal">(اضغط للاستماع)</span>
                            </span>
                          </div>
                          {section.keyPoints.map((pt, pIdx) => {
                            const isPointActive = isCardActive && activeKeyPointIdx === pIdx;
                            const pointSeekIdx = getSeekIndex(sIdx, 'keypoint', pIdx);
                            return (
                              <div 
                                key={pIdx}
                                ref={el => { keyPointRefs.current[`${sIdx}_${pIdx}`] = el; }}
                                onClick={() => {
                                  if (onStartSpeakingSentence) onStartSpeakingSentence(pointSeekIdx);
                                }}
                                className={`flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-right p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
                                  isPointActive
                                    ? 'bg-[#39A9D0]/15 dark:bg-[#39A9D0]/20 border border-[#39A9D0]/60 shadow-[0_0_15px_rgba(57,169,208,0.25)] text-[#39A9D0] font-bold scale-[1.01]'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                                }`}
                                title="اضغط للاستماع لشرح هذه الخطوة 🎧"
                              >
                                <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 transition-all ${
                                  isPointActive 
                                    ? 'text-[#39A9D0] drop-shadow-[0_0_6px_rgba(57,169,208,0.8)] scale-110' 
                                    : 'text-emerald-500'
                                }`} />
                                <div className="flex-1 text-right">
                                  <MathExpression expr={pt} size="sm" dir="rtl" />
                                </div>
                                {isPointActive && (
                                  <span className="text-[10px] bg-[#39A9D0] text-slate-950 font-black px-1.5 py-0.5 rounded-md shrink-0 animate-pulse">
                                    الخطوة الحالية 💡
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 text-right">
                      {/* Interactive Concept Paragraph (الفقرة الأولى - الشرح والمفهوم التفاعلي) */}
                      <div 
                        ref={el => { introRefs.current[sIdx] = el; }}
                        onClick={() => {
                          const seekIdx = getSeekIndex(sIdx, 'section');
                          if (onStartSpeakingSentence) onStartSpeakingSentence(seekIdx);
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-300 cursor-pointer text-right space-y-1.5 ${
                          isIntroActive
                            ? 'bg-[#39A9D0]/10 border border-[#39A9D0]/50 ring-1 ring-[#39A9D0]/40 shadow-[0_0_20px_rgba(57,169,208,0.22)] scale-[1.01]'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30'
                        }`}
                        title="اضغط للاستماع لشرح هذا المفهوم الرياضي 🎧"
                      >
                        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#39A9D0]">
                          <span className="flex items-center gap-1.5">
                            <span>💡 المفهوم الرياضي الأساسي:</span>
                            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(اضغط للاستماع)</span>
                          </span>
                          {isIntroActive && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#39A9D0] text-slate-950 text-[10px] font-black animate-pulse shadow-sm">
                              🎙️ جاري شرح المفهوم...
                            </span>
                          )}
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed font-medium transition-colors duration-300 ${
                          isIntroActive
                            ? 'text-slate-900 dark:text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {section.content}
                        </p>
                      </div>

                      {section.formula && (
                        <div 
                          ref={el => { formulaRefs.current[sIdx] = el; }}
                          onClick={() => {
                            const seekIdx = getSeekIndex(sIdx, 'formula');
                            if (onStartSpeakingSentence) onStartSpeakingSentence(seekIdx);
                          }}
                          className={`space-y-1.5 pt-1 rounded-2xl p-2.5 transition-all duration-300 cursor-pointer ${
                            isCurrentFormulaActive
                              ? 'bg-[#E5A91B]/10 ring-2 ring-[#E5A91B] shadow-[0_0_25px_rgba(229,169,27,0.35)] scale-[1.015]'
                              : 'hover:bg-slate-800/40'
                          }`}
                          title="اضغط للاستماع لشرح هذا القانون الرياضي 🎧"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#39A9D0]">
                            <span className="flex items-center gap-1.5">
                              <span>📐 المعادلة الرياضية والقانون:</span>
                              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(اضغط للاستماع)</span>
                            </span>
                            {isCurrentFormulaActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E5A91B] text-slate-950 text-[10px] font-black animate-pulse shadow-sm">
                                ✨ جاري الشرح والقراءة...
                              </span>
                            )}
                          </div>
                          <div className={`p-4 rounded-2xl bg-slate-950 text-amber-300 font-math font-bold text-sm sm:text-base tracking-wide overflow-x-auto shadow-inner flex items-center justify-start min-h-[56px] border transition-all ${
                            isCurrentFormulaActive
                              ? 'border-[#E5A91B] text-amber-200'
                              : 'border-white/10'
                          }`} dir="ltr">
                            <MathExpression expr={section.formula} size="lg" />
                          </div>
                        </div>
                      )}

                      {section.keyPoints && section.keyPoints.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10 text-right">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              قواعد وخطوات الحل الأساسية (اضغط للاستماع لكل خطوة):
                            </span>
                          </div>
                          {section.keyPoints.map((pt, pIdx) => {
                            const isPointActive = isCardActive && activeKeyPointIdx === pIdx;
                            const pointSeekIdx = getSeekIndex(sIdx, 'keypoint', pIdx);
                            return (
                              <div 
                                key={pIdx}
                                ref={el => { keyPointRefs.current[`${sIdx}_${pIdx}`] = el; }}
                                onClick={() => {
                                  if (onStartSpeakingSentence) onStartSpeakingSentence(pointSeekIdx);
                                }}
                                className={`flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-right p-2 sm:p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
                                  isPointActive
                                    ? 'bg-[#39A9D0]/15 dark:bg-[#39A9D0]/20 border border-[#39A9D0]/60 shadow-[0_0_15px_rgba(57,169,208,0.25)] text-[#39A9D0] font-bold scale-[1.01]'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                                }`}
                                title="اضغط للاستماع لشرح هذه الخطوة 🎧"
                              >
                                <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 transition-all ${
                                  isPointActive 
                                    ? 'text-[#39A9D0] drop-shadow-[0_0_6px_rgba(57,169,208,0.8)] scale-110' 
                                    : 'text-emerald-500'
                                }`} />
                                <div className="flex-1 text-right">
                                  <MathExpression expr={pt} size="sm" dir="rtl" />
                                </div>
                                {isPointActive && (
                                  <span className="text-[10px] bg-[#39A9D0] text-slate-950 font-black px-1.5 py-0.5 rounded-md shrink-0 animate-pulse">
                                    الخطوة الحالية 💡
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 1. خلاصة الدرس والفكرة الأساسية أولاً تحت الشرح */}
          {currentLesson.summary && (
            <div 
              ref={summaryRef}
              className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-500 flex items-start gap-3.5 shadow-sm ${
                isSummaryActive
                  ? 'bg-gradient-to-r from-[#39A9D0]/20 via-[#39A9D0]/10 to-transparent border-[#39A9D0] ring-2 ring-[#39A9D0]/80 shadow-[0_0_35px_rgba(57,169,208,0.35)] scale-[1.015]'
                  : 'bg-cyan-500/10 dark:bg-cyan-500/10 light:bg-cyan-50 border-cyan-500/30'
              }`} 
              dir="rtl"
            >
              <Sparkles className={`w-5 h-5 text-[#39A9D0] shrink-0 mt-0.5 ${isSummaryActive ? 'animate-bounce drop-shadow-[0_0_8px_rgba(57,169,208,0.9)] scale-125' : 'animate-pulse'}`} />
              <div className="space-y-1.5 text-right flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-black text-[#39A9D0] block">خلاصة الدرس والفكرة الأساسية:</span>
                  {isSummaryActive && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#39A9D0] text-slate-950 text-[10px] font-black animate-pulse shadow-sm shrink-0">
                      💡 تم انتهاء الشرح - استوعب الخلاصة الآن
                    </span>
                  )}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                  isSummaryActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'
                }`}>
                  {currentLesson.summary}
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: WORKED PROBLEMS & SOLUTIONS (تبويب حل المسائل) */}
      {/* ======================================================== */}
      {lessonTabMode === 'practice' && (
        <div className="space-y-5 animate-fadeIn" dir="rtl">
          
          <div 
            ref={practiceProblemsRef}
            className="p-4 sm:p-5 rounded-2xl border transition-all duration-300 text-right space-y-2 bg-amber-500/10 border-amber-500/30"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-[#E5A91B] flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                <span>معمل حل المسائل والتدريبات النموذجية (منهج الوزارة 2027)</span>
              </span>

              <button
                onClick={() => {
                  const allShown = currentLesson.sections.every((_, idx) => Boolean(revealedSolutions[`sec-${idx}`]));
                  const nextState = {};
                  currentLesson.sections.forEach((_, idx) => {
                    nextState[`sec-${idx}`] = !allShown;
                  });
                  setRevealedSolutions(nextState);
                  if (!allShown && onSolutionRevealed) {
                    onSolutionRevealed();
                  }
                }}
                className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#E5A91B] border border-amber-500/30 transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
              >
                {currentLesson.sections.every((_, idx) => Boolean(revealedSolutions[`sec-${idx}`])) ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>إخفاء جميع خطوات الحل 🔒</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>إظهار جميع خطوات الحل 🔓</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              خطوات الحل مخفية بشكل افتراضي لتتيح لك تجربة التفكير والحل في كراستك أولاً. اضغط على "إظهار الحل" عند كل مسألة للتحقق من إجابتك النموذجية!
            </p>
          </div>

          <div className={`grid grid-cols-1 ${currentLesson.sections.length > 1 ? 'lg:grid-cols-2' : 'w-full'} gap-4 sm:gap-6`}>
            {currentLesson.sections.map((section, sIdx) => {
              const solKey = `sec-${sIdx}`;
              const isShown = Boolean(revealedSolutions[solKey]); // default hidden

              return (
                <div 
                  key={sIdx}
                  className="glass-panel p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 hover:border-amber-400/40 transition-all duration-500 flex flex-col justify-between text-right"
                >
                  <div className="space-y-4">
                    
                    {/* Problem Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#E5A91B]/20 text-[#E5A91B] border border-[#E5A91B]/40 flex items-center justify-center text-xs font-bold font-math">
                          {sIdx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          مسألة تطبيقية: {section.heading}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => speakText(`نص المسألة المطلوب حلها: ${section.problem || section.content}. خطوات الحل: ${section.example || ''}`)}
                          className="p-1.5 rounded-xl bg-cyan-500/10 text-[#39A9D0] hover:bg-cyan-500/20 transition flex items-center gap-1 text-[11px] font-bold"
                          title="استمع للمسألة وحلها صوتياً"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">استمع</span>
                        </button>

                        <button
                          onClick={() => toggleSolution(solKey)}
                          className="p-1.5 rounded-xl bg-amber-500/10 text-[#E5A91B] hover:bg-amber-500/20 transition flex items-center gap-1 text-[11px] font-bold"
                          title={isShown ? "إخفاء خطوات الحل" : "إظهار خطوات الحل"}
                        >
                          {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isShown ? 'إخفاء الحل' : 'إظهار الحل'}</span>
                        </button>
                      </div>
                    </div>

                    {isSingleSection ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
                        {/* Right Column: Problem Statement & Mental Math Tip */}
                        <div className="lg:col-span-6 space-y-4 text-right">
                          <div 
                            ref={sIdx === 0 ? problemCardRef : null}
                            className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-3 text-right transition-all duration-500 ${
                              isPracticeThinkingActive
                                ? 'bg-amber-500/20 border-[#E5A91B] ring-4 ring-[#E5A91B]/60 shadow-[0_0_35px_rgba(229,169,27,0.45)] scale-[1.02]'
                                : 'bg-amber-500/5 dark:bg-slate-800/90 border-amber-500/25 dark:border-white/10'
                            }`} 
                            dir="rtl"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <HelpCircle className="w-4 h-4 text-[#E5A91B]" />
                                <span>نص المسألة المطلوب حلها:</span>
                              </span>
                              {isPracticeThinkingActive ? (
                                <span className="px-3 py-1 rounded-full bg-[#E5A91B] text-slate-950 text-xs font-black animate-pulse shadow-md flex items-center gap-1.5 shrink-0">
                                  <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-spin" />
                                  <span>🎯 فكر في حل المسألة بنفسك الآن...</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-[#E5A91B] border border-amber-500/30 shrink-0">
                                  مسألة تطبيقية كاملة 📝
                                </span>
                              )}
                            </div>
                            <div className="text-xs sm:text-base text-slate-900 dark:text-slate-100 font-semibold leading-relaxed whitespace-pre-line text-right">
                              <MathExpression expr={section.problem || section.content} size="sm" dir="rtl" />
                            </div>
                          </div>

                          {section.keyPoints && section.keyPoints.length > 0 && (
                            <div className="p-4 rounded-2xl bg-[#39A9D0]/5 border border-[#39A9D0]/20 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                              <span className="font-bold text-[#39A9D0] flex items-center gap-1.5">
                                <Lightbulb className="w-4 h-4 text-[#E5A91B]" />
                                <span>فكرة الحل والاستنتاج الذهني:</span>
                              </span>
                              <p className="leading-relaxed">
                                {section.keyPoints[0]}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Left Column: The Solution Box (Toggleable) */}
                        <div className="lg:col-span-6 space-y-4 text-right">
                          {isShown ? (
                            <div className="space-y-3 animate-fadeIn">
                              {section.example && (
                                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs sm:text-sm space-y-2 text-right">
                                  <div className="flex items-center justify-between font-bold text-[#E5A91B]">
                                    <div className="flex items-center gap-1.5">
                                      <Sparkles className="w-4 h-4 text-[#E5A91B]" />
                                      <span>خطوات الحل والتطبيق الرياضي الكامل:</span>
                                    </div>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                                      تم التحقق من الحل ✓
                                    </span>
                                  </div>
                                  <div className="text-slate-800 dark:text-slate-100 leading-relaxed font-math pt-1 text-right">
                                    <MathExpression expr={section.example} size="md" dir="rtl" />
                                  </div>
                                </div>
                              )}

                              {section.formula && (
                                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-math text-xs text-amber-300 font-bold overflow-x-auto" dir="ltr">
                                  <MathExpression expr={section.formula} size="md" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-amber-400/40 text-center space-y-3 bg-amber-500/5">
                              <FileText className="w-9 h-9 text-[#E5A91B] mx-auto animate-pulse" />
                              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                خطوات الحل مخفية لتجربة الحل بنفسك أولاً!
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                حاول حل المسألة في كراستك أولاً، ثم اضغط على زر "إظهار خطوات الحل" لمقارنة إجابتك بالحل النموذجي.
                              </p>
                              <button
                                onClick={() => toggleSolution(solKey)}
                                className="px-5 py-2 rounded-xl bg-[#E5A91B] text-slate-950 font-black text-xs hover:brightness-110 transition shadow-sm inline-flex items-center gap-1.5 mt-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>إظهار خطوات الحل والتحقق</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Context / Problem Statement */}
                        <div 
                          ref={sIdx === 0 ? problemCardRef : null}
                          className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-3 text-right transition-all duration-500 ${
                            isPracticeThinkingActive
                              ? 'bg-amber-500/20 border-[#E5A91B] ring-4 ring-[#E5A91B]/60 shadow-[0_0_35px_rgba(229,169,27,0.45)] scale-[1.02]'
                              : 'bg-amber-500/5 dark:bg-slate-800/90 border-amber-500/25 dark:border-white/10'
                          }`} 
                          dir="rtl"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4 text-[#E5A91B]" />
                              <span>نص المسألة المطلوب حلها:</span>
                            </span>
                            {isPracticeThinkingActive ? (
                              <span className="px-3 py-1 rounded-full bg-[#E5A91B] text-slate-950 text-xs font-black animate-pulse shadow-md flex items-center gap-1.5 shrink-0">
                                <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-spin" />
                                <span>🎯 فكر في حل المسألة بنفسك الآن...</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-[#E5A91B] border border-amber-500/30 shrink-0">
                                مسألة تطبيقية كاملة 📝
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-base text-slate-900 dark:text-slate-100 font-semibold leading-relaxed whitespace-pre-line text-right">
                            <MathExpression expr={section.problem || section.content} size="sm" dir="rtl" />
                          </div>
                        </div>

                        {/* The Solution Box (Toggleable) */}
                        {isShown ? (
                          <div className="space-y-3 pt-1 animate-fadeIn">
                            {section.example && (
                              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs sm:text-sm space-y-2 text-right">
                                <div className="flex items-center justify-between font-bold text-[#E5A91B]">
                                  <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-[#E5A91B]" />
                                    <span>خطوات الحل والتطبيق الرياضي الكامل:</span>
                                  </div>
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                                    تم التحقق من الحل ✓
                                  </span>
                                </div>
                                <div className="text-slate-800 dark:text-slate-100 leading-relaxed font-math pt-1 text-right">
                                  <MathExpression expr={section.example} size="md" dir="rtl" />
                                </div>
                              </div>
                            )}

                            {section.formula && (
                              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 font-math text-xs text-amber-300 font-bold overflow-x-auto" dir="ltr">
                                <MathExpression expr={section.formula} size="md" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl border-2 border-dashed border-amber-400/40 text-center space-y-2 bg-amber-500/5">
                            <FileText className="w-8 h-8 text-[#E5A91B] mx-auto animate-pulse" />
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              خطوات الحل مخفية لتجربة الحل بنفسك أولاً!
                            </h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              حاول حل المسألة في كراستك، ثم اضغط زر "إظهار الحل" بالأسفل لمقارنة إجابتك.
                            </p>
                            <button
                              onClick={() => toggleSolution(solKey)}
                              className="px-4 py-1.5 rounded-xl bg-[#E5A91B] text-slate-950 font-black text-xs hover:brightness-110 transition shadow-sm mt-1"
                            >
                              إظهار خطوات الحل والتحقق
                            </button>
                          </div>
                        )}

                        {/* Mental Math Trick / Key Note */}
                        {section.keyPoints && section.keyPoints.length > 0 && (
                          <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                            <span className="font-bold text-[#39A9D0] block">💡 فكرة الحل والاستنتاج الذهني:</span>
                            <p className="line-clamp-2">
                              {section.keyPoints[0]}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}