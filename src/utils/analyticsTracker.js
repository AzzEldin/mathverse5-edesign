/**
 * src/utils/analyticsTracker.js
 * مدير التتبع والإحصائيات وتحليل سجل استخدام الطلاب لمنصة MathVerse 5
 */

import { MOCK_STUDENTS_100 } from '../data/mockStudents.js';

const STUDENTS_REGISTRY_KEY = 'mathverse_students_registry';
const WEBHOOK_URL_KEY = 'mathverse_analytics_webhook_url';

/**
 * حساب عدد الأيام بين تاريخين
 */
export function calculateDaysBetween(startDate, endDate = new Date()) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * بيانات العينات التوضيحية (100 طالب في مراحل متفاوتة - معظمها في البدايات)
 */
export const DEFAULT_DEMO_STUDENTS = MOCK_STUDENTS_100;

/**
 * حساب متوسط درجات الطالب بدقة
 */
export function getStudentAvgScore(student) {
  if (!student) return 0;
  if (typeof student.avgQuizScore === 'number' && student.avgQuizScore > 0) {
    return student.avgQuizScore;
  }
  const scores = Object.values(student.quizScores || {}).filter(v => typeof v === 'number' && v > 0);
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

/**
 * دالة مقارنة للترتيب التنازلي حسب أعلى متوسط درجات
 */
export function compareStudentsByScore(a, b) {
  const scoreA = getStudentAvgScore(a);
  const scoreB = getStudentAvgScore(b);
  if (scoreB !== scoreA) {
    return scoreB - scoreA; // من الأعلى درجات إلى الأقل
  }
  // في حال تساوي المتوسط، الأولوية للأكثر إنجازاً للمراحل
  const stagesA = (a.completedStages || []).length;
  const stagesB = (b.completedStages || []).length;
  if (stagesB !== stagesA) {
    return stagesB - stagesA;
  }
  // في حال التساوي، الأقدم تسجيلاً أو أبجدياً
  return (a.name || '').localeCompare(b.name || '', 'ar');
}

/**
 * دمج السجلات الحقيقية مع العينات الـ 100
 * مرتبة حسب أعلى متوسط درجات
 */
export function mergeWithMockStudents(liveStudents = []) {
  if (!Array.isArray(liveStudents) || liveStudents.length === 0) {
    return [...MOCK_STUDENTS_100].sort(compareStudentsByScore);
  }
  
  const realNames = new Set(liveStudents.map(s => (s.name || '').trim().toLowerCase()));
  const filteredMocks = MOCK_STUDENTS_100.filter(m => !realNames.has(m.name.trim().toLowerCase()));
  
  // فرز الطلاب الحقيقيين أولاً حسب أعلى درجات، ثم فرز عينات المجتمع أيضاً حسب أعلى درجات
  const sortedLive = [...liveStudents].sort(compareStudentsByScore);
  const sortedMocks = [...filteredMocks].sort(compareStudentsByScore);
  
  return [...sortedLive, ...sortedMocks];
}

/**
 * جلب قائمة الطلاب المسجلين
 */
export function getRegisteredStudents() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STUDENTS_REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithMockStudents(parsed);
        }
      }
    }
  } catch (e) {
    console.warn("Error reading students registry:", e);
  }
  return MOCK_STUDENTS_100;
}

/**
 * حفظ قائمة الطلاب المسجلين
 */
export function saveRegisteredStudents(studentsList) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STUDENTS_REGISTRY_KEY, JSON.stringify(studentsList));
    }
  } catch (e) {
    console.error("Error saving students registry:", e);
  }
}

/**
 * تحديث أو إضافة طالب في سجل الطلاب
 */
