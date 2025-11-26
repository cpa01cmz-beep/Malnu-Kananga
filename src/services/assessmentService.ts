// Automated Assessment Tools for MA Malnu Kananga
// Comprehensive evaluation system with AI-powered analysis

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  timeLimit?: number; // in seconds
  hints?: string[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
  };
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  type: 'quiz' | 'test' | 'assignment' | 'project' | 'presentation' | 'exam';
  subjectId: string;
  subjectName: string;
  grade: number;
  major: string;
  semester: number;
  chapter?: string;
  questions: Question[];
  settings: {
    timeLimit?: number; // in minutes
    attempts: number;
    passingScore: number;
    isGraded: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    autoSubmit: boolean;
  };
  rubric?: {
    criteria: string;
    maxPoints: number;
    levels: Array<{
      score: number;
      description: string;
      indicators: string[];
    }>;
  }[];
  objectives: string[]; // Learning objectives being assessed
  prerequisites: string[];
  estimatedDuration: number; // in minutes
  createdDate: string;
  lastModified: string;
  createdBy: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number; // in seconds
  attempts: number;
  isCorrect?: boolean;
  points?: number;
  feedback?: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  answers: StudentAnswer[];
  score: {
    total: number;
    maxTotal: number;
    percentage: number;
    grade: string;
    gpa?: number;
  };
  timeSpent: number; // in minutes
  startedAt: string;
  submittedAt: string;
  status: 'in_progress' | 'submitted' | 'graded' | 'reviewed';
  feedback?: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  analytics: {
    difficultyDistribution: Record<string, number>;
    timePerQuestion: Record<string, number>;
    accuracyByType: Record<string, number>;
    improvementAreas: string[];
  };
}

export interface AssessmentAnalytics {
  assessmentId: string;
  totalParticipants: number;
  completionRate: number;
  averageScore: number;
  averageTimeSpent: number;
  scoreDistribution: Record<string, number>;
  questionAnalytics: Array<{
    questionId: string;
    correctRate: number;
    averageTime: number;
    difficultyIndex: number;
    discriminationIndex: number;
    commonErrors: string[];
  }>;
  improvementSuggestions: string[];
}

class AssessmentService {
  private static instance: AssessmentService;
  private ASSESSMENTS_KEY = 'malnu_assessments';
  private RESULTS_KEY = 'malnu_assessment_results';
  private ANALYTICS_KEY = 'malnu_assessment_analytics';

  private constructor() {}

  static getInstance(): AssessmentService {
    if (!AssessmentService.instance) {
      AssessmentService.instance = new AssessmentService();
    }
    return AssessmentService.instance;
  }

  // Initialize assessment system
  initialize(): void {
    this.setupDefaultAssessments();
    console.log('📝 Assessment Service initialized successfully');
  }

  // Setup default assessments for all subjects
  private setupDefaultAssessments(): void {
    const existingAssessments = localStorage.getItem(this.ASSESSMENTS_KEY);
    if (existingAssessments) return;

    const defaultAssessments = [
      ...this.createMathematicsAssessments(),
      ...this.createPhysicsAssessments(),
      ...this.createChemistryAssessments(),
      ...this.createBiologyAssessments()
    ];

    localStorage.setItem(this.ASSESSMENTS_KEY, JSON.stringify(defaultAssessments));
  }

