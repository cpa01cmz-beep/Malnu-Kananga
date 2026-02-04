import { Type } from "@google/genai";
import { getAIInstance, AI_MODELS } from './geminiClient';
import { analysisCache } from '../aiCacheService';
import { withCircuitBreaker } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import {
  getAIErrorMessage,
  AIOperationType,
  handleAIError
} from '../../utils/aiErrorHandler';

/**
 * Generate quiz from learning materials
 */
export async function generateQuiz(
  materials: Array<{ title: string; content?: string; category: string }>,
  options: {
    questionCount: number;
    questionTypes: string[];
    difficulty: string;
    totalPoints?: number;
    focusAreas?: string[];
  }
): Promise<{
  title: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    difficulty: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points: number;
    materialReference?: string;
    tags?: string[];
  }>;
  totalPoints: number;
  duration: number;
  passingScore: number;
  aiGenerated?: boolean;
  aiConfidence?: number;
}> {
  const cacheKey = {
    operation: 'quizGeneration',
    input: JSON.stringify({ materials, options }),
    model: AI_MODELS.PRO_THINKING
  };

  const cachedQuiz = analysisCache.get<{
    title: string;
    description: string;
    questions: Array<{
      id: string;
      question: string;
      type: string;
      difficulty: string;
      options?: string[];
      correctAnswer: string | string[];
      explanation?: string;
      points: number;
      materialReference?: string;
      tags?: string[];
    }>;
    totalPoints: number;
    duration: number;
    passingScore: number;
    aiGenerated?: boolean;
    aiConfidence?: number;
  }>(cacheKey);
  if (cachedQuiz) {
    logger.debug('Returning cached quiz generation');
    return cachedQuiz;
  }

  const materialsText = materials.map(m =>
    `Judul: ${m.title}\nKategori: ${m.category}\n${m.content ? `Konten: ${m.content.substring(0, 500)}` : ''}`
  ).join('\n\n---\n\n');

  const prompt = `
  Anda adalah asisten pembuatan kuis profesional untuk guru. Buat kuis berdasarkan materi pembelajaran yang diberikan.

  INSTRUKSI:
  1. Buat ${options.questionCount} pertanyaan yang menguji pemahaman materi
  2. Gunakan jenis pertanyaan: ${options.questionTypes.join(', ')}
  3. Tingkat kesulitan: ${options.difficulty}
  4. Pastikan pertanyaan tidak terlalu mudah atau terlalu sulit
  5. Berikan penjelasan yang membantu siswa memahami jawaban benar
  6. Distribusikan poin secara merata (total poin: ${options.totalPoints || options.questionCount * 10})
  7. ${options.focusAreas?.length ? 'Fokus pada topik: ' + options.focusAreas.join(', ') : 'Cakup semua materi secara merata'}

  MATERI PEMBELAJARAN:
  ${materialsText}

  FORMAT OUTPUT (JSON):
  {
    "title": "Judul Kuis yang Menarik dan Deskriptif",
    "description": "Deskripsi singkat tentang apa yang diuji dalam kuis ini",
    "questions": [
      {
        "id": "q1",
        "question": "Teks pertanyaan yang jelas dan spesifik",
        "type": "multiple_choice",
        "difficulty": "${options.difficulty}",
        "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
        "correctAnswer": "Opsi A",
        "explanation": "Penjelasan kenapa jawaban ini benar",
        "points": 10,
        "materialReference": "Judul materi terkait",
        "tags": ["tag1", "tag2"]
      }
    ],
    "totalPoints": 100,
    "duration": 30,
    "passingScore": 70
  }

  JENIS PERTANYAAN YANG DIDUKUNG:
  - multiple_choice: Pilihan ganda (4 opsi)
  - true_false: Benar/Salah
  - short_answer: Jawaban singkat (1-2 kata/kalimat)
  - essay: Jawaban panjang (paragraf)
  - fill_blank: Isi bagian yang kosong

  Pastikan output adalah JSON yang valid dan sesuai dengan schema di atas.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            type: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            points: { type: Type.NUMBER },
            materialReference: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
      totalPoints: { type: Type.NUMBER },
      duration: { type: Type.NUMBER },
      passingScore: { type: Type.NUMBER },
    },
    required: ['title', 'description', 'questions', 'totalPoints', 'duration', 'passingScore'],
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
    const quizData = JSON.parse(jsonText);

    quizData.aiGenerated = true;
    quizData.aiConfidence = 0.85;

    analysisCache.set(cacheKey, quizData);

    return quizData;
  } catch (error) {
    const classifiedError = handleAIError(error, AIOperationType.QUIZ, AI_MODELS.PRO_THINKING);
    const message = getAIErrorMessage(classifiedError, AIOperationType.QUIZ);
    throw new Error(message);
  }
}
