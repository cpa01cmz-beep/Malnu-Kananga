import React from 'react';
import { NotificationAnalytics } from '../types';
import ProgressBar from './ui/ProgressBar';
import { EmptyState } from './ui/LoadingState';
import Card from './ui/Card';
import Badge from './ui/Badge';

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
        <EmptyState message="Belum ada data analytics" size="md" />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="default" padding="sm" rounded="lg" shadow="none" border="none" className="bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{totalDelivered}</div>
              <div className="text-sm text-blue-600 dark:text-blue-300">Terkirim</div>
            </Card>
            <Card variant="default" padding="sm" rounded="lg" shadow="none" border="none" className="bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">{totalRead}</div>
              <div className="text-sm text-green-600 dark:text-green-300">Dibaca ({readRate}%)</div>
            </Card>
            <Card variant="default" padding="sm" rounded="lg" shadow="none" border="none" className="bg-purple-50 dark:bg-purple-900/20">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{totalClicked}</div>
              <div className="text-sm text-purple-600 dark:text-purple-300">Diklik ({clickRate}%)</div>
            </Card>
            <Card variant="default" padding="sm" rounded="lg" shadow="none" border="none" className="bg-neutral-50 dark:bg-neutral-900/50">
              <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-300">{totalDismissed}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">Disingkirkan</div>
            </Card>
          </div>

          {/* Role Breakdown */}
          {Object.keys(roleBreakdown).length > 0 && (
            <Card variant="default" padding="md" rounded="lg" shadow="md" border="neutral-200">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Distribusi Peran</h4>
              <div className="space-y-2">
                {Object.entries(roleBreakdown).map(([role, count]) => {
                  const percentageValue = totalDelivered > 0 ? (count / totalDelivered) * 100 : 0;
                  const percentage = percentageValue.toFixed(1);
                  return (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-300 capitalize">{role}</span>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={percentageValue}
                          size="md"
                          color="blue"
                          fullWidth={false}
                          aria-label={`${role} breakdown: ${count} (${percentage}%)`}
                        />
                        <span className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Detailed Analytics Table */}
          <Card variant="default" padding="none" rounded="lg" shadow="md" border="neutral-200" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Terkirim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Dibaca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Diklik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Rate Dibaca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Rate Klik
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {analytics.slice().reverse().map((item) => {
                    const itemReadRate = item.delivered > 0 ? ((item.read / item.delivered) * 100).toFixed(1) : '0';
                    const itemClickRate = item.read > 0 ? ((item.clicked / item.read) * 100).toFixed(1) : '0';

                    return (
                      <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          {new Date(item.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          {item.delivered}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          {item.read}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          {item.clicked}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          <Badge
                            variant={parseFloat(itemReadRate) >= 50 ? 'success' : 'warning'}
                            size="md"
                            rounded
                          >
                            {itemReadRate}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          <Badge
                            variant={parseFloat(itemClickRate) >= 20 ? 'success' : 'warning'}
                            size="md"
                            rounded
                          >
                            {itemClickRate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default NotificationAnalyticsComponent;