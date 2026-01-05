import React, { useState, useEffect } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardHeaderProps> = ({ children }) => (
  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
    {children}
  </div>
);

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

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

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

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

interface InteractiveQuizProps {
  quizId?: string;
  onBack?: () => void;
}

export default function InteractiveQuiz({ quizId, onBack }: InteractiveQuizProps) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadQuiz = async () => {
    try {
      // Mock quiz data - to be replaced with API call
      const mockQuiz: QuizData = {
        id: quizId || '1',
        title: 'Kuis Aljabar Dasar',
        subject: 'Matematika',
        topic: 'Operasi Aljabar',
        difficulty: 'medium',
        questions: [
          {
            id: '1',
            question: 'Jika 2x + 5 = 13, maka nilai x adalah...',
            options: ['x = 4', 'x = 8', 'x = 6', 'x = 3'],
            correctAnswer: 0,
            explanation: '2x + 5 = 13 → 2x = 13 - 5 → 2x = 8 → x = 4'
          },
          {
            id: '2',
            question: 'Hasil dari (3x + 2y) + (x - y) adalah...',
            options: ['4x + y', '4x + 3y', '2x + y', '3x + y'],
            correctAnswer: 0,
            explanation: '(3x + 2y) + (x - y) = 3x + x + 2y - y = 4x + y'
          },
          {
            id: '3',
            question: 'Jika a = 3 dan b = 2, maka nilai dari 2a² - b adalah...',
            options: ['16', '14', '12', '10'],
            correctAnswer: 0,
            explanation: '2a² - b = 2(3)² - 2 = 2(9) - 2 = 18 - 2 = 16'
          }
        ]
      };
      
      setQuiz(mockQuiz);
      setLoading(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setLoading(false);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Memuat kuis...</div>;
  }

  if (!quiz) {
    return <div className="text-center text-red-500">Kuis tidak ditemukan</div>;
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Hasil Kuis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2">{score}/{quiz.questions.length}</div>
              <div className="text-2xl text-gray-600 mb-4">{percentage}%</div>
              <Progress value={percentage} className="mb-4" />
            </div>
            
            <div className="space-y-3">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
              {onBack && (
                <Button onClick={onBack}>
                  Kembali
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
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
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {currentQuestionIndex + 1}/{quiz.questions.length}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
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
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  showExplanation && index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : ''
                } ${
                  showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer
                    ? 'border-red-500 bg-red-50'
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
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Penjelasan:</h4>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}