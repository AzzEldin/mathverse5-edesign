/**
 * src/utils/analyticsTracker.js
 * مدير التتبع والإحصائيات وتحليل سجل استخدام الطلاب لمنصة MathVerse 5
 */

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
 * بيانات تجريبية افتراضية لعرض لوحة التحكم بشكل ثري وفوري
 */
const DEFAULT_DEMO_STUDENTS = [
  {
    id: 'demo-std-1',
    name: 'محمود عز الدين',
    school: 'مدرسة المنال الابتدائية',
    avatar: '🚀',
    registeredAt: '2026-11-15T09:30:00.000Z',
    lastActiveAt: '2026-11-18T14:20:00.000Z',
    completedAt: '2026-11-18T14:20:00.000Z',
    daysToComplete: 3,
    completedStages: [1, 2, 3, 4, 5, 6],
    quizScores: {
      'quiz-stage-1': 100,
      'quiz-stage-2': 95,
      'quiz-stage-3': 100,
      'quiz-stage-4': 90,
      'quiz-stage-5': 95,
      'quiz-stage-6': 100,
      'final-exam': 100
    },
    hasCertificate: true,
    activityLog: [
      { event: 'تسجيل حساب جديد', timestamp: '2026-11-15T09:30:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 1 (100%)', timestamp: '2026-11-15T11:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 2 (95%)', timestamp: '2026-11-16T10:15:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 3 (100%)', timestamp: '2026-11-16T16:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 4 (90%)', timestamp: '2026-11-17T12:30:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 5 (95%)', timestamp: '2026-11-17T18:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 6 (100%)', timestamp: '2026-11-18T13:00:00.000Z' },
      { event: 'اجتياز الامتحان النهائي والحصول على الشهادة 🏆', timestamp: '2026-11-18T14:20:00.000Z' }
    ]
  },
  {
    id: 'demo-std-2',
    name: 'سارة أحمد ممدوح',
    school: 'مدرسة الأمل الرسمية',
    avatar: '🌟',
    registeredAt: '2026-11-14T08:00:00.000Z',
    lastActiveAt: '2026-11-19T17:45:00.000Z',
    completedAt: '2026-11-19T17:45:00.000Z',
    daysToComplete: 5,
    completedStages: [1, 2, 3, 4, 5, 6],
    quizScores: {
      'quiz-stage-1': 90,
      'quiz-stage-2': 85,
      'quiz-stage-3': 95,
      'quiz-stage-4': 85,
      'quiz-stage-5': 90,
      'quiz-stage-6': 95,
      'final-exam': 92
    },
    hasCertificate: true,
    activityLog: [
      { event: 'تسجيل حساب جديد', timestamp: '2026-11-14T08:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 1 (90%)', timestamp: '2026-11-14T15:20:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 2 (85%)', timestamp: '2026-11-16T11:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 3 (95%)', timestamp: '2026-11-17T14:10:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 4 (85%)', timestamp: '2026-11-18T09:30:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 5 (90%)', timestamp: '2026-11-18T16:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 6 (95%)', timestamp: '2026-11-19T15:30:00.000Z' },
      { event: 'اجتياز الامتحان النهائي ونيل شهادة الإتقان 📜', timestamp: '2026-11-19T17:45:00.000Z' }
    ]
  },
  {
    id: 'demo-std-3',
    name: 'يوسف كريم إبراهيم',
    school: 'مدرسة النيل الابتدائية',
    avatar: '🦁',
    registeredAt: '2026-11-18T11:20:00.000Z',
    lastActiveAt: '2026-11-20T19:10:00.000Z',
    completedAt: null,
    daysToComplete: null,
    completedStages: [1, 2, 3],
    quizScores: {
      'quiz-stage-1': 95,
      'quiz-stage-2': 90,
      'quiz-stage-3': 85
    },
    hasCertificate: false,
    activityLog: [
      { event: 'تسجيل حساب جديد', timestamp: '2026-11-18T11:20:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 1 (95%)', timestamp: '2026-11-18T16:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 2 (90%)', timestamp: '2026-11-19T13:40:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 3 (85%)', timestamp: '2026-11-20T19:10:00.000Z' }
    ]
  },
  {
    id: 'demo-std-4',
    name: 'مريم طارق عبد الرحمن',
    school: 'مدرسة رواد المستقبل',
    avatar: '🧠',
    registeredAt: '2026-11-19T14:00:00.000Z',
    lastActiveAt: '2026-11-21T01:30:00.000Z',
    completedAt: null,
    daysToComplete: null,
    completedStages: [1, 2],
    quizScores: {
      'quiz-stage-1': 100,
      'quiz-stage-2': 100
    },
    hasCertificate: false,
    activityLog: [
      { event: 'تسجيل حساب جديد', timestamp: '2026-11-19T14:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 1 (100%)', timestamp: '2026-11-20T10:00:00.000Z' },
      { event: 'اجتياز اختبار المرحلة 2 (100%)', timestamp: '2026-11-21T01:30:00.000Z' }
    ]
  }
];

/**
 * جلب قائمة الطلاب المسجلين
 */
export function getRegisteredStudents() {
  try {
    const raw = localStorage.getItem(STUDENTS_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading students registry:", e);
  }
  return DEFAULT_DEMO_STUDENTS;
}

/**
 * حفظ قائمة الطلاب المسجلين
 */
export function saveRegisteredStudents(studentsList) {
  try {
    localStorage.setItem(STUDENTS_REGISTRY_KEY, JSON.stringify(studentsList));
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
export const DEFAULT_ADMIN_KEY = "edesign_admin_2027";
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
      // إذا كانت السجلات حقيقية من الشيت، نحفظها محلياً لمزامنة الأجهزة
      if (data.students.length > 0) {
        saveRegisteredStudents(data.students);
      }
      return { success: true, count: data.count, students: data.students };
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
