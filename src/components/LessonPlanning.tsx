import { useState } from 'react';
import type { LessonPlanGenerationRequest } from '../types/lessonPlan.types';
import { useLessonPlanning } from '../hooks/useLessonPlanning';
import { pdfExportService } from '../services/pdfExportService';
import { logger } from '../utils/logger';
import { APP_CONFIG } from '../constants';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Label from './ui/Label';
import Select from './ui/Select';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';
import Badge from './ui/Badge';

interface LessonPlanningProps {
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const SUBJECTS = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPA (Ilmu Pengetahuan Alam)',
  'IPS (Ilmu Pengetahuan Sosial)',
  'Pendidikan Agama Islam',
  'Sejarah',
  'PKN',
  'Seni Budaya',
  'PJOK',
  'Fisika',
  'Biologi',
  'Kimia',
  'Ekonomi',
  'Geografi',
  'Sosiologi'
];

const GRADES = [
  'Kelas X',
  'Kelas XI',
  'Kelas XII'
];

const STUDENT_LEVELS = [
  { value: 'beginner', label: 'Pemula' },
  { value: 'intermediate', label: 'Menengah' },
  { value: 'advanced', label: 'Lanjut' }
];

const DURATIONS = [
  { value: 30, label: '30 menit' },
  { value: 45, label: '45 menit' },
  { value: 60, label: '1 jam' },
  { value: 90, label: '1.5 jam' },
  { value: 120, label: '2 jam' }
];

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  introduction: 'Pendahuluan',
  main: 'Materi Utama',
  'group-work': 'Kerja Kelompok',
  discussion: 'Diskusi',
  individual: 'Individu',
  conclusion: 'Penutup'
};

