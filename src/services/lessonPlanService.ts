import type {
  LessonPlan,
  LessonPlanGenerationRequest,
  LessonPlanGenerationResponse,
  LessonPlanTemplate
} from '../types/lessonPlan.types';
import { GoogleGenAI, Type } from '@google/genai';
import {
  classifyError,
  logError,
  getUserFriendlyMessage,
  withCircuitBreaker
} from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { lessonPlanCache } from './aiCacheService';

const ai = new GoogleGenAI({
  apiKey: (import.meta.env.VITE_GEMINI_API_KEY as string) || ''
});

const MODEL = 'gemini-2.5-flash';

export async function generateLessonPlan(
  request: LessonPlanGenerationRequest
): Promise<LessonPlanGenerationResponse> {
  const cacheKey = {
    operation: 'lessonPlan',
    input: JSON.stringify(request),
    model: MODEL
  };

  const cachedPlan = lessonPlanCache.get<LessonPlan>(cacheKey);
  if (cachedPlan) {
    logger.debug('Returning cached lesson plan');
    return { success: true, lessonPlan: cachedPlan };
  }

  const prompt = buildLessonPlanPrompt(request);

  try {
    const response = await withCircuitBreaker(async () => {
      return await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: lessonPlanSchema,
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
    });

    const jsonText = (response.text || '').trim();
    const lessonPlan = JSON.parse(jsonText) as LessonPlan;

    lessonPlan.id = `lesson_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    lessonPlan.createdAt = new Date().toISOString();
    lessonPlan.updatedAt = new Date().toISOString();
    lessonPlan.createdBy = 'AI';

    lessonPlanCache.set(cacheKey, lessonPlan);

    logger.info('Lesson plan generated successfully', {
      subject: request.subject,
      topic: request.topic
    });

    return {
      success: true,
      lessonPlan,
      suggestions: [
        'Review and customize the lesson plan for your specific class needs',
        'Adjust timing based on your students\' pace',
        'Add real-world examples relevant to your students'
      ]
    };
  } catch (error) {
    const classifiedError = classifyError(error, {
      operation: 'generateLessonPlan',
      timestamp: Date.now()
    });
    logError(classifiedError);

    const userMessage = getUserFriendlyMessage(classifiedError);
    return {
      success: false,
      error: userMessage === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
        ? 'Gagal membuat rencana pembelajaran. Silakan coba lagi dengan topik yang lebih spesifik.'
        : userMessage
    };
  }
}

function buildLessonPlanPrompt(request: LessonPlanGenerationRequest): string {
  const {
    subject,
    grade,
    topic,
    duration,
    learningObjectives,
    studentLevel,
    specialRequirements,
    includeMaterials,
    includeHomework
  } = request;

  return `
Anda adalah asisten pembuatan Rencana Pembelajaran (Lesson Plan) profesional untuk sekolah MA Malnu Kananga di Indonesia.

TUGAS:
Buatkan rencana pembelajaran yang komprehensif dalam Bahasa Indonesia dengan detail berikut:

INFORMASI DASAR:
- Mata Pelajaran: ${subject}
- Kelas: ${grade}
- Topik: ${topic}
- Durasi: ${duration} menit
- Tingkat Siswa: ${studentLevel || 'intermediate'}

TUJUAN PEMBELAJARAN:
${learningObjectives && learningObjectives.length > 0
    ? learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')
    : 'Buatkan 3-4 tujuan pembelajaran yang relevan dengan topik ini'}

${specialRequirements && specialRequirements.length > 0
    ? `REQUIREMENT KHUSUS:\n${specialRequirements.map(req => `- ${req}`).join('\n')}\n`
    : ''}

PERSYARATAN OUTPUT:
1. Struktur JSON harus valid dan lengkap
2. Gunakan Bahasa Indonesia yang baku
3. Aktivitas pembelajaran harus interaktif dan melibatkan siswa
4. Sertakan metode penilaian yang sesuai
${includeMaterials ? '5. Sertakan daftar materi/bahan yang dibutuhkan\n' : ''}
${includeHomework ? '6. Sertakan tugas rumah yang relevan\n' : ''}
7. Estimasi durasi untuk setiap aktivitas harus sesuai dengan total waktu ${duration} menit

FORMAT JSON:
Pastikan output mengikuti struktur JSON yang diminta dengan tipe data yang benar.
`;
}

const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Judul rencana pembelajaran'
    },
    subject: {
      type: Type.STRING,
      description: 'Mata pelajaran'
    },
    grade: {
      type: Type.STRING,
      description: 'Kelas'
    },
    topic: {
      type: Type.STRING,
      description: 'Topik utama'
    },
    objectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Tujuan pembelajaran (3-4 tujuan)'
    },
    materials: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Bahan dan alat yang dibutuhkan'
    },
    duration: {
      type: Type.NUMBER,
      description: 'Durasi total dalam menit'
    },
    activities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          duration: { type: Type.NUMBER },
          type: {
            type: Type.STRING,
            enum: ['introduction', 'main', 'group-work', 'discussion', 'individual', 'conclusion']
          },
          materials: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true
          }
        },
        required: ['name', 'description', 'duration', 'type']
      },
      description: 'Daftar aktivitas pembelajaran'
    },
    assessment: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          enum: ['formative', 'summative']
        },
        method: { type: Type.STRING },
        criteria: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        rubric: {
          type: Type.STRING,
          nullable: true
        }
      },
      required: ['type', 'method', 'criteria']
    },
    homework: {
      type: Type.STRING,
      nullable: true,
      description: 'Tugas rumah (opsional)'
    },
    notes: {
      type: Type.STRING,
      nullable: true,
      description: 'Catatan tambahan untuk guru'
    }
  },
  required: ['title', 'subject', 'grade', 'topic', 'objectives', 'duration', 'activities', 'assessment']
};

export const defaultLessonPlanTemplates: LessonPlanTemplate[] = [
  {
    id: 'template_1',
    name: 'Metode Pembelajaran Langsung',
    description: 'Template untuk pembelajaran langsung dengan eksplisit',
    subject: undefined,
    grade: undefined,
    structure: {
      activities: [
        {
          name: 'Pendahuluan',
          description: 'Apersepsi dan motivasi siswa',
          duration: 10,
          type: 'introduction'
        },
        {
          name: 'Penyajian Materi',
          description: 'Guru menjelaskan materi secara sistematis',
          duration: 30,
          type: 'main'
        },
        {
          name: 'Latihan Terbimbing',
          description: 'Siswa berlatih dengan bimbingan guru',
          duration: 20,
          type: 'individual'
        },
        {
          name: 'Penutup',
          description: 'Refleksi dan rangkuman materi',
          duration: 5,
          type: 'conclusion'
        }
      ],
      assessmentType: 'formative'
    },
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template_2',
    name: 'Pembelajaran Kooperatif',
    description: 'Template untuk pembelajaran berbasis kelompok',
    subject: undefined,
    grade: undefined,
    structure: {
      activities: [
        {
          name: 'Pendahuluan',
          description: 'Membangun minat dan motivasi',
          duration: 10,
          type: 'introduction'
        },
        {
          name: 'Diskusi Kelompok',
          description: 'Siswa bekerja dalam kelompok kecil',
          duration: 25,
          type: 'group-work'
        },
        {
          name: 'Presentasi Kelompok',
          description: 'Setiap kelompok mempresentasikan hasil',
          duration: 20,
          type: 'discussion'
        },
        {
          name: 'Refleksi dan Penutup',
          description: 'Evaluasi dan rangkuman bersama',
          duration: 10,
          type: 'conclusion'
        }
      ],
      assessmentType: 'formative'
    },
    isDefault: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'template_3',
    name: 'Pembelajaran Berbasis Proyek',
    description: 'Template untuk pembelajaran dengan pendekatan proyek',
    subject: undefined,
    grade: undefined,
    structure: {
      activities: [
        {
          name: 'Orientasi Proyek',
          description: 'Penjelasan tujuan dan output proyek',
          duration: 15,
          type: 'introduction'
        },
        {
          name: 'Perencanaan Kelompok',
          description: 'Siswa merencanakan tugas dan pembagian peran',
          duration: 15,
          type: 'group-work'
        },
        {
          name: 'Eksekusi Proyek',
          description: 'Siswa mengerjakan proyek dengan bimbingan',
          duration: 30,
          type: 'group-work'
        },
        {
          name: 'Presentasi Hasil',
          description: 'Presentasi dan evaluasi proyek',
          duration: 15,
          type: 'discussion'
        },
        {
          name: 'Refleksi',
          description: 'Refleksi proses dan hasil pembelajaran',
          duration: 5,
          type: 'conclusion'
        }
      ],
      assessmentType: 'summative'
    },
    isDefault: false,
    createdAt: new Date().toISOString()
  }
];

export function getTemplateById(templateId: string): LessonPlanTemplate | undefined {
  return defaultLessonPlanTemplates.find(t => t.id === templateId);
}

export function getAllTemplates(): LessonPlanTemplate[] {
  return [...defaultLessonPlanTemplates];
}
