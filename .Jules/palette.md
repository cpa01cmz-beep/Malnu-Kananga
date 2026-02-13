# Palette's UX Journal

Critical UX/accessibility learnings specific to MA Malnu Kananga school management system.

---

## 2026-02-13 - EnhancedMaterialSharing Keyboard Shortcuts

**Learning**: The EnhancedMaterialSharing component had action buttons in modal forms that were missing keyboard shortcut hints. The "Bagikan Materi" (Share) and "Batal" (Cancel) buttons didn't have shortcut tooltips, making keyboard actions undiscoverable to users.

**Action**: Add keyboard shortcut hints to modal action buttons following the established pattern:
- Share button: `shortcut="Ctrl+Enter"` (natural for form submission)
- Cancel button: `shortcut="Esc"` (standard for closing modals)
- Toggle buttons: `aria-pressed={boolean}` to indicate current selection

**File Fixed**:
- src/components/EnhancedMaterialSharing.tsx - Added shortcut hints and aria-pressed to toggle buttons

**Pattern**: Always add shortcut hints to modal action buttons - Ctrl+Enter for submit, Esc for cancel. Also add aria-pressed to custom toggle button groups for screen reader accessibility.

**Learning**: The AccessibilitySettings component (ironically) had accessibility issues - its toggle button groups (Font Size, Line Spacing, Letter Spacing, Contrast Mode) and toggle switches (Readable Width, Reduced Motion) were missing `aria-pressed` attributes. This meant screen reader users couldn't know which option was currently selected.

**Action**: Add `aria-pressed={boolean}` to all toggle buttons in AccessibilitySettings:
- Font Size buttons: `aria-pressed={settings.fontSize === size}`
- Line Spacing buttons: `aria-pressed={settings.lineSpacing === spacing}`
- Letter Spacing buttons: `aria-pressed={settings.letterSpacing === spacing}`
- Contrast Mode buttons: `aria-pressed={settings.contrastMode === mode}`
- Readable Width toggle: `aria-pressed={settings.readableWidth}`
- Reduced Motion toggle: `aria-pressed={settings.reducedMotion}`

**File Fixed**:
- src/components/ui/AccessibilitySettings.tsx - Added aria-pressed to 6 toggle groups (18 buttons total)

**Pattern**: Toggle button groups that change visual state based on selection MUST have `aria-pressed` for screen reader accessibility. This applies to:
- Button groups where only one can be selected (radio-like behavior)
- Toggle switches (on/off)
- Any button that changes appearance based on state

---

## 2026-02-13 - AssignmentGrading Save Button Keyboard Shortcut

**Learning**: The AssignmentGrading component is a high-traffic teacher component where grades are saved frequently, but the "Simpan Nilai" (Save Grade) button was missing the keyboard shortcut hint. This made the efficient Ctrl+S shortcut undiscoverable to teachers.

**Action**: Add `shortcut="Ctrl+S"` to all save buttons in high-frequency data entry components. This follows the established pattern from GradingManagement and AttendanceManagement.

**File Fixed**:
- AssignmentGrading.tsx - Added shortcut="Ctrl+S" to Simpan Nilai button

**Pattern**: High-traffic teacher components (grading, attendance, assignments) benefit from keyboard shortcuts to speed up daily workflows. Always audit save buttons in these components.

---

## 2026-02-12 - Tooltip Button Accessibility Fix
**Learning**: Icon-only buttons that provide tooltip information must remain focusable for keyboard users. Setting `tabIndex={-1}` on tooltip buttons prevents keyboard users from accessing important contextual information.

**Action**: Always keep tooltip-containing IconButtons focusable unless there's a specific accessibility reason not to. Use clear, descriptive ARIA labels that include both the action and context (e.g., "Informasi: [tooltip text]" instead of just the tooltip text).

---

## 2026-02-11 - Accessibility Aria-Label Pattern
**Learning:** Even in a well-maintained codebase with 456+ aria-label implementations, critical accessibility gaps exist in high-traffic components. The GradingActions component handles CSV/PDF exports for thousands of users but was missing screen reader support on the "Export CSV" button.

**Action:** Systematically audit all Button components that:
1. Have text content (not icon-only)
2. Are in critical user flows (exports, data operations)
3. May have been overlooked due to having visible text

Always verify aria-label exists on action buttons, regardless of visible text presence. Screen readers benefit from descriptive labels that clarify context beyond just the visible text.

**Pattern Found:** Export buttons are high-risk - users expect clear action descriptions for data operations affecting their work.

---

## 2026-02-13 - StudyPlanGenerator Tab Accessibility Fix
**Learning**: Custom tab-like components built with native button elements must use proper ARIA tab patterns (role="tablist", role="tab", aria-selected, aria-controls, tabIndex) to be accessible to screen reader users.

