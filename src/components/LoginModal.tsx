
import React, { useState, useEffect } from 'react';
import { UserRole, UserExtraRole } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import { api } from '../services/apiService';
import { getGradientClass } from '../config/gradients';
import Modal from './ui/Modal';
import { 
  validateEmailRealtime, 
  validatePasswordRealtime, 
  validateLoginForm, 
  classifyLoginError,
  announceValidation,
  getPasswordRequirements 
} from '../utils/validation';

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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false
  });

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setFormState('idle');
            setEmail('');
            setPassword('');
            setError('');
            setEmailError('');
            setPasswordError('');
            setShowPasswordRequirements(false);
            setTouchedFields({ email: false, password: false });
        }, 300);
    }
  }, [isOpen]);

  // Real-time email validation
  useEffect(() => {
    if (touchedFields.email && email) {
      const validation = validateEmailRealtime(email);
      setEmailError(validation.isValid ? '' : validation.errors[0] || '');
    }
  }, [email, touchedFields.email]);

  // Real-time password validation
  useEffect(() => {
    if (touchedFields.password && password) {
      const validation = validatePasswordRealtime(password);
      setPasswordError(validation.isValid ? '' : validation.errors[0] || '');
    }
  }, [password, touchedFields.password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // Mark all fields as touched for validation
      setTouchedFields({ email: true, password: true });
      
      // Validate form
      const validation = validateLoginForm(email, password);
      if (!validation.isValid) {
        setError('Periksa kembali data yang Anda masukkan');
        announceValidation('Form login belum lengkap atau tidak valid');
        return;
      }

      setFormState('loading');
      setError('');
      setEmailError('');
      setPasswordError('');

      try {
        const response = await api.auth.login(email, password);

        if (response.success && response.data) {
          const user = response.data.user;
          announceValidation('Login berhasil', 'success');
          onLoginSuccess(user.role as UserRole, user.extraRole as UserExtraRole);
          setFormState('success');
        } else {
          throw new Error(response.message || 'Login gagal');
        }

      } catch (err: unknown) {
        setFormState('idle');
        const userMessage = classifyLoginError(err);
        setError(userMessage);
        announceValidation(userMessage, 'error');
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
                     onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                     errorText={touchedFields.email ? emailError : undefined}
                     helperText={touchedFields.email && !emailError ? 'Format email valid' : undefined}
                     state={touchedFields.email ? (emailError ? 'error' : 'success') : 'default'}
                     required
                     fullWidth
                     aria-describedby={emailError ? 'email-error' : ''}
                   />
                   <Input
                     id="password"
                     type="password"
                     label="Password"
                     placeholder="Masukkan password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     onFocus={() => setShowPasswordRequirements(true)}
                     onBlur={() => {
                       setTouchedFields(prev => ({ ...prev, password: true }));
                       // Don't immediately hide requirements to give user time to reference them
                       setTimeout(() => setShowPasswordRequirements(false), 3000);
                     }}
                     errorText={touchedFields.password ? passwordError : undefined}
                     state={touchedFields.password ? (passwordError ? 'error' : 'success') : 'default'}
                     required
                     fullWidth
                     aria-describedby={passwordError ? 'password-error' : password && showPasswordRequirements ? 'password-requirements' : ''}
                   />
                   
                   {/* Password Requirements Helper */}
                   {password && showPasswordRequirements && (
                     <div 
                       id="password-requirements"
                       className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700"
                       role="status"
                       aria-live="polite"
                     >
                       <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                         Persyaratan Password:
                       </h4>
                       <ul className="space-y-1">
                         {getPasswordRequirements(password).map((req, index) => (
                           <li 
                             key={index}
                             className={`text-xs flex items-center gap-2 ${
                               req.status === 'met' 
                                 ? 'text-green-600 dark:text-green-400' 
                                 : 'text-neutral-500 dark:text-neutral-400'
                             }`}
                           >
                             <span className={req.status === 'met' ? '✓' : '○'}>
                               {req.requirement}
                             </span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {/* Network Error Distinction */}
                   {error && error.toLowerCase().includes('network') && (
                     <Alert variant="warning" size="sm" border="left" className="mt-3">
                       <div className="flex items-center gap-2">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                         </svg>
                         <span className="text-sm">
                           Periksa koneksi internet Anda dan coba lagi.
                         </span>
                       </div>
                     </Alert>
                   )}
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
