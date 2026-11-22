/**
 * MathVerse 5 - Google Apps Script Backend (Database Webhook)
 * =================================================================
 * سكريبت إدارة قاعدة بيانات الطلاب الآمن لمنصة MathVerse 5 عبر Google Sheets.
 * 
 * الميزات ومعايير الأمان والخصوصية:
 * 1. حماية كاملة وعدم التعقب: لا يتم تسجيل أو تتبع عناوين IP أو ملفات تعريف الارتباط أو معرفات الأجهزة (Zero Tracking).
 * 2. قراءة البيانات (GET) محمية برمز مرور سري خاص بالأدمن (ADMIN_SECRET_KEY) لمنع أي وصول غير مصرح به.
 * 3. تحديث فوري وسلس: يبحث عن الطالب لتحديث صفّه بدلاً من تكرار الصفوف، أو يضيف طالباً جديداً إذا لم يكن موجوداً.
 * 4. حساب أوقات التعلم وتخزين درجات كافة المراحل والامتحان النهائي.
 */

// رمز المرور السري الخاص بالأدمن (يمكنك تركه كما هو أو تغييره لرمز خاص بك)
const ADMIN_SECRET_KEY = "edesign_admin_25";

/**
 * دالة GET: مخصصة للوحة الأدمن الشخصية لقراءة السجلات المحمية
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const key = params.key || "";

    // التحقق من الصلاحية الأمنية
    if (key !== ADMIN_SECRET_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: "error", 
          message: "Unauthorized: Invalid Admin Key. Access Denied." 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Students") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", count: 0, students: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const students = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[1]) continue;

      const completedStages = row[9] ? String(row[9]).split(",").map(Number).filter(Boolean) : [];
      const hasCert = String(row[18]).toLowerCase() === "نعم" || row[18] === true;

      students.push({
        id: String(row[0]),
        name: String(row[1]),
        school: String(row[2] || "الصف الخامس"),
        avatar: String(row[3] || "🚀"),
        registeredAt: row[4] ? String(row[4]) : "",
        lastActiveAt: row[5] ? String(row[5]) : "",
        completedAt: row[6] ? String(row[6]) : null,
        daysToComplete: row[7] ? Number(row[7]) : null,
        completedStagesCount: Number(row[8] || completedStages.length),
        completedStages: completedStages,
        avgQuizScore: Number(row[10] || 0),
        quizScores: {
          "quiz-stage-1": Number(row[11] || 0),
          "quiz-stage-2": Number(row[12] || 0),
          "quiz-stage-3": Number(row[13] || 0),
          "quiz-stage-4": Number(row[14] || 0),
          "quiz-stage-5": Number(row[15] || 0),
          "quiz-stage-6": Number(row[16] || 0),
          "final-exam": Number(row[17] || 0)
        },
        hasCertificate: hasCert,
        lastEvent: String(row[19] || "")
      });
    }

    // فرز الطلاب تنازلياً حسب أعلى متوسط درجات
    students.sort((a, b) => {
      const scoreA = Number(a.avgQuizScore) || 0;
      const scoreB = Number(b.avgQuizScore) || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.completedStagesCount || 0) - (a.completedStagesCount || 0);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "success", 
        count: students.length, 
        students: students 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

/**
 * دالة POST: مخصصة لاستقبال تسجيلات الطلاب واجتياز الاختبارات وتخزينها في الشيت
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // قفل متزامن لمدة تصل إلى 20 ثانية لمنع تكرار السجلات عند وصول طلبين معاً
    lock.waitLock(20000);

    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const student = payload.student || payload;
    if (!student || !student.name) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "ignored", message: "No student name provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Students") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();

    const studentId = String(student.id || ("std_" + Date.now()));
    const studentName = String(student.name).trim();
    const studentSchool = String(student.school || "الصف الخامس الابتدائي").trim();
    const avatar = String(student.avatar || "🚀");
    const registeredAt = student.registeredAt || new Date().toISOString();
    const lastActiveAt = new Date().toISOString();
    const completedAt = student.completedAt || "";
    const daysToComplete = student.daysToComplete || "";
    const completedStages = Array.isArray(student.completedStages) ? student.completedStages : [];
    const completedCount = completedStages.length;
    const completedStagesStr = completedStages.join(",");

    const quizScores = student.quizScores || {};
    const scoresArr = Object.values(quizScores).filter(v => typeof v === "number" && v > 0);
    const avgScore = scoresArr.length > 0 ? Math.round(scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length) : 0;

    const s1 = quizScores["quiz-stage-1"] || "";
    const s2 = quizScores["quiz-stage-2"] || "";
    const s3 = quizScores["quiz-stage-3"] || "";
    const s4 = quizScores["quiz-stage-4"] || "";
    const s5 = quizScores["quiz-stage-5"] || "";
    const s6 = quizScores["quiz-stage-6"] || "";
    const finalScore = quizScores["final-exam"] || quizScores["final-mastery-exam"] || "";
    const hasCert = (student.hasCertificate || Boolean(completedAt) || (completedCount === 6 && Boolean(finalScore))) ? "نعم" : "لا";
    const lastEvent = payload.event || student.lastEvent || "تحديث النشاط";

    // فحص ما إذا كان الطالب مسجلاً مسبقاً للقيام بالتحديث بدلاً من التكرار
    let foundRow = -1;
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][0]).trim() === studentId || String(data[r][1]).trim() === studentName) {
        foundRow = r + 1; // 1-based index
        break;
      }
    }

    const rowValues = [
      studentId,
      studentName,
      studentSchool,
      avatar,
      registeredAt,
      lastActiveAt,
      completedAt,
      daysToComplete,
      completedCount,
      completedStagesStr,
      avgScore,
      s1,
      s2,
      s3,
      s4,
      s5,
      s6,
      finalScore,
      hasCert,
      lastEvent
    ];

    if (foundRow > 0) {
      sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: "success", 
        action: foundRow > 0 ? "updated" : "inserted",
        studentId: studentId 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}
