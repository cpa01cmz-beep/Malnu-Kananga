// ParentNotificationSettings.tsx - Component for configuring parent grade notifications
import React, { useState, useEffect } from 'react';
import { BellIcon } from './icons/BellIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import { ClockIcon } from './icons/MaterialIcons';
import { ToastType } from './Toast';
import { parentGradeNotificationService } from '../services/parentGradeNotificationService';
import type { ParentGradeNotificationSettings } from '../services/parentGradeNotificationService';
import { logger } from '../utils/logger';

interface ParentNotificationSettingsProps {
  onShowToast: (msg: string, type: ToastType) => void;
  onClose: () => void;
}

const ParentNotificationSettings: React.FC<ParentNotificationSettingsProps> = ({
  onShowToast,
  onClose
}) => {
  const [settings, setSettings] = useState<ParentGradeNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = () => {
    try {
      const currentSettings = parentGradeNotificationService.getSettings();
      setSettings(currentSettings);
      setLoading(false);
    } catch (error) {
      logger.error('Failed to load notification settings:', error);
      onShowToast('Gagal memuat pengaturan notifikasi', 'error');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      parentGradeNotificationService.saveSettings(settings);
      onShowToast('Pengaturan notifikasi berhasil disimpan', 'success');
      onClose();
    } catch (error) {
      logger.error('Failed to save notification settings:', error);
      onShowToast('Gagal menyimpan pengaturan notifikasi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
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
    setSettings(defaultSettings);
  };

  if (loading || !settings) {
    return (
      <div className="fixed inset-0 bg-black/50% flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Memuat pengaturan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50% flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <BellIcon />
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

        <div className="space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <BellIcon />
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">Aktifkan Notifikasi</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Terima notifikasi saat nilai anak diperbarui
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

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
                    onChange={(e) => setSettings({ ...settings, gradeThreshold: Number(e.target.value) })}
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
                      onClick={() => setSettings({ ...settings, frequency: option.value as ParentGradeNotificationSettings['frequency'] })}
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
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      Hanya Ujian Besar
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Notifikasi hanya untuk UTS, UAS, dan ujian penting lainnya
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.majorExamsOnly}
                      onChange={(e) => setSettings({ ...settings, majorExamsOnly: e.target.checked })}
                      className="sr-only peer"
                      disabled={!settings.enabled}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      Peringatan Nilai Kosong
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Notifikasi jika nilai tidak tercatat selama {settings.missingGradeDays} hari
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.missingGradeAlert}
                      onChange={(e) => setSettings({ ...settings, missingGradeAlert: e.target.checked })}
                      className="sr-only peer"
                      disabled={!settings.enabled}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      Jam Tenang (Quiet Hours)
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Tidak ganggu dari {settings.quietHours.start} - {settings.quietHours.end}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.quietHours.enabled}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        quietHours: { ...settings.quietHours, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                      disabled={!settings.enabled}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              {/* Quiet Hours Configuration */}
              {settings.enabled && settings.quietHours.enabled && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <h4 className="font-medium text-neutral-900 dark:text-white mb-3">
                    Konfigurasi Jam Tenang
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Mulai
                      </label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          quietHours: { ...settings.quietHours, start: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Selesai
                      </label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          quietHours: { ...settings.quietHours, end: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Reset ke Default
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentNotificationSettings;