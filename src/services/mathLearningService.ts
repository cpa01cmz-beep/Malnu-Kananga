// Interactive Mathematics Learning Materials for MA Malnu Kananga
// Comprehensive digital mathematics curriculum with interactive elements

export interface MathModule {
  id: string;
  title: string;
  description: string;
  grade: number;
  semester: number;
  chapter: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  learningObjectives: string[];
  prerequisites: string[];
  topics: MathTopic[];
  interactiveElements: InteractiveElement[];
  assessments: MathAssessment[];
  resources: MathResource[];
}

export interface MathTopic {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'formula' | 'example' | 'application';
  visualizations: Visualization[];
  stepByStepExplanation: Step[];
  commonMistakes: CommonMistake[];
  practiceProblems: PracticeProblem[];
}

export interface InteractiveElement {
  id: string;
  type: 'graphing_calculator' | 'geometry_builder' | 'equation_solver' | 'simulation' | 'game';
  title: string;
  description: string;
  instructions: string;
  component: string; // React component name
  data: any;
  learningOutcome: string;
}

export interface Visualization {
  id: string;
  type: 'graph' | 'chart' | 'animation' | 'diagram' | '3d_model';
  title: string;
  description: string;
  data: any;
  interactive: boolean;
}

export interface Step {
  id: string;
  order: number;
  title: string;
  explanation: string;
  formula?: string;
  visualAid?: string;
  tip?: string;
}

export interface CommonMistake {
  id: string;
  mistake: string;
  explanation: string;
  correctApproach: string;
  example: string;
}

export interface PracticeProblem {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'calculation' | 'proof';
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string;
  explanation: string;
  hints: string[];
  steps?: Step[];
}

export interface MathAssessment {
  id: string;
  title: string;
  type: 'quiz' | 'test' | 'project';
  timeLimit: number;
  questions: AssessmentQuestion[];
  passingScore: number;
  maxScore: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'calculation' | 'proof' | 'application';
  points: number;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  formula?: string;
  diagram?: string;
}

