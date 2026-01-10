import React, { forwardRef } from 'react'

export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  label?: string
  description?: string
  checkboxSize?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'blue' | 'green' | 'red' | 'purple' | 'orange'
  indeterminate?: boolean
  labelPosition?: 'left' | 'right'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

const colorClasses = {
  primary: 'text-primary-600 focus:ring-primary-300 dark:focus:ring-primary-700',
  blue: 'text-blue-600 focus:ring-blue-300 dark:focus:ring-blue-700',
  green: 'text-green-600 focus:ring-green-300 dark:focus:ring-green-700',
  red: 'text-red-600 focus:ring-red-300 dark:focus:ring-red-700',
  purple: 'text-purple-600 focus:ring-purple-300 dark:focus:ring-purple-700',
  orange: 'text-orange-600 focus:ring-orange-300 dark:focus:ring-orange-700',
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      checkboxSize = 'md',
      color = 'primary',
      indeterminate = false,
      labelPosition = 'right',
      className = '',
      disabled,
      checked,
      defaultChecked,
      onChange,
      onFocus,
      onBlur,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const hasLabel = label || description
    const sizeClass = sizeClasses[checkboxSize]
    const colorClass = colorClasses[color]

    const content = (
      <input
        ref={(input) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(input)
            } else {
              ref.current = input
            }
          }
          if (input && indeterminate !== undefined) {
            input.indeterminate = indeterminate
          }
        }}
        id={checkboxId}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className={`
          ${sizeClass}
          rounded
          border-neutral-300
          dark:border-neutral-600
          bg-white
          dark:bg-neutral-900
          focus:ring-2
          focus:ring-offset-0
          ${colorClass}
          cursor-pointer
          disabled:cursor-not-allowed
          disabled:opacity-50
          transition-colors
          ${className}
        `}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-checked={indeterminate ? 'mixed' : checked}
        {...props}
      />
    )

    if (!hasLabel) {
      return content
    }

    if (labelPosition === 'left') {
      return (
        <label
          htmlFor={checkboxId}
          className={`
            relative inline-flex items-center gap-3
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
        >
          <div className="flex flex-col">
            {label && (
              <span
                className={`font-medium ${
                  checkboxSize === 'sm' ? 'text-sm' : checkboxSize === 'lg' ? 'text-base' : 'text-base'
                } text-neutral-900 dark:text-white`}
              >
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </span>
            )}
          </div>
          {content}
        </label>
      )
    }

    return (
      <label
        htmlFor={checkboxId}
        className={`
          relative inline-flex items-center gap-3
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {content}
        <div className="flex flex-col">
          {label && (
            <span
              className={`font-medium ${
                checkboxSize === 'sm' ? 'text-sm' : checkboxSize === 'lg' ? 'text-base' : 'text-base'
              } text-neutral-900 dark:text-white`}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </span>
          )}
        </div>
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
