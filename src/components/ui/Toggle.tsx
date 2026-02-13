import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { idGenerators } from '../../utils/idGenerator'
import { UI_DELAYS } from '../../constants'

// Haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' = 'light') => {
  if ('vibrate' in navigator && window.innerWidth <= 768) {
    const pattern = {
      light: [10],
      medium: [25]
    };
    navigator.vibrate(pattern[type]);
  }
};

export interface ToggleProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> {
  label?: string
  description?: string
  toggleSize?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'blue' | 'green' | 'red' | 'purple' | 'orange'
  labelPosition?: 'left' | 'right'
  /** Show tooltip with state and keyboard shortcut hint */
  showTooltip?: boolean
  /** Custom tooltip text (defaults to state description) */
  tooltipText?: string
}

const sizeClasses = {
  sm: {
    switch: 'w-9 h-5 min-w-[44px] min-h-[44px]',
    dot: 'after:h-4 after:w-4 after:top-0.5 after:left-0.5',
  },
  md: {
    switch: 'w-11 h-6 min-w-[44px] min-h-[44px]',
    dot: 'after:h-5 after:w-5 after:top-[2px] after:left-[2px]',
  },
  lg: {
    switch: 'w-14 h-8 min-w-[52px] min-h-[52px]',
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
      showTooltip = true,
      tooltipText,
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
    const toggleId = id || idGenerators.input()
    const hasLabel = label || description
    const labelClasses = sizeClasses[toggleSize]
    const colorClass = colorClasses[color]
    const prefersReducedMotion = useReducedMotion()
    const [isPressed, setIsPressed] = useState(false)
    const [isTooltipVisible, setIsTooltipVisible] = useState(false)
    const [showShortcutHint, setShowShortcutHint] = useState(false)
    const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const shortcutHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const isChecked = checked ?? defaultChecked ?? false

    const getTooltipText = () => {
      if (tooltipText) return tooltipText
      return isChecked ? 'Matikan' : 'Nyalakan'
    }

    const handleShowTooltip = useCallback(() => {
      if (disabled) return
      setIsTooltipVisible(true)
      if (showTooltip) {
        shortcutHintTimeoutRef.current = setTimeout(() => {
          setShowShortcutHint(true)
        }, UI_DELAYS.SHORTCUT_HINT_DELAY)
      }
    }, [disabled, showTooltip])

    const handleHideTooltip = useCallback(() => {
      setIsTooltipVisible(false)
      setShowShortcutHint(false)
      if (shortcutHintTimeoutRef.current) {
        clearTimeout(shortcutHintTimeoutRef.current)
        shortcutHintTimeoutRef.current = null
      }
    }, [])

    useEffect(() => {
      const tooltipTimeout = tooltipTimeoutRef.current
      const shortcutTimeout = shortcutHintTimeoutRef.current
      return () => {
        if (tooltipTimeout) {
          clearTimeout(tooltipTimeout)
        }
        if (shortcutTimeout) {
          clearTimeout(shortcutTimeout)
        }
      }
    }, [])

    const handlePressStart = useCallback(() => {
      if (!disabled) {
        setIsPressed(true)
        triggerHapticFeedback('light')
      }
    }, [disabled])

    const handlePressEnd = useCallback(() => {
      setIsPressed(false)
    }, [])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        triggerHapticFeedback('light')
        // Trigger the toggle by simulating a click on the input
        const input = document.getElementById(toggleId) as HTMLInputElement
        if (input && !disabled) {
          input.click()
        }
      }
    }, [toggleId, disabled])

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
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="sr-only peer"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-checked={checked ?? defaultChecked ?? false}
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
            transition-all duration-200 ease-in-out
            ${disabled ? 'opacity-50' : 'cursor-pointer'}
            ${isPressed ? 'scale-95' : 'scale-100'}
            ${prefersReducedMotion ? '' : 'active:scale-95'}
            focus-visible-enhanced
          `}
          aria-hidden="true"
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        />
      </>
    )

    if (!hasLabel) {
      return (
        <label
          className={`
            relative inline-flex items-center gap-3 mobile-touch-target
            ${disabled ? 'cursor-not-allowed' : ''}
            ${className}
          `}
          onMouseEnter={handleShowTooltip}
          onMouseLeave={handleHideTooltip}
          onFocus={handleShowTooltip}
          onBlur={handleHideTooltip}
        >
          {content}
          {showTooltip && isTooltipVisible && (
            <div
              className={`
                absolute -top-10 left-1/2 -translate-x-1/2
                px-2.5 py-1.5
                bg-neutral-800 dark:bg-neutral-700
                text-white text-[10px] font-medium
                rounded-md shadow-lg
                whitespace-nowrap
                pointer-events-none
                z-50
                ${prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'}
                ${isTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}
              role="tooltip"
            >
              <span className="flex items-center gap-1.5">
                <span>{getTooltipText()}</span>
                {showShortcutHint && (
                  <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">
                    Space
                  </kbd>
                )}
              </span>
              <span
                className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"
                aria-hidden="true"
              />
            </div>
          )}
        </label>
      )
    }

    if (labelPosition === 'left') {
      return (
        <label
          htmlFor={toggleId}
          className={`
            relative inline-flex items-center gap-3 mobile-touch-target
            ${disabled ? 'cursor-not-allowed' : ''}
            ${className}
          `}
          onMouseEnter={handleShowTooltip}
          onMouseLeave={handleHideTooltip}
          onFocus={handleShowTooltip}
          onBlur={handleHideTooltip}
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
          <div className="relative">
            {content}
            {showTooltip && isTooltipVisible && (
              <div
                className={`
                  absolute -top-10 left-1/2 -translate-x-1/2
                  px-2.5 py-1.5
                  bg-neutral-800 dark:bg-neutral-700
                  text-white text-[10px] font-medium
                  rounded-md shadow-lg
                  whitespace-nowrap
                  pointer-events-none
                  z-50
                  ${prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'}
                  ${isTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                role="tooltip"
              >
                <span className="flex items-center gap-1.5">
                  <span>{getTooltipText()}</span>
                  {showShortcutHint && (
                    <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">
                      Space
                    </kbd>
                  )}
                </span>
                <span
                  className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </label>
      )
    }

    return (
      <label
        htmlFor={toggleId}
        className={`
          relative inline-flex items-center justify-between gap-3
          w-full mobile-touch-target
          ${disabled ? 'cursor-not-allowed' : ''}
          ${className}
        `}
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onFocus={handleShowTooltip}
        onBlur={handleHideTooltip}
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
        <div className="relative">
          {content}
          {showTooltip && isTooltipVisible && (
            <div
              className={`
                absolute -top-10 left-1/2 -translate-x-1/2
                px-2.5 py-1.5
                bg-neutral-800 dark:bg-neutral-700
                text-white text-[10px] font-medium
                rounded-md shadow-lg
                whitespace-nowrap
                pointer-events-none
                z-50
                ${prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'}
                ${isTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}
              role="tooltip"
            >
              <span className="flex items-center gap-1.5">
                <span>{getTooltipText()}</span>
                {showShortcutHint && (
                  <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">
                    Space
                  </kbd>
                )}
              </span>
              <span
                className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'
