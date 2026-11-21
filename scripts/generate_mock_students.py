# -*- coding: utf-8 -*-
import json
import random
from datetime import datetime, timedelta

boy_names = [
    "أحمد محمود عز الدين", "يوسف كريم إبراهيم", "عمر شريف حسني", "زياد طارق عبد الرحمن", 
    "حمزة مصطفى كامل", "كريم إيهاب توفيق", "باسل عمرو الشناوي", "مصطفى خالد عبد الله",
    "آسر محمد غنيم", "علي حسن البنا", "ياسين هشام ممدوح", "مروان تامر الجوهري",
    "سيف الدين وائل", "أنس هيثم درويش", "بلال علاء النجار", "عبد الرحمن أشرف",
    "مالك رامي فوزي", "معاذ أحمد صبري", "حازم مجدي ياقوت", "إياد هاني البدري",
    "يحيى سامح دياب", "ياسر عادل منصور", "سليم حسام الدين", "عصام فادي البرنس",
    "آدم شادي رزق", "عمار ياسر الشافعي", "شريف نبيل زكي", "رامي وفيق عزمي",
    "إبراهيم جلال متولي", "حميد عماد سالم", "فارس باسم غالي", "مؤمن رفعت شاهين",
    "طارق رضوان حمودة", "محمود وجدي لطفي", "نادر سعيد البحيري", "صلاح سمير عبد الحليم",
    "مازن بهاء الدين", "عز الدين أسامة", "حسام جمال خليل", "فهد وليد مرسي",
    "سامر كمال الهواري", "خالد أيمن الجندي", "وليد رشاد قاسم", "تيمور مروان السويدي",
    "أيمن زكريا قطب", "ضياء عبد العزيز", "فادي صابر الديب", "أشرف ماجد النحاس",
    "تامر صبحي علام", "مكرم فؤاد الباشا"
]

girl_names = [
    "سلمى أحمد فؤاد", "مريم طارق عبد الرحمن", "ملك محمود مصطفى", "فريدة كريم الألفي",
    "نور الهدى إبراهيم", "جنى سامح الشريف", "خديجة وليد سليمان", "رقية حسام الدين",
    "لينا ياسر البغدادي", "حلا تامر العسقلاني", "ليلى عصام غراب", "حبيبة أيمن شكري",
    "ريتاج شريف حمزة", "كنزي رامي القاضي", "ندى مجدي الصاوي", "روان هاني عثمان",
    "شهد عادل الباز", "كارما شادي المهدى", "تسنيم وائل مهران", "سارة هيثم الخولي",
    "هنا علاء رضوان", "نادين أشرف بركات", "فريدة معتز زهران", "بسملة إيهاب زايد",
    "زينة حازم العبد", "تمارا نادر عبد ربه", "يمنى سامر عطية", "داليا باسم فرحات",
    "سدرة حسام عمارة", "تاليا شريف يونس", "فرح كمال الأزهري", "ميرنا فادي الشوبكي",
    "علياء ممدوح زاهر", "سلمى رضوان جابر", "سيرين سعيد عيسى", "نوران بهاء حجازي",
    "جميلة عز الدين", "أروى جمال غيث", "مهجة وليد نصار", "هادية صابر الحفني",
    "ناردين مكرم عبيد", "يارا طارق البيطار", "روان خالد بسيوني", "نهى عماد الشاذلي",
    "سندس هاني الجزار", "تقى أحمد الفقي", "ريم علاء الدين", "منة الله تامر",
    "شروق حازم غانم", "دنيا مصطفى الشرقاوي"
]

schools = [
    "مدرسة المنار الابتدائية", "مدرسة النيل المصرية الدولية", "مدرسة رواد المستقبل الابتدائية",
    "مدرسة الأمل الرسمية المتميزة", "مدرسة طيبة المتكاملة للغات", "مدرسة سعد زغلول الابتدائية",
    "مدرسة الفيروز الابتدائية", "مدرسة الشروق الرسمية", "مدرسة الدلتا لغات",
    "مدرسة الإسكندرية التجريبية", "مدرسة الزهور الابتدائية", "مدرسة الشهيد أحمد عرابي",
    "مدرسة الفاروق الإسلامية للغات", "مدرسة طه حسين الابتدائية", "مدرسة طلائع المستقبل",
    "مدرسة الحرية الابتدائية", "مدرسة النزهة للغات", "مدرسة بدر الابتدائية",
    "مدرسة الأهرام الرسمية", "مدرسة المنصورة الحديثة", "مدرسة التحرير الابتدائية",
    "مدرسة قصر النيل النموذجية", "مدرسة الفتح الابتدائية", "مدرسة النصر التجريبية"
]

avatars = ["🚀", "🦁", "🧠", "⭐", "🎯", "💡", "👑", "🎨", "⚡", "🏆", "🦊", "🐬", "🦉", "🐯", "🔥", "🎓", "🌟", "🦄", "🐼", "🤖"]

