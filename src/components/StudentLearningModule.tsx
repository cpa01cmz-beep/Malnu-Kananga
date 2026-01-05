import React, { useState } from 'react';
import { UserExtraRole } from '../types';

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

const StudentLearningModule: React.FC<StudentLearningModuleProps> = ({ onShowToast: _onShowToast, extraRole: _extraRole }) => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showAIQuiz, setShowAIQuiz] = useState(false);
    const [showFlashcards, setShowFlashcards] = useState(false);
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

    return (
        <main className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Learning Module</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topics.map(topic => (
                        <div
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md cursor-pointer"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{topic.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</p>
                        </div>
                    ))}
                </div>

                {selectedTopic && (
                    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{selectedTopic.title}</h2>
                        
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowQuiz(!showQuiz)}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Quiz
                            </button>
                            <button
                                onClick={() => setShowAIQuiz(!showAIQuiz)}
                                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                            >
                                AI Quiz
                            </button>
                            <button
                                onClick={() => setShowFlashcards(!showFlashcards)}
                                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Flashcards
                            </button>
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
                                                    <label key={idx} className="flex items-center space-x-2">
                                                        <input type="radio" name={`quiz-${quiz.id}`} />
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
                                <p className="text-gray-600 dark:text-gray-300">AI-powered quiz coming soon...</p>
                            </div>
                        )}

                        {showFlashcards && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Flashcards</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {flashcards.map(card => (
                                        <div key={card.id} className="p-4 border rounded-lg">
                                            <div className="font-medium">Front: {card.front}</div>
                                            <div className="text-gray-600">Back: {card.back}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default StudentLearningModule;