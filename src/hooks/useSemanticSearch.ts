/**
 * React hook for AI-powered semantic search in E-Library
 */

import { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { ELibrary as ELibraryType } from '../types';
import { logger } from '../utils/logger';
import { AI_MODELS } from '../services/ai/geminiClient';

import { chatCache } from '../services/aiCacheService';

interface SemanticSearchResult {
  material: ELibraryType;
  relevanceScore: number;
  relevanceReason: string;
  matchedConcepts: string[];
  relatedMaterials?: ELibraryType[];
}

interface SemanticSearchOptions {
  includeOCR?: boolean;
  minRelevanceScore?: number;
  maxResults?: number;
  enableQueryExpansion?: boolean;
  includeRelated?: boolean;
}

interface UseSemanticSearchReturn {
  searchResults: SemanticSearchResult[];
  isSearching: boolean;
  error: string | null;
  searchQuery: string;
  suggestedQueries: string[];
  relatedMaterials: ELibraryType[];
  semanticSearch: (query: string, options?: SemanticSearchOptions) => Promise<void>;
  clearSearch: () => void;
  getSuggestions: (partialQuery: string) => Promise<string[]>;
  getRelatedMaterials: (materialId: string) => Promise<ELibraryType[]>;
}

const DEFAULT_OPTIONS: SemanticSearchOptions = {
  includeOCR: true,
  minRelevanceScore: 0.3,
  maxResults: 20,
  enableQueryExpansion: true,
  includeRelated: true
};

export function useSemanticSearch(
  materials: ELibraryType[],
  options: Partial<SemanticSearchOptions> = {}
): UseSemanticSearchReturn {
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [relatedMaterials, setRelatedMaterials] = useState<ELibraryType[]>([]);

const _searchOptions = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  // Extract keywords and concepts for indexing
  const materialIndex = useMemo(() => {
    return materials.map(material => ({
      material,
      keywords: extractKeywords(material),
      concepts: extractConcepts(material),
      subject: material.category || 'Umum',
      type: Array.isArray(material.fileType) ? material.fileType[0]?.toLowerCase() || 'unknown' : material.fileType.toLowerCase(),
      hasOCR: material.ocrStatus === 'completed' && material.isSearchable
    }));
  }, [materials]);

  // Perform semantic search using AI
  const semanticSearch = useCallback(async (query: string, searchOptions: SemanticSearchOptions = DEFAULT_OPTIONS) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchQuery(query);

    try {
      // Check cache first
      const cacheKey = {
        operation: 'semanticSearch',
        input: query,
        materialsCount: materials.length,
        options: searchOptions
      };

      const cachedResult = chatCache.get<SemanticSearchResult[]>(cacheKey);
      if (cachedResult) {
        logger.debug('Returning cached semantic search results');
        setSearchResults(cachedResult);
        return;
      }

      // Build context for AI analysis
      const materialsContext = materialIndex.map(item => ({
        id: item.material.id,
        title: item.material.title,
        description: item.material.description || '',
        subject: item.subject,
        keywords: item.keywords,
        concepts: item.concepts,
        hasOCR: item.hasOCR,
        ocrText: item.material.ocrText ? item.material.ocrText.substring(0, 500) : ''
      }));

      const aiPrompt = `
Lakukan analisis semantik pada query pencarian dan berikan relevansi untuk setiap materi.

QUERY: "${query}"

ANALISIS YANG DIBUTUHKAN:
1. Identifikasi konsep utama dalam query
2. Temukan sinonim dan istilah terkait  
3. Evaluasi relevansi setiap materi (skala 0-1)
4. Berikan alasan mengapa materi relevan
5. Sarankan materi terkait

DAFTAR MATERI:
${materialsContext.map((item, index) => `
${index + 1}. ID: ${item.id}
   Judul: ${item.title}
   Deskripsi: ${item.description}
   Mata Pelajaran: ${item.subject}
   Keywords: ${item.keywords.join(', ')}
   Concepts: ${item.concepts.join(', ')}
   OCR Text: ${item.ocrText}
`).join('\n')}

RESPON FORMAT JSON:
{
  "queryConcepts": ["konsep1", "konsep2"],
  "expandedQuery": ["query asli", "sinonim1", "terkait1"],
  "results": [
    {
      "materialId": "id",
      "relevanceScore": 0.8,
      "relevanceReason": "Alasan mengapa relevan",
      "matchedConcepts": ["konsep1", "konsep2"],
      "relatedMaterialIds": ["id1", "id2"]
    }
  ]
}

Kriteria Relevansi:
- Judul dan deskripsi yang cocok dengan konsep query: 0.7-1.0
- Mata pelajaran terkait: 0.5-0.7  
- Keywords atau concepts yang cocok: 0.4-0.6
- OCR text yang mengandung konsep: 0.3-0.5
- Tidak relevan: 0.0-0.2

Hanya sertakan materi dengan relevanceScore >= ${searchOptions.minRelevanceScore || 0.3}.
`;

      // Use Gemini AI for semantic analysis
      const analysisResponse = await performSemanticAnalysis(aiPrompt);
      
      if (analysisResponse) {
        // Process and map results
        const results: SemanticSearchResult[] = analysisResponse.results
          .filter((result: AIAnalysisResponse['results'][0]) => result.relevanceScore >= (options.minRelevanceScore || 0.3))
          .map((result: AIAnalysisResponse['results'][0]) => {
            const material = materials.find(m => m.id === result.materialId);
            if (!material) return null;

            const relatedMats = result.relatedMaterialIds
              .map((id: string) => materials.find(m => m.id === id))
              .filter(Boolean) as ELibraryType[];

            return {
              material,
              relevanceScore: result.relevanceScore,
              relevanceReason: result.relevanceReason,
              matchedConcepts: result.matchedConcepts,
              relatedMaterials: options.includeRelated ? relatedMats : undefined
            };
          })
          .filter(Boolean) as SemanticSearchResult[];

        // Sort by relevance score and limit results
        const sortedResults = results
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, options.maxResults || 20);

        setSearchResults(sortedResults);

        // Generate suggested queries based on expanded query
        if (options.enableQueryExpansion && analysisResponse.expandedQuery) {
          setSuggestedQueries(analysisResponse.expandedQuery.slice(0, 5));
        }

        // Cache the results
        chatCache.set(cacheKey, sortedResults);

        logger.info(`Semantic search completed: ${sortedResults.length} results for query "${query}"`);
      } else {
        // Fallback to basic keyword search
        const fallbackResults = performFallbackSearch(query, materials, searchOptions);
        setSearchResults(fallbackResults);
      }

    } catch (err) {
      logger.error('Semantic search failed:', err);
      setError('Pencarian semantik gagal. Menggunakan pencarian dasar.');
      
      // Fallback to basic search
      const fallbackResults = performFallbackSearch(query, materials, searchOptions);
      setSearchResults(fallbackResults);
    } finally {
      setIsSearching(false);
    }
  }, [materials, materialIndex, options.enableQueryExpansion, options.includeRelated, options.maxResults, options.minRelevanceScore]);

  // Get search suggestions
  const getSuggestions = useCallback(async (partialQuery: string): Promise<string[]> => {
    if (!partialQuery.trim() || partialQuery.length < 2) {
      return [];
    }

    try {
      // Extract common keywords from materials
      const allKeywords = materialIndex.flatMap(item => [
        ...item.keywords,
        ...item.concepts,
        ...item.material.title.split(' '),
        item.subject
      ]);

      // Filter and rank suggestions based on partial query
      const suggestions = allKeywords
        .filter((keyword: string) => 
          typeof keyword === 'string' &&
          keyword.toLowerCase().includes(partialQuery.toLowerCase()) &&
          keyword.length > 2
        )
        .sort((a: string, b: string) => {
          // Prioritize exact matches and shorter suggestions
          const aExact = a.toLowerCase() === partialQuery.toLowerCase();
          const bExact = b.toLowerCase() === partialQuery.toLowerCase();
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          return a.length - b.length;
        })
        .slice(0, 8);

      return Array.from(new Set(suggestions)) as string[]; // Remove duplicates
    } catch (err) {
      logger.error('Failed to get suggestions:', err);
      return [];
    }
  }, [materialIndex]);

  // Get related materials based on a specific material
  const getRelatedMaterials = useCallback(async (materialId: string): Promise<ELibraryType[]> => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return [];

    try {
      // Find similar materials based on keywords, concepts, and subject
      const currentIndex = materialIndex.find(item => item.material.id === materialId);
      if (!currentIndex) return [];

      const related = materialIndex
        .filter(item => item.material.id !== materialId)
        .map(item => {
          let similarity = 0;

          // Subject similarity
          if (item.subject === currentIndex.subject) similarity += 0.4;

          // Keyword overlap
          const commonKeywords = item.keywords.filter(k => currentIndex.keywords.includes(k));
          similarity += (commonKeywords.length / Math.max(item.keywords.length, currentIndex.keywords.length)) * 0.3;

          // Concept overlap
          const commonConcepts = item.concepts.filter(c => currentIndex.concepts.includes(c));
          similarity += (commonConcepts.length / Math.max(item.concepts.length, currentIndex.concepts.length)) * 0.3;

          return { material: item.material, similarity };
        })
        .filter(item => item.similarity > 0.2)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
        .map(item => item.material);

      setRelatedMaterials(related);
      return related;
    } catch (err) {
      logger.error('Failed to get related materials:', err);
      return [];
    }
  }, [materials, materialIndex]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setSuggestedQueries([]);
    setRelatedMaterials([]);
    setError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    error,
    searchQuery,
    suggestedQueries,
    relatedMaterials,
    semanticSearch,
    clearSearch,
    getSuggestions,
    getRelatedMaterials
  };
}

