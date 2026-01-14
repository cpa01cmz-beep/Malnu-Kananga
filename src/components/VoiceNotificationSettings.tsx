import { useState, useEffect } from 'react';
import { useVoiceNotifications } from '../hooks/useVoiceNotifications';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { SpeakerXMarkIcon } from './icons/SpeakerXMarkIcon';
import { Toggle } from './ui/Toggle';
import Button from './ui/Button';
import Tab from './ui/Tab';
import Modal from './ui/Modal';
import type { SpeechSynthesisVoice } from '../types';
import { EmptyState } from './ui/LoadingState';

interface VoiceNotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const VoiceNotificationSettings: React.FC<VoiceNotificationSettingsProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const {
    settings,
    queue,
    history,
    isSpeaking,
    availableVoices,
    updateSettings,
    stopCurrent,
    skipCurrent,
    clearQueue,
    clearHistory,
    setVoice,
    testVoiceNotification,
  } = useVoiceNotifications();

  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'queue' | 'history'>('settings');

  useEffect(() => {
    if (isOpen && availableVoices.length > 0) {
      // Select default voice if none selected
      if (!selectedVoice) {
        const defaultVoice = availableVoices.find(voice => 
          voice.lang.startsWith('id') && voice.localService
        ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
        
        if (defaultVoice) {
          setSelectedVoice(defaultVoice);
          setVoice(defaultVoice);
        }
      }
    }
  }, [isOpen, availableVoices, selectedVoice, setVoice]);

  const handleTestNotification = () => {
    testVoiceNotification();
    if (onShowToast) {
      onShowToast('Notifikasi suara tes berhasil dikirim', 'success');
    }
  };

  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    setVoice(voice);
    if (onShowToast) {
      onShowToast(`Suara diubah ke ${voice.name}`, 'success');
    }
  };

  const handleSettingsUpdate = (newSettings: Partial<typeof settings>) => {
    updateSettings(newSettings);
    if (onShowToast) {
      onShowToast('Pengaturan notifikasi suara diperbarui', 'success');
    }
  };

  const handleStopCurrent = () => {
    stopCurrent();
    if (onShowToast) {
      onShowToast('Notifikasi suara dihentikan', 'info');
    }
  };

  const handleSkipCurrent = () => {
    skipCurrent();
    if (onShowToast) {
      onShowToast('Notifikasi suara dilewati', 'info');
    }
  };

  const handleClearQueue = () => {
    clearQueue();
    if (onShowToast) {
      onShowToast('Antrian notifikasi suara dibersihkan', 'success');
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    if (onShowToast) {
      onShowToast('Riwayat notifikasi suara dibersihkan', 'success');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      aria-labelledby="voice-settings-title"
    >
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SpeakerWaveIcon className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            <h2 id="voice-settings-title" className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Pengaturan Notifikasi Suara
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

          <Tab
            variant="pill"
            color="green"
            options={[
              { id: 'settings', label: 'Pengaturan' },
              { id: 'queue', label: 'Antrian' },
              { id: 'history', label: 'Riwayat' },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId: string) => setActiveTab(tabId as 'settings' | 'history' | 'queue')}
            className="mt-4"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Main Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Pengaturan Utama
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Aktifkan Notifikasi Suara
                    </label>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Aktifkan pengumuman suara untuk notifikasi penting
                    </p>
                  </div>
                  <Toggle
                    checked={settings.enabled}
                    onChange={(e) => handleSettingsUpdate({ enabled: e.target.checked })}
                  />
                </div>

                {settings.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Prioritas Tinggi Saja
                        </label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Hanya aktifkan suara untuk notifikasi prioritas tinggi
                        </p>
                      </div>
                      <Toggle
                        checked={settings.highPriorityOnly}
                        onChange={(e) => handleSettingsUpdate({ highPriorityOnly: e.target.checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Hormati Jam Tenang
                        </label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Jangan aktifkan suara selama jam tenang
                        </p>
                      </div>
                      <Toggle
                        checked={settings.respectQuietHours}
                        onChange={(e) => handleSettingsUpdate({ respectQuietHours: e.target.checked })}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Categories */}
              {settings.enabled && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Kategori Notifikasi
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Nilai
                        </label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Notifikasi publikasi nilai baru
                        </p>
                      </div>
                      <Toggle
                        checked={settings.categories.grades}
                        onChange={(e) => 
                          handleSettingsUpdate({
                            categories: { ...settings.categories, grades: e.target.checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Kehadiran
                        </label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Notifikasi status kehadiran (alpa, sakit, izin)
                        </p>
                      </div>
                      <Toggle
                        checked={settings.categories.attendance}
                        onChange={(e) => 
                          handleSettingsUpdate({
                            categories: { ...settings.categories, attendance: e.target.checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Sistem
                        </label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Alert dan pesan sistem penting
                        </p>
                      </div>
                      <Toggle
                        checked={settings.categories.system}
                        onChange={(e) => 
                          handleSettingsUpdate({
                            categories: { ...settings.categories, system: e.target.checked }
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Rapat
                        </label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Pengingat rapat dan pertemuan
                        </p>
                      </div>
                      <Toggle
                        checked={settings.categories.meetings}
                        onChange={(e) => 
                          handleSettingsUpdate({
                            categories: { ...settings.categories, meetings: e.target.checked }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Settings */}
              {settings.enabled && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Pengaturan Suara
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Pilih Suara
                    </label>
                    <select
                      value={selectedVoice?.name || ''}
                      onChange={(e) => {
                        const voice = availableVoices.find(v => v.name === e.target.value);
                        if (voice) handleVoiceChange(voice);
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {availableVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang}) {voice.localService ? '• Lokal' : '• Online'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Kecepatan ({settings.voiceSettings.rate.toFixed(1)}x)
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voiceSettings.rate}
                      onChange={(e) => 
                        handleSettingsUpdate({
                          voiceSettings: {
                            ...settings.voiceSettings,
                            rate: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Nada ({settings.voiceSettings.pitch.toFixed(1)})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.voiceSettings.pitch}
                      onChange={(e) => 
                        handleSettingsUpdate({
                          voiceSettings: {
                            ...settings.voiceSettings,
                            pitch: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Volume ({Math.round(settings.voiceSettings.volume * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.voiceSettings.volume}
                      onChange={(e) => 
                        handleSettingsUpdate({
                          voiceSettings: {
                            ...settings.voiceSettings,
                            volume: parseFloat(e.target.value)
                          }
                        })
                      }
                      className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleTestNotification}
                      variant="secondary"
                      className="w-full"
                    >
                      <SpeakerWaveIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                      Tes Notifikasi Suara
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Antrian Notifikasi Suara
                </h3>
                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <Button
                      onClick={handleStopCurrent}
                      variant="secondary"
                      size="sm"
                    >
                      <SpeakerXMarkIcon className="w-4 h-4 mr-1" />
                      Hentikan
                    </Button>
                  )}
                  {queue.length > 0 && (
                    <Button
                      onClick={handleSkipCurrent}
                      variant="secondary"
                      size="sm"
                    >
                      Lewati
                    </Button>
                  )}
                  {queue.length > 0 && (
                    <Button
                      onClick={handleClearQueue}
                      variant="danger"
                      size="sm"
                    >
                      Bersihkan
                    </Button>
                  )}
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <SpeakerWaveIcon className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                  <p>Tidak ada notifikasi suara dalam antrian</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((voiceNotif, index) => (
                    <div
                      key={voiceNotif.id}
                      className={`p-4 rounded-lg border ${
                        voiceNotif.isSpeaking
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {index + 1}.
                            </span>
                            {voiceNotif.isSpeaking && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Sedang Berbicara
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                            {voiceNotif.text}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            {new Date(voiceNotif.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Riwayat Notifikasi Suara
                </h3>
                {history.length > 0 && (
                  <Button
                    onClick={handleClearHistory}
                    variant="danger"
                    size="sm"
                  >
                    Bersihkan Riwayat
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <EmptyState message="Belum ada riwayat notifikasi suara" size="md" variant="illustrated" />
              ) : (
                <div className="space-y-2">
                  {history.slice().reverse().map((voiceNotif) => (
                    <div
                      key={voiceNotif.id}
                      className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              voiceNotif.priority === 'high'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                            }`}>
                              {voiceNotif.priority}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
                              {voiceNotif.category}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                            {voiceNotif.text}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            {new Date(voiceNotif.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-end">
              <Button onClick={onClose} variant="primary">
                Selesai
              </Button>
            </div>
          </div>
      </div>
    </Modal>
  );
};

export default VoiceNotificationSettings;