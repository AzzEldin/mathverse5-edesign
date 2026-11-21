# -*- coding: utf-8 -*-
"""
scripts/generate_audio_silma.py
سكريبت توليد وحفظ التعليقات والشروحات الصوتية لمنصة eDesign MathVerse 5
باستخدام نموذج Silma TTS المثبت محلياً على الجهاز.
"""

import os
import re
import sys
import json
import time
import argparse
import subprocess
import soundfile as sf
import numpy as np

# 1. إعداد المسارات
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
PUBLIC_DIR = os.path.join(PROJECT_DIR, "public")
TASKS_FILE = os.path.join(SCRIPT_DIR, "tts_tasks.json")
MANIFEST_FILE = os.path.join(PROJECT_DIR, "src", "data", "audioManifest.json")

# إعدادات نموذج Silma TTS (يمكن تخصيص المسار عبر متغير البيئة SALMA_DIR)
SALMA_DIR = os.environ.get("SALMA_DIR", r"C:\Users\Ezz\MyFile\projects\salma")
REF_AUDIO = os.path.join(SALMA_DIR, "default_voice.wav")
REF_TEXT = "ويدقق النظر في القرآن الكريم وسائر الكتب السماوية ويتبع مسالك الرسل العظام عليهم الصلاة والسلام."

