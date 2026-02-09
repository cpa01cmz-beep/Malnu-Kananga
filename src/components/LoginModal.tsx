
import React, { useState, useEffect } from 'react';
import { UserRole, UserExtraRole } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import IconButton from './ui/IconButton';
import ForgotPassword from './ForgotPassword';
import { api } from '../services/apiService';
import { getGradientClass } from '../config/gradients';
import Modal from './ui/Modal';
import { HEIGHT_CLASSES } from '../config/heights';
import {
  validateEmailRealtime,
  validatePasswordRealtime,
  validateLoginForm,
  classifyLoginError,
  announceValidation,
  getPasswordRequirements
} from '../utils/validation';
import { TIMEOUT_CONFIG, LOGIN_UI_STRINGS } from '../constants';

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, extraRole?: UserExtraRole) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setFormState('idle');
            setEmail('');
            setPassword('');
            setShowPassword(false);
            setError('');
            setEmailError('');
            setPasswordError('');
            setShowPasswordRequirements(false);
            setTouchedFields({ email: false, password: false });
            setShowForgotPassword(false);
        }, TIMEOUT_CONFIG.UI_ANIMATION_DURATION);
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
        setError(LOGIN_UI_STRINGS.VALIDATION_ERROR);
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
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Login"
      size="md"
      animation="scale-in"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      showCloseButton={true}
      className={HEIGHT_CLASSES.MODAL.FULL}
    >
      <div className="overflow-y-auto">
            <div className={`mb-8 p-6 ${getGradientClass('NEUTRAL')} dark:from-neutral-900/60 dark:to-neutral-800/60 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 backdrop-blur-sm`}>
                 <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2.5 tracking-tight">
                     <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                     Login Cepat (Demo)
                 </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 leading-relaxed">
                    Pilih peran untuk login instan:
                </p>

                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                       <Button variant="secondary" size="md" onClick={() => handleSimulatedLogin('student')} className="mobile-touch-target">
                          Siswa
                       </Button>
                       <Button variant="secondary" size="md" onClick={() => handleSimulatedLogin('teacher')} className="mobile-touch-target">
                          Guru
                       </Button>
                       <Button variant="primary" size="md" onClick={() => handleSimulatedLogin('admin')} className="mobile-touch-target">
                          Admin
                       </Button>
                  </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <Button variant="info" size="md" onClick={() => handleSimulatedLogin('teacher', 'staff')} className="mobile-touch-target">
                          Guru (Staff)
                       </Button>
                       <Button variant="warning" size="md" onClick={() => handleSimulatedLogin('student', 'osis')} className="mobile-touch-target">
                          Siswa (OSIS)
                       </Button>
                  </div>
            </div>

              <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-neutral-200/60 dark:border-neutral-700/60"></div>
                  </div>
                  <div className="relative flex justify-center">
                      <span className="px-6 py-2 bg-white dark:bg-neutral-800 text-sm text-neutral-500 font-semibold rounded-full border border-neutral-200/60 dark:border-neutral-700/60 shadow-sm">atau</span>
                  </div>
              </div>

           {formState === 'success' ? (
              <div className="text-center py-10">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/50 shadow-lg">
                    <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                 <h3 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Login Berhasil!</h3>
                 <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                   Anda akan diarahkan ke dashboard...
                 </p>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={onClose}
                      className="mt-8 mobile-touch-target"
                    >
                      Selesai
                   </Button>
              </div>
                 ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                   <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
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
                        className="pr-12"
                        aria-describedby={passwordError ? 'password-error' : password && showPasswordRequirements ? 'password-requirements' : ''}
                      />
                      <IconButton
                        icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        ariaLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[2.1rem] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      />
                    </div>

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
                   <Button type="submit" disabled={formState === 'loading'} isLoading={formState === 'loading'} fullWidth size="lg" className="mobile-touch-target">
                     {formState === 'loading' ? '' : 'Login'}
                   </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
                    >
                      Lupa Password?
                    </button>
                  </div>
                </form>
             )}
         </div>
    </Modal>

    <ForgotPassword
      isOpen={showForgotPassword}
      onClose={() => setShowForgotPassword(false)}
      onSuccess={(resetEmail) => {
        setShowForgotPassword(false);
        setEmail(resetEmail);
        setTouchedFields({ email: true, password: false });
      }}
    />
    </>
  );
};

export default LoginModal;
