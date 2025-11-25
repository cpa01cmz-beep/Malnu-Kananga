// AI-Enhanced Knowledge Base Service
// Knowledge base dengan AI-generated solutions dan continuous learning

import { StudentSupportService } from './studentSupportService';

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'technical' | 'administrative' | 'wellness';
  type: 'guide' | 'faq' | 'troubleshooting' | 'best_practice';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'id' | 'en';
  rating: number;
  usageCount: number;
  successRate: number;
  lastUpdated: string;
  aiGenerated: boolean;
  relatedArticles: string[];
  feedbackCount: number;
  averageResolutionTime: number;
}

export interface AIGeneratedSolution {
  id: string;
  problemDescription: string;
  category: string;
  solution: string;
  confidence: number;
  sources: string[];
  generatedAt: string;
  verified: boolean;
  effectiveness: number;
}

export interface SearchQuery {
  query: string;
  category?: string;
  language?: string;
  difficulty?: string;
  limit?: number;
}

export interface SearchResult {
  article: KnowledgeBaseArticle;
  relevanceScore: number;
  matchReasons: string[];
}

class AIEnhancedKnowledgeBase {
  private static instance: AIEnhancedKnowledgeBase;
  private articles: Map<string, KnowledgeBaseArticle> = new Map();
  private aiSolutions: Map<string, AIGeneratedSolution> = new Map();
  private searchIndex: Map<string, string[]> = new Map();
  private learningData: Map<string, any> = new Map();

  static getInstance(): AIEnhancedKnowledgeBase {
    if (!this.instance) {
      this.instance = new AIEnhancedKnowledgeBase();
    }
    return this.instance;
  }

  constructor() {
    this.initializeKnowledgeBase();
    this.buildSearchIndex();
    this.startContinuousLearning();
  }