  // Create Mathematics assessments
  private createMathematicsAssessments(): Assessment[] {
    return [
      {
        id: 'mat_ass_001',
        title: 'Quiz Fungsi dan Komposisi',
        description: 'Evaluasi pemahaman konsep fungsi dan komposisi fungsi',
        instructions: 'Jawab semua pertanyaan dengan teliti. Waktu: 30 menit',
        type: 'quiz',
        subjectId: 'SUBJ001',
        subjectName: 'Matematika',
        grade: 12,
        major: 'IPA',
        semester: 1,
        chapter: 'Fungsi dan Komposisi',
        questions: [
          {
            id: 'mat_q_001',
            type: 'multiple_choice',
            question: 'Jika f(x) = 2x + 3 dan g(x) = x² - 1, maka (f o g)(2) = ...',
            options: ['7', '9', '11', '13'],
            correctAnswer: '9',
            explanation: '(f o g)(2) = f(g(2)) = f(2² - 1) = f(3) = 2(3) + 3 = 9',
            points: 20,
            difficulty: 'medium',
            tags: ['fungsi', 'komposisi', 'aljabar'],
            timeLimit: 120
          },
          {
            id: 'mat_q_002',
            type: 'essay',
            question: 'Jelaskan perbedaan antara fungsi injektif, surjektif, dan bijektif beserta contohnya!',
            points: 30,
            difficulty: 'hard',
            tags: ['fungsi', 'jenis fungsi', 'matematika diskrit'],
            timeLimit: 600,
            hints: [
              'Pertimbangkan domain dan kodomain',
              'Pikirkan tentang setiap elemen di kodomain'
            ]
          },
          {
            id: 'mat_q_003',
            type: 'short_answer',
            question: 'Tentukan domain dari fungsi f(x) = √(x-3)',
            correctAnswer: 'x ≥ 3',
            explanation: 'Akar kuadrat terdefinisi untuk bilangan non-negatif, sehingga x-3 ≥ 0 → x ≥ 3',
            points: 15,
            difficulty: 'easy',
            tags: ['domain', 'fungsi', 'akar'],
            timeLimit: 180
          }
        ],
        settings: {
          timeLimit: 30,
          attempts: 3,
          passingScore: 70,
          isGraded: true,
          showCorrectAnswers: true,
          allowReview: true,
          shuffleQuestions: false,
          shuffleOptions: true,
          autoSubmit: true
        },
        objectives: ['mat_obj_001'],
        prerequisites: [],
        estimatedDuration: 30,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: 'Guru Matematika'
      },
      {
        id: 'mat_ass_002',
        title: 'Tes Turunan Fungsi',
        description: 'Evaluasi pemahaman konsep turunan dan aplikasinya',
        instructions: 'Tunjukkan langkah-langkah perhitungan dengan jelas',
        type: 'test',
        subjectId: 'SUBJ001',
        subjectName: 'Matematika',
        grade: 12,
        major: 'IPA',
        semester: 1,
        chapter: 'Turunan',
        questions: [
          {
            id: 'mat_q_004',
            type: 'short_answer',
            question: 'Turunan dari f(x) = 3x² - 2x + 5 adalah...',
            correctAnswer: 'f\'(x) = 6x - 2',
            explanation: 'Menggunakan aturan pangkat: turunan dari axⁿ adalah n·axⁿ⁻¹',
            points: 25,
            difficulty: 'easy',
            tags: ['turunan', 'kalkulus', 'aljabar'],
            timeLimit: 180
          },
          {
            id: 'mat_q_005',
            type: 'multiple_choice',
            question: 'Jika f(x) = x³, maka f\'(2) = ...',
            options: ['6', '8', '12', '16'],
            correctAnswer: '12',
            explanation: 'f\'(x) = 3x², sehingga f\'(2) = 3(2)² = 12',
            points: 20,
            difficulty: 'medium',
            tags: ['turunan', 'evaluasi', 'kalkulus'],
            timeLimit: 120
          }
        ],
        settings: {
          timeLimit: 45,
          attempts: 2,
          passingScore: 75,
          isGraded: true,
          showCorrectAnswers: false,
          allowReview: true,
          shuffleQuestions: true,
          shuffleOptions: true,
          autoSubmit: true
        },
        objectives: ['mat_obj_002'],
        prerequisites: ['mat_obj_001'],
        estimatedDuration: 45,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: 'Guru Matematika'
      }
    ];
  }

