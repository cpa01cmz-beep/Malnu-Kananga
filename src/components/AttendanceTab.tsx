import React from 'react';
import { AttendanceRecord, getAttendanceStats, AttendanceStats } from '../data/studentData';

interface AttendanceTabProps {
  attendanceData: AttendanceRecord[];
  attendanceStats: AttendanceStats;
  formatDate: (dateString: string) => string;
  getAttendanceColor: (_status: string) => string;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({
  attendanceData,
  attendanceStats,
  formatDate,
  getAttendanceColor
}) => {
  // Note: formatDate and getAttendanceColor are passed as props and used in JSX
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Kehadiran</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
            <p className="text-sm text-green-600">Hadir</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
            <p className="text-sm text-red-600">Alfa</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{attendanceStats.sick}</p>
            <p className="text-sm text-yellow-600">Sakit</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{attendanceStats.permitted}</p>
            <p className="text-sm text-blue-600">Izin</p>
          </div>
        </div>
        <div className="space-y-3">
          {attendanceData.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{record.subject}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${getAttendanceColor(record.status)}`}>
                  {record.status}
                </span>
                {record.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTab;