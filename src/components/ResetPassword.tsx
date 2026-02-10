import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import IconButton from './ui/IconButton';
import { api } from '../services/apiService';
import { validatePasswordRealtime, getPasswordRequirements } from '../utils/validation';
import { logger } from '../utils/logger';
import { COMPONENT_TIMEOUTS } from '../constants';

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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formState, setFormState] = useState<'idle' | 'validating' | 'loading' | 'success' | 'error'>('validating');
  const [error, setError] = useState('');
  const [touchedFields, setTouchedFields] = useState({
    password: false,
    confirmPassword: false
  });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setFormState('error');
        setError('Token reset password tidak ditemukan');
        return;
      }
      
      try {
        const response = await api.auth.verifyResetToken(token);
        if (response.success && (response.data as { valid: boolean })?.valid) {
          setFormState('idle');
        } else {
          setFormState('error');
          setError(response.message || 'Token tidak valid atau kadaluarsa');
        }
      } catch (err: unknown) {
        setFormState('error');
        const errorMessage = err instanceof Error ? err.message : 'Token tidak valid atau kadaluarsa';
        setError(errorMessage);
        logger.error('Token validation error:', errorMessage);
      }
    };

    validateToken();
  }, [token]);

  useEffect(() => {
    if (touchedFields.password && password) {
      const validation = validatePasswordRealtime(password);
      setPasswordError(validation.isValid ? '' : validation.errors[0] || '');
    }
  }, [password, touchedFields.password]);

  useEffect(() => {
    if (touchedFields.confirmPassword && confirmPassword) {
      setConfirmPasswordError(
        confirmPassword === password ? '' : 'Password tidak cocok'
      );
    }
  }, [confirmPassword, password, touchedFields.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouchedFields({ password: true, confirmPassword: true });

    if (!password || passwordError) {
      setError('Password tidak memenuhi persyaratan');
      return;
    }

    if (!confirmPassword || confirmPasswordError) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setFormState('loading');
    setError('');

    try {
      const response = await api.auth.resetPassword(token || '', password);

      if (response.success) {
        setFormState('success');
        logger.info('Password reset successful for token:', token);
      } else {
        setError(response.message || 'Gagal mereset password');
        setFormState('idle');
      }
    } catch (err: unknown) {
      setFormState('idle');
      const errorMessage = err instanceof Error ? err.message : 'Gagal mereset password';
      logger.error('Reset password error:', errorMessage);
      setError(errorMessage);
    }
  };

  if (formState === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 mb-6"></div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Memvalidasi Token...
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Mohon tunggu sebentar
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (formState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                Token Tidak Valid
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {error || 'Token reset password tidak valid atau telah kadaluarsa.'}
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => window.location.href = '/login'}
              >
                Kembali ke Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
          {formState === 'success' ? (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                Password Berhasil Diubah!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Password Anda telah berhasil direset. Silakan login dengan password baru.
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => window.location.href = '/login'}
              >
                Login Sekarang
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Masukkan password baru Anda
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="error" size="md" border="left">
                    {error}
                  </Alert>
                )}

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password Baru"
                    placeholder="Masukkan password baru"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowPasswordRequirements(true)}
                    onBlur={() => {
                      setTouchedFields(prev => ({ ...prev, password: true }));
                      setTimeout(() => setShowPasswordRequirements(false), COMPONENT_TIMEOUTS.PASSWORD_REQUIREMENTS_HIDE);
                    }}
                    errorText={touchedFields.password ? passwordError : undefined}
                    state={touchedFields.password ? (passwordError ? 'error' : 'success') : 'default'}
                    required
                    fullWidth
                    className="pr-12"
                  />
                  <IconButton
                    icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    ariaLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[2.1rem] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  />
                </div>

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

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Konfirmasi Password"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, confirmPassword: true }))}
                    errorText={touchedFields.confirmPassword ? confirmPasswordError : undefined}
                    state={touchedFields.confirmPassword ? (confirmPasswordError ? 'error' : 'success') : 'default'}
                    required
                    fullWidth
                    className="pr-12"
                  />
                  <IconButton
                    icon={showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    ariaLabel={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[2.1rem] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={formState === 'loading' || !!passwordError || !!confirmPasswordError || !password || !confirmPassword}
                  isLoading={formState === 'loading'}
                  fullWidth
                  className="py-3.5"
                >
                  {formState === 'loading' ? 'Memproses...' : 'Reset Password'}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/login'}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  >
                    Kembali ke Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
