import React, { useState, useCallback, useEffect } from 'react';
import Button from '../ui/Button';
import { APP_CONFIG } from '../../constants';

/**
 * User Onboarding Flow Components
 * Comprehensive onboarding system for new users with step-by-step guidance
 */

interface OnboardingStep {
  id: string;
  title: string;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  skipable?: boolean;
  target?: string; // CSS selector for highlighting
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  className?: string;
  startOnMount?: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  onComplete,
  onSkip,
  showProgress = true,
  allowSkip = true,
  className = '',
  startOnMount = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(startOnMount);
  const [_completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep.id]));
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsActive(false);
      onComplete?.();
    }
  }, [currentStepIndex, currentStep.id, steps.length, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    onSkip?.();
  }, [onSkip]);

  const handleStart = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
  }, []);

  if (!isActive) {
    return (
      <div className={`text-center ${className}`}>
        <Button onClick={handleStart} variant="primary">
          Get Started
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Progress Bar */}
        {showProgress && (
          <div className="h-1 bg-neutral-200 dark:bg-neutral-700">
            <div 
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {currentStep.title}
            </h2>
            <div className="text-neutral-600 dark:text-neutral-400">
              {currentStep.content}
            </div>
          </div>
          
          {/* Action */}
          {currentStep.action && (
            <div className="mb-4">
              <Button
                onClick={currentStep.action.onClick}
                variant={currentStep.action.variant || 'primary'}
                className="w-full"
              >
                {currentStep.action.label}
              </Button>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              disabled={currentStepIndex === 0}
              className="text-sm"
            >
              Previous
            </Button>
            
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {currentStepIndex + 1} of {steps.length}
            </div>
            
            <div className="flex gap-2">
              {allowSkip && currentStep.skipable && (
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-sm"
                >
                  Skip
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                variant="primary"
                className="text-sm"
              >
                {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tooltip Tour Component
interface TooltipTourProps {
  steps: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

export const TooltipTour: React.FC<TooltipTourProps> = ({
  steps,
  onComplete,
  onSkip,
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isActive && currentStep.target) {
      const target = document.querySelector(currentStep.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 10,
          left: rect.left,
        });
      }
    }
  }, [isActive, currentStep.target]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsActive(false);
      onComplete?.();
    }
  }, [currentStepIndex, steps.length, onComplete]);

  const handleSkip = useCallback(() => {
    setIsActive(false);
    onSkip?.();
  }, [onSkip]);

  if (!isActive) return null;

  return (
    <div
      className={`absolute z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-4 max-w-sm ${className}`}
      style={{ top: position.top, left: position.left }}
    >
      <div className="mb-3">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          {currentStep.title}
        </h3>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {currentStep.content}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {currentStepIndex + 1} of {steps.length}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm"
          >
            Skip
          </Button>
          
          <Button
            onClick={handleNext}
            variant="primary"
            size="sm"
          >
            {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Feature Highlight Component
interface FeatureHighlightProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  title,
  description,
  icon,
  isCompleted = false,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
        ${isActive 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
        }
        ${isCompleted ? 'opacity-60' : ''}
      `}
      onClick={onClick}
    >
      {isCompleted && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isActive ? 'bg-primary-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
        }`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Interactive Tutorial Component
interface InteractiveTutorialProps {
  title: string;
  steps: OnboardingStep[];
  onComplete?: () => void;
  className?: string;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  title,
  steps,
  onComplete,
  className = '',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const _currentStep = steps[currentStepIndex];

  const handleStepComplete = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete?.();
    }
  }, [currentStepIndex, steps.length, onComplete]);

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
        {title}
      </h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <FeatureHighlight
            key={step.id}
            title={step.title}
            description={typeof step.content === 'string' ? step.content : ''}
            icon={<div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-bold">{index + 1}</div>}
            isCompleted={completedSteps.has(index)}
            isActive={index === currentStepIndex}
            onClick={index === currentStepIndex ? handleStepComplete : undefined}
          />
        ))}
      </div>
      
      {/* Progress */}
      <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>Progress</span>
          <span>{completedSteps.size} of {steps.length} completed</span>
        </div>
        
        <div className="mt-2 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Welcome Tour Component
export const WelcomeTour: React.FC<{
  userName?: string;
  onComplete?: () => void;
  className?: string;
}> = ({ userName = 'there', onComplete, className = '' }) => {
  const [step, setStep] = useState(0);
  
  const tourSteps = [
    {
      id: 'welcome',
      title: `Welcome to ${APP_CONFIG.SCHOOL_NAME}, ${userName}`,
      content: (
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            We're excited to have you here! This quick tour will help you get familiar with our school management system.
          </p>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">What you'll learn:</h4>
            <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
              <li>• Navigate the dashboard</li>
              <li>• Manage your profile</li>
              <li>• Access key features</li>
              <li>• Find help and support</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            The dashboard is your command center. Here you can see overview information, quick actions, and recent activity.
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Key Areas:</h4>
            <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
              <li>• Navigation menu</li>
              <li>• Quick stats</li>
              <li>• Recent updates</li>
              <li>• Action buttons</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'navigation',
      title: 'Easy Navigation',
      content: (
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Use the navigation menu to access different sections. On mobile, you can swipe to open the menu.
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Pro Tips:</h4>
            <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
              <li>• Use keyboard shortcuts (Ctrl+K for search)</li>
              <li>• Swipe gestures on mobile</li>
              <li>• Pin frequently used items</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'complete',
      title: "You're all set!",
      content: (
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Congratulations! You've completed the welcome tour. You're now ready to explore all the features of ${APP_CONFIG.SCHOOL_NAME}.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Next Steps:</h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Complete your profile</li>
              <li>• Explore the dashboard</li>
              <li>• Check out notifications</li>
              <li>• Invite colleagues</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-6 max-w-md w-full ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {tourSteps[step].title}
          </h2>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {step + 1}/{tourSteps.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((step + 1) / tourSteps.length) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="mb-6">
        {tourSteps[step].content}
      </div>
      
      <div className="flex gap-3">
        {step > 0 && (
          <Button
            onClick={() => setStep(step - 1)}
            variant="ghost"
            className="flex-1"
          >
            Previous
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          variant="primary"
          className="flex-1"
        >
          {step === tourSteps.length - 1 ? 'Get Started' : 'Next'}
        </Button>
        
        {step < tourSteps.length - 1 && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="text-sm"
          >
            Skip Tour
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;