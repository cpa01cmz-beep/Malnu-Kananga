import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { LineChartData } from '../../types/analytics.types';

interface PerformanceTrendChartProps {
  data: LineChartData;
  height?: number;
  showMovingAverage?: boolean;
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  data,
  height = 300,
  showMovingAverage = false,
}) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        {data.name}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-300 dark:stroke-neutral-600" />
          <XAxis
            dataKey="name"
            className="text-sm fill-neutral-600 dark:fill-neutral-400"
          />
          <YAxis className="text-sm fill-neutral-600 dark:fill-neutral-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {showMovingAverage && (
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface AttendanceChartProps {
  data: {
    day: string;
    present: number;
    absent: number;
    sick: number;
    permission: number;
    percentage: number;
  }[];
  height?: number;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Attendance by Day
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-300 dark:stroke-neutral-600" />
          <XAxis
            dataKey="day"
            className="text-sm fill-neutral-600 dark:fill-neutral-400"
          />
          <YAxis className="text-sm fill-neutral-600 dark:fill-neutral-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="present"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="sick"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="permission"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="absent"
            stackId="1"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface GradeDistributionChartProps {
  data: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    total: number;
  };
  height?: number;
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({
  data,
  height = 300,
}) => {
  const chartData = [
    { name: 'A', value: data.A, color: '#10b981' },
    { name: 'B', value: data.B, color: '#3b82f6' },
    { name: 'C', value: data.C, color: '#f59e0b' },
    { name: 'D', value: data.D, color: '#f97316' },
    { name: 'E', value: data.E, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Grade Distribution ({data.total} students)
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-300 dark:stroke-neutral-600" />
          <XAxis
            dataKey="name"
            className="text-sm fill-neutral-600 dark:fill-neutral-400"
          />
          <YAxis className="text-sm fill-neutral-600 dark:fill-neutral-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SubjectComparisonChartProps {
  data: {
    subject: string;
    averageScore: number;
    assignmentScore: number;
    midExamScore: number;
    finalExamScore: number;
  }[];
  height?: number;
}

export const SubjectComparisonChart: React.FC<SubjectComparisonChartProps> = ({
  data,
  height = 300,
}) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
        Subject Performance Comparison
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-300 dark:stroke-neutral-600" />
          <XAxis
            dataKey="subject"
            className="text-sm fill-neutral-600 dark:fill-neutral-400"
          />
          <YAxis domain={[0, 100]} className="text-sm fill-neutral-600 dark:fill-neutral-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="averageScore"
            name="Average"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="assignmentScore"
            name="Assignment"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="midExamScore"
            name="Mid Exam"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="finalExamScore"
            name="Final Exam"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
