
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
      className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-xl shadow-card-hover w-full max-w-md m-4 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in flex flex-col max-h-[90vh] border border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-200/90 dark:border-neutral-700">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Login</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
            aria-label="Tutup modal"
          >
            <CloseIcon />
          </button>
        </div>

         <div className="p-6 overflow-y-auto">
            <div className="mb-6 p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200/90 dark:border-neutral-700">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Login Cepat (Demo)
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                    Pilih peran untuk login instan:
                </p>

                 <div className="grid grid-cols-3 gap-2.5">
                    <button onClick={() => handleSimulatedLogin('student')} className="px-3 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95 shadow-subtle hover:shadow-md">
                        Siswa
                    </button>
                    <button onClick={() => handleSimulatedLogin('teacher')} className="px-3 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95 shadow-subtle hover:shadow-md">
                        Guru
                    </button>
                    <button onClick={() => handleSimulatedLogin('admin')} className="px-3 py-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95 shadow-subtle hover:shadow-md">
                        Admin
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    <button
                        onClick={() => handleSimulatedLogin('teacher', 'staff')}
                        className="px-3 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95 shadow-subtle hover:shadow-md"
                    >
                        Guru (Staff)
                    </button>
                    <button
                        onClick={() => handleSimulatedLogin('student', 'osis')}
                        className="px-3 py-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95 shadow-subtle hover:shadow-md"
                    >
                        Siswa (OSIS)
                    </button>
                </div>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-2 bg-white dark:bg-neutral-800 text-xs text-neutral-500 font-medium">atau</span>
                </div>
            </div>

          {formState === 'success' ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-xl bg-primary-100 dark:bg-primary-900/50 shadow-md">
                  <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-neutral-900 dark:text-white">Login Berhasil!</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Anda akan diarahkan ke dashboard...
              </p>
               <button
                 onClick={onClose}
                 className="mt-6 w-full flex justify-center py-3 px-5 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/50 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 hover:-translate-y-0.5"
               >
                 Selesai
               </button>
            </div>
              ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                 <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Alamat Email Terdaftar</label>
                 <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 ease-out font-medium placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500" placeholder="anda@email.com" />
              </div>
              <div>
                 <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Password</label>
                 <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 ease-out font-medium placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500" placeholder="Masukkan password" />
              </div>
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 text-center font-medium">{error}</div>}
               <div>
                 <button type="submit" disabled={formState === 'loading'} className="w-full flex justify-center py-3 px-5 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/50 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-70 shadow-md hover:shadow-lg active:scale-95 hover:-translate-y-0.5">
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
