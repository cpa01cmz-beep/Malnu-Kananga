import React, { forwardRef } from 'react'

export interface ToggleProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  label?: string
  description?: string
  toggleSize?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'blue' | 'green' | 'red' | 'purple' | 'orange'
  labelPosition?: 'left' | 'right'
}

const sizeClasses = {
  sm: {
    switch: 'w-9 h-5',
    dot: 'after:h-4 after:w-4 after:top-0.5 after:left-0.5',
  },
  md: {
    switch: 'w-11 h-6',
    dot: 'after:h-5 after:w-5 after:top-[2px] after:left-[2px]',
  },
  lg: {
    switch: 'w-14 h-8',
    dot: 'after:h-6 after:w-6 after:top-1 after:left-1',
  },
}

const colorClasses = {
  primary: 'peer-checked:bg-primary-600 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-700',
  blue: 'peer-checked:bg-blue-600 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-700',
  green: 'peer-checked:bg-green-600 peer-focus:ring-green-300 dark:peer-focus:ring-green-700',
  red: 'peer-checked:bg-red-600 peer-focus:ring-red-300 dark:peer-focus:ring-red-700',
  purple: 'peer-checked:bg-purple-600 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-700',
  orange: 'peer-checked:bg-orange-600 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-700',
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      toggleSize = 'md',
      color = 'primary',
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
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`
    const hasLabel = label || description
    const labelClasses = sizeClasses[toggleSize]
    const colorClass = colorClasses[color]

    const content = (
      <>
        <input
          ref={ref}
          id={toggleId}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          className="sr-only peer"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-checked={checked ?? false}
          role="switch"
          {...props}
        />
        <div
          className={`
            ${labelClasses.switch}
            ${labelClasses.dot}
            bg-neutral-200 peer-focus:outline-none peer-focus:ring-4
            rounded-full peer
            dark:bg-neutral-700
            after:content-[''] after:absolute after:bg-white after:rounded-full
            after:transition-all
            after:border after:border-neutral-300
            peer-checked:after:border-white
            peer-checked:after:translate-x-full
            ${colorClass}
            transition-colors duration-200 ease-in-out
            ${disabled ? 'opacity-50' : 'cursor-pointer'}
          `}
          aria-hidden="true"
        />
      </>
    )

    if (!hasLabel) {
      return (
        <label
          className={`
            relative inline-flex items-center gap-3
            ${disabled ? 'cursor-not-allowed' : ''}
            ${className}
          `}
        >
          {content}
        </label>
      )
    }

    if (labelPosition === 'left') {
      return (
        <label
          htmlFor={toggleId}
          className={`
            relative inline-flex items-center gap-3
            ${disabled ? 'cursor-not-allowed' : ''}
            ${className}
          `}
        >
          <div className="flex flex-col">
            {label && (
              <span
                className={`font-medium ${
                  toggleSize === 'sm' ? 'text-sm' : toggleSize === 'lg' ? 'text-lg' : 'text-base'
                } text-neutral-900 dark:text-white`}
              >
                {label}
              </span>
            )}
            {description && (
              <span className={`text-sm text-neutral-600 dark:text-neutral-400`}>
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
        htmlFor={toggleId}
        className={`
          relative inline-flex items-center justify-between gap-3
          w-full
          ${disabled ? 'cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <div className="flex flex-col">
            {label && (
              <span
                className={`font-medium ${
                  toggleSize === 'sm' ? 'text-sm' : toggleSize === 'lg' ? 'text-lg' : 'text-base'
                } text-neutral-900 dark:text-white`}
              >
                {label}
              </span>
            )}
          {description && (
            <span className={`text-sm text-neutral-600 dark:text-neutral-400`}>
              {description}
            </span>
          )}
        </div>
        {content}
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'
