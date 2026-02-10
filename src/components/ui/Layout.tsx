import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  as?: 'div' | 'section' | 'main' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
  as: Component = 'div'
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  };

  return React.createElement(
    Component,
    {
      className: `
        mx-auto px-4 sm:px-6 lg:px-8
        ${sizeClasses[size]}
        ${className}
      `.trim()
    },
    children
  );
};

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className = '',
  responsive = true
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const baseClasses = `
    grid
    ${gapClasses[gap]}
    ${className}
  `;

  if (responsive) {
    const responsiveClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
      12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12'
    };

    return <div className={`${baseClasses} ${responsiveClasses[cols]}`}>{children}</div>;
  }

  const staticClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  };

  return <div className={`${baseClasses} ${staticClasses[cols]}`}>{children}</div>;
};

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className = '',
  as: Component = 'div'
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return React.createElement(
    Component,
    {
      className: `
        flex
        ${directionClasses[direction]}
        ${alignClasses[align]}
        ${justifyClasses[justify]}
        ${gapClasses[gap]}
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${className}
      `.trim()
    },
    children
  );
};

interface StackProps {
  children: React.ReactNode;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal';
  className?: string;
  as?: 'div' | 'section' | 'main' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
}

export const Stack: React.FC<StackProps> = ({
  children,
  space = 'md',
  direction = 'vertical',
  className = '',
  as: Component = 'div'
}) => {
  const spaceClasses = {
    xs: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    sm: direction === 'vertical' ? 'space-y-3' : 'space-x-3',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8'
  };

  return React.createElement(
    Component,
    {
      className: `${spaceClasses[space]} ${className}`.trim()
    },
    children
  );
};

interface SectionProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'white' | 'neutral' | 'primary' | 'secondary';
  className?: string;
  id?: string;
  as?: 'div' | 'section' | 'main' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
}

export const Section: React.FC<SectionProps> = ({
  children,
  size = 'md',
  background = 'white',
  className = '',
  id,
  as: Component = 'section'
}) => {
  const sizeClasses = {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-20',
    xl: 'py-20 sm:py-24'
  };

  const backgroundClasses = {
    white: 'bg-white dark:bg-neutral-900',
    neutral: 'bg-neutral-50 dark:bg-neutral-800',
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    secondary: 'bg-neutral-100 dark:bg-neutral-900'
  };

  return React.createElement(
    Component,
    {
      id,
      className: `
        ${sizeClasses[size]}
        ${backgroundClasses[background]}
        ${className}
      `.trim()
    },
    children
  );
};

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: 'div' | 'section' | 'main' | 'article' | 'aside' | 'header' | 'footer' | 'nav';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  as: Component = 'div',
  interactive = false
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm',
    elevated: 'bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200',
    outlined: 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg',
    ghost: 'bg-transparent dark:bg-transparent rounded-lg'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1' : '';

  return React.createElement(
    Component,
    {
      className: `
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${interactiveClasses}
        ${className}
      `.trim()
    },
    children
  );
};

interface SidebarProps {
  children: React.ReactNode;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  isOpen?: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  position = 'left',
  width = 'md',
  isOpen = true,
  className = ''
}) => {
  const positionClasses = {
    left: 'left-0 border-r',
    right: 'right-0 border-l'
  };

  const widthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
    xl: 'w-96'
  };

  return (
    <aside
      className={`
        fixed top-0 h-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 z-30
        ${positionClasses[position]}
        ${widthClasses[width]}
        ${isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'}
        transition-transform duration-300 ease-in-out
        ${className}
      `}
    >
      {children}
    </aside>
  );
};

interface MainProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Main: React.FC<MainProps> = ({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = 'md',
  className = ''
}) => {
  const sidebarWidthClasses = {
    sm: 'ml-48',
    md: 'ml-64',
    lg: 'ml-80',
    xl: 'ml-96'
  };

  const sidebarWidthClassesRight = {
    sm: 'mr-48',
    md: 'mr-64',
    lg: 'mr-80',
    xl: 'mr-96'
  };

  if (!sidebar) {
    return <main className={className}>{children}</main>;
  }

  return (
    <div className="flex">
      {sidebarPosition === 'left' && (
        <Sidebar position="left" width={sidebarWidth}>
          {sidebar}
        </Sidebar>
      )}
      <main className={`flex-1 ${sidebarPosition === 'left' ? sidebarWidthClasses[sidebarWidth] : sidebarWidthClassesRight[sidebarWidth]} ${className}`}>
        {children}
      </main>
      {sidebarPosition === 'right' && (
        <Sidebar position="right" width={sidebarWidth}>
          {sidebar}
        </Sidebar>
      )}
    </div>
  );
};