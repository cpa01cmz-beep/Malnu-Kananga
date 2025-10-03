import React from 'react';
import { ScheduleItem } from '../data/studentData';

interface ScheduleTabProps {
  weeklySchedule: ScheduleItem[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ weeklySchedule }) => {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  return (
    <div className="space-y-6">
      {days.map((day) => {
        const daySchedule = weeklySchedule.filter(item => item.day === day);
        return (
          <div key={day} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jadwal {day}</h3>
            </div>
            <div className="p-6">
              {daySchedule.length > 0 ? (
                <div className="space-y-4">
                  {daySchedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[100px]">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.time}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.subject}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.subjectCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.teacher}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.room}</p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                          item.type === 'Teori'
                            ? 'text-blue-600 bg-blue-100 dark:bg-blue-900'
                            : 'text-green-600 bg-green-100 dark:bg-green-900'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Tidak ada jadwal untuk hari {day}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleTab;