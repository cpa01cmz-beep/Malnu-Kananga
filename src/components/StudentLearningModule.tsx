import React, { useState } from 'react';
import { UserExtraRole } from '../types';
import { GoogleGenAI } from '@google/genai';
import { withCircuitBreaker, classifyError, logError, getUserFriendlyMessage } from '../utils/errorHandler';
import LoadingSpinner from './ui/LoadingSpinner';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';
import { EmptyState } from './ui/LoadingState';
import FormGrid from './ui/FormGrid';

interface StudentLearningModuleProps {
    onShowToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    extraRole: UserExtraRole;
}

interface Topic {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

interface Lesson {
    id: string;
    title: string;
    content: string;
    completed: boolean;
}

interface Quiz {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

interface Flashcard {
    id: string;
    front: string;
    back: string;
    mastered: boolean;
}

interface AIQuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface AIQuizState {
    questions: AIQuizQuestion[];
    currentQuestionIndex: number;
    userAnswers: number[];
    isSubmitted: boolean;
    score: number;
    isGenerating: boolean;
}

const StudentLearningModule: React.FC<StudentLearningModuleProps> = ({ onShowToast }) => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showAIQuiz, setShowAIQuiz] = useState(false);
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [aiQuizState, setAIQuizState] = useState<AIQuizState>({
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        isSubmitted: false,
        score: 0,
        isGenerating: false
    });
    const [topics] = useState<Topic[]>([
        { id: '1', title: 'Matematika', description: 'Pemahaman konsep matematika dasar', completed: false },
        { id: '2', title: 'Bahasa Indonesia', description: 'Keterampilan berbahasa Indonesia', completed: false },
        { id: '3', title: 'IPA', description: 'Ilmu Pengetahuan Alam', completed: false },
        { id: '4', title: 'IPS', description: 'Ilmu Pengetahuan Sosial', completed: false }
    ]);
    const [_lessons] = useState<Lesson[]>([
        { id: '1', title: 'Pengenalan', content: 'Selamat datang di materi pembelajaran...', completed: false },
        { id: '2', title: 'KONSEP DASAR', content: 'Materi konsep dasar...', completed: false }
    ]);
    const [quizzes] = useState<Quiz[]>([
        { id: '1', question: 'Apa itu?', options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], correctAnswer: 0 }
    ]);
    const [flashcards] = useState<Flashcard[]>([
        { id: '1', front: 'Question', back: 'Answer', mastered: false }
    ]);

    // Initialize Google AI
    const ai = new GoogleGenAI({ apiKey: (import.meta.env.VITE_GEMINI_API_KEY as string) || '' });

    // Generate AI Quiz questions
    const generateAIQuiz = async (topic: Topic) => {
        setAIQuizState(prev => ({ ...prev, isGenerating: true }));
        
        try {
            const systemInstruction = `Anda adalah seorang guru yang ahli dalam ${topic.title}. 
            Buatkan 5 soal pilihan ganda tentang ${topic.title} dengan format JSON berikut:
            
            {
              "questions": [
                {
                  "question": "string",
                  "options": ["string", "string", "string", "string"],
                  "correctAnswer": number,
                  "explanation": "string",
                  "difficulty": "easy" | "medium" | "hard"
                }
              ]
            }
            
            Requirements:
            - Soal harus sesuai dengan tingkat SMA/MA
            - Opsi jawaban harus masuk akal
            - Berikan penjelasan singkat untuk jawaban benar
            - Campur tingkat kesulitan (easy, medium, hard)
            - Kembalikan response dalam bentuk JSON yang valid
            - Gunakan Bahasa Indonesia`;

            const response = await withCircuitBreaker(async () => {
                return await ai.models.generateContent({
                    model: 'gemini-2.0-flash-exp',
                    contents: `Buatkan 5 soal pilihan ganda tentang ${topic.title} untuk tingkat SMA/MA`,
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json"
                    }
                });
            });

            const jsonResponse = JSON.parse(response.text || '{}');
            const questions = jsonResponse.questions || [];

            setAIQuizState({
                questions,
                currentQuestionIndex: 0,
                userAnswers: new Array(questions.length).fill(-1),
                isSubmitted: false,
                score: 0,
                isGenerating: false
            });

            onShowToast('Kuis AI berhasil dibuat!', 'success');
        } catch (error) {
            const classifiedError = classifyError(error, {
                operation: 'generateAIQuiz',
                timestamp: Date.now()
            });
            logError(classifiedError);
            const message = getUserFriendlyMessage(classifiedError);
            onShowToast(message === 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.' 
                ? 'Gagal membuat kuis AI. Silakan coba lagi.' 
                : message, 'error');
            setAIQuizState(prev => ({ ...prev, isGenerating: false }));
        }
    };

    // Handle AI Quiz answer selection
    const handleAIQuizAnswer = (questionIndex: number, answerIndex: number) => {
        if (aiQuizState.isSubmitted) return;
        
        setAIQuizState(prev => {
            const newUserAnswers = [...prev.userAnswers];
            newUserAnswers[questionIndex] = answerIndex;
            return { ...prev, userAnswers: newUserAnswers };
        });
    };

    // Submit AI Quiz
    const submitAIQuiz = () => {
        let correctAnswers = 0;
        aiQuizState.questions.forEach((question, index) => {
            if (aiQuizState.userAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        setAIQuizState(prev => ({
            ...prev,
            isSubmitted: true,
            score: correctAnswers
        }));

        onShowToast(`Kuis selesai! Skor: ${correctAnswers}/${aiQuizState.questions.length}`, 'info');
    };

    // Reset AI Quiz
    const resetAIQuiz = () => {
        setAIQuizState({
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: [],
            isSubmitted: false,
            score: 0,
            isGenerating: false
        });
    };

    return (
        <main className="pt-24 min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">Learning Module</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topics.map(topic => (
                        <Card
                            key={topic.id}
                            variant="interactive"
                            onClick={() => setSelectedTopic(topic)}
                            aria-label={`Topik ${topic.title}: ${topic.description}`}
                            aria-pressed={selectedTopic?.id === topic.id}
                        >
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{topic.title}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{topic.description}</p>
                        </Card>
                    ))}
                </div>

                {selectedTopic && (
                    <Card variant="default" padding="lg" className="mt-8">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">{selectedTopic.title}</h2>
                        
                        <div className="space-y-4">
                            <Button
                                variant="info"
                                fullWidth
                                onClick={() => setShowQuiz(!showQuiz)}
                            >
                                Quiz
                            </Button>
                            <Button
                                variant="indigo"
                                fullWidth
                                onClick={() => {
                                    if (!showAIQuiz && selectedTopic) {
                                        generateAIQuiz(selectedTopic);
                                    }
                                    setShowAIQuiz(!showAIQuiz);
                                }}
                                isLoading={aiQuizState.isGenerating}
                                disabled={!selectedTopic || aiQuizState.isGenerating}
                            >
                                {aiQuizState.isGenerating ? 'Membuat Kuis...' : 'AI Quiz'}
                            </Button>
                            <Button
                                variant="success"
                                fullWidth
                                onClick={() => setShowFlashcards(!showFlashcards)}
                            >
                                Flashcards
                            </Button>
                        </div>

                        {showQuiz && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Quiz</h3>
                                <div className="space-y-3">
                                    {quizzes.map(quiz => (
                                        <div key={quiz.id} className="p-4 border rounded-lg">
                                            <p className="font-medium">{quiz.question}</p>
                                            <div className="mt-2 space-y-2">
                                                {quiz.options.map((option, idx) => (
                                                    <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            id={`quiz-${quiz.id}-option-${idx}`}
                                                            name={`quiz-${quiz.id}`}
                                                            aria-label={`Opsi ${idx + 1} untuk ${quiz.question}`}
                                                        />
                                                        <span>{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showAIQuiz && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">AI Quiz</h3>
                                
                                {aiQuizState.isGenerating ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <LoadingSpinner size="md" color="primary" text="Sedang membuat kuis..." />
                                    </div>
                                ) : aiQuizState.questions.length === 0 ? (
                                    <EmptyState
                                      message={selectedTopic ? `Belum ada kuis untuk topik "${selectedTopic.title}"` : 'Silakan pilih topik terlebih dahulu'}
                                      action={selectedTopic ? { label: 'Buat Kuis Baru', onClick: () => selectedTopic && generateAIQuiz(selectedTopic) } : undefined}
                                      size="md"
                                    />
                                ) : (
                                    <div>
                                        {!aiQuizState.isSubmitted ? (
                                            <div className="space-y-6">
                                                {aiQuizState.questions.map((question, qIndex) => (
                                                    <div key={question.id} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="font-medium">
                                                                {qIndex + 1}. {question.question}
                                                            </span>
                                                            <Badge
                                                                variant={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'}
                                                                size="sm"
                                                            >
                                                                {question.difficulty}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {question.options.map((option, oIndex) => (
                                                                <label key={oIndex} className="flex items-center space-x-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        id={`ai-quiz-${qIndex}-option-${oIndex}`}
                                                                        name={`ai-quiz-${qIndex}`}
                                                                        checked={aiQuizState.userAnswers[qIndex] === oIndex}
                                                                        onChange={() => handleAIQuizAnswer(qIndex, oIndex)}
                                                                        className="text-purple-500"
                                                                        aria-label={`Opsi ${oIndex + 1}: ${option}`}
                                                                    />
                                                                    <span className={`${aiQuizState.userAnswers[qIndex] === oIndex ? 'font-medium text-purple-600' : ''}`}>
                                                                        {option}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-neutral-600">
                                                        {aiQuizState.userAnswers.filter(answer => answer !== -1).length} dari {aiQuizState.questions.length} soal dijawab
                                                    </span>
                                                    <Button
                                                        onClick={submitAIQuiz}
                                                        disabled={aiQuizState.userAnswers.some(answer => answer === -1)}
                                                        variant="purple-solid"
                                                    >
                                                        Submit Kuis
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="text-center py-6 bg-purple-50 rounded-lg">
                                                    <h4 className="text-xl font-bold text-purple-800 mb-2">
                                                        Kuis Selesai!
                                                    </h4>
                                                    <p className="text-3xl font-bold text-purple-600 mb-2">
                                                        {aiQuizState.score}/{aiQuizState.questions.length}
                                                    </p>
                                                    <p className="text-neutral-600">
                                                        {aiQuizState.score === aiQuizState.questions.length ? 'Sempurna!' :
                                                         aiQuizState.score >= aiQuizState.questions.length * 0.8 ? 'Bagus!' :
                                                         aiQuizState.score >= aiQuizState.questions.length * 0.6 ? 'Cukup Baik' : 'Perlu Belajar Lagi'}
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    {aiQuizState.questions.map((question, qIndex) => (
                                                        <div key={question.id} className={`border rounded-lg p-4 ${
                                                            aiQuizState.userAnswers[qIndex] === question.correctAnswer 
                                                                ? 'border-green-200 bg-green-50' 
                                                                : 'border-red-200 bg-red-50'
                                                        }`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-medium">
                                                                    {qIndex + 1}. {question.question}
                                                                </span>
                                                                <span className={`text-sm font-medium ${
                                                                    aiQuizState.userAnswers[qIndex] === question.correctAnswer 
                                                                        ? 'text-green-600' 
                                                                        : 'text-red-600'
                                                                }`}>
                                                                    {aiQuizState.userAnswers[qIndex] === question.correctAnswer ? 'Benar' : 'Salah'}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="text-sm space-y-1">
                                                                <div>
                                                                    <strong>Jawaban Anda:</strong> {question.options[aiQuizState.userAnswers[qIndex]]}
                                                                </div>
                                                                <div>
                                                                    <strong>Jawaban Benar:</strong> {question.options[question.correctAnswer]}
                                                                </div>
                                                                <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                                                                    <strong>Penjelasan:</strong> {question.explanation}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="text-center">
                                                    <Button
                                                        onClick={resetAIQuiz}
                                                        variant="purple-solid"
                                                    >
                                                        Buat Kuis Baru
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {showFlashcards && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Flashcards</h3>
                                <FormGrid>
                                    {flashcards.map(card => (
                                        <Card key={card.id} variant="default" padding="md" className="border">
                                            <div className="font-medium">Front: {card.front}</div>
                                            <div className="text-neutral-600">Back: {card.back}</div>
                                        </Card>
                                    ))}
                                </FormGrid>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </main>
    );
};

export default StudentLearningModule;