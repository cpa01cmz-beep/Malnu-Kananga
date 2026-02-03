# geminiService.ts Refactoring Strategy
# Issue #1367, Phase 3
# File: src/services/geminiService.ts (1,054 lines)

## Current State Analysis

**Size**: 1,054 lines
**Complexity**: High - Multiple AI functions with similar patterns
**Dependencies**: GoogleGenAI, error handlers, caching, validators
**Functions**: 8 exported functions

## Proposed Modular Structure

### Target Directory: `src/services/ai/`

```
ai/
├── index.ts                        # Main re-export and orchestrator (~100 lines)
├── geminiClient.ts                # AI client initialization & config (~70 lines)
├── geminiChat.ts                 # Chat RAG & streaming (~150 lines)
├── geminiAnalysis.ts              # Performance analysis functions (~200 lines)
├── geminiEditor.ts               # Content editing functions (~180 lines)
├── geminiQuiz.ts                # Quiz generation (~150 lines)
├── geminiStudy.ts               # Study plan generation (~200 lines)
└── aiCacheService.ts            # (already exists, imported) (~150 lines)
```

## Module Breakdown

### 1. geminiClient.ts (Client Initialization)
**Responsibility**: AI instance management, initialization, error handling
**Exports**:
- `getAIInstance(): Promise<GoogleGenAI>`
- `cleanupGeminiService(): void`
- `AI_MODELS` - Model constants
**Functions to extract**:
- `getAIInstance()` - Lines 31-66
- `cleanupGeminiService()` - Lines 1049-1053
**Constants to extract**:
- `FLASH_MODEL = 'gemini-2.5-flash'`
- `PRO_THINKING_MODEL = 'gemini-3-pro-preview'`
- Inline API URL constants (lines 18-21)

### 2. geminiChat.ts (Chat & RAG)
**Responsibility**: Chat functionality with RAG context and streaming
**Exports**:
- `getAIResponseStream(message, history, localContext, useThinkingMode)`
- `initialGreeting`
**Functions to extract**:
- `getAIResponseStream()` - Lines 75-193
- `initialGreeting` - Line 489
**Dependencies**:
- getAIInstance
- chatCache
- withCircuitBreaker, classifyError, logError

### 3. geminiAnalysis.ts (Performance Analysis)
**Responsibility**: Class and student performance analysis
**Exports**:
- `analyzeClassPerformance(grades: GradeData[]): Promise<string>`
- `analyzeStudentPerformance(studentData: StudentData): Promise<string>`
**Functions to extract**:
- `analyzeClassPerformance()` - Lines 196-247
- `analyzeStudentPerformance()` - Lines 389-487
**Dependencies**:
- PRO_THINKING_MODEL
- getAIInstance
- analysisCache
- Error handlers

### 4. geminiEditor.ts (Content Editing)
**Responsibility**: Website content editing with AI
**Exports**:
- `getAIEditorResponse(prompt, currentContent): Promise<EditorContent>`
**Functions to extract**:
- `getAIEditorResponse()` - Lines 250-386
**Dependencies**:
- PRO_THINKING_MODEL
- getAIInstance
- editorCache
- validateAIResponse
- Error handlers

### 5. geminiQuiz.ts (Quiz Generation)
**Responsibility**: Quiz generation from learning materials
**Exports**:
- `generateQuiz(materials, options): Promise<QuizData>`
**Functions to extract**:
- `generateQuiz()` - Lines 643-816
**Dependencies**:
- PRO_THINKING_MODEL
- getAIInstance
- analysisCache
- Error handlers

### 6. geminiStudy.ts (Study Planning)
**Responsibility**: Study plan generation
**Exports**:
- `generateStudyPlan(studentData, durationWeeks): Promise<StudyPlan>`
**Functions to extract**:
- `generateStudyPlan()` - Lines 818-1042
**Dependencies**:
- PRO_THINKING_MODEL
- getAIInstance
- analysisCache
- offlineActionQueueService (dynamic import)
- Error handlers

### 7. ai/index.ts (Main Orchestrator)
**Responsibility**: Re-export all AI functions for backward compatibility
**Content**:
- Re-export all functions from modules
- Keep same export structure as original geminiService.ts
- Export types used across modules

## Implementation Steps

### Step 1: Create directory and extract geminiClient.ts
1. Create `src/services/ai/` directory
2. Extract client initialization (lines 31-66)
3. Extract cleanup function (lines 1049-1053)
4. Extract model constants (lines 23-25)
5. Extract inline URL constants (lines 17-21)
6. Export getAIInstance, cleanupGeminiService, AI_MODELS
7. Test: Verify AI instance initializes correctly

### Step 2: Extract geminiChat.ts
1. Extract getAIResponseStream function (lines 75-193)
2. Extract initialGreeting constant (line 489)
3. Add imports: getAIInstance, chatCache, error handlers
4. Add LocalContext interface
5. Export function and constant
6. Test: Verify chat streaming works with RAG context

