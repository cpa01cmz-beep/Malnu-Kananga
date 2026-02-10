import React, { useState, useEffect } from 'react';
import { UI_DELAYS } from '../../constants';

interface FormProgressProps {
  totalSteps: number;
  currentStep: number;
  completed?: boolean;
  className?: string;
  showLabels?: boolean;
  stepLabels?: string[];
}

const FormProgress: React.FC<FormProgressProps> = ({
  totalSteps,
  currentStep,
  completed = false,
  className = '',
  showLabels = false,
  stepLabels = [],
}) => {
  const [animateProgress, setAnimateProgress] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimateProgress(true), UI_DELAYS.DEBOUNCE_SHORT);
    return () => clearTimeout(timer);
  }, []);

  const progressPercentage = completed ? 100 : ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out ${
              animateProgress ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="h-full bg-white/20 animate-shimmer" />
          </div>
        </div>
        
        {/* Step indicators */}
        <div className="absolute inset-0 flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = completed || stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const _isUpcoming = stepNumber > currentStep;

            return (
              <div
                key={stepNumber}
                className="relative group"
                style={{ left: `${(index / (totalSteps - 1)) * 100}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 transition-all duration-300 transform
                    ${isCompleted 
                      ? 'bg-primary-500 border-primary-500 scale-110 shadow-lg' 
                      : isCurrent 
                      ? 'bg-white dark:bg-neutral-800 border-primary-500 scale-125 shadow-md animate-pulse' 
                      : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600'
                    }
                  `}
                >
                  {isCompleted && (
                    <svg className="w-full h-full text-white animate-scale-in" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Tooltip */}
                {showLabels && stepLabels[index] && (
                  <div className={`
                    absolute bottom-full mb-2 px-2 py-1 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                    ${index > totalSteps / 2 ? 'right-0' : 'left-0'}
                    ${index === 0 ? 'left-0' : index === totalSteps - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                  `}>
                    {stepLabels[index]}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-neutral-900 dark:border-t-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step labels below */}
      {showLabels && stepLabels.length > 0 && (
        <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
          {stepLabels.map((label, index) => (
            <div 
              key={index} 
              className={`
                text-center font-medium
                ${index + 1 < currentStep ? 'text-primary-600 dark:text-primary-400' : 
                  index + 1 === currentStep ? 'text-primary-700 dark:text-primary-300 font-semibold' : 
                  'text-neutral-500 dark:text-neutral-500'}
              `}
              style={{ flex: 1 }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormProgress;