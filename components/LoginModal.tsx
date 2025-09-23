import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState(''); // State untuk pesan error

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setFormState('idle');
            setEmail('');
            setError(''); // Reset error juga
        }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email) return;

      setFormState('loading');
      setError(''); // Hapus error lama saat submit baru

      try {
        // --- GANTI URL INI DENGAN URL WORKER ANDA ---
        const response = await fetch('https://malnu-api.<NAMA_SUBDOMAIN_ANDA>.workers.dev/request-login-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (!response.ok) {
            // Jika backend mengembalikan error (misal: 403 Forbidden untuk email tidak terdaftar)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengirim link.');
        }

        console.log('Magic Link request submitted for:', email);
        setFormState('success');

      } catch (err: any) {
        setFormState('idle');
        setError(err.message); // Tampilkan pesan error dari backend
      }
  }

  const handleCompleteLogin = () => {
    // Di aplikasi nyata, halaman akan refresh setelah redirect dari magic link,
    // dan status login akan terdeteksi dari cookie. Simulasi ini untuk UI.
    onLoginSuccess();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login / Daftar</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Tutup modal"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-6">
          {formState === 'success' ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Link Terkirim!</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Silakan periksa inbox email Anda di <strong>{email}</strong> untuk melanjutkan proses login.
              </p>
              <button
                onClick={handleCompleteLogin}
                className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Selesai
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Alamat Email Terdaftar
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="anda@email.com"
                  />
                </div>
              </div>
              
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {formState === 'loading' ? 'Memeriksa...' : 'Kirim Link Login'}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                Hanya email yang terdaftar yang dapat menerima link login. Hubungi admin jika Anda mengalami masalah.
              </p>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
