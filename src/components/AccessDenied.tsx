import React from 'react';

interface AccessDeniedProps {
  onBack?: () => void;
  message?: string;
  requiredPermission?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onBack, message, requiredPermission }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          Access Denied
        </h2>
        
        <p className="text-gray-600 text-center mb-4">
          {message || 'You do not have permission to access this feature.'}
        </p>

        {requiredPermission && (
          <div className="bg-gray-100 rounded p-3 mb-4">
            <p className="text-sm text-gray-600">
              Required permission: <span className="font-mono text-xs">{requiredPermission}</span>
            </p>
          </div>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default AccessDenied;