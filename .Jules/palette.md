# Palette's UX Journal

Critical UX/accessibility learnings specific to MA Malnu Kananga school management system.

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
**Learning**: High-traffic "Coba Lagi" (Try Again) buttons that reload data were missing keyboard shortcut hints. Users couldn't discover that they can press Ctrl+R to retry loading data after an error. The Button component already supports the `shortcut` prop which displays a tooltip hint on hover/focus.

**Action**: Add `shortcut="Ctrl+R"` prop to all "Coba Lagi" / retry buttons in high-traffic components. This makes the keyboard shortcut discoverable through tooltip hints.

**Components Updated**:
- StudyPlanGenerator.tsx - Added shortcut="Ctrl+R" to retry button
- ELibrary.tsx - Added shortcut="Ctrl+R" to retry button  
- GradeAnalytics.tsx - Added shortcut="Ctrl+R" to retry button

**Pattern**: Always audit error state buttons - if they perform data refresh/retry operations, add keyboard shortcut hints. This pattern applies to any button that refetches data after an error state.

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