  // Create Physics assessments
  private createPhysicsAssessments(): Assessment[] {
    return [
      {
        id: 'fis_ass_001',
        title: 'Quiz Gerak Lurus',
        description: 'Evaluasi pemahaman konsep gerak lurus beraturan dan berubah beraturan',
        instructions: 'Gunakan rumus dengan teliti dan sertakan satuan',
        type: 'quiz',
        subjectId: 'SUBJ002',
        subjectName: 'Fisika',
        grade: 12,
        major: 'IPA',
        semester: 1,
        chapter: 'Gerak Lurus',
        questions: [
          {
            id: 'fis_q_001',
            type: 'multiple_choice',
            question: 'Mobil bergerak dengan kecepatan konstan 72 km/jam. Dalam 10 detik, mobil menempuh jarak...',
            options: ['200 m', '720 m', '2000 m', '7200 m'],
            correctAnswer: '200 m',
            explanation: 'v = 72 km/jam = 20 m/s. s = v × t = 20 × 10 = 200 m',
            points: 20,
            difficulty: 'medium',
            tags: ['GLB', 'kecepatan', 'jarak'],
            timeLimit: 180
          },
          {
            id: 'fis_q_002',
            type: 'short_answer',
            question: 'Benda jatuh bebas dari ketinggian 45 meter. Waktu yang dibutuhkan untuk mencapai tanah adalah... (g = 10 m/s²)',
            correctAnswer: '3 detik',
            explanation: 'h = ½gt² → 45 = ½(10)t² → 45 = 5t² → t² = 9 → t = 3 detik',
            points: 25,
            difficulty: 'medium',
            tags: ['jatuh bebas', 'gravitasi', 'waktu'],
            timeLimit: 300
          }
        ],
        settings: {
          timeLimit: 30,
          attempts: 2,
          passingScore: 70,
          isGraded: true,
          showCorrectAnswers: true,
          allowReview: true,
          shuffleQuestions: false,
          shuffleOptions: true,
          autoSubmit: true
        },
        objectives: ['fis_obj_001'],
        prerequisites: [],
        estimatedDuration: 30,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: 'Guru Fisika'
      }
    ];
  }

  // Create Chemistry assessments
  private createChemistryAssessments(): Assessment[] {
    return [
      {
        id: 'kim_ass_001',
        title: 'Quiz Struktur Atom',
        description: 'Evaluasi pemahaman struktur atom dan sistem periodik',
        instructions: 'Jawab dengan teliti dan perhatikan konfigurasi elektron',
        type: 'quiz',
        subjectId: 'SUBJ003',
        subjectName: 'Kimia',
        grade: 12,
        major: 'IPA',
        semester: 1,
        chapter: 'Struktur Atom',
        questions: [
          {
            id: 'kim_q_001',
            type: 'multiple_choice',
            question: 'Unsur dengan konfigurasi elektron 1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹ adalah...',
            options: ['Na', 'K', 'Mg', 'Ca'],
            correctAnswer: 'K',
            explanation: 'Jumlah elektron = 19, sehingga nomor atom = 19 (Kalium)',
            points: 20,
            difficulty: 'medium',
            tags: ['konfigurasi elektron', 'unsur', 'periodik'],
            timeLimit: 180
          },
          {
            id: 'kim_q_002',
            type: 'short_answer',
            question: 'Jumlah proton dalam atom unsur dengan nomor massa 23 dan nomor atom 11 adalah...',
            correctAnswer: '11',
            explanation: 'Nomor atom = jumlah proton = 11',
            points: 15,
            difficulty: 'easy',
            tags: ['proton', 'nomor atom', 'struktur atom'],
            timeLimit: 120
          }
        ],
        settings: {
          timeLimit: 25,
          attempts: 3,
          passingScore: 70,
          isGraded: true,
          showCorrectAnswers: true,
          allowReview: true,
          shuffleQuestions: false,
          shuffleOptions: true,
          autoSubmit: true
        },
        objectives: ['kim_obj_001'],
        prerequisites: [],
        estimatedDuration: 25,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: 'Guru Kimia'
      }
    ];
  }

