import React from 'react'

import { useState, useEffect, useCallback } from 'react';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { STORAGE_KEYS, VOICE_CONFIG } from '../constants';
import type { SpeechSynthesisVoice } from '../types';
import { VoiceLanguage } from '../types';
import { logger } from '../utils/logger';
import {
  backupVoiceSettings,
  restoreVoiceSettings,
  hasBackup,
  getBackupDate,
  deleteBackup,
} from '../services/voiceSettingsBackup';
import Modal from './ui/Modal';
import Button from './ui/Button';
import SmallActionButton from './ui/SmallActionButton';
import { Toggle } from './ui/Toggle';
import { HEIGHT_CLASSES } from '../config/heights';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}



interface StoredVoiceSettings {
  recognition: {
    language: VoiceLanguage;
    continuous: boolean;
  };
  synthesis: {
    rate: number;
    pitch: number;
    volume: number;
    voiceName?: string;
  };
  autoReadAI: boolean;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isOpen, onClose, onShowToast }) => {
  const recognition = useVoiceRecognition();
  const synthesis = useVoiceSynthesis();

  const [language, setLanguage] = useState<VoiceLanguage>(VoiceLanguage.Indonesian);
  const [continuous, setContinuous] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [autoReadAI, setAutoReadAI] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [hasSettingsBackup, setHasSettingsBackup] = useState(false);
  const [backupDate, setBackupDate] = useState<string | null>(null);
  const [showRestoreConfirmation, setShowRestoreConfirmation] = useState(false);

  const loadSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.VOICE_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings: StoredVoiceSettings = JSON.parse(savedSettings);

        setLanguage(parsedSettings.recognition.language);
        setContinuous(parsedSettings.recognition.continuous);
        setRate(parsedSettings.synthesis.rate);
        setPitch(parsedSettings.synthesis.pitch);
        setVolume(parsedSettings.synthesis.volume);
        setAutoReadAI(parsedSettings.autoReadAI);

        if (parsedSettings.synthesis.voiceName) {
          const voice = synthesis.voices.find(
            (v) => v.name === parsedSettings.synthesis.voiceName
          );
          if (voice) {
            setSelectedVoice(voice);
            synthesis.setVoice(voice);
          }
        }

        recognition.setLanguage(parsedSettings.recognition.language);
        recognition.setContinuous(parsedSettings.recognition.continuous);
        synthesis.setRate(parsedSettings.synthesis.rate);
        synthesis.setPitch(parsedSettings.synthesis.pitch);
        synthesis.setVolume(parsedSettings.synthesis.volume);

        logger.debug('Voice settings loaded:', parsedSettings);
      }
    } catch (error) {
      logger.error('Failed to load voice settings:', error);
    }
  }, [synthesis, recognition]);

  useEffect(() => {
    if (isOpen && synthesis.voices.length > 0) {
      loadSettings();
      setHasSettingsBackup(hasBackup());
      setBackupDate(getBackupDate());
    }
  }, [isOpen, synthesis.voices.length, loadSettings]);

  const saveSettings = useCallback(() => {
    try {
      const settings: StoredVoiceSettings = {
        recognition: {
          language,
          continuous,
        },
        synthesis: {
          rate,
          pitch,
          volume,
          voiceName: selectedVoice?.name,
        },
        autoReadAI,
      };

      localStorage.setItem(STORAGE_KEYS.VOICE_STORAGE_KEY, JSON.stringify(settings));
      logger.debug('Voice settings saved:', settings);
    } catch (error) {
      logger.error('Failed to save voice settings:', error);
    }
  }, [language, continuous, rate, pitch, volume, selectedVoice, autoReadAI]);

  useEffect(() => {
    if (isOpen) {
      saveSettings();
    }
  }, [isOpen, saveSettings]);

  const handleLanguageChange = (newLanguage: VoiceLanguage) => {
    setLanguage(newLanguage);
    recognition.setLanguage(newLanguage);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    synthesis.setRate(newRate);
  };

  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch);
    synthesis.setPitch(newPitch);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    synthesis.setVolume(newVolume);
  };

  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    synthesis.setVoice(voice);
  };

  const testVoice = () => {
    synthesis.speak('Halo, ini adalah tes suara Anda.');
  };

  const resetToDefaults = () => {
    // Reset all values to defaults from VOICE_CONFIG
    setLanguage(VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG.language);
    setContinuous(VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG.continuous);
    setRate(VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.rate);
    setPitch(VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.pitch);
    setVolume(VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.volume);
    setSelectedVoice(null);
    setAutoReadAI(false);

    // Apply the defaults to the voice systems
    recognition.setLanguage(VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG.language);
    recognition.setContinuous(VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG.continuous);
    synthesis.setRate(VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.rate);
    synthesis.setPitch(VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.pitch);
    synthesis.setVolume(VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.volume);

    // Save the defaults to localStorage
    try {
      const settings: StoredVoiceSettings = {
        recognition: {
          language: VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG.language,
          continuous: VOICE_CONFIG.DEFAULT_RECOGNITION_CONFIG.continuous,
        },
        synthesis: {
          rate: VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.rate,
          pitch: VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.pitch,
          volume: VOICE_CONFIG.DEFAULT_SYNTHESIS_CONFIG.volume,
        },
        autoReadAI: false,
      };

      localStorage.setItem(STORAGE_KEYS.VOICE_STORAGE_KEY, JSON.stringify(settings));
      logger.debug('Voice settings reset to defaults:', settings);
    } catch (error) {
      logger.error('Failed to save reset voice settings:', error);
    }

    // Show success notification
    if (onShowToast) {
      onShowToast('Pengaturan suara telah diatur ke pengaturan awal', 'success');
    }

    setShowResetConfirmation(false);
  };

  const handleBackup = () => {
    if (backupVoiceSettings()) {
      setHasSettingsBackup(true);
      setBackupDate(getBackupDate());
      if (onShowToast) {
        onShowToast('Pengaturan suara berhasil dibackup', 'success');
      }
    } else {
      if (onShowToast) {
        onShowToast('Gagal membackup pengaturan suara', 'error');
      }
    }
  };

  const handleRestore = () => {
    if (restoreVoiceSettings()) {
      loadSettings();
      if (onShowToast) {
        onShowToast('Pengaturan suara berhasil dipulihkan', 'success');
      }
    } else {
      if (onShowToast) {
        onShowToast('Gagal memulihkan pengaturan suara', 'error');
      }
    }
    setShowRestoreConfirmation(false);
  };

  const handleDeleteBackup = () => {
    if (deleteBackup()) {
      setHasSettingsBackup(false);
      setBackupDate(null);
      if (onShowToast) {
        onShowToast('Backup pengaturan suara berhasil dihapus', 'success');
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Pengaturan Suara"
        size="md"
        animation="scale-in"
        closeOnBackdropClick={true}
        closeOnEscape={true}
        showCloseButton={true}
        className={HEIGHT_CLASSES.MODAL.CONTENT}
      >
        <div className="flex items-center gap-2 mb-4">
          <SpeakerWaveIcon className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <div className="space-y-6 overflow-y-auto pr-2">
          {recognition.isSupported && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Input Suara</h3>

              <div className="space-y-2">
                <label htmlFor="voice-language" className="block text-sm text-neutral-600 dark:text-neutral-400">Bahasa</label>
                <select
                  id="voice-language"
                  name="language"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as VoiceLanguage)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="id-ID">Bahasa Indonesia</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              <div>
                <Toggle
                  id="continuous-mode"
                  label="Mode berkelanjutan"
                  checked={continuous}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setContinuous(e.target.checked);
                    recognition.setContinuous(e.target.checked);
                  }}
                  color="green"
                  toggleSize="md"
                />
              </div>
            </div>
          )}

          {synthesis.isSupported && synthesis.voices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Output Suara</h3>

              <div className="space-y-2">
                <label htmlFor="voice-rate" className="block text-sm text-neutral-600 dark:text-neutral-400">Kecepatan Bicara ({rate.toFixed(1)}x)</label>
                <input
                  id="voice-rate"
                  name="rate"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                  aria-label="Kecepatan bicara"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="voice-pitch" className="block text-sm text-neutral-600 dark:text-neutral-400">Nada ({pitch.toFixed(1)})</label>
                <input
                  id="voice-pitch"
                  name="pitch"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                  aria-label="Nada bicara"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="voice-volume" className="block text-sm text-neutral-600 dark:text-neutral-400">Volume ({Math.round(volume * 100)}%)</label>
                <input
                  id="voice-volume"
                  name="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                  aria-label="Volume"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="voice-select" className="block text-sm text-neutral-600 dark:text-neutral-400">Suara</label>
                <select
                  id="voice-select"
                  name="voice"
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = synthesis.voices.find((v) => v.name === e.target.value);
                    if (voice) {
                      handleVoiceChange(voice);
                    }
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {synthesis.voices
                    .filter((v) => v.lang.startsWith(language === VoiceLanguage.Indonesian ? 'id' : 'en'))
                    .map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                        {voice.default && ' - Default'}
                      </option>
                    ))}
                </select>
              </div>

              <Button
                onClick={testVoice}
                variant="green-solid"
                fullWidth
                icon={<SpeakerWaveIcon className="w-4 h-4" aria-hidden="true" />}
                aria-label="Tes suara"
              >
                Tes Suara
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <Toggle
              id="auto-read-ai"
              label="Baca Pesan AI"
              description="Secara otomatis membaca respon AI"
              checked={autoReadAI}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoReadAI(e.target.checked)}
              color="green"
              toggleSize="md"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Backup & Restore</h3>

              {hasSettingsBackup && backupDate ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20% rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                    Backup tersimpan: {backupDate}
                  </p>
                  <div className="flex gap-2">
                    <SmallActionButton
                      onClick={() => setShowRestoreConfirmation(true)}
                      variant="primary"
                      fullWidth
                    >
                      Pulihkan
                    </SmallActionButton>
                    <SmallActionButton
                      onClick={handleDeleteBackup}
                      variant="neutral"
                      fullWidth
                    >
                      Hapus
                    </SmallActionButton>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleBackup}
                  variant="blue-solid"
                  fullWidth
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  }
                  aria-label="Backup pengaturan"
                >
                  Backup Pengaturan
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setShowResetConfirmation(true)}
              variant="red-solid"
              fullWidth
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
              aria-label="Reset ke pengaturan awal"
            >
              Reset ke Pengaturan Awal
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        title="Reset Pengaturan Suara?"
        size="sm"
        animation="scale-in"
        closeOnBackdropClick={true}
        closeOnEscape={true}
        showCloseButton={false}
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Semua pengaturan suara akan dikembalikan ke nilai default. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowResetConfirmation(false)} fullWidth>
              Batal
            </Button>
            <Button variant="danger" onClick={resetToDefaults} fullWidth>
              Reset
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRestoreConfirmation}
        onClose={() => setShowRestoreConfirmation(false)}
        title="Pulihkan Pengaturan Suara?"
        size="sm"
        animation="scale-in"
        closeOnBackdropClick={true}
        closeOnEscape={true}
        showCloseButton={false}
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Pengaturan suara akan dikembalikan ke nilai dari backup: {backupDate}. Pengaturan saat ini akan ditimpa.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowRestoreConfirmation(false)} fullWidth>
              Batal
            </Button>
            <Button variant="info" onClick={handleRestore} fullWidth>
              Pulihkan
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default VoiceSettings;