export function recordStudentUpdate(profile, progress = null, eventName = null) {
  if (!profile || !profile.name) return;

  const students = getRegisteredStudents();
  const existingIdx = students.findIndex(s => s.name.trim() === profile.name.trim());
  const now = new Date().toISOString();

  let studentRecord;
  if (existingIdx >= 0) {
    studentRecord = { ...students[existingIdx] };
  } else {
    studentRecord = {
      id: 'std_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: profile.name.trim(),
      school: profile.school || 'الصف الخامس الابتدائي',
      avatar: profile.avatar || '🚀',
      registeredAt: profile.registeredAt || now,
      lastActiveAt: now,
      completedAt: null,
      daysToComplete: null,
      completedStages: [],
      quizScores: {},
      hasCertificate: false,
      activityLog: [
        { event: 'تسجيل حساب جديد', timestamp: now }
      ]
    };
  }

  // تحديث البيانات
  studentRecord.lastActiveAt = now;
  if (profile.school) studentRecord.school = profile.school;
  if (profile.avatar) studentRecord.avatar = profile.avatar;

  if (progress) {
    studentRecord.completedStages = progress.completedStages || studentRecord.completedStages;
    studentRecord.quizScores = { ...studentRecord.quizScores, ...(progress.quizScores || {}) };

    const isAllCompleted = [1, 2, 3, 4, 5, 6].every(num => studentRecord.completedStages.includes(num));
    const hasFinalExam = Boolean(studentRecord.quizScores['final-exam']);

    if (isAllCompleted && hasFinalExam && !studentRecord.completedAt) {
      studentRecord.completedAt = now;
      studentRecord.hasCertificate = true;
      studentRecord.daysToComplete = calculateDaysBetween(studentRecord.registeredAt, now);
      studentRecord.activityLog.push({
        event: 'إتمام المنهج بالكامل وإصدار شهادة الإتقان 🏆',
        timestamp: now
      });
    }
  }

  if (eventName) {
    studentRecord.activityLog.push({
      event: eventName,
      timestamp: now
    });
  }

  // حفظ في القائمة
  if (existingIdx >= 0) {
    students[existingIdx] = studentRecord;
  } else {
    students.unshift(studentRecord);
  }

  saveRegisteredStudents(students);

  // بث عبر Webhook إن وُجد (اختياري للمزامنة السحابية)
  broadcastToCloudWebhook(studentRecord, eventName);

  return studentRecord;
}

export const GOOGLE_SHEET_ID = "1b2cV2LbAtpl3RZIzohD-7QDFIZLqmV5LW98VOvcCNC4";
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;
export const DEFAULT_ADMIN_KEY = "edesign_admin_25";
export const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxGYw8B65N0_z5tLXD8xCc-tpPhtcio993JRIxrqD7_Ajr7uiGaGqRTDiz9IJ7jBS0u/exec";

/**
 * إعدادات Webhook للمشرف
 */
export function getWebhookUrl() {
  return localStorage.getItem(WEBHOOK_URL_KEY) || DEFAULT_WEBHOOK_URL;
}

export function setWebhookUrl(url) {
  if (url) {
    localStorage.setItem(WEBHOOK_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(WEBHOOK_URL_KEY);
  }
}

/**
 * إرسال تحديثات الطالب لخادم سحابي أو Google Sheets Webhook مجاني
 */
export async function broadcastToCloudWebhook(studentRecord, eventName) {
  try {
    const webhookUrl = getWebhookUrl();
    if (!webhookUrl || !webhookUrl.startsWith('http')) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        event: eventName || 'user_activity',
        student: studentRecord,
        timestamp: new Date().toISOString()
      }),
      mode: 'no-cors' // يدعم Google Apps Script Webhooks بأمان
    });
  } catch (err) {
    // تجاهل أخطاء الشبكة بصمت لعدم تعطيل تجربة الطالب
  }
}

/**
 * جلب الطلاب مباشرة من Google Sheets باستخدام رابط Web App الخاص بك
 */
