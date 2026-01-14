// ConflictResolutionModal.tsx - Modal for resolving offline sync conflicts
// Allows users to choose how to handle conflicts between local and server data

import { useState } from 'react';
import { logger } from '../utils/logger';
import { useOfflineActionQueue, type OfflineAction, type ConflictResolution } from '../services/offlineActionQueueService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import FormGrid from './ui/FormGrid';
import { HEIGHT_CLASSES } from '../config/heights';

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
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{title}</h4>
        <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-xs overflow-auto max-h-40">
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
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Merge Data</h4>
        {allKeys.map(key => {
          const inputId = `merge-${key}`;
          const localValueId = `merge-${key}-local`;
          const serverValueId = `merge-${key}-server`;
          return (
            <div key={key} className="space-y-1">
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                {key}
              </label>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-neutral-500">Local:</span>
                <span id={localValueId} className="text-xs text-neutral-700 dark:text-neutral-300 flex-1">
                  {JSON.stringify((conflict.data as Record<string, unknown>)?.[key] as unknown)}
                </span>
                <span className="text-xs text-neutral-500">Server:</span>
                <span id={serverValueId} className="text-xs text-neutral-700 dark:text-neutral-300 flex-1">
                  {JSON.stringify(serverData?.[key] as unknown)}
                </span>
              </div>
              <input
                id={inputId}
                type="text"
                value={String(mergedData?.[key] || '')}
                onChange={(e) => handleMergeDataChange(key, e.target.value)}
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                placeholder="Enter merged value"
                aria-label={`Merge value for ${key}`}
                aria-describedby={`${localValueId} ${serverValueId}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ Sync Conflict Detected"
      size="xl"
      animation="fade-in-up"
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          A conflict occurred when syncing your offline changes with server. Please choose how to resolve this.
        </p>

        {/* Conflict details */}
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

        {/* Data comparison */}
        <FormGrid>
          {formatData(conflict.data as Record<string, unknown> | null, 'Your Local Changes')}
          {formatData(serverData, 'Server Data')}
        </FormGrid>

        {/* Resolution options */}
        <div>
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Resolution Options</h3>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900">
              <input
                type="radio"
                name="resolution"
                value="keep_local"
                checked={selectedResolution === 'keep_local'}
                onChange={(e) => setSelectedResolution(e.target.value as ConflictResolution['resolution'])}
                className="mt-1"
                aria-describedby="keep_local_desc"
              />
              <div className="flex-1">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">Keep My Version</div>
                <div id="keep_local_desc" className="text-sm text-neutral-600 dark:text-neutral-400">
                  Overwrite server changes with your local changes. This may discard changes made by others.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900">
              <input
                type="radio"
                name="resolution"
                value="use_server"
                checked={selectedResolution === 'use_server'}
                onChange={(e) => setSelectedResolution(e.target.value as ConflictResolution['resolution'])}
                className="mt-1"
                aria-describedby="use_server_desc"
              />
              <div className="flex-1">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">Use Server Version</div>
                <div id="use_server_desc" className="text-sm text-neutral-600 dark:text-neutral-400">
                  Discard your local changes and keep server version. Your changes will be lost.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border border-neutral-200 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900">
              <input
                type="radio"
                name="resolution"
                value="merge"
                checked={selectedResolution === 'merge'}
                onChange={(e) => {
                  setSelectedResolution(e.target.value as ConflictResolution['resolution']);
                  if (!mergedData) {
                    setMergedData(conflict.data as Record<string, unknown>);
                  }
                }}
                className="mt-1"
                aria-describedby="merge_desc"
              />
              <div className="flex-1">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">Merge Changes</div>
                <div id="merge_desc" className="text-sm text-neutral-600 dark:text-neutral-400">
                  Combine your changes with server changes manually.
                </div>
              </div>
            </label>
          </div>

          {/* Merge editor */}
          {selectedResolution === 'merge' && (
            <div className="mt-4 p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700" role="region" aria-label="Merge data editor">
              {renderMergeEditor()}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        
        <Button
          onClick={handleResolve}
          disabled={isResolving || (selectedResolution === 'merge' && !mergedData)}
          variant="primary"
        >
          {isResolving ? 'Resolving...' : 'Resolve Conflict'}
        </Button>
      </div>
    </Modal>
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`⚠️ ${conflicts.length} Sync Conflict${conflicts.length > 1 ? 's' : ''}`}
      size="lg"
      animation="fade-in-up"
    >
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Please resolve each conflict to complete synchronization.
      </p>

      {/* Conflict list */}
      <div className={`flex-1 overflow-y-auto ${HEIGHT_CLASSES.MODAL.SCROLLABLE} mb-4`} role="list" aria-label="List of sync conflicts">
        <div className="space-y-3">
          {conflicts.map((conflict, index) => (
            <button
              key={conflict.id}
              type="button"
              className="w-full text-left border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 group"
              onClick={() => onConflictSelect(conflict)}
              aria-label={`View conflict ${index + 1}: ${conflict.type} ${conflict.entity}`}
              role="listitem"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {index + 1}. {conflict.type} {conflict.entity}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {conflict.endpoint}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Created: {new Date(conflict.timestamp).toLocaleString('id-ID')}
                  </div>
                  {conflict.lastError && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Error: {conflict.lastError}
                    </div>
                  )}
                </div>
                <div className="text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform ml-3" aria-hidden="true">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </div>
    </Modal>
  );
}
