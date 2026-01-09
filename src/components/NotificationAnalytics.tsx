import React from 'react';
import { NotificationAnalytics } from '../types';
import ProgressBar from './ui/ProgressBar';

interface NotificationAnalyticsProps {
  analytics: NotificationAnalytics[];
}

const NotificationAnalyticsComponent: React.FC<NotificationAnalyticsProps> = ({ analytics }) => {
  const totalDelivered = analytics.reduce((sum, item) => sum + item.delivered, 0);
  const totalRead = analytics.reduce((sum, item) => sum + item.read, 0);
  const totalClicked = analytics.reduce((sum, item) => sum + item.clicked, 0);
  const totalDismissed = analytics.reduce((sum, item) => sum + item.dismissed, 0);

  const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0';
  const clickRate = totalRead > 0 ? ((totalClicked / totalRead) * 100).toFixed(1) : '0';

  const getRoleBreakdown = () => {
    const breakdown: Record<string, number> = {};
    analytics.forEach(item => {
      Object.entries(item.roleBreakdown).forEach(([role, count]) => {
        breakdown[role] = (breakdown[role] || 0) + count;
      });
    });
    return breakdown;
  };

  const roleBreakdown = getRoleBreakdown();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-neutral-900">Analytics Notifikasi</h3>

      {analytics.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <p>Belum ada data analytics</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{totalDelivered}</div>
              <div className="text-sm text-blue-600">Terkirim</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{totalRead}</div>
              <div className="text-sm text-green-600">Dibaca ({readRate}%)</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{totalClicked}</div>
              <div className="text-sm text-purple-600">Diklik ({clickRate}%)</div>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-neutral-600">{totalDismissed}</div>
              <div className="text-sm text-neutral-600">Disingkirkan</div>
            </div>
          </div>

          {/* Role Breakdown */}
          {Object.keys(roleBreakdown).length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-3">Distribusi Peran</h4>
              <div className="space-y-2">
                {Object.entries(roleBreakdown).map(([role, count]) => {
                  const percentageValue = totalDelivered > 0 ? (count / totalDelivered) * 100 : 0;
                  const percentage = percentageValue.toFixed(1);
                  return (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 capitalize">{role}</span>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={percentageValue}
                          size="md"
                          color="blue"
                          fullWidth={false}
                          aria-label={`${role} breakdown: ${count} (${percentage}%)`}
                        />
                        <span className="text-sm text-neutral-900 font-medium">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Analytics Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Terkirim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Dibaca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Diklik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rate Dibaca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Rate Klik
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {analytics.slice().reverse().map((item) => {
                    const itemReadRate = item.delivered > 0 ? ((item.read / item.delivered) * 100).toFixed(1) : '0';
                    const itemClickRate = item.read > 0 ? ((item.clicked / item.read) * 100).toFixed(1) : '0';
                    
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {new Date(item.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {item.delivered}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {item.read}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {item.clicked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            parseFloat(itemReadRate) >= 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {itemReadRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            parseFloat(itemClickRate) >= 20 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {itemClickRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationAnalyticsComponent;