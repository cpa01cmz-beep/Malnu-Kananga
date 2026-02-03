import { Type } from "@google/genai";
import type { StudyPlan } from '../../types';
import { getAIInstance, AI_MODELS } from './geminiClient';
import { analysisCache } from '../aiCacheService';
import {
  classifyError,
  logError,
  getUserFriendlyMessage,
  withCircuitBreaker
} from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

/**
 * Generate personalized study plan for a student
 */
export async function generateStudyPlan(
  studentData: {
    studentName: string;
    grades: Array<{ subject: string; score: number; grade: string; trend: string }>;
    attendance: { percentage: number; totalDays: number; present: number; absent: number };
    goals: Array<{ subject: string; targetGrade: string; deadline: string }>;
    subjects: Array<{ name: string; currentGrade: number }>;
  },
  durationWeeks: number = 4
): Promise<StudyPlan> {
  const cacheKey = {
    operation: 'studyPlanGeneration',
    input: JSON.stringify({ studentData, durationWeeks }),
    model: AI_MODELS.PRO_THINKING
  };

  const cachedPlan = analysisCache.get<StudyPlan>(cacheKey);
  if (cachedPlan) {
    logger.debug('Returning cached study plan');
    return cachedPlan;
  }

  const prompt = `
  Anda adalah asisten pembelajaran profesional. Buat rencana belajar personal yang efektif untuk siswa berikut.

  DATA SISWA:
  - Nama: ${studentData.studentName}
  - Jumlah mata pelajaran: ${studentData.grades.length}
  - Persentase kehadiran: ${studentData.attendance.percentage}% (${studentData.attendance.present}/${studentData.attendance.totalDays} hari)

  DATA AKADEMIK:
  ${studentData.grades.map(g => `- ${g.subject}: Nilai ${g.score} (${g.grade}), Tren: ${g.trend}`).join('\n')}

  TARGET PRESTASI (Goals):
  ${studentData.goals.length > 0 ? studentData.goals.map(g => `- ${g.subject}: Target ${g.targetGrade}, Deadline: ${g.deadline}`).join('\n') : 'Tidak ada target yang ditetapkan'}

  DURASI RENCANA:
  ${durationWeeks} minggu

  INSTRUKSI:
  1. Analisis data performa siswa dan buat rencana belajar yang personalized
  2. Prioritaskan mata pelajaran dengan nilai rendah atau yang memiliki target tinggi
  3. Buat jadwal belajar yang realistis dan dapat diterapkan
  4. Berikan rekomendasi studi yang spesifik dan praktis
  5. Fokus pada pemulihan dan peningkatan performa akademik

  FORMAT OUTPUT (JSON):
  {
    "title": "Judul Rencana Belajar yang Motivasi",
    "description": "Deskripsi singkat tentang rencana belajar dan fokus utama",
    "subjects": [
      {
        "subjectName": "Nama Mata Pelajaran",
        "currentGrade": 75,
        "targetGrade": "A",
        "priority": "high",
        "weeklyHours": 5,
        "focusAreas": ["area fokus 1", "area fokus 2"],
        "resources": ["sumber belajar 1", "sumber belajar 2"]
      }
    ],
    "schedule": [
      {
        "dayOfWeek": "Senin",
        "timeSlot": "15:00-16:00",
        "subject": "Matematika",
        "activity": "study",
        "duration": 60
      }
    ],
    "recommendations": [
      {
        "category": "study_tips",
        "title": "Judul Rekomendasi",
        "description": "Deskripsi detail tentang rekomendasi",
        "priority": 1
      }
    ]
  }

  KATEGORI PRIORITAS:
  - high: Nilai rendah (D/C) atau memiliki target tinggi
  - medium: Nilai sedang (B) atau ada improvement space
  - low: Nilai baik (A) atau sudah tercapai

  JENIS AKTIVITAS:
  - study: Belajar materi baru
  - practice: Latihan soal
  - review: Review materi
  - assignment: Pengerjaan tugas

  KATEGORI REKOMENDASI:
  - study_tips: Tips belajar umum
  - time_management: Manajemen waktu
  - subject_advice: Saran spesifik per mata pelajaran
  - general: Rekomendasi umum

  Pastikan output adalah JSON yang valid dan sesuai dengan schema di atas.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      subjects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subjectName: { type: Type.STRING },
            currentGrade: { type: Type.NUMBER },
            targetGrade: { type: Type.STRING },
            priority: { type: Type.STRING },
            weeklyHours: { type: Type.NUMBER },
            focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      schedule: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dayOfWeek: { type: Type.STRING },
            timeSlot: { type: Type.STRING },
            subject: { type: Type.STRING },
            activity: { type: Type.STRING },
            duration: { type: Type.NUMBER },
          },
        },
      },
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.NUMBER },
          },
        },
      },
    },
    required: ['title', 'description', 'subjects', 'schedule', 'recommendations'],
  };

  try {
    const response = await withCircuitBreaker(async () => {
      return await (await getAIInstance()).models.generateContent({
        model: AI_MODELS.PRO_THINKING,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });
    });

    const jsonText = (response.text || '').trim();
    const planData = JSON.parse(jsonText);

    const planId = `study_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (durationWeeks * 7));

    const studyPlan = {
      id: planId,
      studentId: studentData.studentName,
      studentName: studentData.studentName,
      ...planData,
      createdAt: new Date().toISOString(),
      validUntil: validUntil.toISOString(),
      status: 'active' as const,
    };

    analysisCache.set(cacheKey, studyPlan);

    return studyPlan;
  } catch (error) {
    const classifiedError = classifyError(error, {
      operation: 'generateStudyPlan',
      timestamp: Date.now()
    });
    logError(classifiedError);
    const message = getUserFriendlyMessage(classifiedError);
    throw new Error(message === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
      ? "Gagal membuat rencana belajar dengan AI. Silakan coba lagi."
      : message);
  }
}
