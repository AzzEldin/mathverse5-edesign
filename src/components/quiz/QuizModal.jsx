import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Award, RotateCcw, ArrowLeft, Sparkles, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizModal({ 
  quizData, 
  onClose, 
  onQuizCompleted,
  onOpenCertificate 
}) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const questions = quizData.questions || [];
  const currentQ = questions[currentQuestionIdx];
  const totalQuestions = questions.length;

  const handleSelectOption = (optIndex) => {
    if (!isAnswerRevealed) {
      setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optIndex }));
      setIsAnswerRevealed(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setIsAnswerRevealed(selectedAnswers[currentQuestionIdx + 1] !== undefined);
    } else {
      // Finish quiz
      calculateAndFinish();
    }
  };

  const calculateAndFinish = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= (quizData.passingScore || 80);

    if (passed) {
      // Fire confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }

    onQuizCompleted(quizData.id, scorePercentage, passed);
    setIsFinished(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setIsAnswerRevealed(false);
    setIsFinished(false);
  };

  // Calculate final score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });
  const finalScore = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = finalScore >= (quizData.passingScore || 80);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" dir="rtl">
      <div className="max-w-2xl w-full bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/15 dark:border-white/15 light:border-slate-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative text-right">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <span className="text-xs font-bold text-[#39A9D0] uppercase tracking-wider block mb-1">
            {quizData.subtitle}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pr-8">
            {quizData.title}
          </h3>
        </div>

        {!isFinished ? (
          /* Question View */
          <div className="space-y-6">
            
            {/* Progress & Counter */}
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-bold">
                السؤال <span className="text-white font-math">{currentQuestionIdx + 1}</span> من <span className="font-math">{totalQuestions}</span>
              </span>
              <span className="font-math font-bold text-[#E5A91B]">
                درجة النجاح المطلوبة: {quizData.passingScore || 80}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#39A9D0] to-[#E5A91B] rounded-full transition-all"
                style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>

            {/* Question Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-300 space-y-3">
              <h4 className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 leading-relaxed">
                {currentQ.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                const isCorrect = idx === currentQ.correctIndex;
                
                let btnStyle = "bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border-white/10 dark:border-white/10 light:border-slate-300 hover:border-cyan-500/40 text-slate-200 dark:text-slate-200 light:text-slate-800";
                if (isAnswerRevealed) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 dark:text-emerald-300 light:text-emerald-700 font-bold shadow-sm";
                  } else if (isSelected) {
                    btnStyle = "bg-red-500/20 border-red-500 text-red-400 dark:text-red-300 light:text-red-700 shadow-sm";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-cyan-500/20 border-cyan-500 text-cyan-400 dark:text-cyan-300 light:text-cyan-800 font-bold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerRevealed}
                    className={`w-full p-4 rounded-xl border text-right transition font-math text-sm flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswerRevealed && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card upon answering */}
            {isAnswerRevealed && (
              <div className="p-4 rounded-2xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-amber-50 border border-white/10 dark:border-white/10 light:border-amber-300 text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-800 leading-relaxed space-y-1">
                <span className="font-bold text-[#E5A91B] block">💡 الشرح والتوضيح الرياضي:</span>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                disabled={!isAnswerRevealed}
                className="px-6 py-3 rounded-xl bg-[#39A9D0] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-glow-primary transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400"
              >
                <span>{currentQuestionIdx < totalQuestions - 1 ? 'السؤال التالي' : 'إنهاء الاختبار وعرض النتيجة'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* Finished Result Screen */
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl border border-white/20">
              {isPassed ? '🏆' : '📚'}
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white">
                {isPassed ? 'تهانينا! لقد اجتزت الاختبار بنجاح باهر' : 'حاول مرة أخرى لتحقيق الإتقان!'}
              </h4>
              <p className="text-sm text-slate-300">
                {isPassed 
                  ? 'أثبتّ استيعابك للمفاهيم الرياضية وجدارتك بالانتقال للمرحلة التالية.' 
                  : 'راجع المعمل التفاعلي والشروحات، ثم أعد المحاولة للوصول لنسبة 80% فما فوق.'
                }
              </p>
            </div>

            {/* Score Display Card */}
            <div className="max-w-xs mx-auto p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">النتيجة النهائية:</span>
              <div className="text-4xl font-black font-math text-[#E5A91B]">
                {finalScore}%
              </div>
              <span className="text-xs text-slate-400">
                أجبت على <strong className="text-white font-math">{correctCount}</strong> من أصل <strong className="text-white font-math">{totalQuestions}</strong> أسئلة
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {quizData.id === 'final-mastery-exam' && isPassed ? (
                <button
                  onClick={() => { onClose(); onOpenCertificate(); }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E5A91B] to-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-glow-gold hover:scale-105 transition"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>عرض وطباعة الشهادة الكبرى 📜</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-[#39A9D0] text-slate-950 font-black text-sm hover:bg-cyan-400 transition"
                >
                  متابعة مسار التعلم
                </button>
              )}

              <button
                onClick={handleRetry}
                className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-sm flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" /> إعادة الاختبار
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
