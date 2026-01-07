import React, { useState, useEffect } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { logger } from '../utils/logger';
import Button from './ui/Button';

interface MicrophonePermissionHandlerProps {
  onPermissionGranted: () => void;
  onFallbackToText: () => void;
  className?: string;
}

const MicrophonePermissionHandler: React.FC<MicrophonePermissionHandlerProps> = ({
  onPermissionGranted,
  onFallbackToText,
  className = '',
}) => {
  const { isSupported, startRecording } = useVoiceRecognition();
  const [isRequesting, setIsRequesting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<{
    name: string;
    isChrome: boolean;
    isFirefox: boolean;
    isSafari: boolean;
    isEdge: boolean;
  } | null>(null);

  useEffect(() => {
    const getBrowserInfo = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
      const isFirefox = /firefox/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isEdge = /edg/.test(userAgent);
      
      let name = 'Browser';
      if (isChrome) name = 'Chrome';
      else if (isFirefox) name = 'Firefox';
      else if (isSafari) name = 'Safari';
      else if (isEdge) name = 'Edge';

      setBrowserInfo({ name, isChrome, isFirefox, isSafari, isEdge });
    };

    getBrowserInfo();
  }, []);

  const handleRequestPermission = async () => {
    if (!isSupported || isRequesting) return;

    setIsRequesting(true);

    try {
      // Try to trigger permission by starting recording
      await startRecording();
      onPermissionGranted();
    } catch (error) {
      logger.error('Permission request failed:', error);
      setShowInstructions(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const getBrowserSpecificInstructions = () => {
    if (!browserInfo) return null;

    if (browserInfo.isChrome || browserInfo.isEdge) {
      return (
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Lihat ikon gembok (🔒) di address bar sebelah kanan</li>
          <li>Klik ikon gembok tersebut</li>
          <li>Cari "Mikrofon" di menu dropdown</li>
          <li>Ubah pengaturan menjadi "Izinkan"</li>
          <li>Refresh halaman dan coba lagi</li>
        </ol>
      );
    } else if (browserInfo.isFirefox) {
      return (
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Lihat ikon gembok (🔒) di address bar sebelah kiri</li>
          <li>Klik ikon gembok tersebut</li>
          <li>Temukan "Menggunakan Mikrofon" di menu</li>
          <li>Pilih "Izinkan" dari dropdown</li>
          <li>Refresh halaman dan coba lagi</li>
        </ol>
      );
    } else if (browserInfo.isSafari) {
      return (
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Klik "Safari" di menu bar</li>
          <li>Pilih "Preferensi" atau "Settings"</li>
          <li>Pergi ke tab "Situs Web" atau "Websites"</li>
          <li>Pilih "Mikrofon" dari sidebar kiri</li>
          <li>Cari situs ini dan ubah menjadi "Izinkan"</li>
          <li>Refresh halaman dan coba lagi</li>
        </ol>
      );
    }

    return null;
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 dark:text-yellow-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Browser Tidak Mendukung
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Browser Anda tidak mendukung pengenalan suara. Silakan gunakan Chrome, Edge, Firefox, atau Safari versi terbaru.
            </p>
            <Button
              variant="warning"
              size="sm"
              onClick={onFallbackToText}
            >
              Gunakan Input Teks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-blue-600 dark:text-blue-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
            Izinkan Akses Mikrofon
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Untuk menggunakan fitur input suara, kami perlu izin untuk mengakses mikrofon Anda.
          </p>
          
          {!showInstructions ? (
            <div className="flex gap-2">
              <Button
                variant="info"
                size="sm"
                onClick={handleRequestPermission}
                isLoading={isRequesting}
                disabled={isRequesting}
              >
                {isRequesting ? 'Meminta Izin...' : 'Izinkan Mikrofon'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFallbackToText}
              >
                Lewati
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {browserInfo && (
                <div className="bg-white dark:bg-neutral-800 rounded p-3 border border-blue-200 dark:border-blue-700">
                  <p className="font-medium text-sm text-neutral-800 dark:text-neutral-200 mb-2">
                    Panduan untuk {browserInfo.name}:
                  </p>
                  {getBrowserSpecificInstructions()}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => {
                    setShowInstructions(false);
                    handleRequestPermission();
                  }}
                >
                  Coba Lagi
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFallbackToText}
                >
                  Gunakan Teks
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrophonePermissionHandler;