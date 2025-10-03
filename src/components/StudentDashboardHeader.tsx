import React from 'react';
import { Student } from '../data/studentData';
import NotificationBell from './NotificationBell';

interface StudentDashboardHeaderProps {
  student: Student;
  onLogout: () => void;
}

const StudentDashboardHeader: React.FC<StudentDashboardHeaderProps> = ({ student, onLogout }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={student.profileImage}
                alt={student.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {student.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {student.class} • {student.academicYear}
                </p>
              </div>
            </div>
            <NotificationBell />
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardHeader;