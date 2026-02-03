# StudentPortal.tsx Refactoring Strategy
# Issue #1367, Phase 2
# File: src/components/StudentPortal.tsx (1,105 lines)

## Current State Analysis

**Size**: 1,105 lines
**Complexity**: High - Multiple responsibilities and concerns
**Dependencies**: Multiple hooks, services, and sub-components

## Proposed Modular Structure

### Target Directory: `src/components/student-portal/`

```
student-portal/
├── useStudentPortalData.ts      # Custom hook for data fetching & offline management (~200 lines)
├── StudentPortalHome.tsx         # Home view component (~300 lines)
├── StudentPortalMenu.tsx         # Menu items & navigation (~150 lines)
├── StudentPortalOffline.tsx       # Offline handling & sync (~200 lines)
├── StudentPortalRealtime.tsx     # Real-time event handling (~150 lines)
├── StudentPortalQuiz.tsx          # Quiz-related logic (~100 lines)
└── StudentPortal.tsx             # Main orchestrator (~150 lines)
```

## Module Breakdown

### 1. useStudentPortalData.ts (Custom Hook)
**Responsibility**: Data fetching, caching, validation, offline management
**Exports**:
- `useStudentPortalData()` - Returns student data, validation results, cache freshness, sync handlers
**Functions to extract**:
- `fetchStudentData()` - Lines 116-289
- Offline caching logic - Lines 127-247
- Validation with StudentPortalValidator - Lines 134-209
- `handleSync()` - Lines 510-585
**State to manage**:
- `studentData`, `loading`, `error`
- `offlineData`, `syncInProgress`
- `validationResults`, `cacheFreshness`

### 2. StudentPortalHome.tsx (Component)
**Responsibility**: Home view UI with welcome banner, voice commands, activity feed
**Props**:
- `studentData: Student`
- `onNavigate: (view: PortalView) => void`
- `extraRole: UserExtraRole`
- `isOnline: boolean`
- `isSlow: boolean`
- `isConnected: boolean`
- `isConnecting: boolean`
**Components to include**:
- Welcome banner - Lines 878-903
- Voice commands section - Lines 905-942
- Activity feed - Lines 944-977
- Dashboard action cards grid - Lines 979-993
- OSIS extra role card - Lines 994-1009

### 3. StudentPortalMenu.tsx (Component)
**Responsibility**: Menu items definition and permission filtering
**Exports**:
- `allMenuItems: MenuItem[]` - All menu items constant
- `useFilteredMenuItems(extraRole: UserExtraRole)` - Hook for filtered menu
**Content**:
- `allMenuItems` constant - Lines 587-687
- Permission filtering logic - Lines 689-690

### 4. StudentPortalOffline.tsx (Component)
**Responsibility**: Offline banner, sync status, validation alerts
**Props**:
- `bannerMode: 'offline' | 'slow' | 'both'`
- `showBanner: boolean`
- `syncStatus: SyncStatus`
- `onSync: () => void`
- `isSyncLoading: boolean`
- `cachedDataAvailable: boolean`
- `validationResults: ValidationResult`
- `cacheFreshness: CacheFreshnessInfo | null`
- `showValidationDetails: boolean`
- `onToggleValidationDetails: () => void`
**Components to include**:
- OfflineBanner - Lines 708-716
- Validation status alerts - Lines 719-844

### 5. StudentPortalRealtime.tsx (Component/Hook)
**Responsibility**: Real-time event handling and data refresh
**Exports**:
- `useStudentPortalRealtime(studentId: string, enabled: boolean)` - Custom hook
**Functions to extract**:
- `refreshGrades()` - Lines 378-404
- `refreshAttendance()` - Lines 406-442
- `refreshMaterials()` - Lines 444-469
- Real-time event handler - Lines 471-507

### 6. StudentPortalQuiz.tsx (Component)
**Responsibility**: Quiz handling and auto-integration
**Props**:
- `selectedQuiz: Quiz | null`
- `onSubmit: (attempt: QuizAttempt) => void`
- `onCancel: () => void`
- `currentView: PortalView`
- `onSetCurrentView: (view: PortalView) => void`
**Functions to extract**:
- `handleQuizSubmit()` - Lines 90-108
- `handleQuizCancel()` - Lines 110-113
- Quiz view rendering - Lines 1038-1058

### 7. StudentPortal.tsx (Main Orchestrator)
**Responsibility**: View routing, state management, component orchestration
**State to keep**:
- `currentView`, `selectedQuiz`
- `showVoiceHelp`
**Imports from modules**:
- `useStudentPortalData` - For data management
- `StudentPortalHome` - For home view
- `StudentPortalMenu` - For menu items
- `StudentPortalOffline` - For offline handling
- `useStudentPortalRealtime` - For real-time updates
- `StudentPortalQuiz` - For quiz handling

