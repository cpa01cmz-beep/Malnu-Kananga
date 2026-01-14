import React from 'react';

interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const FormGrid: React.FC<FormGridProps> = ({
  children,
  cols = 2,
  gap = 'md',
  className = '',
  ...props
}) => {
  const colsClass = `grid-cols-1 md:grid-cols-${cols}`;
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap];

  return (
    <div
      className={`grid ${colsClass} ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default FormGrid;
