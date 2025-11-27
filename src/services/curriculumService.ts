// Enhanced curriculum management system for MA Malnu Kananga
// Implements automated curriculum delivery and assessment

export interface LearningObjective {
  id: string;
  code: string;
  description: string;
  competency: 'knowledge' | 'skill' | 'attitude';
  level: 'basic' | 'intermediate' | 'advanced';
  subjectId: string;
  semester: number;
  indicators: string[];
  assessmentCriteria: string[];
}

export interface LearningMaterial {
  id: string;
  title: string;
  type: 'video' | 'document' | 'interactive' | 'quiz' | 'assignment';
  content: string;
  url?: string;
  duration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[]; // Learning objective IDs
  prerequisites: string[]; // Material IDs
  subjectId: string;
  semester: number;
  order: number;
  isMandatory: boolean;
  tags: string[];
  resources?: Array<{
    type: 'pdf' | 'link' | 'video' | 'image';
    title: string;
    url: string;
  }>;
}

export interface AssessmentTool {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'project' | 'presentation' | 'exam';
  description: string;
  instructions: string;
  subjectId: string;
  semester: number;
  objectives: string[]; // Learning objective IDs being assessed
  maxScore: number;
  timeLimit?: number; // in minutes
  attempts: number;
  passingScore: number;
  isGraded: boolean;
  questions?: Array<{
    id: string;
    type: 'multiple_choice' | 'essay' | 'short_answer' | 'true_false';
    question: string;
    options?: string[];
    correctAnswer?: string;
    points: number;
    explanation?: string;
  }>;
  rubric?: Array<{
    criteria: string;
    description: string;
    maxPoints: number;
    levels: Array<{
      score: number;
      description: string;
    }>;
  }>;
}

export interface CurriculumMap {
  id: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  major: 'IPA' | 'IPS' | 'Bahasa';
  semester: number;
  objectives: LearningObjective[];
  materials: LearningMaterial[];
  assessments: AssessmentTool[];
  coreCompetencies: Array<{
    code: string;
    description: string;
    objectives: string[];
  }>;
  basicCompetencies: Array<{
    code: string;
    description: string;
    objectives: string[];
  }>;
  weeklySchedule: Array<{
    week: number;
    topic: string;
    objectives: string[];
    materials: string[];
    activities: string[];
    assessment: string[];
  }>;
}

export interface AdaptiveLearningPath {
  id: string;
  studentId: string;
  subjectId: string;
  pathType: 'remedial' | 'regular' | 'enrichment';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 0-100
  recommendedMaterials: string[]; // Material IDs
  recommendedAssessments: string[]; // Assessment IDs
  adaptiveRules: Array<{
    condition: string;
    action: string;
    priority: number;
  }>;
  lastUpdated: string;
  estimatedCompletion: string;
}

export interface StudentPerformanceMetrics {
  studentId: string;
  subjectId: string;
  averageScore: number;
  masteryLevel: 'not_started' | 'in_progress' | 'mastered' | 'needs_review';
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  paceOfLearning: 'slow' | 'normal' | 'fast';
  engagementScore: number;
  timeSpent: number; // in minutes
  lastActivity: string;
}

export interface StudentProgress {
  studentId: string;
  curriculumMaps: Record<string, {
    completedObjectives: string[];
    completedMaterials: string[];
    completedAssessments: Array<{
      assessmentId: string;
      score: number;
      attempts: number;
      completedAt: string;
      timeSpent: number;
    }>;
    currentWeek: number;
    masteryLevel: Record<string, 'not_started' | 'in_progress' | 'mastered' | 'needs_review'>;
    timeSpent: number;
    lastAccess: string;
  }>;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  targetAudience: 'remedial' | 'regular' | 'enrichment';
  materials: string[]; // Material IDs in order
  estimatedDuration: number; // in hours
  prerequisites: string[];
  outcomes: string[];
  isAdaptive: boolean;
}

class CurriculumService {
  private static instance: CurriculumService;
  private CURRICULUM_KEY = 'malnu_curriculum_maps';
  private PROGRESS_KEY = 'malnu_curriculum_progress';
  private LEARNING_PATHS_KEY = 'malnu_learning_paths';
  private ASSESSMENT_RESULTS_KEY = 'malnu_assessment_results';

  private constructor() {}

  static getInstance(): CurriculumService {
    if (!CurriculumService.instance) {
      CurriculumService.instance = new CurriculumService();
    }
    return CurriculumService.instance;
  }

  // Initialize curriculum system with enhanced data
  initialize(): void {
    this.setupCurriculumMaps();
    this.setupLearningPaths();
    this.initializeProgressTracking();
    this.setupAutomatedAssessments();
  }

  // Setup comprehensive curriculum maps for all subjects
  private setupCurriculumMaps(): void {
    const existingMaps = localStorage.getItem(this.CURRICULUM_KEY);
    if (existingMaps) return;

    const curriculumMaps: CurriculumMap[] = [
      this.createMathematicsCurriculum(),
      this.createPhysicsCurriculum(),
      this.createChemistryCurriculum(),
      this.createBiologyCurriculum(),
      this.createIndonesianLanguageCurriculum(),
      this.createEnglishCurriculum(),
      this.createIslamicEducationCurriculum(),
      this.createCivicsEducationCurriculum()
    ];

    localStorage.setItem(this.CURRICULUM_KEY, JSON.stringify(curriculumMaps));
  }