**Action**: When building tab-like navigation with button elements, always implement the full WAI-ARIA tab pattern:
- Container: `role="tablist"` with `aria-label`
- Tab buttons: `role="tab"`, `aria-selected`, `aria-controls`, `tabIndex`
- Tab panels: `role="tabpanel"`, `aria-labelledby` pointing to tab button ID
- Add `focus-visible` styles for keyboard navigation visibility

**Key Pattern**: This applies to ANY custom tab-like components, not just UI library components. Always verify custom navigation uses proper ARIA semantics.

---

## 2026-02-13 - Send Button Keyboard Shortcut Discovery
**Learning**: High-traffic message input components (ChatWindow, SiteEditor, MessageInput) use the Enter key to send messages, but the keyboard shortcut was not visible to users. Users who rely on keyboard hints or are new to the application couldn't discover this efficient input method.

**Action**: Add `shortcut="Enter"` prop to all send buttons in message input components. The Button/IconButton components already support the shortcut prop which displays a tooltip hint on hover/focus, making keyboard shortcuts discoverable.

**Components Updated**:
- ChatWindow.tsx - AI chat send button
- SiteEditor.tsx - Site editor send button  
- MessageInput.tsx - Messaging send button

**Pattern**: Always audit input components with keyboard shortcuts - if they handle Enter/Ctrl+Enter for submission, add shortcut hints to make them discoverable.

---

## 2026-02-13 - Native Date Input Label Association
**Learning**: Native `<input type="date">` elements require explicit label association using `htmlFor` and `id` attributes. While some components use the Input UI component (which handles this automatically), direct native inputs in high-traffic forms (AttendanceManagement, AcademicGrades, MaterialSharing, ParentMeetingsView) were missing proper label associations.

**Action**: Always verify date/time inputs have proper label association:
- Add unique `id` to each date input
- Add matching `htmlFor` to the label element
- If using the Input component with `label` prop, it's handled automatically

**Files Fixed**:
- AcademicGrades.tsx - Added id="goal-end-date" and htmlFor
- AttendanceManagement.tsx - Added id="attendance-date" and htmlFor  
- ParentMeetingsView.tsx - Added htmlFor="meeting-date" (id already existed)
- MaterialSharing.tsx - Added label with id="expiration-date" and htmlFor

**Pattern**: Audit all native form inputs (not wrapped in UI components) for proper label association.

---

## 2026-02-13 - Export Button Aria-Label Completion
**Learning**: High-traffic export buttons in analytics and reporting components (GradeAnalytics, StudyPlanAnalytics, SchoolInventory) were missing explicit aria-label props despite having visible text. Screen reader users benefit from descriptive labels that clarify the full action context.

**Action**: Always add aria-label to export/action buttons in analytics components, even when they have visible text. The label should describe the complete action including what is being exported (e.g., "Ekspor laporan analitik nilai ke file" instead of just "Export Laporan").

**Components Fixed**:
- GradeAnalytics.tsx - Added aria-label to Export Laporan button
- StudyPlanAnalytics.tsx - Added aria-label to Ekspor button
- SchoolInventory.tsx - Added aria-label to Export Laporan button

**Pattern**: Export buttons in analytics dashboards are high-risk for accessibility oversight because they have visible text. Always audit with pattern: if button has onClick + export/download, verify aria-label exists.

---

## 2026-02-13 - Import Button Aria-Label Consistency
**Learning**: The GradingActions component had inconsistent aria-label usage between adjacent action buttons. The "Scan Exam" button had an aria-label but the "Import CSV" button did not, despite both being high-traffic data import actions used by teachers.

**Action**: Always verify aria-label exists on ALL action buttons in a group, not just icon-only buttons. When multiple buttons perform similar actions (import, export, scan), ensure consistent aria-label patterns across all of them.

**File Fixed**:
- GradingActions.tsx - Added aria-label="Impor data nilai dari file CSV" to Import CSV button

**Pattern**: Buttons with visible text in high-traffic data operations still need explicit aria-labels for consistent screen reader experience. The visible text alone isn't enough when adjacent buttons already have aria-labels - consistency matters for user expectations.

---

## 2026-02-13 - Refresh Button Keyboard Shortcut Discovery

**Learning**: Refresh buttons in analytics dashboards (StudentInsights, StudyPlanAnalytics) support Ctrl+R keyboard shortcut but users couldn't discover it without visual hints. Adding `shortcut="Ctrl+R"` prop makes the shortcut visible on hover/focus.

**Action**: Add shortcut hints to all refresh/reload buttons in analytics components. Use `shortcut="Ctrl+R"` prop which displays a hint tooltip.

