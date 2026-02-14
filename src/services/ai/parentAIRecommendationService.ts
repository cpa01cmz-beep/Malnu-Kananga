import { getAIInstance, AI_MODELS } from './geminiClient';
import { analysisCache } from '../aiCacheService';
import { logger } from '../../utils/logger';

const RECOMMENDATION_EXPIRY_DAYS = 7;
const CACHE_EXPIRY_MS = RECOMMENDATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * Types for Parent AI Recommendations
 */

export interface ParentRecommendation {
  id: string;
  type: 'grades' | 'attendance' | 'assignments' | 'general' | 'meeting';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  action?: {
    label: string;
    view?: string;
  };
  studentName: string;
  subject?: string;
  createdAt: string;
  expiresAt: string;
}

export interface ParentChildData {
  studentId: string;
  studentName: string;
  grades: Array<{
    subject: string;
    score: number;
    grade: string;
    category: string;
    semester: string;
  }>;
  attendance: {
    percentage: number;
    totalDays: number;
    present: number;
    absent: number;
    sick: number;
    permission: number;
  };
  assignments: Array<{
    title: string;
    subject: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded' | 'late';
    score?: number;
  }>;
  upcomingMeetings?: Array<{
    id: string;
    title: string;
    date: string;
    teacherName: string;
  }>;
}

export interface ParentRecommendationsInput {
  parentName: string;
  children: ParentChildData[];
  preferences?: {
    focusAreas?: string[];
    notificationFrequency?: 'daily' | 'weekly' | 'instant';
  };
}

/**
 * Generate AI-powered recommendations for parents
 * Analyzes children's academic data and provides personalized suggestions
 */
export async function generateParentRecommendations(
  input: ParentRecommendationsInput
): Promise<ParentRecommendation[]> {
  const cacheKey = {
    operation: 'parentRecommendations',
    input: JSON.stringify({ input }),
    model: AI_MODELS.PRO
  };

  // Check cache first
  const cachedRecommendations = analysisCache.get<ParentRecommendation[]>(cacheKey);
  if (cachedRecommendations) {
    logger.debug('Returning cached parent recommendations');
    return cachedRecommendations;
  }

  const { parentName, children, preferences } = input;

  // Build the prompt with children's data
  const childrenDataSummary = children.map(child => {
    const avgGrade = child.grades.length > 0
      ? Math.round(child.grades.reduce((sum, g) => sum + g.score, 0) / child.grades.length)
      : 0;
    
    const gradeSummary = child.grades
      .filter(g => g.score < 75)
      .map(g => `${g.subject}: ${g.score} (${g.grade})`)
      .join(', ') || 'Semua nilai baik';

    const pendingAssignments = child.assignments.filter(a => a.status === 'pending');
    const attendanceStatus = child.attendance.percentage < 85 
      ? `Rendah (${child.attendance.percentage}%)` 
      : 'Baik';

    return `
SISWA: ${child.studentName}
- Rata-rata nilai: ${avgGrade}
- Mata pelajaran perlu perhatian: ${gradeSummary}
- Kehadiran: ${attendanceStatus}
- Tugas tertunda: ${pendingAssignments.length}
- Detail nilai: ${child.grades.slice(0, 10).map(g => `${g.subject}: ${g.score}`).join(', ')}
- Detail kehadiran: Hadir ${child.attendance.present}, Absen ${child.attendance.absent}, Izin ${child.attendance.permission}, Sakit ${child.attendance.sick} dari ${child.attendance.totalDays} hari`;
  }).join('\n\n');

  const focusAreas = preferences?.focusAreas?.join(', ') || 'Nilai akademis, Kehadiran, Tugas';

  const prompt = `
Anda adalah asisten AI untuk orang tua siswa. Analisis data akademik anak-anak berikut dan berikan rekomendasi yang actionable dan personal.

DATA ORANG TUA: ${parentName}
JUMLAH ANAK: ${children.length}

${childrenDataSummary}

FOKUS REKOMENDASI: ${focusAreas}

INSTRUKSI:
1. Berikan maksimal 5 rekomendasi yang paling penting
2. Prioritaskan berdasarkan urgensi (nilai rendah, kehadiran rendah, tugas tertunda)
3. Setiap rekomendasi harus:
   - Spesifik dan actionable
   - Mencakup nama siswa yang bersangkutan
   - Memiliki aksi yang bisa dilakukan (lihat dashboard, hubungi guru, dll)
4. Kategorikan rekomendasi:
   - grades: Terkait nilai akademik
   - attendance: Terkait kehadiran
   - assignments: Terkait tugas sekolah
   - general: Rekomendasi umum
   - meeting: Rekomendasi untuk jadwal pertemuan

FORMAT OUTPUT (JSON array):
[
  {
    "id": "rec-001",
    "type": "grades|attendance|assignments|general|meeting",
    "priority": "high|medium|low",
    "title": "Judul singkat yang menarik perhatian",
    "description": "Penjelasan detail mengapa ini penting dan apa yang bisa dilakukan",
    "actionable": true,
    "action": {
      "label": "Lihat Nilai",
      "view": "grades"
    },
    "studentName": "Nama siswa",
    "subject": "Mata pelajaran (jika relevan)"
  }
]

PENTING:
- Hanya output JSON array, tanpa markdown formatting
- Prioritaskan rekomendasi dengan priority "high" untuk siswa yang membutuhkan perhatian
- Rekomendasi harus dalam bahasa Indonesia yang natural
- Jangan berikan rekomendasi kosong jika tidak ada masalah
- Ekspirasi rekomendasi: 7 hari sejak dibuat
`;

  try {
    const ai = await getAIInstance();
    
    const result = await ai.models.generateContent({
      model: AI_MODELS.PRO,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: {
          role: 'model',
          parts: [{ text: 'Anda adalah asisten AI yang membantu orang tua dalam memantau perkembangan akademik anak-anak mereka. Berikan rekomendasi yang spesifik, actionable, dan dalam bahasa Indonesia yang natural.' }]
        }
      }
    });

    const recommendationsText = result.text;
    
    if (!recommendationsText) {
      logger.warn('Empty response from AI for parent recommendations');
      return [];
    }

    // Parse the JSON response
    let recommendations: ParentRecommendation[];
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch (parseError) {
      logger.error('Failed to parse parent recommendations JSON:', parseError);
      return [];
    }

    // Add metadata to recommendations
    const now = new Date();
    const expiryDate = new Date(now.getTime() + CACHE_EXPIRY_MS);
    
    const enrichedRecommendations = recommendations.map((rec, index) => ({
      ...rec,
      id: rec.id || `rec-${Date.now()}-${index}`,
      createdAt: now.toISOString(),
      expiresAt: expiryDate.toISOString()
    }));

    // Cache the recommendations
    analysisCache.set(cacheKey, enrichedRecommendations);
    
    logger.info(`Generated ${enrichedRecommendations.length} parent recommendations for ${parentName}`);
    return enrichedRecommendations;

  } catch (error) {
    logger.error('Error generating parent recommendations:', error);
    return [];
  }
}

