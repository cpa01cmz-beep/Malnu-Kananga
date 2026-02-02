# Large File Refactoring - Implementation Guide

## Overview
This document provides detailed guidance for refactoring three large files (>1,500 lines each) in the MA Malnu Kananga codebase.

## Files to Refactor

### 1. src/services/unifiedNotificationManager.ts (1,596 lines)

**Current Structure**: Single class managing push, email, voice notifications, templates, analytics, batches

**Target Structure**:
```
src/services/notifications/
  ├── unifiedNotificationManager.ts        (main orchestrator, ~400 lines)
  ├── voiceNotificationHandler.ts            (voice TTS, ~250 lines)
  ├── pushNotificationHandler.ts             (push subscriptions, ~200 lines)
  ├── emailNotificationHandler.ts            (email sending, ~150 lines)
  ├── notificationHistoryHandler.ts           (history management, ~200 lines)
  ├── notificationAnalyticsHandler.ts         (analytics tracking, ~150 lines)
  ├── notificationTemplatesHandler.ts         (template management, ~150 lines)
  └── types.ts                            (notification types, ~100 lines)
```

**Refactoring Steps**:

1. **Create Module Directory**
   ```bash
   mkdir -p src/services/notifications
   ```

2. **Extract Voice Notification Handler** (COMPLETED)
   - Create `src/services/notifications/voiceNotificationHandler.ts`
   - Extract methods: `announceNotification()`, `stopCurrentVoiceNotification()`, `skipCurrentVoiceNotification()`, `clearVoiceQueue()`, `getVoiceQueue()`, `getVoiceHistory()`, `clearVoiceHistory()`, `isCurrentlySpeaking()`
   - Extract state: `voiceQueue`, `voiceHistory`, `isProcessingVoice`, `synthesisService`
   - Export: `VoiceNotificationHandler` class

3. **Extract Push Notification Handler**
   - Create `src/services/notifications/pushNotificationHandler.ts`
   - Extract methods: `requestPermission()`, `subscribeToPush()`, `unsubscribeFromPush()`, `getSubscription()`
   - Extract state: `swRegistration`, `subscription`
   - Export: `PushNotificationHandler` class

4. **Extract Email Notification Handler**
   - Create `src/services/notifications/emailNotificationHandler.ts`
   - Extract method: `sendEmailNotification()`
   - Import: `getEmailNotificationService()` from `emailNotificationService`
   - Export: `EmailNotificationHandler` class

5. **Extract History Handler**
   - Create `src/services/notifications/notificationHistoryHandler.ts`
   - Extract methods: `addToHistory()`, `getUnifiedHistory()`, `markAsRead()`, `clearUnifiedHistory()`
   - Extract state: `history`
   - Export: `NotificationHistoryHandler` class

6. **Extract Analytics Handler**
   - Create `src/services/notifications/notificationAnalyticsHandler.ts`
   - Extract methods: `trackNotification()`, `getAnalytics()`, `clearAnalytics()`
   - Extract state: `analytics`
   - Export: `NotificationAnalyticsHandler` class

7. **Extract Templates Handler**
   - Create `src/services/notifications/notificationTemplatesHandler.ts`
   - Extract methods: `initializeDefaultTemplates()`, `saveTemplates()`, `loadTemplates()`, `getTemplate()`, `setTemplate()`, `deleteTemplate()`
   - Extract state: `templates`, `defaultTemplates`
   - Export: `NotificationTemplatesHandler` class

8. **Create Main Orchestrator**
   - Create `src/services/notifications/unifiedNotificationManager.ts`
   - Import all handler modules
   - Keep methods: `showNotification()`, `showLocalNotification()`, `registerEventListener()`, `cleanup()`
   - Delegate to handlers: voice, push, email, history, analytics, templates
   - Maintain backward compatibility: Export singleton instance

9. **Update Imports Across Codebase**
   - Keep old path for backward compatibility: `export { unifiedNotificationManager } from './unifiedNotificationManager'`
   - Search and replace: `import { unifiedNotificationManager } from '../services/unifiedNotificationManager'`
   - Update to: `import { unifiedNotificationManager } from '../services/notifications/unifiedNotificationManager'`
   - Files to update (from grep results):
     - src/App.tsx
     - src/components/AssignmentCreation.tsx
     - src/components/UserProfileEditor.tsx
     - src/components/NotificationHistory.tsx
     - src/components/AnnouncementManager.tsx
     - src/components/MaterialUpload.tsx
     - src/services/parentGradeNotificationService.ts
     - src/services/ppdbIntegrationService.ts

10. **Delete Original File**
    ```bash
    rm src/services/unifiedNotificationManager.ts
    ```

11. **Verify Tests Pass**
    ```bash
    npm test
    npm run typecheck
    npm run lint
    ```

