// OfflineIndicator.tsx - Offline status and action queue indicator component
// Shows users when they're offline and how many actions are queued

import React, { useEffect, useState } from 'react';
import { useOfflineActionQueue } from '../services/offlineActionQueueService';
import { useNetworkStatus } from '../utils/networkStatus';
import { logger } from '../utils/logger';

interface OfflineIndicatorProps {
  className?: string;
  showSyncButton?: boolean;
  showQueueCount?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function OfflineIndicator({
  className = '',
  showSyncButton = true,
  showQueueCount = true,
  position = 'top-right'
}: OfflineIndicatorProps) {
  const {
    getPendingCount,
    getFailedCount,
    sync,
    isSyncing,
    onSyncComplete
  } = useOfflineActionQueue();
  
  const { isOnline, isSlow } = useNetworkStatus();
  const [syncResult, setSyncResult] = useState<any>(null);
  const [showSyncStatus, setShowSyncStatus] = useState(false);

  const pendingCount = getPendingCount();
  const failedCount = getFailedCount();

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4', 
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  useEffect(() => {
    if (onSyncComplete) {
      return onSyncComplete((result) => {
        setSyncResult(result);
        setShowSyncStatus(true);
        logger.info('Sync completed', result);

        // Auto-hide sync status after 3 seconds
        setTimeout(() => {
          setShowSyncStatus(false);
        }, 3000);
      });
    }
  }, [onSyncComplete]);

  const handleSync = async () => {
    setShowSyncStatus(true);
    try {
      const result = await sync();
      setSyncResult(result);
    } catch (error) {
      logger.error('Manual sync failed', error);
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      });
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (isSlow) return 'bg-yellow-500';
    if (failedCount > 0) return 'bg-orange-500';
    if (pendingCount > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSlow) return 'Slow Connection';
    if (isSyncing) return 'Syncing...';
    if (failedCount > 0) return `${failedCount} Failed`;
    if (pendingCount > 0) return `${pendingCount} Pending`;
    return 'Online';
  };

  // Don't show if online and no pending actions
  if (isOnline && !isSlow && pendingCount === 0 && failedCount === 0 && !showSyncStatus) {
    return null;
  }

  return (
    <>
      {/* Main indicator */}
      <div className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end gap-2 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center gap-2 min-w-[120px]">
          {/* Status dot */}
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
          
          {/* Status text */}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </span>

          {/* Queue count badge */}
          {showQueueCount && (pendingCount > 0 || failedCount > 0) && (
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {pendingCount + failedCount}
            </span>
          )}

          {/* Sync button */}
          {showSyncButton && !isOnline && (pendingCount > 0 || failedCount > 0) && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs px-2 py-1 rounded transition-colors"
              title="Sync pending actions"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>

        {/* Sync status popup */}
        {showSyncStatus && syncResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-[200px] animate-in slide-in-from-top-2">
            <div className="text-sm font-medium mb-1">
              {syncResult.success ? 'Sync Complete' : 'Sync Failed'}
            </div>
            
            {syncResult.success ? (
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>✅ {syncResult.actionsProcessed} actions completed</div>
                {syncResult.actionsFailed > 0 && (
                  <div>❌ {syncResult.actionsFailed} actions failed</div>
                )}
                {syncResult.conflicts.length > 0 && (
                  <div>⚠️ {syncResult.conflicts.length} conflicts found</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-red-600 dark:text-red-400">
                {syncResult.error || 'Unknown sync error'}
              </div>
            )}
          </div>
        )}

        {/* Failed actions alert */}
        {failedCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
            <div className="text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <span>⚠️</span>
              <span>{failedCount} action{failedCount > 1 ? 's' : ''} failed to sync</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface QueueDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfflineQueueDetails({ isOpen, onClose }: QueueDetailsProps) {
  const {
    getQueue,
    getPendingCount,
    getFailedCount,
    sync,
    retryFailedActions,
    clearCompletedActions
  } = useOfflineActionQueue();

  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);

  const queue = getQueue();
  const pendingActions = queue.filter(action => action.status === 'pending');
  const failedActions = queue.filter(action => action.status === 'failed' || action.status === 'conflict');

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await sync();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Offline Action Queue</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Status and actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                isOnline 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              
              {getPendingCount() > 0 && (
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-sm font-medium">
                  {getPendingCount()} Pending
                </span>
              )}
              
              {getFailedCount() > 0 && (
                <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-sm font-medium">
                  {getFailedCount()} Failed
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {isOnline && getPendingCount() > 0 && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
              
              {getFailedCount() > 0 && (
                <button
                  onClick={retryFailedActions}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Retry Failed
                </button>
              )}
              
              <button
                onClick={clearCompletedActions}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Clear Completed
              </button>
            </div>
          </div>
        </div>

        {/* Action lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Pending actions */}
          {pendingActions.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Pending Actions ({pendingActions.length})
              </h3>
              <div className="space-y-2">
                {pendingActions.map(action => (
                  <div key={action.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium capitalize">{action.type}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">•</span>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">{action.entity}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(action.timestamp)}
                      </span>
                    </div>
                    {action.endpoint && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {action.endpoint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed actions */}
          {failedActions.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Failed Actions ({failedActions.length})
              </h3>
              <div className="space-y-2">
                {failedActions.map(action => (
                  <div key={action.id} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium capitalize">{action.type}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">•</span>
                        <span className="text-gray-700 dark:text-gray-300 ml-2">{action.entity}</span>
                        <span className="text-red-600 dark:text-red-400 ml-2">({action.status})</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(action.timestamp)}
                      </span>
                    </div>
                    {action.lastError && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Error: {action.lastError}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Retries: {action.retryCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {queue.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-lg mb-2">📋</div>
              <div>No queued actions</div>
              <div className="text-sm mt-1">All actions are synced!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}