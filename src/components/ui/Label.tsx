import React, { forwardRef, type LabelHTMLAttributes } from 'react';

export type LabelSize = 'sm' | 'md' | 'lg';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
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
  `;

  return (
    <div className="flex flex-col gap-1">
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`${labelClasses} ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {helperText && <span className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</span>}
    </div>
  );
});

Label.displayName = 'Label';

export default Label;
