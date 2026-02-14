import { useState, useMemo } from 'react';
import { useStudentGoals, type StudentGoal } from '../../hooks/useStudentGoals';
import { studentBadgeService, type StudentBadge } from '../../services/studentBadgeService';
import Card from './Card';
import Button from './Button';
import ProgressBar from './ProgressBar';
import PageHeader from './PageHeader';

interface StudentProgressDashboardProps {
  studentId: string;
}

export function StudentProgressDashboard({ studentId }: StudentProgressDashboardProps) {
  const {
    loading: goalsLoading,
    addGoal,
    deleteGoal,
    getActiveGoals,
    getCompletedGoals,
  } = useStudentGoals(studentId);

  const [unlockedBadges] = useState<StudentBadge[]>(() =>
    studentBadgeService.getUnlockedBadges(studentId)
  );
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    type: 'grade' | 'attendance' | 'assignment' | 'quiz';
    title: string;
    description: string;
    targetValue: number;
    subjectName: string;
    targetDate: string;
  }>({
    type: 'grade',
    title: '',
    description: '',
    targetValue: 0,
    subjectName: '',
    targetDate: '',
  });

  const allBadges = studentBadgeService.getAllBadges();
  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();

  const stats = useMemo(() => ({
    gradeAverage: 85,
    attendanceRate: 92,
    assignmentsCompleted: 12,
    quizzesPassed: 8,
    streakDays: 5,
    hasPerfectScore: false,
  }), []);

  const badgeProgress = useMemo(() => {
    return allBadges.map(badge => ({
      badge,
      progress: studentBadgeService.calculateProgress(badge, stats),
      isUnlocked: unlockedBadges.some(b => b.id === badge.id),
    }));
  }, [allBadges, stats, unlockedBadges]);

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetDate) return;
    
    await addGoal({
      type: newGoal.type,
      title: newGoal.title,
      description: newGoal.description,
      targetValue: newGoal.targetValue,
      subjectName: newGoal.subjectName || undefined,
      startDate: new Date().toISOString(),
      targetDate: newGoal.targetDate,
    });
    
    setNewGoal({
      type: 'grade',
      title: '',
      description: '',
      targetValue: 0,
      subjectName: '',
      targetDate: '',
    });
    setShowAddGoal(false);
  };

  const getGoalProgress = (goal: StudentGoal) => {
    if (goal.targetValue === 0) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  if (goalsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Progres Belajar Saya" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{activeGoals.length}</p>
            <p className="text-sm text-gray-600">Tujuan Aktif</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{completedGoals.length}</p>
            <p className="text-sm text-gray-600">Tujuan Selesai</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{unlockedBadges.length}</p>
            <p className="text-sm text-gray-600">Lencana Diraih</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tujuan Belajar</h3>
          <Button size="sm" onClick={() => setShowAddGoal(!showAddGoal)}>
            {showAddGoal ? 'Batal' : 'Tambah Tujuan'}
          </Button>
        </div>

        {showAddGoal && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Tujuan</label>
              <select
                value={newGoal.type}
                onChange={e => setNewGoal(prev => ({ ...prev, type: e.target.value as StudentGoal['type'] }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="grade">Nilai</option>
                <option value="attendance">Kehadiran</option>
                <option value="assignment">Tugas</option>
                <option value="quiz">Kuis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Contoh: Nilai Matematika minimal 85"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Nilai</label>
              <input
                type="number"
                value={newGoal.targetValue}
                onChange={e => setNewGoal(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Tanggal</label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={e => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <Button onClick={handleAddGoal} className="w-full">
              Simpan Tujuan
            </Button>
          </div>
        )}

        {activeGoals.length === 0 && completedGoals.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Belum ada tujuan belajar. Tambahkan tujuan untuk mulai melacak progres Anda.
          </p>
        ) : (
          <div className="space-y-4">
            {activeGoals.map(goal => (
              <div key={goal.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{goal.title}</h4>
                    {goal.subjectName && (
                      <p className="text-sm text-gray-500">{goal.subjectName}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Hapus tujuan ${goal.title}`}
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Hapus
                  </button>
                </div>
                <ProgressBar
                  value={getGoalProgress(goal)}
                  max={100}
                  color={goal.status === 'completed' ? 'success' : 'primary'}
                  showLabel
                  label={`${goal.currentValue} / ${goal.targetValue}`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Target: {new Date(goal.targetDate).toLocaleDateString('id-ID')}
                </p>
              </div>
            ))}

            {completedGoals.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-600 mb-2">Tujuan Selesai</h4>
                <div className="space-y-2">
                  {completedGoals.map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">{goal.title}</p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Tercapai: {goal.currentValue} / {goal.targetValue}
                        </p>
                      </div>
                      <span className="text-green-600">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lencana & Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badgeProgress.map(({ badge, progress, isUnlocked }) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg text-center ${
                isUnlocked
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400'
                  : 'bg-gray-50 dark:bg-gray-800 opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <h4 className="font-medium text-sm">{badge.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
              {!isUnlocked && (
                <ProgressBar
                  value={progress}
                  max={100}
                  color="primary"
                  size="sm"
                  showLabel
                  label={`${progress}%`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default StudentProgressDashboard;
