
import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { analyzeClassPerformance } from '../services/geminiService';
import { studentsAPI, gradesAPI } from '../services/apiService';
import { LightBulbIcon } from './icons/LightBulbIcon';
import MarkdownRenderer from './MarkdownRenderer';
import { logger } from '../utils/logger';
import { 
  validateGradeInput, 
  sanitizeGradeInput, 
  calculateGradeLetter, 
  calculateFinalGrade,
  GradeInput 
} from '../utils/teacherValidation';
import ConfirmationDialog from './ui/ConfirmationDialog';
import { createToastHandler } from '../utils/teacherErrorHandler';


interface StudentGrade {
  id: string;
  name: string;
  nis: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

interface GradingManagementProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const GradingManagement: React.FC<GradingManagementProps> = ({ onBack, onShowToast }) => {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Enhanced Grading State
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
// Configuration
  const className = 'XII IPA 1';
  const subjectId = 'Matematika Wajib';

  // Validation and Error Handling State
  const [isSaving, _setIsSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  // Confirmation Dialog State
  const [_showResetConfirm, _setShowResetConfirm] = useState(false);
  const [_resetStudentId, _setResetStudentId] = useState<string | null>(null);
  const [_showSaveConfirm, setShowSaveConfirm] = useState(false);

  const toast = createToastHandler(onShowToast);
  const fetchStudentsAndGrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch students for the class
      const studentsResponse = await studentsAPI.getByClass(className);
      if (!studentsResponse.success || !studentsResponse.data) {
        throw new Error(studentsResponse.message || 'Failed to fetch students');
      }
      
      // Fetch existing grades for the class/subject
      const gradesResponse = await gradesAPI.getByClass(className);
      const existingGrades = gradesResponse.success && gradesResponse.data ? gradesResponse.data : [];
      
      // Transform students to StudentGrade format
      const studentGrades: StudentGrade[] = studentsResponse.data.map(student => {
        const existingGrade = existingGrades.find(grade => grade.studentId === student.id);
        return {
          id: student.id,
          name: student.className || `Student ${student.nis}`,
          nis: student.nis,
          assignment: existingGrade?.assignment || 0,
          midExam: existingGrade?.midExam || 0,
          finalExam: existingGrade?.finalExam || 0,
        };
      });
      
      setGrades(studentGrades);
    } catch {
      setError('Failed to load data');
      onShowToast('Gagal memuat data siswa', 'error');
    } finally {
      setLoading(false);
    }
  }, [className, onShowToast]);

  useEffect(() => {
    fetchStudentsAndGrades();
  }, [fetchStudentsAndGrades]);

  const filteredData = grades.filter(g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nis.includes(searchTerm)
  );

  const handleInputChange = (id: string, field: keyof StudentGrade, value: string) => {
      const numValue = sanitizeGradeInput(value);
      const gradeInput: GradeInput = { [field]: numValue };
      const validation = validateGradeInput(gradeInput);
      
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }
      
      if (validation.warnings.length > 0) {
        console.warn('Validation warnings:', validation.warnings);
      }
      
      setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: numValue } : g));

      // Auto-save functionality with debouncing
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const newTimeout = setTimeout(() => {
        handleAutoSave();
      }, 2000); // 2 second debounce

      setAutoSaveTimeout(newTimeout);
  };
  
  const handleAutoSave = async () => {
    setIsAutoSaving(true);
    try {
      const savePromises = grades.map(grade =>
        gradesAPI.update(grade.id, {
          studentId: grade.id,
          classId: className,
          subjectId: subjectId,
          assignment: grade.assignment,
          midExam: grade.midExam,
          finalExam: grade.finalExam,
        })
      );

      await Promise.all(savePromises);
      logger.info('Auto-save completed successfully');
      onShowToast('Nilai otomatis disimpan', 'success');
    } catch (error) {
      logger.error('Auto-save failed:', error);
      onShowToast('Gagal menyimpan nilai otomatis', 'error');
    } finally {
      setIsAutoSaving(false);
    }
  };
  
  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedStudents(new Set());
  };
  
  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };
  
  const handleBatchGradeInput = (field: keyof StudentGrade, value: string) => {
    const numValue = sanitizeGradeInput(value);
    const gradeInput: GradeInput = { [field]: numValue };
    const validation = validateGradeInput(gradeInput);
    
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setGrades(prev => prev.map(g =>
      selectedStudents.has(g.id) ? { ...g, [field]: numValue } : g
    ));
  };
  
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const csvData = results.data as Record<string, string>[];
          const updatedGrades = grades.map(grade => {
            const csvRow = csvData.find(row =>
              row.nis === grade.nis ||
              row.name?.toLowerCase() === grade.name.toLowerCase()
            );

            if (csvRow) {
              const assignment = sanitizeGradeInput(csvRow.assignment || csvRow.tugas || grade.assignment);
              const midExam = sanitizeGradeInput(csvRow.midExam || csvRow.uts || grade.midExam);
              const finalExam = sanitizeGradeInput(csvRow.finalExam || csvRow.uas || grade.finalExam);

              const assignmentValidation = validateGradeInput({ assignment });
              const midExamValidation = validateGradeInput({ midExam });
              const finalExamValidation = validateGradeInput({ finalExam });

              if (!assignmentValidation.isValid || !midExamValidation.isValid || !finalExamValidation.isValid) {
                onShowToast(`Invalid grades for ${grade.name}: ${assignmentValidation.errors.concat(midExamValidation.errors, finalExamValidation.errors).join(', ')}`, 'error');
                return grade;
              }

              return {
                ...grade,
                assignment,
                midExam,
                finalExam
              };
            }
            return grade;
          });

          setGrades(updatedGrades);
          setIsBatchMode(false);
          onShowToast('CSV import berhasil! Nilai diperbarui.', 'success');
        } catch (err) {
          logger.error('CSV import error:', err);
          onShowToast('Gagal impor CSV. Mohon periksa format file.', 'error');
        }
      },
      error: (err) => {
        logger.error('CSV parsing error:', err);
        onShowToast('Gagal parsing CSV. Mohon periksa format file.', 'error');
      }
    });

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };
  
  const handleCSVExport = () => {
    const csvData = grades.map(g => ({
      name: g.name,
      nis: g.nis,
      assignment: g.assignment,
      midExam: g.midExam,
      finalExam: g.finalExam,
      finalScore: calculateFinalGrade(g.assignment, g.midExam, g.finalExam).toFixed(1),
      grade: calculateGradeLetter(calculateFinalGrade(g.assignment, g.midExam, g.finalExam))
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `grades_${className}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onShowToast('Grades exported to CSV successfully', 'success');
  };
  
  const calculateGradeStatistics = () => {
    if (grades.length === 0) return null;

    const finalScores = grades.map(g => calculateFinalGrade(g.assignment, g.midExam, g.finalExam));
    const average = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
    const maxScore = Math.max(...finalScores);
    const minScore = Math.min(...finalScores);

    const gradeDistribution = {
      A: finalScores.filter(score => score >= 85).length,
      B: finalScores.filter(score => score >= 75 && score < 85).length,
      C: finalScores.filter(score => score >= 60 && score < 75).length,
      D: finalScores.filter(score => score < 60).length
    };

    return { average, maxScore, minScore, gradeDistribution };
  };

  const handleSave = async () => {
    // Validate all grades before saving
    let hasErrors = false;
    
    grades.forEach(grade => {
      const validation = validateGradeInput({
        assignment: grade.assignment,
        midExam: grade.midExam,
        finalExam: grade.finalExam
      });
      
      if (!validation.isValid) {
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      toast.error('Perbaiki kesalahan validasi sebelum menyimpan');
      return;
    }
    
    // Show confirmation for batch save
    setShowSaveConfirm(true);
  };
  
  const doBatchSave = async () => {
    try {
      setLoading(true);

      const savePromises = grades.map(grade =>
        gradesAPI.update(grade.id, {
          studentId: grade.id,
          classId: className,
          subjectId: subjectId,
          assignment: grade.assignment,
          midExam: grade.midExam,
          finalExam: grade.finalExam,
        })
      );

      await Promise.all(savePromises);
      setIsEditing(null);
      toast.success('Nilai berhasil disimpan ke database.');
    } catch (error) {
      logger.error('Error saving grades:', error);
      toast.error('Gagal menyimpan nilai');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      // Prepare data for AI (add final score context)
      const dataForAI = grades.map(g => ({
          studentName: g.name,
          subject: 'Matematika Wajib',
          grade: calculateGradeLetter(calculateFinalGrade(g.assignment, g.midExam, g.finalExam)),
          semester: 'Semester 1'
      }));

      const result = await analyzeClassPerformance(dataForAI);
      setAnalysisResult(result);
      setIsAnalyzing(false);
  };

  return (
    <div className="animate-fade-in-up">
        {/* Header with Enhanced Controls */}
        <div className="flex flex-col gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Dashboard
                </button>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Input Nilai Siswa</h2>
                 <p className="text-gray-500 dark:text-gray-400">Mata Pelajaran: <strong>{subjectId} ({className})</strong></p>
            </div>
            
            {/* Enhanced Toolbar */}
            <div className="flex flex-col md:flex-row gap-3">
                {/* Left Controls */}
                <div className="flex gap-2 flex-wrap">
                    <button 
                        onClick={toggleBatchMode}
                        className={`px-4 py-2 rounded-full transition-colors shadow-md ${
                            isBatchMode 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {isBatchMode ? `Selected: ${selectedStudents.size}` : 'Batch Mode'}
                    </button>
                    
                    <button 
                        onClick={() => setShowStats(!showStats)}
                        className={`px-4 py-2 rounded-full transition-colors shadow-md ${
                            showStats 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Statistics
                    </button>
                    
                    <label className="px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors shadow-md cursor-pointer">
                        Import CSV
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleCSVImport}
                            className="hidden"
                        />
                    </label>
                    
                    <button 
                        onClick={handleCSVExport}
                        className="px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-md"
                    >
                        Export CSV
                    </button>
                    
                    <button 
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-md disabled:bg-gray-400"
                    >
                        <LightBulbIcon className="w-5 h-5" />
                        {isAnalyzing ? "Menganalisis..." : "Analisis AI"}
                    </button>
                </div>
                
                {/* Search */}
                <input 
                    type="text" 
                    placeholder="Cari Nama / NIS..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                
                {/* Auto-save indicator */}
                {isAutoSaving && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Auto-saving...
                    </div>
                )}
            </div>
        </div>
        
        {/* Grade Statistics Panel */}
        {showStats && !loading && !error && (() => {
            const stats = calculateGradeStatistics();
            if (!stats) return null;
            
            return (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6 animate-scale-in">
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4">Grade Distribution Statistics</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.average.toFixed(1)}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Class Average</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.maxScore}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Highest Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.minScore}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Lowest Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredData.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
                        </div>
                    </div>
                    
                    {/* Grade Distribution Bars */}
                    <div className="space-y-2">
                        {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                            const percentage = (count / filteredData.length) * 100;
                            const colors = {
                                A: 'bg-green-500',
                                B: 'bg-blue-500',
                                C: 'bg-yellow-500',
                                D: 'bg-red-500'
                            };
                            
                            return (
                                <div key={grade} className="flex items-center gap-3">
                                    <div className="w-8 text-center font-bold text-gray-700 dark:text-gray-300">{grade}</div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                        <div 
                                            className={`${colors[grade as keyof typeof colors]} h-full rounded-full transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-100">
                                            {count} students ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })()}
        
        {/* Batch Operation Controls */}
        {isBatchMode && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6 flex gap-3 flex-wrap items-center">
                <span className="font-medium text-yellow-800 dark:text-yellow-300">
                    Batch Operations ({selectedStudents.size} selected):
                </span>
                
                <input 
                    type="number" 
                    placeholder="Assignment" 
                    min="0" 
                    max="100"
                    onChange={(e) => handleBatchGradeInput('assignment', e.target.value)}
                    className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
                
                <input 
                    type="number" 
                    placeholder="UTS" 
                    min="0" 
                    max="100"
                    onChange={(e) => handleBatchGradeInput('midExam', e.target.value)}
                    className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
                
                <input 
                    type="number" 
                    placeholder="UAS" 
                    min="0" 
                    max="100"
                    onChange={(e) => handleBatchGradeInput('finalExam', e.target.value)}
                    className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
                
                <button 
                    className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm"
                    onClick={() => setSelectedStudents(new Set(grades.map(g => g.id)))}
                >
                    Select All
                </button>
                
                <button 
                    className="px-3 py-1 bg-gray-600 text-white rounded-full hover:bg-gray-700 text-sm"
                    onClick={() => setSelectedStudents(new Set())}
                >
                    Clear Selection
                </button>
            </div>
        )}

        {/* AI Analysis Result Area */}
        {analysisResult && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 mb-6 animate-scale-in">
                <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5" />
                    Hasil Analisis Pedagogis (Gemini 3 Pro)
                </h3>
                <div className="text-gray-700 dark:text-gray-300 text-sm">
                    <MarkdownRenderer content={analysisResult} />
                </div>
                <button 
                    onClick={() => setAnalysisResult(null)}
                    className="mt-4 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                    Tutup Analisis
                </button>
            </div>
        )}

        {/* Loading State */}
        {loading && (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data siswa...</span>
            </div>
        )}

        {/* Error State */}
        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Error:</strong> {error}
                </p>
                <button 
                    onClick={fetchStudentsAndGrades}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                    Coba Lagi
                </button>
            </div>
        )}

        {/* Info Banner */}
        {!loading && !error && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Info Pembobotan:</strong> Tugas (30%) + UTS (30%) + UAS (40%). Nilai Akhir dan Predikat dihitung otomatis.
                </p>
            </div>
        )}

        {/* Grading Table */}
        {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                        <tr>
                            {isBatchMode && (
                                <th className="px-4 py-4 text-center w-12">Select</th>
                            )}
                            <th className="px-6 py-4">Siswa</th>
                            <th className="px-4 py-4 text-center w-24">Tugas (30%)</th>
                            <th className="px-4 py-4 text-center w-24">UTS (30%)</th>
                            <th className="px-4 py-4 text-center w-24">UAS (40%)</th>
                            <th className="px-6 py-4 text-center">Nilai Akhir</th>
                            <th className="px-6 py-4 text-center">Predikat</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredData.map((student) => {
                            const finalScore = calculateFinalGrade(student.assignment, student.midExam, student.finalExam);
                            const gradeLetter = calculateGradeLetter(finalScore);
                            const isRowEditing = isEditing === student.id;
                            const isSelected = selectedStudents.has(student.id);

                            return (
                                <tr key={student.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}>
                                    {isBatchMode && (
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleStudentSelection(student.id)}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                        <div className="text-xs text-gray-500">NIS: {student.nis}</div>
                                    </td>

                                    {/* Enhanced Input Columns - Always enabled */}
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="number"
                                            value={student.assignment}
                                            onChange={(e) => handleInputChange(student.id, 'assignment', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-16 text-center p-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="number"
                                            value={student.midExam}
                                            onChange={(e) => handleInputChange(student.id, 'midExam', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-16 text-center p-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="number"
                                            value={student.finalExam}
                                            onChange={(e) => handleInputChange(student.id, 'finalExam', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-16 text-center p-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>

                                    {/* Calculated Columns */}
                                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                                        <div className="flex flex-col">
                                            <span>{finalScore.toFixed(1)}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {calculateFinalGrade(student.assignment, student.midExam, student.finalExam).toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                            gradeLetter === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                            gradeLetter === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                            gradeLetter === 'C' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                        }`}>
                                            {gradeLetter}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {isRowEditing ? (
                                                <button
                                                    onClick={doBatchSave}
                                                    className="text-xs font-medium bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors"
                                                >
                                                    Simpan
                                                </button>
                                            ) : null}
                                            <button
                                                onClick={() => {
                                                    if (confirm('Reset nilai siswa ini ke 0?')) {
                                                        setGrades(prev => prev.map(g => g.id === student.id ? {
                                                            ...g,
                                                            assignment: 0,
                                                            midExam: 0,
                                                            finalExam: 0
                                                        } : g));
                                                        toast.info('Nilai direset');
                                                    }
                                                }}
                                                className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        )}

        {/* Save Button */}
        {!loading && !error && (
<div className="flex justify-end mt-6">
            <button
                onClick={handleSave}
                disabled={loading || isSaving}
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading || isSaving ? "Menyimpan..." : "Simpan Semua Nilai"}
            </button>
        </div>
        )}

        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          isLoading={isSaving}
          confirmText="Ya, Simpan"
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
         />
    </div>
  );
};

export default GradingManagement;