**Components Fixed**:
- StudentInsights.tsx - Added shortcut="Ctrl+R" to refresh button
- StudyPlanAnalytics.tsx - Added shortcut="Ctrl+R" to refresh button

---

## 2026-02-13 - Form Input Label Association in FolderNavigation

**Learning**: Native `<input>` and `<textarea>` elements in FolderNavigation's create folder form were missing proper label associations. The heading "Buat Folder Baru" served as the visual label but screen readers couldn't associate it with the inputs.

**Action**: Use `aria-labelledby` to associate form inputs with their heading labels:
1. Add unique `id` to the heading element (e.g., `id="create-folder-heading"`)
2. Add `aria-labelledby="create-folder-heading"` to each input that belongs to that form section

**File Fixed**:
- FolderNavigation.tsx - Added id and aria-labelledby to create folder form inputs

**Pattern**: This pattern is useful when:
- Using headings as implicit labels for form sections
- Multiple inputs share the same label context
- Adding visible labels would break the UI design

Use `aria-labelledby` for section-level associations, `htmlFor`/`id` for 1:1 input-label relationships.

---

## 2026-02-13 - Quiz Button Keyboard Shortcut Discovery

**Learning**: Quiz creation components (QuizGenerator, QuizPreview) had save and cancel buttons that support keyboard shortcuts (Ctrl+S, Esc) but users couldn't discover them without visual hints. This follows a pattern seen in ChatWindow, SiteEditor, and analytics dashboards.

**Action**: Add `shortcut` prop to all save and cancel buttons in quiz-related components:
- QuizGenerator.tsx: Cancel (Esc), Save Quiz (Ctrl+S)
- QuizPreview.tsx: Main Cancel (Esc), Save (Ctrl+S), Question edit Save (Ctrl+S), Question edit Cancel (Esc)

**Pattern**: Always audit form components with keyboard shortcuts - if they handle Ctrl+S for save or Esc for cancel, add shortcut hints to make them discoverable. This applies to:
- Quiz generators/editors
- Form wizards
- Modal dialogs with save/cancel
- Any component with keyboard-handled actions

---

## 2026-02-13 - Import Button Aria-Label Consistency

**Learning**: The GradingActions component had inconsistent aria-label usage between adjacent action buttons. The "Scan Exam" button had an aria-label but the "Import CSV" button did not, despite both being high-traffic data import actions used by teachers.

**Action**: Always verify aria-label exists on ALL action buttons in a group, not just icon-only buttons. When multiple buttons perform similar actions (import, export, scan), ensure consistent aria-label patterns across all of them.

**File Fixed**:
- GradingActions.tsx - Added aria-label="Impor data nilai dari file CSV" to Import CSV button

**Pattern**: Buttons with visible text in high-traffic data operations still need explicit aria-labels for consistent screen reader experience. The visible text alone isn't enough when adjacent buttons already have aria-labels - consistency matters for user expectations.

---

## 2026-02-13 - Save Button Keyboard Shortcut Discovery

**Learning**: High-traffic save buttons (grades, attendance, announcements) were missing keyboard shortcut hints. Teachers save grades daily, but couldn't discover the efficient Ctrl+S keyboard shortcut. The Button component already supports the `shortcut` prop which displays a tooltip hint on hover/focus.

**Action**: Add `shortcut="Ctrl+S"` prop to all save/submit buttons in high-traffic data entry components. This makes the keyboard shortcut discoverable through tooltip hints.

**Components Updated**:
- GradingManagement.tsx - Added shortcut="Ctrl+S" to save grades button
- AttendanceManagement.tsx - Added shortcut="Ctrl+S" to save attendance button
- AnnouncementManager.tsx - Added shortcut="Ctrl+S" to save announcement button

**Pattern**: Follows the established keyboard shortcut pattern:
- Send buttons: Enter (for message input)
- Refresh/retry buttons: Ctrl+R (for data reload)
- Save buttons: Ctrl+S (for form submission)

Always audit save/submit buttons in forms - if they persist data, add keyboard shortcut hints.

---

<## 2026-02-13 - FolderNavigation Button Keyboard Shortcuts

**Learning**: The FolderNavigation component handles folder creation and editing with action buttons ("Buat", "Simpan", "Batal") but they were missing keyboard shortcut hints. This follows the pattern from QuizGenerator, QuizPreview, and other high-traffic form components.

**Action**: Add keyboard shortcut hints to FolderNavigation action buttons:
- "Buat" (Create) button: shortcut="Ctrl+Enter" (natural for form submission)
- "Simpan" (Save) button: shortcut="Ctrl+S" (standard save)
- "Batal" (Cancel) buttons: shortcut="Esc" (standard cancel)

