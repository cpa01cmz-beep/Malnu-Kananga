import { Type } from "@google/genai";
import type { AIFeedback } from '../../types';
import { getAIInstance, AI_MODELS } from './geminiClient';
import { analysisCache } from '../aiCacheService';
import { withCircuitBreaker } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import { AI_CONFIG, API_ENDPOINTS } from '../../constants';
import {
  getAIErrorMessage,
  AIOperationType,
  handleAIError
} from '../../utils/aiErrorHandler';
import { idGenerators } from '../../utils/idGenerator';

/**
 * Function to analyze Teacher Grading Data (Uses Gemini 3 Pro)
 */
export async function analyzeClassPerformance(grades: { studentName: string; subject: string; grade: string; semester: string }[]): Promise<string> {
  // Check cache for existing analysis
  const cacheKey = {
    operation: 'classAnalysis',
    input: JSON.stringify(grades),
    model: AI_MODELS.PRO_THINKING
  };

  const cachedAnalysis = analysisCache.get<string>(cacheKey);
  if (cachedAnalysis) {
    logger.debug('Returning cached class performance analysis');
    return cachedAnalysis;
  }

  const prompt = `
  Analyze following student grade data for a specific class subject.
  Provide a pedagogical analysis including:
  1. Overall class performance summary.
  2. Identification of students who need remedial help (Grade C or D).
  3. Specific suggestions for teacher to improve learning outcomes for this group.

  Data: ${JSON.stringify(grades)}
  `;

  try {
    const response = await withCircuitBreaker(async () => {
      return await (await getAIInstance()).models.generateContent({
        model: AI_MODELS.PRO_THINKING,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: AI_CONFIG.THINKING_BUDGET }
        }
      });
    });
    const analysis = response.text || "Gagal melakukan analisis.";

    // Cache analysis result
    analysisCache.set(cacheKey, analysis);

    return analysis;
  } catch (error) {
    const classifiedError = handleAIError(error, AIOperationType.ANALYSIS, AI_MODELS.PRO_THINKING);
    const message = getAIErrorMessage(classifiedError, AIOperationType.ANALYSIS);
    return message;
  }
}

/**
 * Function to analyze individual student performance (Uses Gemini 3 Pro)
 */
export async function analyzeStudentPerformance(
  studentData: {
    grades: Array<{ subject: string; score: number; grade: string; trend: string }>;
    attendance: { percentage: number; totalDays: number; present: number; absent: number };
    trends: Array<{ month: string; averageScore: number; attendanceRate: number }>;
  },
  queueIfOffline: boolean = true
): Promise<string> {
  // Check cache for existing analysis
  const cacheKey = {
    operation: 'studentAnalysis',
    input: JSON.stringify(studentData),
    model: AI_MODELS.PRO_THINKING
  };

  const cachedAnalysis = analysisCache.get<string>(cacheKey);
  if (cachedAnalysis) {
    logger.debug('Returning cached student performance analysis');
    return cachedAnalysis;
  }

  // Check if offline and should queue
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline && queueIfOffline) {
    logger.info('Queueing AI analysis for offline execution');

    // Generate a unique ID for this analysis
    const analysisId = idGenerators.analysis('student');

    // Queue analysis using dynamic import to avoid circular dependency
    const { offlineActionQueueService } = await import('../offlineActionQueueService');
    offlineActionQueueService.addAction({
      type: 'create',
      entity: 'ai_analysis',
      entityId: analysisId,
      endpoint: API_ENDPOINTS.AI.STUDENT_ANALYSIS,
      method: 'POST',
      data: {
        operation: 'studentAnalysis',
        studentData,
        model: AI_MODELS.PRO_THINKING,
        timestamp: Date.now()
      }
    });

    // Return a placeholder message
    return "Analisis AI sedang diproses dan akan tersedia saat koneksi internet kembali.";
  }

  const prompt = `
  Analisis data performa akademik siswa berikut ini dalam Bahasa Indonesia.
  Sajikan analisis yang mendalam dan praktis dengan format:

  📊 **ANALISIS KINERJA AKADEMIK**
  1. Performa Umum: Evaluasi keseluruhan nilai dan tren
  2. Kekuatan Utama: Mata pelajaran dengan hasil terbaik
  3. Area yang Perlu Perhatian: Mata pelajaran yang butuh improvement
  4. Dampak Kehadiran: Hubungan antara kehadiran dan prestasi
  5. Rekomendasi Strategis: 3-4 saran praktis untuk peningkatan

  Data Siswa:
  - Nilai per mata pelajaran: ${JSON.stringify(studentData.grades)}
  - Kehadiran: ${studentData.attendance.percentage}% (${studentData.attendance.present}/${studentData.attendance.totalDays} hari)
  - Tren bulanan: ${JSON.stringify(studentData.trends)}

  Fokus pada:
  - Pola pembelajaran yang efektif
  - Strategi meningkatkan mata pelajaran bermasalah
  - Pengaruh disiplin kehadiran terhadap hasil
  - Motivasi positif dan pembangunan kepercayaan diri

  Gunakan bahasa yang mendidik, memotivasi, dan memberikan solusi konkret.
  `;

  try {
    const response = await withCircuitBreaker(async () => {
      return await (await getAIInstance()).models.generateContent({
        model: AI_MODELS.PRO_THINKING,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: AI_CONFIG.THINKING_BUDGET }
        }
      });
    });
    const analysis = response.text || "Gagal melakukan analisis.";

    // Cache analysis result
    analysisCache.set(cacheKey, analysis);

    return analysis;
  } catch (error) {
    const classifiedError = handleAIError(error, AIOperationType.ANALYSIS, AI_MODELS.PRO_THINKING);
    const message = getAIErrorMessage(classifiedError, AIOperationType.ANALYSIS);
    return message;
  }
}

