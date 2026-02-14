import { useState, useEffect, ChangeEvent } from 'react';
import QRCode from 'qrcode';
import { totpService } from '../../services/totpService';
import Button from './Button';
import Input from './Input';

interface TwoFactorSetupProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function TwoFactorSetup({ userId, userEmail, onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'loading' | 'scan' | 'verify' | 'backup'>('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initSetup = async () => {
      try {
        const setup = await totpService.setupTwoFactor(userId, userEmail);
        const qrDataUrl = await QRCode.toDataURL(setup.qrCodeUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);
        setBackupCodes(setup.backupCodes);
        setStep('scan');
      } catch {
        setError('Failed to initialize 2FA setup');
      }
    };
    initSetup();
  }, [userId, userEmail]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pendingKey = 'malnu_2fa_pending_setup';
      const pendingData = JSON.parse(localStorage.getItem(pendingKey) || '{}');
      const success = await totpService.confirmTwoFactor(userId, pendingData.secret, verificationCode);
      
      if (success) {
        setStep('backup');
      } else {
        setError('Invalid verification code');
      }
    } catch {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Preparing 2FA setup...</p>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4">Backup Codes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <code key={index} className="text-sm font-mono bg-white px-2 py-1 rounded border">
                {code}
              </code>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleComplete} className="flex-1">
            I've Saved My Codes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Set Up Two-Factor Authentication</h3>
      
      {step === 'scan' && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          <div className="flex justify-center mb-6">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="border rounded-lg" 
                loading="eager"
                decoding="async"
                width={200}
                height={200}
              />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">{userId.slice(0, 16)}</code>
          </p>
          <Button onClick={() => setStep('verify')} className="w-full">
            Next: Verify Code
          </Button>
        </>
      )}

      {step === 'verify' && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Enter the 6-digit code from your authenticator app to verify the setup
          </p>
          <Input
            type="text"
            value={verificationCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono mb-4"
          />
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('scan')} className="flex-1">
              Back
            </Button>
            <Button onClick={handleVerify} disabled={loading || verificationCode.length !== 6} className="flex-1">
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </>
      )}

      <button type="button" onClick={onCancel} className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center" aria-label="Batalkan pengaturan autentikasi dua faktor">
        Cancel
      </button>
    </div>
  );
}

interface TwoFactorDisableProps {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function TwoFactorDisable({ userId, onComplete, onCancel }: TwoFactorDisableProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await totpService.disableTwoFactor(userId, verificationCode);
      
      if (success) {
        onComplete();
      } else {
        setError('Invalid verification code');
      }
    } catch {
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Disable Two-Factor Authentication</h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter a code from your authenticator app to confirm disabling 2FA
      </p>
      <Input
        type="text"
        value={verificationCode}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        className="text-center text-2xl tracking-widest font-mono mb-4"
      />
      {error && (
        <p className="text-red-600 text-sm mb-4">{error}</p>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDisable} disabled={loading || verificationCode.length !== 6} className="flex-1">
          {loading ? 'Disabling...' : 'Disable 2FA'}
        </Button>
      </div>
    </div>
  );
}

interface TwoFactorStatusProps {
  userId: string;
  onEnable: () => void;
  onDisable: () => void;
}

export function TwoFactorStatus({ userId, onEnable, onDisable }: TwoFactorStatusProps) {
  const [enabled, setEnabled] = useState(false);
  const [remainingCodes, setRemainingCodes] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      setEnabled(totpService.isTwoFactorEnabled(userId));
      setRemainingCodes(totpService.getRemainingBackupCodes(userId));
    };
    checkStatus();
  }, [userId]);

  if (enabled) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-green-800">Two-Factor Authentication Enabled</p>
            <p className="text-sm text-green-600">{remainingCodes} backup codes remaining</p>
          </div>
          <Button variant="secondary" size="sm" onClick={onDisable}>
            Manage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-800">Two-Factor Authentication</p>
          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
        </div>
        <Button size="sm" onClick={onEnable}>
          Enable
        </Button>
      </div>
    </div>
  );
}
