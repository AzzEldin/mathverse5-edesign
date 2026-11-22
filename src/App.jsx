import React, { useState, useEffect, useRef } from 'react';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import StageRoadmap from './components/navigation/StageRoadmap.jsx';
import StageViewer from './components/stage/StageViewer.jsx';
import QuizModal from './components/quiz/QuizModal.jsx';
import CertificateModal from './components/quiz/CertificateModal.jsx';
import StudentRegistrationModal from './components/common/StudentRegistrationModal.jsx';
import WelcomeSplashModal from './components/common/WelcomeSplashModal.jsx';
import GeneralAnalyticsModal from './components/common/GeneralAnalyticsModal.jsx';
import PlatformGuideModal from './components/common/PlatformGuideModal.jsx';
import SharePlatformModal from './components/common/SharePlatformModal.jsx';
import { recordStudentUpdate } from './utils/analyticsTracker.js';

import { STAGES_DATA, FINAL_EXAM_INFO } from './data/curriculumData.js';
import { QUIZZES_DATABASE } from './data/quizzesData.js';

import { MapPin, BookOpen, Award, CheckCircle, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'mathverse5_user_progress';
const PROFILE_STORAGE_KEY = 'mathverse_student_profile';

export default function App() {
  // Load progress from localStorage
  const [userProgress, setUserProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      completedStages: [], // [1, 2, 3...]
      quizScores: {},      // { 'quiz-stage-1': 100 }
      currentStageId: 1,
    };
  });

  const [currentView, setCurrentView] = useState('stage'); // 'stage' | 'roadmap'
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Student Profile state
  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // 1. Initial startup sync: ONLY runs once on initial page load if returning student has profile
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          recordStudentUpdate(parsed, userProgress, 'تسجيل دخول نشط');
        }
      }
    } catch (e) {}
  }, []); // Run ONLY once on mount, NEVER on registration!

  // 2. Onboarding sequence on first visit: Guide first, then Registration if no profile
  useEffect(() => {
    try {
      const guideViewed = localStorage.getItem('mathverse_guide_viewed');
      if (!guideViewed) {
        setIsGuideOpen(true);
      } else if (!studentProfile) {
        setIsRegisterOpen(true);
      }
    } catch (e) {
      if (!studentProfile) setIsRegisterOpen(true);
    }
  }, [studentProfile]);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    if (!studentProfile) {
      setIsRegisterOpen(true);
    }
  };

  const handleSaveStudentProfile = (profile) => {
    const isFirstTime = !studentProfile;
    setStudentProfile(profile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {}
    
    // تسجيل بيانات الطالب في سجل التحليلات والإحصائيات
    recordStudentUpdate(profile, userProgress, isFirstTime ? 'تسجيل حساب جديد' : 'تحديث الملف الشخصي');
    
    setIsRegisterOpen(false);

    // If first time registration, show celebratory welcome splash!
    if (isFirstTime) {
      setIsWelcomeOpen(true);
    }
  };

  const handleStartFirstLesson = () => {
    setIsWelcomeOpen(false);
    handleSelectStage(1);
    setCurrentView('stage');
  };

  const handleResetStudent = () => {
    if (window.confirm("تنبيه هام: هل ترغب في تسجيل طالب جديد؟ سيتم محو اسم الطالب وجميع الدرجات والشهادات والتقدم المحرز بالكامل!")) {
      try {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      setStudentProfile(null);
      setUserProgress({
        completedStages: [],
        quizScores: {},
        currentStageId: 1
      });
      setIsRegisterOpen(true);
      setIsWelcomeOpen(false);
    }
  };

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('mathverse_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    try {
      localStorage.setItem('mathverse_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  };

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      // ignore
    }
  }, [userProgress]);

  const handleSelectStage = (stageId) => {
    const isUnlocked = stageId === 1 || (userProgress.completedStages || []).includes(stageId - 1);
    if (!isUnlocked) {
      alert(`المرحلة ${stageId} مقفلة! يجب اجتياز اختبار المرحلة ${stageId - 1} أولاً للانتقال إليها.`);
      return;
    }
    setUserProgress(prev => ({ ...prev, currentStageId: stageId }));
    setCurrentView('stage');
  };

  const handleStartQuiz = (quizId) => {
    setActiveQuizId(quizId);
  };

  const handleQuizCompleted = (quizId, scorePercentage, isPassed) => {
    setUserProgress(prev => {
      const newScores = { ...prev.quizScores, [quizId]: Math.max(scorePercentage, prev.quizScores[quizId] || 0) };
      let newCompleted = [...prev.completedStages];

      if (isPassed) {
        // If it's a stage quiz, add stage id
        const stageNumMatch = quizId.match(/quiz-stage-(\d+)/);
        if (stageNumMatch) {
          const sNum = parseInt(stageNumMatch[1]);
          if (!newCompleted.includes(sNum)) {
            newCompleted.push(sNum);
          }
        }
      }

      const updatedProgress = {
        ...prev,
        quizScores: newScores,
        completedStages: newCompleted
      };

      // تسجيل نشاط الطالب ودرجاته في لوحة الإحصائيات
      if (studentProfile) {
        const eventText = isPassed 
          ? `اجتياز اختبار ${quizId} بنتيجة ${scorePercentage}% 🎉` 
          : `محاولة اختبار ${quizId} بنتيجة ${scorePercentage}%`;
        recordStudentUpdate(studentProfile, updatedProgress, eventText);
      }

      return updatedProgress;
    });
  };

  const handleResetProgress = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في إعادة ضبط تقدم الطالب وحذف الدرجات المحرزة؟")) {
      const fresh = {
        completedStages: [],
        quizScores: {},
        currentStageId: 1
      };
      setUserProgress(fresh);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const currentStage = STAGES_DATA.find(s => s.id === userProgress.currentStageId) || STAGES_DATA[0];

  const handlePrevStage = () => {
    if (userProgress.currentStageId > 1) {
      handleSelectStage(userProgress.currentStageId - 1);
    }
  };

  const handleNextStage = () => {
    const currentId = userProgress.currentStageId;
    // Strictly require current stage to be completed
    if (!userProgress.completedStages.includes(currentId)) {
      alert(`يجب اجتياز اختبار المرحلة ${currentId} أولاً للانتقال إلى المرحلة التالية!`);
      return;
    }
    if (currentId < STAGES_DATA.length) {
      handleSelectStage(currentId + 1);
    }
  };

  const openFinalExam = () => {
    const isAllCompleted = [1, 2, 3, 4, 5, 6].every(num => (userProgress.completedStages || []).includes(num));
    if (!isAllCompleted) {
      alert("الامتحان النهائي الشامل مقفل! يجب اجتياز اختبارات جميع المراحل الست أولاً للحصول على الشهادة الكبرى.");
      return;
    }
    setActiveQuizId('final-mastery-exam');
  };

  const isCertificateEarned = (userProgress?.completedStages || []).length === 6 &&
    (userProgress?.quizScores?.['final-mastery-exam'] >= 80 || userProgress?.quizScores?.['final-exam'] >= 80);

  const handleOpenCertificate = () => {
    if (!isCertificateEarned) {
      alert("الشهادة الرسمية مقفلة! يجب إتمام جميع المراحل الست واجتياز الامتحان النهائي الشامل أولاً.");
      return;
    }
    setIsCertificateOpen(true);
  };

  const finalExamScore = userProgress.quizScores['final-mastery-exam'] || userProgress.quizScores['final-exam'] || 100;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] dark:bg-[#0b0f19] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-900 font-sans selection:bg-[#39A9D0] selection:text-white transition-colors duration-300">
      
      {/* Top Header */}
      <Header
        currentStageId={userProgress.currentStageId}
        onSelectStage={handleSelectStage}
        userProgress={userProgress}
        onResetProgress={handleResetProgress}
        onOpenFinalExam={openFinalExam}
        theme={theme}
        onToggleTheme={toggleTheme}
        studentProfile={studentProfile}
        onOpenEditProfile={() => setIsRegisterOpen(true)}
        onResetStudent={handleResetStudent}
        onOpenCertificate={handleOpenCertificate}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* View Switcher Bar (Roadmap vs Stage View) with Visual Gamification */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100/80 p-2 sm:p-2.5 rounded-3xl border border-white/10 dark:border-white/10 light:border-slate-200 backdrop-blur-md">
          
          {/* Main Segmented Switcher */}
          <div className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-2 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white p-1 sm:p-1.5 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-300 shadow-sm">
            <button
              onClick={() => setCurrentView('stage')}
              className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                currentView === 'stage'
                  ? 'bg-gradient-to-r from-[#39A9D0] to-cyan-400 text-slate-950 shadow-glow-primary scale-[1.02]'
                  : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>محطة التعلم الحالية (م{userProgress.currentStageId}) 🚀</span>
            </button>

            <button
              onClick={() => setCurrentView('roadmap')}
              className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                currentView === 'roadmap'
                  ? 'bg-gradient-to-r from-[#E5A91B] to-amber-400 text-slate-950 shadow-glow-gold scale-[1.02]'
                  : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>خريطة كامل المنهج 🗺️</span>
            </button>
          </div>

          {/* Points & Certificate Indicators */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Quick Points Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 shadow-sm">
              <span className="text-sm">⭐</span>
              <span className="text-[11px] text-slate-400 hidden xs:inline">الرصيد:</span>
              <span className="font-math font-black text-amber-300">
                +{Object.values(userProgress?.quizScores || {}).reduce((acc, score) => acc + (score || 0), 0)}
              </span>
              <span className="text-[10px]">نقطة</span>
            </div>

            {/* Quick Certificate View if already earned */}
            {userProgress.quizScores['final-mastery-exam'] >= 80 ? (
              <button
                onClick={() => setIsCertificateOpen(true)}
                className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/25 to-amber-400/15 border border-amber-500/50 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow-glow-gold hover:bg-amber-500/30 transition animate-pulse"
              >
                <Award className="w-4 h-4 text-[#E5A91B]" />
                <span>عرض شهادة الإتقان 🏆</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-200/60 border border-white/5 light:border-slate-300 text-[11px] font-bold text-slate-400">
                <span>المراحل المكتملة:</span>
                <span className="font-math font-black text-[#39A9D0]">{(userProgress.completedStages || []).length}</span>
                <span>/ 6</span>
              </div>
            )}
          </div>
        </div>

        {/* View Component */}
        {currentView === 'stage' ? (
          <StageViewer
            stage={currentStage}
            onStartQuiz={() => handleStartQuiz(currentStage.quizId)}
            isCompleted={userProgress.completedStages.includes(currentStage.id)}
            quizScore={userProgress.quizScores[currentStage.quizId]}
            onPrevStage={handlePrevStage}
            onNextStage={handleNextStage}
            hasNext={userProgress.currentStageId < STAGES_DATA.length}
            hasPrev={userProgress.currentStageId > 1}
          />
        ) : (
          <StageRoadmap
            stages={STAGES_DATA}
            currentStageId={userProgress.currentStageId}
            onSelectStage={handleSelectStage}
            userProgress={userProgress}
            onOpenFinalExam={openFinalExam}
          />
        )}

      </main>

      {/* Quiz Modal */}
      {activeQuizId && (
        <QuizModal
          quizData={QUIZZES_DATABASE[activeQuizId]}
          onClose={() => setActiveQuizId(null)}
          onQuizCompleted={handleQuizCompleted}
          onOpenCertificate={() => setIsCertificateOpen(true)}
        />
      )}

      {/* Certificate Modal */}
      {isCertificateOpen && (
        <CertificateModal
          finalScore={finalExamScore}
          initialStudentName={studentProfile?.name}
          studentProfile={studentProfile}
          theme={theme}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}

      {/* Student Onboarding / Edit Profile Modal */}
      <StudentRegistrationModal
        isOpen={isRegisterOpen}
        initialProfile={studentProfile}
        isFirstTime={!studentProfile}
        onSave={handleSaveStudentProfile}
        onClose={() => {
          if (studentProfile) setIsRegisterOpen(false);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetStudent={handleResetStudent}
      />

      {/* Celebratory Welcome Splash for First Time Registration */}
      <WelcomeSplashModal
        isOpen={isWelcomeOpen}
        studentProfile={studentProfile}
        onStartFirstLesson={handleStartFirstLesson}
        theme={theme}
      />

      {/* General Platform Analytics Modal (لوحة الإحصائيات العامة للمنصة) */}
      <GeneralAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        theme={theme}
        studentProfile={studentProfile}
      />

      {/* Platform Guide Modal (دليل المنصة للأبطال وأولياء الأمور) */}
      <PlatformGuideModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
        theme={theme}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Share Platform Modal (نافذة المشاركة السريعة) */}
      <SharePlatformModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        theme={theme}
      />

      {/* Official eDesign Agency LTR Footer */}
      <Footer theme={theme} onOpenAnalytics={() => setIsAnalyticsOpen(true)} />

    </div>
  );
}