### 2. src/components/GradingManagement.tsx (1,904 lines)

**Current Structure**: Single React component with OCR, AI, CSV, offline, voice, PDF export, validation

**Target Structure**:
```
src/components/grading/
  ├── GradingManagement.tsx              (main container, ~250 lines)
  ├── GradingList.tsx                   (students table, ~400 lines)
  ├── GradeInputRow.tsx                  (single row edit, ~250 lines)
  ├── GradingActions.tsx                 (import/export/AI/OCR buttons, ~200 lines)
  ├── GradingStats.tsx                   (statistics panel, ~150 lines)
  ├── AIPanel.tsx                       (AI insights, ~150 lines)
  ├── OCRPanel.tsx                       (OCR upload/review, ~200 lines)
  ├── CSVImportPanel.tsx                 (CSV import, ~150 lines)
  └── useGradingData.ts                 (custom hook, ~200 lines)
```

**Refactoring Steps**:

1. **Create Module Directory**
   ```bash
   mkdir -p src/components/grading
   ```

2. **Extract Custom Hook**
   - Create `src/components/grading/useGradingData.ts`
   - Extract: `fetchStudentsAndGrades()`, `handleGradeChange()`, `handleGradeSave()`, `handleBatchSave()`
   - Extract state: `grades`, `loading`, `error`, `hasUnsavedChanges`, `queuedGradeUpdates`
   - Export: `useGradingData()` hook

3. **Extract Grade Input Row Component**
   - Create `src/components/grading/GradeInputRow.tsx`
   - Extract: Single row render with assignment, mid, final inputs
   - Props: `student`, `isEditing`, `onEdit`, `onSave`, `onReset`
   - Export: `GradeInputRow` component

4. **Extract Grading List Component**
   - Create `src/components/grading/GradingList.tsx`
   - Extract: Main table with headers and row rendering
   - Props: `grades`, `isEditing`, `onEdit`, `onSave`, `onReset`, `isBatchMode`, `selectedStudents`
   - Export: `GradingList` component

5. **Extract Grading Actions Component**
   - Create `src/components/grading/GradingActions.tsx`
   - Extract: Import CSV, Export PDF, AI Analysis, OCR, Batch operations
   - Props: `onImportCSV`, `onExportPDF`, `onAnalyze`, `onOCR`, `onBatchSave`, `onResetAll`
   - Export: `GradingActions` component

6. **Extract Grading Stats Component**
   - Create `src/components/grading/GradingStats.tsx`
   - Extract: Statistics panel with averages, grade distribution
   - Props: `grades`, `showStats`
   - Export: `GradingStats` component

7. **Extract AI Panel Component**
   - Create `src/components/grading/AIPanel.tsx`
   - Extract: AI insights display with generate button
   - Props: `isAnalyzing`, `analysisResult`, `onGenerate`, `onClose`
   - Export: `AIPanel` component

8. **Extract OCR Panel Component**
   - Create `src/components/grading/OCRPanel.tsx`
   - Extract: OCR upload, processing, review modal
   - Props: `isOCRProcessing`, `ocrProgress`, `ocrReviewData`, `onOCRUpload`, `onOCRReviewConfirm`, `onOCRReviewCancel`
   - Export: `OCRPanel` component

9. **Extract CSV Import Panel Component**
   - Create `src/components/grading/CSVImportPanel.tsx`
   - Extract: CSV file upload and processing
   - Props: `onCSVUpload`, `onCSVCancel`, `csvError`
   - Export: `CSVImportPanel` component

10. **Create Main Container**
    - Create `src/components/grading/GradingManagement.tsx`
    - Import all sub-components
    - Keep: Permission checks, navigation, main layout
    - Use `useGradingData()` hook for data management
    - Export: `GradingManagement` component

11. **Update Import in TeacherDashboard**
    - Find and replace: `import GradingManagement from '../GradingManagement'`
    - Update to: `import GradingManagement from './grading/GradingManagement'`

12. **Delete Original File**
    ```bash
    rm src/components/GradingManagement.tsx
    ```

13. **Verify Tests Pass**
    ```bash
    npm test
    npm run typecheck
    npm run lint
    ```

### 3. src/components/ELibrary.tsx (1,688 lines)

**Current Structure**: Single React component with browsing, upload, search, bookmarks, favorites, progress

**Target Structure**:
```
src/components/elibrary/
  ├── ELibrary.tsx                         (main container, ~200 lines)
  ├── MaterialBrowser.tsx                   (materials grid, ~350 lines)
  ├── MaterialCard.tsx                      (single card, ~200 lines)
  ├── MaterialUpload.tsx                     (upload form, ~250 lines)
  ├── MaterialSearch.tsx                     (search/filter UI, ~200 lines)
  ├── MaterialActions.tsx                    (bookmark/favorite/download, ~150 lines)
  ├── ReadingProgress.tsx                    (progress tracking, ~150 lines)
  └── useELibraryData.ts                    (custom hook, ~200 lines)
```

