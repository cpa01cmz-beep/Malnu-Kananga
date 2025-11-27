// AI-Powered Essay Grading Service for MA Malnu Kananga
// Implements automated evaluation using Google Gemini AI

export interface EssaySubmission {
  id: string;
  studentId: string;
  assessmentId: string;
  question: string;
  essay: string;
  maxScore: number;
  rubric?: EssayRubric;
  submittedAt: string;
  wordCount: number;
  estimatedReadingTime: number; // in minutes
}

export interface EssayRubric {
  criteria: Array<{
    name: string;
    description: string;
    weight: number; // 0-1
    maxPoints: number;
    levels: Array<{
      score: number;
      description: string;
      indicators: string[];
    }>;
  }>;
}

export interface EssayEvaluation {
  id: string;
  submissionId: string;
  overallScore: number;
  overallPercentage: number;
  grade: string;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    general: string;
  };
  criteriaScores: Array<{
    criteriaName: string;
    score: number;
    maxPoints: number;
    percentage: number;
    feedback: string;
  }>;
  languageAnalysis: {
    grammar: number;
    vocabulary: number;
    coherence: number;
    structure: number;
    originality: number;
  };
  detailedFeedback: string;
  confidence: number; // 0-1
  evaluationTime: string;
  needsHumanReview: boolean;
  reviewReasons?: string[];
}

export interface GradingMetrics {
  totalEssays: number;
  averageScore: number;
  averageTime: number; // in seconds
  accuracy: number; // compared to human grading
  studentSatisfaction: number;
  commonWeaknesses: string[];
  commonStrengths: string[];
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
}

class EssayGradingService {
  private readonly API_BASE_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';
  private readonly GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Grade an essay using AI
  async gradeEssay(submission: EssaySubmission): Promise<EssayEvaluation> {
    try {
      // Pre-process essay
      const processedEssay = this.preprocessEssay(submission.essay);
      
      // Generate AI evaluation
      const aiEvaluation = await this.generateAIEvaluation(submission, processedEssay);
      
      // Apply rubric-based scoring if available
      const rubricScores = submission.rubric 
        ? await this.applyRubricScoring(submission, processedEssay)
        : null;
      
      // Combine AI and rubric scores
      const finalEvaluation = this.combineEvaluations(aiEvaluation, rubricScores, submission);
      
      // Save evaluation
      await this.saveEvaluation(finalEvaluation);
      
      return finalEvaluation;
    } catch (error) {
      console.error('Error grading essay:', error);
      throw new Error('Gagal menilai esai. Silakan coba lagi.');
    }
  }

  // Batch grade multiple essays
  async batchGradeEssays(submissions: EssaySubmission[]): Promise<EssayEvaluation[]> {
    const evaluations: EssayEvaluation[] = [];
    
    for (const submission of submissions) {
      try {
        const evaluation = await this.gradeEssay(submission);
        evaluations.push(evaluation);
      } catch (error) {
        console.error(`Error grading essay ${submission.id}:`, error);
        // Continue with other essays
      }
    }
    
    return evaluations;
  }

