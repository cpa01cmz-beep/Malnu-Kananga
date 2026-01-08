import React, { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useVoiceNotifications } from '../hooks/useVoiceNotifications';
import Button from './ui/Button';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { BellIcon } from './icons/BellIcon';

/**
 * VoiceNotificationDemo - Component to demonstrate voice notification functionality
 * This component shows how to integrate voice notifications with the existing push notification system.
 */
const VoiceNotificationDemo: React.FC = () => {
  const { showNotification } = usePushNotifications();
  const { 
    settings: voiceSettings, 
    updateSettings, 
    testVoiceNotification,
    isSpeaking,
    queue
  } = useVoiceNotifications();

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(voiceSettings.enabled);

  const handleToggleVoiceNotification = () => {
    const newValue = !isVoiceEnabled;
    setIsVoiceEnabled(newValue);
    updateSettings({ enabled: newValue });
  };

  const handleSendTestNotification = (type: 'grade' | 'attendance' | 'system') => {
    const notifications = {
      grade: {
        id: `test-grade-${Date.now()}`,
        type: 'grade' as const,
        title: 'Nilai Matematika',
        body: 'Anda mendapat nilai 85 untuk ujian matematika semester ini',
        priority: 'high' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
      attendance: {
        id: `test-attendance-${Date.now()}`,
        type: 'system' as const,
        title: 'Status Kehadiran',
        body: 'Anda tercatat sebagai alpa pada hari Senin, 8 Januari 2026',
        priority: 'high' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
      system: {
        id: `test-system-${Date.now()}`,
        type: 'system' as const,
        title: 'Pengingat Rapat',
        body: 'Rapat orang tua akan dimulai dalam 30 menit di ruang guru',
        priority: 'high' as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
    };

    const notification = notifications[type];
    showNotification(notification);
  };

  const handleTestVoiceOnly = () => {
    testVoiceNotification();
  };

  const handleStopSpeaking = () => {
    if (voiceSettings.enabled) {
      import('../services/voiceNotificationService').then(({ voiceNotificationService }) => {
        voiceNotificationService.stopCurrent();
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <BellIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <SpeakerWaveIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Voice Notifications Demo
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Aksesibilitas notifikasi suara untuk MA Malnu Kananga Smart Portal
        </p>
      </div>

      {/* Voice Settings Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Status Notifikasi Suara
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {isVoiceEnabled ? '✅ Aktif' : '❌ Non-aktif'} | 
              {isSpeaking ? ' 🗣️ Sedang Berbicara' : ''} |
              Antrian: {queue.length} notifikasi
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleToggleVoiceNotification}
              variant={isVoiceEnabled ? 'success' : 'danger'}
              size="sm"
            >
              {isVoiceEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
            </Button>
            {isSpeaking && (
              <Button
                onClick={handleStopSpeaking}
                variant="secondary"
                size="sm"
              >
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Test Notifications Section */}
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Tes Notifikasi dengan Suara
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Kirim notifikasi dengan suara otomatis (jika notifikasi suara diaktifkan):
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full"></div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifikasi Nilai
                </h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Simulasi notifikasi publikasi nilai baru
              </p>
              <Button
                onClick={() => handleSendTestNotification('grade')}
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!isVoiceEnabled}
              >
                <BellIcon className="w-4 h-4 mr-2" />
                Kirim Nilai
              </Button>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-400 dark:bg-red-500 rounded-full"></div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifikasi Kehadiran
                </h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Simulasi notifikasi status kehadiran
              </p>
              <Button
                onClick={() => handleSendTestNotification('attendance')}
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!isVoiceEnabled}
              >
                <BellIcon className="w-4 h-4 mr-2" />
                Kirim Absen
              </Button>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifikasi Sistem
                </h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Simulasi notifikasi rapat atau pesan sistem
              </p>
              <Button
                onClick={() => handleSendTestNotification('system')}
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!isVoiceEnabled}
              >
                <BellIcon className="w-4 h-4 mr-2" />
                Kirim Rapat
              </Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Tes Suara Saja
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Kirim tes notifikasi suara tanpa push notification:
          </p>
          
          <div className="flex justify-center">
            <Button
              onClick={handleTestVoiceOnly}
              variant="secondary"
              disabled={!isVoiceEnabled}
            >
              <SpeakerWaveIcon className="w-5 h-5 mr-2" />
              Tes Notifikasi Suara
            </Button>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Cara Penggunaan
          </h3>
          <ol className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>1. <strong>Aktifkan Notifikasi Suara</strong> - Klik tombol aktifkan di atas</li>
            <li>2. <strong>Berikan Izin Browser</strong> - Pastikan browser mendukung speech synthesis</li>
            <li>3. <strong>Kirim Notifikasi</strong> - Klik salah satu tombol tes notifikasi</li>
            <li>4. <strong>Dengarkan</strong> - Notifikasi akan diucapkan dengan suara</li>
            <li>5. <strong>Kontrol</strong> - Gunakan tombol Stop untuk menghentikan pembacaan</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Catatan:</strong> Fitur ini berfungsi baik di browser modern yang mendukung Web Speech API 
              (Chrome, Edge, Safari). Pastikan volume perangkat aktif.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VoiceNotificationDemo;