### Step 3: Extract geminiAnalysis.ts
1. Extract analyzeClassPerformance (lines 196-247)
2. Extract analyzeStudentPerformance (lines 389-487)
3. Add imports: PRO_THINKING_MODEL, getAIInstance, analysisCache
4. Add type definitions for function parameters
5. Export both functions
6. Test: Verify both analysis functions work correctly

### Step 4: Extract geminiEditor.ts
1. Extract getAIEditorResponse (lines 250-386)
2. Add imports: PRO_THINKING_MODEL, getAIInstance, editorCache
3. Add type definitions
4. Export function
5. Test: Verify content editing works with validation

### Step 5: Extract geminiQuiz.ts
1. Extract generateQuiz (lines 643-816)
2. Add imports: PRO_THINKING_MODEL, getAIInstance, analysisCache
3. Add type definitions
4. Export function
5. Test: Verify quiz generation works with all question types

### Step 6: Extract geminiStudy.ts
1. Extract generateStudyPlan (lines 818-1042)
2. Add imports: PRO_THINKING_MODEL, getAIInstance, analysisCache
3. Keep dynamic import for offlineActionQueueService
4. Add type definitions
5. Export function
6. Test: Verify study plan generation works

### Step 7: Create ai/index.ts orchestrator
1. Create re-exports from all modules
2. Maintain same export structure as original geminiService
3. Export all types used across modules
4. Ensure backward compatibility

### Step 8: Update imports across codebase
1. Find all files importing from geminiService
2. Update imports to `services/ai`
3. Verify no breaking changes
4. Update type imports if needed

### Step 9: Delete original geminiService.ts
1. Verify all imports updated
2. Delete src/services/geminiService.ts
3. Run typecheck to confirm no broken references

### Step 10: Verification
1. Run typecheck: `npm run typecheck`
2. Run lint: `npm run lint`
3. Run tests: `npm test` (focus on AI-related tests)
4. Build verification: `npm run build`
5. Manual testing of all AI features

## Acceptance Criteria

- [ ] geminiService.ts split into 7 modules
- [ ] Each module <250 lines (ranges: 70-220 lines)
- [ ] All AI functions working correctly
- [ ] Backward compatibility maintained (same exports)
- [ ] TypeScript type checking: Passed (0 errors)
- [ ] ESLint linting: Passed (0 errors, 0 warnings)
- [ ] All AI features functional:
  - [ ] Chat with RAG
  - [ ] Class performance analysis
  - [ ] Student performance analysis
  - [ ] Content editing
  - [ ] Quiz generation
  - [ ] Study plan generation
- [ ] Original geminiService.ts deleted
- [ ] All imports updated successfully

## Estimated Effort

- Step 1: 1-1.5 hours (geminiClient)
- Step 2: 2 hours (geminiChat)
- Step 3: 2.5 hours (geminiAnalysis)
- Step 4: 2 hours (geminiEditor)
- Step 5: 2 hours (geminiQuiz)
- Step 6: 2.5 hours (geminiStudy)
- Step 7: 1 hour (index.ts orchestrator)
- Step 8: 1 hour (Import updates)
- Step 9: 0.5 hours (Delete original)
- Step 10: 2 hours (Verification)
- **Total**: 16.5-18.5 hours

## Risk Mitigation

1. **AI Instance Risk**: Single instance shared across modules
   - Mitigation: Keep in geminiClient.ts, export getAIInstance
   - All modules import from geminiClient

2. **Caching Risk**: Multiple cache imports
   - Mitigation: Keep aiCacheService.ts as-is, import where needed

3. **Dynamic Import Risk**: offlineActionQueueService
   - Mitigation: Keep dynamic import pattern in geminiStudy.ts

4. **Model Constants Risk**: PRO_THINKING_MODEL used everywhere
   - Mitigation: Export from geminiClient.ts as AI_MODELS.PRO_THINKING

5. **Error Handling Risk**: Consistent error handling across modules
   - Mitigation: Import from utils/errorHandler in all modules

6. **Backward Compatibility Risk**: Breaking imports
   - Mitigation: Re-export everything from ai/index.ts with same names

## Related Issues

- Issue #1364: Large File Refactoring (precedent pattern)
- Issue #1231: AI Class Performance Analysis (depends on analyzeClassPerformance)
- Issue #1351: Student Quiz Taking (depends on generateQuiz)
- Issue #1360: Parent Progress Reports (depends on analyzeStudentPerformance)

## Notes

- All AI functions use similar patterns: cache check -> API call -> cache result
- Error handling is consistent across all functions (classifyError, logError)
- All use PRO_THINKING_MODEL except chat (uses FLASH_MODEL for speed)
- Dynamic import for offlineActionQueueService in geminiStudy.ts to avoid circular dependency
- Schema validation uses @google/genai Type interface
