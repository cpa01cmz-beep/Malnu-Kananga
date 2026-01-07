import React from 'react';
import Button from './ui/Button';

interface AccessDeniedProps {
  onBack?: () => void;
  message?: string;
  requiredPermission?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onBack, message, requiredPermission }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-2">
          Access Denied
        </h2>

        <p className="text-neutral-600 dark:text-neutral-400 text-center mb-4">
          {message || 'You do not have permission to access this feature.'}
        </p>

        {requiredPermission && (
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded p-3 mb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Required permission: <span className="font-mono text-xs">{requiredPermission}</span>
            </p>
          </div>
        )}

        {onBack && (
          <Button variant="info" onClick={onBack} fullWidth>
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccessDenied;