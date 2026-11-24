import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Users, Award, Clock, Calendar, CheckCircle,
  TrendingUp, RefreshCw, Search, ShieldCheck,
  School, BookOpen, UserCheck, ExternalLink, CloudCheck, Wifi
} from 'lucide-react';
import { edesignShieldWhite, edesignShieldColor } from '../../data/brandingIcons';
import { STAGES_DATA } from '../../data/curriculumData';
import {
  computePlatformAnalytics,
  calculateDaysBetween,
  fetchStudentsFromGoogleSheets,
  GOOGLE_SHEET_URL,
  getStudentAvgScore,
  compareStudentsByScore
} from '../../utils/analyticsTracker';

export default function GeneralAnalyticsModal({ isOpen, onClose, theme = 'dark', studentProfile = null }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'stages'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'in_progress'
  const [sortBy, setSortBy] = useState('completed'); // 'completed' (الافتراضي: الأكثر إنجازاً للمراحل) | 'score_desc' | 'newest' | 'name'
  const [displayLimit, setDisplayLimit] = useState(30);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // مزامنة سحابية مع Google Sheets
  const handleSyncWithCloud = async () => {
    setIsSyncing(true);
    setSyncStatus({ status: 'loading', message: 'جاري الاتصال السحابي بـ Google Sheets...' });
    try {
      const res = await fetchStudentsFromGoogleSheets();
      if (res && res.success) {
        setSyncStatus({
          status: 'success',
          message: 'تم التحديث المباشر'
        });
        setRefreshTrigger(t => t + 1);
      } else {
        setSyncStatus({
          status: 'fallback',
          message: res?.message || 'تعذر جلب البيانات الحية، يتم عرض البيانات المحلية والمسجلة'
        });
      }
    } catch (e) {
      setSyncStatus({
        status: 'error',
        message: 'حدث خطأ أثناء الاتصال السحابي، يتم عرض السجلات المحلية'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // المزامنة التلقائية عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      handleSyncWithCloud();
    }
  }, [isOpen]);

  // حساب الإحصائيات العامة للمنصة
  const analytics = useMemo(() => {
    return computePlatformAnalytics();
  }, [refreshTrigger]);

  // استخراج سجل الطالب الحالي (المستخدم)
  const currentStudentRecord = useMemo(() => {
    if (!studentProfile?.name) return null;
    const found = (analytics.studentsList || []).find(
      s => (studentProfile.id && s.id === studentProfile.id) ||
           (s.name && s.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase())
    );
    if (found) {
      return {
        ...found,
        completedStages: studentProfile.completedStages || found.completedStages || [],
        quizScores: { ...(found.quizScores || {}), ...(studentProfile.quizScores || {}) }
      };
    }
    return {
      id: studentProfile.id || 'std_current',
      name: studentProfile.name,
      school: studentProfile.school || 'الصف الخامس الابتدائي',
      avatar: studentProfile.avatar || '🚀',
      registeredAt: studentProfile.registeredAt || new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      completedAt: studentProfile.completedAt || null,
      daysToComplete: null,
      completedStages: studentProfile.completedStages || [],
      quizScores: studentProfile.quizScores || {},
      hasCertificate: Boolean(studentProfile.hasCertificate),
      activityLog: [
        { event: 'تسجيل الدخول في المنصة', timestamp: studentProfile.registeredAt || new Date().toISOString() }
      ]
    };
  }, [analytics.studentsList, studentProfile]);

    // استخراج وحساب الترتيب العام على مستوى المنصة (Global Leaderboard Rank)
    const masterRankMap = useMemo(() => {
      let fullList = [...(analytics.studentsList || [])];
      if (studentProfile?.name && currentStudentRecord) {
        const exists = fullList.some(s =>
          (studentProfile.id && s.id === studentProfile.id) ||
          (s.name && s.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase())
        );
        if (!exists) {
          fullList.push(currentStudentRecord);
        } else {
          fullList = fullList.map(s => {
            if ((studentProfile.id && s.id === studentProfile.id) ||
                (s.name && s.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase())) {
              return currentStudentRecord;
            }
            return s;
          });
        }
      }

      // ترتيب كل طلاب المنصة حسب الإنجاز ثم الدرجات لتحديد الترتيب العام الحقيقي
      fullList.sort((a, b) => {
        const compA = (a.completedStages || []).length;
        const compB = (b.completedStages || []).length;
        if (compB !== compA) return compB - compA;
        return compareStudentsByScore(a, b);
      });

      const map = new Map();
      fullList.forEach((s, idx) => {
        const key = s.id || s.name;
        map.set(key, idx + 1);
      });
      return map;
    }, [analytics.studentsList, studentProfile, currentStudentRecord]);

    // تصفية وفرز الطلاب
    const filteredStudents = useMemo(() => {
      let sourceList = analytics.studentsList || [];
  
      // التأكد من إدراج الطالب الحالي في القائمة إن لم يكن مسجلاً سلفاً
      if (studentProfile?.name && currentStudentRecord) {
        const alreadyInList = sourceList.some(s =>
          (studentProfile.id && s.id === studentProfile.id) ||
          (s.name && s.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase())
        );
        if (!alreadyInList) {
          sourceList = [currentStudentRecord, ...sourceList];
        } else {
          sourceList = sourceList.map(s => {
            if ((studentProfile.id && s.id === studentProfile.id) ||
                (s.name && s.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase())) {
              return currentStudentRecord;
            }
            return s;
          });
        }
      }
  
      const list = sourceList.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (student.school && student.school.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const isCompleted = Boolean(student.completedAt) || (student.completedStages && student.completedStages.length === 6);
        
        if (statusFilter === 'completed') return matchesSearch && isCompleted;
        if (statusFilter === 'in_progress') return matchesSearch && !isCompleted;
        return matchesSearch;
      });
  
      const isCurrentStudent = (s) => {
        if (!studentProfile?.name) return false;
        if (studentProfile.id && s.id === studentProfile.id) return true;
        return Boolean(s.name && s.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase());
      };
  
      return [...list].sort((a, b) => {
        // إذا كان الفرز حسب الإنجاز أو الدرجات، لا نثبت المستخدم في المركز الأول قسراً لكي يكون الترتيب منطقياً وعادلاً،
        // ولكن إن كانت خيارات أخرى أو عند رغبة التصفح، يتم تمييزه بلون واضح.
        if (sortBy === 'completed') {
          const compA = (a.completedStages || []).length;
          const compB = (b.completedStages || []).length;
          if (compB !== compA) return compB - compA;
          return compareStudentsByScore(a, b);
        }
        if (sortBy === 'score_desc') {
          return compareStudentsByScore(a, b);
        }
        if (sortBy === 'newest') {
          const dateA = new Date(a.registeredAt || 0).getTime();
          const dateB = new Date(b.registeredAt || 0).getTime();
          return dateB - dateA;
        }
        if (sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '', 'ar');
        }
        const compA = (a.completedStages || []).length;
        const compB = (b.completedStages || []).length;
        if (compB !== compA) return compB - compA;
        return compareStudentsByScore(a, b);
      });
    }, [analytics.studentsList, searchQuery, statusFilter, sortBy, studentProfile, currentStudentRecord]);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setDisplayLimit(30);
  }, [searchQuery, statusFilter, sortBy]);

  const displayedStudents = useMemo(() => {
    return filteredStudents.slice(0, displayLimit);
  }, [filteredStudents, displayLimit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn" dir="rtl">
      <div className="max-w-5xl w-full h-[94vh] sm:h-[90vh] max-h-[880px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        
        {/* Modal Top Header */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/10 p-3 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
              <img
                src={theme === 'light' ? edesignShieldColor : edesignShieldWhite}
                alt="eDesign Shield Logo"
                className="h-5 w-5 sm:h-7 sm:w-7 object-contain"
                style={{
                  filter: theme === 'light'
                    ? 'drop-shadow(0 2px 4px rgba(57, 169, 208, 0.4))'
                    : 'drop-shadow(0 0 8px rgba(57, 169, 208, 0.45))'
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  لوحة الإحصائيات العامة للمنصة
                </h3>
                <span className="text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#39A9D0]/15 text-[#39A9D0] border border-[#39A9D0]/30 shrink-0">
                  MathVerse 5 Analytics
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate hidden xs:block">
                متابعة مؤشرات التعلم، نسبة إنجاز المنهج، وتوزيع تقدم الطلاب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncWithCloud}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#39A9D0] transition disabled:opacity-50"
              title="مزامنة حية مع Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div className={`px-4 sm:px-6 py-2 text-xs font-bold flex items-center justify-between border-b shrink-0 ${
            syncStatus.status === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : syncStatus.status === 'loading'
              ? 'bg-[#39A9D0]/10 text-[#39A9D0] border-[#39A9D0]/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${syncStatus.status === 'success' ? 'bg-emerald-500 animate-pulse' : syncStatus.status === 'loading' ? 'bg-[#39A9D0] animate-ping' : 'bg-amber-500'}`}></span>
              <span>{syncStatus.message}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation (نظرة عامة / سجل الطلاب / تحليل المراحل) - Sticky with shrink-0 */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 pt-2 sm:pt-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-950/80 overflow-x-auto shrink-0 z-20 sticky top-0 backdrop-blur-md no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-t-2xl border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'overview'
                ? 'border-[#39A9D0] text-[#39A9D0] bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>نظرة عامة والمؤشرات</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-t-2xl border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'students'
                ? 'border-[#39A9D0] text-[#39A9D0] bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل الطلاب ({analytics.totalStudents})</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-t-2xl border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'stages'
                ? 'border-[#39A9D0] text-[#39A9D0] bg-white dark:bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>تحليل مراحل المنهج</span>
          </button>
        </div>

        {/* Tab Content Body - Scrollable with min-h-0 */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 min-h-0 overscroll-contain">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 6 KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {/* 1. Total Registered */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#39A9D0]/10 via-[#39A9D0]/5 to-transparent border border-[#39A9D0]/20 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-bold">إجمالي المسجلين</span>
                    <Users className="w-4 h-4 text-[#39A9D0]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-math">
                    {analytics.totalStudents}
                  </div>
                  <span className="text-[11px] text-slate-400 block">طالب وطالبة مسجلين بالمنصة</span>
                </div>

                {/* 2. Completed Curriculum */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-bold">أتموا المنهج</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-math">
                    {analytics.completedCount}
                  </div>
                  <span className="text-[11px] text-slate-400 block">أكملوا كافة المراحل بنجاح ({analytics.completionRate}%)</span>
                </div>

                {/* 3. Average Days to Complete */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-bold">متوسط أيام الإتمام</span>
                    <Calendar className="w-4 h-4 text-[#E5A91B]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#E5A91B] font-math">
                    {analytics.avgDaysToComplete} <span className="text-sm font-bold">أيام</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">متوسط المدة لإنهاء كامل المنهج</span>
                </div>

                {/* 4. Average Quiz Score */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-bold">متوسط الدرجات</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-math">
                    {analytics.avgQuizScore}%
                  </div>
                  <span className="text-[11px] text-slate-400 block">متوسط التحصيل عبر كل الاختبارات</span>
                </div>

                {/* 5. Certificates Issued */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#B51F3A]/10 via-[#B51F3A]/5 to-transparent border border-[#B51F3A]/20 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-bold">الشهادات الممنوحة</span>
                    <Award className="w-4 h-4 text-[#B51F3A]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#B51F3A] dark:text-rose-400 font-math">
                    {analytics.certificatesIssued}
                  </div>
                  <span className="text-[11px] text-slate-400 block">شهادة إتقان رقمية معتمدة</span>
                </div>

                {/* 6. Active in Progress */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-bold">قيد المذاكرة حالياً</span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-math">
                    {analytics.totalStudents - analytics.completedCount}
                  </div>
                  <span className="text-[11px] text-slate-400 block">طلاب يواصلون اجتياز المراحل</span>
                </div>
              </div>

              {/* Stage Progress Summary Mini-Chart */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#39A9D0]" />
                    <span>معدل اجتياز كل مرحلة دراسية (Stage Pass Rate)</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-bold">النسبة المئوية للاجتياز</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analytics.stageStats.map(stat => {
                    const stageInfo = STAGES_DATA.find(s => s.id === stat.stageId);
                    return (
                      <div key={stat.stageId} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800 dark:text-slate-200 truncate">
                            م{stat.stageId}: {stageInfo?.title || ''}
                          </span>
                          <span className="text-[#39A9D0] font-math">{stat.passRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#39A9D0] to-emerald-400 rounded-full"
                            style={{ width: `${stat.passRate}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{stat.passedCount} من {analytics.totalStudents} طالب</span>
                          <span>متوسط الدرجات: {stat.avgScore}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: STUDENTS REGISTRY & DAYS TAKEN */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="relative w-full sm:max-w-xs md:max-w-sm">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث باسم الطالب أو المدرسة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#39A9D0]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* فلترة الحالة */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none font-bold"
                  >
                    <option value="all">كافة الطلاب ({analytics.totalStudents})</option>
                    <option value="completed">أتموا المنهج فقط ({analytics.completedCount})</option>
                    <option value="in_progress">قيد التعلم ({analytics.totalStudents - analytics.completedCount})</option>
                  </select>

                  {/* فرز القائمة */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none font-bold text-[#39A9D0]"
                    title="ترتيب قائمة الطلاب"
                  >
                    <option value="completed">📚 الأكثر إنجازاً للمراحل (افتراضي)</option>
                    <option value="score_desc">🏆 أعلى متوسط درجات</option>
                    <option value="newest">🕒 الأحدث تسجيلاً</option>
                    <option value="name">🔤 أبجدياً (أ-ي)</option>
                  </select>
                </div>
              </div>

              {/* Status and count indicator */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1 flex-wrap gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>عرض {displayedStudents.length} من أصل {filteredStudents.length} طالباً (إجمالي المسجلين: {analytics.totalStudents})</span>
                  {studentProfile?.name && (
                    <span className="text-[#39A9D0] bg-[#39A9D0]/10 px-2 py-0.5 rounded-full border border-[#39A9D0]/20 text-[10px] font-bold">
                      ⭐ حسابك مميز بإشارة زرقاء (ترتيبك العام: #{masterRankMap.get(studentProfile.id || studentProfile.name) || '-'})
                    </span>
                  )}
                </div>
                <span className="text-emerald-500 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  مجتمع تعليمي نشط 🟢
                </span>
              </div>

              {/* Students Table with Sticky Header */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col">
                <div className="overflow-x-auto max-h-[46vh] sm:max-h-[50vh] overflow-y-auto overscroll-contain">
                  <table className="w-full text-right text-xs min-w-[620px] relative">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-3 text-center w-12 font-black">#</th>
                        <th className="p-3">الطالب</th>
                        <th className="p-3">تاريخ التسجيل</th>
                        <th className="p-3">المراحل المنجزة</th>
                        <th className="p-3 text-center">أيام الإتمام / النشاط</th>
                        <th className="p-3 text-center">متوسط الدرجات</th>
                        <th className="p-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {displayedStudents.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-6 text-center text-slate-400">
                            لا يوجد طلاب مطابقين لمعايير البحث.
                          </td>
                        </tr>
                      ) : (
                        displayedStudents.map((student, index) => {
                          const isCompleted = Boolean(student.completedAt) || (student.completedStages && student.completedStages.length === 6);
                          const daysTaken = student.completedAt
                            ? (student.daysToComplete || calculateDaysBetween(student.registeredAt, student.completedAt))
                            : calculateDaysBetween(student.registeredAt, new Date());
                          
                          const avgScore = getStudentAvgScore(student);
                          const completedCount = (student.completedStages || []).length;
                          const isCurrent = Boolean(
                            (studentProfile?.id && student.id === studentProfile.id) ||
                            (studentProfile?.name && student.name && student.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase())
                          );

                          return (
                            <tr 
                              key={student.id || `student-${student.name}-${index}`} 
                              className={`transition ${isCurrent ? 'bg-[#39A9D0]/10 hover:bg-[#39A9D0]/15 font-semibold ring-1 ring-[#39A9D0]/30 dark:ring-[#39A9D0]/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'}`}
                            >
                              {/* الترتيب والميداليات للثلاثة الأوائل */}
                              <td className="p-3 text-center font-math font-black text-xs">
                                {(() => {
                                  // الترتيب العام الحقيقي للطالب على المنصة
                                  const globalRank = masterRankMap.get(student.id || student.name);
                                  const isRankSorted = sortBy === 'completed' || sortBy === 'score_desc';

                                  // إذا كان الفرز بحسب التفوق والإنجاز، والمستخدم يقع في المراكز الثلاثة الأولى
                                  if (isRankSorted) {
                                    if (index === 0) {
                                      return (
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/40 text-sm shadow-sm" title={`المركز الأول 🥇 (الترتيب العام: #${globalRank})`}>
                                          🥇
                                        </span>
                                      );
                                    }
                                    if (index === 1) {
                                      return (
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-400 border border-slate-300/40 text-sm shadow-sm" title={`المركز الثاني 🥈 (الترتيب العام: #${globalRank})`}>
                                          🥈
                                        </span>
                                      );
                                    }
                                    if (index === 2) {
                                      return (
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-600/40 text-sm shadow-sm" title={`المركز الثالث 🥉 (الترتيب العام: #${globalRank})`}>
                                          🥉
                                        </span>
                                      );
                                    }
                                    return (
                                      <span className="text-slate-400 dark:text-slate-500 font-bold" title={`الترتيب في القائمة: ${index + 1} (الترتيب العام: #${globalRank})`}>
                                        {index + 1}
                                      </span>
                                    );
                                  }

                                  // في حالات الفرز الأخرى (أبجدياً، الأحدث تسجيلاً)، نظهر رقم تسلسل الصف وبجانبه الترتيب العام إن أردنا أو التسلسل فقط
                                  return (
                                    <div className="flex flex-col items-center justify-center">
                                      <span className="text-slate-500 dark:text-slate-400 font-bold">
                                        {index + 1}
                                      </span>
                                      {globalRank <= 3 && (
                                        <span className="text-[10px]" title={`من أوائل المنصة عامة (#${globalRank})`}>
                                          {globalRank === 1 ? '🥇' : globalRank === 2 ? '🥈' : '🥉'}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* Student name & avatar */}
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl shrink-0">{student.avatar || '🚀'}</span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 dark:text-white block">
                                        {student.name}
                                      </span>
                                      {isCurrent && (
                                        <span className="text-[9px] bg-[#39A9D0] text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                                          أنت
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <School className="w-2.5 h-2.5" />
                                      {student.school || 'الصف الخامس'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Registration date */}
                              <td className="p-3 text-slate-600 dark:text-slate-300 font-math">
                                {student.registeredAt
                                  ? new Date(student.registeredAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
                                  : '-'}
                              </td>

                              {/* Completed stages bar */}
                              <td className="p-3">
                                <div className="space-y-1 max-w-[120px]">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{completedCount} من 6</span>
                                    <span className="text-[#39A9D0] font-math font-bold">{Math.round((completedCount / 6) * 100)}%</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-[#39A9D0] to-emerald-400 rounded-full"
                                      style={{ width: `${(completedCount / 6) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>

                              {/* Days to complete */}
                              <td className="p-3 text-center">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-math text-xs border border-emerald-500/20">
                                    <Clock className="w-3 h-3" />
                                    <span>{daysTaken} {daysTaken === 1 ? 'يوم واحد' : daysTaken === 2 ? 'يومان' : `${daysTaken} أيام`}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-math">
                                    <span>نشط منذ {daysTaken} {daysTaken === 1 ? 'يوم' : 'أيام'}</span>
                                  </span>
                                )}
                              </td>

                              {/* Average score */}
                              <td className="p-3 text-center">
                                <span className={`font-math font-bold ${avgScore >= 90 ? 'text-emerald-500' : avgScore >= 75 ? 'text-[#39A9D0]' : 'text-amber-500'}`}>
                                  {avgScore > 0 ? `${avgScore}%` : '-'}
                                </span>
                              </td>

                              {/* Status badge */}
                              <td className="p-3 text-center">
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px] border border-amber-500/20">
                                    <Award className="w-3 h-3 text-[#E5A91B]" />
                                    <span>أتم المنهج 🏆</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-[10px]">
                                    <span>المرحلة {completedCount + 1}</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination / Load More Bar */}
                {filteredStudents.length > displayedStudents.length && (
                  <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs px-3 sm:px-4 flex-wrap gap-2">
                    <span className="text-slate-500 text-[11px]">
                      يتم عرض {displayedStudents.length} من {filteredStudents.length} طالب
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDisplayLimit(prev => prev + 30)}
                        className="px-3 py-1.5 rounded-xl bg-[#39A9D0]/10 hover:bg-[#39A9D0]/20 text-[#39A9D0] font-bold text-xs transition"
                      >
                        عرض 30 طالب إضافي 🔽
                      </button>
                      <button
                        onClick={() => setDisplayLimit(filteredStudents.length)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                      >
                        عرض الكل ({filteredStudents.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* عرض سجل الطالب (المستخدم الحالي) فقط بشكل افتراضي لحماية الخصوصية */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#39A9D0] to-[#E5A91B] flex items-center justify-center text-xl shadow-glow-primary shrink-0">
                      {currentStudentRecord?.avatar || '🚀'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          سجل نشاطك الدراسي الشخصي 📌
                        </h4>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          <span>الطالب الحالي</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        {currentStudentRecord?.name || 'طالب متميز'} • {currentStudentRecord?.school || 'الصف الخامس الابتدائي'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* قائمة النشاط الزمني للطالب الحالي */}
                <div className="space-y-2 pt-1 max-h-56 overflow-y-auto">
                  {currentStudentRecord?.activityLog && currentStudentRecord.activityLog.length > 0 ? (
                    currentStudentRecord.activityLog.map((act, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/5 hover:border-[#39A9D0]/30 transition"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#39A9D0] shadow-sm"></span>
                          {act.event}
                        </span>
                        <span className="text-[11px] text-slate-400 font-math">
                          {act.timestamp ? new Date(act.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      لا يوجد نشاط مسجل بعد للطالب الحالي. قم باجتياز الدروس والاختبارات لتسجيل تقدمك هنا!
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: STAGES DETAILED BREAKDOWN */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STAGES_DATA.map((stage) => {
                  const stat = analytics.stageStats.find(s => s.stageId === stage.id);
                  const passRate = stat ? stat.passRate : 0;
                  const passedCount = stat ? stat.passedCount : 0;
                  const avgScore = stat ? stat.avgScore : 0;

                  return (
                    <div
                      key={stage.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-[#39A9D0]/10 text-[#39A9D0] flex items-center justify-center font-black font-math text-sm">
                            {stage.id}
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {stage.title}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {stage.lessons?.length || 0} دروس تفاعلية ومعمل بصري
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black text-emerald-500 font-math bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          {passRate}% نسبة الاجتياز
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#39A9D0] to-emerald-400 rounded-full"
                          style={{ width: `${passRate}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          <span className="block text-[10px]">الطلاب المجتازون:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-math">
                            {passedCount} / {analytics.totalStudents} طالب
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px]">متوسط درجة الاختبار:</span>
                          <span className="font-bold text-[#E5A91B] font-math">
                            {avgScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-white/10 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#39A9D0]" />
            <span>نظام إحصائيات معتمد لوكالة eDesign Agency • MathVerse 5</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
