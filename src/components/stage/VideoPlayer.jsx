import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  HelpCircle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack, 
  Award,
  Layers,
  Flame,
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';
import Fraction from '../common/Fraction.jsx';
import MathExpression from '../common/MathExpression.jsx';
import audioManifest from '../../data/audioManifest.json';

/**
 * Phonetic Converter: Converts mathematical formulas and decimals into fluent spoken Arabic
 * for browser SpeechSynthesis fallback.
 */
export function convertMathToSpeech(text) {
  if (!text) return "";
  return text
    .replace(/0\.6\b/g, "ستة من عشرة")
    .replace(/0\.25\b/g, "خمسة وعشرون من مائة")
    .replace(/0\.31\b/g, "واحد وثلاثون من مائة")
    .replace(/0\.85\b/g, "خمسة وثمانون من مائة")
    .replace(/0\.26\b/g, "ستة وعشرون من مائة")
    .replace(/0\.75\b/g, "خمسة وسبعون من مائة")
    .replace(/0\.5\b/g, "خمسة من عشرة")
    .replace(/0\.50\b/g, "خمسون من مائة")
    .replace(/0\.35\b/g, "خمسة وثلاثون من مائة")
    .replace(/0\.42\b/g, "اثنان وأربعون من مائة")
    .replace(/0\.77\b/g, "سبعة وسبعون من مائة")
    .replace(/0\.84\b/g, "أربعة وثمانون من مائة")
    .replace(/0\.53\b/g, "ثلاثة وخمسون من مائة")
    .replace(/0\.125\b/g, "مائة وخمسة وعشرون من ألف")
    .replace(/3\.45\b/g, "ثلاثة فاصلة خمسة وأربعون")
    .replace(/34\.5\b/g, "أربعة وثلاثون فاصلة خمسة")
    .replace(/0\.345\b/g, "ثلاثمائة وخمسة وأربعون من ألف")
    .replace(/5\.50\b/g, "خمسة جنيهات وخمسون قرشاً")
    .replace(/2\.25\b/g, "جنيهان وخمسة وعشرون قرشاً")
    .replace(/3\.25\b/g, "ثلاثة جنيهات وخمسة وعشرون قرشاً")
    .replace(/14\.70\b/g, "أربعة عشر فاصلة سبعون")
    .replace(/6\.25\b/g, "ستة فاصلة خمسة وعشرون")
    .replace(/20\.95\b/g, "عشرون فاصلة خمسة وتسعون")
    .replace(/(\d+)\/(\d+)/g, "$1 على $2")
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "$1 على $2")
    .replace(/\+/g, " زائد ")
    .replace(/\-/g, " ناقص ")
    .replace(/[×*]/g, " في ")
    .replace(/[÷/]/g, " على ")
    .replace(/=/g, " يساوي ")
    .replace(/(\d+)\.(\d+)/g, "$1 فاصلة $2");
}

