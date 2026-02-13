import React from 'react';
import { CHART_COLOR_SCHEMES, CHART_DEFAULT_COLORS } from '../../constants';

/**
 * Enhanced Data Visualization Components
 * Comprehensive chart library for the MA Malnu Kananga system
 */

// Base chart interfaces
export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
  smooth?: boolean;
  className?: string;
  color?: string;
}

export interface PieChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
  donut?: boolean;
  className?: string;
}

export interface AreaChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  gradient?: boolean;
  className?: string;
  color?: string;
}

export interface ProgressChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  color?: string;
  className?: string;
}

// Color schemes - Flexy: Using centralized chart color constants
const colorSchemes = CHART_COLOR_SCHEMES;

// Line Chart Component
export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 400,
  height = 200,
  showGrid = true,
  showDots = true,
  showLabels = true,
  smooth = true,
  className = '',
  color = CHART_DEFAULT_COLORS.primary,
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((point.value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const pathData = smooth 
    ? `M ${points.split(',').map((p, i) => i % 2 === 0 ? p : p).join(' L ')}`
    : `M ${points}`;

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid */}
        {showGrid && (
          <g className="text-neutral-200 dark:text-neutral-700">
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={0}
                y1={(height / 4) * i}
                x2={width}
                y2={(height / 4) * i}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
          </g>
        )}
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Area under line */}
        <path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill={color}
          opacity="0.1"
          className="transition-all duration-300"
        />
        
        {/* Dots */}
        {showDots && data.map((point, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((point.value - minValue) / range) * height;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              className="transition-all duration-300 hover:r-6"
            />
          );
        })}
        
        {/* Labels */}
        {showLabels && data.map((point, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((point.value - minValue) / range) * height;
          
          return (
            <text
              key={index}
              x={x}
              y={y - 10}
              textAnchor="middle"
              className="text-xs fill-neutral-600 dark:fill-neutral-400"
            >
              {point.value}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// Pie Chart Component
export const PieChart: React.FC<PieChartProps> = ({
  data,
  width = 200,
  height = 200,
  showLabels = true,
  showPercentages = true,
  donut = false,
  className = '',
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  const innerRadius = donut ? radius * 0.6 : 0;
  
  let currentAngle = -90; // Start from top
  
  const colors = colorSchemes.mixed;
  
  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const endAngle = currentAngle + angle;
          
          const startAngleRad = (currentAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          
          const x1 = centerX + Math.cos(startAngleRad) * radius;
          const y1 = centerY + Math.sin(startAngleRad) * radius;
          const x2 = centerX + Math.cos(endAngleRad) * radius;
          const y2 = centerY + Math.sin(endAngleRad) * radius;
          
          const ix1 = centerX + Math.cos(startAngleRad) * innerRadius;
          const iy1 = centerY + Math.sin(startAngleRad) * innerRadius;
          const ix2 = centerX + Math.cos(endAngleRad) * innerRadius;
          const iy2 = centerY + Math.sin(endAngleRad) * innerRadius;
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const pathData = donut
            ? `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`
            : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          currentAngle = endAngle;
          
          return (
            <g key={index}>
              <path
                d={pathData}
                fill={item.color || colors[index % colors.length]}
                className="transition-all duration-300 hover:opacity-80"
                style={{ cursor: 'pointer' }}
              />
              
              {/* Labels */}
              {showLabels && !donut && (
                <text
                  x={centerX + Math.cos((startAngleRad + endAngleRad) / 2) * (radius * 0.7)}
                  y={centerY + Math.sin((startAngleRad + endAngleRad) / 2) * (radius * 0.7)}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  {showPercentages ? `${percentage.toFixed(1)}%` : item.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      {showLabels && donut && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                />
                <span className="text-neutral-600 dark:text-neutral-400">
                  {item.label} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Area Chart Component
export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  width = 400,
  height = 200,
  showGrid = true,
  gradient = true,
  className = '',
  color = CHART_DEFAULT_COLORS.primary,
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((point.value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height}>
        {/* Definitions for gradient */}
        {gradient && (
          <defs>
            <linearGradient id={`area-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
        )}
        
        {/* Grid */}
        {showGrid && (
          <g className="text-neutral-200 dark:text-neutral-700">
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={i}
                x1={0}
                y1={(height / 4) * i}
                x2={width}
                y2={(height / 4) * i}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
          </g>
        )}
        
        {/* Area */}
        <path
          d={`M ${points} L ${width},${height} L 0,${height} Z`}
          fill={gradient ? `url(#area-gradient-${color})` : color}
          fillOpacity={gradient ? 1 : 0.2}
          className="transition-all duration-300"
        />
        
        {/* Line */}
        <path
          d={`M ${points}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
};

// Progress Chart Component
export const ProgressChart: React.FC<ProgressChartProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  color = CHART_DEFAULT_COLORS.primary,
  className = '',
}) => {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={CHART_DEFAULT_COLORS.neutral}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Stats Card Component
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  className = '',
}) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    error: 'text-red-600 bg-red-50',
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
                {change.period}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Mini Chart Component for cards
export interface MiniChartProps {
  data: number[];
  type?: 'line' | 'bar';
  width?: number;
  height?: number;
  color?: string;
  positive?: boolean;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  type = 'line',
  width = 60,
  height = 30,
  color = CHART_DEFAULT_COLORS.primary,
  positive = true,
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  if (type === 'bar') {
    return (
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((value, index) => {
          const barHeight = ((value - minValue) / range) * height;
          return (
            <div
              key={index}
              className="flex-1 rounded-sm"
              style={{
                height: `${barHeight}px`,
                backgroundColor: color,
                opacity: 0.6 + (index / data.length) * 0.4,
              }}
            />
          );
        })}
      </div>
    );
  }
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height}>
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity={positive ? 1 : 0.5}
      />
    </svg>
  );
};

export default LineChart;