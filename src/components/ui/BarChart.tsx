import React from 'react';

export interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  showValues?: boolean;
  className?: string;
  animated?: boolean;
  colorScheme?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'mixed';
  orientation?: 'vertical' | 'horizontal';
}

const colorSchemes = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  mixed: ['bg-primary-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-500']
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  showValues = true,
  className = '',
  animated = true,
  colorScheme = 'primary',
  orientation = 'vertical',
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  const getBarColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    if (colorScheme === 'mixed') {
      const colors = colorSchemes.mixed;
      return colors[index % colors.length];
    }
    return colorSchemes[colorScheme];
  };

  if (orientation === 'horizontal') {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const barColor = getBarColor(index, item.color);
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="min-w-[80px] text-sm font-medium text-neutral-700 dark:text-neutral-300 text-right">
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full flex items-center justify-end pr-2 ${
                      animated ? 'transition-all duration-500 ease-out' : ''
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {showValues && item.value > 0 && (
                      <span className="text-xs font-medium text-white">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ height: `${height}px` }}>
      <div className="h-full flex items-end gap-2">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const barHeight = `${percentage}%`;
          const barColor = getBarColor(index, item.color);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              {showValues && (
                <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {item.value}
                </div>
              )}
              <div className="w-full relative flex-1 flex items-end">
                <div
                  className={`w-full ${barColor} rounded-t-md ${
                    animated ? 'transition-all duration-500 ease-out animate-fade-in-up' : ''
                  }`}
                  style={{ 
                    height: barHeight,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;