def clean_text_for_tts(text):
    """تنظيف وتجهيز النص العربي للنموذج الصوتي"""
    if not text:
        return ""
    text = re.sub(r'[=\-_*#~+]{2,}', ' ', text)
    text = re.sub(r'\[[\*!iI?xX\-]\]', ' ', text)
    text = re.sub(r'[\U00010000-\U0010ffff\u2600-\u27BF\u2300-\u23FF]', '', text)
    text = re.sub(r'([.،!؟؛:?])\1+', r'\1', text)
    text = re.sub(r'[\r\n]+', ' . ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def split_into_tts_sentences(text):
    """تقسيم النص إلى جمل منطقية للمزامنة والتوليد"""
    text = clean_text_for_tts(text)
    if not text:
        return []
    # التقسيم عند علامات الترقيم
    raw_parts = re.split(r'([.!؟])', text)
    sentences = []
    for i in range(0, len(raw_parts), 2):
        part = raw_parts[i].strip()
        punct = raw_parts[i+1].strip() if i+1 < len(raw_parts) else ""
        if part:
            full_s = f"{part}{punct}".strip()
            # تجنب المقاطع الشاذة التي لا تحتوي على أحرف عربية
            if re.search(r'[\u0600-\u06FFa-zA-Z0-9]', full_s):
                sentences.append(full_s)
    return sentences

def convert_wav_to_mp3(wav_path, mp3_path):
    """تحويل ملف WAV إلى MP3 عالي الجودة بحجم صغير عبر ffmpeg"""
    os.makedirs(os.path.dirname(mp3_path), exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-i", wav_path,
        "-codec:a", "libmp3lame", "-b:a", "128k", "-ar", "24000",
        mp3_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        raise RuntimeError(f"فشل تحويل الصوت عبر ffmpeg: {res.stderr.decode('utf-8', errors='ignore')}")

def load_silma_model():
    """تحميل كلاس نموذج Silma TTS في كرت الشاشة"""
    print("=" * 65)
    print("⏳ جاري تحميل نموذج Silma TTS على كرت الشاشة...")
    try:
        from silma_tts.api import SilmaTTS
        tts = SilmaTTS()
        infer_fn = tts.infer
        print("✅ تم تحميل نموذج SilmaTTS بنجاح!")
        return infer_fn
    except Exception as e:
        print(f"⚠️ تنبيه: فشل استدعاء SilmaTTS ({e})، جاري المحاولة عبر utils_infer...")
        from silma_tts.infer.utils_infer import infer
        return infer

def main():
    parser = argparse.ArgumentParser(description="توليد الشروحات الصوتية عبر Silma TTS")
    parser.add_argument("--tasks", type=str, default=TASKS_FILE, help="مسار ملف المهام")
    parser.add_argument("--sample", action="store_true", help="توليد الدرس الأول فقط كعينة تجريبية")
    parser.add_argument("--stage", type=int, help="توليد دروس مرحلة محددة فقط (1-6)")
    parser.add_argument("--key", type=str, help="توليد مهمة محددة عبر المفتاح")
    parser.add_argument("--force", action="store_true", help="إعادة توليد الملفات حتى لو كانت موجودة")
    args = parser.parse_args()

    tasks_path = args.tasks
    if not os.path.exists(tasks_path):
        tasks_path = os.path.join(SCRIPT_DIR, args.tasks)
    if not os.path.exists(tasks_path):
        print(f"❌ لم يتم العثور على ملف المهام: {tasks_path}")
        sys.exit(1)

    with open(tasks_path, "r", encoding="utf-8") as f:
        tasks = json.load(f)

    # تصفية المهام وفق الخيارات
    if args.sample:
        tasks = [t for t in tasks if t["key"] == "lesson-1-1-1"]
        print("🎯 تم اختيار نمط العينة التجريبية (الدرس 1-1 من المرحلة الأولى فقط).")
    elif args.stage:
        tasks = [t for t in tasks if t.get("stageId") == args.stage]
        print(f"🎯 تم اختيار المرحلة {args.stage} فقط ({len(tasks)} مهمة).")
    elif args.key:
        tasks = [t for t in tasks if t["key"] == args.key]
        print(f"🎯 تم اختيار المهمة: {args.key}")

    print(f"📋 إجمالي المهام المطلوب معالجتها: {len(tasks)}")

    # تحميل مانيفست الصوتيات الحالي
    manifest = {}
    if os.path.exists(MANIFEST_FILE):
        try:
            with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            manifest = {}

    # تحميل نموذج Silma
    infer_fn = load_silma_model()

    temp_wav = os.path.join(SCRIPT_DIR, "temp_render.wav")

    # معالجة المهام
    for t_idx, task in enumerate(tasks, 1):
        key = task["key"]
        rel_path = task["outputRelPath"]
        final_mp3 = os.path.join(PUBLIC_DIR, rel_path)

        # فحص هل تم التوليد مسبقاً
        if not args.force and os.path.exists(final_mp3) and key in manifest:
            print(f"⏩ [{t_idx}/{len(tasks)}] تم التخطي (موجود مسبقاً): {key}")
            continue

        print(f"\n🎙️ [{t_idx}/{len(tasks)}] جاري تسجيل: {task.get('title', key)} ({key})")
        sentences = split_into_tts_sentences(task["text"])
        if not sentences:
            sentences = [task["text"]]

        sentence_records = []
        combined_wavs = []
        current_time = 0.0
        sample_rate = 24000

        for s_idx, sentence in enumerate(sentences, 1):
            print(f"   ⚡ توليد الجملة ({s_idx}/{len(sentences)}): {sentence[:45]}...")
            t0 = time.time()
            try:
                wav, sr, _ = infer_fn(
                    ref_file=REF_AUDIO,
                    ref_text=REF_TEXT,
                    gen_text=sentence,
                    speed=1.0
                )
                cost = time.time() - t0
                sample_rate = sr
                dur = len(wav) / float(sr)

                # إضافة القليل من الصمت الطبيعي (0.15s) بين الجمل
                silence_samples = int(sr * 0.15)
                silence = np.zeros(silence_samples, dtype=wav.dtype)

                start_t = round(current_time, 2)
                end_t = round(current_time + dur, 2)
                current_time = round(current_time + dur + 0.15, 2)

                sentence_records.append({
                    "index": s_idx - 1,
                    "text": sentence,
                    "startTime": start_t,
                    "endTime": end_t,
                    "duration": round(dur, 2)
                })

                combined_wavs.append(wav)
                combined_wavs.append(silence)
                print(f"      ✓ اكتمل في {cost:.2f} ثانية | المدة: {dur:.2f} ثانية")

            except Exception as e:
                print(f"      ❌ خطأ في نطق الجملة {s_idx}: {e}")

        if not combined_wavs:
            print(f"❌ تعذر توليد أي مقطع صوتي للمهمة: {key}")
            continue

        # دمج المقاطع
        full_audio = np.concatenate(combined_wavs)
        total_duration = round(len(full_audio) / float(sample_rate), 2)

        # حفظ ملف WAV مؤقت
        sf.write(temp_wav, full_audio, sample_rate)

        # ضغط وتحويل إلى MP3
        convert_wav_to_mp3(temp_wav, final_mp3)

        # تحديث المانيفست
        manifest[key] = {
            "key": key,
            "title": task.get("title", key),
            "type": task.get("type", "lesson"),
            "url": f"/{rel_path}",
            "duration": total_duration,
            "sentences": sentence_records,
            "updatedAt": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        # حفظ المانيفست فورياً بعد كل مهمة للحفاظ على التقدم
        with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        file_size_kb = round(os.path.getsize(final_mp3) / 1024, 1)
        print(f"✅ تم حفظ الملف بنجاح: {rel_path} ({file_size_kb} KB | {total_duration} ثانية)")

    # تنظيف الملف المؤقت
    if os.path.exists(temp_wav):
        try:
            os.remove(temp_wav)
        except Exception:
            pass

    print("\n" + "=" * 65)
    print(f"🎉 اكتملت المهمة! إجمالي التسجيلات المتوفرة في المانيفست: {len(manifest)}")
    print(f"📁 مسار المانيفست: {MANIFEST_FILE}")
    print("=" * 65)

if __name__ == "__main__":
    main()