/**
 * Get quick recommendations without AI (fallback)
 * Provides rule-based recommendations based on data thresholds
 */
export function getQuickParentRecommendations(
  children: ParentChildData[]
): ParentRecommendation[] {
  const recommendations: ParentRecommendation[] = [];
  const now = new Date();
  const expiryDate = new Date(now.getTime() + CACHE_EXPIRY_MS);

  children.forEach(child => {
    // Check for low grades
    const lowGrades = child.grades.filter(g => g.score < 70);
    if (lowGrades.length > 0) {
      recommendations.push({
        id: `quick-grade-${child.studentId}-${Date.now()}`,
        type: 'grades',
        priority: 'high',
        title: `Perhatian: Nilai ${child.studentName} Perlu Evaluasi`,
        description: `${child.studentName} memiliki ${lowGrades.length} mata pelajaran dengan nilai di bawah standar. Segera lihat detail nilainya dan diskusikan dengan guru bidang studi.`,
        actionable: true,
        action: {
          label: 'Lihat Nilai',
          view: 'grades'
        },
        studentName: child.studentName,
        subject: lowGrades[0]?.subject,
        createdAt: now.toISOString(),
        expiresAt: expiryDate.toISOString()
      });
    }

    // Check for low attendance
    if (child.attendance.percentage < 85) {
      recommendations.push({
        id: `quick-attendance-${child.studentId}-${Date.now()}`,
        type: 'attendance',
        priority: child.attendance.percentage < 75 ? 'high' : 'medium',
        title: `Kehadiran ${child.studentName} Perlu Perhatian`,
        description: `Persentase kehadiran ${child.studentName} adalah ${child.attendance.percentage}%. Kehadiran yang rendah dapat mempengaruhi performa akademik.`,
        actionable: true,
        action: {
          label: 'Lihat Kehadiran',
          view: 'attendance'
        },
        studentName: child.studentName,
        createdAt: now.toISOString(),
        expiresAt: expiryDate.toISOString()
      });
    }

    // Check for pending assignments
    const pendingAssignments = child.assignments.filter(a => a.status === 'pending');
    if (pendingAssignments.length >= 3) {
      recommendations.push({
        id: `quick-assignment-${child.studentId}-${Date.now()}`,
        type: 'assignments',
        priority: 'medium',
        title: `${child.studentName} Ada ${pendingAssignments.length} Tugas Tertunda`,
        description: `Bantu ${child.studentName} menyelesaikan ${pendingAssignments.length} tugas yang masih tertunda untuk menghindari nilai penalaran.`,
        actionable: true,
        action: {
          label: 'Lihat Tugas',
          view: 'assignments'
        },
        studentName: child.studentName,
        createdAt: now.toISOString(),
        expiresAt: expiryDate.toISOString()
      });
    }
  });

  return recommendations;
}

/**
 * Clear cached recommendations (call when data changes)
 */
export function clearParentRecommendationCache(): void {
  analysisCache.clear();
  logger.info('Parent recommendation cache cleared');
}