  // Create comprehensive Mathematics curriculum for XII IPA
  private createMathematicsCurriculum(): CurriculumMap {
    const objectives: LearningObjective[] = [
      {
        id: 'mat_obj_001',
        code: '3.1.1',
        description: 'Memahami konsep fungsi dan komposisi fungsi',
        competency: 'knowledge',
        level: 'intermediate',
        subjectId: 'SUBJ001',
        semester: 1,
        indicators: [
          'Menjelaskan pengertian fungsi',
          'Menentukan domain dan kodomain fungsi',
          'Menghitung komposisi fungsi'
        ],
        assessmentCriteria: [
          'Ketepatan dalam menjelaskan konsep',
          'Kemampuan menyelesaikan soal komposisi fungsi',
          'Penerapan dalam masalah nyata'
        ]
      },
      {
        id: 'mat_obj_002',
        code: '3.1.2',
        description: 'Menerapkan turunan fungsi dalam analisis',
        competency: 'skill',
        level: 'advanced',
        subjectId: 'SUBJ001',
        semester: 1,
        indicators: [
          'Menghitung turunan fungsi aljabar',
          'Menganalisis monotonitas fungsi',
          'Menentukan titik ekstrem'
        ],
        assessmentCriteria: [
          'Ketepatan perhitungan turunan',
          'Analisis grafik fungsi',
          'Pemecahan masalah optimasi'
        ]
      },
      {
        id: 'mat_obj_003',
        code: '3.2.1',
        description: 'Memahami konsep integral dan aplikasinya',
        competency: 'knowledge',
        level: 'intermediate',
        subjectId: 'SUBJ001',
        semester: 2,
        indicators: [
          'Menjelaskan pengertian integral tak tentu',
          'Menghitung integral tentu',
          'Menerapkan integral luas daerah'
        ],
        assessmentCriteria: [
          'Pemahaman konsep integral',
          'Ketepatan perhitungan',
          'Aplikasi dalam geometri'
        ]
      }
    ];

    const materials: LearningMaterial[] = [
      {
        id: 'mat_mat_001',
        title: 'Video Pembelajaran Fungsi dan Komposisi',
        type: 'video',
        content: 'Penjelasan lengkap tentang konsep fungsi, domain, kodomain, dan komposisi fungsi',
        url: 'https://example.com/fungsi-komposisi',
        duration: 45,
        difficulty: 'intermediate',
        objectives: ['mat_obj_001'],
        prerequisites: [],
        subjectId: 'SUBJ001',
        semester: 1,
        order: 1,
        isMandatory: true,
        tags: ['fungsi', 'komposisi', 'aljabar'],
        resources: [
          {
            type: 'pdf',
            title: 'Modul Fungsi',
            url: '/assets/modul-fungsi.pdf'
          },
          {
            type: 'link',
            title: 'Interactive Function Plotter',
            url: 'https://www.desmos.com/calculator'
          }
        ]
      },
      {
        id: 'mat_mat_002',
        title: 'Latihan Soal Komposisi Fungsi',
        type: 'interactive',
        content: 'Kuis interaktif dengan 20 soal tentang komposisi fungsi',
        duration: 30,
        difficulty: 'intermediate',
        objectives: ['mat_obj_001'],
        prerequisites: ['mat_mat_001'],
        subjectId: 'SUBJ001',
        semester: 1,
        order: 2,
        isMandatory: true,
        tags: ['latihan', 'komposisi', 'quiz']
      },
      {
        id: 'mat_mat_003',
        title: 'Video Turunan Fungsi',
        type: 'video',
        content: 'Konsep dan aplikasi turunan fungsi dalam analisis matematis',
        url: 'https://example.com/turunan-fungsi',
        duration: 60,
        difficulty: 'advanced',
        objectives: ['mat_obj_002'],
        prerequisites: ['mat_mat_001'],
        subjectId: 'SUBJ001',
        semester: 1,
        order: 3,
        isMandatory: true,
        tags: ['turunan', 'kalkulus', 'analisis']
      },
      {
        id: 'mat_mat_004',
        title: 'Praktikum Analisis Fungsi',
        type: 'assignment',
        content: 'Analisis fungsi kuadrat dan kubik untuk menentukan monotonitas dan titik ekstrem',
        duration: 90,
        difficulty: 'advanced',
        objectives: ['mat_obj_002'],
        prerequisites: ['mat_mat_003'],
        subjectId: 'SUBJ001',
        semester: 1,
        order: 4,
        isMandatory: true,
        tags: ['praktikum', 'analisis', 'grafik']
      }
    ];

    const assessments: AssessmentTool[] = [
      {
        id: 'mat_ass_001',
        title: 'Quiz Fungsi dan Komposisi',
        type: 'quiz',
        description: 'Evaluasi pemahaman konsep fungsi dan komposisi fungsi',
        instructions: 'Jawab semua pertanyaan dengan benar. Waktu: 30 menit',
        subjectId: 'SUBJ001',
        semester: 1,
        objectives: ['mat_obj_001'],
        maxScore: 100,
        timeLimit: 30,
        attempts: 3,
        passingScore: 70,
        isGraded: true,
        questions: [
          {
            id: 'mat_q_001',
            type: 'multiple_choice',
            question: 'Jika f(x) = 2x + 3 dan g(x) = x² - 1, maka (f o g)(2) = ...',
            options: ['7', '9', '11', '13'],
            correctAnswer: '9',
            points: 20,
            explanation: '(f o g)(2) = f(g(2)) = f(2² - 1) = f(3) = 2(3) + 3 = 9'
          },
          {
            id: 'mat_q_002',
            type: 'essay',
            question: 'Jelaskan perbedaan antara fungsi injektif, surjektif, dan bijektif beserta contohnya!',
            points: 30,
            explanation: 'Jawaban harus mencakup definisi dan contoh masing-masing jenis fungsi'
          }
        ]
      },
      {
        id: 'mat_ass_002',
        title: 'Tugas Analisis Turunan',
        type: 'assignment',
        description: 'Analisis fungsi untuk menentukan titik ekstrem dan monotonitas',
        instructions: 'Gunakan konsep turunan untuk menganalisis fungsi yang diberikan',
        subjectId: 'SUBJ001',
        semester: 1,
        objectives: ['mat_obj_002'],
        maxScore: 100,
        attempts: 2,
        passingScore: 75,
        isGraded: true,
        rubric: [
          {
            criteria: 'Ketepatan perhitungan turunan',
            description: 'Keakuratan dalam menghitung turunan pertama dan kedua',
            maxPoints: 30,
            levels: [
              { score: 30, description: 'Semua perhitungan benar' },
              { score: 20, description: 'Sebagian besar perhitungan benar' },
              { score: 10, description: 'Beberapa perhitungan benar' },
              { score: 0, description: 'Perhitungan salah semua' }
            ]
          },
          {
            criteria: 'Analisis monotonitas',
            description: 'Kemampuan menentukan interval naik/turun',
            maxPoints: 35,
            levels: [
              { score: 35, description: 'Analisis lengkap dan benar' },
              { score: 25, description: 'Analisis benar tapi tidak lengkap' },
              { score: 15, description: 'Analisis sebagian benar' },
              { score: 0, description: 'Analisis salah' }
            ]
          },
          {
            criteria: 'Penentuan titik ekstrem',
            description: 'Keakuratan dalam menemukan titik maksimum/minimum',
            maxPoints: 35,
            levels: [
              { score: 35, description: 'Semua titik ekstrem ditemukan dengan benar' },
              { score: 25, description: 'Sebagian titik ekstrem ditemukan' },
              { score: 15, description: 'Beberapa titik ekstrem ditemukan' },
              { score: 0, description: 'Tidak ada titik ekstrem yang ditemukan' }
            ]
          }
        ]
      }
    ];

    return {
      id: 'curriculum_mat_001',
      subjectId: 'SUBJ001',
      subjectName: 'Matematika',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives,
      materials,
      assessments,
      coreCompetencies: [
        {
          code: 'KI.3',
          description: 'Memahami, menerapkan, menganalisis pengetahuan faktual, konseptual, prosedural berdasarkan rasa ingin tahunya tentang ilmu pengetahuan, teknologi, seni, budaya terkait fenomena dan kejadian tampak mata',
          objectives: ['mat_obj_001', 'mat_obj_002', 'mat_obj_003']
        }
      ],
      basicCompetencies: [
        {
          code: 'KD.3.1',
          description: 'Menerapkan konsep fungsi dan komposisi fungsi dalam pemecahan masalah',
          objectives: ['mat_obj_001']
        },
        {
          code: 'KD.3.2',
          description: 'Menganalisis fungsi menggunakan konsep turunan',
          objectives: ['mat_obj_002']
        }
      ],
      weeklySchedule: [
        {
          week: 1,
          topic: 'Pengenalan Fungsi',
          objectives: ['mat_obj_001'],
          materials: ['mat_mat_001'],
          activities: ['Diskusi konsep fungsi', 'Latihan soal dasar'],
          assessment: ['Formatif assessment']
        },
        {
          week: 2,
          topic: 'Komposisi Fungsi',
          objectives: ['mat_obj_001'],
          materials: ['mat_mat_002'],
          activities: ['Praktik komposisi', 'Problem solving'],
          assessment: ['Quiz komposisi fungsi']
        },
        {
          week: 3,
          topic: 'Turunan Fungsi',
          objectives: ['mat_obj_002'],
          materials: ['mat_mat_003'],
          activities: ['Demonstrasi turunan', 'Contoh aplikasi'],
          assessment: ['Observasi partisipasi']
        },
        {
          week: 4,
          topic: 'Analisis Fungsi',
          objectives: ['mat_obj_002'],
          materials: ['mat_mat_004'],
          activities: ['Praktikum analisis', 'Presentasi hasil'],
          assessment: ['Tugas analisis turunan']
        }
      ]
    };
  }

