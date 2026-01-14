// ParentNotificationSettings.tsx - Component for configuring parent grade notifications
import React, { useState, useEffect } from 'react';
import { BellIcon } from './icons/BellIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import { ClockIcon } from './icons/MaterialIcons';
import { ToastType } from './Toast';
import { Toggle } from './ui/Toggle';
import IconButton from './ui/IconButton';
import { parentGradeNotificationService } from '../services/parentGradeNotificationService';
import type { ParentGradeNotificationSettings } from '../services/parentGradeNotificationService';
import { logger } from '../utils/logger';
import { useAutoSave } from '../hooks/useAutoSave';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import { HEIGHT_CLASSES } from '../config/heights';

interface ParentNotificationSettingsProps {
  onShowToast: (msg: string, type: ToastType) => void;
  onClose: () => void;
}

const ParentNotificationSettings: React.FC<ParentNotificationSettingsProps> = ({
  onShowToast,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  
  // Initial default settings
  const defaultSettings: ParentGradeNotificationSettings = {
    enabled: true,
    gradeThreshold: 70,
    subjects: [],
    frequency: 'immediate',
    majorExamsOnly: false,
    missingGradeAlert: true,
    missingGradeDays: 7,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    }
  };

  // Use standardized auto-save hook
  const [autoSaveState, autoSaveActions] = useAutoSave<ParentGradeNotificationSettings>(
    defaultSettings,
    {
      storageKey: 'malnu_parent_notification_settings',
      delay: 1500, // Slightly faster for settings
      enableOffline: true,
      onSave: async (settings) => {
        parentGradeNotificationService.saveSettings(settings);
      },
      onSaved: () => {
        onShowToast('Pengaturan disimpan otomatis', 'success');
      },
      onError: (error) => {
        onShowToast(`Gagal menyimpan: ${error}`, 'error');
      },
      validate: (settings) => {
        if (settings.gradeThreshold < 40 || settings.gradeThreshold > 100) {
          return 'Batas nilai harus antara 40-100';
        }
        return null;
      }
    }
  );

  useEffect(() => {
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = () => {
    try {
      const currentSettings = parentGradeNotificationService.getSettings();
      autoSaveActions.reset(currentSettings);
      setLoading(false);
    } catch (error) {
      logger.error('Failed to load notification settings:', error);
      onShowToast('Gagal memuat pengaturan notifikasi', 'error');
      setLoading(false);
    }
  };

  const handleReset = () => {
    autoSaveActions.reset(defaultSettings);
    onShowToast('Pengaturan direset ke default', 'info');
  };

  const handleManualSave = async () => {
    await autoSaveActions.saveNow();
    onShowToast('Pengaturan berhasil disimpan', 'success');
  };

  const updateSettings = (updates: Partial<ParentGradeNotificationSettings>) => {
    autoSaveActions.updateData(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4">
          <LoadingSpinner text="Memuat pengaturan..." />
        </div>
      </div>
    );
  }

  const { data: settings, isAutoSaving, isDirty, lastSaved, error } = autoSaveState;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-2xl w-full ${HEIGHT_CLASSES.MODAL.FULL} overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <BellIcon aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Pengaturan Notifikasi Nilai
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Konfigurasi notifikasi nilai anak Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Auto-save status */}
        {isDirty && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-between">
            {isAutoSaving ? (
              <div className="flex items-center gap-2 flex-1">
                <LoadingSpinner size="sm" color="primary" text="Menyimpan..." />
              </div>
            ) : (
              <span className="text-sm text-amber-800 dark:text-amber-200">
                Perubahan belum disimpan
              </span>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm text-red-800 dark:text-red-200">
              {error}
            </span>
            <IconButton
              icon="×"
              ariaLabel="Tutup pesan error"
              variant="ghost"
              size="sm"
              onClick={autoSaveActions.clearError}
            />
          </div>
        )}

        <div className="space-y-6">
          <Toggle
            checked={settings.enabled}
            onChange={(e) => updateSettings({ enabled: e.target.checked })}
            label="Aktifkan Notifikasi"
            description="Terima notifikasi saat nilai anak diperbarui"
            className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
          />

          {settings.enabled && (
            <>
              {/* Grade Threshold */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <AcademicCapIcon />
                  <span className="font-medium text-neutral-900 dark:text-white">
                    Batas Nilai Rendah
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={settings.gradeThreshold}
                    onChange={(e) => updateSettings({ gradeThreshold: Number(e.target.value) })}
                    className="flex-1"
                    disabled={!settings.enabled}
                  />
                  <span className="w-12 text-center font-medium text-neutral-900 dark:text-white">
                    {settings.gradeThreshold}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Notifikasi akan dikirim jika nilai di bawah {settings.gradeThreshold}
                </p>
              </div>

              {/* Frequency */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <ClockIcon />
                  <span className="font-medium text-neutral-900 dark:text-white">
                    Frekuensi Notifikasi
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'immediate', label: 'Langsung', desc: 'Kirim segera' },
                    { value: 'daily_digest', label: 'Ringkasan Harian', desc: 'Satu kali per hari' },
                    { value: 'weekly_summary', label: 'Ringkasan Mingguan', desc: 'Satu kali per minggu' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSettings({ frequency: option.value as ParentGradeNotificationSettings['frequency'] })}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        settings.frequency === option.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }`}
                      disabled={!settings.enabled}
                    >
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-neutral-900 dark:text-white">Pengaturan Tambahan</h3>
                
                 <Toggle
                   checked={settings.majorExamsOnly}
                   onChange={(e) => updateSettings({ majorExamsOnly: e.target.checked })}
                   disabled={!settings.enabled}
                   label="Hanya Ujian Besar"
                   description="Notifikasi hanya untuk UTS, UAS, dan ujian penting lainnya"
                   className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                 />

                 <Toggle
                   checked={settings.missingGradeAlert}
                   onChange={(e) => updateSettings({ missingGradeAlert: e.target.checked })}
                   disabled={!settings.enabled}
                   label="Alert Nilai Kosong"
                   description="Notifikasi jika ada nilai yang belum diinput"
                   className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                 />

                 {settings.missingGradeAlert && (
                   <div className="ml-4">
                     <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                       Hari Alert Nilai Kosong
                     </label>
                     <input
                       type="number"
                       min="1"
                       max="30"
                       value={settings.missingGradeDays}
                       onChange={(e) => updateSettings({ missingGradeDays: Number(e.target.value) })}
                       className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                       disabled={!settings.enabled}
                     />
                     <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                       Kirim alert setelah {settings.missingGradeDays} hari tidak ada nilai
                     </p>
                   </div>
                 )}

                 <Toggle
                   checked={settings.quietHours.enabled}
                   onChange={(e) => updateSettings({ 
                     quietHours: { ...settings.quietHours, enabled: e.target.checked }
                   })}
                   disabled={!settings.enabled}
                   label="Jam Hening"
                   description="Jangan ganggu dengan notifikasi pada jam tertentu"
                   className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                 />

                 {settings.quietHours.enabled && (
                   <div className="ml-4 space-y-3">
                     <div className="flex items-center gap-3">
                       <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                         Mulai
                       </label>
                       <input
                         type="time"
                         value={settings.quietHours.start}
                         onChange={(e) => updateSettings({ 
                           quietHours: { ...settings.quietHours, start: e.target.value }
                         })}
                         className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                       />
                       <span className="text-neutral-600 dark:text-neutral-400">hingga</span>
                       <input
                         type="time"
                         value={settings.quietHours.end}
                         onChange={(e) => updateSettings({ 
                           quietHours: { ...settings.quietHours, end: e.target.value }
                         })}
                         className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                       />
                     </div>
                   </div>
                 )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {lastSaved && (
              <span>Terakhir disimpan: {new Date(lastSaved).toLocaleTimeString('id-ID')}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleReset}
              variant="ghost"
            >
              Reset
            </Button>
            {isDirty && (
              <Button
                onClick={handleManualSave}
                variant="primary"
              >
                Simpan Sekarang
              </Button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentNotificationSettings;