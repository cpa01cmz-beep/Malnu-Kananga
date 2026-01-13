/**
 * Color System Usage Examples
 *
 * This file demonstrates how to use the centralized color system
 * defined in src/config/colors.ts for consistent color usage across components.
 */

import { getColorClasses, getColorScale, getTextColorForBackground } from '../config/colors';

// =============================================================================
// BUTTON COMPONENT - Semantic Color Usage
// =============================================================================

interface ButtonProps {
  variant: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
}

/**
 * Button component using semantic colors
 */
export const SemanticButton: React.FC<ButtonProps> = ({ variant, children }) => {
  const buttonClasses = getColorClasses(variant, 'button');

  return <button className={`rounded-lg px-4 py-2 ${buttonClasses}`}>{children}</button>;
};

// Usage examples:
// <SemanticButton variant="primary">Submit</SemanticButton>  // bg-primary-600
// <SemanticButton variant="success">Save</SemanticButton>   // bg-green-600
// <SemanticButton variant="error">Delete</SemanticButton>   // bg-red-600
// <SemanticButton variant="warning">Caution</SemanticButton> // bg-orange-600
// <SemanticButton variant="info">Info</SemanticButton>      // bg-blue-600

// =============================================================================
// ALERT COMPONENT - Semantic Color Usage
// =============================================================================

interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  title: string;
  children: React.ReactNode;
}

/**
 * Alert component using semantic colors
 */
export const SemanticAlert: React.FC<AlertProps> = ({ variant, title, children }) => {
  const alertClasses = getColorClasses(variant, 'alert');
  const iconBg = getColorClasses(variant, 'background');

  return (
    <div className={`rounded-lg p-4 border-l-4 ${alertClasses}`} role="alert">
      <div className={`flex items-start gap-3`}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg}`}>
          {variant === 'success' && '✓'}
          {variant === 'error' && '✕'}
          {variant === 'warning' && '⚠'}
          {variant === 'info' && 'ℹ'}
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
};

// Usage examples:
// <SemanticAlert variant="success" title="Success">Operation completed</SemanticAlert>
// <SemanticAlert variant="error" title="Error">Something went wrong</SemanticAlert>
// <SemanticAlert variant="warning" title="Warning">Please check your input</SemanticAlert>
// <SemanticAlert variant="info" title="Info">Here is some information</SemanticAlert>

// =============================================================================
// BADGE COMPONENT - Semantic Color Usage
// =============================================================================

interface BadgeProps {
  variant: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  children: React.ReactNode;
}

/**
 * Badge component using semantic colors
 */
export const SemanticBadge: React.FC<BadgeProps> = ({ variant, children }) => {
  const badgeClasses = getColorClasses(variant, 'badge');

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${badgeClasses}`}>
      {children}
    </span>
  );
};

// Usage examples:
// <SemanticBadge variant="success">Active</SemanticBadge>
// <SemanticBadge variant="error">Failed</SemanticBadge>
// <SemanticBadge variant="warning">Pending</SemanticBadge>
// <SemanticBadge variant="info">New</SemanticBadge>

// =============================================================================
// FORM INPUT COMPONENT - Semantic Color Usage
// =============================================================================

interface InputProps {
  state?: 'error' | 'success' | 'default';
  placeholder?: string;
  className?: string;
}

/**
 * Input component using semantic colors for validation states
 */
export const SemanticInput: React.FC<InputProps> = ({ state = 'default', placeholder, className = '' }) => {
  const stateClasses = state === 'default'
    ? 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/50'
    : state === 'error'
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50'
      : state === 'success'
        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/50'
        : '';

  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`w-full px-4 py-2 rounded-lg border-2 focus:outline-none transition-all ${stateClasses} ${className}`}
    />
  );
};

// Usage examples:
// <SemanticInput placeholder="Default state" />
// <SemanticInput state="error" placeholder="Error state" />
// <SemanticInput state="success" placeholder="Success state" />

// =============================================================================
// CARD COMPONENT - Semantic Color Usage
// =============================================================================

interface CardProps {
  variant: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  title: string;
  children: React.ReactNode;
}

/**
 * Card component using semantic colors
 */