  // Initialize knowledge base with enhanced content
  private initializeKnowledgeBase(): void {
    const defaultArticles: KnowledgeBaseArticle[] = [
      {
        id: 'kb_login_magic_link',
        title: 'Panduan Lengkap Login Magic Link',
        content: `Cara menggunakan fitur Magic Link untuk login tanpa password:

1. Buka halaman login portal siswa
2. Masukkan email sekolah Anda
3. Klik tombol "Kirim Magic Link"
4. Periksa email Anda (termasuk folder spam)
5. Klik link yang diterima dalam 15 menit
6. Anda akan otomatis login ke portal

Keuntungan Magic Link:
✅ Tidak perlu mengingat password
✅ Lebih aman dari phishing
✅ Link berlaku 15 menit untuk keamanan
✅ Bisa digunakan di perangkat apa saja

Jika tidak menerima email:
- Periksa folder spam/promosi
- Pastikan email sekolah sudah terdaftar
- Hubungi admin IT jika masalah berlanjut`,
        category: 'technical',
        type: 'guide',
        tags: ['login', 'magic-link', 'akses', 'autentikasi'],
        difficulty: 'beginner',
        language: 'id',
        rating: 4.8,
        usageCount: 156,
        successRate: 92,
        lastUpdated: new Date().toISOString(),
        aiGenerated: false,
        relatedArticles: ['kb_troubleshooting_login', 'kb_email_setup'],
        feedbackCount: 23,
        averageResolutionTime: 3.5
      },
      {
        id: 'kb_academic_improvement',
        title: 'Strategi Peningkatan Performa Akademik',
        content: `Panduan komprehensif untuk meningkatkan performa akademik:

📚 MANAJEMEN WAKTU
- Buat jadwal belajar terstruktur
- Gunakan teknik Pomodoro (25 menit belajar, 5 menit istirahat)
- Prioritaskan tugas berdasarkan deadline dan difficulty
- Alokasikan waktu khusus untuk mata pelajaran sulit

🎯 TEKNIK BELAJAR EFEKTIF
- Active recall: coba jelaskan materi dengan kata sendiri
- Spaced repetition: ulangi materi secara berkala
- Mind mapping untuk visualisasi konsep
- Teach back: ajarkan materi ke orang lain

💡 PENINGKATAN FOKUS
- Minimalkan distraksi (hp, social media)
- Ciptakan lingkungan belajar nyaman
- Gunakan apps focus (Forest, Focus Keeper)
- Istirahat cukup (7-8 jam tidur)

📊 MONITORING PROGRESS
- Catat nilai dan progress mingguan
- Identifikasi pola kesulitan
- Diskusikan dengan guru untuk feedback
- Celebrate small wins untuk motivasi

🤝 SUMBER DAYA TAMBAHAN
- Form belajar kelompok dengan teman
- Manfaatkan jam konsultasi guru
- Gunakan platform belajar online
- Ikuti bimbingan konseling jika needed

Remember: Progress takes time. Be patient and consistent!`,
        category: 'academic',
        type: 'best_practice',
        tags: ['belajar', 'performa', 'strategi', 'improvement'],
        difficulty: 'intermediate',
        language: 'id',
        rating: 4.6,
        usageCount: 89,
        successRate: 78,
        lastUpdated: new Date().toISOString(),
        aiGenerated: false,
        relatedArticles: ['kb_time_management', 'kb_exam_preparation'],
        feedbackCount: 15,
        averageResolutionTime: 8.2
      },
      {
        id: 'kb_stress_management',
        title: 'Manajemen Stress dan Kesehatan Mental',
        content: `Panduan kesehatan mental untuk siswa:

🧘 TEKNIK RELAKSASI
- Deep breathing (4-7-8 technique)
- Progressive muscle relaxation
- Mindfulness meditation (5-10 menit/hari)
- Journaling untuk curahan emosi

⚖️ WORK-LIFE BALANCE
- Tetapkan batasan waktu belajar
- Luangkan waktu untuk hobi
- Social connection dengan teman dan keluarga
- Physical activity (olahraga ringan)

🎯 MANAJEMEN STRESS AKADEMIK
- Break down tugas besar menjadi kecil
- Focus pada process, bukan hanya hasil
- Realistic goal setting
- Self-compassion saat gagal

📱 DIGITAL WELLNESS
- Limit social media usage
- Digital detox sebelum tidur
- Curate positive content
- Avoid comparison trap

🆘 KAPAN MEMBANTU DIRI
- Tidak bisa tidur > 2 minggu
- Loss of interest in activities
- Feeling overwhelmed constantly
- Physical symptoms (headaches, stomach issues)

Resource yang tersedia:
- Guru BK (jam kerja 08:00-15:00)
- Hotline kesehatan mental
- Support group siswa
- Online counseling platforms

Remember: Mental health is just as important as physical health!`,
        category: 'wellness',
        type: 'guide',
        tags: ['stress', 'mental-health', 'kesehatan', 'wellness'],
        difficulty: 'beginner',
        language: 'id',
        rating: 4.9,
        usageCount: 67,
        successRate: 85,
        lastUpdated: new Date().toISOString(),
        aiGenerated: false,
        relatedArticles: ['kb_sleep_hygiene', 'kb_peer_support'],
        feedbackCount: 19,
        averageResolutionTime: 12.1
      },
      {
        id: 'kb_technical_troubleshooting',
        title: 'Troubleshooting Guide - Masalah Teknis Umum',
        content: `Panduan mengatasi masalah teknis portal:

🔥 TIDAK BISA LOGIN
- Clear cache dan cookies browser
- Coba browser lain (Chrome, Firefox, Safari)
- Periksa koneksi internet
- Gunakan Magic Link sebagai alternatif
- Pastikan waktu device sudah benar

📵 HALAMAN TIDAK LOAD
- Refresh halaman (Ctrl+F5 / Cmd+Shift+R)
- Check koneksi internet speed
- Disable ad blocker sementara
- Coba akses dari device lain
- Report ke admin IT jika persist

📱 MOBILE APP ISSUES
- Update app ke versi terbaru
- Clear app cache
- Restart device
- Check storage space
- Reinstall jika perlu

📎 FILE UPLOAD PROBLEMS
- Check file size limit (<10MB)
- Pastikan format file didukung
- Rename file tanpa special characters
- Compress file jika terlalu besar
- Try different browser

🔐 NOTIFICATION ISSUES
- Check browser notification settings
- Allow notifications for portal domain
- Update browser ke versi terbaru
- Restart browser
- Check do not disturb mode

⚡ PERFORMANCE OPTIMIZATION
- Close unused tabs
- Update browser regularly
- Use stable internet connection
- Clear browsing data periodically
- Use recommended browser specs

Contact IT Support:
- Email: it@ma-malnukananga.sch.id
- Phone: (021) 1234-5678
- Location: Ruang IT, Lantai 2
- Hours: Senin-Jumat, 07:30-16:00`,
        category: 'technical',
        type: 'troubleshooting',
        tags: ['troubleshooting', 'technical', 'error', 'solution'],
        difficulty: 'intermediate',
        language: 'id',
        rating: 4.4,
        usageCount: 134,
        successRate: 88,
        lastUpdated: new Date().toISOString(),
        aiGenerated: false,
        relatedArticles: ['kb_login_magic_link', 'kb_browser_optimization'],
        feedbackCount: 28,
        averageResolutionTime: 6.7
      }
    ];

    defaultArticles.forEach(article => {
      this.articles.set(article.id, article);
    });

    console.log(`📚 Initialized knowledge base with ${defaultArticles.length} articles`);
  }