  // Create Physics curriculum (simplified for example)
  private createPhysicsCurriculum(): CurriculumMap {
    return {
      id: 'curriculum_fis_001',
      subjectId: 'SUBJ002',
      subjectName: 'Fisika',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives: [
        {
          id: 'fis_obj_001',
          code: '3.1.1',
          description: 'Memahami konsep gerak lurus dan gerak melingkar',
          competency: 'knowledge',
          level: 'intermediate',
          subjectId: 'SUBJ002',
          semester: 1,
          indicators: ['Menganalisis GLB', 'Menganalisis GLBB', 'Menjelaskan gerak melingkar'],
          assessmentCriteria: ['Ketepatan analisis', 'Pemahaman konsep', 'Aplikasi rumus']
        }
      ],
      materials: [
        {
          id: 'fis_mat_001',
          title: 'Video Gerak Lurus',
          type: 'video',
          content: 'Pembahasan lengkap gerak lurus beraturan dan berubah beraturan',
          duration: 50,
          difficulty: 'intermediate',
          objectives: ['fis_obj_001'],
          prerequisites: [],
          subjectId: 'SUBJ002',
          semester: 1,
          order: 1,
          isMandatory: true,
          tags: ['gerak', 'kinematika', 'fisika']
        }
      ],
      assessments: [
        {
          id: 'fis_ass_001',
          title: 'Quiz Gerak Lurus',
          type: 'quiz',
          description: 'Evaluasi pemahaman konsep gerak lurus',
          subjectId: 'SUBJ002',
          semester: 1,
          objectives: ['fis_obj_001'],
          maxScore: 100,
          timeLimit: 45,
          attempts: 2,
          passingScore: 70,
          isGraded: true,
          instructions: 'Jawab semua pertanyaan dengan teliti'
        }
      ],
      coreCompetencies: [
        {
          code: 'KI.3',
          description: 'Memahami konsep dan prinsip fisika dalam kehidupan',
          objectives: ['fis_obj_001']
        }
      ],
      basicCompetencies: [
        {
          code: 'KD.3.1',
          description: 'Menganalisis gerak lurus dan gerak melingkar',
          objectives: ['fis_obj_001']
        }
      ],
      weeklySchedule: [
        {
          week: 1,
          topic: 'Gerak Lurus Beraturan',
          objectives: ['fis_obj_001'],
          materials: ['fis_mat_001'],
          activities: ['Demonstrasi', 'Praktikum'],
          assessment: ['Quiz']
        }
      ]
    };
  }