**Refactoring Steps**:

1. **Create Module Directory**
   ```bash
   mkdir -p src/components/elibrary
   ```

2. **Extract Custom Hook**
   - Create `src/components/elibrary/useELibraryData.ts`
   - Extract: `fetchMaterials()`, `fetchSubjects()`, `toggleBookmark()`, `toggleFavorite()`, `updateReadingProgress()`, `toggleOfflineDownload()`
   - Extract state: `materials`, `subjects`, `loading`, `error`, `bookmarks`, `favorites`, `readingProgress`, `offlineDownloads`
   - Export: `useELibraryData()` hook

3. **Extract Material Card Component**
   - Create `src/components/elibrary/MaterialCard.tsx`
   - Extract: Single material card with title, description, category, file type
   - Props: `material`, `onDownload`, `onBookmark`, `onFavorite`
   - Export: `MaterialCard` component

4. **Extract Material Browser Component**
   - Create `src/components/elibrary/MaterialBrowser.tsx`
   - Extract: Materials grid with filters and categories
   - Props: `materials`, `filterSubject`, `filterCategory`, `searchTerm`, `isSemanticMode`
   - Export: `MaterialBrowser` component

5. **Extract Material Upload Component**
   - Create `src/components/elibrary/MaterialUpload.tsx`
   - Extract: Upload form with drag-drop, file validation, progress
   - Props: `onUpload`, `uploading`, `uploadProgress`, `categories`
   - Export: `MaterialUpload` component

6. **Extract Material Search Component**
   - Create `src/components/elibrary/MaterialSearch.tsx`
   - Extract: Search input, filters, advanced search
   - Props: `search`, `onSearchChange`, `onFilterChange`, `isSemanticMode`, `onToggleSemantic`
   - Export: `MaterialSearch` component

7. **Extract Material Actions Component**
   - Create `src/components/elibrary/MaterialActions.tsx`
   - Extract: Bookmark, favorite, download, share buttons
   - Props: `material`, `isBookmarked`, `isFavorited`, `onBookmark`, `onFavorite`, `onDownload`, `onShare`
   - Export: `MaterialActions` component

8. **Extract Reading Progress Component**
   - Create `src/components/elibrary/ReadingProgress.tsx`
   - Extract: Progress bar, reading time, last read info
   - Props: `progress`, `totalMaterials`, `lastReadMaterial`
   - Export: `ReadingProgress` component

9. **Create Main Container**
    - Create `src/components/elibrary/ELibrary.tsx`
    - Import all sub-components
    - Keep: Permission checks, navigation, main layout
    - Use `useELibraryData()` hook for data management
    - Export: `ELibrary` component

10. **Update Import in StudentPortal/TeacherPortal**
    - Find and replace: `import ELibrary from '../ELibrary'`
    - Update to: `import ELibrary from './elibrary/ELibrary'`

11. **Delete Original File**
    ```bash
    rm src/components/ELibrary.tsx
    ```

12. **Verify Tests Pass**
    ```bash
    npm test
    npm run typecheck
    npm run lint
    ```

## Common Refactoring Principles

### Type Safety
- Never use `any`, `unknown`, or implicit types
- Define interfaces/types before implementation
- Use TypeScript strict mode

### Circular Dependencies
- Avoid circular imports between modules
- Use dependency injection pattern if needed
- Lazy load heavy dependencies with `import()`

### Error Handling
- All async functions must have try-catch blocks
- Use `logger.error()` for error logging
- Implement graceful fallbacks

### Testing
- Write tests for each new module
- Maintain 100% backward compatibility
- All existing tests must pass

### Documentation
- Update JSDoc comments for all public APIs
- Update blueprint.md with structural changes
- Update task.md with completion status

## Acceptance Criteria

- [ ] All three large files split into modular components/services
- [ ] Each new file <500 lines (ideally <300 lines)
- [ ] All imports updated across codebase
- [ ] TypeScript type checking passes (0 errors)
- [ ] ESLint linting passes (0 errors, 0 warnings)
- [ ] All tests pass (npm test)
- [ ] Original large files deleted
- [ ] Documentation updated (blueprint.md, roadmap.md, task.md)

## Progress Tracking

- [ ] unifiedNotificationManager.ts refactored
- [ ] GradingManagement.tsx refactored
- [ ] ELibrary.tsx refactored
- [ ] All imports updated
- [ ] All tests passing
- [ ] Documentation updated

## Related Issues

- #1293 (CLOSED) - Initial large file refactoring (types.ts, apiService.ts)
- #1364 (OPEN) - Complete remaining large file refactoring
- #1362 (CLOSED) - Missing error handling in unifiedNotificationManager