const LessonPlanning: React.FC<LessonPlanningProps> = ({ onShowToast }) => {
  const [formData, setFormData] = useState<LessonPlanGenerationRequest>({
    subject: '',
    grade: '',
    topic: '',
    duration: 90,
    learningObjectives: [],
    studentLevel: 'intermediate',
    specialRequirements: [],
    includeMaterials: true,
    includeHomework: true
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [objectiveInput, setObjectiveInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const {
    lessonPlan,
    isGenerating,
    error,
    templates,
    generateLessonPlan: generateLessonPlanHook,
    saveLessonPlan,
    clearError
  } = useLessonPlanning();

  const handleGenerate = async (): Promise<void> => {
    if (!formData.subject || !formData.grade || !formData.topic) {
      onShowToast?.('Mohon lengkapi mata pelajaran, kelas, dan topik', 'error');
      return;
    }

    clearError();
    const response = await generateLessonPlanHook(formData);
    if (response.success) {
      setShowPreview(true);
      onShowToast?.('Rencana pembelajaran berhasil dibuat!', 'success');
    } else {
      onShowToast?.(response.error || 'Gagal membuat rencana pembelajaran', 'error');
    }
  };

  const handleAddObjective = (): void => {
    if (objectiveInput.trim()) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: [...(prev.learningObjectives || []), objectiveInput.trim()]
      }));
      setObjectiveInput('');
    }
  };

  const handleRemoveObjective = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: (prev.learningObjectives || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddRequirement = (): void => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specialRequirements: [...(prev.specialRequirements || []), requirementInput.trim()]
      }));
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      specialRequirements: (prev.specialRequirements || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = (): void => {
    if (lessonPlan) {
      try {
        saveLessonPlan(lessonPlan);
        onShowToast?.('Rencana pembelajaran berhasil disimpan!', 'success');
      } catch {
        onShowToast?.('Gagal menyimpan rencana pembelajaran', 'error');
      }
    }
  };

  const handleExportPDF = (): void => {
    if (!lessonPlan) return;

    try {
      const data = {
        title: `Rencana Pembelajaran: ${lessonPlan.title}`,
        headers: ['Komponen', 'Detail'],
        data: [
          ['Mata Pelajaran', lessonPlan.subject],
          ['Kelas', lessonPlan.grade],
          ['Topik', lessonPlan.topic],
          ['Durasi', `${lessonPlan.duration} menit`],
          ['Tujuan Pembelajaran', lessonPlan.objectives.join('; ')],
          ['Metode Penilaian', `${lessonPlan.assessment.type}: ${lessonPlan.assessment.method}`]
        ],
        summary: {
          'Total Aktivitas': lessonPlan.activities.length.toString(),
          'Total Durasi': `${lessonPlan.activities.reduce((sum, a) => sum + a.duration, 0)} menit`
        },
        schoolName: APP_CONFIG.SCHOOL_NAME
      };

      pdfExportService.createReport(data);
      onShowToast?.('Rencana pembelajaran berhasil diekspor ke PDF!', 'success');
      logger.info('Lesson plan exported to PDF', { id: lessonPlan.id });
    } catch (err) {
      logger.error('Error exporting lesson plan:', err);
      onShowToast?.('Gagal mengekspor rencana pembelajaran', 'error');
    }
  };

  const handleReset = (): void => {
    setFormData({
      subject: '',
      grade: '',
      topic: '',
      duration: 90,
      learningObjectives: [],
      studentLevel: 'intermediate',
      specialRequirements: [],
      includeMaterials: true,
      includeHomework: true
    });
    setSelectedTemplate('');
    setShowPreview(false);
    clearError();
  };

  const handleTemplateSelect = (templateId: string): void => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onShowToast?.(`Template "${template.name}" dipilih`, 'info');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {!showPreview ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                AI-Powered Lesson Planning
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Buat rencana pembelajaran yang komprehensif dengan bantuan AI
              </p>
            </div>

            {error && <ErrorMessage message={error} />}

            <Card className="mb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="subject">Mata Pelajaran *</Label>
                    <Select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      options={[
                        { value: '', label: 'Pilih Mata Pelajaran' },
                        ...SUBJECTS.map(s => ({ value: s, label: s }))
                      ]}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="grade">Kelas *</Label>
                    <Select
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                      options={[
                        { value: '', label: 'Pilih Kelas' },
                        ...GRADES.map(g => ({ value: g, label: g }))
                      ]}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="topic">Topik Pembelajaran *</Label>
                  <Input
                    id="topic"
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Contoh: Pecahan dan Desimal"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="duration">Durasi Pembelajaran</Label>
                    <Select
                      id="duration"
                      value={formData.duration.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      options={DURATIONS.map(d => ({ value: d.value.toString(), label: d.label }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="studentLevel">Tingkat Siswa</Label>
                    <Select
                      id="studentLevel"
                      value={formData.studentLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                      options={STUDENT_LEVELS}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="objectiveInput">Tujuan Pembelajaran</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="objectiveInput"
                      type="text"
                      value={objectiveInput}
                      onChange={(e) => setObjectiveInput(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddObjective(); } }}
                      placeholder="Contoh: Siswa dapat memahami konsep pecahan"
                      className="flex-1"
                    />
                    <Button onClick={handleAddObjective} disabled={!objectiveInput.trim()}>
                      Tambah
                    </Button>
                  </div>
                  {formData.learningObjectives && formData.learningObjectives.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.learningObjectives.map((obj, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="flex-1 text-sm">{obj}</span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveObjective(index)}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="requirementInput">Kebutuhan Khusus (Opsional)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="requirementInput"
                      type="text"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequirement(); } }}
                      placeholder="Contoh: Siswa dengan kebutuhan khusus, alat peraga khusus"
                      className="flex-1"
                    />
                    <Button onClick={handleAddRequirement} disabled={!requirementInput.trim()}>
                      Tambah
                    </Button>
                  </div>
                  {formData.specialRequirements && formData.specialRequirements.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formData.specialRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="flex-1 text-sm">{req}</span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveRequirement(index)}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeMaterials}
                      onChange={(e) => setFormData(prev => ({ ...prev, includeMaterials: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Sertakan daftar materi</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeHomework}
                      onChange={(e) => setFormData(prev => ({ ...prev, includeHomework: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Sertakan tugas rumah</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.subject || !formData.grade || !formData.topic}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sedang Membuat...
                      </>
                    ) : 'Buat Rencana Pembelajaran'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            {templates.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Template Rencana Pembelajaran
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {template.isDefault && (
                          <Badge variant="primary">Default</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            {lessonPlan && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {lessonPlan.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {lessonPlan.subject} • {lessonPlan.grade} • {lessonPlan.duration} menit
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPreview(false)}>
                      Kembali
                    </Button>
                    <Button onClick={handleSave}>
                      Simpan
                    </Button>
                    <Button onClick={handleExportPDF}>
                      Ekspor PDF
                    </Button>
                  </div>
                </div>

                <Card className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Tujuan Pembelajaran
                  </h2>
                  <ul className="space-y-2">
                    {lessonPlan.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-blue-500 font-bold">{index + 1}.</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {lessonPlan.materials && lessonPlan.materials.length > 0 && (
                  <Card className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Bahan dan Alat yang Dibutuhkan
                    </h2>
                    <ul className="space-y-2">
                      {lessonPlan.materials.map((material, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-blue-500">•</span>
                          <span>{material}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <Card className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Aktivitas Pembelajaran
                  </h2>
                  <div className="space-y-6">
                    {lessonPlan.activities.map((activity, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
                          <span className="text-sm text-gray-500">{activity.duration} menit</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {activity.name}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {activity.description}
                        </p>
                        {activity.materials && activity.materials.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Bahan: {activity.materials.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Penilaian
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Jenis: </span>
                      <span className="text-gray-900 dark:text-white">
                        {lessonPlan.assessment.type === 'formative' ? 'Formatif' : 'Sumatif'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Metode: </span>
                      <span className="text-gray-900 dark:text-white">
                        {lessonPlan.assessment.method}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Kriteria:</span>
                      <ul className="space-y-1">
                        {lessonPlan.assessment.criteria.map((criteria, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-blue-500">•</span>
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {lessonPlan.assessment.rubric && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Rubrik:</span>
                        <p className="text-gray-900 dark:text-white">{lessonPlan.assessment.rubric}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {lessonPlan.homework && (
                  <Card className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Tugas Rumah
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">{lessonPlan.homework}</p>
                  </Card>
                )}

                {lessonPlan.notes && (
                  <Card className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Catatan Tambahan
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">{lessonPlan.notes}</p>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LessonPlanning;