export async function fetchStudentsFromGoogleSheets(customUrl = null, adminKey = DEFAULT_ADMIN_KEY) {
  const url = customUrl || getWebhookUrl();
  if (!url || !url.startsWith("http")) {
    return { success: false, message: "لم يتم تعيين رابط Google Apps Script Web App بعد" };
  }

  try {
    const fetchUrl = `${url}?key=${encodeURIComponent(adminKey)}`;
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error(`خطأ في استجابة الخادم: ${res.status}`);
    }
    const data = await res.json();
    if (data.status === "success" && Array.isArray(data.students)) {
      // دمج السجلات الحقيقية من Google Sheets مع العينات الـ 100 لتشجيع ومساندة الطلاب
      const merged = mergeWithMockStudents(data.students);
      saveRegisteredStudents(merged);
      return { success: true, count: merged.length, realCount: data.count, students: merged };
    } else {
      return { success: false, message: data.message || "فشل جلب البيانات من Google Sheets" };
    }
  } catch (err) {
    return { success: false, message: err.message || "تعذر الاتصال بـ Google Sheets" };
  }
}

/**
 * حساب وتجميع الإحصائيات العامة
 */
export function computePlatformAnalytics(students = null) {
  const list = students || getRegisteredStudents();
  const totalStudents = list.length;
  const completedStudentsList = list.filter(s => Boolean(s.completedAt) || (s.completedStages && s.completedStages.length === 6 && s.hasCertificate));
  const completedCount = completedStudentsList.length;

  // حساب متوسط الأيام للإتمام
  const daysList = completedStudentsList
    .map(s => s.daysToComplete || calculateDaysBetween(s.registeredAt, s.completedAt))
    .filter(d => typeof d === 'number' && d > 0);

  const avgDaysToComplete = daysList.length > 0 
    ? (daysList.reduce((acc, d) => acc + d, 0) / daysList.length).toFixed(1)
    : 0;

  // حساب متوسط درجات الاختبارات
  let totalScoreSum = 0;
  let totalScoreCount = 0;
  list.forEach(s => {
    Object.values(s.quizScores || {}).forEach(score => {
      totalScoreSum += score;
      totalScoreCount += 1;
    });
  });
  const avgQuizScore = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 0;

  // نسبة اجتياز كل مرحلة
  const stageStats = [1, 2, 3, 4, 5, 6].map(stageId => {
    const passedCount = list.filter(s => (s.completedStages || []).includes(stageId)).length;
    const stageScores = list.map(s => s.quizScores?.[`quiz-stage-${stageId}`]).filter(val => typeof val === 'number');
    const avgScore = stageScores.length > 0 ? Math.round(stageScores.reduce((a, b) => a + b, 0) / stageScores.length) : 0;

    return {
      stageId,
      passedCount,
      passRate: totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0,
      avgScore
    };
  });

  return {
    totalStudents,
    completedCount,
    completionRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
    avgDaysToComplete,
    avgQuizScore,
    certificatesIssued: list.filter(s => s.hasCertificate).length,
    stageStats,
    studentsList: list
  };
}

/**
 * تصدير البيانات بصيغة CSV للتنزيل المباشر
 */
export function exportStudentsToCSV(students = null) {
  const list = students || getRegisteredStudents();
  const headers = [
    'كود الطالب',
    'الاسم',
    'المدرسة',
    'الأفتار',
    'تاريخ التسجيل',
    'آخر ظهور',
    'تاريخ الإتمام',
    'عدد الأيام للإتمام',
    'المراحل المكتملة',
    'متوسط الدرجات',
    'حاصل على الشهادة'
  ];

  const rows = list.map(s => {
    const scores = Object.values(s.quizScores || {});
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const days = s.completedAt ? (s.daysToComplete || calculateDaysBetween(s.registeredAt, s.completedAt)) : 'قيد التعلم';

    return [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.school || ''}"`,
      `"${s.avatar || ''}"`,
      `"${s.registeredAt ? new Date(s.registeredAt).toLocaleDateString('ar-EG') : ''}"`,
      `"${s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString('ar-EG') : ''}"`,
      `"${s.completedAt ? new Date(s.completedAt).toLocaleDateString('ar-EG') : 'لم يكتمل بعد'}"`,
      `"${days}"`,
      `"${(s.completedStages || []).length} من 6"`,
      `"${avgScore}%"`,
      `"${s.hasCertificate ? 'نعم' : 'لا'}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `mathverse5_students_analytics_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
