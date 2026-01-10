import React, { useEffect, useRef } from 'react';
import Card from './ui/Card';
import Alert from './ui/Alert';
import Button from './ui/Button';

interface AccessDeniedProps {
  onBack?: () => void;
  message?: string;
  requiredPermission?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onBack, message, requiredPermission }) => {
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (onBack && backButtonRef.current) {
      backButtonRef.current.focus();
    }
  }, [onBack]);

  return (
    <main
      role="main"
      className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4"
    >
      <Card variant="default" padding="lg" className="max-w-md w-full">
        <Alert
          variant="error"
          size="lg"
          border="left"
          centered
          showCloseButton={false}
          className="mb-4"
        >
          <svg
            className="w-full h-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </Alert>

        <h2 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-2">
          Access Denied
        </h2>

        <p className="text-neutral-600 dark:text-neutral-400 text-center mb-4">
          {message || 'You do not have permission to access this feature.'}
        </p>

        {requiredPermission && (
          <Alert
            variant="neutral"
            size="sm"
            border="left"
            className="mb-4"
          >
            <span className="text-neutral-600 dark:text-neutral-400">
              Required permission:{' '}
              <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                {requiredPermission}
              </code>
            </span>
          </Alert>
        )}

        {onBack && (
          <Button
            ref={backButtonRef}
            variant="info"
            onClick={onBack}
            fullWidth
          >
            Go Back
          </Button>
        )}
      </Card>
    </main>
  );
};

export default AccessDenied;