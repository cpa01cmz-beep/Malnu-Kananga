import { useWebSocket } from '../hooks/useWebSocket';
import { WifiIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface WebSocketStatusProps {
  className?: string;
  showReconnectButton?: boolean;
  compact?: boolean;
}

/**
 * Component to display WebSocket connection status
 * Provides visual feedback and manual reconnection control
 */
export function WebSocketStatus({ 
  className = '', 
  showReconnectButton = true,
  compact = false 
}: WebSocketStatusProps) {
  const { connectionState, isConnected, isConnecting, isReconnecting, reconnect } = useWebSocket();

  const getStatusIcon = () => {
    if (isConnecting || isReconnecting) {
      return <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (isConnected) {
      return <WifiIcon className="w-4 h-4 text-green-500" />;
    }
    return <WifiIcon className="w-4 h-4 text-red-500 opacity-50" />;
  };

  const getStatusText = () => {
    if (isReconnecting) {
      return `Reconnecting (${connectionState.reconnectAttempts}/${5})...`;
    }
    if (isConnecting) {
      return 'Connecting...';
    }
    if (isConnected) {
      return 'Real-time sync active';
    }
    return 'Offline mode';
  };

  const getStatusColor = () => {
    if (isConnected) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    if (isConnecting || isReconnecting) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${getStatusColor()} ${className}`}>
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
        {!isConnected && showReconnectButton && (
          <button
            onClick={() => reconnect()}
            aria-label="Reconnect WebSocket"
            className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            title="Reconnect"
          >
            <ArrowPathIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()} ${className}`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div>
          <p className="font-medium text-sm">{getStatusText()}</p>
          {!isConnected && (
            <p className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
              <ExclamationTriangleIcon className="w-3 h-3" />
              Using fallback polling (30s intervals)
            </p>
          )}
        </div>
      </div>
      
      {!isConnected && showReconnectButton && (
        <button
          onClick={() => reconnect()}
          disabled={isConnecting || isReconnecting}
          aria-label="Reconnect WebSocket connection"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/50 dark:bg-neutral-700/50 hover:bg-white dark:hover:bg-neutral-600/70 text-neutral-900 dark:text-neutral-100 rounded-md border border-white/30 dark:border-neutral-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <ArrowPathIcon className="w-3 h-3" />
            Reconnect
        </button>
      )}
    </div>
  );
}

/**
 * Small indicator badge for inline connection status
 */
export function WebSocketIndicator({ className = '' }: { className?: string }) {
  const { isConnected, isConnecting, isReconnecting } = useWebSocket();

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500';
    if (isConnecting || isReconnecting) return 'bg-blue-500';
    return 'bg-red-500';
  };

  const getTooltip = () => {
    if (isReconnecting) return 'Reconnecting...';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Real-time sync active';
    return 'Offline mode';
  };

  return (
    <div
      className={`w-2 h-2 rounded-full ${getStatusColor()} ${className}`}
      title={getTooltip()}
      role="status"
      aria-label={getTooltip()}
    />
  );
}

/**
 * Connection status panel with detailed information
 */
export function WebSocketStatusPanel({ className = '' }: { className?: string }) {
  const { connectionState, isConnected, isConnecting, isReconnecting, reconnect } = useWebSocket();

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className={`p-4 bg-white dark:bg-neutral-800 rounded-lg border shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Real-Time Sync Status</h3>
        <WebSocketIndicator />
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
          <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
{isReconnecting ? `Reconnecting (${connectionState.reconnectAttempts}/${5})...` : 
           isConnecting ? 'Connecting...' : 
           isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Last Connected */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">Last Connected:</span>
          <span className="text-neutral-900 dark:text-neutral-100">{formatTime(connectionState.lastConnected)}</span>
        </div>

        {/* Reconnection Attempts */}
        {connectionState.reconnectAttempts > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Reconnect Attempts:</span>
            <span className="text-orange-600 font-medium">
              {connectionState.reconnectAttempts} / 5
            </span>
          </div>
        )}

        {/* Active Subscriptions */}
        {connectionState.subscriptions.size > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Active Subscriptions:</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">
              {connectionState.subscriptions.size} events
            </span>
          </div>
        )}

        {/* Reconnect Button */}
        {!isConnected && (
          <div className="pt-2 border-t">
            <button
              onClick={() => reconnect()}
              disabled={isConnecting || isReconnecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting || isReconnecting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4" />
                  Reconnect Now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

