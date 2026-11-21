import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  FlaskConical, 
  Video, 
  Target, 
  Award, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  GraduationCap,
  X
} from 'lucide-react';
import ConceptLesson from './ConceptLesson.jsx';
import VideoPlayer from './VideoPlayer.jsx';
import audioManifest from '../../data/audioManifest.json';

// Labs
import PlaceValueLab from '../labs/PlaceValueLab.jsx';
import DecimalGridLab from '../labs/DecimalGridLab.jsx';
import FactorTreeLab from '../labs/FactorTreeLab.jsx';
import AreaModelLab from '../labs/AreaModelLab.jsx';
import LongDivisionLab from '../labs/LongDivisionLab.jsx';
import PemdasLab from '../labs/PemdasLab.jsx';

export default function StageViewer({ 
  stage, 
  onStartQuiz, 
  isCompleted, 
  quizScore,
  onPrevStage,
  onNextStage,
  hasNext,
  hasPrev
}) {
  // Step index across current stage:
  // 0 to 2*L-1: Lessons (even: concepts, odd: practice)
  // 2*L: Visual Lab
  // 2*L + 1: Video Player
  // 2*L + 2: Final Quiz Station
  const [stepIndex, setStepIndex] = useState(0);
  const [autoPlayKey, setAutoPlayKey] = useState(null);

  // Audio narration state shared with bottom bar & AudioNarrator
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [audioRate, setAudioRate] = useState(1.0);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(-1);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const speakTimeoutRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const activeManifestTaskRef = useRef(null);

  const lessonCount = stage.lessons?.length || 1;
  const totalSteps = lessonCount * 2 + 3;

  // Strict Sequential Progression Lock within Stage
  const storageKey = `stage_${stage.id}_max_unlocked_step`;
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(() => {
    if (isCompleted) return totalSteps - 1;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) return Math.max(0, Math.min(val, totalSteps - 1));
      }
    } catch (e) {}
    return 0;
  });

  // When stage or isCompleted changes, sync maxUnlockedStep
  useEffect(() => {
    if (isCompleted) {
      setMaxUnlockedStep(totalSteps - 1);
    } else {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          const val = parseInt(saved, 10);
          if (!isNaN(val)) {
            setMaxUnlockedStep(Math.max(0, Math.min(val, totalSteps - 1)));
            return;
          }
        }
      } catch (e) {}
      setMaxUnlockedStep(0);
    }
  }, [stage.id, isCompleted, totalSteps]);

  const advanceUnlockedStep = (targetStep) => {
    setMaxUnlockedStep(prev => {
      const nextVal = Math.max(prev, targetStep);
      try {
        localStorage.setItem(storageKey, nextVal.toString());
      } catch (e) {}
      return nextVal;
    });
  };

  const [lockToast, setLockToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showLockToast = (message, title = "محطة مقفلة 🔒") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setLockToast({ title, message });
    toastTimeoutRef.current = setTimeout(() => {
      setLockToast(null);
    }, 3800);
  };

  // Initialize Audio player, SpeechSynthesis, and cleanup on unmount
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const audio = new Audio();
    audioPlayerRef.current = audio;

    const handleTimeUpdate = () => {
      if (!audio) return;
      const t = audio.currentTime;
      const activeTask = activeManifestTaskRef.current;
      if (activeTask && activeTask.sentences && activeTask.sentences.length > 0) {
        const matchIdx = activeTask.sentences.findIndex(
          s => t >= s.startTime && t <= (s.endTime + 0.25)
        );
        if (matchIdx !== -1) {
          setCurrentSentenceIdx(matchIdx);
        }
      }
    };

    const handleEnded = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setCurrentSentenceIdx(-1);
    };

    const handlePause = () => {
      if (audioPlayerRef.current && !audioPlayerRef.current.ended) {
        setIsPausedAudio(true);
      }
    };

    const handlePlay = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch (e) {}
      }
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('play', handlePlay);
        try {
          audio.pause();
          audio.src = '';
        } catch (e) {}
      }
    };
  }, []);

  // Dynamic bottom offset so the navigation bar stops before the footer
  const [bottomOffset, setBottomOffset] = useState(8);

  useEffect(() => {
    const updateBottomOffset = () => {
      const footer = document.querySelector('footer');
      const baseMargin = window.innerWidth >= 640 ? 16 : 8; // sm:bottom-4 (16px) vs bottom-2 (8px)

      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const overlap = window.innerHeight - footerRect.top;
        if (overlap > 0) {
          // When footer enters the viewport, push the bar up so it stops right before the footer!
          setBottomOffset(overlap + baseMargin);
        } else {
          setBottomOffset(baseMargin);
        }
      } else {
        setBottomOffset(baseMargin);
      }
    };

    window.addEventListener('scroll', updateBottomOffset, { passive: true });
    window.addEventListener('resize', updateBottomOffset, { passive: true });
    updateBottomOffset();

    return () => {
      window.removeEventListener('scroll', updateBottomOffset);
      window.removeEventListener('resize', updateBottomOffset);
    };
  }, []);

  // Reset step index when stage changes
  useEffect(() => {
    stopAudio();
    setStepIndex(0);
  }, [stage.id]);

  // Compute current step details
  const getStepDetails = (step) => {
    const lessonSteps = lessonCount * 2;
    if (step < lessonSteps) {
      const lessonIdx = Math.floor(step / 2);
      const isConcepts = step % 2 === 0;
      const lesson = stage.lessons[lessonIdx] || stage.lessons[0];
      return {
        type: 'lesson',
        activeTab: 'lessons',
        lessonIdx,
        subTab: isConcepts ? 'concepts' : 'practice',
        title: isConcepts 
          ? `الدرس ${lessonIdx + 1}: ${lesson.title} - الشرح والمفاهيم 💡` 
          : `الدرس ${lessonIdx + 1}: ${lesson.title} - حل المسائل والتطبيقات 📝`,
        shortBadge: isConcepts ? `درس ${lessonIdx + 1} (شرح)` : `درس ${lessonIdx + 1} (مسائل)`,
        lessonTitle: lesson.title
      };
    } else if (step === lessonSteps) {
      return {
        type: 'lab',
        activeTab: 'lab',
        lessonIdx: 0,
        subTab: 'concepts',
        title: `المعمل التفاعلي البصري للمرحلة ${stage.id} 🔬`,
        shortBadge: 'المعمل البصري',
        lessonTitle: 'المعمل البصري'
      };
    } else if (step === lessonSteps + 1) {
      return {
        type: 'video',
        activeTab: 'video',
        lessonIdx: 0,
        subTab: 'concepts',
        title: `الفيديو التفاعلي ومحطات الشرح للمرحلة ${stage.id} 🎬`,
        shortBadge: 'الفيديو التفاعلي',
        lessonTitle: 'الفيديو التفاعلي'
      };
    } else {
      return {
        type: 'quiz',
        activeTab: 'quiz',
        lessonIdx: 0,
        subTab: 'concepts',
        title: `اختبار التقييم النهائي للمرحلة ${stage.id} 🎯`,
        shortBadge: 'اختبار المرحلة',
        lessonTitle: 'اختبار المرحلة'
      };
    }
  };

  const currentStep = getStepDetails(stepIndex);
  const nextStep = stepIndex < totalSteps - 1 ? getStepDetails(stepIndex + 1) : null;
  const prevStep = stepIndex > 0 ? getStepDetails(stepIndex - 1) : null;

  const currentLesson = stage.lessons?.[currentStep.lessonIdx] || stage.lessons?.[0];

  // Split current lesson script into sentences for highlighting and playback
  const currentSentences = (currentStep.subTab === 'concepts' && currentLesson?.voiceScript)
    ? currentLesson.voiceScript.split(/([.!؟])/g).reduce((acc, part, i, arr) => {
        if (i % 2 === 0 && part.trim()) {
          const punct = arr[i + 1] || '';
          acc.push(part.trim() + punct);
        }
        return acc;
      }, [])
    : [];

  const stopAudio = () => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch (e) {}
    }
    activeManifestTaskRef.current = null;
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setCurrentSentenceIdx(-1);
  };

  const startSpeaking = (fromSentence = 0, customText = null, customStep = null) => {
    stopAudio();

    const targetStep = customStep || currentStep;
    // في تبويب الفيديو التفاعلي أو الاختبار، لا يتم تشغيل صوت خلفية تلقائي
    if (targetStep.type === 'video' || targetStep.type === 'quiz' || targetStep.activeTab === 'video' || targetStep.activeTab === 'quiz') {
      return;
    }

    const targetLesson = stage.lessons?.[targetStep.lessonIdx] || stage.lessons?.[0];

    // Check if pre-recorded Silma AI audio exists in audioManifest
    let manifestKey = null;
    if (targetStep.type === 'lesson') {
      manifestKey = targetStep.subTab === 'concepts'
        ? `lesson-${stage.id}-${targetLesson.id}`
        : `practice-${stage.id}-${targetLesson.id}`;
    } else if (targetStep.type === 'lab') {
      manifestKey = `lab-${stage.id}`;
    } else if (targetStep.type === 'video') {
      manifestKey = `video-${stage.id}`;
    } else if (targetStep.type === 'quiz') {
      manifestKey = `quiz-${stage.id}`;
    }

    const recordedAudio = manifestKey ? audioManifest[manifestKey] : null;

    if (recordedAudio && recordedAudio.url && !customText) {
      // 🌟 PRE-RECORDED SILMA AI AUDIO PLAYBACK 🌟
      activeManifestTaskRef.current = recordedAudio;
      const audio = audioPlayerRef.current;
      if (!audio) return;

      let startTime = 0;
      if (fromSentence > 0 && recordedAudio.sentences && recordedAudio.sentences[fromSentence]) {
        startTime = recordedAudio.sentences[fromSentence].startTime;
      }

      if (audio.src && audio.src.includes(recordedAudio.url)) {
        // Fast seek if the audio file is already loaded
        speakTimeoutRef.current = setTimeout(() => {
          try {
            audio.currentTime = startTime;
            audio.playbackRate = audioRate;
            setCurrentSentenceIdx(fromSentence);
            audio.play().catch(() => {});
          } catch (e) {}
        }, 30);
        return;
      }

      audio.src = recordedAudio.url;
      audio.playbackRate = audioRate;

      speakTimeoutRef.current = setTimeout(() => {
        try {
          audio.currentTime = startTime;
          setCurrentSentenceIdx(fromSentence);
          audio.play().catch(() => {});
        } catch (e) {}
      }, 50);

      return;
    }

    // 🌟 FALLBACK: SpeechSynthesis 🌟
    activeManifestTaskRef.current = null;
    if (!synthRef.current && typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    if (!synthRef.current) return;

    let textToSpeak = customText;
    if (!textToSpeak) {
      if (targetStep.type === 'lesson') {
        if (targetStep.subTab === 'concepts') {
          const targetSentences = targetLesson?.voiceScript
            ? targetLesson.voiceScript.split(/([.!؟])/g).reduce((acc, part, i, arr) => {
                if (i % 2 === 0 && part.trim()) {
                  const punct = arr[i + 1] || '';
                  acc.push(part.trim() + punct);
                }
                return acc;
              }, [])
            : [];
          textToSpeak = targetSentences.slice(fromSentence).join(' ') || targetLesson?.voiceScript;
        } else {
          textToSpeak = `والآن مع تبويب حل المسائل والتطبيقات النموذجية للدرس: ${targetLesson?.title}. فكر في حل المسائل بنفسك، ثم اضغط على زر إظهار الحل للتحقق.`;
        }
      } else if (targetStep.type === 'lab') {
        textToSpeak = `أهلاً بك في المعمل البصري التفاعلي للمرحلة ${stage.id}: ${stage.title}. استكشف وجرّب المفاهيم بنفسك.`;
      } else if (targetStep.type === 'video') {
        textToSpeak = `والآن مع محطة الفيديو التفاعلي والشرح المرئي للمرحلة ${stage.id}. شاهد الشرح وأجب عن الأسئلة التفاعلية.`;
      } else if (targetStep.type === 'quiz') {
        textToSpeak = `وصلت إلى المحطة الختامية! اختبر مهاراتك الآن في اختبار نهاية المرحلة للحصول على درجاتك والانتقال للمرحلة التالية.`;
      }
    }

    if (!textToSpeak) return;

    // Short 60ms delay before speak to let the browser audio thread fully purge the cancelled queue
    speakTimeoutRef.current = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ar-SA';
        utterance.rate = audioRate;

        const voices = synthRef.current.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('Arab'));
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        }

        utterance.onstart = () => {
          setIsPlayingAudio(true);
          setIsPausedAudio(false);
          if (targetStep.subTab === 'concepts') {
            setCurrentSentenceIdx(fromSentence);
          }
        };

        utterance.onend = () => {
          setIsPlayingAudio(false);
          setIsPausedAudio(false);
          setCurrentSentenceIdx(-1);
        };

        utterance.onerror = () => {
          setIsPlayingAudio(false);
          setIsPausedAudio(false);
          setCurrentSentenceIdx(-1);
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
      } catch (e) {
        setIsPlayingAudio(false);
        setIsPausedAudio(false);
        setCurrentSentenceIdx(-1);
      }
    }, 60);
  };

  const toggleAudioPlay = () => {
    // 1. If playing pre-recorded audio
    const audio = audioPlayerRef.current;
    if (audio && audio.src && activeManifestTaskRef.current) {
      if (isPlayingAudio && !isPausedAudio) {
        audio.pause();
        setIsPausedAudio(true);
      } else if (isPlayingAudio && isPausedAudio) {
        audio.play().catch(() => {});
        setIsPausedAudio(false);
      } else {
        startSpeaking(currentSentenceIdx >= 0 ? currentSentenceIdx : 0);
      }
      return;
    }

    // 2. SpeechSynthesis fallback
    if (synthRef.current && isPlayingAudio) {
      if (!isPausedAudio) {
        synthRef.current.pause();
        setIsPausedAudio(true);
      } else if (isPausedAudio) {
        synthRef.current.resume();
        setIsPausedAudio(false);
      } else {
        startSpeaking(0);
      }
      return;
    }

    startSpeaking(0);
  };

  const handleAudioRateChange = (newRate) => {
    setAudioRate(newRate);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = newRate;
    }
    if (isPlayingAudio && !activeManifestTaskRef.current) {
      startSpeaking(currentSentenceIdx >= 0 ? currentSentenceIdx : 0);
    }
  };

  // Scroll smoothly to start directly below the lesson list
  const scrollToExplanation = () => {
    setTimeout(() => {
      // إذا كان الانتقال لتبويب الفيديو التفاعلي، يقوم المكون بالتمركز تلقائياً في منتصف الشاشة
      if (currentStep.activeTab === 'video') return;

      // Prioritize target directly below the lessons list if present
      const targetElem = document.getElementById('after-lessons-list') || document.getElementById('lesson-explanation-start');
      if (targetElem) {
        const headerOffset = 65; // Account for sticky top header height
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Navigate to specific step with auto-play and scroll to start of explanation
  const goToStep = (newStep, triggerPlay = true) => {
    // Strict Sequential Progression Check: prevent jumping ahead to locked steps
    if (!isCompleted && newStep > maxUnlockedStep) {
      const lessonSteps = lessonCount * 2;
      if (newStep >= lessonSteps + 2) {
        showLockToast("اختبار المرحلة مقفل! يجب إنهاء جميع دروس المرحلة والمعمل البصري والفيديو التفاعلي أولاً بالترتيب.", "اختبار المرحلة مقفل 🔒");
      } else if (newStep >= lessonSteps + 1) {
        showLockToast("الفيديو التفاعلي مقفل! يجب استكمال جميع دروس المرحلة والمعمل البصري أولاً بالترتيب.", "الفيديو التفاعلي مقفل 🔒");
      } else if (newStep >= lessonSteps) {
        showLockToast("المعمل البصري مقفل! يجب إكمال جميع دروس المرحلة وحل مسائلها النموذجية أولاً بالترتيب.", "المعمل البصري مقفل 🔒");
      } else {
        showLockToast("هذا الدرس مقفل! تابع دراسة الدروس وحل المسائل بالترتيب الإلزامي أولاً.", "درس مقفل 🔒");
      }
      return;
    }

    stopAudio();
    const clampedStep = Math.max(0, Math.min(newStep, totalSteps - 1));
    setStepIndex(clampedStep);

    scrollToExplanation();

    const nextStepDetails = getStepDetails(clampedStep);
    const isVideoOrQuiz = nextStepDetails.type === 'video' || nextStepDetails.type === 'quiz' || nextStepDetails.activeTab === 'video' || nextStepDetails.activeTab === 'quiz';

    if (triggerPlay && !isVideoOrQuiz) {
      const newKey = Date.now();
      setAutoPlayKey(newKey);
      speakTimeoutRef.current = setTimeout(() => {
        startSpeaking(0, null, nextStepDetails);
      }, 300);
    }
  };

  // Next Button handler with strict quiz-completion gating & step-by-step unlock
  const handleNext = () => {
    stopAudio();
    if (stepIndex < totalSteps - 1) {
      const nextIndex = stepIndex + 1;
      advanceUnlockedStep(nextIndex);
      goToStep(nextIndex, true);
    } else {
      // Reached the end of stage (the Quiz step)
      if (!isCompleted) {
        // Must take and pass quiz first!
        onStartQuiz();
      } else if (hasNext) {
        // If passed and there's a next stage, proceed
        onNextStage();
      } else {
        // Final stage completed -> open final exam
        onStartQuiz();
      }
    }
  };

  // Prev Button handler
  const handlePrev = () => {
    stopAudio();
    if (stepIndex > 0) {
      goToStep(stepIndex - 1, false);
    } else if (hasPrev) {
      onPrevStage();
    }
  };

  const renderLab = () => {
    switch (stage.labComponent) {
      case 'PlaceValueLab':
        return <PlaceValueLab />;
      case 'DecimalGridLab':
        return <DecimalGridLab />;
      case 'FactorTreeLab':
        return <FactorTreeLab />;
      case 'AreaModelLab':
        return <AreaModelLab />;
      case 'LongDivisionLab':
        return <LongDivisionLab />;
      case 'PemdasLab':
        return <PemdasLab />;
      default:
        return <PlaceValueLab />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-32">
      
      {/* Centered Smooth Responsive Modal for Locked Station & Lesson Alerts */}
      {lockToast && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setLockToast(null)}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-3xl bg-slate-900/95 dark:bg-slate-900/95 light:bg-white text-white light:text-slate-900 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 text-right space-y-4"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-[#E5A91B] shadow-glow-gold">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm sm:text-base font-black text-[#E5A91B]">
                    {lockToast.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    تنبيه المسار الإلزامي
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setLockToast(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-100 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition shrink-0"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 dark:text-slate-200 light:text-slate-700 leading-relaxed font-medium">
              {lockToast.message}
            </p>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setLockToast(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-1.5"
              >
                <span>حسناً، فهمت 👍</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stage Header Banner (Refined: Removed early quiz button and stage jump arrows) */}
      <div className="glass-panel p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden">
        
        {/* Glow Accent */}
        <div 
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none -mr-20 -mt-20"
          style={{ backgroundColor: stage.color }}
        ></div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl text-right" dir="rtl">
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: stage.color }}
              >
                المرحلة {stage.id}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{stage.subtitle}</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stage.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {stage.description}
            </p>
          </div>

          {/* Stage Status Card (No quiz button at top - quiz only at the end!) */}
          <div className="flex flex-col items-start sm:items-end gap-2 text-right">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-sm">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم اجتياز المرحلة بنجاح! النتيجة: {quizScore}% 🏆</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3.5 py-2 rounded-2xl border border-amber-500/30 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#E5A91B] shrink-0" />
                <span>مسار التعلم نشط: أكمل الدروس والمعمل للاختبار</span>
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-medium">
              المحطة: {currentStep.shortBadge} (خطوة {stepIndex + 1} من {totalSteps})
            </span>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="relative z-10 flex items-center justify-between gap-2 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full w-full p-1 sm:p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 shadow-inner no-scrollbar touch-pan-x">
            {/* Lessons Tab */}
            <button
              onClick={() => {
                stopAudio();
                goToStep(0, false);
              }}
              className={`shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-2 ${
                currentStep.activeTab === 'lessons'
                  ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>الدروس ({lessonCount})</span>
            </button>

            {/* Visual Lab Tab (Locked until lessons are completed) */}
            <button
              onClick={() => {
                if (!isCompleted && maxUnlockedStep < lessonCount * 2) {
                  showLockToast("المعمل البصري مقفل! يجب إكمال جميع دروس المرحلة وحل مسائلها النموذجية أولاً بالترتيب.", "المعمل البصري مقفل 🔒");
                  return;
                }
                stopAudio();
                goToStep(lessonCount * 2, false);
              }}
              className={`shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-2 ${
                !isCompleted && maxUnlockedStep < lessonCount * 2
                  ? 'opacity-60 bg-slate-200 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-white/5'
                  : currentStep.activeTab === 'lab'
                  ? 'bg-[#E5A91B] text-slate-950 shadow-glow-gold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={!isCompleted && maxUnlockedStep < lessonCount * 2 ? "أكمل جميع دروس المرحلة أولاً لفتح المعمل" : "المعمل البصري"}
            >
              {!isCompleted && maxUnlockedStep < lessonCount * 2 && <Lock className="w-3 h-3 text-amber-500" />}
              <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>المعمل البصري</span>
            </button>

            {/* Interactive Video Tab (Locked until Lab is completed) */}
            <button
              onClick={() => {
                if (!isCompleted && maxUnlockedStep < lessonCount * 2 + 1) {
                  showLockToast("الفيديو التفاعلي مقفل! يجب استكمال جميع دروس المرحلة والمعمل البصري أولاً بالترتيب.", "الفيديو التفاعلي مقفل 🔒");
                  return;
                }
                stopAudio();
                goToStep(lessonCount * 2 + 1, false);
              }}
              className={`shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-2 ${
                !isCompleted && maxUnlockedStep < lessonCount * 2 + 1
                  ? 'opacity-60 bg-slate-200 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-white/5'
                  : currentStep.activeTab === 'video'
                  ? 'bg-[#B51F3A] text-white shadow-glow-crimson'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={!isCompleted && maxUnlockedStep < lessonCount * 2 + 1 ? "أكمل الدروس والمعمل البصري أولاً لفتح الفيديو" : "الفيديو التفاعلي"}
            >
              {!isCompleted && maxUnlockedStep < lessonCount * 2 + 1 && <Lock className="w-3 h-3 text-rose-500" />}
              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>الفيديو التفاعلي</span>
            </button>

            {/* Stage Quiz Tab (Locked until Video is completed) */}
            <button
              onClick={() => {
                if (!isCompleted && maxUnlockedStep < lessonCount * 2 + 2) {
                  showLockToast("اختبار المرحلة مقفل! يجب إنهاء جميع محطات المرحلة أولاً للوصول للاختبار.", "اختبار المرحلة مقفل 🔒");
                  return;
                }
                stopAudio();
                goToStep(lessonCount * 2 + 2, false);
              }}
              className={`shrink-0 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-2 ${
                !isCompleted && maxUnlockedStep < lessonCount * 2 + 2
                  ? 'opacity-60 bg-slate-200 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-white/5'
                  : currentStep.activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-[#B51F3A] to-[#E5A91B] text-white shadow-glow-crimson font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={!isCompleted && maxUnlockedStep < lessonCount * 2 + 2 ? "أكمل جميع محطات المرحلة أولاً لفتح الاختبار" : "اختبار المرحلة"}
            >
              {!isCompleted && maxUnlockedStep < lessonCount * 2 + 2 && <Lock className="w-3 h-3 text-amber-500" />}
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>اختبار المرحلة</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-xs font-bold text-slate-400 font-math bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/5 shrink-0">
            المرحلة {stage.id} من 6
          </div>
        </div>

      </div>

      {/* Main Tab Content Anchor (Scrolls directly here when clicking Next!) */}
      <div id="lesson-explanation-start" className="transition-all duration-300">
        {currentStep.activeTab === 'lessons' && (
          <ConceptLesson 
            stage={stage}
            activeLessonIdx={currentStep.lessonIdx}
            onSelectLessonIdx={(idx) => goToStep(idx * 2, true)}
            activeTabMode={currentStep.subTab}
            onSelectTabMode={(mode) => goToStep(currentStep.lessonIdx * 2 + (mode === 'concepts' ? 0 : 1), true)}
            autoPlayKey={autoPlayKey}
            isPlayingAudio={isPlayingAudio}
            isPausedAudio={isPausedAudio}
            audioRate={audioRate}
            currentSentenceIdx={currentSentenceIdx}
            onToggleAudioPlay={toggleAudioPlay}
            onStopAudio={stopAudio}
            onRateChange={handleAudioRateChange}
            onStartSpeakingSentence={(idx) => startSpeaking(idx)}
            maxUnlockedLessonIdx={isCompleted ? stage.lessons.length : Math.floor(maxUnlockedStep / 2)}
            onLockedLessonClick={(idx) => {
              showLockToast(`الدرس ${idx + 1} مقفل! يجب دراسة الدرس السابق وحل مسائله بالترتيب الإلزامي أولاً.`, "درس مقفل 🔒");
            }}
          />
        )}

        {currentStep.activeTab === 'lab' && renderLab()}

        {currentStep.activeTab === 'video' && (
          <VideoPlayer 
            videoData={stage.videoCheckpoint} 
            stageId={stage.id} 
            stageTitle={stage.title} 
            onStopOutsideAudio={stopAudio}
          />
        )}

        {currentStep.activeTab === 'quiz' && (
          <div className="glass-panel p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-white/15 text-center space-y-5 max-w-2xl mx-auto shadow-2xl" dir="rtl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#B51F3A] to-[#E5A91B] flex items-center justify-center text-3xl shadow-glow-crimson mx-auto">
              🎯
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#39A9D0] uppercase tracking-wider">
                المحطة الختامية للمرحلة {stage.id}
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white">
                اختبار نهاية {stage.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                لقد أنهيت جميع دروس المرحلة والمعمل البصري والفيديو التفاعلي بنجاح! اجتياز هذا الاختبار إلزامي بنسبة نجاح 70% فما فوق لفتح المرحلة التالية.
              </p>
            </div>

            {isCompleted ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span>أحسنت! تم اجتياز الاختبار بنجاح بدرجة: {quizScore}%</span>
              </div>
            ) : null}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onStartQuiz}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#B51F3A] to-[#E5A91B] text-white font-black text-sm shadow-glow-crimson hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                <span>{isCompleted ? 'إعادة الاختبار لتحسين الدرجة' : 'بدء الاختبار الآن 🎯'}</span>
              </button>

              {/* Only show next stage button if quiz is actually completed! */}
              {isCompleted && hasNext && (
                <button
                  onClick={onNextStage}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>الانتقال للمرحلة {stage.id + 1} 🚀</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* BOTTOM NAVIGATION BAR (شريط التنقل السفلي الثابت التفاعلي)*/}
      {/* ======================================================== */}
      <div 
        className="fixed left-0 right-0 z-40 px-2 sm:px-4 pointer-events-none"
        style={{ bottom: `${bottomOffset}px` }}
        dir="rtl"
      >
        <div className="max-w-4xl mx-auto p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur-xl border border-white/20 dark:border-white/20 light:border-slate-300 shadow-2xl flex items-center justify-between gap-1 sm:gap-3 pointer-events-auto">
          
          {/* Previous Step Button */}
          <button
            onClick={handlePrev}
            disabled={stepIndex === 0 && !hasPrev}
            className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2 transition shadow-sm shrink-0"
            title="المحطة السابقة"
          >
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">السابق</span>
          </button>

          {/* Interactive Audio Narration Play/Pause Button in Bottom Bar (Hidden on Video tab) */}
          {currentStep.activeTab !== 'video' && (
            <button
              onClick={toggleAudioPlay}
              className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 shrink-0 shadow-sm ${
                isPlayingAudio && !isPausedAudio
                  ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary scale-105 animate-pulse'
                  : isPlayingAudio && isPausedAudio
                  ? 'bg-amber-500/20 text-[#E5A91B] border border-[#E5A91B]/40 hover:bg-amber-500/30'
                  : 'bg-slate-800/90 dark:bg-slate-800/90 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white hover:border-[#39A9D0]/50 border border-white/10 dark:border-white/10 light:border-slate-300'
              }`}
              title={isPlayingAudio && !isPausedAudio ? "إيقاف الشرح الصوتي مؤقتاً" : "تشغيل / استئناف الشرح الصوتي"}
            >
              {isPlayingAudio && !isPausedAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 fill-current" />
                  <span className="text-[11px] sm:text-xs">إيقاف</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#39A9D0]" />
                  <Play className="w-3 h-3 text-[#39A9D0] fill-current -scale-x-100" />
                  <span className="text-[11px] sm:text-xs hidden xs:inline">
                    {isPausedAudio ? 'متابعة' : 'الشرح الصوتي'}
                  </span>
                </>
              )}
            </button>
          )}

          {/* Current Step Info & Progress Indicator in Middle */}
          <div className="flex-1 min-w-0 text-center space-y-0.5 sm:space-y-1 px-1">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <span className="text-[9px] sm:text-[11px] font-bold text-[#39A9D0] bg-[#39A9D0]/10 border border-[#39A9D0]/30 px-1.5 sm:px-2.5 py-0.5 rounded-full font-math shrink-0">
                {stepIndex + 1} / {totalSteps}
              </span>
              <span className="text-[10px] sm:text-xs font-black text-white dark:text-white light:text-slate-900 truncate">
                {currentStep.shortBadge}
              </span>
            </div>

            {/* Stage Step Progress Bar */}
            <div className="w-full max-w-[80px] xs:max-w-[120px] sm:max-w-xs mx-auto h-1 sm:h-1.5 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-l from-[#39A9D0] via-[#E5A91B] to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Next Step Button with Auto-Play Narration & Quiz-Gating */}
          <button
            onClick={handleNext}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#39A9D0] to-[#E5A91B] text-slate-950 font-black text-xs sm:text-sm shadow-glow-primary hover:brightness-110 active:scale-95 transition flex items-center gap-1 sm:gap-1.5 shrink-0"
            title="المحطة التالية"
          >
            <span className="truncate max-w-[75px] xs:max-w-[110px] sm:max-w-none text-[11px] sm:text-xs">
              {stepIndex < totalSteps - 1 ? (
                <>التالي: {nextStep?.shortBadge}</>
              ) : !isCompleted ? (
                <>الاختبار 🎯</>
              ) : hasNext ? (
                <>التالية 🚀</>
              ) : (
                <>النهائي 🏆</>
              )}
            </span>
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </button>

        </div>
      </div>

    </div>
  );
}