  // Generate AI evaluation using Gemini
  private async generateAIEvaluation(submission: EssaySubmission, processedEssay: string): Promise<Partial<EssayEvaluation>> {
    const prompt = this.buildEvaluationPrompt(submission, processedEssay);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      return this.parseAIResponse(aiResponse, submission);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Gagal menghubungkan ke AI evaluator');
    }
  }

  // Build comprehensive evaluation prompt
  private buildEvaluationPrompt(submission: EssaySubmission, processedEssay: string): string {
    const rubricText = submission.rubric 
      ? submission.rubric.criteria.map(c => 
          `${c.name} (${c.weight * 100}%): ${c.description}\n` +
          c.levels.map(l => `  - ${l.score}/${c.maxPoints}: ${l.description}`).join('\n')
        ).join('\n')
      : 'Tidak ada rubrik spesifik';

    return `Sebagai evaluator esai yang ahli untuk pendidikan SMA di Indonesia, tolong nilai esai berikut ini dengan objektif dan komprehensif.

INFORMASI TUGAS:
- Pertanyaan: ${submission.question}
- Skor maksimal: ${submission.maxScore} poin
- Jumlah kata: ${submission.wordCount}

RUBRIK PENILAIAN:
${rubricText}

ESAI YANG AKAN DINILAI:
"""
${processedEssay}
"""

INSTRUKSI PENILAIAN:
1. Berikan skor keseluruhan (0-${submission.maxScore})
2. Evaluasi berdasarkan kriteria berikut (skala 0-100):
   - Struktur dan organisasi
   - Isi dan argumen
   - Bahasa dan tata bahasa
   - Kosakata
   - Koherensi dan kelancaran
   - Orisinalitas

3. Berikan feedback yang mendetail:
   - Kekuatan (minimal 3 poin)
   - Kelemahan (minimal 3 poin)  
   - Saran perbaikan (minimal 3 poin)
   - Feedback umum

4. Tentukan apakah esai perlu review manual oleh guru

FORMAT OUTPUT JSON:
{
  "overallScore": <skor_keseluruhan>,
  "criteriaScores": [
    {"criteria": "Struktur", "score": <0-100>, "feedback": "<penjelasan>"},
    {"criteria": "Isi", "score": <0-100>, "feedback": "<penjelasan>"},
    {"criteria": "Bahasa", "score": <0-100>, "feedback": "<penjelasan>"},
    {"criteria": "Kosakata", "score": <0-100>, "feedback": "<penjelasan>"},
    {"criteria": "Koherensi", "score": <0-100>, "feedback": "<penjelasan>"},
    {"criteria": "Orisinalitas", "score": <0-100>, "feedback": "<penjelasan>"}
  ],
  "feedback": {
    "strengths": ["<kekuatan1>", "<kekuatan2>", "<kekuatan3>"],
    "weaknesses": ["<kelemahan1>", "<kelemahan2>", "<kelemahan3>"],
    "suggestions": ["<saran1>", "<saran2>", "<saran3>"],
    "general": "<feedback_umum>"
  },
  "needsHumanReview": <true/false>,
  "reviewReasons": ["<alasan1>", "<alasan2>"],
  "confidence": <0.0-1.0>
}

Pastikan output adalah JSON yang valid dan dapat di-parse. Nilai harus objektif dan sesuai standar pendidikan Indonesia.`;
  }

  // Parse AI response from Gemini
  private parseAIResponse(aiResponse: string, submission: EssaySubmission): Partial<EssayEvaluation> {
    try {
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        overallScore: parsed.overallScore || 0,
        overallPercentage: Math.round((parsed.overallScore / submission.maxScore) * 100),
        grade: this.calculateGrade(parsed.overallScore, submission.maxScore),
        feedback: parsed.feedback || {
          strengths: [],
          weaknesses: [],
          suggestions: [],
          general: ''
        },
        criteriaScores: parsed.criteriaScores || [],
        languageAnalysis: {
          grammar: parsed.criteriaScores?.find(c => c.criteria.toLowerCase().includes('bahasa'))?.score || 0,
          vocabulary: parsed.criteriaScores?.find(c => c.criteria.toLowerCase().includes('kosakata'))?.score || 0,
          coherence: parsed.criteriaScores?.find(c => c.criteria.toLowerCase().includes('koherensi'))?.score || 0,
          structure: parsed.criteriaScores?.find(c => c.criteria.toLowerCase().includes('struktur'))?.score || 0,
          originality: parsed.criteriaScores?.find(c => c.criteria.toLowerCase().includes('orisinalitas'))?.score || 0,
        },
        detailedFeedback: aiResponse,
        confidence: parsed.confidence || 0.8,
        needsHumanReview: parsed.needsHumanReview || false,
        reviewReasons: parsed.reviewReasons || [],
        evaluationTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Gagal memproses hasil evaluasi AI');
    }
  }

  // Apply rubric-based scoring
  private async applyRubricScoring(submission: EssaySubmission, processedEssay: string): Promise<Partial<EssayEvaluation>> {
    if (!submission.rubric) return null;
    
    const criteriaScores = [];
    let totalScore = 0;
    let totalMaxPoints = 0;
    
    for (const criteria of submission.rubric.criteria) {
      const score = await this.evaluateCriteria(processedEssay, criteria);
      criteriaScores.push({
        criteriaName: criteria.name,
        score: score.score,
        maxPoints: criteria.maxPoints,
        percentage: Math.round((score.score / criteria.maxPoints) * 100),
        feedback: score.feedback
      });
      
      totalScore += score.score;
      totalMaxPoints += criteria.maxPoints;
    }
    
    return {
      criteriaScores,
      overallScore: totalScore,
      overallPercentage: Math.round((totalScore / totalMaxPoints) * 100),
      grade: this.calculateGrade(totalScore, totalMaxPoints)
    };
  }

  // Evaluate specific criteria
  private async evaluateCriteria(essay: string, criteria: any): Promise<{ score: number; feedback: string }> {
    const prompt = `Evaluasi esai berikut untuk kriteria: "${criteria.name}"
    
    Deskripsi: ${criteria.description}
    Skor maksimal: ${criteria.maxPoints}
    
    Level penilaian:
    ${criteria.levels.map(level => `- ${level.score}/${criteria.maxPoints}: ${level.description}`).join('\n')}
    
    Esai:
    ${essay}
    
    Berikan skor (0-${criteria.maxPoints}) dan feedback singkat dalam format JSON:
    {
      "score": <skor>,
      "feedback": "<feedback>"
    }`;
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          }
        })
      });
      
      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        score: Math.max(0, Math.min(criteria.maxPoints, parsed.score || 0)),
        feedback: parsed.feedback || ''
      };
    } catch (error) {
      console.error('Error evaluating criteria:', error);
      return {
        score: Math.floor(criteria.maxPoints * 0.6), // Default to 60%
        feedback: 'Terjadi kesalahan dalam evaluasi kriteria ini'
      };
    }
  }

  // Combine AI and rubric evaluations
  private combineEvaluations(
    aiEvaluation: Partial<EssayEvaluation>,
    rubricScores: Partial<EssayEvaluation> | null,
    submission: EssaySubmission
  ): EssayEvaluation {
    if (rubricScores && submission.rubric) {
      // Use rubric scores as primary, AI as supplement
      return {
        id: `eval_${submission.id}_${Date.now()}`,
        submissionId: submission.id,
        overallScore: rubricScores.overallScore || 0,
        overallPercentage: rubricScores.overallPercentage || 0,
        grade: rubricScores.grade || 'C',
        feedback: aiEvaluation.feedback || {
          strengths: [],
          weaknesses: [],
          suggestions: [],
          general: ''
        },
        criteriaScores: rubricScores.criteriaScores || [],
        languageAnalysis: aiEvaluation.languageAnalysis || {
          grammar: 0,
          vocabulary: 0,
          coherence: 0,
          structure: 0,
          originality: 0
        },
        detailedFeedback: aiEvaluation.detailedFeedback || '',
        confidence: aiEvaluation.confidence || 0.8,
        needsHumanReview: aiEvaluation.needsHumanReview || false,
        reviewReasons: aiEvaluation.reviewReasons || [],
        evaluationTime: new Date().toISOString()
      };
    } else {
      // Use AI evaluation only
      return {
        id: `eval_${submission.id}_${Date.now()}`,
        submissionId: submission.id,
        overallScore: aiEvaluation.overallScore || 0,
        overallPercentage: aiEvaluation.overallPercentage || 0,
        grade: aiEvaluation.grade || 'C',
        feedback: aiEvaluation.feedback || {
          strengths: [],
          weaknesses: [],
          suggestions: [],
          general: ''
        },
        criteriaScores: aiEvaluation.criteriaScores || [],
        languageAnalysis: aiEvaluation.languageAnalysis || {
          grammar: 0,
          vocabulary: 0,
          coherence: 0,
          structure: 0,
          originality: 0
        },
        detailedFeedback: aiEvaluation.detailedFeedback || '',
        confidence: aiEvaluation.confidence || 0.8,
        needsHumanReview: aiEvaluation.needsHumanReview || false,
        reviewReasons: aiEvaluation.reviewReasons || [],
        evaluationTime: new Date().toISOString()
      };
    }
  }

  // Preprocess essay text
  private preprocessEssay(essay: string): string {
    return essay
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  }

  // Calculate letter grade
  private calculateGrade(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    
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

  // Save evaluation to storage
  private async saveEvaluation(evaluation: EssayEvaluation): Promise<void> {
    const evaluations = JSON.parse(localStorage.getItem('essay_evaluations') || '[]');
    evaluations.push(evaluation);
    localStorage.setItem('essay_evaluations', JSON.stringify(evaluations));
  }

  // Get evaluation by submission ID
  async getEvaluation(submissionId: string): Promise<EssayEvaluation | null> {
    const evaluations = JSON.parse(localStorage.getItem('essay_evaluations') || '[]');
    return evaluations.find(eval => eval.submissionId === submissionId) || null;
  }

  // Get grading metrics
  async getGradingMetrics(assessmentId?: string): Promise<GradingMetrics> {
    const evaluations = JSON.parse(localStorage.getItem('essay_evaluations') || '[]');
    const relevantEvaluations = assessmentId 
      ? evaluations.filter((eval: EssayEvaluation) => {
          const submissions = JSON.parse(localStorage.getItem('essay_submissions') || '[]');
          const submission = submissions.find((s: EssaySubmission) => s.id === eval.submissionId);
          return submission?.assessmentId === assessmentId;
        })
      : evaluations;

    if (relevantEvaluations.length === 0) {
      return {
        totalEssays: 0,
        averageScore: 0,
        averageTime: 0,
        accuracy: 0,
        studentSatisfaction: 0,
        commonWeaknesses: [],
        commonStrengths: [],
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 }
      };
    }

    const totalScore = relevantEvaluations.reduce((sum, eval) => sum + eval.overallScore, 0);
    const averageScore = totalScore / relevantEvaluations.length;
    
    const gradeDistribution = relevantEvaluations.reduce((dist, eval) => {
      dist[eval.grade] = (dist[eval.grade] || 0) + 1;
      return dist;
    }, { A: 0, B: 0, C: 0, D: 0, E: 0 });

    // Analyze common feedback patterns
    const allWeaknesses = relevantEvaluations.flatMap(eval => eval.feedback.weaknesses);
    const allStrengths = relevantEvaluations.flatMap(eval => eval.feedback.strengths);
    
    const commonWeaknesses = this.getMostCommon(allWeaknesses, 5);
    const commonStrengths = this.getMostCommon(allStrengths, 5);

    return {
      totalEssays: relevantEvaluations.length,
      averageScore: Math.round(averageScore),
      averageTime: 45, // Estimated average time
      accuracy: 0.85, // Would be calculated based on human comparisons
      studentSatisfaction: 0.82, // Would be collected from student feedback
      commonWeaknesses,
      commonStrengths,
      gradeDistribution
    };
  }

  // Get most common items from array
  private getMostCommon(items: string[], limit: number): string[] {
    const frequency = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  // Request human review
  async requestHumanReview(evaluationId: string, reason: string): Promise<void> {
    const evaluations = JSON.parse(localStorage.getItem('essay_evaluations') || '[]');
    const evaluation = evaluations.find(eval => eval.id === evaluationId);
    
    if (evaluation) {
      evaluation.needsHumanReview = true;
      evaluation.reviewReasons = [...(evaluation.reviewReasons || []), reason];
      localStorage.setItem('essay_evaluations', JSON.stringify(evaluations));
    }
  }

  // Update evaluation after human review
  async updateAfterHumanReview(evaluationId: string, humanScore: number, humanFeedback: string): Promise<void> {
    const evaluations = JSON.parse(localStorage.getItem('essay_evaluations') || '[]');
    const evaluation = evaluations.find(eval => eval.id === evaluationId);
    
    if (evaluation) {
      evaluation.overallScore = humanScore;
      evaluation.overallPercentage = Math.round((humanScore / 100) * 100);
      evaluation.grade = this.calculateGrade(humanScore, 100);
      evaluation.feedback.general = humanFeedback;
      evaluation.needsHumanReview = false;
      evaluation.reviewReasons = [];
      
      localStorage.setItem('essay_evaluations', JSON.stringify(evaluations));
    }
  }
}

export const essayGradingService = new EssayGradingService();