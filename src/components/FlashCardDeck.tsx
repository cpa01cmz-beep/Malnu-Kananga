import React, { useState, useEffect } from 'react';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface FlashCardDeckProps {
  topic?: string;
  subject?: string;
  onClose?: () => void;
}

export default function FlashCardDeck({ topic, subject, onClose }: FlashCardDeckProps) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashCards();
  }, [topic, subject]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFlashCards = async () => {
    setLoading(true);
    try {
      if (topic && subject) {
        const generatedCards = await generateFlashCards(topic, subject);
        setCards(generatedCards);
      } else {
        const mockCards: FlashCard[] = [
          {
            id: '1',
            front: 'Apa rumus luas segitiga?',
            back: 'Luas = ½ × alas × tinggi',
            category: 'Geometri',
            difficulty: 'easy'
          },
          {
            id: '2',
            front: 'Jelaskan konsep variabel dalam aljabar',
            back: 'Variabel adalah simbol (biasanya huruf) yang mewakili nilai yang belum diketahui atau dapat berubah',
            category: 'Aljabar',
            difficulty: 'medium'
          }
        ];
        setCards(mockCards);
      }
    } catch (error) {
      console.error('Error loading flash cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashCards = async (topic: string, subject: string): Promise<FlashCard[]> => {
    const { generateFlashCardsAI } = await import('../services/geminiService');
    return generateFlashCardsAI(topic, subject);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Memuat Flash Cards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>Tidak ada flash card tersedia</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tutup
          </button>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Flash Cards</h2>
          <p className="text-sm text-gray-600">
            {subject} - {topic}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Tutup
          </button>
        )}
      </div>

      <div className="relative">
        <div
          className={`relative w-full h-80 cursor-pointer transition-all duration-500 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
          style={{ perspective: '1000px' }}
        >
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={`absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col justify-center items-center ${
              isFlipped ? 'backface-hidden rotate-y-180' : ''
            }`}>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full mb-4">
                {currentCard.category}
              </span>
              <p className="text-xl text-center font-semibold">{currentCard.front}</p>
              <span className="text-xs text-gray-500 mt-4">Klik untuk melihat jawaban</span>
            </div>
            <div className={`absolute inset-0 w-full h-full bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-lg border-2 border-green-200 dark:border-green-700 p-8 flex flex-col justify-center items-center ${
              isFlipped ? 'backface-hidden rotate-y-180' : ''
            }`}>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full mb-4">
                Jawaban
              </span>
              <p className="text-xl text-center">{currentCard.back}</p>
              <span className={`text-xs mt-4 px-2 py-1 rounded-full ${
                currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentCard.difficulty === 'easy' ? 'Mudah' :
                 currentCard.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Sebelumnya
        </button>
        <span className="text-sm text-gray-600">
          {currentIndex + 1} / {cards.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Selanjutnya →
        </button>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={handleShuffle}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Acak Kartu
        </button>
      </div>
    </div>
  );
}