## Implementation Steps

### Step 1: Create directory and extract useStudentPortalData.ts
1. Create `src/components/student-portal/` directory
2. Extract data fetching logic (lines 115-289)
3. Extract handleSync function (lines 510-585)
4. Create custom hook returning:
   - `studentData`, `loading`, `error`
   - `offlineData`, `syncStatus`
   - `validationResults`, `cacheFreshness`
   - `handleSync`, `refreshData`
5. Export the hook

### Step 2: Extract StudentPortalHome.tsx
1. Extract home view JSX (lines 876-1012)
2. Extract voice command logic (lines 320-366)
3. Create component with props interface
4. Import and use VoiceInputButton, VoiceCommandsHelp, ActivityFeed
5. Import filtered menu items from StudentPortalMenu

### Step 3: Extract StudentPortalMenu.tsx
1. Extract allMenuItems constant (lines 587-687)
2. Extract permission filtering logic (lines 689-690)
3. Create useFilteredMenuItems hook
4. Export constant and hook

### Step 4: Extract StudentPortalOffline.tsx
1. Extract offline banner (lines 708-716)
2. Extract validation alerts (lines 719-844)
3. Create component with props interface
4. Import OfflineBanner, Alert, Button components

### Step 5: Extract StudentPortalRealtime.tsx
1. Extract refresh functions (lines 378-469)
2. Extract real-time event handler (lines 471-507)
3. Create custom hook with useRealtimeEvents
4. Export the hook

### Step 6: Extract StudentPortalQuiz.tsx
1. Extract quiz handlers (lines 90-113)
2. Extract quiz view rendering (lines 1038-1058)
3. Create component with props interface
4. Import StudentQuiz component

### Step 7: Create main StudentPortal.tsx orchestrator
1. Keep view routing logic
2. Import all sub-components and hooks
3. Use useStudentPortalData for data management
4. Use useStudentPortalRealtime for real-time updates
5. Render appropriate view based on currentView state
6. Maintain backward compatibility

### Step 8: Update imports across codebase
1. Find all files importing StudentPortal
2. Update imports to new path if needed (should remain compatible)
3. Verify no breaking changes

### Step 9: Verification
1. Run typecheck: `npm run typecheck`
2. Run lint: `npm run lint`
3. Run tests: `npm test`
4. Build verification: `npm run build`
5. Manual testing of all views

## Acceptance Criteria

- [ ] StudentPortal.tsx split into 7 modules
- [ ] Each module <350 lines (ranges: 100-300 lines)
- [ ] Main orchestrator maintains backward compatibility
- [ ] TypeScript type checking: Passed (0 errors)
- [ ] ESLint linting: Passed (0 errors, 0 warnings)
- [ ] All views functional (home, schedule, library, grades, assignments, attendance, insights, osis, groups, study-plan, study-analytics, quiz, quiz-history)
- [ ] Offline functionality working
- [ ] Real-time updates working
- [ ] Voice commands working
- [ ] Quiz handling working
- [ ] Original file deleted or converted to re-export

## Estimated Effort

- Step 1: 2-3 hours (useStudentPortalData hook)
- Step 2: 2 hours (StudentPortalHome)
- Step 3: 1 hour (StudentPortalMenu)
- Step 4: 2 hours (StudentPortalOffline)
- Step 5: 1.5 hours (StudentPortalRealtime)
- Step 6: 1 hour (StudentPortalQuiz)
- Step 7: 1.5 hours (Main orchestrator)
- Step 8: 1 hour (Import updates)
- Step 9: 1.5 hours (Verification)
- **Total**: 13.5-15.5 hours

## Risk Mitigation

1. **Complexity Risk**: StudentPortal has many interdependent state pieces
   - Mitigation: Extract modules incrementally, test after each extraction

2. **Real-time Updates Risk**: WebSocket integration may break
   - Mitigation: Keep real-time logic in dedicated module, test thoroughly

3. **Offline Data Risk**: Complex caching and sync logic
   - Mitigation: Keep all offline logic in useStudentPortalData hook

4. **Backward Compatibility Risk**: Import path changes
   - Mitigation: Keep original export from StudentPortal.tsx, update imports minimally

## Related Issues

- Issue #1364: Large File Refactoring - Phase 2-3 (precedent pattern)
- Issue #1371: Auto-Integrate Quiz Results (depends on quiz integration)
- Issue #1351: Student Quiz Taking Interface (depends on quiz UI)