  // Create Chemistry curriculum
  private createChemistryCurriculum(): CurriculumMap {
    return {
      id: 'curriculum_kim_001',
      subjectId: 'SUBJ003',
      subjectName: 'Kimia',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives: [
        {
          id: 'kim_obj_001',
          code: '3.1.1',
          description: 'Memahami struktur atom dan sistem periodik',
          competency: 'knowledge',
          level: 'intermediate',
          subjectId: 'SUBJ003',
          semester: 1,
          indicators: ['Menjelaskan struktur atom', 'Menganalisis tabel periodik'],
          assessmentCriteria: ['Pemahaman konsep', 'Analisis data']
        }
      ],
      materials: [],
      assessments: [],
      coreCompetencies: [],
      basicCompetencies: [],
      weeklySchedule: []
    };
  }

  // Create Biology curriculum
  private createBiologyCurriculum(): CurriculumMap {
    return {
      id: 'curriculum_bio_001',
      subjectId: 'SUBJ004',
      subjectName: 'Biologi',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives: [
        {
          id: 'bio_obj_001',
          code: '3.1.1',
          description: 'Memahami struktur dan fungsi sel',
          competency: 'knowledge',
          level: 'intermediate',
          subjectId: 'SUBJ004',
          semester: 1,
          indicators: ['Mengidentifikasi organel sel', 'Menjelaskan fungsi organel'],
          assessmentCriteria: ['Identifikasi struktur', 'Pemahaman fungsi']
        }
      ],
      materials: [],
      assessments: [],
      coreCompetencies: [],
      basicCompetencies: [],
      weeklySchedule: []
    };
  }

  // Create Indonesian Language curriculum
  private createIndonesianLanguageCurriculum(): CurriculumMap {
    return {
      id: 'curriculum_bind_001',
      subjectId: 'SUBJ005',
      subjectName: 'Bahasa Indonesia',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives: [
        {
          id: 'bind_obj_001',
          code: '3.1.1',
          description: 'Menganalisis teks eksposisi',
          competency: 'skill',
          level: 'intermediate',
          subjectId: 'SUBJ005',
          semester: 1,
          indicators: ['Mengidentifikasi struktur teks', 'Menganalisis isi teks'],
          assessmentCriteria: ['Analisis struktur', 'Pemahaman isi']
        }
      ],
      materials: [],
      assessments: [],
      coreCompetencies: [],
      basicCompetencies: [],
      weeklySchedule: []
    };
  }

  // Create English curriculum
  private createEnglishCurriculum(): CurriculumMap {
    return {
      id: 'curriculum_bing_001',
      subjectId: 'SUBJ006',
      subjectName: 'Bahasa Inggris',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives: [
        {
          id: 'bing_obj_001',
          code: '3.1.1',
          description: 'Memahami teks explanatory dalam bahasa Inggris',
          competency: 'skill',
          level: 'intermediate',
          subjectId: 'SUBJ006',
          semester: 1,
          indicators: ['Reading comprehension', 'Vocabulary mastery'],
          assessmentCriteria: ['Reading skills', 'Vocabulary usage']
        }
      ],
      materials: [],
      assessments: [],
      coreCompetencies: [],
      basicCompetencies: [],
      weeklySchedule: []
    };
  }

  // Create Islamic Education curriculum
  private createIslamicEducationCurriculum(): CurriculumMap {
    return {
      id: 'curriculum_pai_001',
      subjectId: 'SUBJ007',
      subjectName: 'Pendidikan Agama Islam',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives: [
        {
          id: 'pai_obj_001',
          code: '3.1.1',
          description: 'Memahami nilai-nilai akhlakul karimah',
          competency: 'attitude',
          level: 'intermediate',
          subjectId: 'SUBJ007',
          semester: 1,
          indicators: ['Menjelaskan konsep akhlak', 'Menerapkan dalam kehidupan'],
          assessmentCriteria: ['Pemahaman konsep', 'Implementasi nilai']
        }
      ],
      materials: [],
      assessments: [],
      coreCompetencies: [],
      basicCompetencies: [],
      weeklySchedule: []
    };
  }

  // Create Civics Education curriculum
  private createCivicsEducationCurriculum(): CurriculumMap {
    return {
      id: 'curriculum_pkn_001',
      subjectId: 'SUBJ008',
      subjectName: 'Pendidikan Kewarganegaraan',
      grade: 12,
      major: 'IPA',
      semester: 1,
      objectives: [
        {
          id: 'pkn_obj_001',
          code: '3.1.1',
          description: 'Memahami sistem demokrasi di Indonesia',
          competency: 'knowledge',
          level: 'intermediate',
          subjectId: 'SUBJ008',
          semester: 1,
          indicators: ['Menjelaskan demokrasi', 'Menganalisis implementasi'],
          assessmentCriteria: ['Pemahaman konsep', 'Analisis implementasi']
        }
      ],
      materials: [],
      assessments: [],
      coreCompetencies: [],
      basicCompetencies: [],
      weeklySchedule: []
    };
  }