// Helper function to extract keywords from material
function extractKeywords(material: ELibraryType): string[] {
  const text = [
    material.title,
    material.description || '',
    material.category,
    material.uploadedBy
  ].join(' ').toLowerCase();

  // Extract meaningful words (filter out common words)
  const commonWords = ['dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'yang', 'ada', 'ini', 'itu', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  
  return text
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10);
}

// Helper function to extract concepts from material
function extractConcepts(material: ELibraryType): string[] {
  const text = [
    material.title,
    material.description || '',
    material.ocrText || ''
  ].join(' ').toLowerCase();

  // Extract educational concepts and terms
  const concepts: string[] = [];

  // Academic terms
  const academicTerms = ['matematika', 'aljabar', 'geometri', 'fisika', 'kimia', 'biologi', 'sejarah', 'geografi', 'ekonomi', 'sosiologi'];
  concepts.push(...academicTerms.filter(term => text.includes(term)));

  // Common educational concepts
  const educationalConcepts = ['pembelajaran', 'kurikulum', 'kompetensi', 'penilaian', 'metode', 'strategi', 'media', 'sumber', 'belajar', 'mengajar'];
  concepts.push(...educationalConcepts.filter(concept => text.includes(concept)));

  return Array.from(new Set(concepts)).slice(0, 8);
}

