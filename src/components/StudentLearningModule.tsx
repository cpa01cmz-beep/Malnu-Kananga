import React, { useState, useEffect } from 'react';
import InteractiveQuiz from './InteractiveQuiz';
import AIQuizGenerator from './AIQuizGenerator';
import FlashCardDeck from './FlashCardDeck';

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

interface LearningModule {
  id: string;
  subject: string;
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  completed: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'theory' | 'exercise' | 'quiz';
  completed: boolean;
}

export default function StudentLearningModule() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'modules' | 'topics' | 'lesson' | 'quiz' | 'ai-quiz' | 'flashcards'>('modules');

  useEffect(() => {
    loadLearningModules();
  }, []);

  const loadLearningModules = async () => {
    try {
      // Mock data - to be replaced with API call
      const mockModules: LearningModule[] = [
        {
          id: '1',
          subject: 'Matematika',
          title: 'Aljabar Dasar',
          description: 'Pengenalan konsep aljabar dan operasi dasar',
          progress: 60,
          topics: [
            {
              id: '1-1',
              title: 'Variabel dan Konstanta',
              completed: true,
              lessons: [
                { id: '1-1-1', title: 'Pengenalan Variabel', type: 'theory', completed: true },
                { id: '1-1-2', title: 'Latihan Variabel', type: 'exercise', completed: true },
              ]
            },
            {
              id: '1-2',
              title: 'Operasi Aljabar',
              completed: false,
              lessons: [
                { id: '1-2-1', title: 'Penjumlahan dan Pengurangan', type: 'theory', completed: false },
                { id: '1-2-2', title: 'Latihan Operasi', type: 'exercise', completed: false },
                { id: '1-2-3', title: 'Kuis Operasi Aljabar', type: 'quiz', completed: false },
              ]
            }
          ]
        },
        {
          id: '2',
          subject: 'IPA',
          title: 'Struktur Atom',
          description: 'Memahami struktur dasar atom dan partikel penyusunnya',
          progress: 30,
          topics: [
            {
              id: '2-1',
              title: 'Partikel Dasar Atom',
              completed: false,
              lessons: [
                { id: '2-1-1', title: 'Proton, Neutron, Elektron', type: 'theory', completed: false },
                { id: '2-1-2', title: 'Latihan Identifikasi', type: 'exercise', completed: false },
              ]
            }
          ]
        }
      ];
      
      setModules(mockModules);
      setLoading(false);
    } catch (error) {
      console.error('Error loading learning modules:', error);
      setLoading(false);
    }
  };

  const handleModuleSelect = (module: LearningModule) => {
    setSelectedModule(module);
    setSelectedTopic(null);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView(lesson.type === 'quiz' ? 'quiz' : 'lesson');
  };

  const handleStartAIQuiz = () => {
    if (selectedTopic) {
      setCurrentView('ai-quiz');
    }
  };

  const handleStartFlashCards = () => {
    if (selectedTopic) {
      setCurrentView('flashcards');
    }
  };

  const handleQuizComplete = () => {
    setCurrentView('topics');
    setSelectedLesson(null);
    // Mark quiz as completed
    if (selectedLesson && selectedModule) {
      const updatedTopics = selectedModule.topics.map(topic => ({
        ...topic,
        lessons: topic.lessons.map(l => 
          l.id === selectedLesson.id ? { ...l, completed: true } : l
        )
      }));
      setSelectedModule({ ...selectedModule, topics: updatedTopics });
    }
  };

  const renderLessonContent = () => {
    if (!selectedLesson || !selectedModule) return null;

    if (selectedLesson.type === 'theory') {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setCurrentView('topics')}>
              ← Kembali
            </Button>
            <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Konten Teori</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                  <p className="text-blue-700 dark:text-blue-300">
                    🤖 AI Assistant akan membantu Anda memahami materi ini.
                    Tanyakan apa saja tentang konsep yang sulit dipahami.
                  </p>
                </div>

                {/* Mock theory content */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Definisi</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Materi pembelajaran sedang dalam proses pengembangan.
                      Sistem AI akan membantu menjelaskan konsep secara interaktif.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Contoh</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="dark:text-gray-300">Contoh akan ditampilkan dengan bantuan AI...</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Diskusi dengan AI</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <p className="text-green-700 dark:text-green-300">
                        💭 Tanyakan pada AI tentang: "Jelaskan lebih detail", "Beri contoh lain",
                        "Mengapa ini penting?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentView('topics')}>
                  Kembali ke Topik
                </Button>
                <Button onClick={() => {
                  // Mark lesson as completed
                  if (selectedLesson && selectedModule) {
                    const updatedTopics = selectedModule.topics.map(topic => ({
                      ...topic,
                      lessons: topic.lessons.map(l =>
                        l.id === selectedLesson.id ? { ...l, completed: true } : l
                      )
                    }));
                    setSelectedModule({ ...selectedModule, topics: updatedTopics });
                    setCurrentView('topics');
                  }
                }}>
                  Tandai Selesai
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (selectedLesson.type === 'exercise') {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setCurrentView('topics')}>
              ← Kembali
            </Button>
            <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">🎯 Mode Latihan</h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Kerjakan soal-soal berikut dengan bantuan AI. AI akan memberikan petunjuk
                    jika Anda mengalami kesulitan.
                  </p>
                </div>

                {/* Mock exercise content */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Soal 1</h4>
                    <p className="mb-3 dark:text-gray-300">Hitung nilai dari: 2x + 5 = 13</p>
                    <div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-600 rounded mb-3">
                      <input
                        type="text"
                        placeholder="Jawaban Anda..."
                        className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">💬 Petunjuk AI</Button>
                      <Button size="sm">Periksa Jawaban</Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Bantuan AI</h4>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                      Ketik "bantuan" jika kesulitan, dan AI akan memberikan petunjuk langkah demi langkah.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentView('topics')}>
                  Kembali ke Topik
                </Button>
                <Button onClick={() => {
                  if (selectedLesson && selectedModule) {
                    const updatedTopics = selectedModule.topics.map(topic => ({
                      ...topic,
                      lessons: topic.lessons.map(l =>
                        l.id === selectedLesson.id ? { ...l, completed: true } : l
                      )
                    }));
                    setSelectedModule({ ...selectedModule, topics: updatedTopics });
                    setCurrentView('topics');
                  }
                }}>
                  Selesai
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Memuat modul pembelajaran...</div>;
  }

  if (currentView === 'quiz' && selectedLesson) {
    return (
      <InteractiveQuiz
        quizId={selectedLesson.id}
        onBack={handleQuizComplete}
      />
    );
  }

  if (currentView === 'ai-quiz' && selectedModule) {
    return (
      <AIQuizGenerator
        topic={selectedTopic?.title || ''}
        subject={selectedModule.subject}
        onClose={() => setCurrentView('topics')}
      />
    );
  }

  if (currentView === 'flashcards' && selectedModule) {
    return (
      <FlashCardDeck
        topic={selectedTopic?.title || ''}
        subject={selectedModule.subject}
        onClose={() => setCurrentView('topics')}
      />
    );
  }

  if (currentView === 'lesson') {
    return renderLessonContent();
  }

  if (!selectedModule) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Modul Pembelajaran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => (
            <Card key={module.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{module.subject}</CardTitle>
                  <Badge variant="outline">{Math.round(module.progress)}%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                <Progress value={module.progress} className="mb-4" />
                <Button 
                  onClick={() => {
                    handleModuleSelect(module);
                    setCurrentView('topics');
                  }}
                  className="w-full"
                >
                  Mulai Belajar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => {
          setSelectedModule(null);
          setCurrentView('modules');
        }}>
          ← Kembali ke Modul
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{selectedModule.subject}</h2>
          <p className="text-gray-600">{selectedModule.title}</p>
        </div>
        <Badge variant="outline">{Math.round(selectedModule.progress)}% Selesai</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Topik Pembelajaran</h3>
          <div className="space-y-3">
            {selectedModule.topics.map(topic => (
              <Card 
                key={topic.id} 
                className={`cursor-pointer transition-all ${
                  selectedTopic?.id === topic.id ? 'ring-2 ring-blue-500' : ''
                } ${topic.completed ? 'bg-green-50' : ''}`}
                onClick={() => handleTopicSelect(topic)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{topic.title}</h4>
                    {topic.completed ? (
                      <Badge variant="default" className="bg-green-500">Selesai</Badge>
                    ) : (
                      <Badge variant="outline">{topic.lessons.filter(l => l.completed).length}/{topic.lessons.length}</Badge>
                    )}
                  </div>
                  <Progress 
                    value={(topic.lessons.filter(l => l.completed).length / topic.lessons.length) * 100} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          {selectedTopic ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Pelajaran: {selectedTopic.title}
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleStartFlashCards}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    📚 Flash Cards AI
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleStartAIQuiz}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    🎯 Kuis AI
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {selectedTopic.lessons.map(lesson => (
                  <Card
                    key={lesson.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      lesson.completed ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium dark:text-gray-200">{lesson.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={
                              lesson.type === 'theory' ? 'secondary' :
                              lesson.type === 'exercise' ? 'outline' : 'default'
                            }>
                              {lesson.type === 'theory' ? 'Teori' :
                               lesson.type === 'exercise' ? 'Latihan' : 'Kuis'}
                            </Badge>
                            {lesson.completed && (
                              <Badge variant="default" className="bg-green-500 text-xs">
                                ✓ Selesai
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          {lesson.completed ? 'Ulangi' : 'Mulai'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12 dark:text-gray-400">
              Pilih topik untuk melihat pelajaran
            </div>
          )}
        </div>
      </div>
    </div>
  );
}