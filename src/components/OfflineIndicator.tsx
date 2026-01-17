// OfflineIndicator.tsx - Offline status and action queue indicator component
// Shows users when they're offline and how many actions are queued

const formatActionType = (type: string) => {
  const typeMap: Record<string, string> = {
    'create': 'Create',
    'update': 'Update',
    'delete': 'Delete',
    'read': 'Read'
  };
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

import { useEffect, useState } from 'react';
import { useOfflineActionQueue, type SyncResult } from '../services/offlineActionQueueService';
import { useNetworkStatus } from '../utils/networkStatus';
import { logger } from '../utils/logger';
import Alert from './ui/Alert';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';
import Modal from './ui/Modal';

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
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
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
        actionsProcessed: 0,
        actionsFailed: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Sync failed']
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
        <Card
          role="status"
          aria-live="polite"
          padding="sm"
          className="flex items-center gap-2 min-w-[120px]"
        >
          {/* Status dot */}
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
          
          {/* Status text */}
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {getStatusText()}
          </span>

          {/* Queue count badge */}
          {showQueueCount && (pendingCount > 0 || failedCount > 0) && (
            <Badge variant="neutral" size="sm" rounded>
              {pendingCount + failedCount}
            </Badge>
          )}

          {/* Sync button */}
          {showSyncButton && !isOnline && (pendingCount > 0 || failedCount > 0) && (
            <Button
              variant="info"
              size="sm"
              onClick={handleSync}
              isLoading={isSyncing}
              disabled={isSyncing}
              title="Sync pending actions"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          )}
        </Card>

        {/* Sync status popup */}
        {showSyncStatus && syncResult && (
          <Card
            padding="sm"
            className="min-w-[200px] animate-in slide-in-from-top-2"
          >
            <div className="text-sm font-medium mb-1">
              {syncResult.success ? 'Sync Complete' : 'Sync Failed'}
            </div>
            
            {syncResult.success ? (
              <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
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
                {syncResult.errors?.join(', ') || 'Unknown sync error'}
              </div>
            )}
          </Card>
        )}

        {/* Failed actions alert */}
        {failedCount > 0 && (
          <Alert variant="error" size="sm" border="full" className="mb-3">
            {failedCount} action{failedCount > 1 ? 's' : ''} failed to sync
          </Alert>
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
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Offline Action Queue"
    >
      {/* Status and actions */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-4 pb-4">
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
                <Badge variant="info" size="sm" rounded>
                  {getPendingCount()} Pending
                </Badge>
              )}

              {getFailedCount() > 0 && (
                <Badge variant="error" size="sm" rounded>
                  {getFailedCount()} Failed
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              {isOnline && getPendingCount() > 0 && (
                <Button
                  variant="info"
                  size="sm"
                  onClick={handleSync}
                  isLoading={isSyncing}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              )}

              {getFailedCount() > 0 && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={retryFailedActions}
                >
                  Retry Failed
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={clearCompletedActions}
              >
                Clear Completed
              </Button>
            </div>
          </div>
        </div>

        {/* Action lists */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Pending actions */}
          {pendingActions.length > 0 && (
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Pending Actions ({pendingActions.length})
              </h3>
              <div className="space-y-2">
                {pendingActions.map(action => (
                  <div key={action.id} className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{formatActionType(action.type)}</span>
                        <span className="text-neutral-500 dark:text-neutral-400 ml-2">•</span>
                        <span className="text-neutral-700 dark:text-neutral-300 ml-2">{action.entity}</span>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatTimestamp(action.timestamp)}
                      </span>
                    </div>
                    {action.endpoint && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Failed Actions ({failedActions.length})
              </h3>
              <div className="space-y-2">
                {failedActions.map(action => (
                  <div key={action.id} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{formatActionType(action.type)}</span>
                        <span className="text-neutral-500 dark:text-neutral-400 ml-2">•</span>
                        <span className="text-neutral-700 dark:text-neutral-300 ml-2">{action.entity}</span>
                        <span className="text-red-600 dark:text-red-400 ml-2">({action.status})</span>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatTimestamp(action.timestamp)}
                      </span>
                    </div>
                    {action.lastError && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Error: {action.lastError}
                      </div>
                    )}
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Retries: {action.retryCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {queue.length === 0 && (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <div className="text-lg mb-2">📋</div>
              <div>No queued actions</div>
              <div className="text-sm mt-1">All actions are synced!</div>
            </div>
          )}
        </div>
    </Modal>
  );
}