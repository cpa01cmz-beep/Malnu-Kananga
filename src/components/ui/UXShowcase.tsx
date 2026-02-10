/**
 * UX Enhancement Showcase Demo
 * Comprehensive demonstration of all enhanced components and features
 */

import React, { useState } from 'react';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';
import EnhancedBadge from './EnhancedBadge';
import { 
  colors, 
  gradients, 
  shadows,
  semanticColors
} from './ColorSystem';
import { TypeScale } from './TypographySystem';
import { 
  typeScale, 
  spacing, 
  getTypographyClasses 
} from './TypographySystem';
import ResponsiveContainer from './ResponsiveContainer';

const UXShowcase: React.FC = () => {
  const [buttonCount, setButtonCount] = useState(0);
  const [isCardPressed, setIsCardPressed] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const handleButtonClick = () => {
    setButtonCount(prev => prev + 1);
  };

  const handleCardClick = () => {
    setIsCardPressed(!isCardPressed);
  };

  const handleBadgeClick = (badgeId: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId) 
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const badgeOptions = [
    { id: 'success', label: 'Success', variant: 'success' as const },
    { id: 'warning', label: 'Warning', variant: 'warning' as const },
    { id: 'error', label: 'Error', variant: 'error' as const },
    { id: 'info', label: 'Info', variant: 'info' as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <ResponsiveContainer size="xl" padding="lg">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className={`
              ${getTypographyClasses('display-md', 'bold', 'tight', 'tight')}
              text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600
              mb-6
            `}
          >
            Enhanced UX Showcase
          </h1>
          <p 
            className={`
              ${getTypographyClasses('body-lg', 'normal', 'relaxed')}
              text-gray-600 max-w-3xl mx-auto
            `}
          >
            Experience sophisticated micro-interactions, accessibility enhancements, 
            and visual refinements throughout our enhanced component library.
          </p>
        </div>

        {/* Enhanced Buttons Section */}
        <section className="mb-20">
          <h2 className={getTypographyClasses('heading-2xl', 'bold', 'tight', 'normal')}>
            Enhanced Buttons
          </h2>
          <p className={`${getTypographyClasses('body-md')} text-gray-600 mb-8`}>
            Buttons with ripple effects, haptic feedback, and smooth animations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedButton
              variant="primary"
              onClick={handleButtonClick}
              ripple
              glow
            >
              Primary Button
            </EnhancedButton>

            <EnhancedButton
              variant="secondary"
              onClick={handleButtonClick}
              pulse
            >
              Secondary
            </EnhancedButton>

            <EnhancedButton
              variant="primary"
              intent="success"
              onClick={handleButtonClick}
              ripple
            >
              Success Action
            </EnhancedButton>

            <EnhancedButton
              variant="destructive"
              onClick={handleButtonClick}
              glow
            >
              Delete
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              onClick={handleButtonClick}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              With Icon
            </EnhancedButton>

            <EnhancedButton
              variant="primary"
              size="sm"
              onClick={handleButtonClick}
              ripple
            >
              Small Size
            </EnhancedButton>

            <EnhancedButton
              variant="primary"
              size="lg"
              onClick={handleButtonClick}
              glow
            >
              Large Size
            </EnhancedButton>

            <EnhancedButton
              variant="ghost"
              onClick={handleButtonClick}
              disabled
            >
              Disabled
            </EnhancedButton>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className={getTypographyClasses('body-sm', 'medium')}>
              Button clicks: <span className="font-bold text-blue-600">{buttonCount}</span>
            </p>
          </div>
        </section>

        {/* Enhanced Cards Section */}
        <section className="mb-20">
          <h2 className={getTypographyClasses('heading-2xl', 'bold', 'tight', 'normal')}>
            Interactive Cards
          </h2>
          <p className={`${getTypographyClasses('body-md')} text-gray-600 mb-8`}>
            Cards with 3D tilt effects, lift animations, and depth transitions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <EnhancedCard
              variant="interactive"
              liftOnHover
              glowOnHover
              tilt
              onClick={handleCardClick}
              className="p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className={getTypographyClasses('heading-lg', 'semibold', 'tight') + ' mb-2'}>
                  3D Tilt Effect
                </h3>
                <p className={`${getTypographyClasses('body-sm')} text-gray-600`}>
                  Hover to experience the subtle tilt animation
                </p>
                {isCardPressed && (
                  <p className="mt-4 text-green-600 text-sm font-medium">
                    ✓ Card Clicked!
                  </p>
                )}
              </div>
            </EnhancedCard>

            <EnhancedCard
              variant="gradient"
              gradient={{ from: 'purple-500', to: 'pink-500', text: 'light' }}
              liftOnHover
              pressScale
              onClick={handleCardClick}
              className="p-8"
            >
              <div className="text-center">
                <h3 className={getTypographyClasses('heading-lg', 'semibold', 'tight') + ' mb-2 text-white'}>
                  Gradient Style
                </h3>
                <p className={`${getTypographyClasses('body-sm')} text-white/90`}>
                  Beautiful gradient backgrounds with smooth transitions
                </p>
              </div>
            </EnhancedCard>

            <EnhancedCard
              variant="hover"
              ripple
              onClick={handleCardClick}
              className="p-8"
            >
              <div className="text-center">
                <h3 className={getTypographyClasses('heading-lg', 'semibold', 'tight') + ' mb-2'}>
                  Ripple Effect
                </h3>
                <p className={`${getTypographyClasses('body-sm')} text-gray-600`}>
                  Click to see the ripple animation
                </p>
              </div>
            </EnhancedCard>
          </div>
        </section>

        {/* Enhanced Badges Section */}
        <section className="mb-20">
          <h2 className={getTypographyClasses('heading-2xl', 'bold', 'tight', 'normal')}>
            Dynamic Badges
          </h2>
          <p className={`${getTypographyClasses('body-md')} text-gray-600 mb-8`}>
            Badges with animations, status indicators, and interactive states.
          </p>

          <div className="space-y-8">
            {/* Status Badges */}
            <div>
              <h3 className={getTypographyClasses('heading-md', 'semibold', 'tight') + ' mb-4'}>
                Status Indicators
              </h3>
              <div className="flex flex-wrap gap-3">
                <EnhancedBadge variant="success" pulse>
                  Active
                </EnhancedBadge>
                <EnhancedBadge variant="warning" glow>
                  Warning
                </EnhancedBadge>
                <EnhancedBadge variant="error" pulse>
                  Critical
                </EnhancedBadge>
                <EnhancedBadge variant="info" glow>
                  Info
                </EnhancedBadge>
              </div>
            </div>

            {/* Interactive Badges */}
            <div>
              <h3 className={getTypographyClasses('heading-md', 'semibold', 'tight') + ' mb-4'}>
                Click to Select
              </h3>
              <div className="flex flex-wrap gap-3">
                {badgeOptions.map(badge => (
                  <EnhancedBadge
                    key={badge.id}
                    variant={badge.variant}
                    clickable
                    onClick={() => handleBadgeClick(badge.id)}
                    className={`
                      ${selectedBadges.includes(badge.id) 
                        ? 'ring-2 ring-offset-2 ring-' + badge.variant + '-500' 
                        : ''
                      }
                    `}
                  >
                    {badge.label}
                    {selectedBadges.includes(badge.id) && ' ✓'}
                  </EnhancedBadge>
                ))}
              </div>
            </div>

            {/* Count Badges */}
            <div>
              <h3 className={getTypographyClasses('heading-md', 'semibold', 'tight') + ' mb-4'}>
                Notification Counts
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative">
                  <EnhancedButton variant="outline">Messages</EnhancedButton>
                  <EnhancedBadge
                    variant="error"
                    size="sm"
                    count={5}
                    className="absolute -top-2 -right-2"
                  >
                    5
                  </EnhancedBadge>
                </div>
                
                <div className="relative">
                  <EnhancedButton variant="outline">Notifications</EnhancedButton>
                  <EnhancedBadge
                    variant="warning"
                    size="sm"
                    count={123}
                    maxCount={99}
                    className="absolute -top-2 -right-2"
                  >
                    123
                  </EnhancedBadge>
                </div>

                <div className="relative">
                  <EnhancedButton variant="outline">Tasks</EnhancedButton>
                  <EnhancedBadge
                    variant="success"
                    size="sm"
                    count={0}
                    className="absolute -top-2 -right-2"
                  >
                    0
                  </EnhancedBadge>
                </div>
              </div>
            </div>

            {/* Removable Badges */}
            <div>
              <h3 className={getTypographyClasses('heading-md', 'semibold', 'tight') + ' mb-4'}>
                Removable Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                <EnhancedBadge variant="default" removable>
                  React
                </EnhancedBadge>
                <EnhancedBadge variant="default" removable>
                  TypeScript
                </EnhancedBadge>
                <EnhancedBadge variant="default" removable>
                  Tailwind CSS
                </EnhancedBadge>
                <EnhancedBadge variant="default" removable>
                  Vite
                </EnhancedBadge>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Showcase */}
        <section className="mb-20">
          <h2 className={getTypographyClasses('heading-2xl', 'bold', 'tight', 'normal')}>
            Typography System
          </h2>
          <p className={`${getTypographyClasses('body-md')} text-gray-600 mb-8`}>
            Consistent type scale with optimal readability and hierarchy.
          </p>

          <div className="space-y-6">
            {Object.entries({
              'display-xl': 'Display Extra Large (96px)',
              'display-lg': 'Display Large (72px)',
              'display-md': 'Display Medium (60px)',
              'heading-2xl': 'Heading 2XL (24px)',
              'heading-xl': 'Heading XL (20px)',
              'heading-lg': 'Heading Large (18px)',
              'heading-md': 'Heading Medium (16px)',
              'body-lg': 'Body Large (18px)',
              'body-md': 'Body Medium (16px)',
              'body-sm': 'Body Small (14px)',
            }).map(([size, description]) => (
              <div key={size} className="border-b border-gray-200 pb-4">
                <p className={getTypographyClasses(size as TypeScale)}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Color System Showcase */}
        <section className="mb-20">
          <h2 className={getTypographyClasses('heading-2xl', 'bold', 'tight', 'normal')}>
            Color System
          </h2>
          <p className={`${getTypographyClasses('body-md')} text-gray-600 mb-8`}>
            Harmonious color palette with accessibility in mind.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries({
              primary: colors.primary,
              secondary: colors.secondary,
              success: colors.success,
              warning: colors.warning,
              error: colors.error,
              info: colors.info,
            }).map(([name, shades]) => (
              <div key={name} className="space-y-2">
                <h3 className={getTypographyClasses('heading-sm', 'semibold') + ' capitalize'}>
                  {name}
                </h3>
                <div className="space-y-1">
                  {Object.entries(shades).map(([shade, color]) => (
                    <div key={shade} className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <span className={getTypographyClasses('caption-sm')}>
                        {shade}: {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-12 border-t border-gray-200">
          <p className={getTypographyClasses('body-sm', 'medium', 'relaxed') + ' text-gray-600'}>
            Enhanced UX components with sophisticated interactions, accessibility features, 
            and visual polish. Built with React, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </ResponsiveContainer>
    </div>
  );
};

export default UXShowcase;