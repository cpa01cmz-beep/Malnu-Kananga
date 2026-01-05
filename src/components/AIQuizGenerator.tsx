import React, { useState } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
}

interface AIQuizGeneratorProps {
  topic?: string;
  subject?: string;
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  onClose?: () => void;
}

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, variant = 'default', size = 'default', onClick, className = '', disabled = false }) => {
  const baseStyles = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const variantStyles = variant === 'outline'
    ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
    : 'bg-blue-500 text-white hover:bg-blue-600';
  const sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} ${disabledStyles}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantStyles = variant === 'outline'
    ? 'border border-gray-300 text-gray-700'
    : variant === 'secondary'
    ? 'bg-gray-100 text-gray-800'
    : 'bg-green-500 text-white';

  return <span className={`${baseStyles} ${variantStyles} ${className}`}>{children}</span>;
};

export default function AIQuizGenerator({
  topic = '',
  subject = 'Matematika',
  questionCount = 5,
  difficulty = 'medium',
  onClose
}: AIQuizGeneratorProps) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingTopic, setGeneratingTopic] = useState(topic);
  const [generatingSubject, setGeneratingSubject] = useState(subject);

  const generateQuiz = async () => {
    if (!generatingTopic || !generatingSubject) return;

    setGenerating(true);
    try {
      const { generateQuizAI } = await import('../services/geminiService');
      const generatedQuiz = await generateQuizAI(
        generatingTopic,
        generatingSubject,
        questionCount,
        difficulty
      );
      setQuiz(generatedQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswers([]);
      setShowExplanation(false);
      setShowResults(false);
    } catch (_error) {
      console.error('Error generating quiz:', _error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return answers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length;
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setShowResults(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showResults && quiz) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              Hasil Kuis AI
            </h3>
          </div>
          <div className="p-4 space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{score}/{quiz.questions.length}</div>
              <div className="text-2xl text-gray-600 mb-4">{percentage}%</div>
              <Progress value={percentage} className="mb-4" />
            </div>

            <div className="space-y-3">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm">Soal {index + 1}</span>
                  {answers[index] === question.correctAnswer ? (
                    <span className="text-green-600">✓ Benar</span>
                  ) : (
                    <span className="text-red-600">✗ Salah</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={resetQuiz} variant="outline">
                Ulangi Kuis
              </Button>
              <Button onClick={() => {
                setQuiz(null);
              }}>
                Buat Kuis Baru
              </Button>
              {onClose && (
                <Button onClick={onClose}>
                  Kembali
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Generator Kuis AI</h2>
            <p className="text-sm text-gray-600">
              Buat kuis interaktif dengan bantuan AI
            </p>
          </div>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Tutup
            </Button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mata Pelajaran
            </label>
            <select
              value={generatingSubject}
              onChange={(e) => setGeneratingSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Pilih Mata Pelajaran</option>
              <option value="Matematika">Matematika</option>
              <option value="IPA">IPA</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="Bahasa Inggris">Bahasa Inggris</option>
              <option value="PKN">PKN</option>
              <option value="Agama">Agama</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topik
            </label>
            <input
              type="text"
              value={generatingTopic}
              onChange={(e) => setGeneratingTopic(e.target.value)}
              placeholder="Contoh: Aljabar Dasar, Struktur Atom, dll."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jumlah Soal
            </label>
            <select
              value={questionCount}
              onChange={() => setQuiz(null)} // Reset quiz when changing settings
              disabled={true}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white opacity-60"
            >
              <option value={3}>3 Soal</option>
              <option value={5}>5 Soal</option>
              <option value={10}>10 Soal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tingkat Kesulitan
            </label>
            <select
              value={difficulty}
              onChange={() => setQuiz(null)}
              disabled={true}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white opacity-60"
            >
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
            </select>
          </div>

          <Button
            onClick={generateQuiz}
            disabled={generating || !generatingTopic || !generatingSubject}
            className="w-full"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Membuat Kuis...
              </span>
            ) : (
              'Buat Kuis dengan AI'
            )}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Semakin spesifik topik, semakin baik hasilnya</li>
              <li>• Gunakan istilah akademik yang tepat</li>
              <li>• AI akan membuat soal berdasarkan kurikulum yang relevan</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            ← Kembali
          </Button>
        )}
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline">{quiz.subject}</Badge>
            <Badge className={getDifficultyColor(quiz.difficulty)}>
              {quiz.difficulty === 'easy' ? 'Mudah' :
               quiz.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
            </Badge>
            <Badge variant="secondary">⚡ AI Generated</Badge>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {currentQuestionIndex + 1}/{quiz.questions.length}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Soal {currentQuestionIndex + 1}
              </h3>
              <Badge variant="outline">{quiz.topic}</Badge>
            </div>
            <Progress
              value={((currentQuestionIndex + 1) / quiz.questions.length) * 100}
              className="mb-4"
            />
            <p className="text-lg">{currentQuestion.question}</p>
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${
                  showExplanation && index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : ''
                } ${
                  showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{option}</span>
                  {showExplanation && index === currentQuestion.correctAnswer && (
                    <span className="text-green-600">✓</span>
                  )}
                  {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                    <span className="text-red-600">✗</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showExplanation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Penjelasan:</h4>
              <p className="text-blue-700 dark:text-blue-400">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Jawab
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
