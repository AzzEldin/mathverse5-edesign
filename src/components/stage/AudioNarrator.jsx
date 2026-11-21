import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, FastForward } from 'lucide-react';

export default function AudioNarrator({ 
  scriptText, 
  lessonTitle, 
  autoPlayKey = null,
  recordedAudioInfo = null,
  // Controlled props from parent (e.g., StageViewer)
  isPlaying: controlledIsPlaying,
  isPaused: controlledIsPaused,
  rate: controlledRate,
  currentSentenceIdx: controlledSentenceIdx,
  onTogglePlay: controlledTogglePlay,
  onStop: controlledStop,
  onRateChange: controlledRateChange,
  onStartSpeaking: controlledStartSpeaking
}) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const [internalIsPaused, setInternalIsPaused] = useState(false);
  const [internalRate, setInternalRate] = useState(1.0);
  const [internalSentenceIdx, setInternalSentenceIdx] = useState(-1);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  const isControlled = controlledTogglePlay !== undefined;

  const isPlaying = isControlled ? controlledIsPlaying : internalIsPlaying;
  const isPaused = isControlled ? controlledIsPaused : internalIsPaused;
  const rate = isControlled ? controlledRate : internalRate;
  const currentSentenceIdx = isControlled ? controlledSentenceIdx : internalSentenceIdx;

  // Split script into sentences for real-time highlighting
  const sentences = scriptText
    ? scriptText.split(/([.!؟])/g).reduce((acc, part, i, arr) => {
        if (i % 2 === 0 && part.trim()) {
          const punct = arr[i + 1] || '';
          acc.push(part.trim() + punct);
        }
        return acc;
      }, [])
    : [];

  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-play when autoPlayKey changes (triggered on sequential navigation) only if uncontrolled
  useEffect(() => {
    if (!isControlled && autoPlayKey !== null && autoPlayKey !== undefined) {
      const timer = setTimeout(() => {
        internalStartSpeaking(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlayKey, isControlled]);

  const internalStartSpeaking = (fromSentence = 0) => {
    if (controlledStartSpeaking) {
      controlledStartSpeaking(fromSentence);
      return;
    }

    if (!synthRef.current) return;
    synthRef.current.cancel();

    const textToSpeak = sentences.slice(fromSentence).join(' ') || scriptText;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Arabic voice preference
    utterance.lang = 'ar-SA';
    utterance.rate = rate;

    // Detect available Arabic voices
    const voices = synthRef.current.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      setInternalIsPlaying(true);
      setInternalIsPaused(false);
      setInternalSentenceIdx(fromSentence);
    };

    utterance.onend = () => {
      setInternalIsPlaying(false);
      setInternalIsPaused(false);
      setInternalSentenceIdx(-1);
    };

    utterance.onerror = () => {
      setInternalIsPlaying(false);
      setInternalIsPaused(false);
      setInternalSentenceIdx(-1);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (controlledTogglePlay) {
      controlledTogglePlay();
      return;
    }

    if (!synthRef.current) return;

    if (isPlaying && !isPaused) {
      synthRef.current.pause();
      setInternalIsPaused(true);
    } else if (isPlaying && isPaused) {
      synthRef.current.resume();
      setInternalIsPaused(false);
    } else {
      internalStartSpeaking(0);
    }
  };

  const handleStop = () => {
    if (controlledStop) {
      controlledStop();
      return;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
      setInternalIsPlaying(false);
      setInternalIsPaused(false);
      setInternalSentenceIdx(-1);
    }
  };

  const handleRateChange = (newRate) => {
    if (controlledRateChange) {
      controlledRateChange(newRate);
      return;
    }

    setInternalRate(newRate);
    if (isPlaying) {
      internalStartSpeaking(currentSentenceIdx >= 0 ? currentSentenceIdx : 0);
    }
  };

  const handleSentenceClick = (idx) => {
    if (controlledStartSpeaking) {
      controlledStartSpeaking(idx);
    } else {
      internalStartSpeaking(idx);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-[#39A9D0]/30 light:border-slate-200 shadow-lg light:shadow-sm space-y-3">
      
      {/* Player Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#39A9D0]/20 text-[#39A9D0] flex items-center justify-center border border-[#39A9D0]/40">
            <Volume2 className={`w-4 h-4 ${isPlaying && !isPaused ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#39A9D0] block">الشرح الصوتي التفاعلي</span>
              {recordedAudioInfo && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span>صوت الأستاذ الافتراضي (Silma AI) 🎙️</span>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold">{lessonTitle}</span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2">
          
          {/* Rate Selector */}
          <div className="flex items-center bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 rounded-lg p-0.5 border border-white/10 dark:border-white/10 light:border-slate-300 text-xs">
            {[0.8, 1.0, 1.2].map((r) => (
              <button
                key={r}
                onClick={() => handleRateChange(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-math font-bold transition ${
                  rate === r 
                    ? 'bg-[#39A9D0] text-slate-950 font-black' 
                    : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full bg-[#39A9D0] text-slate-950 flex items-center justify-center shadow-glow-primary hover:scale-105 transition"
            title={isPlaying && !isPaused ? "إيقاف مؤقت" : "تشغيل الشرح الصوتي"}
          >
            {isPlaying && !isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Reset */}
          <button
            onClick={handleStop}
            className="p-1.5 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-slate-200 rounded-lg transition"
            title="إيقاف"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Script Text with Read-Along Highlight */}
      <div className="p-3 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
        {sentences.map((sent, idx) => (
          <span
            key={idx}
            className={`transition-all duration-200 cursor-pointer ${
              currentSentenceIdx === idx 
                ? 'narrator-highlight text-white dark:text-white light:text-slate-950 light:bg-cyan-100/80 px-1 rounded font-bold' 
                : 'hover:text-cyan-200 dark:hover:text-cyan-200 light:hover:text-cyan-700'
            }`}
            onClick={() => handleSentenceClick(idx)}
            title="اضغط للاستماع من هذه الجملة"
          >
            {sent}{' '}
          </span>
        ))}
      </div>

    </div>
  );
}
