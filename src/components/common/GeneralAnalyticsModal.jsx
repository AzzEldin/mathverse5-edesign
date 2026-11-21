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
  GOOGLE_SHEET_URL
} from '../../utils/analyticsTracker';

export default function GeneralAnalyticsModal({ isOpen, onClose, theme = 'dark', studentProfile = null }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'stages'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'in_progress'
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
          message: `تم التحديث المباشر من Google Sheets (${res.count} طالب مسجل) 🟢`
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

  // تصفية الطلاب
  const filteredStudents = useMemo(() => {
    return (analytics.studentsList || []).filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.school && student.school.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const isCompleted = Boolean(student.completedAt) || (student.completedStages && student.completedStages.length === 6);
      
      if (statusFilter === 'completed') return matchesSearch && isCompleted;
      if (statusFilter === 'in_progress') return matchesSearch && !isCompleted;
      return matchesSearch;
    });
  }, [analytics.studentsList, searchQuery, statusFilter]);

  // استخراج سجل الطالب الحالي (المستخدم)
  const currentStudentRecord = useMemo(() => {
    if (!studentProfile?.name) return null;
    return (analytics.studentsList || []).find(
      s => s.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase()
    ) || {
      name: studentProfile.name,
      school: studentProfile.school || 'الصف الخامس الابتدائي',
      avatar: studentProfile.avatar || '🚀',
      activityLog: [
        { event: 'تسجيل الدخول في المنصة', timestamp: studentProfile.registeredAt || new Date().toISOString() }
      ]
    };
  }, [analytics.studentsList, studentProfile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn" dir="rtl">
      <div className="max-w-5xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        
        {/* Modal Top Header */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-white/10 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
              <img
                src={theme === 'light' ? edesignShieldColor : edesignShieldWhite}
                alt="eDesign Shield Logo"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
                style={{
                  filter: theme === 'light'
                    ? 'drop-shadow(0 2px 4px rgba(57, 169, 208, 0.4))'
                    : 'drop-shadow(0 0 8px rgba(57, 169, 208, 0.45))'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  لوحة الإحصائيات العامة للمنصة
                </h3>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-[#39A9D0]/15 text-[#39A9D0] border border-[#39A9D0]/30">
                  MathVerse 5 Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
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
          <div className={`px-4 sm:px-6 py-2 text-xs font-bold flex items-center justify-between border-b ${
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

        {/* Tab Navigation (نظرة عامة / سجل الطلاب / تحليل المراحل) */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-slate-950/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-2xl border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#39A9D0] text-[#39A9D0] bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>نظرة عامة والمؤشرات</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-2xl border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-[#39A9D0] text-[#39A9D0] bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل الطلاب وتحليل الأيام ({analytics.totalStudents})</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-2xl border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stages'
                ? 'border-[#39A9D0] text-[#39A9D0] bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>تحليل مراحل المنهج</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

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
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ابحث باسم الطالب أو المدرسة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#39A9D0]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="all">كافة الطلاب ({analytics.totalStudents})</option>
                    <option value="completed">أتموا المنهج فقط ({analytics.completedCount})</option>
                    <option value="in_progress">قيد التعلم ({analytics.totalStudents - analytics.completedCount})</option>
                  </select>
                </div>
              </div>

              {/* Students Table (عمود عرض سجل المشاهدات الفردي ملغي لحماية الخصوصية) */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-white/10">
                      <tr>
                        <th className="p-3">الطالب</th>
                        <th className="p-3">تاريخ التسجيل</th>
                        <th className="p-3">المراحل المنجزة</th>
                        <th className="p-3 text-center">أيام الإتمام / النشاط</th>
                        <th className="p-3 text-center">متوسط الدرجات</th>
                        <th className="p-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-slate-400">
                            لا يوجد طلاب مطابقين لمعايير البحث.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => {
                          const isCompleted = Boolean(student.completedAt) || (student.completedStages && student.completedStages.length === 6);
                          const daysTaken = student.completedAt
                            ? (student.daysToComplete || calculateDaysBetween(student.registeredAt, student.completedAt))
                            : calculateDaysBetween(student.registeredAt, new Date());
                          
                          const scores = Object.values(student.quizScores || {});
                          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                          const completedCount = (student.completedStages || []).length;
                          const isCurrent = studentProfile?.name && student.name.trim().toLowerCase() === studentProfile.name.trim().toLowerCase();

                          return (
                            <tr 
                              key={student.id} 
                              className={`transition ${isCurrent ? 'bg-[#39A9D0]/10 hover:bg-[#39A9D0]/15 font-semibold' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'}`}
                            >
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
        <div className="bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-white/10 p-3 sm:p-4 flex items-center justify-between text-xs text-slate-500">
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
