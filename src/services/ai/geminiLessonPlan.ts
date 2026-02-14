import { Type } from "@google/genai";
import { getAIInstance, AI_MODELS } from './geminiClient';
import { analysisCache } from '../aiCacheService';
import { withCircuitBreaker } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { AI_CONFIG } from '../../constants';
import {
  getAIErrorMessage,
  AIOperationType,
  handleAIError
} from '../../utils/aiErrorHandler';

/**
 * Types for Lesson Plan Generator
 */
export interface LessonPlanSection {
  id: string;
  title: string;
  duration: number; // in minutes
  content: string;
  activities: string[];
  materials: string[];
  objectives: string[];
}

export interface LessonPlanAssessment {
  type: 'quiz' | 'assignment' | 'project' | 'presentation' | 'discussion';
  description: string;
  criteria: string[];
}

export interface LessonPlanResource {
  title: string;
  type: 'book' | 'video' | 'website' | 'worksheet' | 'slide';
  url?: string;
  description: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  topic: string;
  subtopics: string[];
  duration: number; // total minutes
  objectives: string[];
  competencies: string[];
  prerequisites: string[];
  sections: LessonPlanSection[];
  assessments: LessonPlanAssessment[];
  resources: LessonPlanResource[];
  teacherNotes: string;
  aiGenerated: boolean;
  aiConfidence?: number;
  createdAt: string;
}

export interface LessonPlanInput {
  subject: string;
  classLevel: string;
  topic: string;
  subtopics?: string[];
  duration?: number; // in minutes, default 90
  learningObjectives?: string[];
  includeAssessment?: boolean;
  includeResources?: boolean;
  includeTeacherNotes?: boolean;
}

export interface SubjectTemplate {
  id: string;
  name: string;
  competencies: string[];
  commonTopics: string[];
  teachingApproaches: string[];
  assessmentMethods: string[];
  resources: string[];
}

export interface CurriculumTemplate {
  id: string;
  name: string;
  description: string;
  classLevels: string[];
  subjects: string[];
  defaultDuration: number;
  sections: Array<{
    name: string;
    defaultDuration: number;
    activities: string[];
  }>;
  competencies: string[];
}

/**
 * Curriculum templates for different class levels
 */
export const CURRICULUM_TEMPLATES: CurriculumTemplate[] = [
  {
    id: 'kurikulum-merdeka',
    name: 'Kurikulum Merdeka',
    description: 'Kurikulum Merdeka belajar dengan fokus pada penguatan kompetensi dan karakter',
    classLevels: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
    subjects: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi', 'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'Seni', 'Pendidikan Jasmani'],
    defaultDuration: 90,
    sections: [
      { name: 'Pembukaan', defaultDuration: 10, activities: ['Apersepsi', 'Penyampaian tujuan pembelajaran', 'Motivasi'] },
      { name: ' Kegiatan Inti', defaultDuration: 60, activities: ['Eksplorasi', 'Elaborasi', 'Konfirmasi'] },
      { name: 'Penutup', defaultDuration: 20, activities: ['Rangkuman', 'Refleksi', 'Tindak lanjut'] }
    ],
    competencies: ['Pengetahuan', 'Keterampilan', 'Sikap']
  },
  {
    id: 'kurikulum-2013',
    name: 'Kurikulum 2013',
    description: 'Kurikulum 2013 dengan pendekatan ilmiah dan tematik',
    classLevels: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12'],
    subjects: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PKn', 'Seni', 'Pendidikan Jasmani', 'Agama'],
    defaultDuration: 90,
    sections: [
      { name: 'Pendahuluan', defaultDuration: 15, activities: ['apersepsi', 'pemotivasi', 'penyampaian KD'] },
      { name: 'Inti', defaultDuration: 60, activities: ['observasi', 'eksperimen', 'asosiasi', 'komunikasi'] },
      { name: 'Penutup', defaultDuration: 15, activities: ['kesimpulan', 'evaluasi', 'tindak lanjut'] }
    ],
    competencies: ['Sikap', 'Pengetahuan', 'Keterampilan']
  }
];