export default function VideoPlayer({ videoData, stageId, stageTitle, onStopOutsideAudio }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [completedCheckpoints, setCompletedCheckpoints] = useState([]);
  const [checkpointStatus, setCheckpointStatus] = useState({}); // { [timestamp]: 'correct' | 'wrong' | 'skipped' }
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [teacherSubtitle, setTeacherSubtitle] = useState("");

  const totalDuration = 180;
  const speechRef = useRef(null);
  const videoAudioRef = useRef(null);
  const activeManifestTaskRef = useRef(null);
  const [currentAudioSentenceIdx, setCurrentAudioSentenceIdx] = useState(-1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const checkpoints = videoData?.checkpoints || [];
  const openCheckpointRef = useRef(null);
  const completedCheckpointsRef = useRef(completedCheckpoints);
  completedCheckpointsRef.current = completedCheckpoints;

  const whiteboardCanvasRef = useRef(null);
  const [autoStartCountdown, setAutoStartCountdown] = useState(2);
  const autoStartTimerRef = useRef(null);

  const cancelAutoStart = () => {
    if (autoStartTimerRef.current) {
      if (autoStartTimerRef.current.step1) clearTimeout(autoStartTimerRef.current.step1);
      if (autoStartTimerRef.current.step2) clearTimeout(autoStartTimerRef.current.step2);
      autoStartTimerRef.current = null;
    }
    setAutoStartCountdown(0);
  };

  // 1. التمركز في منتصف الشاشة تلقائياً + التشغيل التلقائي بعد فاصل زمني ثانيتين
  useEffect(() => {
    // جعل الفيديو يصبح في منتصف الصفحة بسلاسة
    const scrollTimer = setTimeout(() => {
      if (whiteboardCanvasRef.current) {
        whiteboardCanvasRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 180);

    // تشغيل الفيديو التفاعلي تلقائياً بعد فاصل زمني ثانيتين للتهيئة
    setAutoStartCountdown(2);

    const step1 = setTimeout(() => {
      setAutoStartCountdown(1);
    }, 1000);

    const step2 = setTimeout(() => {
      setAutoStartCountdown(0);
      setIsPlaying(true);
      playSilmaOrFallback(`video-${stageId}-station-1`, getActiveProblemNarration(stageId, 0), 'start');
    }, 2000);

    autoStartTimerRef.current = { step1, step2 };

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(step1);
      clearTimeout(step2);
    };
  }, [stageId]);

  // Initialize HTML5 Audio player for pre-recorded Silma AI voice playback
  useEffect(() => {
    // إيقاف أي صوت خارجي متبقٍ فور تحميل مكون الفيديو
    if (onStopOutsideAudio) onStopOutsideAudio();
    stopSpeech();

    const audio = new Audio();
    videoAudioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!audio) return;
      const t = audio.currentTime;
      const activeTask = activeManifestTaskRef.current;
      if (activeTask && activeTask.sentences && activeTask.sentences.length > 0) {
        const matchIdx = activeTask.sentences.findIndex(
          s => t >= s.startTime && t <= (s.endTime + 0.35)
        );
        if (matchIdx !== -1) {
          setCurrentAudioSentenceIdx(matchIdx);
          const sent = activeTask.sentences[matchIdx];
          if (sent && sent.text) {
            setTeacherSubtitle(sent.text);
          }
        }
      }
    };

    const handleEnded = () => {
      setIsPlayingAudio(false);
      setCurrentAudioSentenceIdx(-1);

      // Smooth transition: When station explanation audio ends, naturally trigger its interactive checkpoint without awkward silence!
      const activeTask = activeManifestTaskRef.current;
      if (activeTask && activeTask.key) {
        let cpIdx = -1;
        if (activeTask.key.includes('station-1')) cpIdx = 0;
        else if (activeTask.key.includes('station-2')) cpIdx = 1;
        else if (activeTask.key.includes('station-3')) cpIdx = 2;

        if (cpIdx !== -1 && checkpoints[cpIdx]) {
          const cp = checkpoints[cpIdx];
          if (!completedCheckpointsRef.current.includes(cp.timestamp) && openCheckpointRef.current) {
            setTeacherSubtitle("والآن استعد للمحطة التفاعلية! أجب عن السؤال التالي لاختبار فهمك 🎯");
            setTimeout(() => {
              if (openCheckpointRef.current) {
                openCheckpointRef.current(cp);
              }
            }, 900);
          }
        }
      }
    };

    const handlePause = () => {
      setIsPlayingAudio(false);
    };

    const handlePlay = () => {
      setIsPlayingAudio(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      try {
        audio.pause();
        audio.src = '';
      } catch (e) {}
    };
  }, []);

  // Web Audio Tone Synthesizer
  const playAudioChime = (type = 'start') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'start') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'incorrect') {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'station') {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // AudioContext unavailable
    }
  };

  const getArabicVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith('ar') || v.lang.includes('Arab')) || voices[0] || null;
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  };

  const stopAllAudio = () => {
    if (onStopOutsideAudio) onStopOutsideAudio();
    stopSpeech();
    if (videoAudioRef.current) {
      try {
        videoAudioRef.current.pause();
      } catch (e) {}
    }
    setIsPlayingAudio(false);
  };

  // Speech narration helper with audio chime & subtitle sync (fallback)
  const speakNarration = (text, chimeType = 'start') => {
    setTeacherSubtitle(text);
    if (!isAudioEnabled) return;

    playAudioChime(chimeType);

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        setTimeout(() => {
          if (!isAudioEnabled) return;
          const phoneticText = convertMathToSpeech(text);
          const utterance = new SpeechSynthesisUtterance(phoneticText);
          utterance.lang = 'ar-SA';
          utterance.rate = playbackSpeed;
          utterance.pitch = 1.05;

          const voice = getArabicVoice();
          if (voice) utterance.voice = voice;

          window.speechSynthesis.speak(utterance);
          speechRef.current = utterance;
        }, 60);
      } catch (e) {
        // Fallback
      }
    }
  };

  // Play Silma AI Pre-recorded Audio or Fallback seamlessly
  const playSilmaOrFallback = (taskKey, fallbackText, chimeType = 'station') => {
    stopAllAudio();
    if (!isAudioEnabled) return;

    playAudioChime(chimeType);

    const manifestItem = audioManifest ? audioManifest[taskKey] : null;
    if (manifestItem && manifestItem.url) {
      activeManifestTaskRef.current = manifestItem;
      const audio = videoAudioRef.current;
      if (audio) {
        audio.src = manifestItem.url;
        audio.playbackRate = playbackSpeed;
        audio.currentTime = 0;
        setCurrentAudioSentenceIdx(0);
        if (manifestItem.sentences && manifestItem.sentences[0]) {
          setTeacherSubtitle(manifestItem.sentences[0].text);
        } else {
          setTeacherSubtitle(fallbackText);
        }
        audio.play().catch(() => {});
        setIsPlayingAudio(true);
        return;
      }
    }

    // Fallback: SpeechSynthesis
    activeManifestTaskRef.current = null;
    speakNarration(fallbackText, chimeType);
  };

  // Detailed Math Problem Narrations for Each Stage & Slide
  const getActiveProblemNarration = (sId, time) => {
    if (sId === 1) {
      if (time < 60) {
        return "جدول القيمة المكانية التفاعلي: في العدد 4.568، الرقم 4 يمثل أربعة آحاد، والرقم 5 يمثل خمسة أجزاء من عشرة (5/10)، والرقم 6 يمثل ستة أجزاء من مائة (6/100)، والرقم 8 يمثل ثمانية أجزاء من ألف (8/1000).";
      } else if (time < 120) {
        return "أثر الضرب والقسمة في قوى 10: عند ضرب 3.45 في 10 تزيد القيمة إلى 34.5 وتتحرك العلامة خانة لليمين. وعند قسمة 3.45 على 10 تقل القيمة إلى 0.345 وتتحرك العلامة خانة لليسار.";
      } else {
        return "عائلة الكسور الشهيرة: النصف 1/2 يكافئ 0.5، والربع 1/4 يكافئ 0.25، وثلاثة أرباع 3/4 تكافئ 0.75، والثمن 1/8 يكافئ 0.125.";
      }
    }

    if (sId === 2) {
      if (time < 60) {
        return "نموذج شبكة المائة لجمع الكسور العشرية: لحساب 0.35 + 0.42، نجمع 35 مربعاً مع 42 مربعاً، فيكون المجموع 77 مربعاً من أصل 100، أي 77/100 وتساوي عشرياً 0.77.";
      } else if (time < 120) {
        return "طرح الكسور العشرية بنموذج شبكة المائة: عند طرح 0.31 من 0.84، نحذف 31 مربعاً من أصل 84، فيتبقى 53 مربعاً أي 53/100 وتساوي 0.53. وتذكر دائماً محاذاة الفواصل وتجنيس الأصفار: 14.70 + 6.25 = 20.95.";
      } else {
        return "المسائل الحياتية واستراتيجيات التقدير: إذا كان معك 5.50 جنيهاً واشتريت كراسة بمبلغ 2.25 جنيهاً، فالمتبقي 3.25 جنيهاً. وبالتقدير لأقرب وحدة: 6 - 2 = 4 جنيهات تقريباً.";
      }
    }

    if (sId === 3) {
      if (time < 60) {
        return "الفرق بين المعادلة والتعبير الرياضي: المعادلة تحتوي على علامة يساوي مثل x + 5 = 12، بينما التعبير الرياضي لا يحتوي على علامة يساوي مثل 14 - 7.";
      } else if (time < 120) {
        return "شجرة العوامل الأولية: نحلل العدد 12 إلى 2 × 2 × 3، والعدد 18 إلى 2 × 3 × 3 باستخدام الأعداد الأولية فقط.";
      } else {
        return "إيجاد العامل والمضاعف: العامل المشترك الأكبر ع.م.أ هو 2 × 3 = 6، والمضاعف المشترك الأصغر م.م.أ هو 36.";
      }
    }

    if (sId === 4) {
      if (time < 60) {
        return "المحطة الأولى لضرب الأعداد الصحيحة: نموذج مساحة المستطيل لضرب 34 في 18. نجزئ 34 إلى 30 زائد 4، و18 إلى 10 زائد 8، ونحسب المساحات الأربع 300 و240 و40 و32، ويكون المجموع الكلي 612.";
      } else if (time < 120) {
        return "المحطة الثانية: الخوارزمية المعيارية للضرب وصفر العشرات الذهبي! في المسألة 45 في 23، نضرب رقم الآحاد 3 في 45 فيعطي 135، ثم نضع صفراً في خانة الآحاد لأننا نضرب 2 في خانة العشرات، ثم نضرب 20 في 45 ليعطي 900، ونجمع 135 زائد 900 ليكون الناتج 1035.";
      } else {
        return "المحطة الثالثة: خاصية التوزيع والمسائل الحياتية. 24 في 15 تساوي 24 في 10 زائد 24 في 5 وتساوي 360. وفي مسألة الأقلام: 12 في 25 تساوي 300 قلم.";
      }
    }

    if (sId === 5) {
      if (time < 60) {
        return "المحطة الأولى: دورة خطوات القسمة المطولة الأربع: أولاً اقسم 8 على 5 بواحد، ثانياً اضرب 1 في 5 بخمسة، ثالثاً اطرح 8 ناقص 5 بثلاثة، ورابعاً نزّل الرقم 4 وكرر الخطوات حتى تنتهي الأرقام ليكون الناتج 169.";
      } else if (time < 120) {
        return "المحطة الثانية: القسمة مع وجود باقٍ والعلاقة بالكسور: عند قسمة 29 على 4، الناتج 7 والباقي 1، ويكتب 7 وربع. ونتحقق بمعادلة التحقق الذهبية: المقسوم يساوي المقسوم عليه في خارج القسمة زائد الباقي.";
      } else {
        return "المحطة الثالثة: تقدير خارج القسمة بالأعداد المتناغمة: عند تقدير 3184 على 58، نقربها لأعداد يسهل قسمتها ذهنياً 3000 على 60 فتساوي 50 تقريباً.";
      }
    }

    // Stage 6: PEMDAS
    if (time < 60) {
      return "المحطة الأولى: ضرب وقسمة الكسور العشرية مع قوى 10. حاصل ضرب 0.4 في 0.2 يساوي في صورة كسور اعتيادية 4 على 10 في 2 على 10 ويساوي 8 على 100 أي 0.08. وفي القسمة نتخلص من الفاصلة في المقسوم عليه بضربه في 10.";
    } else if (time < 120) {
      return "المحطة الثانية: هرم ترتيب العمليات الحسابية: الأقواس دائماً أولاً في القمة، يليها الضرب والقسمة من اليسار إلى اليمين، وأخيراً الجمع والطرح من اليسار إلى اليمين.";
    } else {
      return "المحطة الثالثة: مسألة نموذجية شاملة بالأقواس: 24 ناقص 4 في القوس 3 زائد 2. نفك القوس أولاً 5، ثم نضرب 4 في 5 بعشرين، وأخيراً 24 ناقص 20 يساوي 4.";
    }
  };

  // Video playback timer
  useEffect(() => {
    let interval = null;
    if (isPlaying && !activeCheckpoint) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          
          // Check if reaching or past a checkpoint timestamp that hasn't been completed yet
          const pendingCheckpoint = checkpoints.find(
            cp => next >= cp.timestamp && !completedCheckpoints.includes(cp.timestamp)
          );

          if (pendingCheckpoint) {
            // Check if voice narration is still actively speaking
            const isSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;

            // Wait until the teacher has fully completed the explanation before showing the question!
            if (!isSpeaking) {
              setIsPlaying(false);
              openStationCheckpoint(pendingCheckpoint);
              return next;
            }
          }

          if (next >= totalDuration) {
            setIsPlaying(false);
            stopAllAudio();
            playAudioChime('correct');
            setTeacherSubtitle("تهانينا يا بطل! أتممت بنجاح مشاهدة محطات الشرح التفاعلي لهذا المفهوم. 🏆");
            return 0;
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeCheckpoint, completedCheckpoints, checkpoints, playbackSpeed]);

  const togglePlay = () => {
    cancelAutoStart();
    // إيقاف أي صوت خارجي متبقٍ فور الضغط على زر تشغيل الفيديو
    if (onStopOutsideAudio) onStopOutsideAudio();
    setIsPlaying(prev => {
      const nextState = !prev;
      if (nextState) {
        // Resume seamlessly from current audio time if already loaded and paused
        const audio = videoAudioRef.current;
        if (audio && audio.src && !audio.ended && audio.currentTime > 0) {
          audio.playbackRate = playbackSpeed;
          audio.play().catch(() => {});
          setIsPlayingAudio(true);
        } else {
          const stationIdx = currentTime < 60 ? 1 : currentTime < 120 ? 2 : 3;
          playSilmaOrFallback(`video-${stageId}-station-${stationIdx}`, getActiveProblemNarration(stageId, currentTime), 'start');
        }
      } else {
        if (videoAudioRef.current && !videoAudioRef.current.paused) {
          videoAudioRef.current.pause();
        }
        stopSpeech();
        setIsPlayingAudio(false);
      }
      return nextState;
    });
  };

  const handleSeek = (time) => {
    cancelAutoStart();
    stopAllAudio();
    setCurrentTime(time);
    const hitCp = checkpoints.find(cp => Math.abs(cp.timestamp - time) <= 3);
    if (hitCp) {
      openStationCheckpoint(hitCp);
    } else {
      setActiveCheckpoint(null);
      // تشغيل الصوت فقط إذا كان الفيديو في وضع التشغيل؛ لا يتم تشغيل صوت تلقائي إذا كان الفيديو متوقفاً
      if (isPlaying) {
        const stationIdx = time < 60 ? 1 : time < 120 ? 2 : 3;
        setTimeout(() => {
          playSilmaOrFallback(`video-${stageId}-station-${stationIdx}`, getActiveProblemNarration(stageId, time), 'station');
        }, 100);
      }
    }
  };

  // Jump smoothly to the station segment (0s, 60s, or 120s) without freezing
  const jumpToStation = (stationIdx) => {
    cancelAutoStart();
    stopAllAudio();
    const stationStartTimes = [0, 60, 120];
    const targetTime = stationStartTimes[stationIdx] ?? 0;
    setCurrentTime(targetTime);
    setActiveCheckpoint(null);
    setIsPlaying(true);
    setTimeout(() => {
      playSilmaOrFallback(`video-${stageId}-station-${stationIdx + 1}`, getActiveProblemNarration(stageId, targetTime + 2), 'station');
    }, 100);
  };

  const openStationCheckpoint = (cp) => {
    cancelAutoStart();
    stopAllAudio();
    setIsPlaying(false);
    setActiveCheckpoint(cp);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    
    // Find checkpoint index (0, 1, or 2)
    const cpIdx = checkpoints.findIndex(c => c.timestamp === cp.timestamp);
    const taskKey = `video-${stageId}-cp-${cpIdx !== -1 ? cpIdx + 1 : 1}`;
    const optionsText = cp.options.map((opt, i) => `الخيار ${i + 1}: ${opt}`).join("، ");
    const fallbackText = `محطة توقف تفاعلية: ${cp.question}. ${optionsText}`;

    playSilmaOrFallback(taskKey, fallbackText, 'station');
  };
  openCheckpointRef.current = openStationCheckpoint;

  const handleOptionSelect = (index) => {
    if (!isAnswerSubmitted) {
      // إيقاف صوت قراءة السؤال فور قيام الطالب باختيار إجابة
      stopAllAudio();
      setSelectedOption(index);
    }
  };

  const handleSubmitAnswer = () => {
    // التأكد من إيقاف أي صوت سابق فور تأكيد الإجابة
    stopAllAudio();
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === activeCheckpoint.correctIndex;

    if (isCorrect) {
      setUserScore(prev => prev + 25);
      setCheckpointStatus(prev => ({ ...prev, [activeCheckpoint.timestamp]: 'correct' }));
      playAudioChime('correct');
      const feedback = "أحسنت يا بطل! إجابة رياضية صحيحة ومتميزة. 🏆";
      setTeacherSubtitle(feedback);
    } else {
      setCheckpointStatus(prev => ({ ...prev, [activeCheckpoint.timestamp]: 'wrong' }));
      playAudioChime('incorrect');
      const feedback = "إجابة غير دقيقة! انتبه للتوضيح الرياضي الشامل للمحطة. 💡";
      setTeacherSubtitle(feedback);
    }
  };

  // Close question modal or continue, immediately muting question voice and transitioning to next station with voice narration
  const handleCloseOrContinueCheckpoint = () => {
    if (!activeCheckpoint) return;

    // 1. Instantly stop all audio
    stopAllAudio();

    // If closed or skipped without submitting answer, mark as skipped
    if (!isAnswerSubmitted) {
      setCheckpointStatus(prev => ({
        ...prev,
        [activeCheckpoint.timestamp]: prev[activeCheckpoint.timestamp] || 'skipped'
      }));
    }

    // 2. Mark this checkpoint as completed
    if (!completedCheckpoints.includes(activeCheckpoint.timestamp)) {
      setCompletedCheckpoints(prev => [...prev, activeCheckpoint.timestamp]);
    }

    // 3. Move to the next station start time (Station 1 -> Station 2 at 60s, Station 2 -> Station 3 at 120s, Station 3 -> 175s)
    let nextStationTime = 60;
    let nextStationIdx = 2;
    if (currentTime < 60) {
      nextStationTime = 60; // Next: Station 2
      nextStationIdx = 2;
    } else if (currentTime < 120) {
      nextStationTime = 120; // Next: Station 3
      nextStationIdx = 3;
    } else {
      nextStationTime = 175; // Conclusion
      nextStationIdx = 3;
    }

    // 4. Update playback and time
    setActiveCheckpoint(null);
    setCurrentTime(nextStationTime);
    setIsPlaying(true);

    // 5. Play Silma audio for the next station smoothly
    setTimeout(() => {
      playSilmaOrFallback(`video-${stageId}-station-${nextStationIdx}`, getActiveProblemNarration(stageId, nextStationTime + 1), 'station');
    }, 120);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getActiveStationName = (time) => {
    if (time < 60) return "المحطة الأولى: الاستكشاف والنمذجة البصرية 🔍";
    if (time < 120) return "المحطة الثانية: تطبيقات القواعد والكسور 📐";
    return "المحطة الثالثة: الاستنتاج والتحدي الرياضي 🏆";
  };

  // Render Whiteboard Animation graphics dynamically for ALL stages and ALL stations
  const renderWhiteboardGraphic = () => {
    // Stage 1 visuals: Decimals & Fractions
    if (stageId === 1) {
      return (
        <div className="space-y-4 max-w-xl mx-auto w-full animate-fadeIn" dir="rtl">
          {currentTime < 60 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-cyan-400/50 shadow-[0_0_20px_rgba(57,169,208,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-cyan-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#39A9D0]">
                  جدول القيمة المكانية التفاعلي ومطابقة الكسور:
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-1`, getActiveProblemNarration(stageId, currentTime))}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-[#39A9D0] border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للمسألة 🎧
                </button>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 text-center text-xs font-math" dir="ltr">
                <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('آحاد')
                    ? 'bg-cyan-100 dark:bg-cyan-500/30 border-2 border-cyan-500 shadow-glow-primary scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-white/5'
                }`}>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">آحاد (Ones)</span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">4</span>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('عشرة') || teacherSubtitle.includes('5/10')
                    ? 'bg-cyan-200 dark:bg-cyan-500/40 border-2 border-cyan-400 shadow-glow-primary scale-105'
                    : 'bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40'
                }`}>
                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 block mb-1">جزء من 10</span>
                  <span className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400">.5</span>
                  <div className="mt-1">
                    <Fraction num={5} den={10} size="xs" />
                  </div>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('مائة') || teacherSubtitle.includes('6/100')
                    ? 'bg-amber-200 dark:bg-amber-500/40 border-2 border-[#E5A91B] shadow-glow-gold scale-105'
                    : 'bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40'
                }`}>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 block mb-1">جزء من 100</span>
                  <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">.06</span>
                  <div className="mt-1">
                    <Fraction num={6} den={100} size="xs" />
                  </div>
                </div>
                <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('ألف') || teacherSubtitle.includes('8/1000')
                    ? 'bg-emerald-200 dark:bg-emerald-500/40 border-2 border-emerald-500 shadow-lg scale-105'
                    : 'bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40'
                }`}>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block mb-1">جزء من 1000</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">.008</span>
                  <div className="mt-1">
                    <Fraction num={8} den={1000} size="xs" />
                  </div>
                </div>
              </div>
              <div className={`text-center font-math font-bold text-xs sm:text-sm py-1.5 px-2 rounded-xl transition-all duration-300 ${
                teacherSubtitle.includes('يساوي')
                  ? 'bg-[#39A9D0]/20 text-[#39A9D0] border border-[#39A9D0]/40 shadow-sm scale-102'
                  : 'text-cyan-800 dark:text-cyan-300'
              }`} dir="ltr">
                4.568 = 4 + <Fraction num={5} den={10} size="xs" /> + <Fraction num={6} den={100} size="xs" /> + <Fraction num={8} den={1000} size="xs" />
              </div>
            </div>
          )}

          {currentTime >= 60 && currentTime < 120 && (
            <div className="bg-white dark:bg-slate-900/95 p-4 sm:p-5 rounded-2xl border border-amber-400/30 dark:border-amber-500/30 shadow-lg space-y-3">
              <span className="text-xs font-black text-[#E5A91B] block text-right">
                قاعدة حركة العلامة عند الضرب والقسمة في 10 و 100:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center text-xs font-math" dir="ltr">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('الضرب') || teacherSubtitle.includes('تزداد')
                    ? 'bg-emerald-100 dark:bg-emerald-500/25 border-2 border-emerald-400 shadow-lg scale-102'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30'
                }`}>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold block mb-1">الضرب × 10</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    3.45 × 10 = 34.5
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1" dir="rtl">
                    تتحرك العلامة خانة لليمين وتزداد القيمة
                  </span>
                </div>
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('قسمة') || teacherSubtitle.includes('تقل')
                    ? 'bg-rose-100 dark:bg-red-500/25 border-2 border-rose-400 shadow-lg scale-102'
                    : 'bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30'
                }`}>
                  <span className="text-rose-700 dark:text-red-400 font-bold block mb-1">القسمة ÷ 10</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    3.45 ÷ 10 = 0.345
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-1" dir="rtl">
                    تتحرك العلامة خانة لليسار وتقل القيمة
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentTime >= 120 && (
            <div className="bg-white dark:bg-slate-900/95 p-4 sm:p-5 rounded-2xl border border-emerald-400/30 dark:border-emerald-500/30 shadow-lg space-y-3 text-center">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block text-right">
                عائلة الكسور المشهورة بين الصورة العشرية والاعتيادية:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm font-math font-bold" dir="ltr">
                <div className={`flex items-center gap-1.5 p-2 px-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('النصف')
                    ? 'bg-cyan-100 dark:bg-cyan-500/30 border-2 border-cyan-400 shadow-glow-primary scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5'
                }`}>
                  <Fraction num={1} den={2} size="sm" /> = <span className="text-[#39A9D0]">0.5</span>
                </div>
                <div className={`flex items-center gap-1.5 p-2 px-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('الربع')
                    ? 'bg-amber-100 dark:bg-amber-500/30 border-2 border-[#E5A91B] shadow-glow-gold scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5'
                }`}>
                  <Fraction num={1} den={4} size="sm" /> = <span className="text-[#39A9D0]">0.25</span>
                </div>
                <div className={`flex items-center gap-1.5 p-2 px-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('ثلاثة أرباع')
                    ? 'bg-emerald-100 dark:bg-emerald-500/30 border-2 border-emerald-400 shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5'
                }`}>
                  <Fraction num={3} den={4} size="sm" /> = <span className="text-[#39A9D0]">0.75</span>
                </div>
                <div className={`flex items-center gap-1.5 p-2 px-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('الثمن')
                    ? 'bg-purple-100 dark:bg-purple-500/30 border-2 border-purple-400 shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5'
                }`}>
                  <Fraction num={1} den={8} size="sm" /> = <span className="text-[#39A9D0]">0.125</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Stage 2: Decimal Grid, Subtraction & Word Problems (Distinct slides for all 3 stations!)
    if (stageId === 2) {
      return (
        <div className="space-y-4 max-w-xl mx-auto w-full animate-fadeIn text-center" dir="rtl">
          {/* Station 1: Addition on 100-Grid */}
          {currentTime < 60 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-cyan-400/50 shadow-[0_0_20px_rgba(57,169,208,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-cyan-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#39A9D0] block">
                  نموذج شبكة المائة لجمع الكسور العشرية (المحطة 1):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-1`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-[#39A9D0] border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للمسألة 🎧
                </button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm font-math font-bold py-1" dir="ltr">
                <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('خمسة وثلاثين') || teacherSubtitle.includes('35')
                    ? 'bg-cyan-200 dark:bg-cyan-500/40 border-2 border-cyan-400 shadow-glow-primary scale-105'
                    : 'bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300'
                }`}>
                  0.35 = <Fraction num={35} den={100} size="sm" />
                </div>
                <span className="text-lg text-amber-600 dark:text-[#E5A91B] font-black">+</span>
                <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('اثنين وأربعين') || teacherSubtitle.includes('42')
                    ? 'bg-emerald-200 dark:bg-emerald-500/40 border-2 border-emerald-400 shadow-lg scale-105'
                    : 'bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                }`}>
                  0.42 = <Fraction num={42} den={100} size="sm" />
                </div>
                <span className="text-lg text-slate-900 dark:text-white font-black">=</span>
                <div className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('سبعة وسبعين') || teacherSubtitle.includes('77')
                    ? 'bg-amber-200 dark:bg-amber-500/40 border-2 border-[#E5A91B] shadow-glow-gold scale-105'
                    : 'bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
                }`}>
                  0.77 = <Fraction num={77} den={100} size="sm" />
                </div>
              </div>
              <p className={`text-[11px] transition-colors duration-300 ${
                teacherSubtitle.includes('مربع') ? 'text-[#39A9D0] font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}>
                35 مربعاً ملوناً + 42 مربعاً ملوناً = 77 مربعاً من أصل 100 مربع (77/100)
              </p>
            </div>
          )}

          {/* Station 2: Subtraction on 100-Grid & Decimal Alignment */}
          {currentTime >= 60 && currentTime < 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-400/50 shadow-[0_0_20px_rgba(229,169,27,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-amber-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 dark:text-[#E5A91B] block">
                  نموذج الطرح ومحاذاة الفواصل العشرية (المحطة 2):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-2`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#E5A91B] border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للمسألة 🎧
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                <div className={`p-3 rounded-xl transition-all duration-300 text-center font-math ${
                  teacherSubtitle.includes('طرح') || teacherSubtitle.includes('نحذف') || teacherSubtitle.includes('ثلاثة وخمسون')
                    ? 'bg-rose-100 dark:bg-[#B51F3A]/25 border-2 border-[#B51F3A] shadow-lg scale-102'
                    : 'bg-rose-50 dark:bg-[#B51F3A]/10 border border-rose-300 dark:border-[#B51F3A]/30'
                }`}>
                  <span className="text-[10px] text-rose-700 dark:text-red-400 font-bold block mb-1">طرح شبكة المائة</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    0.84 - 0.31 = 0.53
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-1" dir="rtl">
                    نحذف 31 مربعاً من أصل 84 متبقي 53
                  </span>
                </div>
                <div className={`p-3 rounded-xl transition-all duration-300 text-center font-math ${
                  teacherSubtitle.includes('محاذاة') || teacherSubtitle.includes('تجنيس') || teacherSubtitle.includes('سبعين') || teacherSubtitle.includes('20.95')
                    ? 'bg-cyan-100 dark:bg-cyan-500/25 border-2 border-cyan-400 shadow-glow-primary scale-102'
                    : 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30'
                }`}>
                  <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold block mb-1">تجنيس الأصفار رأسياً</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    14.70 + 6.25 = 20.95
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-1" dir="rtl">
                    وضع صفر لحفظ خانة الجزء من مائة
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Station 3: Real-World Word Problem & Estimation */}
          {currentTime >= 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-emerald-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                  المسائل الحياتية واستراتيجيات التقدير (المحطة 3):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-3`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للمسألة 🎧
                </button>
              </div>

              <div className={`p-3.5 rounded-xl border text-right space-y-1.5 transition-all duration-300 ${
                teacherSubtitle.includes('خمسة جنيهات') || teacherSubtitle.includes('المتبقي') || teacherSubtitle.includes('كراسة')
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-400 shadow-lg scale-102'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10'
              }`}>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  إذا كان معك 5.50 جنيهاً واشتريت كراسة بمبلغ 2.25 جنيهاً:
                </p>
                <div className="flex items-center justify-between text-xs font-math" dir="ltr">
                  <span className={`font-bold text-sm transition-all duration-300 ${
                    teacherSubtitle.includes('المتبقي') || teacherSubtitle.includes('ثلاثة جنيهات')
                      ? 'text-emerald-600 dark:text-emerald-400 font-black scale-105'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    5.50 - 2.25 = 3.25 جنيهاً
                  </span>
                  <span className={`text-[11px] transition-all duration-300 ${
                    teacherSubtitle.includes('التقدير') || teacherSubtitle.includes('تقريباً')
                      ? 'text-[#E5A91B] font-black'
                      : 'text-slate-500 dark:text-slate-400'
                  }`} dir="rtl">
                    التقدير: 6 - 2 = 4 جنيهات تقريباً
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Stage 3: GCF & LCM / Factor Tree
    if (stageId === 3) {
      return (
        <div className="space-y-4 max-w-xl mx-auto w-full animate-fadeIn text-center" dir="rtl">
          {currentTime < 60 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-cyan-400/50 shadow-[0_0_20px_rgba(57,169,208,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-cyan-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#39A9D0] block">
                  التعبيرات الرياضية والمعادلات والمتغيرات (المحطة 1):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-1`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-[#39A9D0] border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-xs font-math" dir="ltr">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('معادلة') || teacherSubtitle.includes('يساوي') || teacherSubtitle.includes('التوازن') || teacherSubtitle.includes('x + 5')
                    ? 'bg-cyan-100 dark:bg-cyan-500/30 border-2 border-cyan-500 shadow-glow-primary scale-105'
                    : 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30'
                }`}>
                  <span className="text-cyan-700 dark:text-cyan-400 font-bold block mb-1">معادلة (Equation)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">x + 5 = 12</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-1" dir="rtl">تحتوي علامة يساوي (=)</span>
                </div>
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('تعبير') || teacherSubtitle.includes('لا يحتوي') || teacherSubtitle.includes('14 - 7')
                    ? 'bg-amber-100 dark:bg-amber-500/30 border-2 border-[#E5A91B] shadow-glow-gold scale-105'
                    : 'bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30'
                }`}>
                  <span className="text-amber-700 dark:text-amber-400 font-bold block mb-1">تعبير رياضي (Expression)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">14 - 7</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-1" dir="rtl">لا يحتوي علامة يساوي</span>
                </div>
              </div>
            </div>
          )}

          {currentTime >= 60 && currentTime < 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-400/50 shadow-[0_0_20px_rgba(229,169,27,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-amber-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 dark:text-[#E5A91B] block">
                  شجرة العوامل الأولية للعددين 12 و 18 (المحطة 2):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-2`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#E5A91B] border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-xs font-math" dir="ltr">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('اثني عشر') || teacherSubtitle.includes('12')
                    ? 'bg-cyan-100 dark:bg-cyan-500/30 border-2 border-cyan-400 shadow-glow-primary scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5'
                }`}>
                  <span className="text-slate-700 dark:text-slate-300 font-bold block mb-1">العدد 12</span>
                  <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">12 = 2 × 2 × 3</span>
                </div>
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('ثمانية عشر') || teacherSubtitle.includes('18')
                    ? 'bg-amber-100 dark:bg-amber-500/30 border-2 border-[#E5A91B] shadow-glow-gold scale-105'
                    : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5'
                }`}>
                  <span className="text-slate-700 dark:text-slate-300 font-bold block mb-1">العدد 18</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">18 = 2 × 3 × 3</span>
                </div>
              </div>
            </div>
          )}

          {currentTime >= 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-emerald-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                  استخراج العامل المشترك الأكبر ع.م.أ والمضاعف م.م.أ (المحطة 3):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-3`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-xs font-math" dir="ltr">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('ع.م.أ') || teacherSubtitle.includes('العامل المشترك الأكبر') || teacherSubtitle.includes('ستة')
                    ? 'bg-emerald-100 dark:bg-emerald-500/30 border-2 border-emerald-400 shadow-lg scale-105'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30'
                }`}>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold block mb-1">ع.م.أ (GCF)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">2 × 3 = 6</span>
                </div>
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('م.م.أ') || teacherSubtitle.includes('المضاعف المشترك الأصغر') || teacherSubtitle.includes('ستة وثلاثون')
                    ? 'bg-cyan-100 dark:bg-cyan-500/30 border-2 border-cyan-400 shadow-glow-primary scale-105'
                    : 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30'
                }`}>
                  <span className="text-cyan-700 dark:text-cyan-400 font-bold block mb-1">م.م.أ (LCM)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">2 × 2 × 3 × 3 = 36</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Stage 4: Whole Numbers Multiplication (Area Model, Standard Algorithm, Distributive)
    if (stageId === 4) {
      return (
        <div className="space-y-4 max-w-xl mx-auto w-full animate-fadeIn text-center" dir="rtl">
          {/* Station 1: Area Model for 34 × 18 */}
          {currentTime < 60 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-cyan-400/50 shadow-[0_0_20px_rgba(57,169,208,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-cyan-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#39A9D0] block">
                  نموذج مساحة المستطيل لضرب 34 × 18 (المحطة 1):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-1`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-[#39A9D0] border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              {/* Grid graphic */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 font-math text-xs space-y-2" dir="ltr">
                <div className="flex justify-between text-cyan-300 font-bold px-8">
                  <span className={`transition-all duration-300 ${teacherSubtitle.includes('ثلاثين') || teacherSubtitle.includes('30') ? 'text-cyan-300 scale-110 font-black' : 'text-slate-400'}`}>30</span>
                  <span className={`transition-all duration-300 ${teacherSubtitle.includes('أربعة') || teacherSubtitle.includes('4') ? 'text-amber-300 scale-110 font-black' : 'text-slate-400'}`}>4</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    teacherSubtitle.includes('ثلاثين') || teacherSubtitle.includes('300') || teacherSubtitle.includes('ثلاثمائة')
                      ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-glow-primary scale-105'
                      : 'bg-cyan-900/30 border border-cyan-500/40'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">10 × 30</span>
                    <span className="text-base font-black text-cyan-300">300</span>
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    teacherSubtitle.includes('أربعين') || teacherSubtitle.includes('40')
                      ? 'bg-amber-500/30 border-2 border-[#E5A91B] shadow-glow-gold scale-105'
                      : 'bg-amber-900/30 border border-amber-500/40'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">10 × 4</span>
                    <span className="text-base font-black text-amber-300">40</span>
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    teacherSubtitle.includes('مائتين وأربعين') || teacherSubtitle.includes('240')
                      ? 'bg-blue-500/30 border-2 border-blue-400 shadow-lg scale-105'
                      : 'bg-blue-900/30 border border-blue-500/40'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">8 × 30</span>
                    <span className="text-base font-black text-blue-300">240</span>
                  </div>
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    teacherSubtitle.includes('اثنين وثلاثين') || teacherSubtitle.includes('32')
                      ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-lg scale-105'
                      : 'bg-emerald-900/30 border border-emerald-500/40'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">8 × 4</span>
                    <span className="text-base font-black text-emerald-300">32</span>
                  </div>
                </div>
              </div>

              <div className={`text-xs font-math font-bold p-1.5 rounded-xl transition-all duration-300 ${
                teacherSubtitle.includes('ستمائة') || teacherSubtitle.includes('612') || teacherSubtitle.includes('المجموع')
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-md scale-105'
                  : 'text-slate-700 dark:text-slate-200'
              }`} dir="ltr">
                300 + 240 + 40 + 32 = <span className="text-emerald-500 text-sm font-black">612</span>
              </div>
            </div>
          )}

          {/* Station 2: Standard Algorithm for 45 × 23 */}
          {currentTime >= 60 && currentTime < 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-400/50 shadow-[0_0_20px_rgba(229,169,27,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-amber-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#E5A91B] block">
                  الخوارزمية المعيارية للضرب الرأسي 45 × 23 (المحطة 2):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-2`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#E5A91B] border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Math Column Display */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 font-math text-right pr-6 pl-4 py-3 space-y-1 text-sm shadow-inner" dir="ltr">
                  <div className="text-slate-300 font-bold">45</div>
                  <div className="text-amber-300 font-bold border-b border-white/30 pb-1">× 23</div>
                  <div className={`transition-all duration-300 ${
                    teacherSubtitle.includes('الآحاد') || teacherSubtitle.includes('مائة وخمسة وثلاثين') || teacherSubtitle.includes('135')
                      ? 'text-emerald-300 font-black scale-105 bg-emerald-500/20 px-1 rounded'
                      : 'text-emerald-400 font-bold'
                  }`}>
                    135 <span className="text-[10px] text-slate-400 font-sans">(3 × 45)</span>
                  </div>
                  <div className={`transition-all duration-300 flex items-center justify-end gap-1 ${
                    teacherSubtitle.includes('العشرات') || teacherSubtitle.includes('تسعمائة') || teacherSubtitle.includes('900')
                      ? 'text-cyan-300 font-black scale-105 bg-cyan-500/20 px-1 rounded'
                      : 'text-cyan-400 font-bold'
                  }`}>
                    <span>90</span>
                    <span className={`px-1 rounded font-black transition-all duration-300 ${
                      teacherSubtitle.includes('صفر') || teacherSubtitle.includes('العشرات')
                        ? 'scale-110 bg-amber-500/30 border-2 border-amber-400 shadow-glow-gold text-amber-200'
                        : 'bg-amber-500/20 border border-amber-400 text-amber-300'
                    }`}>0</span>
                    <span className="text-[10px] text-slate-400 font-sans">(20 × 45)</span>
                  </div>
                  <div className="border-b-2 border-white/40 pt-0.5"></div>
                  <div className={`transition-all duration-300 ${
                    teacherSubtitle.includes('ألفاً وخمسة وثلاثين') || teacherSubtitle.includes('1035') || teacherSubtitle.includes('الجمع')
                      ? 'text-lg text-emerald-300 font-black scale-105 bg-emerald-500/25 px-2 rounded-xl border border-emerald-400 shadow-md'
                      : 'text-base text-emerald-300 font-black pt-1'
                  }`}>1035</div>
                </div>

                {/* Explanatory rules */}
                <div className="text-right text-xs space-y-1.5 text-slate-600 dark:text-slate-300" dir="rtl">
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    teacherSubtitle.includes('الآحاد') || teacherSubtitle.includes('135')
                      ? 'bg-emerald-100 dark:bg-emerald-500/25 border-2 border-emerald-400 shadow-lg scale-102'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30'
                  }`}>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">1. ضرب الآحاد:</span>
                    3 × 45 = 135
                  </div>
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    teacherSubtitle.includes('صفر') || teacherSubtitle.includes('العشرات')
                      ? 'bg-amber-100 dark:bg-amber-500/25 border-2 border-[#E5A91B] shadow-glow-gold scale-102'
                      : 'bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30'
                  }`}>
                    <span className="font-bold text-amber-700 dark:text-amber-400 block">2. صفر العشرات الذهبي:</span>
                    نضع 0 في خانة الآحاد لأننا نضرب 20
                  </div>
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    teacherSubtitle.includes('الجمع') || teacherSubtitle.includes('1035')
                      ? 'bg-cyan-100 dark:bg-cyan-500/25 border-2 border-cyan-400 shadow-glow-primary scale-102'
                      : 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30'
                  }`}>
                    <span className="font-bold text-cyan-700 dark:text-cyan-400 block">3. الجمع النهائي:</span>
                    135 + 900 = 1035
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Station 3: Distributive Property & Word Problems */}
          {currentTime >= 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-emerald-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                  خاصية التوزيع والمسائل الحياتية (المحطة 3):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-3`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right" dir="rtl">
                <div className={`p-3 rounded-xl border space-y-1 transition-all duration-300 ${
                  teacherSubtitle.includes('التوزيع') || teacherSubtitle.includes('360') || teacherSubtitle.includes('24')
                    ? 'bg-cyan-50 dark:bg-cyan-500/15 border-2 border-cyan-400 shadow-glow-primary scale-102'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10'
                }`}>
                  <span className="text-[11px] font-bold text-[#39A9D0] block">خاصية التوزيع:</span>
                  <div className="font-math text-xs text-slate-800 dark:text-slate-200 font-bold" dir="ltr">
                    24 × 15 = 24 × (10 + 5)
                    <br />
                    = 240 + 120 = 360
                  </div>
                </div>

                <div className={`p-3 rounded-xl border space-y-1 transition-all duration-300 ${
                  teacherSubtitle.includes('مسألة') || teacherSubtitle.includes('علبة') || teacherSubtitle.includes('الأقلام') || teacherSubtitle.includes('300')
                    ? 'bg-amber-50 dark:bg-amber-500/15 border-2 border-[#E5A91B] shadow-glow-gold scale-102'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10'
                }`}>
                  <span className="text-[11px] font-bold text-[#E5A91B] block">مسألة حياتية (كتاب الوزارة):</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    12 صندوقاً، كل صندوق به 25 قلماً:
                  </p>
                  <div className="font-math text-xs text-emerald-600 dark:text-emerald-400 font-bold" dir="ltr">
                    12 × 25 = 300 قلم
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Stage 5: Long Division & Standard Algorithm
    if (stageId === 5) {
      return (
        <div className="space-y-4 max-w-xl mx-auto w-full animate-fadeIn text-center" dir="rtl">
          {/* Station 1: The 4-Step Cycle */}
          {currentTime < 60 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-cyan-400/50 shadow-[0_0_20px_rgba(57,169,208,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-cyan-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#39A9D0] block">
                  دورة خوارزمية القسمة المطولة الأربع: 845 ÷ 5 = 169 (المحطة 1):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-1`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-[#39A9D0] border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-math" dir="rtl">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('اقسم') || teacherSubtitle.includes('8 ÷ 5')
                    ? 'bg-cyan-200 dark:bg-cyan-500/40 border-2 border-cyan-500 shadow-glow-primary scale-105'
                    : 'bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40'
                }`}>
                  <span className="text-[10px] text-cyan-800 dark:text-cyan-300 block font-bold">1. اقسم (÷)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">8 ÷ 5 = 1</span>
                </div>
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('اضرب') || teacherSubtitle.includes('1 × 5')
                    ? 'bg-amber-200 dark:bg-amber-500/40 border-2 border-[#E5A91B] shadow-glow-gold scale-105'
                    : 'bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40'
                }`}>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-bold">2. اضرب (×)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">1 × 5 = 5</span>
                </div>
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('اطرح') || teacherSubtitle.includes('8 - 5')
                    ? 'bg-red-200 dark:bg-red-500/40 border-2 border-rose-500 shadow-lg scale-105'
                    : 'bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/40'
                }`}>
                  <span className="text-[10px] text-rose-800 dark:text-red-300 block font-bold">3. اطرح (-)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">8 - 5 = 3</span>
                </div>
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('نزّل') || teacherSubtitle.includes('أنزل') || teacherSubtitle.includes('34')
                    ? 'bg-emerald-200 dark:bg-emerald-500/40 border-2 border-emerald-500 shadow-lg scale-105'
                    : 'bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40'
                }`}>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-bold">4. أنزل (↓)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">نزّل 4 → 34</span>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl bg-slate-950 font-math font-black text-sm text-center transition-all duration-300 ${
                teacherSubtitle.includes('مائة وتسعة وستين') || teacherSubtitle.includes('169') || teacherSubtitle.includes('الناتج')
                  ? 'text-emerald-300 border-2 border-emerald-400 shadow-glow-primary scale-105'
                  : 'text-emerald-400 border border-white/10'
              }`} dir="ltr">
                845 ÷ 5 = 169 (بدون باقٍ)
              </div>
            </div>
          )}

          {/* Station 2: Remainder and Verification */}
          {currentTime >= 60 && currentTime < 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-400/50 shadow-[0_0_20px_rgba(229,169,27,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-amber-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#E5A91B] block">
                  القسمة مع وجود باقٍ ومعادلة التحقق الذهبية (المحطة 2):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-2`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#E5A91B] border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                <div className={`p-3 rounded-xl text-center font-math transition-all duration-300 ${
                  teacherSubtitle.includes('باق') || teacherSubtitle.includes('الباقي') || teacherSubtitle.includes('سبعة وربع') || teacherSubtitle.includes('7.25')
                    ? 'bg-amber-100 dark:bg-amber-500/25 border-2 border-[#E5A91B] shadow-glow-gold scale-102'
                    : 'bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30'
                }`}>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mb-1">القسمة مع الباقي</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    29 ÷ 4 = 7 والباقي 1
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs">
                    <span>يكتب كعدد كسري: 7</span>
                    <Fraction num={1} den={4} size="xs" />
                    <span>= 7.25</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl text-center font-math transition-all duration-300 ${
                  teacherSubtitle.includes('التحقق') || teacherSubtitle.includes('الذهبية') || teacherSubtitle.includes('المقسوم')
                    ? 'bg-emerald-100 dark:bg-emerald-500/25 border-2 border-emerald-400 shadow-lg scale-102'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30'
                }`}>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mb-1">معادلة التحقق الذهبية</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    (4 × 7) + 1 = 28 + 1 = 29
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1" dir="rtl">
                    المقسوم = (المقسوم عليه × الناتج) + الباقي
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Station 3: Compatible Numbers */}
          {currentTime >= 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-emerald-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                  تقدير خارج القسمة بالأعداد المتناغمة (المحطة 3):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-3`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className={`p-3 rounded-xl border text-right space-y-1.5 transition-all duration-300 ${
                teacherSubtitle.includes('متناغم') || teacherSubtitle.includes('3000') || teacherSubtitle.includes('ستين') || teacherSubtitle.includes('خمسين')
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-400 shadow-lg scale-102'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10'
              }`} dir="rtl">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  تقدير ناتج: 3,184 ÷ 58
                </p>
                <div className="flex items-center justify-between text-xs font-math" dir="ltr">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    3,000 ÷ 60 = 50 (تقريباً)
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]" dir="rtl">
                    اخترنا 3000 و 60 لأنهما عددان متناغمان يسهل قسمتهما ذهنياً
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Stage 6: Decimals Operations & PEMDAS
    if (stageId === 6) {
      return (
        <div className="space-y-4 max-w-xl mx-auto w-full animate-fadeIn text-center" dir="rtl">
          {/* Station 1: Decimals Multiplication & Division */}
          {currentTime < 60 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-cyan-400/50 shadow-[0_0_20px_rgba(57,169,208,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-cyan-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#39A9D0] block">
                  ضرب وقسمة الكسور العشرية وعلاقتها بالكسور (المحطة 1):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-1`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-[#39A9D0] border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                <div className={`p-3 rounded-xl text-center font-math transition-all duration-300 ${
                  teacherSubtitle.includes('ضرب') || teacherSubtitle.includes('ثمانية من مائة') || teacherSubtitle.includes('0.08') || teacherSubtitle.includes('منزلتان')
                    ? 'bg-cyan-100 dark:bg-cyan-500/25 border-2 border-cyan-400 shadow-glow-primary scale-102'
                    : 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30'
                }`}>
                  <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold block mb-1">ضرب الكسور العشرية</span>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
                    <Fraction num={4} den={10} size="xs" /> × <Fraction num={2} den={10} size="xs" /> = <Fraction num={8} den={100} size="xs" /> = 0.08
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1" dir="rtl">
                    0.4 × 0.2 = 0.08 (منزلة + منزلة = منزلتان)
                  </span>
                </div>

                <div className={`p-3 rounded-xl text-center font-math transition-all duration-300 ${
                  teacherSubtitle.includes('قسمة') || teacherSubtitle.includes('المقسوم عليه') || teacherSubtitle.includes('الضرب في 10') || teacherSubtitle.includes('2.4')
                    ? 'bg-amber-100 dark:bg-amber-500/25 border-2 border-[#E5A91B] shadow-glow-gold scale-102'
                    : 'bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30'
                }`}>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mb-1">قسمة الكسور العشرية</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    2.4 ÷ 0.6 = 24 ÷ 6 = 4
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1" dir="rtl">
                    بالضرب في 10 للتخلص من فاصلة المقسوم عليه
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Station 2: PEMDAS Hierarchy Pyramid */}
          {currentTime >= 60 && currentTime < 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-400/50 shadow-[0_0_20px_rgba(229,169,27,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-amber-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#E5A91B] block">
                  هرم أولويات ترتيب العمليات الحسابية PEMDAS (المحطة 2):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-2`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#E5A91B] border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto text-xs font-bold text-center">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('الأقواس') || teacherSubtitle.includes('Parentheses') || teacherSubtitle.includes('القمة')
                    ? 'bg-rose-500/30 border-2 border-rose-500 shadow-glow-crimson scale-105 text-rose-700 dark:text-rose-200'
                    : 'bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300'
                }`}>
                  1. الأقواس أولاً ( ) [Parentheses]
                </div>
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('الضرب والقسمة') || teacherSubtitle.includes('اليسار إلى اليمين')
                    ? 'bg-amber-500/30 border-2 border-[#E5A91B] shadow-glow-gold scale-105 text-amber-900 dark:text-amber-200'
                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300'
                }`}>
                  2. الضرب والقسمة (من اليسار إلى اليمين) [× و ÷]
                </div>
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  teacherSubtitle.includes('الجمع والطرح')
                    ? 'bg-emerald-500/30 border-2 border-emerald-500 shadow-lg scale-105 text-emerald-900 dark:text-emerald-200'
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                }`}>
                  3. الجمع والطرح (من اليسار إلى اليمين) [+ و -]
                </div>
              </div>
            </div>
          )}

          {/* Station 3: Solved Multi-Step Expression */}
          {currentTime >= 120 && (
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg space-y-3 transition-all duration-300 ${
              isPlaying
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-white dark:bg-slate-900/95 border-emerald-400/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                  تطبيق شامل خطوة بخطوة (المحطة 3):
                </span>
                <button 
                  onClick={() => playSilmaOrFallback(`video-${stageId}-station-3`, getActiveProblemNarration(stageId, currentTime), 'station')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition shadow-sm"
                >
                  <Volume2 className="w-3.5 h-3.5" /> استمع للشرح 🎧
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 font-math text-xs space-y-1.5 text-center text-slate-200" dir="ltr">
                <div className="text-slate-400">24 - 4 × (3 + 2)</div>
                <div className={`transition-all duration-300 ${
                  teacherSubtitle.includes('نفك القوس') || teacherSubtitle.includes('القوس') || teacherSubtitle.includes('3 + 2')
                    ? 'text-amber-200 font-black scale-105 bg-amber-500/20 p-1 rounded-lg border border-amber-400'
                    : 'text-amber-300 font-bold'
                }`}>
                  = 24 - 4 × 5 <span className="text-[10px] text-slate-400 font-sans">(فك القوس أولاً)</span>
                </div>
                <div className={`transition-all duration-300 ${
                  teacherSubtitle.includes('نضرب') || teacherSubtitle.includes('عشرين') || teacherSubtitle.includes('4 × 5')
                    ? 'text-cyan-200 font-black scale-105 bg-cyan-500/20 p-1 rounded-lg border border-cyan-400'
                    : 'text-cyan-300 font-bold'
                }`}>
                  = 24 - 20 <span className="text-[10px] text-slate-400 font-sans">(إجراء الضرب ثانياً)</span>
                </div>
                <div className={`transition-all duration-300 ${
                  teacherSubtitle.includes('أربعة') || teacherSubtitle.includes('الطرح')
                    ? 'text-emerald-300 font-black scale-110 bg-emerald-500/25 p-1 rounded-lg border border-emerald-400 shadow-md'
                    : 'text-emerald-400 font-black text-sm'
                }`}>
                  = 4 <span className="text-[10px] text-slate-400 font-sans">(إجراء الطرح أخيراً)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default Fallback Visualizer for other stages
    return (
      <div className="space-y-3 max-w-md mx-auto text-center animate-fadeIn" dir="rtl">
        <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-[#39A9D0] border border-cyan-300 dark:border-cyan-500/40 text-xs font-bold font-math shadow-sm">
          {getActiveStationName(currentTime)}
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-math">
          {stageTitle}
        </div>
        <div className="flex items-center justify-center gap-3 text-xs text-amber-600 dark:text-amber-400 font-math font-bold" dir="ltr">
          <span>الزمن: {formatTime(currentTime)}</span>
          <span>•</span>
          <span>المحطات المحلولة: {completedCheckpoints.length} من {checkpoints.length}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-white/10 space-y-5">
      
      {/* Top Header & Score Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#E5A91B] uppercase tracking-wider">
              الاستوديو التعليمي الذكي 🎬
            </span>
            <span className="text-[10px] bg-[#39A9D0]/20 text-[#39A9D0] border border-[#39A9D0]/40 px-2 py-0.5 rounded-full font-bold">
              شرح صوتي وتفاعلي 100%
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {videoData?.title || `الشرح المرئي التفاعلي: ${stageTitle}`}
          </h3>
        </div>

        {/* User Interactive Video Score */}
        <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 px-3.5 py-1.5 rounded-2xl shadow-sm">
          <Award className="w-4 h-4 text-[#E5A91B]" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">نقاط المحطات:</span>
          <span className="text-sm font-black text-[#E5A91B] font-math">+{userScore}</span>
        </div>
      </div>

      {/* المحطات التفاعلية السريعة (Interactive Stations Nav Bar) */}
      <div className="space-y-2 text-right" dir="rtl">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#39A9D0]" />
          <span>قائمة المحطات التفاعلية (اضغط على أي محطة للانتقال إليها وسماع الشرح):</span>
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {checkpoints.map((cp, idx) => {
            const status = checkpointStatus[cp.timestamp];
            const isCompleted = completedCheckpoints.includes(cp.timestamp);
            const isCorrect = status === 'correct';
            const isAlert = status === 'wrong' || status === 'skipped';
            const stationTimes = [0, 60, 120];
            const startTime = stationTimes[idx] ?? 0;
            const isCurrent = currentTime >= startTime && currentTime < (startTime + 60);

            let cardStyle = 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-cyan-500/40';
            if (isAlert) {
              cardStyle = 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-400 dark:border-rose-500/60 text-rose-950 dark:text-rose-200 shadow-sm ring-1 ring-rose-400/30';
            } else if (isCorrect) {
              cardStyle = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100';
            } else if (isCurrent) {
              cardStyle = 'bg-cyan-50 dark:bg-[#39A9D0]/20 border-[#39A9D0] text-[#39A9D0] shadow-glow-primary scale-[1.02]';
            }

            return (
              <button
                key={idx}
                onClick={() => jumpToStation(idx)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${cardStyle}`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-black">
                    <span>محطة {idx + 1}</span>
                    <span className="font-math text-[10px] text-slate-500 dark:text-slate-400">({formatTime(cp.timestamp)})</span>
                    {isAlert && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-0.5 shrink-0">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {status === 'wrong' ? 'إجابة خاطئة' : 'تم التخطي'}
                      </span>
                    )}
                    {isCorrect && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                        مكتملة بنجاح ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                    {cp.question}
                  </p>
                </div>

                <div className="shrink-0">
                  {isAlert ? (
                    <div 
                      className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.6)] ring-2 ring-rose-400/50 animate-pulse" 
                      title="المحطة بها خطأ أو تم تخطيها - اضغط لإعادة المحاولة"
                    >
                      !
                    </div>
                  ) : isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-400/20 border border-amber-300 dark:border-amber-400/50 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-300 font-math">
                      {idx + 1}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen / Interactive Whiteboard Canvas Area (Adapted for Light & Dark Mode + Responsive Mobile) */}
      <div 
        ref={whiteboardCanvasRef}
        id="interactive-whiteboard-canvas"
        className="relative min-h-[520px] sm:min-h-0 sm:aspect-video w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-[#0b0f19] border border-slate-300 dark:border-white/15 overflow-hidden flex flex-col justify-between p-3 sm:p-6 shadow-md dark:shadow-2xl gap-3 scroll-mt-20"
      >
        {/* Sleek 2-second Auto-play Countdown Overlay */}
        {autoStartCountdown > 0 && !isPlaying && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-md animate-fadeIn p-4 text-center">
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border border-cyan-400/50 shadow-2xl space-y-3.5 max-w-sm w-full mx-auto" dir="rtl">
              <div className="w-14 h-14 rounded-full bg-[#39A9D0]/20 border-2 border-[#39A9D0] text-[#39A9D0] flex items-center justify-center mx-auto text-2xl font-math font-black shadow-glow-primary animate-pulse">
                {autoStartCountdown}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black text-white">
                  استعد! يبدأ الفيديو التفاعلي تلقائياً 🎬
                </h4>
                <p className="text-xs text-slate-300">
                  يبدأ العرض خلال <span className="text-[#E5A91B] font-bold font-math">{autoStartCountdown}</span> ثوانٍ للتهيئة...
                </p>
              </div>
              <button
                onClick={() => {
                  cancelAutoStart();
                  togglePlay();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#39A9D0] to-[#E5A91B] text-slate-950 font-black text-xs shadow-glow-primary hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <span>بدء العرض التفاعلي الآن</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        )}
        
        {/* Animated Background Grids */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 dark:opacity-15">
          <div className="w-96 h-96 rounded-full border border-cyan-500/40 animate-spin" style={{ animationDuration: '40s' }}></div>
          <div className="absolute w-64 h-64 rounded-full border border-amber-500/40 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}></div>
        </div>

        {/* Top Floating Status Bar */}
        <div className="relative z-10 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-white/15 font-bold text-[#39A9D0] shadow-sm">
              المرحلة {stageId} • {stageTitle}
            </span>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold text-[10px]">
              {getActiveStationName(currentTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 font-bold animate-pulse text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#39A9D0]"></span> صوت المعلم Silma AI 🎙️
              </span>
            )}
          </div>
        </div>

        {/* Center Presentation Graphic: Dynamic Animated Whiteboard */}
        <div className="relative z-10 my-auto py-2">
          {renderWhiteboardGraphic()}
        </div>

        {/* Teacher Live Narration Subtitle Bar with Interactive Silma Badge */}
        <div className="relative z-20 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-cyan-400/40 dark:border-cyan-500/40 shadow-md dark:shadow-xl flex items-center gap-2 sm:gap-3 animate-fadeIn" dir="rtl">
          <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
          </div>
          <div className="flex-1 text-right min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-[#39A9D0]">أستاذ الرياضيات Silma AI 🎙️:</span>
              {isPlaying && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-cyan-500 h-2 animate-pulse"></span>
                  <span className="w-1 bg-[#E5A91B] h-3 animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1 bg-cyan-500 h-1.5 animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed mt-0.5 line-clamp-2 sm:line-clamp-none">
              {teacherSubtitle || `أهلاً بكم في ${getActiveStationName(currentTime)}، اضغط تشغيل لسماع الشرح الصوتي التفاعلي.`}
            </p>
          </div>
        </div>

        {/* Checkpoint Modal Overlay inside player (with X close button & mobile scroll) */}
        {activeCheckpoint && (
          <div className="absolute inset-0 z-30 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md p-2 sm:p-6 flex flex-col justify-center items-center text-center animate-fadeIn overflow-y-auto">
            <div className="max-w-lg w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-500/50 shadow-2xl space-y-3 sm:space-y-4 text-right max-h-[92%] overflow-y-auto no-scrollbar" dir="rtl">
              
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 text-xs font-bold">
                  <HelpCircle className="w-3.5 h-3.5" /> محطة توقف تفاعلية ذكية
                </span>

                <div className="flex items-center gap-2">
                  {/* Button to listen to question anytime with Silma audio */}
                  <button
                    onClick={() => {
                      const cpIdx = checkpoints.findIndex(c => c.timestamp === activeCheckpoint.timestamp);
                      const taskKey = `video-${stageId}-cp-${cpIdx !== -1 ? cpIdx + 1 : 1}`;
                      const optionsText = activeCheckpoint.options.map((opt, i) => `الخيار ${i + 1}: ${opt}`).join("، ");
                      playSilmaOrFallback(taskKey, `محطة توقف تفاعلية: ${activeCheckpoint.question}. ${optionsText}`, 'station');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-[#39A9D0] border border-cyan-500/40 text-xs font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition"
                    title="استمع لنطق السؤال والخيارات بصوت المعلم"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">استمع</span>
                  </button>

                  {/* Close button */}
                  <button
                    onClick={handleCloseOrContinueCheckpoint}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                    title="إغلاق ومتابعة الصوت في المحطة التالية"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {activeCheckpoint.question}
              </h4>

              {/* Options */}
              <div className="space-y-2 text-xs sm:text-sm">
                {activeCheckpoint.options.map((option, idx) => {
                  const isSpoken = isPlayingAudio && currentAudioSentenceIdx === idx + 1;
                  let btnStyle = "bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-white/10 hover:border-cyan-500/50 text-slate-800 dark:text-slate-200";
                  if (isSpoken) {
                    btnStyle = "bg-cyan-100/90 dark:bg-cyan-500/30 border-cyan-400 text-cyan-950 dark:text-cyan-100 font-bold shadow-glow-primary ring-2 ring-cyan-400/70 scale-[1.01]";
                  }
                  if (selectedOption === idx) {
                    btnStyle = "bg-cyan-100 dark:bg-cyan-500/25 border-cyan-400 text-cyan-900 dark:text-cyan-200 font-bold shadow-glow-primary";
                  }
                  if (isAnswerSubmitted) {
                    if (idx === activeCheckpoint.correctIndex) {
                      btnStyle = "bg-emerald-100 dark:bg-emerald-500/30 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-black shadow-lg";
                    } else if (selectedOption === idx) {
                      btnStyle = "bg-rose-100 dark:bg-red-500/30 border-rose-400 dark:border-red-500 text-rose-900 dark:text-red-200";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-right transition-all font-math flex items-center justify-between text-xs sm:text-sm ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-center leading-5 text-xs font-bold font-math shrink-0 transition-colors ${
                          isSpoken ? 'bg-[#39A9D0] text-slate-950 shadow-glow-primary' : 'bg-slate-200 dark:bg-white/10'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold">{option}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSpoken && !isAnswerSubmitted && (
                          <Volume2 className="w-4 h-4 text-[#39A9D0] animate-pulse" />
                        )}
                        {isAnswerSubmitted && idx === activeCheckpoint.correctIndex && (
                          <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Action */}
              {isAnswerSubmitted ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 dark:bg-slate-800/80 border border-amber-300 dark:border-white/10 text-right leading-relaxed text-xs sm:text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#E5A91B] font-bold">💡 التوضيح الرياضي الشامل:</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-300">{activeCheckpoint.explanation}</p>
                  </div>
                  <button
                    onClick={handleCloseOrContinueCheckpoint}
                    className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs sm:text-sm shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    <span>متابعة رحلة الفيديو والانتقال للمحطة التالية ▶</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-[#39A9D0] text-white font-black text-xs sm:text-sm shadow-glow-primary transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400"
                >
                  تأكيد الإجابة والتحقق 🎯
                </button>
              )}

            </div>
          </div>
        )}

        {/* Video Bottom Progress Bar & Timeline with LTR Motion starting from LEFT */}
        <div className="relative z-10 space-y-2 pt-2">
          
          {/* Timeline Bar (Strictly LTR: moves from Left to Right) */}
          <div 
            dir="ltr"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              handleSeek(Math.floor(clickPos * totalDuration));
            }}
            className="relative h-2.5 bg-slate-200 dark:bg-slate-800/90 rounded-full cursor-pointer overflow-visible border border-slate-300 dark:border-white/10"
          >
            {/* Progress Fill expanding from Left */}
            <div 
              className="h-full bg-gradient-to-r from-[#39A9D0] via-[#E5A91B] to-[#B51F3A] rounded-full transition-all"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            ></div>

            {/* Checkpoint Markers on the Timeline */}
            {checkpoints.map((cp, idx) => {
              const posPercent = (cp.timestamp / totalDuration) * 100;
              const status = checkpointStatus[cp.timestamp];
              const isCorrect = status === 'correct';
              const isAlert = status === 'wrong' || status === 'skipped';

              let markerStyle = 'bg-amber-400 border-slate-950 shadow-glow-gold animate-bounce';
              if (isAlert) {
                markerStyle = 'bg-rose-500 border-white text-white ring-2 ring-rose-400/90 shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse font-black';
              } else if (isCorrect) {
                markerStyle = 'bg-emerald-500 border-white text-white shadow-md font-bold';
              }

              return (
                <div
                  key={idx}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    openStationCheckpoint(cp); 
                  }}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 transition-transform hover:scale-150 flex items-center justify-center cursor-pointer ${markerStyle}`}
                  style={{ left: `${posPercent}%` }}
                  title={`محطة ${idx + 1}: ${cp.question} ${isAlert ? '(إجابة غير صحيحة أو تم تخطيها !)' : isCorrect ? '(مكتملة بنجاح ✓)' : ''}`}
                >
                  {isAlert ? (
                    <span className="text-[11px] leading-none">!</span>
                  ) : isCorrect ? (
                    <span className="text-[9px] leading-none">✓</span>
                  ) : (
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls Bar */}
          <div className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300 pt-1" dir="ltr">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#39A9D0] text-white flex items-center justify-center hover:scale-105 transition shadow-glow-primary"
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل الفيديو"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button 
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                title="تراجع 10 ثوانٍ"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => handleSeek(Math.min(totalDuration, currentTime + 10))}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                title="تقديم 10 ثوانٍ"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => handleSeek(0)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
                title="إعادة من البداية"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <span className="font-math text-xs font-bold text-slate-900 dark:text-white px-1">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback speed toggle */}
              <button
                onClick={() => {
                  const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
                  setPlaybackSpeed(nextSpeed);
                  if (videoAudioRef.current) {
                    videoAudioRef.current.playbackRate = nextSpeed;
                  }
                }}
                className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-800 font-math font-bold text-[11px] text-cyan-700 dark:text-cyan-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                title="سرعة التشغيل"
              >
                {playbackSpeed}x
              </button>

              <div className="text-[11px] font-bold hidden sm:flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {checkpoints.filter(cp => checkpointStatus[cp.timestamp] === 'correct').length} صحيحة
                </span>
                {checkpoints.some(cp => checkpointStatus[cp.timestamp] === 'wrong' || checkpointStatus[cp.timestamp] === 'skipped') && (
                  <span className="text-rose-500 flex items-center gap-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {checkpoints.filter(cp => checkpointStatus[cp.timestamp] === 'wrong' || checkpointStatus[cp.timestamp] === 'skipped').length} تحتاج مراجعة (!)
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
