import React, { forwardRef } from 'react';

export type LabelSize = 'sm' | 'md' | 'lg';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  required?: boolean;
  helperText?: string;
  size?: LabelSize;
}

const sizeClasses: Record<LabelSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const Label = forwardRef<HTMLLabelElement, LabelProps>(({
  htmlFor,
  required = false,
  helperText,
  size = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  const labelClasses = `
    ${sizeClasses[size]}
    font-semibold
    text-neutral-700 dark:text-neutral-300
    block
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <>
      <label ref={ref} htmlFor={htmlFor} className={labelClasses} {...props}>
        {children}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      {helperText && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {helperText}
        </p>
      )}
    </>
  );
});

Label.displayName = 'Label';

export default Label;