/**
 * Generate AI feedback for assignment submissions
 */
export async function generateAssignmentFeedback(
  assignment: {
    title: string;
    description: string;
    type: string;
    subjectName?: string;
    maxScore: number;
  },
  submission: {
    studentName: string;
    submissionText?: string;
    attachments?: Array<{ fileName: string; fileType: string }>;
  },
  submissionScore?: number
): Promise<{
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedScore?: number;
  confidence: number;
}> {
  const cacheKey = {
    operation: 'assignmentFeedback',
    input: JSON.stringify({ assignment, submission, submissionScore }),
    model: AI_MODELS.PRO_THINKING
  };

  const cachedFeedback = analysisCache.get<AIFeedback>(cacheKey);
  if (cachedFeedback) {
    logger.debug('Returning cached assignment feedback');
    return cachedFeedback;
  }

  const attachmentsInfo = submission.attachments?.length
    ? `\nLampiran yang dikirim: ${submission.attachments.map(a => `- ${a.fileName} (${a.fileType})`).join('\n')}`
    : '';

  const prompt = `
  Anda adalah asisten penilaian yang membantu guru memberikan feedback yang membangun untuk tugas siswa.

  INFORMASI TUGAS:
  - Judul: ${assignment.title}
  - Deskripsi: ${assignment.description}
  - Jenis: ${assignment.type}
  - Mata Pelajaran: ${assignment.subjectName || 'Umum'}
  - Nilai Maksimal: ${assignment.maxScore}

  PENGUMPULAN SISWA:
  - Nama Siswa: ${submission.studentName}
  - Jawaban Teks: ${submission.submissionText || 'Tidak ada jawaban teks'}
  ${attachmentsInfo}
  ${submissionScore !== undefined ? `- Nilai saat ini: ${submissionScore}/${assignment.maxScore}` : '- Belum dinilai'}

  INSTRUKSI:
  Buatlah feedback yang membangun dan mendidik dengan format berikut:

  1. **FEEDBACK UTAMA**: Ringkasan umum dalam 2-3 kalimat yang sopan dan memotivasi

  2. **KEKUATAN (3-5 poin)**:
     - Hal-hal yang dilakukan dengan baik oleh siswa
     - Gunakan bahasa positif dan spesifik
     - Sebutkan detail dari jawaban jika ada

  3. **AREA PERBAIKAN (3-5 poin)**:
     - Hal-hal yang perlu ditingkatkan
     - Berikan saran yang konkret dan dapat dilakukan
     - Fokus pada aspek pembelajaran, bukan kekurangan pribadi

  4. **SARAN NILAI (opsional)**:
     - Jika memungkinkan, berikan rekomendasi nilai berdasarkan kualitas jawaban
     - Jelaskan alasan singkat (1 kalimat)

  FORMAT OUTPUT (JSON):
  {
    "feedback": "Feedback utama yang ringkas dan memotivasi",
    "strengths": [
      "Kekuatan 1 dengan detail spesifik",
      "Kekuatan 2 dengan detail spesifik",
      "Kekuatan 3 dengan detail spesifik"
    ],
    "improvements": [
      "Perbaikan 1 dengan saran konkret",
      "Perbaikan 2 dengan saran konkret",
      "Perbaikan 3 dengan saran konkret"
    ],
    "suggestedScore": 85,
    "confidence": 0.85
  }

  PEDOMAN:
  - Gunakan Bahasa Indonesia yang sopan dan membangun
  - Hindari bahasa yang menghakimi atau merendahkan
  - Fokus pada pembelajaran dan pengembangan
  - Berikan saran yang praktis dan dapat diimplementasikan
  - Confidence score (0-1) mengindikasikan seberapa yakin AI dengan analisisnya
  - Jangan memberikan suggestedScore jika informasi tidak cukup
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      feedback: { type: Type.STRING },
      strengths: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      improvements: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      suggestedScore: { type: Type.NUMBER },
      confidence: { type: Type.NUMBER }
    },
    required: ['feedback', 'strengths', 'improvements', 'confidence']
  };

  try {
    const response = await withCircuitBreaker(async () => {
      return await (await getAIInstance()).models.generateContent({
        model: AI_MODELS.PRO_THINKING,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          thinkingConfig: { thinkingBudget: AI_CONFIG.THINKING_BUDGET }
        }
      });
    });

    const jsonText = (response.text || '').trim();
    const feedbackData = JSON.parse(jsonText);

    feedbackData.id = idGenerators.feedback();
    feedbackData.generatedAt = new Date().toISOString();
    feedbackData.aiModel = AI_MODELS.PRO_THINKING;

    analysisCache.set(cacheKey, feedbackData);

    return feedbackData;
  } catch (error) {
    const classifiedError = handleAIError(error, AIOperationType.FEEDBACK, AI_MODELS.PRO_THINKING);
    const message = getAIErrorMessage(classifiedError, AIOperationType.FEEDBACK);
    throw new Error(message);
  }
}
