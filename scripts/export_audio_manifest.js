// scripts/export_audio_manifest.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STAGES_DATA } from '../src/data/curriculumData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tasks = [];

STAGES_DATA.forEach((stage) => {
  // 1. Lessons voiceScripts
  stage.lessons.forEach((lesson) => {
    tasks.push({
      key: `lesson-${stage.id}-${lesson.id}`,
      stageId: stage.id,
      lessonId: lesson.id,
      title: lesson.title,
      type: 'lesson',
      text: lesson.voiceScript,
      outputRelPath: `audio/lessons/${stage.id}_${lesson.id}.mp3`
    });

    // 2. Practice Tab Introductions
    tasks.push({
      key: `practice-${stage.id}-${lesson.id}`,
      stageId: stage.id,
      lessonId: lesson.id,
      title: lesson.title,
      type: 'practice',
      text: `والآن مع تبويب حل المسائل والتطبيقات النموذجية للدرس: ${lesson.title}. فكر في حل المسائل بنفسك، ثم اضغط على زر إظهار الحل للتحقق.`,
      outputRelPath: `audio/practice/${stage.id}_${lesson.id}.mp3`
    });
  });

  // 3. Stage Lab
  tasks.push({
    key: `lab-${stage.id}`,
    stageId: stage.id,
    type: 'lab',
    text: `أهلاً بك في المعمل البصري التفاعلي للمرحلة ${stage.id}: ${stage.title}. استكشف وجرّب المفاهيم بنفسك.`,
    outputRelPath: `audio/stages/lab_${stage.id}.mp3`
  });

  // 4. Video Station
  tasks.push({
    key: `video-${stage.id}`,
    stageId: stage.id,
    type: 'video',
    text: `والآن مع محطة الفيديو التفاعلي والشرح المرئي للمرحلة ${stage.id}. شاهد الشرح وأجب عن الأسئلة التفاعلية.`,
    outputRelPath: `audio/stages/video_${stage.id}.mp3`
  });

  // 5. Quiz Station
  tasks.push({
    key: `quiz-${stage.id}`,
    stageId: stage.id,
    type: 'quiz',
    text: `وصلت إلى المحطة الختامية! اختبر مهاراتك الآن في اختبار نهاية المرحلة للحصول على درجاتك والانتقال للمرحلة التالية.`,
    outputRelPath: `audio/stages/quiz_${stage.id}.mp3`
  });
});

const outputPath = path.join(__dirname, 'tts_tasks.json');
fs.writeFileSync(outputPath, JSON.stringify(tasks, null, 2), 'utf-8');

console.log(`✅ تم تصدير ${tasks.length} مهمة صوتية إلى: ${outputPath}`);
