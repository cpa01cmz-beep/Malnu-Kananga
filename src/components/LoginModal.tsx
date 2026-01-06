
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { UserRole, UserExtraRole } from '../types';
import { api } from '../services/apiService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, extraRole?: UserExtraRole) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setFormState('idle');
            setEmail('');
            setPassword('');
            setError('');
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
      if (!email || !password) return;

      setFormState('loading');
      setError('');

      try {
        const response = await api.auth.login(email, password);

        if (response.success && response.data) {
          const user = response.data.user;
          onLoginSuccess(user.role as UserRole, user.extraRole as UserExtraRole);
          setFormState('success');
        } else {
          throw new Error(response.message || 'Login gagal');
        }

      } catch (err: { message?: string } | unknown) {
        setFormState('idle');
        setError(err instanceof Error ? err.message : 'Gagal login.');
      }
  }

  // Simulation Login Handler with Extra Roles
  const handleSimulatedLogin = (role: UserRole, extraRole: UserExtraRole = null) => {
      onLoginSuccess(role, extraRole);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-scale-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Tutup modal"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
            {/* DEMO SECTION */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
                <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2 uppercase tracking-wide">Mode Simulasi (Demo)</h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                    Pilih peran untuk login instan:
                </p>

                {/* Standard Roles */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                    <button onClick={() => handleSimulatedLogin('student')} className="px-2 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-card text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        Siswa
                    </button>
                    <button onClick={() => handleSimulatedLogin('teacher')} className="px-2 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-card text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        Guru
                    </button>
                    <button onClick={() => handleSimulatedLogin('admin')} className="px-2 py-2 bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 rounded-card text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors">
                        Admin
                    </button>
                </div>

                {/* Extra Roles */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => handleSimulatedLogin('teacher', 'staff')}
                        className="px-2 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-card text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                        Guru (Staff)
                    </button>
                    <button
                        onClick={() => handleSimulatedLogin('student', 'osis')}
                        className="px-2 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 rounded-card text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                    >
                        Siswa (OSIS)
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-2 bg-white dark:bg-neutral-800 text-xs text-neutral-500 uppercase">Atau Login Email (Produksi)</span>
                </div>
            </div>

          {formState === 'success' ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-pill bg-primary-100 dark:bg-primary-900/50">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-neutral-900 dark:text-white">Login Berhasil!</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Anda akan diarahkan ke dashboard...
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-pill shadow-card text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                Selesai
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Alamat Email Terdaftar</label>
                <div className="mt-1">
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-card bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" placeholder="anda@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
                <div className="mt-1">
                  <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-card bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors" placeholder="Masukkan password" />
                </div>
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
              <div>
                <button type="submit" disabled={formState === 'loading'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-pill shadow-card text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 transition-all duration-200">
                  {formState === 'loading' ? 'Memproses...' : 'Login'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