  // Create Biology assessments
  private createBiologyAssessments(): Assessment[] {
    return [
      {
        id: 'bio_ass_001',
        title: 'Quiz Struktur Sel',
        description: 'Evaluasi pemahaman struktur dan fungsi organel sel',
        instructions: 'Perhatikan fungsi setiap organel dengan teliti',
        type: 'quiz',
        subjectId: 'SUBJ004',
        subjectName: 'Biologi',
        grade: 12,
        major: 'IPA',
        semester: 1,
        chapter: 'Struktur Sel',
        questions: [
          {
            id: 'bio_q_001',
            type: 'matching',
            question: 'Cocokkan organel dengan fungsinya',
            options: [
              'Mitokondria',
              'Kloroplas',
              'Nukleus',
              'Ribosom'
            ],
            correctAnswer: [
              'Pusat energi sel',
              'Tempat fotosintesis',
              'Mengendalikan aktivitas sel',
              'Sintesis protein'
            ],
            explanation: 'Setiap organel memiliki fungsi spesifik dalam menjaga kehidupan sel',
            points: 25,
            difficulty: 'medium',
            tags: ['organel', 'fungsi sel', 'sitologi'],
            timeLimit: 300
          },
          {
            id: 'bio_q_002',
            type: 'multiple_choice',
            question: 'Organel yang hanya ditemukan pada sel tumbuhan adalah...',
            options: ['Mitokondria', 'Kloroplas', 'Lisosom', 'Peroksisom'],
            correctAnswer: 'Kloroplas',
            explanation: 'Kloroplas mengandung klorofil untuk fotosintesis dan hanya ada pada sel tumbuhan',
            points: 20,
            difficulty: 'easy',
            tags: ['organel', 'sel tumbuhan', 'fotosintesis'],
            timeLimit: 120
          }
        ],
        settings: {
          timeLimit: 30,
          attempts: 2,
          passingScore: 70,
          isGraded: true,
          showCorrectAnswers: true,
          allowReview: true,
          shuffleQuestions: false,
          shuffleOptions: true,
          autoSubmit: true
        },
        objectives: ['bio_obj_001'],
        prerequisites: [],
        estimatedDuration: 30,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: 'Guru Biologi'
      }
    ];
  }

  // Get all assessments
  getAssessments(subjectId?: string): Assessment[] {
    const assessments = localStorage.getItem(this.ASSESSMENTS_KEY);
    let allAssessments: Assessment[] = assessments ? JSON.parse(assessments) : [];

    if (subjectId) {
      allAssessments = allAssessments.filter(assessment => assessment.subjectId === subjectId);
    }

    return allAssessments;
  }

  // Get assessment by ID
  getAssessmentById(id: string): Assessment | null {
    const assessments = this.getAssessments();
    return assessments.find(assessment => assessment.id === id) || null;
  }

