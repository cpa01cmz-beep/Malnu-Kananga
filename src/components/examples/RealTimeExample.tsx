import React, { useState } from 'react';
import { useWebSocket, useRealtimeGrades, useRealtimeAnnouncements } from '../hooks/useWebSocket';
import { WebSocketStatus } from '../components/WebSocketStatus';
import { logger } from '../utils/logger';

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
  React.useEffect(() => {
    const unsubscribe = subscribe(
      'notification_created',
      (event) => {
        const notificationData = event.data as any;
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
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
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Connection</h3>
            <p className={`text-lg font-semibold ${
              isConnected ? 'text-green-600' : 
              isConnecting ? 'text-blue-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Real-time Grades</h3>
            <p className="text-lg font-semibold text-gray-900">{grades.length}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Announcements</h3>
            <p className="text-lg font-semibold text-gray-900">{announcements.length}</p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleCreateTestGrade}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Test Grade
          </button>
          <button
            onClick={handleCreateTestAnnouncement}
            disabled={!isConnected}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Test Announcement
          </button>
        </div>
      </div>

      {/* Real-time Grades Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Grades</h2>
        {grades.length === 0 ? (
          <p className="text-gray-500">No grades available. Create a test grade to see real-time updates.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade: any) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        grade.score >= 90 ? 'bg-green-100 text-green-800' :
                        grade.score >= 80 ? 'bg-blue-100 text-blue-800' :
                        grade.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements available. Create a test announcement to see real-time updates.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement: any) => (
              <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                <p className="text-gray-600">{announcement.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    By {announcement.author} • {announcement.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    Just now
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information</h3>
        <div className="text-xs text-gray-600 space-y-1">
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