export interface MathResource {
  id: string;
  type: 'video' | 'pdf' | 'website' | 'applet' | 'worksheet';
  title: string;
  description: string;
  url: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Mathematics Curriculum Data
export const mathematicsCurriculum: MathModule[] = [
  {
    id: 'mat12_ch1_linear',
    title: 'Persamaan dan Pertidaksamaan Linear',
    description: 'Memahami dan menyelesaikan persamaan serta pertidaksamaan linear satu variabel',
    grade: 12,
    semester: 1,
    chapter: 'Bab 1: Aljabar',
    difficulty: 'basic',
    estimatedTime: 120,
    learningObjectives: [
      'Mengidentifikasi persamaan linear satu variabel',
      'Menyelesaikan persamaan linear dengan berbagai metode',
      'Memahami konsep pertidaksamaan linear',
      'Mengaplikasikan persamaan linear dalam masalah nyata'
    ],
    prerequisites: ['Operasi aljabar dasar', 'Konsep variabel'],
    topics: [
      {
        id: 'topic_1_1',
        title: 'Pengertian Persamaan Linear',
        content: 'Persamaan linear satu variabel adalah persamaan yang pangkat tertinggi variabelnya adalah satu dan hanya memiliki satu variabel.',
        type: 'concept',
        visualizations: [
          {
            id: 'viz_1_1',
            type: 'graph',
            title: 'Grafik Persamaan Linear',
            description: 'Visualisasi persamaan linear pada garis bilangan',
            data: { equation: '2x + 3 = 7', solution: 2 },
            interactive: true
          }
        ],
        stepByStepExplanation: [
          {
            id: 'step_1_1',
            order: 1,
            title: 'Identifikasi persamaan',
            explanation: 'Periksa apakah persamaan memiliki bentuk ax + b = c',
            formula: 'ax + b = c',
            tip: 'Variabel hanya boleh pangkat satu'
          },
          {
            id: 'step_1_2',
            order: 2,
            title: 'Isolasi variabel',
            explanation: 'Pindahkan konstanta ke sisi kanan',
            formula: 'ax = c - b',
            tip: 'Ingat perubahan tanda saat pindah ruas'
          },
          {
            id: 'step_1_3',
            order: 3,
            title: 'Selesaikan untuk x',
            explanation: 'Bagi kedua sisi dengan koefisien variabel',
            formula: 'x = (c - b) / a',
            tip: 'Periksa kembali hasil dengan substitusi'
          }
        ],
        commonMistakes: [
          {
            id: 'mistake_1_1',
            mistake: 'Lupa mengubah tanda saat memindahkan ruas',
            explanation: 'Saat memindahkan suku ke ruas lain, tanda harus berubah',
            correctApproach: '2x + 3 = 7 → 2x = 7 - 3, bukan 2x = 7 + 3',
            example: 'Salah: 2x = 10, Benar: 2x = 4'
          }
        ],
        practiceProblems: [
          {
            id: 'prob_1_1',
            question: 'Selesaikan persamaan: 3x - 5 = 16',
            type: 'calculation',
            difficulty: 'easy',
            answer: 'x = 7',
            explanation: '3x = 16 + 5 → 3x = 21 → x = 21/3 = 7',
            hints: ['Pindahkan konstanta ke ruas kanan', 'Bagi dengan koefisien x']
          }
        ]
      },
      {
        id: 'topic_1_2',
        title: 'Metode Penyelesaian Persamaan Linear',
        content: 'Berbagai metode untuk menyelesaikan persamaan linear satu variabel',
        type: 'formula',
        visualizations: [
          {
            id: 'viz_1_2',
            type: 'animation',
            title: 'Animasi Penyelesaian Langkah demi Langkah',
            description: 'Proses penyelesaian persamaan linear',
            data: { steps: ['substitution', 'simplification', 'division'] },
            interactive: true
          }
        ],
        stepByStepExplanation: [
          {
            id: 'step_1_4',
            order: 1,
            title: 'Metode Substitusi',
            explanation: 'Ganti variabel dengan nilai yang dicari',
            formula: 'Jika x = k, substitusi ke persamaan asli',
            tip: 'Gunakan untuk memeriksa jawaban'
          }
        ],
        commonMistakes: [
          {
            id: 'mistake_1_2',
            mistake: 'Kesalahan operasi aljabar',
            explanation: 'Salah dalam penjumlahan/pengurangan atau perkalian/pembagian',
            correctApproach: 'Periksa setiap langkah operasi dengan teliti',
            example: '2(x + 3) = 10 → 2x + 6 = 10, bukan 2x + 3 = 10'
          }
        ],
        practiceProblems: [
          {
            id: 'prob_1_2',
            question: 'Selesaikan: 5(x - 2) = 20',
            type: 'calculation',
            difficulty: 'medium',
            answer: 'x = 6',
            explanation: '5x - 10 = 20 → 5x = 30 → x = 6',
            hints: ['Distribusikan 5 ke dalam kurung', 'Kumpulkan suku-suku x']
          }
        ]
      }
    ],
    interactiveElements: [
      {
        id: 'inter_1_1',
        type: 'equation_solver',
        title: 'Linear Equation Solver',
        description: 'Alat interaktif untuk menyelesaikan persamaan linear',
        instructions: 'Masukkan persamaan linear dan lihat langkah penyelesaiannya',
        component: 'LinearEquationSolver',
        data: { supportedFormats: ['ax + b = c', 'a(x + b) = c'] },
        learningOutcome: 'Memahami proses penyelesaian persamaan linear'
      },
      {
        id: 'inter_1_2',
        type: 'graphing_calculator',
        title: 'Visual Graph Plotter',
        description: 'Gambarkan persamaan linear pada grafik',
        instructions: 'Masukkan koefisien untuk melihat grafik',
        component: 'LinearGraphPlotter',
        data: { axes: ['x', 'y'], range: [-10, 10] },
        learningOutcome: 'Memvisualisasikan hubungan linear'
      }
    ],
    assessments: [
      {
        id: 'assess_1_1',
        title: 'Quiz Persamaan Linear',
        type: 'quiz',
        timeLimit: 30,
        questions: [
          {
            id: 'q1_1',
            question: 'Manakah yang merupakan persamaan linear satu variabel?',
            type: 'multiple_choice',
            points: 10,
            options: ['x² + 2x = 5', '3x - 7 = 8', 'x + y = 10', '2x² = 18'],
            correctAnswer: '3x - 7 = 8',
            explanation: 'Persamaan linear memiliki variabel berpangkat satu dan hanya satu variabel'
          },
          {
            id: 'q1_2',
            question: 'Selesaikan: 4x + 9 = 25',
            type: 'calculation',
            points: 15,
            correctAnswer: 'x = 4',
            explanation: '4x = 25 - 9 → 4x = 16 → x = 4'
          }
        ],
        passingScore: 70,
        maxScore: 100
      }
    ],
    resources: [
      {
        id: 'res_1_1',
        type: 'video',
        title: 'Video Tutorial Persamaan Linear',
        description: 'Penjelasan visual konsep persamaan linear',
        url: 'https://example.com/linear-equations-video',
        duration: 15,
        difficulty: 'beginner'
      },
      {
        id: 'res_1_2',
        type: 'pdf',
        title: 'Lembar Kerja Siswa',
        description: 'Latihan soal persamaan linear',
        url: '/worksheets/linear-equations.pdf',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'mat12_ch2_quadratic',
    title: 'Persamaan Kuadrat',
    description: 'Konsep dan penyelesaian persamaan kuadrat',
    grade: 12,
    semester: 1,
    chapter: 'Bab 1: Aljabar',
    difficulty: 'intermediate',
    estimatedTime: 180,
    learningObjectives: [
      'Mengidentifikasi bentuk persamaan kuadrat',
      'Menyelesaikan dengan faktorisasi',
      'Menggunakan rumus kuadrat',
      'Mengaplikasikan dalam masalah nyata'
    ],
    prerequisites: ['Persamaan linear', 'Operasi aljabar lanjutan'],
    topics: [
      {
        id: 'topic_2_1',
        title: 'Bentuk Umum Persamaan Kuadrat',
        content: 'Persamaan kuadrat memiliki bentuk umum ax² + bx + c = 0, dengan a ≠ 0',
        type: 'concept',
        visualizations: [
          {
            id: 'viz_2_1',
            type: 'graph',
            title: 'Parabola Persamaan Kuadrat',
            description: 'Grafik fungsi kuadrat membentuk parabola',
            data: { equation: 'x² - 4x + 3 = 0', roots: [1, 3] },
            interactive: true
          }
        ],
        stepByStepExplanation: [
          {
            id: 'step_2_1',
            order: 1,
            title: 'Identifikasi koefisien',
            explanation: 'Tentukan nilai a, b, dan c dari persamaan',
            formula: 'ax² + bx + c = 0',
            tip: 'Pastikan a ≠ 0'
          }
        ],
        commonMistakes: [
          {
            id: 'mistake_2_1',
            mistake: 'Salah mengidentifikasi koefisien',
            explanation: 'Perhatikan tanda negatif pada koefisien',
            correctApproach: 'Dalam x² - 5x + 6 = 0, maka a = 1, b = -5, c = 6',
            example: 'Salah: b = 5, Benar: b = -5'
          }
        ],
        practiceProblems: [
          {
            id: 'prob_2_1',
            question: 'Identifikasi a, b, c dari: 2x² - 8x + 6 = 0',
            type: 'short_answer',
            difficulty: 'easy',
            answer: 'a = 2, b = -8, c = 6',
            explanation: 'Bandingkan dengan bentuk umum ax² + bx + c = 0',
            hints: ['Perhatikan tanda setiap suku', 'a adalah koefisien x²']
          }
        ]
      }
    ],
    interactiveElements: [
      {
        id: 'inter_2_1',
        type: 'graphing_calculator',
        title: 'Quadratic Function Grapher',
        description: 'Visualisasikan fungsi kuadrat dan akar-akarnya',
        instructions: 'Ubah nilai a, b, c untuk melihat perubahan grafik',
        component: 'QuadraticGrapher',
        data: { parameters: ['a', 'b', 'c'], vertex: true, roots: true },
        learningOutcome: 'Memahami hubungan koefisien dengan bentuk grafik'
      }
    ],
    assessments: [
      {
        id: 'assess_2_1',
        title: 'Tes Persamaan Kuadrat',
        type: 'test',
        timeLimit: 45,
        questions: [
          {
            id: 'q2_1',
            question: 'Selesaikan dengan faktorisasi: x² - 7x + 12 = 0',
            type: 'calculation',
            points: 20,
            correctAnswer: 'x = 3 atau x = 4',
            explanation: '(x - 3)(x - 4) = 0 → x = 3 atau x = 4'
          }
        ],
        passingScore: 75,
        maxScore: 100
      }
    ],
    resources: [
      {
        id: 'res_2_1',
        type: 'applet',
        title: 'Interactive Quadratic Explorer',
        description: 'Eksplorasi interaktif persamaan kuadrat',
        url: '/applets/quadratic-explorer',
        difficulty: 'intermediate'
      }
    ]
  }
];

// Interactive Mathematics Learning Service
export class MathLearningService {
  private modules: MathModule[] = mathematicsCurriculum;

  // Get module by ID
  getModule(moduleId: string): MathModule | null {
    return this.modules.find(module => module.id === moduleId) || null;
  }

  // Get modules by grade and semester
  getModulesByGrade(grade: number, semester?: number): MathModule[] {
    return this.modules.filter(module => 
      module.grade === grade && 
      (semester ? module.semester === semester : true)
    );
  }

  // Get modules by difficulty
  getModulesByDifficulty(difficulty: 'basic' | 'intermediate' | 'advanced'): MathModule[] {
    return this.modules.filter(module => module.difficulty === difficulty);
  }

  // Search modules by keyword
  searchModules(keyword: string): MathModule[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.modules.filter(module =>
      module.title.toLowerCase().includes(lowerKeyword) ||
      module.description.toLowerCase().includes(lowerKeyword) ||
      module.topics.some(topic => 
        topic.title.toLowerCase().includes(lowerKeyword) ||
        topic.content.toLowerCase().includes(lowerKeyword)
      )
    );
  }

  // Get learning path for student
  getLearningPath(studentLevel: 'beginner' | 'intermediate' | 'advanced'): MathModule[] {
    const difficultyMap = {
      beginner: ['basic'],
      intermediate: ['basic', 'intermediate'],
      advanced: ['basic', 'intermediate', 'advanced']
    };

    return this.modules.filter(module =>
      difficultyMap[studentLevel].includes(module.difficulty)
    ).sort((a, b) => {
      // Sort by grade, then semester, then chapter order
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.chapter.localeCompare(b.chapter);
    });
  }

  // Generate practice problems
  generatePracticeProblems(topicId: string, count: number = 5): PracticeProblem[] {
    const module = this.modules.find(m => m.topics.some(t => t.id === topicId));
    const topic = module?.topics.find(t => t.id === topicId);
    
    if (!topic) return [];

    const problems: PracticeProblem[] = [];
    const templates = topic.practiceProblems;

    for (let i = 0; i < Math.min(count, templates.length); i++) {
      problems.push({
        ...templates[i],
        id: `generated_${topicId}_${Date.now()}_${i}`
      });
    }

    return problems;
  }

  // Check answer and provide feedback
  checkAnswer(problemId: string, studentAnswer: string): {
    correct: boolean;
    feedback: string;
    explanation: string;
    nextSteps?: string[];
  } {
    // Find the problem across all modules
    for (const module of this.modules) {
      for (const topic of module.topics) {
        const problem = topic.practiceProblems.find(p => p.id === problemId);
        if (problem) {
          const isCorrect = this.normalizeAnswer(studentAnswer) === this.normalizeAnswer(problem.answer);
          
          return {
            correct: isCorrect,
            feedback: isCorrect ? 'Benar! Jawaban Anda tepat.' : 'Coba periksa kembali perhitungan Anda.',
            explanation: problem.explanation,
            nextSteps: isCorrect ? this.getNextSteps(module, topic) : this.getRemedialSteps(problem)
          };
        }
      }
    }

    return {
      correct: false,
      feedback: 'Soal tidak ditemukan',
      explanation: '',
      nextSteps: []
    };
  }

  // Normalize answer for comparison
  private normalizeAnswer(answer: string): string {
    return answer.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9=]/g, '');
  }

  // Get next learning steps
  private getNextSteps(module: MathModule, currentTopic: MathTopic): string[] {
    const topicIndex = module.topics.findIndex(t => t.id === currentTopic.id);
    const nextTopic = module.topics[topicIndex + 1];
    
    const steps = ['Lanjut ke topik berikutnya'];
    if (nextTopic) {
      steps.push(`Topik berikutnya: ${nextTopic.title}`);
    } else {
      steps.push('Selesaikan assessment modul');
      steps.push('Eksplorasi modul lanjutan');
    }
    
    return steps;
  }

  // Get remedial steps
  private getRemedialSteps(problem: PracticeProblem): string[] {
    return [
      'Pelajari kembali konsep dasar',
      'Perhatikan contoh soal yang serupa',
      'Gunakan hint yang tersedia',
      'Tonton video tutorial jika tersedia'
    ];
  }

  // Track student progress
  trackProgress(studentId: string, moduleId: string, topicId: string, score: number): void {
    const progressKey = `math_progress_${studentId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
    
    if (!progress[moduleId]) {
      progress[moduleId] = {
        startedAt: new Date().toISOString(),
        topics: {},
        overallScore: 0,
        completed: false
      };
    }
    
    progress[moduleId].topics[topicId] = {
      score,
      completedAt: new Date().toISOString(),
      attempts: (progress[moduleId].topics[topicId]?.attempts || 0) + 1
    };
    
    // Calculate overall score
    const topicScores = Object.values(progress[moduleId].topics);
    progress[moduleId].overallScore = topicScores.reduce((sum, topic: any) => sum + topic.score, 0) / topicScores.length;
    
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }

  // Get student progress
  getStudentProgress(studentId: string): any {
    const progressKey = `math_progress_${studentId}`;
    return JSON.parse(localStorage.getItem(progressKey) || '{}');
  }

  // Generate personalized recommendations
  generateRecommendations(studentId: string): {
    modules: MathModule[];
    topics: MathTopic[];
    resources: MathResource[];
    focusAreas: string[];
  } {
    const progress = this.getStudentProgress(studentId);
    const recommendations = {
      modules: [] as MathModule[],
      topics: [] as MathTopic[],
      resources: [] as MathResource[],
      focusAreas: [] as string[]
    };

    // Analyze progress and recommend
    Object.entries(progress).forEach(([moduleId, moduleProgress]: [string, any]) => {
      const module = this.getModule(moduleId);
      if (!module) return;

      if (moduleProgress.overallScore < 70) {
        // Recommend remedial work
        recommendations.modules.push(module);
        recommendations.focusAreas.push(module.title);
        
        // Find weak topics
        Object.entries(moduleProgress.topics).forEach(([topicId, topicProgress]: [string, any]) => {
          if (topicProgress.score < 60) {
            const topic = module.topics.find(t => t.id === topicId);
            if (topic) {
              recommendations.topics.push(topic);
            }
          }
        });
      } else if (moduleProgress.overallScore >= 85) {
        // Recommend advanced materials
        const advancedModules = this.getModulesByDifficulty('advanced');
        recommendations.modules.push(...advancedModules.slice(0, 2));
      }
    });

    return recommendations;
  }
}

export const mathLearningService = new MathLearningService();