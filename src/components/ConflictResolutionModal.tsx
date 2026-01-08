// ConflictResolutionModal.tsx - Modal for resolving offline sync conflicts
// Allows users to choose how to handle conflicts between local and server data

import React, { useState } from 'react';
import { logger } from '../utils/logger';
import { useOfflineActionQueue, type OfflineAction, type ConflictResolution } from '../services/offlineActionQueueService';

interface ConflictResolutionModalProps {
  conflict: OfflineAction;
  serverData: Record<string, unknown>;
  isOpen: boolean;
  onClose: () => void;
}

export function ConflictResolutionModal({
  conflict,
  serverData,
  isOpen,
  onClose
}: ConflictResolutionModalProps) {
  const { resolveConflict } = useOfflineActionQueue();
  const [selectedResolution, setSelectedResolution] = useState<ConflictResolution['resolution']>('keep_local');
  const [mergedData, setMergedData] = useState<Record<string, unknown> | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  if (!isOpen) return null;

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const resolution: ConflictResolution = {
        actionId: conflict.id,
        resolution: selectedResolution,
      };

      if (selectedResolution === 'merge' && mergedData) {
        resolution.mergedData = mergedData;
      }

      resolveConflict(resolution);
      onClose();
    } catch (error) {
      logger.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const formatData = (data: Record<string, unknown> | null, title: string) => {
    if (!data) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  const handleMergeDataChange = (key: string, value: string) => {
    setMergedData((prev) => ({
      ...(prev as Record<string, unknown> | null) || {},
      [key]: value
    }));
  };

  const renderMergeEditor = () => {
    const localKeys = Object.keys(conflict.data || {});
    const serverKeys = Object.keys(serverData || {});
    const allKeys = Array.from(new Set([...localKeys, ...serverKeys]));

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Merge Data</h4>
        {allKeys.map(key => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {key}
            </label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">Local:</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                {JSON.stringify((conflict.data as Record<string, unknown>)?.[key] as unknown)}
              </span>
              <span className="text-xs text-gray-500">Server:</span>
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                {JSON.stringify(serverData?.[key] as unknown)}
              </span>
            </div>
            <input
              type="text"
              value={String(mergedData?.[key] || '')}
              onChange={(e) => handleMergeDataChange(key, e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
              placeholder="Enter merged value"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50% z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            ⚠️ Sync Conflict Detected
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            A conflict occurred when syncing your offline changes with the server. Please choose how to resolve this.
          </p>
        </div>

        {/* Conflict details */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="text-sm">
              <strong>Action:</strong> {conflict.type} {conflict.entity}
            </div>
            <div className="text-sm mt-1">
              <strong>Endpoint:</strong> {conflict.endpoint}
            </div>
            <div className="text-sm mt-1">
              <strong>Last Error:</strong> {conflict.lastError}
            </div>
            <div className="text-sm mt-1">
              <strong>Created:</strong> {new Date(conflict.timestamp).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Data comparison */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formatData(conflict.data as Record<string, unknown> | null, 'Your Local Changes')}
            {formatData(serverData, 'Server Data')}
          </div>
        </div>

        {/* Resolution options */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Resolution Options</h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="resolution"
                value="keep_local"
                checked={selectedResolution === 'keep_local'}
                onChange={(e) => setSelectedResolution(e.target.value as ConflictResolution['resolution'])}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Keep My Version</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Overwrite server changes with your local changes. This may discard changes made by others.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="resolution"
                value="use_server"
                checked={selectedResolution === 'use_server'}
                onChange={(e) => setSelectedResolution(e.target.value as ConflictResolution['resolution'])}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Use Server Version</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Discard your local changes and keep the server version. Your changes will be lost.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="resolution"
                value="merge"
                checked={selectedResolution === 'merge'}
                onChange={(e) => {
                  setSelectedResolution(e.target.value as ConflictResolution['resolution']);
                  if (!mergedData) {
                    // Initialize merged data with local changes
                    setMergedData(conflict.data as Record<string, unknown>);
                  }
                }}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Merge Changes</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Combine your changes with server changes manually.
                </div>
              </div>
            </label>
          </div>

          {/* Merge editor */}
          {selectedResolution === 'merge' && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              {renderMergeEditor()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleResolve}
            disabled={isResolving || (selectedResolution === 'merge' && !mergedData)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isResolving ? 'Resolving...' : 'Resolve Conflict'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConflictListModalProps {
  conflicts: OfflineAction[];
  isOpen: boolean;
  onClose: () => void;
  onConflictSelect: (conflict: OfflineAction) => void;
}

export function ConflictListModal({
  conflicts,
  isOpen,
  onClose,
  onConflictSelect
}: ConflictListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50% z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            ⚠️ {conflicts.length} Sync Conflict{conflicts.length > 1 ? 's' : ''}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Please resolve each conflict to complete synchronization.
          </p>
        </div>

        {/* Conflict list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {conflicts.map((conflict, index) => (
              <div
                key={conflict.id}
                className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                onClick={() => onConflictSelect(conflict)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {index + 1}. {conflict.type} {conflict.entity}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {conflict.endpoint}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Created: {new Date(conflict.timestamp).toLocaleString('id-ID')}
                    </div>
                    {conflict.lastError && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Error: {conflict.lastError}
                      </div>
                    )}
                  </div>
                  <div className="text-red-600 dark:text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}