  // Setup learning paths for different student needs
  private setupLearningPaths(): void {
    const existingPaths = localStorage.getItem(this.LEARNING_PATHS_KEY);
    if (existingPaths) return;

    const learningPaths: LearningPath[] = [
      {
        id: 'path_remedial_mat',
        name: 'Pemantulan Matematika Dasar',
        description: 'Learning path untuk siswa yang perlu pemantulan konsep dasar matematika',
        subjectId: 'SUBJ001',
        targetAudience: 'remedial',
        materials: ['mat_mat_001', 'mat_mat_002'],
        estimatedDuration: 6,
        prerequisites: [],
        outcomes: ['Pemahaman fungsi dasar', 'Kemampuan komposisi fungsi'],
        isAdaptive: true
      },
      {
        id: 'path_enrichment_mat',
        name: 'Pengayaan Kalkulus',
        description: 'Learning path untuk siswa yang ingin mendalami kalkulus',
        subjectId: 'SUBJ001',
        targetAudience: 'enrichment',
        materials: ['mat_mat_003', 'mat_mat_004'],
        estimatedDuration: 8,
        prerequisites: ['mat_mat_001'],
        outcomes: ['Mastery turunan', 'Analisis fungsi lanjutan'],
        isAdaptive: true
      }
    ];

    localStorage.setItem(this.LEARNING_PATHS_KEY, JSON.stringify(learningPaths));
  }

