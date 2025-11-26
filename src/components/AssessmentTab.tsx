import React, { useState, useEffect } from 'react';
import { CurriculumService, AssessmentTool } from '../services/curriculumService';
import { StudentRecord } from '../data/teacherData';

interface AssessmentTabProps {
  selectedClass: string;
  classStudents: StudentRecord[];
}

const AssessmentTab: React.FC<AssessmentTabProps> = ({ selectedClass, classStudents }) => {
  const [assessments, setAssessments] = useState<AssessmentTool[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentTool | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const curriculumService = CurriculumService.getInstance();

  useEffect(() => {
    loadAssessments();
  }, [selectedClass]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      // Get assessments for Mathematics (SUBJ001) as example
      const assessments = curriculumService.getAssessments('SUBJ001', 1);
      setAssessments(assessments);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSelect = (assessment: AssessmentTool) => {
    setSelectedAssessment(assessment);
    loadAssessmentResults(assessment.id);
  };

  const loadAssessmentResults = (assessmentId: string) => {
    // Load mock results for demonstration
    const mockResults: Record<string, any> = {};
    classStudents.forEach(student => {
      mockResults[student.id] = {
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        submittedAt: new Date().toISOString(),
        attempts: Math.floor(Math.random() * 3) + 1,
        timeSpent: Math.floor(Math.random() * 60) + 20 // 20-80 minutes
      };
    });
    setAssessmentResults(mockResults);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
    return 'text-red-600 bg-red-100 dark:bg-red-900';
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    return 'D';
  };

  const calculateClassStats = () => {
    if (!selectedAssessment || Object.keys(assessmentResults).length === 0) {
      return { average: 0, highest: 0, lowest: 0, passed: 0, total: 0 };
    }

    const scores = Object.values(assessmentResults).map(result => result.score);
    const passed = scores.filter(score => score >= selectedAssessment.passingScore).length;

    return {
      average: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passed,
      total: scores.length
    };
  };

  const stats = calculateClassStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📝 Manajemen Penilaian
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Buat, kelola, dan evaluasi tes pembelajaran siswa
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Buat Tes Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daftar Tes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAssessment?.id === assessment.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleAssessmentSelect(assessment)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {assessment.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assessment.isGraded 
                          ? 'text-red-600 bg-red-100 dark:bg-red-900' 
                          : 'text-blue-600 bg-blue-100 dark:bg-blue-900'
                      }`}>
                        {assessment.isGraded ? 'Dinilai' : 'Latihan'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {assessment.description}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Max: {assessment.maxScore}</span>
                      <span>Min: {assessment.passingScore}</span>
                      {assessment.timeLimit && <span>{assessment.timeLimit}m</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Details and Results */}
        <div className="lg:col-span-2">
          {selectedAssessment ? (
            <div className="space-y-6">
              {/* Assessment Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedAssessment.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedAssessment.description}
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.average}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tertinggi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Terendah</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.passed}/{stats.total}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lulus</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tipe:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAssessment.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Nilai maksimal:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAssessment.maxScore}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Nilai minimum:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAssessment.passingScore}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Waktu:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAssessment.timeLimit ? `${selectedAssessment.timeLimit} menit` : 'Tidak terbatas'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Percobaan:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAssessment.attempts}x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Results */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hasil Siswa
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {classStudents.map((student) => {
                      const result = assessmentResults[student.id];
                      if (!result) return null;

                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span>Waktu: {result.timeSpent} menit</span>
                              <span>Percobaan: {result.attempts}</span>
                              <span>{new Date(result.submittedAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getScoreColor(result.score)}`}>
                              {result.score} ({getGrade(result.score)})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Pilih tes untuk melihat detail dan hasil siswa
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Buat Tes Baru
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul Tes
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Masukkan judul tes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Jelaskan tujuan dan cakupan tes"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipe Tes
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Tugas</option>
                      <option value="exam">Ujian</option>
                      <option value="project">Proyek</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nilai Maksimal
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      defaultValue="100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Waktu (menit)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Kosongkan jika tidak terbatas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nilai Minimum
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      defaultValue="70"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isGraded"
                    className="mr-2"
                  />
                  <label htmlFor="isGraded" className="text-sm text-gray-700 dark:text-gray-300">
                    Termasuk dalam penilaian akhir
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Buat Tes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentTab;