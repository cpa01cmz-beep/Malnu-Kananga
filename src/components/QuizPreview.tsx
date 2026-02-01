import React, { useState } from 'react';
import type { Quiz, QuizQuestion } from '../types';
import { QuizQuestionType, QuizDifficulty } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface QuizPreviewProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export function QuizPreview({ quiz, onSave, onCancel }: QuizPreviewProps) {
  const [editedQuiz, setEditedQuiz] = useState<Quiz>({ ...quiz });
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSave = () => {
    onSave(editedQuiz);
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestion(index);
  };

  const handleSaveQuestion = (index: number, updatedQuestion: QuizQuestion) => {
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[index] = updatedQuestion;
    setEditedQuiz(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = editedQuiz.questions.filter((_, i) => i !== index);
    const newTotalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);
    setEditedQuiz(prev => ({
      ...prev,
      questions: updatedQuestions,
      totalPoints: newTotalPoints,
    }));
  };

  const handleAddQuestion = (newQuestion: QuizQuestion) => {
    const updatedQuestions = [...editedQuiz.questions, newQuestion];
    const newTotalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);
    setEditedQuiz(prev => ({
      ...prev,
      questions: updatedQuestions,
      totalPoints: newTotalPoints,
    }));
    setShowAddModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pratinjau Kuis
            </h2>
            {editedQuiz.aiGenerated && (
              <Badge variant="success">AI Generated</Badge>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              Simpan Kuis
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Judul Kuis
              </label>
              <Input
                aria-label="Judul Kuis"
                value={editedQuiz.title}
                onChange={(e) => setEditedQuiz(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi
              </label>
              <Textarea
                aria-label="Deskripsi"
                value={editedQuiz.description}
                onChange={(e) => setEditedQuiz(prev => ({ ...prev, description: e.target.value }))}
                className="w-full"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durasi (menit)
                </label>
                <Input
                  aria-label="Durasi (menit)"
                  type="number"
                  min="5"
                  max="180"
                  value={editedQuiz.duration}
                  onChange={(e) => setEditedQuiz(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nilai Lulus
                </label>
                <Input
                  aria-label="Nilai Lulus"
                  type="number"
                  min="0"
                  max={editedQuiz.totalPoints}
                  value={editedQuiz.passingScore}
                  onChange={(e) => setEditedQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jumlah Pertanyaan
                </label>
                <Input
                  type="number"
                  value={editedQuiz.questions.length}
                  disabled
                  className="w-full bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Poin
                </label>
                <Input
                  type="number"
                  value={editedQuiz.totalPoints}
                  disabled
                  className="w-full bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pertanyaan ({editedQuiz.questions.length})
          </h3>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Tambah Pertanyaan
          </Button>
        </div>

        <div className="space-y-4">
          {editedQuiz.questions.map((question, index) => {
            const isEditing = editingQuestion === index;
            return (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                isEditing={isEditing}
                onEdit={() => handleEditQuestion(index)}
                onSave={(updated) => handleSaveQuestion(index, updated)}
                onDelete={() => handleDeleteQuestion(index)}
              />
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <AddQuestionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddQuestion}
        />
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (question: QuizQuestion) => void;
  onDelete: () => void;
}

function QuestionCard({ question, index, isEditing, onEdit, onSave, onDelete }: QuestionCardProps) {
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion>({ ...question });

  const handleSave = () => {
    onSave(editedQuestion);
  };

  const handleCancel = () => {
    setEditedQuestion({ ...question });
    onEdit();
  };

  if (isEditing) {
    return (
      <Card className="p-6 border-2 border-blue-500">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Simpan
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Batal
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pertanyaan
            </label>
            <Textarea
              value={editedQuestion.question}
              onChange={(e) => setEditedQuestion(prev => ({ ...prev, question: e.target.value }))}
              className="w-full"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jenis
              </label>
              <Select
                value={editedQuestion.type}
                onChange={(e) => setEditedQuestion(prev => ({ ...prev, type: e.target.value as QuizQuestionType }))}
                className="w-full"
              >
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="true_false">Benar/Salah</option>
                <option value="short_answer">Jawaban Singkat</option>
                <option value="essay">Esai</option>
                <option value="fill_blank">Isi Bagian Kosong</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kesulitan
              </label>
              <Select
                value={editedQuestion.difficulty}
                onChange={(e) => setEditedQuestion(prev => ({ ...prev, difficulty: e.target.value as QuizDifficulty }))}
                className="w-full"
              >
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sulit</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poin
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={editedQuestion.points}
                onChange={(e) => setEditedQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                className="w-full"
              />
            </div>
          </div>

          {editedQuestion.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilihan Jawaban
              </label>
              <div className="space-y-2">
                {editedQuestion.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex gap-2 items-center">
                    <span className="w-8 text-center font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(editedQuestion.options || [])];
                        newOptions[optIndex] = e.target.value;
                        setEditedQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="flex-1"
                    />
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={editedQuestion.correctAnswer === option}
                      onChange={() => setEditedQuestion(prev => ({ ...prev, correctAnswer: option }))}
                      className="h-4 w-4"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {editedQuestion.type === 'true_false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jawaban Benar
              </label>
              <Select
                value={editedQuestion.correctAnswer as string}
                onChange={(e) => setEditedQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                className="w-full"
              >
                <option value="Benar">Benar</option>
                <option value="Salah">Salah</option>
              </Select>
            </div>
          )}

          {editedQuestion.type === 'short_answer' || editedQuestion.type === 'essay' || editedQuestion.type === 'fill_blank' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jawaban Benar
              </label>
              <Textarea
                value={editedQuestion.correctAnswer as string}
                onChange={(e) => setEditedQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                className="w-full"
                rows={2}
                placeholder="Masukkan jawaban yang benar (untuk esai, berikan kriteria penilaian)"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Penjelasan (opsional)
            </label>
            <Textarea
              value={editedQuestion.explanation || ''}
              onChange={(e) => setEditedQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              className="w-full"
              rows={2}
              placeholder="Penjelasan untuk siswa setelah melihat jawaban"
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {question.question}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="info" size="sm">
                  {question.type.replace('_', ' ')}
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
                  {question.options.map((option, optIndex) => (
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
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <PencilIcon className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete}>
                <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface AddQuestionModalProps {
  onClose: () => void;
  onAdd: (question: QuizQuestion) => void;
}

function AddQuestionModal({ onClose, onAdd }: AddQuestionModalProps) {
  const [newQuestion, setNewQuestion] = useState<QuizQuestion>({
    id: `q_${Date.now()}`,
    question: '',
    type: QuizQuestionType.MULTIPLE_CHOICE,
    difficulty: QuizDifficulty.MEDIUM,
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
  });

  const handleAdd = () => {
    if (!newQuestion.question.trim()) return;
    onAdd(newQuestion);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Tambah Pertanyaan"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pertanyaan
          </label>
          <Textarea
            value={newQuestion.question}
            onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
            className="w-full"
            rows={2}
            placeholder="Masukkan pertanyaan..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jenis
            </label>
            <Select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as QuizQuestionType }))}
              className="w-full"
            >
              <option value="multiple_choice">Pilihan Ganda</option>
              <option value="true_false">Benar/Salah</option>
              <option value="short_answer">Jawaban Singkat</option>
              <option value="essay">Esai</option>
              <option value="fill_blank">Isi Bagian Kosong</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kesulitan
            </label>
            <Select
              value={newQuestion.difficulty}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value as QuizDifficulty }))}
              className="w-full"
            >
              <option value="easy">Mudah</option>
              <option value="medium">Sedang</option>
              <option value="hard">Sulit</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Poin
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
              className="w-full"
            />
          </div>
        </div>

        {newQuestion.type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilihan Jawaban
            </label>
            <div className="space-y-2">
              {newQuestion.options?.map((option, optIndex) => (
                <div key={optIndex} className="flex gap-2 items-center">
                  <span className="w-8 text-center font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(newQuestion.options || [])];
                      newOptions[optIndex] = e.target.value;
                      setNewQuestion(prev => ({ ...prev, options: newOptions }));
                    }}
                    className="flex-1"
                    placeholder={`Pilihan ${optIndex + 1}`}
                  />
                  <input
                    type="radio"
                    name={`correct-${newQuestion.id}`}
                    checked={newQuestion.correctAnswer === option}
                    onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: option }))}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {newQuestion.type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jawaban Benar
            </label>
            <Select
              value={newQuestion.correctAnswer as string}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
              className="w-full"
            >
              <option value="Benar">Benar</option>
              <option value="Salah">Salah</option>
            </Select>
          </div>
        )}

        {newQuestion.type === 'short_answer' || newQuestion.type === 'essay' || newQuestion.type === 'fill_blank' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jawaban Benar
            </label>
            <Textarea
              value={newQuestion.correctAnswer as string}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
              className="w-full"
              rows={2}
              placeholder="Masukkan jawaban yang benar"
            />
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Penjelasan (opsional)
          </label>
          <Textarea
            value={newQuestion.explanation || ''}
            onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
            className="w-full"
            rows={2}
            placeholder="Penjelasan untuk siswa"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button onClick={handleAdd} disabled={!newQuestion.question.trim()}>
          Tambah Pertanyaan
        </Button>
      </div>
    </Modal>
  );
}