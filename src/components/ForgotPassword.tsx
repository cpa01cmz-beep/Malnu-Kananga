import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import Modal from './ui/Modal';
import { api } from '../services/apiService';
import { validateEmailRealtime } from '../utils/validation';
import { logger } from '../utils/logger';

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormState('idle');
        setEmail('');
        setEmailError('');
        setError('');
        setTouchedEmail(false);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (touchedEmail && email) {
      const validation = validateEmailRealtime(email);
      setEmailError(validation.isValid ? '' : validation.errors[0] || '');
    }
  }, [email, touchedEmail]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouchedEmail(true);

    if (!email || emailError) {
      setError('Masukkan email yang valid');
      return;
    }

    setFormState('loading');
    setError('');

    try {
      const response = await api.auth.forgotPassword(email);

      if (response.success) {
        setFormState('success');
        logger.info('Password reset email sent to:', email);
        onSuccess(email);
      } else {
        setError(response.message || 'Gagal mengirim email reset password');
        setFormState('idle');
      }
    } catch (err: unknown) {
      setFormState('idle');
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirim email reset password';
      logger.error('Forgot password error:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lupa Password"
      size="md"
      animation="scale-in"
      closeOnBackdropClick={true}
      closeOnEscape={true}
      showCloseButton={formState !== 'loading'}
    >
      <div className="overflow-y-auto">
        {formState === 'success' ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-xl bg-green-100 dark:bg-green-900/50 shadow-md mb-5">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-3">
              Email Terkirim!
            </h3>
            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-2">
              Kami telah mengirimkan link reset password ke:
            </p>
            <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
              {email}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-6">
              Link ini hanya berlaku selama 1 jam.
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onClose}
              className="py-3.5"
            >
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="error" size="md" border="left">
                {error}
              </Alert>
            )}

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                  <p className="font-medium mb-1">Instruksi:</p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                    <li>Masukkan email yang terdaftar</li>
                    <li>Cek inbox Anda untuk link reset</li>
                    <li>Link berlaku selama 1 jam</li>
                  </ul>
                </div>
              </div>
            </div>

            <Input
              id="email"
              type="email"
              label="Alamat Email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouchedEmail(true)}
              errorText={touchedEmail ? emailError : undefined}
              helperText={touchedEmail && !emailError ? 'Format email valid' : undefined}
              state={touchedEmail ? (emailError ? 'error' : 'success') : 'default'}
              required
              fullWidth
              autoFocus
            />

            <Button
              type="submit"
              disabled={formState === 'loading' || !!emailError}
              isLoading={formState === 'loading'}
              fullWidth
              className="py-3.5"
            >
              {formState === 'loading' ? 'Mengirim...' : 'Kirim Link Reset Password'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Kembali ke Login
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPassword;