export const SemanticCard: React.FC<CardProps> = ({ variant, title, children }) => {
  const bgClasses = getColorClasses(variant, 'background');
  const borderClasses = getColorClasses(variant, 'border');

  return (
    <div className={`rounded-lg border-2 ${bgClasses} ${borderClasses} p-6`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm">{children}</p>
    </div>
  );
};

// Usage examples:
// <SemanticCard variant="primary" title="Primary Card">Primary content</SemanticCard>
// <SemanticCard variant="success" title="Success Card">Success content</SemanticCard>
// <SemanticCard variant="error" title="Error Card">Error content</SemanticCard>

// =============================================================================
// ADVANCED USAGE - Dynamic Color Selection
// =============================================================================

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

/**
 * Dynamic badge that maps status to semantic color
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusToColor: Record<StatusBadgeProps['status'], 'success' | 'error' | 'warning' | 'neutral' | 'info'> = {
    active: 'success',
    inactive: 'neutral',
    pending: 'warning',
    error: 'error',
    success: 'success',
  };

  const variant = statusToColor[status];
  const badgeClasses = getColorClasses(variant, 'badge');

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${badgeClasses}`}>
      {status}
    </span>
  );
};

// Usage examples:
// <StatusBadge status="active" />    // green badge
// <StatusBadge status="inactive" />  // gray badge
// <StatusBadge status="pending" />   // yellow badge
// <StatusBadge status="error" />     // red badge
// <StatusBadge status="success" />   // green badge

// =============================================================================
// MIGRATION EXAMPLE - From Deprecated Colors to Semantic Colors
// =============================================================================

/**
 * BEFORE - Using deprecated colors directly
 */
export const LegacyAlertOld = ({ type }: { type: 'emerald' | 'rose' | 'amber' | 'cyan' }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200',
    rose: 'bg-rose-50 border-rose-200',
    amber: 'bg-amber-50 border-amber-200',
    cyan: 'bg-cyan-50 border-cyan-200',
  };

  return <div className={`p-4 border-l-4 ${colorMap[type]}`}>Alert</div>;
};

/**
 * AFTER - Using semantic colors
 */
export const LegacyAlertNew = ({ type }: { type: 'success' | 'error' | 'warning' | 'info' }) => {
  const alertClasses = getColorClasses(type, 'alert');

  return <div className={`p-4 ${alertClasses}`}>Alert</div>;
};

// Migration mapping:
// emerald → success (green)
// rose → error (red)
// amber → warning (yellow/orange)
// cyan → info (blue)

// =============================================================================
// BEST PRACTICES
// =============================================================================

/**
 * ✅ DO: Use semantic colors
 */
export const GoodExample = () => {
  return <button className={getColorClasses('success', 'button')}>Submit</button>;
};

/**
 * ❌ DON'T: Use hardcoded color classes
 */
export const BadExample = () => {
  return <button className="bg-green-600 text-white hover:bg-green-700">Submit</button>;
};

/**
 * ✅ DO: Use semantic variants for consistent meaning
 */
export const GoodSemantic = () => {
  const status = 'error';
  return <SemanticAlert variant={status} title="Error">Something went wrong</SemanticAlert>;
};

/**
 * ❌ DON'T: Use colors that don't match semantic meaning
 */
export const BadSemantic = () => {
  return <SemanticAlert variant="success" title="Error">Something went wrong</SemanticAlert>;
};

// =============================================================================
// COLOR CONTRAST AND ACCESSIBILITY
// =============================================================================

/**
 * Example: Automatically choose text color for contrast
 */
export const ColoredBox = ({ variant, shade }: { variant: 'success' | 'error' | 'warning'; shade: 100 | 600 }) => {
  const bgClass = `${variant === 'success' ? 'bg-green' : variant === 'error' ? 'bg-red' : 'bg-yellow'}-${shade}`;
  const textColor = getTextColorForBackground(variant, shade);

  return <div className={`${bgClass} ${textColor} p-4 rounded-lg`}>Text</div>;
};

// For light backgrounds (shade 100): returns 'text-neutral-900'
// For dark backgrounds (shade 600): returns 'text-white'

export default {
  SemanticButton,
  SemanticAlert,
  SemanticBadge,
  SemanticInput,
  SemanticCard,
  StatusBadge,
};