  // Build search index for efficient searching
  private buildSearchIndex(): void {
    this.articles.forEach((article, id) => {
      const keywords = [
        ...article.title.toLowerCase().split(' '),
        ...article.content.toLowerCase().split(' '),
        ...article.tags.map(tag => tag.toLowerCase())
      ].filter(word => word.length > 2);

      this.searchIndex.set(id, keywords);
    });
  }

  // Start continuous learning system
  private startContinuousLearning(): void {
    // Analyze user feedback every hour
    setInterval(() => {
      this.analyzeUserFeedback();
      this.updateArticleRatings();
      this.identifyKnowledgeGaps();
    }, 3600000);

    // Generate AI solutions for new problems every 6 hours
    setInterval(() => {
      this.generateAISolution();
      this.validateExistingSolutions();
    }, 21600000);

    console.log('🧠 Continuous learning system started');
  }

  // Search knowledge base with AI-enhanced relevance
  async searchKnowledgeBase(query: SearchQuery): Promise<SearchResult[]> {
    const searchTerms = query.query.toLowerCase().split(' ').filter(term => term.length > 2);
    const results: SearchResult[] = [];

    this.articles.forEach((article, id) => {
      const keywords = this.searchIndex.get(id) || [];
      let relevanceScore = 0;
      const matchReasons: string[] = [];

      // Calculate relevance score
      searchTerms.forEach(term => {
        // Title matches (highest weight)
        if (article.title.toLowerCase().includes(term)) {
          relevanceScore += 10;
          matchReasons.push(`Title match: "${term}"`);
        }

        // Tag matches (high weight)
        if (article.tags.some(tag => tag.toLowerCase().includes(term))) {
          relevanceScore += 8;
          matchReasons.push(`Tag match: "${term}"`);
        }

        // Content matches (medium weight)
        const contentMatches = keywords.filter(keyword => keyword.includes(term)).length;
        if (contentMatches > 0) {
          relevanceScore += contentMatches * 3;
          matchReasons.push(`Content match: "${term}" (${contentMatches} times)`);
        }

        // Category match (if specified)
        if (query.category && article.category === query.category) {
          relevanceScore += 5;
          matchReasons.push('Category match');
        }

        // Language match
        if (query.language && article.language === query.language) {
          relevanceScore += 2;
          matchReasons.push('Language match');
        }

        // Difficulty match
        if (query.difficulty && article.difficulty === query.difficulty) {
          relevanceScore += 3;
          matchReasons.push('Difficulty match');
        }
      });

      // Boost popular and effective articles
      relevanceScore += Math.log(article.usageCount + 1) * 2;
      relevanceScore += article.successRate * 0.05;
      relevanceScore += article.rating * 0.5;

      if (relevanceScore > 0) {
        results.push({
          article,
          relevanceScore,
          matchReasons
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return limited results
    return results.slice(0, query.limit || 10);
  }

  // Generate AI solution for new problems
  async generateAISolution(problemDescription: string, category: string): Promise<AIGeneratedSolution | null> {
    try {
      // This would integrate with AI service to generate solutions
      const response = await fetch('/api/generate-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: problemDescription,
          category,
          context: this.getRelevantContext(category),
          language: 'id'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI solution');
      }

      const aiSolution = await response.json();
      
      const solution: AIGeneratedSolution = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        problemDescription,
        category,
        solution: aiSolution.solution,
        confidence: aiSolution.confidence || 0.7,
        sources: aiSolution.sources || [],
        generatedAt: new Date().toISOString(),
        verified: false,
        effectiveness: 0
      };

      this.aiSolutions.set(solution.id, solution);
      
      // If confidence is high, create knowledge base article
      if (solution.confidence > 0.8) {
        await this.convertAISolutionToArticle(solution);
      }

      return solution;

    } catch (error) {
      console.error('Failed to generate AI solution:', error);
      return null;
    }
  }

  // Get relevant context for AI generation
  private getRelevantContext(category: string): string[] {
    const context: string[] = [];
    
    this.articles.forEach(article => {
      if (article.category === category && article.rating > 4.0) {
        context.push(`${article.title}: ${article.content.substring(0, 200)}...`);
      }
    });

    return context;
  }

  // Convert AI solution to knowledge base article
  private async convertAISolutionToArticle(solution: AIGeneratedSolution): Promise<void> {
    const article: KnowledgeBaseArticle = {
      id: `kb_ai_${solution.id}`,
      title: `Solusi AI: ${solution.problemDescription.substring(0, 50)}...`,
      content: solution.solution,
      category: solution.category as any,
      type: 'guide',
      tags: ['ai-generated', solution.category, 'automated-solution'],
      difficulty: 'intermediate',
      language: 'id',
      rating: 0,
      usageCount: 0,
      successRate: 0,
      lastUpdated: new Date().toISOString(),
      aiGenerated: true,
      relatedArticles: [],
      feedbackCount: 0,
      averageResolutionTime: 0
    };

    this.articles.set(article.id, article);
    this.buildSearchIndex();
    
    console.log(`🤖 Created AI-generated article: ${article.id}`);
  }

  // Analyze user feedback to improve knowledge base
  private analyzeUserFeedback(): void {
    // This would analyze user interactions, feedback, and success rates
    // to identify areas for improvement
    console.log('📊 Analyzing user feedback for knowledge base improvement...');
  }

  // Update article ratings based on user feedback
  private updateArticleRatings(): void {
    this.articles.forEach(article => {
      // Simulate rating updates based on usage and success
      if (article.usageCount > 0) {
        const feedbackFactor = article.successRate / 100;
        const usageFactor = Math.min(article.usageCount / 100, 1);
        
        // Update rating (simplified formula)
        const newRating = Math.min(5, article.rating + (feedbackFactor * usageFactor * 0.1));
        article.rating = Math.round(newRating * 10) / 10;
      }
    });
  }

  // Identify knowledge gaps
  private identifyKnowledgeGaps(): void {
    const supportRequests = StudentSupportService.getSupportRequests();
    const categoryCounts: Record<string, number> = {};
    
    supportRequests.forEach(request => {
      categoryCounts[request.type] = (categoryCounts[request.type] || 0) + 1;
    });

    // Identify categories with high request volume but low article coverage
    Object.entries(categoryCounts).forEach(([category, count]) => {
      const articleCount = Array.from(this.articles.values())
        .filter(article => article.category === category).length;
      
      if (count > 10 && articleCount < 3) {
        console.log(`🔍 Knowledge gap detected in category: ${category} (${count} requests, ${articleCount} articles)`);
        
        // Trigger AI solution generation for this category
        this.generateAISolution(
          `Common issues in ${category}`,
          category
        );
      }
    });
  }

  // Validate existing AI solutions
  private validateExistingSolutions(): void {
    this.aiSolutions.forEach(solution => {
      if (!solution.verified && solution.effectiveness > 0.8) {
        solution.verified = true;
        console.log(`✅ AI solution verified: ${solution.id}`);
      }
    });
  }

  // Get article by ID
  getArticle(id: string): KnowledgeBaseArticle | undefined {
    return this.articles.get(id);
  }

  // Get all articles by category
  getArticlesByCategory(category: string): KnowledgeBaseArticle[] {
    return Array.from(this.articles.values())
      .filter(article => article.category === category)
      .sort((a, b) => b.rating - a.rating);
  }

  // Get popular articles
  getPopularArticles(limit: number = 10): KnowledgeBaseArticle[] {
    return Array.from(this.articles.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Get AI solutions
  getAISolutions(category?: string): AIGeneratedSolution[] {
    const solutions = Array.from(this.aiSolutions.values());
    return category 
      ? solutions.filter(solution => solution.category === category)
      : solutions;
  }

  // Rate article
  rateArticle(articleId: string, rating: number, helpful: boolean): void {
    const article = this.articles.get(articleId);
    if (article) {
      // Update rating (simplified average calculation)
      article.rating = ((article.rating * article.feedbackCount) + rating) / (article.feedbackCount + 1);
      article.feedbackCount++;
      article.usageCount++;
      
      // Update success rate
      if (helpful) {
        article.successRate = ((article.successRate * (article.usageCount - 1)) + 100) / article.usageCount;
      } else {
        article.successRate = ((article.successRate * (article.usageCount - 1)) + 0) / article.usageCount;
      }

      // Store learning data
      this.learningData.set(`${articleId}_${Date.now()}`, {
        rating,
        helpful,
        timestamp: new Date().toISOString()
      });

      console.log(`📝 Article rated: ${articleId} (${rating}/5, helpful: ${helpful})`);
    }
  }

  // Add custom article
  addArticle(article: Omit<KnowledgeBaseArticle, 'id' | 'lastUpdated' | 'usageCount' | 'feedbackCount'>): KnowledgeBaseArticle {
    const newArticle: KnowledgeBaseArticle = {
      ...article,
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date().toISOString(),
      usageCount: 0,
      feedbackCount: 0
    };

    this.articles.set(newArticle.id, newArticle);
    this.buildSearchIndex();
    
    console.log(`➕ Added new article: ${newArticle.id}`);
    return newArticle;
  }

  // Get knowledge base statistics
  getStatistics(): any {
    const articles = Array.from(this.articles.values());
    const aiSolutions = Array.from(this.aiSolutions.values());

    return {
      totalArticles: articles.length,
      aiGeneratedArticles: articles.filter(a => a.aiGenerated).length,
      totalAISolutions: aiSolutions.length,
      verifiedAISolutions: aiSolutions.filter(s => s.verified).length,
      averageRating: articles.reduce((sum, a) => sum + a.rating, 0) / articles.length,
      totalUsage: articles.reduce((sum, a) => sum + a.usageCount, 0),
      averageSuccessRate: articles.reduce((sum, a) => sum + a.successRate, 0) / articles.length,
      categoryBreakdown: this.getCategoryBreakdown(),
      mostPopularArticles: this.getPopularArticles(5).map(a => ({
        id: a.id,
        title: a.title,
        usageCount: a.usageCount,
        rating: a.rating
      }))
    };
  }

  // Get category breakdown
  private getCategoryBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    this.articles.forEach(article => {
      breakdown[article.category] = (breakdown[article.category] || 0) + 1;
    });

    return breakdown;
  }
}

export default AIEnhancedKnowledgeBase;