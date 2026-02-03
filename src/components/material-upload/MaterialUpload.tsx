import React, { useState } from 'react';
import { MaterialFolder, ELibrary } from '../../types';
import { FileUploadResponse } from '../../services/apiService';
import { useMaterialData } from './useMaterialData';
import { MaterialForm } from './MaterialForm';
import { MaterialManagementView } from './MaterialManagementView';
import EnhancedMaterialSharing from '../EnhancedMaterialSharing';
import VersionControl from '../VersionControl';
import MaterialAnalytics from '../MaterialAnalytics';
import MaterialTemplatesLibrary from '../MaterialTemplatesLibrary';
import Button from '../ui/Button';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { OfflineIndicator } from '../OfflineIndicator';
import AccessDenied from '../AccessDenied';
import { useCanAccess } from '../../hooks/useCanAccess';

interface MaterialUploadProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type ViewType = 'upload' | 'templates' | 'management' | 'details';

const MaterialUpload: React.FC<MaterialUploadProps> = ({ onBack, onShowToast }) => {
  const { canAccess } = useCanAccess();

  const {
    materials,
    subjects,
    subjectsLoading,
    categoryValidation,
    fetchMaterials,
    createMaterial,
    deleteMaterial,
    setCategoryValidation,
    getFilteredMaterials,
    clearFilters,
    getActiveFilterCount,
  } = useMaterialData({ onShowToast });

  const [selectedView, setSelectedView] = useState<ViewType>('upload');
  const [selectedMaterial, setSelectedMaterial] = useState<ELibrary | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<MaterialFolder | undefined>(undefined);
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');

  const [filters, setFilters] = useState({
    searchQuery: '',
    filterCategory: 'all',
    filterFileType: 'all',
    filterShared: null as boolean | null,
  });

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
    onConfirm: () => {
      return;
    }
  });

  if (!canAccess('materials.create') && !canAccess('materials.view')) {
    return <AccessDenied />;
  }

  const handleFileUploaded = (fileResponse: FileUploadResponse) => {
    setUploadedFile(fileResponse);
    onShowToast('File berhasil diunggah', 'success');
  };

  const handleFileDeleted = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryValidationResult = categoryValidation;
    if (categoryValidationResult && !categoryValidationResult.valid) {
      onShowToast(categoryValidationResult.error || 'Kategori tidak valid', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Tambah Materi Baru',
      message: `Apakah Anda yakin ingin menambahkan materi "${newTitle}" ke kategori "${newCategory}"?`,
      type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSubmitting(true);
        await createMaterial({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          subjectId: newSubjectId,
          fileUrl: uploadedFile?.key,
          fileType: uploadedFile?.type,
          fileSize: uploadedFile?.size,
          folderId: selectedFolder?.id,
        });
        setSubmitting(false);
        setNewTitle('');
        setNewDescription('');
        setUploadedFile(null);
        setCategoryValidation(null);
      }
    });
  };

  const handleDelete = async (material: ELibrary) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Materi',
      message: `Apakah Anda yakin ingin menghapus materi "${material.title}"? Siswa tidak akan bisa mengakses materi ini lagi dan tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await deleteMaterial(material);
      }
    });
  };

  const handleMaterialSelect = (material: ELibrary) => {
    setSelectedMaterial(material);
    setSelectedView('details');
  };

  const categories = Array.from(new Set(materials.map(m => m.category)));

  const filteredMaterials = getFilteredMaterials(materials, {
    ...filters,
    selectedFolder,
  });

  return (
    <div className="animate-fade-in-up">
      <OfflineIndicator
        showSyncButton={true}
        showQueueCount={true}
        position="top-right"
      />
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            ← Kembali ke Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Manajemen Materi</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Kelola materi pembelajaran dengan folder, berbagi, dan kontrol versi.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setSelectedView('upload')}
            variant={selectedView === 'upload' ? 'blue-solid' : 'ghost'}
            size="sm"
          >
            Upload
          </Button>
          <Button
            onClick={() => setSelectedView('templates')}
            variant={selectedView === 'templates' ? 'blue-solid' : 'ghost'}
            size="sm"
          >
            Template
          </Button>
          <Button
            onClick={() => setSelectedView('management')}
            variant={selectedView === 'management' ? 'blue-solid' : 'ghost'}
            size="sm"
          >
            Kelola
          </Button>
        </div>
      </div>

      {selectedView === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            {materials.length > 0 && (
              <EnhancedMaterialSharing
                material={materials[0]}
                onShowToast={onShowToast}
                currentUserId="current_user"
                currentUserRole="teacher"
                currentUserName="Current User"
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Formulir Upload</h3>
              <MaterialForm
                newTitle={newTitle}
                newDescription={newDescription}
                newCategory={newCategory}
                _newSubjectId={newSubjectId}
                uploadedFile={uploadedFile}
                subjects={subjects}
                subjectsLoading={subjectsLoading}
                categoryValidation={categoryValidation}
                onTitleChange={setNewTitle}
                onDescriptionChange={setNewDescription}
                onCategoryChange={(category, subjectId) => {
                  setNewCategory(category);
                  setNewSubjectId(subjectId);
                }}
                onFileUploaded={handleFileUploaded}
                onFileDeleted={handleFileDeleted}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            {materials.length > 0 && (
              <>
                <VersionControl
                  material={materials[0]}
                  onShowToast={onShowToast}
                  onVersionUpdate={fetchMaterials}
                />
                <MaterialAnalytics
                  material={materials[0]}
                  onShowToast={onShowToast}
                />
              </>
            )}
          </div>
        </div>
      )}

      {selectedView === 'templates' && (
        <MaterialTemplatesLibrary
          onShowToast={onShowToast}
          onSelectTemplate={(template) => {
            setNewTitle(template.title);
            setNewDescription(template.description);
            setNewCategory(template.category);
            const subject = subjects.find(s => s.id === template.subjectId);
            if (subject) {
              setNewCategory(subject.name);
              setNewSubjectId(subject.id);
            }
            setSelectedView('upload');
            onShowToast(`Template "${template.title}" telah dimuat. Silakan unggah file Anda.`, 'success');
          }}
        />
      )}

      {selectedView === 'management' && (
        <MaterialManagementView
          materials={materials}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          onMaterialDelete={handleDelete}
          onMaterialSelect={handleMaterialSelect}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={() => clearFilters(setFilters)}
          filteredMaterials={filteredMaterials}
          getActiveFilterCount={() => getActiveFilterCount(filters)}
          categories={categories}
        />
      )}

      {selectedView === 'details' && selectedMaterial && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EnhancedMaterialSharing
              material={selectedMaterial}
              onShowToast={onShowToast}
              currentUserId="current_user"
              currentUserRole="teacher"
              currentUserName="Current User"
            />
            <VersionControl
              material={selectedMaterial}
              onShowToast={onShowToast}
              onVersionUpdate={fetchMaterials}
            />
            <MaterialAnalytics
              material={selectedMaterial}
              onShowToast={onShowToast}
            />
          </div>
          <div className="lg:col-span-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedView('management')}
            >
              ← Kembali ke Kelola
            </Button>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default MaterialUpload;