  // Create new assessment
  createAssessment(assessment: Omit<Assessment, 'id' | 'createdDate' | 'lastModified'>): Assessment {
    const newAssessment: Assessment = {
      ...assessment,
      id: `ass_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const assessments = this.getAssessments();
    assessments.push(newAssessment);
    localStorage.setItem(this.ASSESSMENTS_KEY, JSON.stringify(assessments));

    return newAssessment;
  }

  // Update assessment
  updateAssessment(id: string, updates: Partial<Assessment>): boolean {
    const assessments = this.getAssessments();
    const index = assessments.findIndex(assessment => assessment.id === id);

    if (index === -1) return false;

    assessments[index] = {
      ...assessments[index],
      ...updates,
      lastModified: new Date().toISOString()
    };

    localStorage.setItem(this.ASSESSMENTS_KEY, JSON.stringify(assessments));
    return true;
  }

  // Delete assessment
  deleteAssessment(id: string): boolean {
    const assessments = this.getAssessments();
    const filteredAssessments = assessments.filter(assessment => assessment.id !== id);

    if (filteredAssessments.length === assessments.length) return false;

    localStorage.setItem(this.ASSESSMENTS_KEY, JSON.stringify(filteredAssessments));
    return true;
  }

  // Start assessment for student
  startAssessment(assessmentId: string, studentId: string, studentName: string): AssessmentResult {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const result: AssessmentResult = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assessmentId,
      studentId,
      studentName,
      answers: assessment.questions.map(question => ({
        questionId: question.id,
        answer: '',
        timeSpent: 0,
        attempts: 0
      })),
      score: {
        total: 0,
        maxTotal: assessment.questions.reduce((sum, q) => sum + q.points, 0),
        percentage: 0,
        grade: 'E'
      },
      timeSpent: 0,
      startedAt: new Date().toISOString(),
      submittedAt: '',
      status: 'in_progress',
      strengths: [],
      weaknesses: [],
      recommendations: [],
      analytics: {
        difficultyDistribution: {},
        timePerQuestion: {},
        accuracyByType: {},
        improvementAreas: []
      }
    };

    this.saveResult(result);
    return result;
  }

  // Submit answer
  submitAnswer(resultId: string, questionId: string, answer: string | string[]): boolean {
    const result = this.getResultById(resultId);
    if (!result || result.status !== 'in_progress') return false;

    const answerIndex = result.answers.findIndex(a => a.questionId === questionId);
    if (answerIndex === -1) return false;

    result.answers[answerIndex] = {
      ...result.answers[answerIndex],
      answer,
      attempts: result.answers[answerIndex].attempts + 1
    };

    this.saveResult(result);
    return true;
  }

  // Submit assessment
  submitAssessment(resultId: string): AssessmentResult {
    const result = this.getResultById(resultId);
    if (!result || result.status !== 'in_progress') {
      throw new Error('Invalid assessment result');
    }

    const assessment = this.getAssessmentById(result.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Calculate scores
    let totalPoints = 0;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const analytics = result.analytics;

    assessment.questions.forEach(question => {
      const studentAnswer = result.answers.find(a => a.questionId === question.id);
      if (!studentAnswer) return;

      const isCorrect = this.checkAnswer(question, studentAnswer.answer);
      const points = isCorrect ? question.points : 0;
      
      totalPoints += points;
      
      studentAnswer.isCorrect = isCorrect;
      studentAnswer.points = points;

      // Analytics
      const difficulty = question.difficulty;
      analytics.difficultyDistribution[difficulty] = (analytics.difficultyDistribution[difficulty] || 0) + 1;
      
      if (isCorrect) {
        strengths.push(`Menguasai konsep ${question.tags.join(', ')}`);
      } else {
        weaknesses.push(`Perlu perbaikan pada ${question.tags.join(', ')}`);
        analytics.improvementAreas.push(...question.tags);
      }
    });

    const percentage = Math.round((totalPoints / result.score.maxTotal) * 100);
    const grade = this.calculateGrade(percentage);

    result.score = {
      total: totalPoints,
      maxTotal: result.score.maxTotal,
      percentage,
      grade,
      gpa: this.calculateGPA(grade)
    };

    result.submittedAt = new Date().toISOString();
    result.status = 'submitted';
    result.strengths = [...new Set(strengths)];
    result.weaknesses = [...new Set(weaknesses)];
    result.recommendations = this.generateRecommendations(result);

    this.saveResult(result);
    this.updateAnalytics(assessment.id, result);

    return result;
  }

  // Check answer
  private checkAnswer(question: Question, answer: string | string[]): boolean {
    if (!question.correctAnswer) return false;

    if (Array.isArray(question.correctAnswer)) {
      if (Array.isArray(answer)) {
        return question.correctAnswer.every(ca => answer.includes(ca)) && 
               answer.length === question.correctAnswer.length;
      }
      return question.correctAnswer.includes(answer);
    }

    if (Array.isArray(answer)) {
      return answer.includes(question.correctAnswer);
    }

    // For essay questions, this would need AI grading or manual grading
    if (question.type === 'essay') {
      return false; // To be graded manually
    }

    return answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
  }

  // Calculate grade
  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D';
    return 'E';
  }

  // Calculate GPA
  private calculateGPA(grade: string): number {
    const gradeMap: Record<string, number> = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D': 1.0,
      'E': 0.0
    };
    return gradeMap[grade] || 0.0;
  }

  // Generate recommendations
  private generateRecommendations(result: AssessmentResult): string[] {
    const recommendations: string[] = [];

    if (result.score.percentage < 70) {
      recommendations.push('Review materi dasar dan coba assessment lagi');
      recommendations.push('Diskusikan dengan guru untuk pemahaman lebih baik');
    }

    if (result.weaknesses.length > 0) {
      recommendations.push('Fokus pada materi: ' + result.weaknesses.slice(0, 3).join(', '));
    }

    if (result.timeSpent > 60) {
      recommendations.push('Latih manajemen waktu untuk meningkatkan efisiensi');
    }

    return recommendations;
  }

  // Get result by ID
  getResultById(id: string): AssessmentResult | null {
    const results = this.getAllResults();
    return results.find(result => result.id === id) || null;
  }

  // Get all results
  getAllResults(studentId?: string): AssessmentResult[] {
    const results = localStorage.getItem(this.RESULTS_KEY);
    let allResults: AssessmentResult[] = results ? JSON.parse(results) : [];

    if (studentId) {
      allResults = allResults.filter(result => result.studentId === studentId);
    }

    return allResults.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  // Save result
  private saveResult(result: AssessmentResult): void {
    const results = this.getAllResults();
    const index = results.findIndex(r => r.id === result.id);

    if (index === -1) {
      results.push(result);
    } else {
      results[index] = result;
    }

    localStorage.setItem(this.RESULTS_KEY, JSON.stringify(results));
  }

  // Update analytics
  private updateAnalytics(assessmentId: string, result: AssessmentResult): void {
    const analytics = this.getAssessmentAnalytics(assessmentId);
    
    // Update analytics data
    const totalResults = this.getAllResults().filter(r => r.assessmentId === assessmentId);
    
    analytics.totalParticipants = totalResults.length;
    analytics.completionRate = (totalResults.filter(r => r.status === 'submitted').length / totalResults.length) * 100;
    analytics.averageScore = totalResults.reduce((sum, r) => sum + r.score.percentage, 0) / totalResults.length;
    analytics.averageTimeSpent = totalResults.reduce((sum, r) => sum + r.timeSpent, 0) / totalResults.length;

    // Update score distribution
    analytics.scoreDistribution = {};
    totalResults.forEach(result => {
      const grade = result.score.grade;
      analytics.scoreDistribution[grade] = (analytics.scoreDistribution[grade] || 0) + 1;
    });

    this.saveAnalytics(analytics);
  }

  // Get assessment analytics
  getAssessmentAnalytics(assessmentId: string): AssessmentAnalytics {
    const analyticsData = localStorage.getItem(this.ANALYTICS_KEY);
    let allAnalytics: AssessmentAnalytics[] = analyticsData ? JSON.parse(analyticsData) : [];

    let analytics = allAnalytics.find(a => a.assessmentId === assessmentId);
    if (!analytics) {
      analytics = {
        assessmentId,
        totalParticipants: 0,
        completionRate: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        scoreDistribution: {},
        questionAnalytics: [],
        improvementSuggestions: []
      };
      allAnalytics.push(analytics);
    }

    return analytics;
  }

  // Save analytics
  private saveAnalytics(analytics: AssessmentAnalytics): void {
    const analyticsData = localStorage.getItem(this.ANALYTICS_KEY);
    let allAnalytics: AssessmentAnalytics[] = analyticsData ? JSON.parse(analyticsData) : [];

    const index = allAnalytics.findIndex(a => a.assessmentId === analytics.assessmentId);
    if (index === -1) {
      allAnalytics.push(analytics);
    } else {
      allAnalytics[index] = analytics;
    }

    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(allAnalytics));
  }

  // Export assessment data
  exportAssessmentData(assessmentId: string): string {
    const assessment = this.getAssessmentById(assessmentId);
    const results = this.getAllResults().filter(r => r.assessmentId === assessmentId);
    const analytics = this.getAssessmentAnalytics(assessmentId);

    return JSON.stringify({
      assessment,
      results,
      analytics,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // Import assessment data
  importAssessmentData(data: string): boolean {
    try {
      const importedData = JSON.parse(data);
      
      if (importedData.assessment) {
        this.createAssessment(importedData.assessment);
      }
      
      if (importedData.results) {
        const results = this.getAllResults();
        results.push(...importedData.results);
        localStorage.setItem(this.RESULTS_KEY, JSON.stringify(results));
      }
      
      if (importedData.analytics) {
        this.saveAnalytics(importedData.analytics);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import assessment data:', error);
      return false;
    }
  }
}

// Export service instance
export const AssessmentServiceInstance = AssessmentService.getInstance();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  try {
    AssessmentServiceInstance.initialize();
  } catch (error) {
    console.error('Failed to initialize Assessment Service:', error);
  }
}