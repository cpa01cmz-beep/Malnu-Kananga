/**
 * Collaborative Document Editing Service
 * Implements Operational Transformation (OT) for real-time document collaboration
 * Milestone 3.0 - Real-Time Collaboration
 */

import { CollaborativeDocument, DocumentOperation, DocumentChangeEvent, ConflictEvent, ConflictResolution, ConflictStrategy, OperationType } from '../types/realtime.types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

/**
 * Collaborative Editing Service
 * Handles real-time document synchronization using Operational Transformation
 */
class CollaborativeEditingService {
  private documents: Map<string, CollaborativeDocument> = new Map();
  private operationQueues: Map<string, DocumentOperation[]> = new Map();
  private subscribers: Map<string, Set<(event: DocumentChangeEvent) => void>> = new Map();
  private pendingTransforms: Map<string, DocumentOperation[]> = new Map();
  private autoSaveIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  // Configuration
  private readonly config = {
    maxOperations: 1000,
    operationRetention: 24 * 60 * 60 * 1000, // 24 hours
    autoSaveInterval: 30000, // 30 seconds
    conflictStrategy: ConflictStrategy.OPERATIONAL_TRANSFORM,
  };

  /**
   * Initialize a collaborative document
   */
  async initializeDocument(documentId: string, title: string, content: string, ownerId: string): Promise<CollaborativeDocument> {
    const document: CollaborativeDocument = {
      id: documentId,
      title,
      content,
      version: 0,
      operations: [],
      collaborators: [],
      lastModified: Date.now(),
      ownerId,
      isLocked: false,
    };

    this.documents.set(documentId, document);
    this.operationQueues.set(documentId, []);
    this.subscribers.set(documentId, new Set());

    await this.persistDocument(documentId);

    logger.info('Collaborative document initialized', { documentId, ownerId });
    return document;
  }

  /**
   * Get a document by ID
   */
  getDocument(documentId: string): CollaborativeDocument | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Apply an operation to a document
   */
  async applyOperation(documentId: string, operation: DocumentOperation): Promise<DocumentChangeEvent> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Check if document is locked by another user
    if (document.isLocked && document.lockedBy !== operation.userId) {
      throw new Error(`Document is locked by ${document.lockedBy}`);
    }

    // Transform operation against concurrent operations
    const transformed = await this.transformOperation(documentId, operation);

    // Apply the transformed operation
    const newContent = this.applyToContent(document.content, transformed);

    // Update document state
    document.content = newContent;
    document.version += 1;
    document.lastModified = Date.now();
    document.operations.push(transformed);

    // Prune old operations
    this.pruneOperations(document);

    // Persist document
    await this.persistDocument(documentId);

    // Notify subscribers
    const event: DocumentChangeEvent = {
      documentId,
      operation: transformed,
      version: document.version,
      applied: true,
    };

    this.notifySubscribers(documentId, event);

    logger.info('Operation applied', {
      documentId,
      operationId: operation.id,
      type: operation.type,
      userId: operation.userId,
      version: document.version,
    });