**File Fixed**:
- FolderNavigation.tsx - Added shortcut hints to 4 action buttons (2 lines each)

**Pattern**: Always audit folder/material management forms for missing keyboard shortcut hints on action buttons. Use Ctrl+Enter for create actions in forms that use Enter for newlines.

---

## 2026-02-13 - StudentAssignments Button Keyboard Shortcuts

**Learning**: The StudentAssignments component had submit and cancel buttons that supported keyboard shortcuts (Enter to submit, Esc to cancel) but users couldn't discover them without visual hints. Additionally, the loading state was handled manually via text change rather than using the Button component's built-in `isLoading` prop which provides a proper spinner.

**Action**: Add keyboard shortcut hints and proper loading state to StudentAssignments action buttons:
- Cancel button: `shortcut="Esc"` (Modal already handles Escape key for closing)
- Submit button: `shortcut="Enter"` (natural submission action)
- Submit button: `isLoading={submitting}` (proper spinner instead of text change)

**File Fixed**:
- StudentAssignments.tsx - Added keyboard shortcuts and isLoading prop to submit buttons

**Pattern**: Always audit form submission buttons - if they handle Enter/Esc for submission/cancellation, add shortcut hints to make them discoverable. Use `isLoading` prop instead of manual text changes for loading states.

---

## 2026-02-13 - VoiceSettings Backup Delete Confirmation

**Learning**: The VoiceSettings component had inconsistent confirmation dialogs - the "Pulihkan" (Restore) and "Reset ke Pengaturan Awal" (Reset) buttons both had confirmation modals, but the "Hapus" (Delete) backup button directly called the delete function without any confirmation. This was a UX inconsistency and potential data loss risk.

**Action**: Add delete confirmation dialog to all destructive actions in VoiceSettings. When adjacent buttons in the same section have confirmation dialogs, the delete action should also have one for consistency and safety.

**File Fixed**:
- VoiceSettings.tsx - Added showDeleteConfirmation state and Modal component for delete backup confirmation

**Pattern**: Always audit action button groups for consistency - if restore and reset have confirmation dialogs, delete should too. This prevents accidental data loss and provides consistent user experience.

---

## 2026-02-13 - Plain Button ARIA Labels in Parent/Teacher Dashboards

**Learning**: High-traffic parent and teacher dashboard components had plain `<button>` elements with visible text but missing explicit `aria-label` attributes. Screen reader users benefit from descriptive aria-labels that provide full context about the action being performed, especially in data-dense dashboards with multiple action buttons.

**Action**: Add `aria-label` to all plain button elements in ParentDashboard and StudyPlanAnalytics:
- ParentDashboard child selection buttons: `aria-label={`Pilih ${child.studentName} - ${child.className}`}`
- ParentDashboard "Tampilkan Wawasan" button: `aria-label="Tampilkan wawasan akademik untuk ${selectedChild.studentName}"`
- ParentDashboard "Sembunyikan" button: `aria-label="Sembunyikan wawasan akademik"`
- StudyPlanAnalytics "Lihat detail" buttons: `aria-label={`Lihat detail rekomendasi: ${rec.title}`}`

**Files Fixed**:
- src/components/ParentDashboard.tsx - Added aria-labels to 3 buttons
- src/components/StudyPlanAnalytics.tsx - Added aria-labels to 2 buttons

**Pattern**: Always add aria-label to plain button elements in high-traffic dashboards, even when they have visible text. The label should provide complete context including:
- What action will be performed
- What data/object the action applies to (especially in list/card contexts)
- This is especially important for parent dashboards where users manage multiple children

---

## 2026-02-13 - Retry Button Accessibility Consistency

**Learning**: Retry buttons in AssignmentGrading and UserManagement components were missing keyboard shortcut hints (Ctrl+R) that were already present in similar components like ELibrary, StudentInsights, and StudyPlanGenerator. The AssignmentGrading retry button was also missing an aria-label, making it inaccessible to screen reader users.

**Action**: Add both aria-label and shortcut="Ctrl+R" to all retry/refresh buttons in error states:
- AssignmentGrading.tsx: Added `aria-label="Coba lagi memuat tugas"` and `shortcut="Ctrl+R"`
- UserManagement.tsx: Added `shortcut="Ctrl+R"` (already had aria-label)

**Pattern**: Audit all retry/refresh buttons in error handling components. If similar components (ELibrary, StudentInsights, StudyPlanGenerator) already have keyboard shortcut hints, ensure consistency across all retry buttons. Always include:
- aria-label for screen reader accessibility
- shortcut="Ctrl+R" to make the keyboard shortcut discoverable