all_names = []
for i in range(50):
    all_names.append((boy_names[i], "boy"))
    all_names.append((girl_names[i], "girl"))

random.seed(42)
random.shuffle(all_names)

stage_counts = [28, 28, 18, 14, 5, 3, 4]
stages_assigned = []
for stage_num, count in enumerate(stage_counts):
    stages_assigned.extend([stage_num] * count)

base_date = datetime(2026, 11, 21, 12, 0, 0)

stage_names_map = {
    1: "المرحلة 1: الكسور العشرية والقيمة المكانية",
    2: "المرحلة 2: جمع وطرح الكسور العشرية",
    3: "المرحلة 3: ضرب وقسمة الكسور العشرية",
    4: "المرحلة 4: مساحة المستطيل والأعداد الصحيحة",
    5: "المرحلة 5: خوارزمية القسمة المطولة",
    6: "المرحلة 6: العمليات الحسابية المتعددة والأنماط"
}

students = []

for idx in range(100):
    name, gender = all_names[idx]
    stage_level = stages_assigned[idx]
    school = random.choice(schools)
    avatar = random.choice(avatars)
    
    days_ago = random.randint(1, 16) if stage_level == 0 else random.randint(max(2, stage_level * 2), 16)
    reg_date = base_date - timedelta(days=days_ago, hours=random.randint(0, 18), minutes=random.randint(0, 59))
    
    active_days_after = random.randint(0, days_ago)
    active_date = reg_date + timedelta(days=active_days_after, hours=random.randint(1, 10), minutes=random.randint(0, 59))
    if active_date > base_date:
        active_date = base_date - timedelta(minutes=random.randint(10, 300))
        
    completed_stages = list(range(1, stage_level + 1))
    
    quiz_scores = {}
    activity_log = [
        {"event": "تسجيل حساب جديد بالمنصة 🚀", "timestamp": reg_date.isoformat() + "Z"}
    ]
    
    curr_time = reg_date
    for s in completed_stages:
        score = random.choice([80, 85, 90, 95, 100, 100])
        quiz_scores[f"quiz-stage-{s}"] = score
        curr_time += timedelta(hours=random.randint(6, 28), minutes=random.randint(5, 50))
        if curr_time > base_date:
            curr_time = base_date - timedelta(hours=random.randint(1, 12))
        activity_log.append({
            "event": f"اجتياز اختبار {stage_names_map[s]} بنتيجة ({score}%)",
            "timestamp": curr_time.isoformat() + "Z"
        })
        
    has_cert = (stage_level == 6)
    completed_at = None
    days_to_complete = None
    
    if has_cert:
        final_score = random.choice([90, 95, 100, 100])
        quiz_scores["final-exam"] = final_score
        curr_time += timedelta(hours=random.randint(4, 12))
        if curr_time > base_date:
            curr_time = base_date - timedelta(hours=1)
        completed_at = curr_time.isoformat() + "Z"
        activity_log.append({
            "event": f"اجتياز الامتحان النهائي الشامل ({final_score}%) ونيل شهادة الإتقان المعتمدة 📜🏆",
            "timestamp": completed_at
        })
        days_to_complete = max(1, (curr_time - reg_date).days)
        active_date = curr_time
        
    students.append({
        "id": f"std-mock-{idx+1:03d}",
        "name": name,
        "school": school,
        "avatar": avatar,
        "registeredAt": reg_date.isoformat() + "Z",
        "lastActiveAt": active_date.isoformat() + "Z",
        "completedAt": completed_at,
        "daysToComplete": days_to_complete,
        "completedStages": completed_stages,
        "quizScores": quiz_scores,
        "hasCertificate": has_cert,
        "activityLog": activity_log
    })

students.sort(key=lambda x: (
    1 if x["hasCertificate"] else 0,
    len(x["completedStages"]),
    x["registeredAt"]
), reverse=True)

# 1. Write src/data/mockStudents.js (ES Module)
js_esm = f"""/**
 * قاعدة بيانات العينات التوضيحية (100 طالب في مراحل متفاوتة - معظمها في البدايات)
 * منصة MathVerse 5 - الصف الخامس الابتدائي
 * تطوير: eDesign Agency
 */

export const MOCK_STUDENTS_100 = {json.dumps(students, ensure_ascii=False, indent=2)};
"""
with open(r"c:\Users\Ezz\MyFile\projects\Mody\Math\src\data\mockStudents.js", "w", encoding="utf-8") as f:
    f.write(js_esm)

# 2. Write public/mockStudents.js (Browser Global for admin.html)
js_browser = f"""/**
 * Browser-global mock students registry for admin dashboard
 */
window.MOCK_STUDENTS_100 = {json.dumps(students, ensure_ascii=False)};
"""
with open(r"c:\Users\Ezz\MyFile\projects\Mody\Math\public\mockStudents.js", "w", encoding="utf-8") as f:
    f.write(js_browser)

print("Generated both src/data/mockStudents.js and public/mockStudents.js successfully!")
