import React, { useState, useEffect, useCallback } from 'react';
import { useVoiceSynthesis } from '../hooks/useVoiceSynthesis';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { CloseIcon } from './icons/CloseIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { STORAGE_KEYS } from '../constants';
import type { VoiceLanguage, SpeechSynthesisVoice } from '../types';
import { logger } from '../utils/logger';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
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

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isOpen, onClose }) => {
  const recognition = useVoiceRecognition();
  const synthesis = useVoiceSynthesis();

  const [language, setLanguage] = useState<VoiceLanguage>('id-ID');
  const [continuous, setContinuous] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [autoReadAI, setAutoReadAI] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <SpeakerWaveIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pengaturan Suara</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Tutup pengaturan"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {recognition.isSupported && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Suara</h3>

              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Bahasa</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as VoiceLanguage)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="id-ID">Bahasa Indonesia</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Mode berkelanjutan</label>
                <button
                  onClick={() => {
                    const newValue = !continuous;
                    setContinuous(newValue);
                    recognition.setContinuous(newValue);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    continuous ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={continuous}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      continuous ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {synthesis.isSupported && synthesis.voices.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Suara</h3>

              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Kecepatan Bicara ({rate.toFixed(1)}x)</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                  aria-label="Kecepatan bicara"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Nada ({pitch.toFixed(1)})</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                  aria-label="Nada bicara"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Volume ({Math.round(volume * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"
                  aria-label="Volume"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Suara</label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = synthesis.voices.find((v) => v.name === e.target.value);
                    if (voice) {
                      handleVoiceChange(voice);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {synthesis.voices
                    .filter((v) => v.lang.startsWith(language === 'id-ID' ? 'id' : 'en'))
                    .map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                        {voice.default && ' - Default'}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={testVoice}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <SpeakerWaveIcon className="w-4 h-4" />
                Tes Suara
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Baca Pesan AI</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Secara otomatis membaca respon AI
                </p>
              </div>
              <button
                onClick={() => setAutoReadAI(!autoReadAI)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoReadAI ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={autoReadAI}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoReadAI ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