  // Initialize progress tracking
  private initializeProgressTracking(): void {
    const existingProgress = localStorage.getItem(this.PROGRESS_KEY);
    if (existingProgress) return;

    const sampleProgress: StudentProgress = {
      studentId: 'STU001',
      curriculumMaps: {
        'curriculum_mat_001': {
          completedObjectives: ['mat_obj_001'],
          completedMaterials: ['mat_mat_001'],
          completedAssessments: [
            {
              assessmentId: 'mat_ass_001',
              score: 85,
              attempts: 1,
              completedAt: new Date().toISOString(),
              timeSpent: 25
            }
          ],
          currentWeek: 2,
          masteryLevel: {
            'mat_obj_001': 'mastered',
            'mat_obj_002': 'in_progress',
            'mat_obj_003': 'not_started'
          },
          timeSpent: 120,
          lastAccess: new Date().toISOString()
        }
      }
    };

    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(sampleProgress));
  }

  // Setup automated assessments
  private setupAutomatedAssessments(): void {
    // This would integrate with the assessment system
    console.log('🎓 Automated assessment system initialized');
  }

  // Get curriculum map by subject
  getCurriculumMap(subjectId: string, semester: number): CurriculumMap | null {
    const maps = this.getAllCurriculumMaps();
    return maps.find(map => map.subjectId === subjectId && map.semester === semester) || null;
  }

  // Get all curriculum maps
  getAllCurriculumMaps(): CurriculumMap[] {
    const maps = localStorage.getItem(this.CURRICULUM_KEY);
    return maps ? JSON.parse(maps) : [];
  }

  // Get student progress
  getStudentProgress(studentId: string): StudentProgress | null {
    const allProgress = localStorage.getItem(this.PROGRESS_KEY);
    if (!allProgress) return null;

    const progressData = JSON.parse(allProgress);
    return progressData.find((p: StudentProgress) => p.studentId === studentId) || null;
  }

  // Update student progress
  updateStudentProgress(studentId: string, curriculumId: string, progress: any): void {
    const allProgress = JSON.parse(localStorage.getItem(this.PROGRESS_KEY) || '[]');
    const studentIndex = allProgress.findIndex((p: StudentProgress) => p.studentId === studentId);

    if (studentIndex === -1) {
      // Create new student progress
      allProgress.push({
        studentId,
        curriculumMaps: {
          [curriculumId]: progress
        }
      });
    } else {
      // Update existing student progress
      if (!allProgress[studentIndex].curriculumMaps[curriculumId]) {
        allProgress[studentIndex].curriculumMaps[curriculumId] = {};
      }
      allProgress[studentIndex].curriculumMaps[curriculumId] = {
        ...allProgress[studentIndex].curriculumMaps[curriculumId],
        ...progress,
        lastAccess: new Date().toISOString()
      };
    }

    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress));
  }

  // Get learning materials for subject
  getLearningMaterials(subjectId: string, semester: number): LearningMaterial[] {
    const curriculum = this.getCurriculumMap(subjectId, semester);
    return curriculum ? curriculum.materials : [];
  }

  // Get assessments for subject
  getAssessments(subjectId: string, semester: number): AssessmentTool[] {
    const curriculum = this.getCurriculumMap(subjectId, semester);
    return curriculum ? curriculum.assessments : [];
  }

  // Get learning paths
  getLearningPaths(subjectId?: string, audience?: 'remedial' | 'regular' | 'enrichment'): LearningPath[] {
    const paths = localStorage.getItem(this.LEARNING_PATHS_KEY);
    let allPaths: LearningPath[] = paths ? JSON.parse(paths) : [];

    if (subjectId) {
      allPaths = allPaths.filter(path => path.subjectId === subjectId);
    }

    if (audience) {
      allPaths = allPaths.filter(path => path.targetAudience === audience);
    }

    return allPaths;
  }

  // Submit assessment result
  submitAssessmentResult(studentId: string, assessmentId: string, result: {
    score: number;
    attempts: number;
    timeSpent: number;
    answers?: any;
  }): void {
    const results = JSON.parse(localStorage.getItem(this.ASSESSMENT_RESULTS_KEY) || '[]');
    
    results.push({
      id: `result_${Date.now()}`,
      studentId,
      assessmentId,
      ...result,
      submittedAt: new Date().toISOString()
    });

    localStorage.setItem(this.ASSESSMENT_RESULTS_KEY, JSON.stringify(results));

    // Update student progress
    this.updateProgressFromAssessment(studentId, assessmentId, result.score);
  }

  // Update progress based on assessment result
  private updateProgressFromAssessment(studentId: string, assessmentId: string, score: number): void {
    const allMaps = this.getAllCurriculumMaps();
    const assessment = allMaps
      .flatMap(map => map.assessments)
      .find(ass => ass.id === assessmentId);

    if (!assessment) return;

    const curriculum = allMaps.find(map => map.assessments.some(ass => ass.id === assessmentId));
    if (!curriculum) return;

    const studentProgress = this.getStudentProgress(studentId);
    if (!studentProgress) return;

    const curriculumProgress = studentProgress.curriculumMaps[curriculum.id];
    if (!curriculumProgress) return;

    // Update mastery level for objectives
    assessment.objectives.forEach(objectiveId => {
      if (score >= assessment.passingScore) {
        curriculumProgress.masteryLevel[objectiveId] = 'mastered';
      } else if (score >= assessment.passingScore * 0.6) {
        curriculumProgress.masteryLevel[objectiveId] = 'in_progress';
      } else {
        curriculumProgress.masteryLevel[objectiveId] = 'needs_review';
      }
    });

    // Add to completed assessments
    curriculumProgress.completedAssessments.push({
      assessmentId,
      score,
      attempts: 1,
      completedAt: new Date().toISOString(),
      timeSpent: 0
    });

    this.updateStudentProgress(studentId, curriculum.id, curriculumProgress);
    
    // Trigger adaptive learning path update
    this.updateAdaptiveLearningPath(studentId, curriculum.subjectId, score);
  }

  // AI-Powered Adaptive Learning Path Management
  updateAdaptiveLearningPath(studentId: string, subjectId: string, recentScore: number): void {
    const performance = this.analyzeStudentPerformance(studentId, subjectId);
    const currentPath = this.getAdaptiveLearningPath(studentId, subjectId);
    
    let newPathType: 'remedial' | 'regular' | 'enrichment' = 'regular';
    let newLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    
    // AI-driven path determination
    if (performance.averageScore < 70 || performance.masteryLevel === 'needs_review') {
      newPathType = 'remedial';
      newLevel = 'beginner';
    } else if (performance.averageScore >= 85 && performance.masteryLevel === 'mastered') {
      newPathType = 'enrichment';
      newLevel = 'advanced';
    }
    
    // Generate personalized recommendations
    const recommendations = this.generatePersonalizedRecommendations(performance, newPathType);
    
    const updatedPath: AdaptiveLearningPath = {
      id: currentPath?.id || `path_${studentId}_${subjectId}_${Date.now()}`,
      studentId,
      subjectId,
      pathType: newPathType,
      currentLevel: newLevel,
      progress: this.calculatePathProgress(performance),
      recommendedMaterials: recommendations.materials,
      recommendedAssessments: recommendations.assessments,
      adaptiveRules: this.generateAdaptiveRules(performance),
      lastUpdated: new Date().toISOString(),
      estimatedCompletion: this.estimateCompletionTime(performance, newPathType)
    };
    
    this.saveAdaptiveLearningPath(updatedPath);
  }

  // Analyze student performance using AI
  analyzeStudentPerformance(studentId: string, subjectId: string): StudentPerformanceMetrics {
    const studentProgress = this.getStudentProgress(studentId);
    const allMaps = this.getAllCurriculumMaps();
    const subjectMap = allMaps.find(map => map.subjectId === subjectId);
    
    if (!studentProgress || !subjectMap) {
      return this.getDefaultMetrics(studentId, subjectId);
    }
    
    const curriculumProgress = studentProgress.curriculumMaps[subjectMap.id];
    const assessmentResults = this.getAssessmentResults(studentId, subjectId);
    
    // Calculate performance metrics
    const averageScore = assessmentResults.length > 0 
      ? assessmentResults.reduce((sum, result) => sum + result.score, 0) / assessmentResults.length 
      : 0;
    
    const masteryLevel = this.determineMasteryLevel(averageScore, curriculumProgress);
    const strengths = this.identifyStrengths(assessmentResults, subjectMap);
    const weaknesses = this.identifyWeaknesses(assessmentResults, subjectMap);
    const learningStyle = this.detectLearningStyle(studentProgress);
    const paceOfLearning = this.determineLearningPace(assessmentResults);
    const engagementScore = this.calculateEngagementScore(studentProgress);
    const timeSpent = this.calculateTimeSpent(studentProgress, subjectId);
    
    return {
      studentId,
      subjectId,
      averageScore,
      masteryLevel,
      strengths,
      weaknesses,
      learningStyle,
      paceOfLearning,
      engagementScore,
      timeSpent,
      lastActivity: studentProgress.lastActivity || new Date().toISOString()
    };
  }

  // Generate personalized learning recommendations
  private generatePersonalizedRecommendations(
    performance: StudentPerformanceMetrics, 
    pathType: 'remedial' | 'regular' | 'enrichment'
  ): { materials: string[]; assessments: string[] } {
    const allMaps = this.getAllCurriculumMaps();
    const subjectMap = allMaps.find(map => map.subjectId === performance.subjectId);
    
    if (!subjectMap) return { materials: [], assessments: [] };
    
    let recommendedMaterials: string[] = [];
    let recommendedAssessments: string[] = [];
    
    // Filter materials based on learning style and path type
    recommendedMaterials = subjectMap.materials
      .filter(material => {
        // Match learning style
        if (performance.learningStyle === 'visual' && !material.type.includes('video') && !material.type.includes('interactive')) {
          return false;
        }
        if (performance.learningStyle === 'reading' && material.type !== 'document') {
          return false;
        }
        
        // Match difficulty level
        if (pathType === 'remedial' && material.difficulty === 'advanced') return false;
        if (pathType === 'enrichment' && material.difficulty === 'beginner') return false;
        
        // Address weaknesses
        return material.tags.some(tag => performance.weaknesses.includes(tag));
      })
      .slice(0, 5) // Limit to top 5 recommendations
      .map(material => material.id);
    
    // Recommend assessments based on mastery level
    recommendedAssessments = subjectMap.assessments
      .filter(assessment => {
        if (pathType === 'remedial' && assessment.type === 'exam') return false;
        if (pathType === 'enrichment' && assessment.type === 'quiz') return false;
        return true;
      })
      .slice(0, 3)
      .map(assessment => assessment.id);
    
    return { materials: recommendedMaterials, assessments: recommendedAssessments };
  }

  // Generate adaptive learning rules
  private generateAdaptiveRules(performance: StudentPerformanceMetrics): Array<{
    condition: string;
    action: string;
    priority: number;
  }> {
    const rules = [];
    
    // Performance-based rules
    if (performance.averageScore < 60) {
      rules.push({
        condition: 'score_below_60',
        action: 'provide_remedial_content',
        priority: 1
      });
    }
    
    if (performance.engagementScore < 50) {
      rules.push({
        condition: 'low_engagement',
        action: 'send_motivational_content',
        priority: 2
      });
    }
    
    if (performance.paceOfLearning === 'slow') {
      rules.push({
        condition: 'slow_pace',
        action: 'provide_additional_practice',
        priority: 3
      });
    }
    
    return rules;
  }

  // Helper methods for adaptive learning
  private determineMasteryLevel(averageScore: number, progress: any): 'not_started' | 'in_progress' | 'mastered' | 'needs_review' {
    if (averageScore === 0) return 'not_started';
    if (averageScore >= 85) return 'mastered';
    if (averageScore >= 60) return 'in_progress';
    return 'needs_review';
  }

  private identifyStrengths(results: any[], subjectMap: CurriculumMap): string[] {
    // Analyze assessment results to identify strong areas
    const strengths = [];
    const topicPerformance = {};
    
    results.forEach(result => {
      const assessment = subjectMap.assessments.find(a => a.id === result.assessmentId);
      if (assessment && result.score >= 80) {
        assessment.objectives.forEach(objectiveId => {
          const objective = subjectMap.objectives.find(o => o.id === objectiveId);
          if (objective) {
            strengths.push(objective.description);
          }
        });
      }
    });
    
    return [...new Set(strengths)]; // Remove duplicates
  }

  private identifyWeaknesses(results: any[], subjectMap: CurriculumMap): string[] {
    const weaknesses = [];
    
    results.forEach(result => {
      const assessment = subjectMap.assessments.find(a => a.id === result.assessmentId);
      if (assessment && result.score < 60) {
        assessment.objectives.forEach(objectiveId => {
          const objective = subjectMap.objectives.find(o => o.id === objectiveId);
          if (objective) {
            weaknesses.push(objective.description);
          }
        });
      }
    });
    
    return [...new Set(weaknesses)];
  }

  private detectLearningStyle(progress: any): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    // Simple heuristic based on material interaction
    // In production, this would use more sophisticated ML algorithms
    const materialPreferences = progress.materialPreferences || {};
    
    const maxPreference = Math.max(...Object.values(materialPreferences));
    const preferredType = Object.keys(materialPreferences).find(key => materialPreferences[key] === maxPreference);
    
    return preferredType as any || 'visual';
  }

  private determineLearningPace(results: any[]): 'slow' | 'normal' | 'fast' {
    if (results.length < 2) return 'normal';
    
    const timeBetweenAssessments = results.slice(1).map((result, index) => {
      const prevResult = results[index];
      return new Date(result.submittedAt).getTime() - new Date(prevResult.submittedAt).getTime();
    });
    
    const avgTime = timeBetweenAssessments.reduce((sum, time) => sum + time, 0) / timeBetweenAssessments.length;
    const days = avgTime / (1000 * 60 * 60 * 24);
    
    if (days > 7) return 'slow';
    if (days < 3) return 'fast';
    return 'normal';
  }

  private calculateEngagementScore(progress: any): number {
    // Calculate based on login frequency, material completion, etc.
    const loginFrequency = progress.loginFrequency || 0;
    const materialCompletion = progress.materialCompletion || 0;
    const assessmentParticipation = progress.assessmentParticipation || 0;
    
    return Math.round((loginFrequency + materialCompletion + assessmentParticipation) / 3);
  }

  private calculateTimeSpent(progress: any, subjectId: string): number {
    return progress.timeSpentBySubject?.[subjectId] || 0;
  }

  private calculatePathProgress(performance: StudentPerformanceMetrics): number {
    // Calculate overall progress in the learning path
    return Math.round(
      (performance.averageScore / 100) * 0.6 + 
      (performance.engagementScore / 100) * 0.4
    ) * 100;
  }

  private estimateCompletionTime(performance: StudentPerformanceMetrics, pathType: string): string {
    const baseWeeks = pathType === 'remedial' ? 8 : pathType === 'enrichment' ? 4 : 6;
    const paceMultiplier = performance.paceOfLearning === 'slow' ? 1.5 : performance.paceOfLearning === 'fast' ? 0.75 : 1;
    
    const estimatedWeeks = Math.round(baseWeeks * paceMultiplier);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (estimatedWeeks * 7));
    
    return completionDate.toISOString();
  }

  private getDefaultMetrics(studentId: string, subjectId: string): StudentPerformanceMetrics {
    return {
      studentId,
      subjectId,
      averageScore: 0,
      masteryLevel: 'not_started',
      strengths: [],
      weaknesses: [],
      learningStyle: 'visual',
      paceOfLearning: 'normal',
      engagementScore: 0,
      timeSpent: 0,
      lastActivity: new Date().toISOString()
    };
  }

  // Adaptive Learning Path Storage Methods
  getAdaptiveLearningPath(studentId: string, subjectId: string): AdaptiveLearningPath | null {
    const paths = JSON.parse(localStorage.getItem('adaptive_learning_paths') || '[]');
    return paths.find(path => path.studentId === studentId && path.subjectId === subjectId) || null;
  }

  saveAdaptiveLearningPath(path: AdaptiveLearningPath): void {
    const paths = JSON.parse(localStorage.getItem('adaptive_learning_paths') || '[]');
    const existingIndex = paths.findIndex(p => p.studentId === path.studentId && p.subjectId === path.subjectId);
    
    if (existingIndex >= 0) {
      paths[existingIndex] = path;
    } else {
      paths.push(path);
    }
    
    localStorage.setItem('adaptive_learning_paths', JSON.stringify(paths));
  }

  getAssessmentResults(studentId: string, subjectId?: string): any[] {
    const results = JSON.parse(localStorage.getItem('assessment_results') || '[]');
    let studentResults = results.filter(result => result.studentId === studentId);
    
    if (subjectId) {
      const allMaps = this.getAllCurriculumMaps();
      const subjectAssessments = allMaps
        .filter(map => map.subjectId === subjectId)
        .flatMap(map => map.assessments.map(a => a.id));
      
      studentResults = studentResults.filter(result => subjectAssessments.includes(result.assessmentId));
    }
    
    return studentResults;
  }

  // Generate curriculum report
  generateCurriculumReport(studentId: string, subjectId?: string): any {
    const studentProgress = this.getStudentProgress(studentId);
    if (!studentProgress) return null;

    const allMaps = this.getAllCurriculumMaps();
    const relevantMaps = subjectId 
      ? allMaps.filter(map => map.subjectId === subjectId)
      : allMaps;

    const report = {
      studentId,
      generatedAt: new Date().toISOString(),
      subjects: relevantMaps.map(map => {
        const progress = studentProgress.curriculumMaps[map.id];
        return {
          subjectName: map.subjectName,
          semester: map.semester,
          progress: progress || {},
          completionRate: this.calculateCompletionRate(map, progress),
          masteryOverview: this.calculateMasteryOverview(map, progress),
          recommendations: this.generateRecommendations(map, progress)
        };
      })
    };

    return report;
  }

  // Calculate completion rate
  private calculateCompletionRate(map: CurriculumMap, progress: any): number {
    if (!progress) return 0;

    const totalObjectives = map.objectives.length;
    const completedObjectives = progress.completedObjectives?.length || 0;

    return Math.round((completedObjectives / totalObjectives) * 100);
  }

  // Calculate mastery overview
  private calculateMasteryOverview(map: CurriculumMap, progress: any): any {
    if (!progress || !progress.masteryLevel) return {};

    const masteryLevels = progress.masteryLevel;
    const total = Object.keys(masteryLevels).length;

    return {
      mastered: Object.values(masteryLevels).filter((level: any) => level === 'mastered').length,
      inProgress: Object.values(masteryLevels).filter((level: any) => level === 'in_progress').length,
      needsReview: Object.values(masteryLevels).filter((level: any) => level === 'needs_review').length,
      notStarted: Object.values(masteryLevels).filter((level: any) => level === 'not_started').length,
      total
    };
  }

  // Generate recommendations
  private generateRecommendations(map: CurriculumMap, progress: any): string[] {
    const recommendations: string[] = [];

    if (!progress) {
      recommendations.push('Mulai pembelajaran dengan materi dasar');
      return recommendations;
    }

    const mastery = progress.masteryLevel || {};
    const needsReview = Object.entries(mastery)
      .filter(([_, level]) => level === 'needs_review')
      .map(([objectiveId, _]) => objectiveId);

    if (needsReview.length > 0) {
      recommendations.push('Fokus pada materi yang perlu review');
    }

    const inProgress = Object.entries(mastery)
      .filter(([_, level]) => level === 'in_progress')
      .map(([objectiveId, _]) => objectiveId);

    if (inProgress.length > 0) {
      recommendations.push('Lanjutkan pembelajaran yang sedang berjalan');
    }

    const notStarted = Object.entries(mastery)
      .filter(([_, level]) => level === 'not_started')
      .map(([objectiveId, _]) => objectiveId);

    if (notStarted.length > 0) {
      recommendations.push('Mulai pembelajaran materi baru');
    }

    return recommendations;
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  try {
    const service = CurriculumService.getInstance();
    service.initialize();
    console.log('🎓 Curriculum Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Curriculum Service:', error);
  }
}

export { CurriculumService };