// Type for AI analysis response
interface AIAnalysisResponse {
  queryConcepts: string[];
  expandedQuery: string[];
  results: Array<{
    materialId: string;
    relevanceScore: number;
    relevanceReason: string;
    matchedConcepts: string[];
    relatedMaterialIds: string[];
  }>;
}

// Helper function to perform AI semantic analysis
async function performSemanticAnalysis(prompt: string): Promise<AIAnalysisResponse | null> {
  try {
    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: (import.meta.env.VITE_GEMINI_API_KEY as string) || '' });
    
    const response = await ai.models.generateContent({
      model: AI_MODELS.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a semantic search analysis AI for educational content. Always respond with valid JSON."
      }
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from AI');
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError, text);
      return null;
    }
  } catch (error) {
    logger.error('Semantic analysis error:', error);
    return null;
  }
}

// Fallback search when AI fails
function performFallbackSearch(
  query: string, 
  materials: ELibraryType[], 
  options: SemanticSearchOptions
): SemanticSearchResult[] {
  const lowerQuery = query.toLowerCase();
  const queryTerms = query.toLowerCase().split(/\s+/);

  return materials
    .map(material => {
      let relevanceScore = 0;
      const matchedConcepts: string[] = [];

      // Title matching
      if (material.title.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 0.8;
        matchedConcepts.push('title match');
      }

      // Description matching
      if (material.description?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 0.6;
        matchedConcepts.push('description match');
      }

      // Category/Subject matching
      if (material.category.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 0.5;
        matchedConcepts.push('subject match');
      }

      // Term matching
      queryTerms.forEach(term => {
        if (material.title.toLowerCase().includes(term)) {
          relevanceScore += 0.3;
          matchedConcepts.push(`term: ${term}`);
        }
      });

      // OCR text matching
      if (options.includeOCR && material.ocrText?.toLowerCase().includes(lowerQuery)) {
        relevanceScore += 0.4;
        matchedConcepts.push('ocr match');
      }

      return {
        material,
        relevanceScore: Math.min(relevanceScore, 1.0),
        relevanceReason: matchedConcepts.join(', '),
        matchedConcepts
      };
    })
    .filter(result => result.relevanceScore >= (options.minRelevanceScore || 0.3))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, options.maxResults || 20);
}