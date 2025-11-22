import React from 'react';
import { Announcement } from '../data/studentData';

interface AnnouncementsTabProps {
  announcements: Announcement[];
  formatDate: () => string;
}

const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({ announcements, formatDate }) => {
  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div key={announcement.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow ${!announcement.isRead ? 'border-l-4 border-green-500' : ''}`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {announcement.title}
                  {!announcement.isRead && (
                    <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{formatDate(announcement.date)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.category === 'Akademik' ? 'text-blue-600 bg-blue-100 dark:bg-blue-900' :
                    announcement.category === 'Kegiatan' ? 'text-green-600 bg-green-100 dark:bg-green-900' :
                    announcement.category === 'Pengumuman' ? 'text-purple-600 bg-purple-100 dark:bg-purple-900' :
                    'text-gray-600 bg-gray-100 dark:bg-gray-900'
                  }`}>
                    {announcement.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.priority === 'Tinggi' ? 'text-red-600 bg-red-100 dark:bg-red-900' :
                    announcement.priority === 'Sedang' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900' :
                    'text-green-600 bg-green-100 dark:bg-green-900'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{announcement.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsTab;