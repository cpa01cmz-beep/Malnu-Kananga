import React, { useState, useEffect } from 'react';
import { CurriculumService, LearningMaterial, AssessmentTool, LearningPath } from '../services/curriculumService';
import { Student } from '../data/studentData';

interface LearningTabProps {
  student: Student;
}

const LearningTab: React.FC<LearningTabProps> = ({ student }) => {
  const [activeSection, setActiveSection] = useState<'materials' | 'assessments' | 'paths' | 'progress'>('materials');
  const [selectedSubject, setSelectedSubject] = useState<string>('SUBJ001');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [assessments, setAssessments] = useState<AssessmentTool[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);

  const curriculumService = CurriculumService.getInstance();

  useEffect(() => {
    loadLearningData();
  }, [selectedSubject, selectedSemester]);

  const loadLearningData = async () => {
    setLoading(true);
    try {
      const materials = curriculumService.getLearningMaterials(selectedSubject, selectedSemester);
      const assessments = curriculumService.getAssessments(selectedSubject, selectedSemester);
      const paths = curriculumService.getLearningPaths(selectedSubject);

      setLearningMaterials(materials);
      setAssessments(assessments);
      setLearningPaths(paths);
    } catch (error) {
      console.error('Failed to load learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'interactive': return '🎮';
      case 'quiz': return '📝';
      case 'assignment': return '📋';
      default: return '📚';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'document': return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'interactive': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'quiz': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'assignment': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const handleMaterialClick = (material: LearningMaterial) => {
    setSelectedMaterial(material);
    // Track material access
    const progress = curriculumService.getStudentProgress(student.id);
    if (progress) {
      // Update progress tracking
      console.log(`Material ${material.title} accessed by student ${student.id}`);
    }
  };

  const handleAssessmentStart = (assessment: AssessmentTool) => {
    // Navigate to assessment interface
    console.log(`Starting assessment: ${assessment.title}`);
    // This would integrate with assessment system
  };

  const handlePathStart = (path: LearningPath) => {
    // Enroll student in learning path
    console.log(`Starting learning path: ${path.name}`);
    // This would create personalized learning sequence
  };

  const subjects = [
    { id: 'SUBJ001', name: 'Matematika' },
    { id: 'SUBJ002', name: 'Fisika' },
    { id: 'SUBJ003', name: 'Kimia' },
    { id: 'SUBJ004', name: 'Biologi' },
    { id: 'SUBJ005', name: 'Bahasa Indonesia' },
    { id: 'SUBJ006', name: 'Bahasa Inggris' },
    { id: 'SUBJ007', name: 'Pendidikan Agama Islam' },
    { id: 'SUBJ008', name: 'Pendidikan Kewarganegaraan' }
  ];

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          📚 Portal Pembelajaran Digital
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Akses materi pembelajaran, latihan soal, dan tes evaluasi secara interaktif
        </p>

        {/* Subject and Semester Selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mata Pelajaran
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'materials', name: 'Materi Pembelajaran', icon: '📖' },
              { id: 'assessments', name: 'Tes & Evaluasi', icon: '📝' },
              { id: 'paths', name: 'Learning Path', icon: '🛤️' },
              { id: 'progress', name: 'Progress Belajar', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSection === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Learning Materials Section */}
      {activeSection === 'materials' && (
        <div className="space-y-6">
          {learningMaterials.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada materi pembelajaran untuk mata pelajaran ini
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningMaterials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleMaterialClick(material)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{getMaterialIcon(material.type)}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(material.difficulty)}`}>
                        {material.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {material.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(material.type)}`}>
                        {material.type}
                      </span>
                      {material.duration && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {material.duration} menit
                        </span>
                      )}
                    </div>
                    {material.isMandatory && (
                      <div className="mt-3">
                        <span className="text-xs text-red-600 font-medium">
                          ⚠️ Wajib dipelajari
                        </span>
                      </div>
                    )}
                    {material.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {material.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assessments Section */}
      {activeSection === 'assessments' && (
        <div className="space-y-6">
          {assessments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada tes untuk mata pelajaran ini
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {assessment.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assessment.isGraded 
                          ? 'text-red-600 bg-red-100 dark:bg-red-900' 
                          : 'text-blue-600 bg-blue-100 dark:bg-blue-900'
                      }`}>
                        {assessment.isGraded ? 'Dinilai' : 'Latihan'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {assessment.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Nilai maksimal:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{assessment.maxScore}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Nilai minimum:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{assessment.passingScore}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Waktu:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {assessment.timeLimit ? `${assessment.timeLimit} menit` : 'Tidak terbatas'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Percobaan:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{assessment.attempts}x</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssessmentStart(assessment)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mulai Tes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Learning Paths Section */}
      {activeSection === 'paths' && (
        <div className="space-y-6">
          {learningPaths.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada learning path untuk mata pelajaran ini
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <div key={path.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {path.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        path.targetAudience === 'remedial' 
                          ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
                          : path.targetAudience === 'enrichment'
                          ? 'text-purple-600 bg-purple-100 dark:bg-purple-900'
                          : 'text-green-600 bg-green-100 dark:bg-green-900'
                      }`}>
                        {path.targetAudience === 'remedial' ? 'Pemantulan' : 
                         path.targetAudience === 'enrichment' ? 'Pengayaan' : 'Reguler'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {path.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Durasi estimasi:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{path.estimatedDuration} jam</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Jumlah materi:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{path.materials.length}</span>
                      </div>
                    </div>
                    {path.isAdaptive && (
                      <div className="mb-4">
                        <span className="text-xs text-blue-600 font-medium">
                          🎯 Adaptive Learning Path
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handlePathStart(path)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mulai Learning Path
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Section */}
      {activeSection === 'progress' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Progress Pembelajaran Anda
            </h3>
            <div className="space-y-4">
              {subjects.map((subject) => {
                const progress = curriculumService.getStudentProgress(student.id);
                const curriculum = curriculumService.getCurriculumMap(subject.id, selectedSemester);
                const completionRate = curriculum ? 
                  (progress?.curriculumMaps[curriculum.id] ? 
                    Object.keys(progress.curriculumMaps[curriculum.id].masteryLevel || {}).length : 0) / 
                  (curriculum.objectives.length || 1) * 100 : 0;

                return (
                  <div key={subject.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{subject.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(completionRate)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Material Detail Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedMaterial.title}
                </h3>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedMaterial.content}
              </p>
              {selectedMaterial.url && (
                <div className="mb-4">
                  <a
                    href={selectedMaterial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Buka materi eksternal →
                  </a>
                </div>
              )}
              {selectedMaterial.resources && selectedMaterial.resources.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resources:</h4>
                  <div className="space-y-2">
                    {selectedMaterial.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {resource.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          ({resource.type})
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningTab;