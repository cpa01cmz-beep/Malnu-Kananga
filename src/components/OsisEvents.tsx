
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { UserGroupIcon, CurrencyDollarIcon, MegaphoneIcon, StarIcon } from './icons/EventIcons';
import { eventsAPI, eventRegistrationsAPI, eventBudgetsAPI, eventPhotosAPI, eventFeedbackAPI, fileStorageAPI } from '../services/apiService';
import type { SchoolEvent, EventRegistration, EventBudget, EventPhoto, EventFeedback } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import FormGrid from './ui/FormGrid';
import ProgressBar from './ui/ProgressBar';
import { EmptyState } from './ui/LoadingState';
import ConfirmationDialog from './ui/ConfirmationDialog';
import Card from './ui/Card';
import { GRADIENT_CLASSES, DARK_GRADIENT_CLASSES } from '../config/gradients';

interface OsisEventsProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

type TabType = 'events' | 'registrations' | 'budget' | 'photos' | 'announcements' | 'feedback';

const OsisEvents: React.FC<OsisEventsProps> = ({ onBack, onShowToast }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newEvent, setNewEvent] = useState<Partial<SchoolEvent>>({
    eventName: '', date: '', location: '', description: '', status: 'Upcoming'
  });

  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [newRegistration, setNewRegistration] = useState<Partial<EventRegistration>>({});

  const [budgets, setBudgets] = useState<EventBudget[]>([]);
  const [newBudget, setNewBudget] = useState<Partial<EventBudget>>({});

  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [newPhoto, setNewPhoto] = useState<Partial<EventPhoto>>({});

  const [feedback, setFeedback] = useState<EventFeedback[]>([]);
  const [newFeedback, setNewFeedback] = useState<Partial<EventFeedback>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingRegistration, setIsAddingRegistration] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await eventsAPI.getAll();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch {
      onShowToast('Gagal memuat kegiatan', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  const loadEventData = useCallback(async () => {
    if (!selectedEvent) return;

    try {
      let response;
      switch (activeTab) {
        case 'registrations':
          response = await eventRegistrationsAPI.getByEventId(selectedEvent.id);
          if (response.success && response.data) {
            setRegistrations(response.data);
          }
          break;
        case 'budget':
          response = await eventBudgetsAPI.getByEventId(selectedEvent.id);
          if (response.success && response.data) {
            setBudgets(response.data);
          }
          break;
        case 'photos':
          response = await eventPhotosAPI.getByEventId(selectedEvent.id);
          if (response.success && response.data) {
            setPhotos(response.data);
          }
          break;
        case 'feedback':
          response = await eventFeedbackAPI.getByEventId(selectedEvent.id);
          if (response.success && response.data) {
            setFeedback(response.data);
          }
          break;
        default:
          break;
      }
    } catch {
      onShowToast('Gagal memuat data kegiatan', 'error');
    }
  }, [selectedEvent, activeTab, onShowToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (selectedEvent) {
      loadEventData();
    }
  }, [selectedEvent, activeTab, loadEventData, onShowToast]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.eventName) return;

    try {
      setIsCreating(true);
      const response = await eventsAPI.create({
        eventName: newEvent.eventName!,
        date: newEvent.date!,
        location: newEvent.location!,
        description: newEvent.description!,
        status: (newEvent.status as 'Upcoming' | 'Ongoing' | 'Completed')
      });

      if (response.success && response.data) {
        setEvents([...events, response.data]);
        setNewEvent({ eventName: '', date: '', location: '', description: '', status: 'Upcoming' });
        onShowToast('Kegiatan berhasil dijadwalkan.', 'success');
      } else {
        throw new Error(response.error || 'Gagal menambahkan kegiatan');
      }
    } catch {
      onShowToast('Gagal menambahkan kegiatan. Silakan coba lagi.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      const response = await eventsAPI.delete(eventToDelete);
      if (response.success) {
        setEvents(events.filter(e => e.id !== eventToDelete));
        if (selectedEvent?.id === eventToDelete) {
          setSelectedEvent(null);
        }
        onShowToast('Kegiatan dihapus.', 'info');
      } else {
        throw new Error(response.error || 'Gagal menghapus kegiatan');
      }
    } catch {
      onShowToast('Gagal menghapus kegiatan. Silakan coba lagi.', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleAddRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !newRegistration.studentId) return;

    try {
      setIsAddingRegistration(true);
      const response = await eventRegistrationsAPI.create({
        eventId: selectedEvent.id,
        studentId: newRegistration.studentId,
        studentName: newRegistration.studentName || '',
        studentClass: newRegistration.studentClass || '',
        attendanceStatus: 'registered'
      });

      if (response.success && response.data) {
        setRegistrations([...registrations, response.data]);
        setNewRegistration({});
        onShowToast('Pendaftaran berhasil.', 'success');
      }
    } catch {
      onShowToast('Gagal mendaftarkan siswa.', 'error');
    } finally {
      setIsAddingRegistration(false);
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !newBudget.itemName) return;

    try {
      setIsAddingBudget(true);
      const response = await eventBudgetsAPI.create({
        eventId: selectedEvent.id,
        category: newBudget.category || 'Other',
        itemName: newBudget.itemName,
        estimatedCost: newBudget.estimatedCost || 0,
        quantity: newBudget.quantity || 1,
        status: 'planned'
      });

      if (response.success && response.data) {
        setBudgets([...budgets, response.data]);
        setNewBudget({});
        onShowToast('Anggaran ditambahkan.', 'success');
      }
    } catch {
      onShowToast('Gagal menambahkan anggaran.', 'error');
    } finally {
      setIsAddingBudget(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedFile) return;

    try {
      const uploadResponse = await fileStorageAPI.upload(selectedFile, undefined, {
        onProgress: (progress) => setUploadProgress(progress.percentage)
      });
      if (uploadResponse.success && uploadResponse.data?.url) {
        const response = await eventPhotosAPI.create({
          eventId: selectedEvent.id,
          photoUrl: uploadResponse.data.url,
          caption: newPhoto.caption
        });

        if (response.success && response.data) {
          setPhotos([...photos, response.data]);
          setNewPhoto({});
          setSelectedFile(null);
          setUploadProgress(0);
          onShowToast('Foto berhasil diunggah.', 'success');
        }
      }
    } catch {
      onShowToast('Gagal mengunggah foto.', 'error');
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !newFeedback.studentId) return;

    try {
      const response = await eventFeedbackAPI.create({
        eventId: selectedEvent.id,
        studentId: newFeedback.studentId,
        studentName: newFeedback.studentName || '',
        studentClass: newFeedback.studentClass || '',
        overallRating: newFeedback.overallRating || 5,
        organizationRating: newFeedback.organizationRating || 5,
        contentRating: newFeedback.contentRating || 5,
        comments: newFeedback.comments,
        wouldRecommend: newFeedback.wouldRecommend || false
      });

      if (response.success && response.data) {
        setFeedback([...feedback, response.data]);
        setNewFeedback({});
        onShowToast('Umpan balik berhasil dikirim.', 'success');
      }
    } catch {
      onShowToast('Gagal mengirim umpan balik.', 'error');
    }
  };

  const handleBudgetApproval = async (budgetId: string) => {
    try {
      const response = await eventBudgetsAPI.approve(budgetId);
      if (response.success) {
        setBudgets(budgets.map(b => b.id === budgetId ? { ...b, status: 'approved' as const } : b));
        onShowToast('Anggaran disetujui.', 'success');
      }
    } catch {
      onShowToast('Gagal menyetujui anggaran.', 'error');
    }
  };

  const renderTabContent = () => {
    if (!selectedEvent) {
      return (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">Pilih kegiatan untuk melihat detail dan fitur pengelolaan.</p>
        </Card>
      );
    }

    switch (activeTab) {
      case 'registrations':
        return (
          <div className="space-y-4">
            <Card rounded="xl" shadow="card" border="neutral-200">
              <h3 className="text-lg font-bold mb-4">Daftar Pendaftar</h3>
              <form onSubmit={handleAddRegistration} className="mb-4">
                <FormGrid>
                <Input
                  type="text"
                  placeholder="NISN Siswa"
                  value={newRegistration.studentId || ''}
                  onChange={e => setNewRegistration({ ...newRegistration, studentId: e.target.value })}
                  required
                />
                <Input
                  type="text"
                  placeholder="Nama Siswa"
                  value={newRegistration.studentName || ''}
                  onChange={e => setNewRegistration({ ...newRegistration, studentName: e.target.value })}
                  required
                />
                <Input
                  type="text"
                  placeholder="Kelas"
                  value={newRegistration.studentClass || ''}
                  onChange={e => setNewRegistration({ ...newRegistration, studentClass: e.target.value })}
                  required
                />
                </FormGrid>
                <Button type="submit" variant="warning" icon={<PlusIcon className="w-4 h-4" />} iconPosition="left" isLoading={isAddingRegistration}>
                  {isAddingRegistration ? 'Mendaftarkan...' : 'Daftar'}
                </Button>
              </form>
              <div className="space-y-2">
                {registrations.map(reg => (
                  <div key={reg.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{reg.studentName}</p>
                      <p className="text-sm text-neutral-500">{reg.studentClass} • {reg.registrationDate}</p>
                    </div>
                    <select
                      value={reg.attendanceStatus}
                      onChange={async (e) => {
                        const status = e.target.value as 'registered' | 'attended' | 'absent';
                        await eventRegistrationsAPI.updateAttendance(reg.id, status);
                        setRegistrations(registrations.map(r => r.id === reg.id ? { ...r, attendanceStatus: status } : r));
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="registered">Terdaftar</option>
                      <option value="attended">Hadir</option>
                      <option value="absent">Tidak Hadir</option>
                    </select>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-4">
            <Card rounded="xl" shadow="card" border="neutral-200">
              <h3 className="text-lg font-bold mb-4">Anggaran Kegiatan</h3>
              <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Select
                  value={newBudget.category || 'Other'}
                  onChange={e => setNewBudget({ ...newBudget, category: e.target.value as EventBudget['category'] })}
                  options={[
                    { value: 'Food', label: 'Makanan & Minuman' },
                    { value: 'Decoration', label: 'Dekorasi' },
                    { value: 'Equipment', label: 'Perlengkapan' },
                    { value: 'Venue', label: 'Tempat' },
                    { value: 'Marketing', label: 'Pemasaran' },
                    { value: 'Other', label: 'Lainnya' },
                  ]}
                  required
                />
                <Input
                  type="text"
                  placeholder="Nama Item"
                  value={newBudget.itemName || ''}
                  onChange={e => setNewBudget({ ...newBudget, itemName: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Estimasi Biaya"
                  value={newBudget.estimatedCost || ''}
                  onChange={e => setNewBudget({ ...newBudget, estimatedCost: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Jumlah"
                  value={newBudget.quantity || ''}
                  onChange={e => setNewBudget({ ...newBudget, quantity: parseInt(e.target.value) })}
                />
                <Button type="submit" variant="success" icon={<PlusIcon className="w-4 h-4" />} iconPosition="left" className="md:col-span-2" isLoading={isAddingBudget}>
                  {isAddingBudget ? 'Menambahkan...' : 'Tambah Anggaran'}
                </Button>
              </form>
              <div className="space-y-2">
                {budgets.map(budget => (
                  <div key={budget.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{budget.itemName}</p>
                      <p className="text-sm text-neutral-500">{budget.category} • {budget.quantity}x</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-green-600">Rp {budget.estimatedCost.toLocaleString()}</span>
                      {budget.status === 'planned' && (
                        <Button
                          onClick={() => handleBudgetApproval(budget.id)}
                          ariaLabel={`Setujui anggaran ${budget.itemName}`}
                          variant="blue-solid"
                          size="sm"
                        >
                          Setujui
                        </Button>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        budget.status === 'approved' ? 'bg-green-100 text-green-700' :
                        budget.status === 'purchased' ? 'bg-blue-100 text-blue-700' :
                        budget.status === 'completed' ? 'bg-neutral-100 text-neutral-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {budget.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4">
            <Card rounded="xl" shadow="card" border="neutral-200">
              <h3 className="text-lg font-bold mb-4">Galeri Foto</h3>
              <form onSubmit={handleUploadPhoto} className="mb-4">
                <div className="flex gap-4 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                    required
                  />
                  <Button type="submit" variant="info">
                    Unggah
                  </Button>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <ProgressBar
                    value={uploadProgress}
                    size="md"
                    color="purple"
                    aria-label={`Upload progress: ${uploadProgress}%`}
                  />
                )}
                <input
                  type="text"
                  placeholder="Keterangan foto"
                  value={newPhoto.caption || ''}
                  onChange={e => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                />
              </form>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || 'Foto kegiatan'}
                      className="w-full h-48 object-cover rounded-lg"
                      width={400}
                      height={192}
                    />
                    {photo.caption && (
                      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-4">
            <Card rounded="xl" shadow="card" border="neutral-200">
              <h3 className="text-lg font-bold mb-4">Umpan Balik Kegiatan</h3>
              <form onSubmit={handleAddFeedback} className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="NISN Siswa"
                    value={newFeedback.studentId || ''}
                    onChange={e => setNewFeedback({ ...newFeedback, studentId: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nama Siswa"
                    value={newFeedback.studentName || ''}
                    onChange={e => setNewFeedback({ ...newFeedback, studentName: e.target.value })}
                    className="px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating Keseluruhan</label>
                    <select
                      value={newFeedback.overallRating || 5}
                      onChange={e => setNewFeedback({ ...newFeedback, overallRating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                      required
                    >
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating Organisasi</label>
                    <select
                      value={newFeedback.organizationRating || 5}
                      onChange={e => setNewFeedback({ ...newFeedback, organizationRating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                      required
                    >
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating Konten</label>
                    <select
                      value={newFeedback.contentRating || 5}
                      onChange={e => setNewFeedback({ ...newFeedback, contentRating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                      required
                    >
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)}</option>)}
                    </select>
                  </div>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Komentar atau saran..."
                  value={newFeedback.comments || ''}
                  onChange={e => setNewFeedback({ ...newFeedback, comments: e.target.value })}
                  size="md"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newFeedback.wouldRecommend || false}
                    onChange={e => setNewFeedback({ ...newFeedback, wouldRecommend: e.target.checked })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-medium">Saya merekomendasikan kegiatan ini</span>
                </label>
                <Button type="submit" variant="info" fullWidth>
                  Kirim Umpan Balik
                </Button>
              </form>
              <div className="space-y-3">
                {feedback.map(fb => (
                  <div key={fb.id} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{fb.studentName} ({fb.studentClass})</p>
                      <div className="flex gap-1">
                        <span title="Rating Keseluruhan">⭐ {fb.overallRating}</span>
                        <span title="Rating Organisasi">🏆 {fb.organizationRating}</span>
                        <span title="Rating Konten">📝 {fb.contentRating}</span>
                      </div>
                    </div>
                    {fb.comments && <p className="text-sm text-neutral-600 dark:text-neutral-300 italic">"{fb.comments}"</p>}
                    {fb.wouldRecommend && <p className="text-xs text-green-600 font-semibold">✓ Merekomendasikan</p>}
                    <p className="text-xs text-neutral-500 mt-1">{fb.submittedAt}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'announcements':
        return (
          <Card rounded="xl" shadow="card" border="neutral-200">
            <div className="flex items-center gap-3 mb-4">
              <MegaphoneIcon className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-bold">Buat Pengumuman Kegiatan</h3>
                <p className="text-sm text-neutral-500">Buat pengumuman untuk kegiatan "{selectedEvent.eventName}"</p>
              </div>
            </div>
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Pengumuman kegiatan akan dikirim ke semua siswa melalui sistem notifikasi terpusat.
              </p>
            </Card>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            ← Kembali ke Portal
          </Button>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Manajemen Kegiatan OSIS</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Kelola dan pantau kegiatan sekolah dengan lengkap.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card rounded="2xl" shadow="sm" border="neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Buat Kegiatan Baru</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <Input
                label="Nama Kegiatan"
                required
                type="text"
                value={newEvent.eventName || ''}
                onChange={e => setNewEvent({...newEvent, eventName: e.target.value})}
                fullWidth
              />
              <Input
                label="Tanggal Pelaksanaan"
                required
                type="date"
                value={newEvent.date || ''}
                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                fullWidth
              />
              <Input
                label="Lokasi"
                required
                type="text"
                value={newEvent.location || ''}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                fullWidth
              />
              <Textarea
                label="Deskripsi Singkat"
                required
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                size="md"
                minRows={3}
                fullWidth
              />
              <Button type="submit" fullWidth icon={<PlusIcon className="w-5 h-5" />} isLoading={isCreating}>
                {isCreating ? 'Menyimpan...' : 'Simpan Kegiatan'}
              </Button>
            </form>
          </Card>

          {selectedEvent && (
            <Card rounded="2xl" shadow="sm" border="neutral-200" padding="sm">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-3">Navigasi Fitur</h4>
              <div className="space-y-2">
                {[
                  { id: 'registrations' as TabType, label: 'Pendaftaran', icon: <UserGroupIcon className="w-4 h-4" /> },
                  { id: 'budget' as TabType, label: 'Anggaran', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
                  { id: 'photos' as TabType, label: 'Galeri Foto', icon: <PhotoIcon className="w-4 h-4" /> },
                  { id: 'announcements' as TabType, label: 'Pengumuman', icon: <MegaphoneIcon className="w-4 h-4" /> },
                  { id: 'feedback' as TabType, label: 'Umpan Balik', icon: <StarIcon className="w-4 h-4" /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-neutral-500 mt-8">Memuat kegiatan...</p>
            ) : events.length === 0 ? (
              <EmptyState 
                message="Belum ada kegiatan"
                size="md"
                ariaLabel="Belum ada kegiatan OSIS"
              />
            ) : (
              events.map(event => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  aria-label={`Lihat detail kegiatan: ${event.eventName}`}
                  className={`bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border text-left w-full ${
                    selectedEvent?.id === event.id
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-neutral-100 dark:border-neutral-700 hover:border-orange-300'
                  } flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900`}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl text-orange-600 dark:text-orange-400">
                      <CalendarDaysIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white">{event.eventName}</h4>
                      <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        <span>📅 {event.date}</span>
                        <span>📍 {event.location}</span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      event.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      event.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}>
                      {event.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                      aria-label={`Hapus kegiatan ${event.eventName}`}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>

          {selectedEvent && (
            <Card className={`${GRADIENT_CLASSES.ORANGE_GREEN} dark:${DARK_GRADIENT_CLASSES.ORANGE_GREEN} border border-orange-200 dark:border-orange-800 rounded-2xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{selectedEvent.eventName}</h3>
                  <p className="text-sm text-neutral-500">Kelola fitur kegiatan ini</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Tutup detail kegiatan"
                  className="px-4 py-2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                >
                  Tutup
                </button>
              </div>
              {renderTabContent()}
            </Card>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Batalkan Kegiatan"
        message="Apakah Anda yakin ingin membatalkan kegiatan ini?"
        type="warning"
        confirmText={isDeleting ? 'Menghapus...' : 'Batalkan'}
        cancelText="Batal"
        onConfirm={confirmDeleteEvent}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setEventToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default OsisEvents;