/**
 * Subject-specific templates
 */
export const SUBJECT_TEMPLATES: SubjectTemplate[] = [
  {
    id: 'math',
    name: 'Matematika',
    competencies: ['Pemahaman konsep', 'Penalaran matematis', 'Pemecahan masalah', 'Komunikasi matematis'],
    commonTopics: ['Aljabar', 'Geometri', 'Statistika', 'Trigonometri', 'Kalkulus'],
    teachingApproaches: ['Problem-based learning', 'Discovery learning', 'Kooperatif', 'Explicit instruction'],
    assessmentMethods: ['Tes tulis', 'Portsfolio', 'Proyek', 'Presentasi', 'Observasi'],
    resources: ['Buku teks', 'LKS', 'Software matematika', 'Video pembelajaran', 'Manipulatif']
  },
  {
    id: 'indonesian',
    name: 'Bahasa Indonesia',
    competencies: ['Memahami teks', 'Menulis kreatif', 'Berbicara', 'Mendengarkan'],
    commonTopics: ['Teks deskripsi', 'Teks narasi', 'Teks eksposisi', 'Teks argumentasi', 'Puisi', 'Cerpen', 'Novel'],
    teachingApproaches: ['Communicative approach', 'Genre-based approach', 'Task-based learning'],
    assessmentMethods: ['Tes literasi', 'Presentasi', 'Proyek menulis', 'Diskusi'],
    resources: ['Buku sastra', 'Koran', 'Majalah', 'Audiovisual', 'Bahan ajar digital']
  },
  {
    id: 'english',
    name: 'Bahasa Inggris',
    competencies: ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary'],
    commonTopics: ['Daily conversation', 'Grammar structures', 'Reading comprehension', 'Writing paragraphs', 'Presentations'],
    teachingApproaches: ['CLT (Communicative Language Teaching)', 'TPR', 'Total Physical Response', 'Task-based learning'],
    assessmentMethods: ['Speaking test', 'Writing test', 'Reading comprehension', 'Listening test'],
    resources: ['English textbook', 'Audio materials', 'Video', 'Online platforms', ' authentic materials']
  },
  {
    id: 'science',
    name: 'IPA (Sains)',
    competencies: ['Pengamatan', 'Hipotesis', 'Eksperimen', 'Analisis data', 'Kesimpulan'],
    commonTopics: ['Makhluk hidup', 'Materi dan perubahannya', 'Gaya dan gerak', 'Energi', 'Suhu dan kalor', 'Listrik dan magnet'],
    teachingApproaches: ['Scientific method', 'Inquiry-based learning', 'Demonstrasi', 'Eksperimen'],
    assessmentMethods: ['Tes teori', 'Laporan praktikum', 'Proyek sains', 'Presentasi'],
    resources: ['Buku IPA', 'Alat praktikum', 'Video eksperimen', 'Simulasi', '标本']
  },
  {
    id: 'social',
    name: 'IPS',
    competencies: ['Pemahaman sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'Analisis sosial'],
    commonTopics: ['Sejarah Indonesia', 'Geografi Indonesia', 'Perekonomian Indonesia', 'Masyarakat Indonesia'],
    teachingApproaches: ['Contextual teaching', 'Cooperative learning', 'Inquiry learning', 'Multimedia'],
    assessmentMethods: ['Tes tulis', 'Presentasi', 'Proyek', 'Diskusi', 'Kartu konsep'],
    resources: ['Buku IPS', 'Peta', 'Atlas', 'Video dokumenter', 'Bahan aktual']
  }
];

/**
 * Get subject template by name
 */
export function getSubjectTemplate(subjectName: string): SubjectTemplate | undefined {
  const normalized = subjectName.toLowerCase();
  return SUBJECT_TEMPLATES.find(t => 
    t.name.toLowerCase().includes(normalized) ||
    normalized.includes(t.id)
  );
}

/**
 * Get curriculum template by ID
 */
export function getCurriculumTemplate( curriculumId: string): CurriculumTemplate | undefined {
  return CURRICULUM_TEMPLATES.find(t => t.id === curriculumId);
}

/**
 * Generate lesson plan using Gemini API
 */
export async function generateLessonPlan(
  input: LessonPlanInput
): Promise<LessonPlan> {
  const cacheKey = {
    operation: 'lessonPlanGeneration',
    input: JSON.stringify({ input }),
    model: AI_MODELS.PRO_THINKING
  };

  const cachedPlan = analysisCache.get<LessonPlan>(cacheKey);
  if (cachedPlan) {
    logger.debug('Returning cached lesson plan');
    return cachedPlan;
  }

  const subjectTemplate = getSubjectTemplate(input.subject);
  const duration = input.duration || 90;
  
  const prompt = `
Anda adalah asisten guru profesional. Buat RENCANA PELAKSANAAN PEMBELAJARAN (RPP) yang komprehensif untuk mata pelajaran ${input.subject}.

DATA INPUT:
- Mata Pelajaran: ${input.subject}
- Tingkat Kelas: ${input.classLevel}
- Topik: ${input.topic}
- Subtopik: ${input.subtopics?.join(', ') || 'Tidak ada subtopik spesifik'}
- Durasi: ${duration} menit
- Sertakan asesmen: ${input.includeAssessment !== false ? 'Ya' : 'Tidak'}
- Sertakan sumber belajar: ${input.includeResources !== false ? 'Ya' : 'Tidak'}
- Sertakan catatan guru: ${input.includeTeacherNotes !== false ? 'Ya' : 'Tidak'}

${
  subjectTemplate ? `
INFORMASI TEMPLATE MATA PELAJARAN:
- Kompetensi: ${subjectTemplate.competencies.join(', ')}
- Topik umum: ${subjectTemplate.commonTopics.join(', ')}
- Pendekatan: ${subjectTemplate.teachingApproaches.join(', ')}
- Metode asesmen: ${subjectTemplate.assessmentMethods.join(', ')}
` : ''
}

INSTRUKSI:
1. Buat RPP lengkap dengan format yang sesuai standar kurikulum
2. Sertakan tujuan pembelajaran yang SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Buat kegiatan pembelajaran yang interaktif dan bervariasi
4. Sertakan metode dan model pembelajaran yang tepat
5. Gunakan bahasa Indonesia yang baik dan benar
6. Sesuaikan tingkat kesulitan dengan ${input.classLevel}

FORMAT OUTPUT (JSON):
{
  "id": "string unik",
  "title": "Judul RPP yang informatif",
  "subject": "${input.subject}",
  "classLevel": "${input.classLevel}",
  "topic": "${input.topic}",
  "subtopics": ["subtopik 1", "subtopik 2"],
  "duration": ${duration},
  "objectives": ["tujuan pembelajaran 1", "tujuan pembelajaran 2"],
  "competencies": ["kompetensi inti", "kompetensi dasar"],
  "prerequisites": ["pengetahuan prasyarat", "keterampilan prasyarat"],
  "sections": [
    {
      "id": "section-1",
      "title": "Nama Bagian (Pembukaan/Kegitan Inti/Penutup)",
      "duration": 10,
      "content": "Konten/detail kegiatan",
      "activities": ["aktivitas 1", "aktivitas 2"],
      "materials": ["materi 1", "materi 2"],
      "objectives": ["objektif bagian ini"]
    }
  ],
  "assessments": [
    {
      "type": "quiz/assignment/project/presentation/discussion",
      "description": "Deskripsi penilaian",
      "criteria": ["kriteria 1", "kriteria 2"]
    }
  ],
  "resources": [
    {
      "title": "Judul sumber",
      "type": "book/video/website/worksheet/slide",
      "url": "link opsional",
      "description": "Deskripsi sumber"
    }
  ],
  "teacherNotes": "Catatan tambahan untuk guru",
  "aiGenerated": true,
  "aiConfidence": 0.85,
  "createdAt": "ISO timestamp"
}

Pastikan output adalah JSON valid tanpa markdown code blocks.
`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      subject: { type: Type.STRING },
      classLevel: { type: Type.STRING },
      topic: { type: Type.STRING },
      subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
      duration: { type: Type.NUMBER },
      objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
      competencies: { type: Type.ARRAY, items: { type: Type.STRING } },
      prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            content: { type: Type.STRING },
            activities: { type: Type.ARRAY, items: { type: Type.STRING } },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      assessments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            description: { type: Type.STRING },
            criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      resources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            url: { type: Type.STRING },
            description: { type: Type.STRING },
          },
        },
      },
      teacherNotes: { type: Type.STRING },
      aiGenerated: { type: Type.BOOLEAN },
      aiConfidence: { type: Type.NUMBER },
      createdAt: { type: Type.STRING },
    },
    required: ['id', 'title', 'subject', 'classLevel', 'topic', 'duration', 'objectives'],
  };

  try {
    const response = await withCircuitBreaker(async () => {
      return await (await getAIInstance()).models.generateContent({
        model: AI_MODELS.PRO_THINKING,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          thinkingConfig: { thinkingBudget: AI_CONFIG.THINKING_BUDGET }
        },
      });
    });

    const jsonText = (response.text || '').trim();
    const lessonPlanData = JSON.parse(jsonText) as LessonPlan;

    const lessonPlan: LessonPlan = {
      id: lessonPlanData.id || `rpp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: lessonPlanData.title || `RPP ${input.subject} - ${input.topic}`,
      subject: input.subject,
      classLevel: input.classLevel,
      topic: input.topic,
      subtopics: input.subtopics || lessonPlanData.subtopics || [],
      duration,
      objectives: lessonPlanData.objectives || [],
      competencies: lessonPlanData.competencies || [],
      prerequisites: lessonPlanData.prerequisites || [],
      sections: lessonPlanData.sections || [],
      assessments: input.includeAssessment !== false ? (lessonPlanData.assessments || []) : [],
      resources: input.includeResources !== false ? (lessonPlanData.resources || []) : [],
      teacherNotes: input.includeTeacherNotes !== false ? (lessonPlanData.teacherNotes || '') : '',
      aiGenerated: true,
      aiConfidence: lessonPlanData.aiConfidence || 0.85,
      createdAt: lessonPlanData.createdAt || new Date().toISOString()
    };

    analysisCache.set(cacheKey, lessonPlan);
    
    logger.info('Lesson plan generated successfully', { 
      subject: input.subject, 
      topic: input.topic,
      classLevel: input.classLevel 
    });

    return lessonPlan;

  } catch (error) {
    const classifiedError = handleAIError(error, AIOperationType.LESSON_PLAN, AI_MODELS.PRO_THINKING);
    const message = getAIErrorMessage(classifiedError, AIOperationType.LESSON_PLAN);
    throw new Error(message);
  }
}

/**
 * Generate lesson plan with curriculum template
 */
export async function generateLessonPlanWithTemplate(
  input: LessonPlanInput,
  curriculumId: string = 'kurikulum-merdeka'
): Promise<LessonPlan> {
  const curriculum = getCurriculumTemplate(curriculumId);
  
  if (!curriculum) {
    throw new Error(`Curriculum template not found: ${curriculumId}`);
  }

  // Enhance input with curriculum context
  const enhancedInput: LessonPlanInput = {
    ...input,
    duration: input.duration || curriculum.defaultDuration
  };

  return generateLessonPlan(enhancedInput);
}

/**
 * Clear lesson plan cache
 */
export function clearLessonPlanCache(): void {
  // Cache clearing would be handled by the analysisCache service
  logger.info('Lesson plan cache cleared');
}
