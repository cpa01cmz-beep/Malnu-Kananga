
import React, { useState, useEffect } from 'react';
import { UserRole, UserExtraRole } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import { api } from '../services/apiService';
import { getGradientClass } from '../config/gradients';
import Modal from './ui/Modal';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Login"
      size="md"
      animation="scale-in"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      showCloseButton={true}
      className="max-h-[90vh]"
    >
      <div className="overflow-y-auto">
            <div className={`mb-6 p-5 ${getGradientClass('NEUTRAL')} dark:from-neutral-900/60 dark:to-neutral-800/60 rounded-xl border border-neutral-200/70 dark:border-neutral-700/70`}>
                 <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5 flex items-center gap-2">
                     <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                     Login Cepat (Demo)
                 </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Pilih peran untuk login instan:
                </p>

                     <div className="grid grid-cols-3 gap-2.5">
                       <Button variant="secondary" size="md" onClick={() => handleSimulatedLogin('student')}>
                          Siswa
                       </Button>
                       <Button variant="secondary" size="md" onClick={() => handleSimulatedLogin('teacher')}>
                          Guru
                       </Button>
                       <Button variant="indigo" size="md" onClick={() => handleSimulatedLogin('admin')}>
                          Admin
                       </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                       <Button variant="info" size="md" onClick={() => handleSimulatedLogin('teacher', 'staff')}>
                          Guru (Staff)
                       </Button>
                       <Button variant="warning" size="md" onClick={() => handleSimulatedLogin('student', 'osis')}>
                          Siswa (OSIS)
                       </Button>
                  </div>
            </div>

              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-neutral-200 dark:border-neutral-700/60"></div>
                  </div>
                  <div className="relative flex justify-center">
                      <span className="px-4 py-1.5 bg-white dark:bg-neutral-800 text-sm text-neutral-500 font-semibold rounded-full border border-neutral-200 dark:border-neutral-700">atau</span>
                  </div>
              </div>

           {formState === 'success' ? (
             <div className="text-center py-8">
               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-xl bg-primary-100 dark:bg-primary-900/50 shadow-md">
                   <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                   </svg>
               </div>
                <h3 className="mt-5 text-2xl font-semibold text-neutral-900 dark:text-white">Login Berhasil!</h3>
                <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Anda akan diarahkan ke dashboard...
                </p>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={onClose}
                      className="mt-6 py-3.5"
                    >
                      Selesai
                   </Button>
             </div>
                ) : (
                 <form onSubmit={handleSubmit} className="space-y-5">
                   {error && (
                     <Alert variant="error" size="md" border="left">
                       {error}
                     </Alert>
                   )}
                  <Input
                    id="email"
                    type="email"
                    label="Alamat Email Terdaftar"
                    placeholder="anda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                  />
                  <Input
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                  />
                 <Button type="submit" disabled={formState === 'loading'} isLoading={formState === 'loading'} fullWidth className="py-3.5">
                   {formState === 'loading' ? '' : 'Login'}
                 </Button>
               </form>
            )}
        </div>
    </Modal>
  );
};

export default LoginModal;
