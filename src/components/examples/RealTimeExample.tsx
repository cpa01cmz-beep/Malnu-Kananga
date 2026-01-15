import { useState, useEffect } from 'react';
import { useWebSocket, useRealtimeGrades, useRealtimeAnnouncements } from '../../hooks/useWebSocket';
import { WebSocketStatus } from '../WebSocketStatus';
import { logger } from '../../utils/logger';
import { NotificationType } from '../../types';
import type { RealTimeEvent } from '../../services/webSocketService';

// Missing types - add temporary definitions
interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  subject?: string;
  score: number;
  type: string;
  date: string;
  semester: string;
  academicYear: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  author?: string;
  classId?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

/**
 * Example component demonstrating WebSocket real-time features
 * Shows real-time grades and announcements updates
 */
export function RealTimeExample() {
  const { isConnected, isConnecting, subscribe } = useWebSocket();
  const grades = useRealtimeGrades();
  const announcements = useRealtimeAnnouncements();
  const [notification, setNotification] = useState<string>('');

  // Subscribe to custom events
  useEffect(() => {
    const unsubscribe = subscribe(
      'notification_created',
      (event: RealTimeEvent) => {
        const notificationData = event.data as Notification;
        setNotification(`New notification: ${notificationData.title}`);
        // Auto-clear notification after 5 seconds
        setTimeout(() => setNotification(''), 5000);
      }
    );

    return unsubscribe;
  }, [subscribe]);

  const handleCreateTestGrade = () => {
    // This would typically be an API call, but for demo we log
    logger.info('Creating test grade (WebSocket event will be received when backend is implemented)');
  };

  const handleCreateTestAnnouncement = () => {
    logger.info('Creating test announcement (WebSocket event will be received when backend is implemented)');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          Real-Time WebSocket Demo
        </h1>
        
        {/* Connection Status */}
        <div className="mb-6">
          <WebSocketStatus showReconnectButton={true} />
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">{notification}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-md">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Connection</h3>
            <p className={`text-lg font-semibold ${
              isConnected ? 'text-green-600' : 
              isConnecting ? 'text-blue-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </p>
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-md">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Real-time Grades</h3>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{grades.length}</p>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-md">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Announcements</h3>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{announcements.length}</p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleCreateTestGrade}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Test Grade
          </button>
          <button
            onClick={handleCreateTestAnnouncement}
            disabled={!isConnected}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Test Announcement
          </button>
        </div>
      </div>

      {/* Real-time Grades Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Real-Time Grades</h2>
        {grades.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">No grades available. Create a test grade to see real-time updates.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {grades.map((grade: Grade) => (
                  <tr key={grade.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                    <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                      {grade.studentId}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                      {grade.subject || `Subject ${grade.subjectId}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        grade.score >= 90 ? 'bg-green-100 text-green-800' :
                        grade.score >= 80 ? 'bg-blue-100 text-blue-800' :
                        grade.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                      {new Date().toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-time Announcements Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Real-Time Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">No announcements available. Create a test announcement to see real-time updates.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement: Announcement) => (
              <div key={announcement.id} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{announcement.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{announcement.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    By {announcement.author || 'System'} • {announcement.priority}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    Just now
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Debug Information</h3>
        <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
          <p>WebSocket Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
          <p>Test this component by:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Opening this page in multiple tabs</li>
            <li>Creating grades and announcements in one tab</li>
            <li>Watching real-time updates appear in other tabs</li>
            <li>Testing offline behavior by disabling network</li>
            <li>Testing reconnection by toggling network</li>
          </ul>
        </div>
      </div>
    </div>
  );
}