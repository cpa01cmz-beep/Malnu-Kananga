import React, { useState, useEffect } from 'react';
import type { ELibrary, Quiz, QuizQuestion } from '../types';
import { QuizDifficulty, QuizQuestionType } from '../types';
import { generateQuiz } from '../services/ai';
import { eLibraryAPI } from '../services/apiService';
import { logger } from '../utils/logger';
import { QUESTION_TYPES, QUIZ_CONFIG, QUESTION_DIFFICULTY_LABELS } from '../config/quiz-config';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';
import Badge from './ui/Badge';
import BookOpenIcon from './icons/BookOpenIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClockIcon } from './icons/ClockIcon';

interface QuizGeneratorProps {
  onSuccess?: (quiz: Quiz) => void;
  onCancel?: () => void;
  defaultSubjectId?: string;
  defaultClassId?: string;
}

interface GenerationOptions {
  questionCount: number;
  questionTypes: QuizQuestionType[];
  difficulty: QuizDifficulty;
  totalPoints: number;
  focusAreas: string[];
}

export function QuizGenerator({ onSuccess, onCancel, defaultSubjectId, defaultClassId }: QuizGeneratorProps) {
  const [materials, setMaterials] = useState<ELibrary[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'options' | 'preview'>('select');
  const [options, setOptions] = useState<GenerationOptions>({
    questionCount: QUIZ_CONFIG.DEFAULT_QUESTION_COUNT,
    questionTypes: [QuizQuestionType.MULTIPLE_CHOICE, QuizQuestionType.TRUE_FALSE, QuizQuestionType.SHORT_ANSWER],
    difficulty: QuizDifficulty.MEDIUM,
    totalPoints: QUIZ_CONFIG.DEFAULT_TOTAL_POINTS,
    focusAreas: [],
  });
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eLibraryAPI.getAll();
      setMaterials(response?.data || []);
    } catch (err) {
      logger.error('Failed to load materials:', err);
      setError('Gagal memuat materi pembelajaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaterial = (materialId: string) => {
    setSelectedMaterials(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId);
      }
      return [...prev, materialId];
    });
  };

  const handleNextStep = () => {
    if (step === 'select' && selectedMaterials.length === 0) {
      setError('Silakan pilih minimal satu materi pembelajaran.');
      return;
    }
    if (step === 'options') {
      generateQuizContent();
      return;
    }
    setStep('options');
  };

  const handlePreviousStep = () => {
    if (step === 'options') {
      setStep('select');
    } else if (step === 'preview') {
      setStep('options');
    }
  };

  const generateQuizContent = async () => {
    if (selectedMaterials.length === 0) {
      setError('Silakan pilih minimal satu materi pembelajaran.');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const selectedMaterialData = materials.filter(m => selectedMaterials.includes(m.id));
      
      const quizData = await generateQuiz(selectedMaterialData, options);
      
      const generatedQuizData: Quiz = {
        ...quizData,
        id: `quiz-${Date.now()}`,
        subjectId: defaultSubjectId || '',
        classId: defaultClassId || '',
        teacherId: '',
        academicYear: '2025-2026',
        semester: '1',
        duration: quizData.duration || 60,
        passingScore: quizData.passingScore || QUIZ_CONFIG.DEFAULT_PASSING_SCORE,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalPoints: quizData.totalPoints,
        questions: quizData.questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: (q.type === 'multiple_choice' ? QuizQuestionType.MULTIPLE_CHOICE :
                 q.type === 'true_false' ? QuizQuestionType.TRUE_FALSE :
                 q.type === 'short_answer' ? QuizQuestionType.SHORT_ANSWER :
                 q.type === 'essay' ? QuizQuestionType.ESSAY :
                 q.type === 'fill_blank' ? QuizQuestionType.FILL_BLANK :
                 q.type === 'matching' ? QuizQuestionType.MATCHING :
                 QuizQuestionType.MULTIPLE_CHOICE),
          difficulty: (q.difficulty === 'easy' ? QuizDifficulty.EASY :
                     q.difficulty === 'medium' ? QuizDifficulty.MEDIUM :
                     q.difficulty === 'hard' ? QuizDifficulty.HARD :
                     QuizDifficulty.MEDIUM),
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
          materialReference: q.materialReference,
          tags: q.tags,
        })),
        attempts: 0,
        aiGenerated: true,
      };
      setGeneratedQuiz(generatedQuizData);
      setStep('preview');
    } catch (err) {
      logger.error('Failed to generate quiz:', err);
      setError(err instanceof Error ? err.message : 'Gagal membuat kuis. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveQuiz = () => {
    if (generatedQuiz) {
      const quizWithMetadata: Quiz = {
        ...generatedQuiz,
        subjectId: defaultSubjectId || generatedQuiz.subjectId || '',
        classId: defaultClassId || generatedQuiz.classId || '',
        materialIds: selectedMaterials,
        status: 'draft',
        createdAt: generatedQuiz.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess?.(quizWithMetadata);
    }
  };

  const renderSelectMaterials = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Pilih Materi Pembelajaran
        </h3>
        <Badge variant="info">
          {selectedMaterials.length} dipilih
        </Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <Card className="border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={loadMaterials} className="mt-4">
            Coba Lagi
          </Button>
        </Card>
      ) : materials.length === 0 ? (
        <Card className="text-center py-8">
          <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada materi pembelajaran. Silakan upload materi terlebih dahulu.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {materials.map((material) => (
            <Card
              key={material.id}
              className={`cursor-pointer transition-all ${
                selectedMaterials.includes(material.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:border-blue-300 dark:hover:border-blue-700'
              }`}
              onClick={() => toggleMaterial(material.id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleMaterial(material.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {material.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {material.category} • {material.fileType?.toUpperCase()}
                  </p>
                  {material.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderOptions = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Konfigurasi Kuis
      </h3>

       <div>
        <label htmlFor="question-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Jumlah Pertanyaan
        </label>
        <Input
          id="question-count"
          type="number"
          min={QUIZ_CONFIG.MIN_QUESTIONS}
          max={QUIZ_CONFIG.MAX_QUESTIONS}
          value={options.questionCount}
          onChange={(e) => {
            const value = e.target.value;
            setOptions(prev => ({ ...prev, questionCount: value === '' ? 0 : parseInt(value) || QUIZ_CONFIG.DEFAULT_QUESTION_COUNT }));
          }}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tingkat Kesulitan
        </label>
        <Select
          id="difficulty"
          value={options.difficulty}
          onChange={(e) => setOptions(prev => ({ ...prev, difficulty: e.target.value as QuizDifficulty }))}
          className="w-full"
        >
          {Object.entries(QUESTION_DIFFICULTY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Jenis Pertanyaan
        </label>
        <div className="space-y-2">
          {QUESTION_TYPES.map((type) => (
            <label key={type.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.questionTypes.includes(type.id as QuizQuestionType)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setOptions(prev => ({
                      ...prev,
                      questionTypes: [...prev.questionTypes, type.id as QuizQuestionType],
                    }));
                  } else {
                    setOptions(prev => ({
                      ...prev,
                      questionTypes: prev.questionTypes.filter(t => t !== type.id),
                    }));
                  }
                }}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="total-points" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Total Poin
        </label>
        <Input
          id="total-points"
          type="number"
          min={QUIZ_CONFIG.MIN_TOTAL_POINTS}
          max={QUIZ_CONFIG.MAX_TOTAL_POINTS}
          step={QUIZ_CONFIG.POINTS_STEP}
          value={options.totalPoints}
          onChange={(e) => {
            const value = e.target.value;
            setOptions(prev => ({ ...prev, totalPoints: value === '' ? 0 : parseInt(value) || QUIZ_CONFIG.DEFAULT_TOTAL_POINTS }));
          }}
          className="w-full"
        />
      </div>

        <div>
          <label htmlFor="focus-areas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topik Fokus (opsional)
          </label>
          <Textarea
            id="focus-areas"
            placeholder="Contoh: Hukum Newton, Energi Kinematik, dll. (pisahkan dengan koma)"
            value={options.focusAreas.join(', ')}
            onChange={(e) => {
              const value = e.target.value;
              setOptions(prev => ({ ...prev, focusAreas: value.split(',').filter(Boolean) }));
            }}
            className="w-full"
            rows={3}
          />
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </Card>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Tips Pembuatan Kuis
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li>• Pilih 2-5 materi yang relevan untuk hasil terbaik</li>
              <li>• Gunakan campuran jenis pertanyaan untuk variasi</li>
              <li>• Tentukan topik fokus untuk pertanyaan lebih spesifik</li>
              <li>• AI akan membuat poin merata berdasarkan jumlah pertanyaan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (!generatedQuiz) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {generatedQuiz.title}
          </h3>
          <Badge variant="success">AI Generated</Badge>
        </div>

        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <p className="text-gray-700 dark:text-gray-300">{generatedQuiz.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>{generatedQuiz.duration} menit</span>
            </div>
            <span>•</span>
            <span>{generatedQuiz.questions.length} pertanyaan</span>
            <span>•</span>
            <span>{generatedQuiz.totalPoints} poin</span>
            <span>•</span>
            <span>Lulus: {generatedQuiz.passingScore} poin</span>
          </div>
        </Card>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {generatedQuiz.questions.map((question: QuizQuestion, index: number) => (
            <Card key={question.id}>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {question.question}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info" size="sm">
                      {question.type}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {question.points} poin
                    </Badge>
                  </div>
                  {question.options && (
                    <ul className="mt-3 space-y-1 ml-4">
                      {question.options.map((option: string, optIndex: number) => (
                        <li
                          key={optIndex}
                          className={`text-sm ${
                            option === question.correctAnswer
                              ? 'text-green-700 dark:text-green-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {option === question.correctAnswer && (
                            <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {question.explanation && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <strong>Penjelasan:</strong> {question.explanation}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Buat Kuis dengan AI
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gunakan kecerdasan buatan untuk membuat kuis dari materi pembelajaran
        </p>
      </div>

      <Card className="p-6">
        {step === 'select' && renderSelectMaterials()}
        {step === 'options' && renderOptions()}
        {step === 'preview' && renderPreview()}

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {step !== 'select' && (
              <Button variant="outline" onClick={handlePreviousStep}>
                Kembali
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
            {step === 'preview' ? (
              <Button onClick={handleSaveQuiz} disabled={generating} shortcut="Ctrl+S">
                Simpan Kuis
              </Button>
            ) : (
              <Button onClick={handleNextStep} disabled={loading || generating}>
                {generating ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Membuat Kuis...
                  </>
                ) : (
                  step === 'select' ? 'Lanjut' : 'Buat Kuis'
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}