    return event;
  }

  /**
   * Transform an operation against concurrent operations
   */
  private async transformOperation(documentId: string, operation: DocumentOperation): Promise<DocumentOperation> {
    const pending = this.pendingTransforms.get(documentId) || [];

    let transformed = { ...operation };

    // Transform against each pending operation
    for (const pendingOp of pending) {
      transformed = this.transform(transformed, pendingOp);
    }

    // Add to pending transforms
    pending.push(operation);
    this.pendingTransforms.set(documentId, pending);

    return transformed;
  }

  /**
   * Operational Transformation: Transform two concurrent operations
   * Based on Jupiter algorithm (simplified)
   */
  private transform(op1: DocumentOperation, op2: DocumentOperation): DocumentOperation {
    // If operations don't overlap, return op1 as-is
    if (op1.position + (op1.length || 0) <= op2.position) {
      return op1;
    }

    if (op2.position + (op2.length || 0) <= op1.position) {
      // op2 comes before op1, adjust op1's position
      return {
        ...op1,
        position: op1.position + (op2.length || 0),
      };
    }

    // Operations overlap - apply transformation logic
    const result = { ...op1 };

    switch (op1.type) {
      case 'insert':
        return this.transformInsert(result, op2);
      case 'delete':
        return this.transformDelete(result, op2);
      case 'retain':
        return result;
      default:
        return result;
    }
  }

  /**
   * Transform insert operation
   */
  private transformInsert(insOp: DocumentOperation, otherOp: DocumentOperation): DocumentOperation {
    if (otherOp.type === 'insert') {
      if (otherOp.position <= insOp.position) {
        return { ...insOp, position: insOp.position + (otherOp.content?.length || 0) };
      }
    } else if (otherOp.type === 'delete') {
      if (otherOp.position < insOp.position) {
        const deleteLen = otherOp.length || 0;
        const overlap = Math.min(deleteLen, insOp.position - otherOp.position);
        return { ...insOp, position: insOp.position - overlap };
      }
    }

    return insOp;
  }

  /**
   * Transform delete operation
   */
  private transformDelete(delOp: DocumentOperation, otherOp: DocumentOperation): DocumentOperation {
    if (otherOp.type === 'insert') {
      if (otherOp.position < delOp.position) {
        return { ...delOp, position: delOp.position + (otherOp.content?.length || 0) };
      }
    } else if (otherOp.type === 'delete') {
      if (otherOp.position <= delOp.position) {
        const deleteLen = otherOp.length || 0;
        const overlap = Math.min(deleteLen, (delOp.length || 0) + delOp.position - otherOp.position);
        return { ...delOp, length: (delOp.length || 0) - overlap };
      }
    }

    return delOp;
  }

  /**
   * Apply operation to content string
   */
  private applyToContent(content: string, operation: DocumentOperation): string {
    switch (operation.type) {
      case 'insert':
        return (
          content.slice(0, operation.position) +
          (operation.content || '') +
          content.slice(operation.position)
        );
      case 'delete':
        return (
          content.slice(0, operation.position) +
          content.slice(operation.position + (operation.length || 0))
        );
      case 'retain':
        return content;
      case 'replace':
        return (
          content.slice(0, operation.position) +
          (operation.content || '') +
          content.slice(operation.position + (operation.length || 0))
        );
      default:
        return content;
    }
  }

  /**
   * Prune old operations to prevent memory bloat
   */
  private pruneOperations(document: CollaborativeDocument): void {
    const cutoff = Date.now() - this.config.operationRetention;

    if (document.operations.length > this.config.maxOperations) {
      document.operations = document.operations.filter(op => op.timestamp > cutoff);
    }
  }

  /**
   * Lock a document for editing
   */
  async lockDocument(documentId: string, userId: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    if (document.isLocked && document.lockedBy !== userId) {
      throw new Error(`Document is locked by ${document.lockedBy}`);
    }

    document.isLocked = true;
    document.lockedBy = userId;
    document.lockedAt = Date.now();

    await this.persistDocument(documentId);

    logger.info('Document locked', { documentId, userId });
  }

  /**
   * Unlock a document
   */
  async unlockDocument(documentId: string, userId: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    if (document.lockedBy !== userId) {
      throw new Error(`Document is not locked by this user`);
    }

    document.isLocked = false;
    document.lockedBy = undefined;
    document.lockedAt = undefined;

    await this.persistDocument(documentId);

    logger.info('Document unlocked', { documentId, userId });
  }

  /**
   * Add a collaborator to a document
   */
  async addCollaborator(documentId: string, userId: string, userName: string, role: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const existing = document.collaborators.find(c => c.userId === userId);
    if (existing) {
      existing.isConnected = true;
      existing.lastActivity = Date.now();
      return;
    }

    document.collaborators.push({
      userId,
      userName,
      role: role as 'admin' | 'teacher' | 'student' | 'parent',
      isConnected: true,
      lastActivity: Date.now(),
      isEditing: false,
    });

    await this.persistDocument(documentId);

    logger.info('Collaborator added', { documentId, userId, userName });
  }

  /**
   * Remove a collaborator from a document
   */
  async removeCollaborator(documentId: string, userId: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const collaborator = document.collaborators.find(c => c.userId === userId);
    if (collaborator) {
      collaborator.isConnected = false;
      collaborator.lastActivity = Date.now();
    }

    await this.persistDocument(documentId);

    logger.info('Collaborator removed', { documentId, userId });
  }

  /**
   * Update collaborator cursor position
   */
  async updateCursor(documentId: string, userId: string, cursor: { line: number; column: number }): Promise<void> {
    const document = this.documents.get(documentId);
    if (!document) {
      return;
    }

    const collaborator = document.collaborators.find(c => c.userId === userId);
    if (collaborator) {
      collaborator.cursor = cursor;
      collaborator.lastActivity = Date.now();
    }

    // Notify other subscribers (excluding self)
    this.notifySubscribers(documentId, {
      documentId,
      operation: {
        id: `cursor-${Date.now()}`,
        type: OperationType.RETAIN,
        position: 0,
        userId,
        timestamp: Date.now(),
        documentId,
      },
      version: document?.version || 0,
      applied: true,
    });
  }

  /**
   * Subscribe to document changes
   */
  subscribe(documentId: string, callback: (event: DocumentChangeEvent) => void): () => void {
    if (!this.subscribers.has(documentId)) {
      this.subscribers.set(documentId, new Set());
    }

    this.subscribers.get(documentId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(documentId)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of a document change
   */
  private notifySubscribers(documentId: string, event: DocumentChangeEvent): void {
    const subscribers = this.subscribers.get(documentId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error notifying subscriber', { documentId, error });
        }
      });
    }
  }

  /**
   * Persist document to localStorage
   */
  private async persistDocument(documentId: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (!document) {
      return;
    }

    const key = `${STORAGE_KEYS.COLLABORATIVE_DOCUMENTS}_${documentId}`;
    localStorage.setItem(key, JSON.stringify(document));
  }

  /**
   * Load document from localStorage
   */
  async loadDocument(documentId: string): Promise<CollaborativeDocument | null> {
    const key = `${STORAGE_KEYS.COLLABORATIVE_DOCUMENTS}_${documentId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const document = JSON.parse(stored) as CollaborativeDocument;
        this.documents.set(documentId, document);
        this.operationQueues.set(documentId, []);
        if (!this.subscribers.has(documentId)) {
          this.subscribers.set(documentId, new Set());
        }
        return document;
      } catch (error) {
        logger.error('Error loading document from storage', { documentId, error });
      }
    }

    return null;
  }

  /**
   * Start auto-save interval for a document
   */
  startAutoSave(documentId: string): void {
    if (this.autoSaveIntervals.has(documentId)) {
      return;
    }

    const interval = setInterval(() => {
      this.persistDocument(documentId);
    }, this.config.autoSaveInterval);

    this.autoSaveIntervals.set(documentId, interval);
  }

  /**
   * Stop auto-save interval for a document
   */
  stopAutoSave(documentId: string): void {
    const interval = this.autoSaveIntervals.get(documentId);
    if (interval) {
      clearInterval(interval);
      this.autoSaveIntervals.delete(documentId);
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    this.documents.delete(documentId);
    this.operationQueues.delete(documentId);
    this.subscribers.delete(documentId);
    this.pendingTransforms.delete(documentId);
    this.stopAutoSave(documentId);

    const key = `${STORAGE_KEYS.COLLABORATIVE_DOCUMENTS}_${documentId}`;
    localStorage.removeItem(key);

    logger.info('Document deleted', { documentId });
  }

  /**
   * Detect conflicts in operations
   */
  detectConflicts(documentId: string): ConflictEvent[] {
    const document = this.documents.get(documentId);
    if (!document) {
      return [];
    }

    const conflicts: ConflictEvent[] = [];
    const operations = document.operations.slice(-10); // Check recent operations

    for (let i = 0; i < operations.length; i++) {
      for (let j = i + 1; j < operations.length; j++) {
        const op1 = operations[i];
        const op2 = operations[j];

        if (this.operationsConflict(op1, op2)) {
          conflicts.push({
            id: `conflict-${Date.now()}-${i}-${j}`,
            type: 'document',
            resourceId: documentId,
            operations: [op1, op2],
            detectedAt: Date.now(),
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two operations conflict
   */
  private operationsConflict(op1: DocumentOperation, op2: DocumentOperation): boolean {
    // Same user can't conflict with themselves
    if (op1.userId === op2.userId) {
      return false;
    }

    // Operations at the same position with overlapping ranges
    const op1End = op1.position + (op1.length || 0);
    const op2End = op2.position + (op2.length || 0);

    return op1.position < op2End && op2.position < op1End;
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void> {
    // In a real implementation, this would apply the resolution strategy
    // For now, we'll log the resolution
    logger.info('Conflict resolved', { conflictId, resolution });
  }

  /**
   * Clear all documents (for testing)
   */
  async clearAllDocuments(): Promise<void> {
    this.documents.clear();
    this.operationQueues.clear();
    this.subscribers.clear();
    this.pendingTransforms.clear();

    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.COLLABORATIVE_DOCUMENTS)) {
        localStorage.removeItem(key);
      }
    });

    // Clear auto-save intervals
    this.autoSaveIntervals.forEach(interval => clearInterval(interval));
    this.autoSaveIntervals.clear();
  }

  /**
   * Get statistics about a document
   */
  getDocumentStats(documentId: string): {
    version: number;
    operationCount: number;
    collaboratorCount: number;
    isLocked: boolean;
  } | undefined {
    const document = this.documents.get(documentId);
    if (!document) {
      return undefined;
    }

    return {
      version: document.version,
      operationCount: document.operations.length,
      collaboratorCount: document.collaborators.length,
      isLocked: document.isLocked,
    };
  }
}

// Export singleton instance
export const collaborativeEditingService = new CollaborativeEditingService();

// Export class for testing
export { CollaborativeEditingService };
