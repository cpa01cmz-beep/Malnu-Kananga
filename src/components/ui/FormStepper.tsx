import React, { useState, useEffect } from 'react';
import Button from './Button';
import FormProgress from './FormProgress';
import FormFeedback from './FormFeedback';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '../icons/MaterialIcons';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  isValid?: boolean;
  isOptional?: boolean;
  validationMessage?: string;
}

export interface FormStepperProps {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onStepSubmit?: (step: number, data: Record<string, unknown>) => Promise<boolean> | boolean;
  onSubmit?: (data: Record<string, unknown>) => Promise<void> | void;
  onSubmitComplete?: () => void;
  submitButtonText?: string;
  submitButtonLoadingText?: string;
  showProgress?: boolean;
  allowSkip?: boolean;
  isLoading?: boolean;
  className?: string;
  validateOnStepChange?: boolean;
  showStepNumbers?: boolean;
  direction?: 'horizontal' | 'vertical';
}

const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  onStepSubmit,
  onSubmit,
  onSubmitComplete,
  submitButtonText = 'Submit',
  submitButtonLoadingText = 'Submitting...',
  showProgress = true,
  allowSkip = false,
  isLoading = false,
  className = '',
  validateOnStepChange = true,
  showStepNumbers = true,
  direction = 'horizontal',
}) => {
  const [stepData] = useState<Record<string, unknown>>({});
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Mark step as visited when current step changes
  useEffect(() => {
    setVisitedSteps(prev => new Set([...prev, currentStep]));
  }, [currentStep]);

  // Auto-save step data when validation passes
  const saveStepData = async (stepIndex: number) => {
    const step = steps[stepIndex];
    
    if (onStepSubmit) {
      try {
        const isValid = await onStepSubmit(stepIndex, stepData);
        if (!isValid) {
          setStepErrors(prev => ({
            ...prev,
            [step.id]: step.validationMessage || 'Validation failed'
          }));
          return false;
        }
      } catch (_error) {
        setStepErrors(prev => ({
          ...prev,
          [step.id]: 'An error occurred while validating this step'
        }));
        return false;
      }
    }

    // Clear errors for this step if validation passes
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[step.id];
      return newErrors;
    });
    return true;
  };

  const handleNext = async () => {
    if (validateOnStepChange) {
      const isValid = await saveStepData(currentStep);
      if (!isValid && !currentStepData.isOptional) {
        return;
      }
    }

    if (!isLastStep) {
      onStepChange(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex === currentStep) return;

    // Validate current step before moving
    if (stepIndex > currentStep && validateOnStepChange) {
      const isValid = await saveStepData(currentStep);
      if (!isValid && !currentStepData.isOptional) {
        return;
      }
    }

    onStepChange(stepIndex);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(stepData);
      }
      onSubmitComplete?.();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (visitedSteps.has(stepIndex)) return 'visited';
    return 'upcoming';
  };

  const isStepAccessible = (stepIndex: number) => {
    if (allowSkip) return true;
    if (stepIndex < currentStep) return true;
    if (stepIndex === currentStep) return true;
    // Can only access future steps if all previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      if (!steps[i].isOptional && steps[i].isValid === false) {
        return false;
      }
    }
    return true;
  };

  const getStepButtonVariant = (status: string, accessible: boolean) => {
    if (!accessible) return 'ghost';
    switch (status) {
      case 'completed':
        return 'primary';
      case 'current':
        return 'secondary';
      case 'visited':
        return 'outline';
      default:
        return 'ghost';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress bar */}
      {showProgress && (
        <FormProgress
          totalSteps={steps.length}
          currentStep={currentStep + 1}
          completed={false}
          showLabels={showStepNumbers}
          stepLabels={steps.map(step => step.title)}
        />
      )}

      {/* Step navigation for horizontal layout */}
      {direction === 'horizontal' && (
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const accessible = isStepAccessible(index);
            const hasError = stepErrors[step.id];
            
            return (
              <Button
                key={step.id}
                variant={getStepButtonVariant(status, accessible)}
                size="sm"
                onClick={() => handleStepClick(index)}
                disabled={!accessible}
                className={`
                  ${hasError ? 'border-red-500 text-red-600' : ''}
                  ${status === 'current' ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                `}
              >
                {showStepNumbers && (
                  <span className="mr-2">
                    {status === 'completed' ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </span>
                )}
                {step.title}
              </Button>
            );
          })}
        </div>
      )}

      {/* Current step content */}
      <div className="space-y-4">
        {/* Step header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {currentStepData.title}
            </h2>
            {currentStepData.isOptional && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                Optional
              </span>
            )}
          </div>
          {currentStepData.description && (
            <p className="text-neutral-600 dark:text-neutral-400">
              {currentStepData.description}
            </p>
          )}
        </div>

        {/* Step error feedback */}
        {stepErrors[currentStepData.id] && (
          <FormFeedback
            type="error"
            message={stepErrors[currentStepData.id]}
            dismissible={false}
            animate={true}
          />
        )}

        {/* Step content */}
        <div className="min-h-[200px]">
          {currentStepData.content}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading || isSubmitting}
              icon={<ChevronLeftIcon />}
              iconPosition="left"
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {allowSkip && !isLastStep && (
            <Button
              variant="ghost"
              onClick={handleNext}
              disabled={isLoading || isSubmitting}
            >
              Skip
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isLoading || isSubmitting || (!currentStepData.isValid && !currentStepData.isOptional && validateOnStepChange)}
            isLoading={isSubmitting}
            icon={isLastStep ? null : <ChevronRightIcon />}
            iconPosition="right"
          >
            {isSubmitting ? submitButtonLoadingText : (isLastStep ? submitButtonText : 'Next')}
          </Button>
        </div>
      </div>

      {/* Step summary for vertical layout */}
      {direction === 'vertical' && (
        <div className="hidden lg:block lg:w-64 border-l border-neutral-200 dark:border-neutral-700 pl-6">
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white mb-4">
            Progress
          </h3>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const hasError = stepErrors[step.id];
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={!isStepAccessible(index)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all duration-200
                    ${hasError ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : ''}
                    ${status === 'current' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : ''}
                    ${status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
                    ${status === 'visited' ? 'bg-neutral-50 dark:bg-neutral-900/20 text-neutral-700 dark:text-neutral-300' : ''}
                    ${status === 'upcoming' ? 'text-neutral-500 dark:text-neutral-400' : ''}
                    ${isStepAccessible(index) ? 'hover:bg-opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs">
                      {status === 'completed' ? (
                        <CheckIcon className="w-3 h-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{step.title}</p>
                      {step.isOptional && (
                        <p className="text-xs opacity-75">Optional</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormStepper;