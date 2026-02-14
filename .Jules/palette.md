# Palette's UX Journal

Critical UX/accessibility learnings specific to MA Malnu Kananga school management system.

---

---

---

## 2026-02-14 - MaterialManagementView Button Accessibility

**Learning**: The MaterialManagementView component had plain `<button>` elements that were missing `type="button"` attribute. When buttons are nested inside form elements (like MaterialManagementView might be), missing type="button" causes them to default to type="submit", potentially causing accidental form submissions. Additionally, the title button had a `title` attribute but was missing an explicit `aria-label` for screen reader users.

**Action**: Added `type="button"` and `aria-label` to all three plain buttons in the materials list:
- Title button (line 268): Added `type="button"` and `aria-label={\`Lihat detail ${item.title}\`}`
- Manage button (line 305): Added `type="button"`
- Delete button (line 315): Added `type="button"`

**File Fixed**:
- src/components/material-upload/MaterialManagementView.tsx - Added type and aria-label to 3 buttons

**Pattern**: Always audit plain `<button>` elements (not using the Button component) for:
1. `type="button"` - Prevents accidental form submission when nested in forms
2. `aria-label` - Provides screen reader context beyond visible text
3. This is especially important for list/card items with action buttons

**Related**: This follows the same pattern as TwoFactorAuth.tsx, LoadingState.tsx, and other components with plain button accessibility fixes.

---

## 2026-02-14 - Input Component Aria-Label Support

**Learning**: The Input component rendered a visible label only when the `label` prop was provided, but had no support for `aria-label` when used without a visible label. This created an accessibility gap where screen reader users couldn't identify input fields that relied on placeholder text or context for their purpose.

**Action**: Added `ariaLabel` prop and automatic aria-label fallback:
- Added `ariaLabel?: string` prop to InputProps interface (line 33)
- Added aria-label attribute that uses `ariaLabel` prop when provided, or falls back to `placeholder` text when no visible label exists (line 285)
- Fixed pre-existing bug: corrected variable name from `describedByIds` to `describedBy` in accessibilityProps (line 281)

**Files Fixed**:
- src/components/ui/Input.tsx - Added ariaLabel prop and fallback logic

**Pattern**: Form inputs MUST have an accessible name via one of these methods:
- Visible `<label>` element (htmlFor/id association)
- `aria-label` attribute describing the input's purpose
- `aria-labelledby` pointing to a descriptive element
- When no visible label is provided, fall back to placeholder text as aria-label

This ensures all input fields are properly announced by screen readers, improving accessibility for users navigating forms without visual cues.

---

---

## 2026-02-14 - GlobalSearchModal Filter Button Accessibility

**Learning**: The GlobalSearchModal component had filter toggle buttons (siswa, guru, nilai, tugas, materi) that changed visual state (blue background when active, gray when inactive) but were missing `aria-pressed` attributes. Screen reader users couldn't determine which filters were currently active when using the global search feature.

**Action**: Added `aria-pressed={activeFilters.includes(type)}` to all filter buttons:
- Line 228: Added `aria-pressed={activeFilters.includes(type)}` to each filter button
- Screen readers now announce the active/inactive state of each filter

**File Fixed**:
- src/components/ui/GlobalSearchModal.tsx - Added aria-pressed to 5 filter buttons

**Pattern**: Toggle button groups that change visual state based on selection MUST have `aria-pressed` for screen reader accessibility. This applies to:
- Filter buttons in search modals
- Toggle buttons in any component where appearance changes based on state
- Always audit filter/toggle buttons in commonly-used modals

---

## 2026-02-14 - LoginModal Keyboard Shortcut Discoverability

**Learning**: The LoginModal component's submit button supports Enter key form submission (standard HTML form behavior), but users couldn't discover this keyboard shortcut without visual hints. This is a high-traffic component used by all users (students, teachers, parents, admins) every time they access the system.

**Action**: Add `shortcut="Enter"` prop to the login Button component:
- Line 308: Added `shortcut="Enter"` to the Button component
- This makes the Enter key shortcut discoverable via tooltip on hover/focus
- Follows the established pattern in the codebase for form submission buttons

**File Fixed**:
- src/components/LoginModal.tsx - Added shortcut prop to the login button

**Pattern**: Form submission buttons should consistently show keyboard shortcuts to improve discoverability:
- Submit/Login buttons: `shortcut="Enter"`
- Save buttons: `shortcut="Ctrl+S"`
- Cancel/Close buttons: `shortcut="Esc"`

The Button component's `shortcut` prop automatically displays a tooltip hint on hover/focus, making keyboard shortcuts discoverable to all users.

**Related**: This follows the same pattern as ChatWindow.tsx, SiteEditor.tsx, and MessageInput.tsx where Enter key shortcuts were made discoverable. Consistent keyboard shortcut hints improve accessibility and power-user efficiency.

---

## 2026-02-14 - QuizGenerator Back Button Keyboard Shortcut

**Learning**: The QuizGenerator component's "Kembali" (Back) button at line 485 was missing a keyboard shortcut hint while all other navigation buttons in the same component had shortcuts (Batal with `shortcut="Esc"`, Simpan Kuis with `shortcut="Ctrl+S"`, Lanjut/Buat Kuis with `shortcut="Ctrl+Enter"`). This inconsistency made it harder for keyboard users to discover the Alt+Left shortcut for navigating to the previous step in the wizard.

**Action**: Add `shortcut="Alt+Left"` prop to the "Kembali" button:
- Line 485: Added `shortcut="Alt+Left"` to the Button component
- This makes the keyboard shortcut discoverable via tooltip on hover/focus
- Alt+Left follows the browser back navigation convention, making it intuitive
- Completes the consistent keyboard shortcut coverage for all QuizGenerator navigation buttons

**File Fixed**:
- src/components/QuizGenerator.tsx - Added shortcut prop to the back button (line 485)

**Pattern**: All navigation buttons in wizard components should have consistent keyboard shortcut hints:
- Back/Previous buttons: `shortcut="Alt+Left"` (follows browser convention)
- Cancel/Close buttons: `shortcut="Esc"`
- Save/Submit buttons: `shortcut="Ctrl+S"` or `shortcut="Ctrl+Enter"`
- Next/Continue buttons: `shortcut="Ctrl+Enter"`
- Always use the Button component's `shortcut` prop to display hints in tooltips
- Complete the set: don't leave one button without a shortcut if others have them

---

## 2026-02-14 - QuizGenerator Keyboard Shortcut Discoverability

**Learning**: The QuizGenerator component is a multi-step wizard where teachers create AI-generated quizzes. The "Lanjut" / "Buat Kuis" (Next / Create Quiz) button on line 499 was missing a keyboard shortcut hint, even though other buttons in the same component (Batal with `shortcut="Esc"`, Simpan Kuis with `shortcut="Ctrl+S"`) already had shortcuts. This inconsistency meant keyboard users couldn't discover the Ctrl+Enter shortcut for advancing to the next step.

**Action**: Add `shortcut="Ctrl+Enter"` prop to the "Lanjut" / "Buat Kuis" button:
- Line 499: Added `shortcut="Ctrl+Enter"` to the Button component
- This makes the keyboard shortcut discoverable via tooltip on hover/focus
- Follows the established pattern in the codebase for wizard navigation

**File Fixed**:
- src/components/QuizGenerator.tsx - Added shortcut prop to the next/create button

**Pattern**: Wizard/form navigation buttons should consistently show keyboard shortcuts to improve discoverability:
- Cancel/Close buttons: `shortcut="Esc"`
- Save/Submit buttons: `shortcut="Ctrl+S"` or `shortcut="Ctrl+Enter"`
- Next/Continue buttons: `shortcut="Ctrl+Enter"`
- Always use the Button component's `shortcut` prop to display hints in tooltips

**Related**: This follows the same pattern as other form components (FolderNavigation.tsx, EnhancedMaterialSharing.tsx, AssignmentCreation.tsx) where Ctrl+Enter is used for primary actions. Consistent keyboard shortcut hints improve accessibility and power-user efficiency.

---

## 2026-02-14 - Social Media Icons Accessibility Consistency

**Learning**: The StatusIcons component had three social media icons (FacebookIcon, InstagramIcon, YoutubeIcon) that were missing the `ariaLabel` prop available in other icon components (ArrowPathIcon, AlertCircleIcon, CheckCircleIcon, AlertTriangleIcon). This inconsistency meant social media links in the Footer couldn't provide customizable accessibility labels for screen reader users.

**Action**: Add `ariaLabel` prop support to all social media icon components:
- FacebookIcon: Added `ariaLabel?: string` prop with default value 'Facebook'
- InstagramIcon: Added `ariaLabel?: string` prop with default value 'Instagram'
- YoutubeIcon: Added `ariaLabel?: string` prop with default value 'YouTube'
- Changed `aria-hidden="true"` to `aria-hidden={!ariaLabel}` to allow icons to be accessible when labels are provided
- Added `aria-label={ariaLabel}` attribute to each SVG element

**File Fixed**:
- src/components/icons/StatusIcons.tsx - Added ariaLabel prop support to FacebookIcon, InstagramIcon, and YoutubeIcon

**Pattern**: All icon components should support customizable `ariaLabel` props for accessibility consistency. When icons are used in interactive contexts (links, buttons), they should be able to provide meaningful labels for screen reader users. The pattern is:
- Accept `ariaLabel?: string` as optional prop
- Provide sensible default value
- Use `aria-hidden={!ariaLabel}` to hide from screen readers when no label provided
- Use `aria-label={ariaLabel}` to announce label when provided

**Related**: This follows the same pattern as other icons in StatusIcons.tsx and ensures consistency with the existing IconProps interface used by other icon components.

---

## 2026-02-14 - ActivityFeed Pause Toggle Accessibility

**Learning**: The ActivityFeed component had a pause/resume toggle button that used visual state (primary vs ghost variant) to indicate whether updates were paused, but was missing `aria-pressed` attribute. Screen reader users couldn't know if the activity feed updates were currently paused or active.

**Action**: Add `aria-pressed` and `aria-label` to the pause toggle button:
- `aria-pressed={localPaused}` - Indicates toggle state to screen readers
- `aria-label={localPaused ? 'Lanjutkan pembaruan aktivitas' : 'Jeda pembaruan aktivitas'}` - Clear context in Indonesian

**File Fixed**:
- src/components/ActivityFeed.tsx - Added aria-pressed and aria-label to pause toggle button (line 367-368)

**Pattern**: Toggle buttons that change visual state based on selection MUST have `aria-pressed` for screen reader accessibility. This applies to:
- Any button that uses variant changes to indicate state (primary vs ghost)
- Pause/resume toggles
- Play/pause buttons
- Feature on/off toggles

---

## 2026-02-14 - ChatWindow Toggle Buttons Accessibility

**Learning**: The ChatWindow component had two IconButton toggle buttons (Voice Settings and Thinking Mode) that changed visual state based on selection but were missing `aria-pressed` attributes. These buttons use `variant={state ? 'primary' : 'ghost'}` to indicate active/inactive state visually, but screen reader users couldn't know which mode was currently active.

**Action**: Add `aria-pressed` to both toggle buttons:
- Voice Settings button: `aria-pressed={showVoiceSettings}` - Indicates when voice settings panel is open
- Thinking Mode button: `aria-pressed={isThinkingMode}` - Indicates when deep thinking mode is active

**Files Fixed**:
- src/components/ChatWindow.tsx - Added aria-pressed to Voice Settings button (line 327)
- src/components/ChatWindow.tsx - Added aria-pressed to Thinking Mode button (line 340)

**Pattern**: Toggle buttons that change appearance based on state MUST have `aria-pressed` for screen reader accessibility. This applies to:
- IconButton components with toggle functionality
- Feature toggle buttons (voice settings, thinking mode, etc.)
- Any button that uses variant changes to indicate state
- Button groups where one or more can be active simultaneously

**Related**: This follows the same pattern as ActivityFeed.tsx, NotificationHistory.tsx, OsisEvents.tsx, and 20+ other components where aria-pressed was added to toggle buttons.

---

## 2026-02-14 - Footer Help Button Accessibility

**Learning**: The Footer component had a plain `<button>` element for "Pusat Bantuan" (Help Center) that was missing an `aria-label` attribute. While the button had visible text, screen reader users benefit from descriptive aria-labels that provide complete context about the action being performed, especially for navigation elements in the footer.

**Action**: Add `aria-label` to the help button:
- `aria-label="Buka pusat bantuan dan dokumentasi"` - Provides clear context for screen reader users
- The label describes both the help center and documentation aspects

**File Fixed**:
- src/components/Footer.tsx - Added aria-label to Pusat Bantuan button

**Pattern**: Plain `<button>` elements with visible text still need explicit `aria-label` for consistent screen reader experience. This applies to:
- Navigation buttons in headers/footers
- Action buttons that perform specific functions
- Any button where additional context improves accessibility

**Related**: This follows the same pattern as TwoFactorAuth.tsx, LoadingState.tsx, and 50+ other components with accessibility improvements.

---

## 2026-02-13 - OsisEvents Tab Navigation Accessibility

**Learning**: The OsisEvents component had tab navigation buttons (Pendaftaran, Anggaran, Galeri Foto, Pengumuman, Umpan Balik) that changed visual state based on selection but were missing `aria-pressed` attributes. Screen reader users couldn't know which tab was currently selected.

**Action**: Add `aria-pressed` and `aria-label` to all tab navigation buttons:
- `aria-pressed={activeTab === tab.id}` - Screen readers announce selected state
- `aria-label={\`Buka tab ${tab.label}\`}` - Descriptive context for each tab
- `type="button"` - Proper button semantics

**File Fixed**:
- src/components/OsisEvents.tsx - Added accessibility to 5 tab navigation buttons

**Pattern**: Toggle button groups in navigation panels MUST have `aria-pressed` for screen reader accessibility. This applies to:
- Tab navigation buttons
- Sidebar navigation items
- Filter/toggle buttons in navigation panels

---

## 2026-02-13 - LearningProgressReport Tab Accessibility

**Learning**: The LearningProgressReport component had custom tab navigation that was missing proper ARIA tab patterns. The tab buttons (Laporan Terbaru, Riwayat, Pengaturan) lacked role="tab", aria-selected, aria-controls, and tabIndex attributes. Additionally, action buttons (Buat Laporan, Lihat Detail, Hapus) and toggle buttons (Notifikasi) were missing type="button" and aria-label attributes.

**Action**: Implement full WAI-ARIA tab pattern for custom tab navigation:
1. Container: role="tablist" with aria-label
2. Tab buttons: role="tab", aria-selected, aria-controls, tabIndex, id
3. Tab panels: role="tabpanel", aria-labelledby, id
4. Action buttons: type="button", aria-label
5. Toggle buttons: type="button", aria-pressed, aria-label

**File Fixed**:
- src/components/LearningProgressReport.tsx - Added ARIA tabs pattern to 3 tab buttons, 4 action buttons, and 1 toggle button

**Pattern**: Custom tab-like components built with native button elements must use proper ARIA tab patterns. This ensures screen reader users can navigate between tabs and know which tab is currently selected. Always add:
- role="tablist" on container
- role="tab" on buttons
- aria-selected={boolean} on buttons
- aria-controls="panel-id" on buttons
- tabIndex={0 | -1} for keyboard navigation
- role="tabpanel" on panels
- aria-labelledby="tab-id" on panels
- id on both tabs and panels for cross-referencing

---

## 2026-02-13 - Schedule View Mode Toggle Accessibility

**Learning**: The ParentScheduleView and ScheduleView components had view mode toggle buttons (Daftar/Kalender) that changed visual state based on selection but were missing `aria-pressed` attributes. Screen reader users couldn't know which view mode was currently active. Additionally, the day selector buttons in ScheduleView had the same issue.

**Action**: Add `aria-pressed={boolean}` to all view mode toggle buttons and day selector buttons:
- ParentScheduleView.tsx: Daftar button `aria-pressed={viewMode === 'list'}`, Kalender button `aria-pressed={viewMode === 'month'}`
- ScheduleView.tsx: Daftar button `aria-pressed={viewMode === 'list'}`, Kalender button `aria-pressed={viewMode === 'month'}`, day selector buttons `aria-pressed={activeDay === day}`

**Files Fixed**:
- src/components/ParentScheduleView.tsx - Added aria-pressed to 2 view mode buttons
- src/components/ScheduleView.tsx - Added aria-pressed to 2 view mode buttons + 7 day selector buttons (added type="button" as well)

**Pattern**: Toggle button groups that change visual state based on selection MUST have `aria-pressed` for screen reader accessibility. This applies to:
- Button groups where only one can be selected (radio-like behavior)
- View mode toggles (list, grid, calendar, etc.)
- Day/date selectors
- Filter buttons in lists and tables
- Any button that changes appearance based on state

---

## 2026-02-13 - MessageList Filter Button Accessibility

**Learning**: The MessageList component had filter toggle buttons (Semua, Pribadi, Grup, Belum Dibaca) that changed visual state based on selection but were missing `aria-pressed` attributes. Screen reader users couldn't know which filter was currently active.

**Action**: Add `aria-pressed={boolean}` to all filter toggle buttons:
- Semua button: `aria-pressed={filterType === 'all'}`
- Pribadi button: `aria-pressed={filterType === 'direct'}`
- Grup button: `aria-pressed={filterType === 'group'}`
- Belum Dibaca button: `aria-pressed={showUnreadOnly}`

**File Fixed**:
- src/components/MessageList.tsx - Added aria-pressed to 4 filter buttons

**Pattern**: Toggle button groups that change visual state based on selection MUST have `aria-pressed` for screen reader accessibility. This applies to:
- Button groups where only one can be selected (radio-like behavior)
- Filter buttons in lists and tables
- Any button that changes appearance based on state

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

## 2026-02-13 - Retry Button Accessibility Consistency Extended

**Learning**: While AssignmentGrading and UserManagement were fixed previously, additional retry buttons ("Coba Lagi") were found missing accessibility attributes in ClassManagement, QuizGenerator, StudentAssignments, AttendanceView, StudentPortal, StudentTimeline, and MicrophonePermissionHandler. This created an inconsistent user experience where some retry buttons showed keyboard shortcuts while others didn't.

**Action**: Add aria-label and shortcut="Ctrl+R" to all retry buttons in error states across 7 components:
- ClassManagement.tsx: 2 buttons (lines 272-277, 298-303) - `aria-label="Coba lagi memuat data siswa"`
- QuizGenerator.tsx: 1 button - `aria-label="Coba lagi memuat materi"`
- StudentAssignments.tsx: 1 button - `aria-label="Coba lagi memuat tugas"`
- AttendanceView.tsx: 1 button - `aria-label="Coba lagi memuat data kehadiran"`
- StudentPortal.tsx: 1 button - `aria-label="Coba lagi memuat portal siswa"`
- StudentTimeline.tsx: 1 plain button - added `type="button"` and `aria-label="Coba lagi memuat timeline aktivitas"`
- MicrophonePermissionHandler.tsx: 1 button - `aria-label="Coba lagi meminta izin mikrofon"`

**Files Fixed**:
- src/components/ClassManagement.tsx
- src/components/QuizGenerator.tsx
- src/components/StudentAssignments.tsx
- src/components/AttendanceView.tsx
- src/components/student-portal/StudentPortal.tsx
- src/components/Shared/StudentTimeline.tsx
- src/components/MicrophonePermissionHandler.tsx

**Pattern**: Always audit retry buttons in error states - if similar components already have keyboard shortcut hints (Ctrl+R), ensure consistency across ALL retry buttons. This applies to:
- Error state retry buttons
- Loading failure retry buttons
- Permission request retry buttons
- Plain button elements (need type="button" and aria-label)

---

## 2026-02-13 - Retry Button Accessibility Consistency

**Learning**: Retry buttons in AssignmentGrading and UserManagement components were missing keyboard shortcut hints (Ctrl+R) that were already present in similar components like ELibrary, StudentInsights, and StudyPlanGenerator. The AssignmentGrading retry button was also missing an aria-label, making it inaccessible to screen reader users.

**Action**: Add both aria-label and shortcut="Ctrl+R" to all retry/refresh buttons in error states:
- AssignmentGrading.tsx: Added `aria-label="Coba lagi memuat tugas"` and `shortcut="Ctrl+R"`
- UserManagement.tsx: Added `shortcut="Ctrl+R"` (already had aria-label)

**Pattern**: Audit all retry/refresh buttons in error handling components. If similar components (ELibrary, StudentInsights, StudyPlanGenerator) already have keyboard shortcut hints, ensure consistency across all retry buttons. Always include:
- aria-label for screen reader accessibility
- shortcut="Ctrl+R" to make the keyboard shortcut discoverable

---

## 2026-02-13 - Generate QR Code Button Aria-Label

**Learning**: The SchoolInventory component had a Generate QR Code button that used `title` for tooltip but was missing `aria-label` for screen reader accessibility. Interestingly, the adjacent Delete button already had both `title` and `aria-label`, showing this was an oversight rather than a pattern issue.

**Action**: Add `aria-label` to icon-only buttons that already have `title` but are missing screen reader support:
- SchoolInventory.tsx: Added `aria-label={\`Generate QR Code untuk ${item.itemName}\`}`

**File Fixed**:
- src/components/SchoolInventory.tsx - Added aria-label to Generate QR Code button

**Pattern**: When adding `title` to icon-only buttons, ALWAYS also add `aria-label`. The `title` attribute only helps mouse users with tooltips, while `aria-label` is needed for screen reader users. Check adjacent buttons in the same component for consistency.

---

## 2026-02-13 - LoadingState Error Buttons Accessibility

**Learning**: The LoadingState component's ErrorState sub-component had action buttons ("Coba Lagi" and "Muat Ulang Halaman") that were missing both aria-label and keyboard shortcut hints. This is a high-impact UI component used across multiple pages for error states.

**Action**: Add both aria-label and shortcut props to error state action buttons:
- "Coba Lagi" (Retry) button: `aria-label="Coba lagi memuat data"`, `shortcut="Ctrl+R"`
- "Muat Ulang Halaman" (Reload) button: `aria-label="Muat ulang halaman"`, `shortcut="Ctrl+Shift+R"`

**File Fixed**:
- src/components/ui/LoadingState.tsx - Added accessibility to error state action buttons

**Pattern**: Always audit reusable UI components for accessibility - fixing one component benefits multiple pages. LoadingState is used in error states throughout the app, so this single fix improves accessibility across the entire application.

---

## 2026-02-13 - TwoFactorAuth Cancel Button Accessibility

**Learning**: The TwoFactorAuth component had a plain `<button>` element without `type="button"` attribute and without `aria-label`. This is a common oversight in UI components where the cancel button doesn't submit forms but lacks proper type and accessibility attributes.

**Action**: Add `type="button"` and `aria-label` to all plain button elements in UI components:
- TwoFactorAuth.tsx: Added `type="button"` and `aria-label="Batalkan pengaturan autentikasi dua faktor"`

**File Fixed**:
- src/components/ui/TwoFactorAuth.tsx - Added accessibility to cancel button

**Pattern**: Always audit plain `<button>` elements (not using the Button component) for:
1. `type="button"` - Prevents accidental form submission
2. `aria-label` - Provides screen reader context
3. This applies to any inline button elements in JSX, not just Button components

---

## 2026-02-13 - PermissionManager Export Button Aria-Label

**Learning**: The PermissionManager component had an "Export" button that was missing an `aria-label`, making it inaccessible to screen reader users. This was inconsistent with other export buttons in the codebase (GradeAnalytics, SchoolInventory, ConsolidatedReportsView, ParentPaymentsView) which all had proper aria-labels.

**Action**: Added `aria-label="Ekspor matriks izin ke file"` to the Export button in PermissionManager. Also updated the test to use the new aria-label for button identification.

**File Fixed**:
- src/components/admin/PermissionManager.tsx - Added aria-label to Export button
- src/components/admin/__tests__/PermissionManager.test.tsx - Updated test to use new aria-label

**Pattern**: Export buttons in admin/management dashboards are high-risk for accessibility oversight because they have visible text. Always audit with pattern: if button has onClick + export/download, verify aria-label exists. This is especially important for:
- Permission management pages
- Analytics dashboards
- User management pages
- Any page with data export functionality

---

## 2026-02-13 - ActivityFeed and NotificationHistory Filter Button Accessibility

**Learning**: The ActivityFeed and NotificationHistory components had filter toggle buttons that changed visual state based on selection (primary vs ghost variant) but were missing `aria-pressed` attributes. This made them inaccessible to screen reader users who couldn't know which filter was currently active.

**Action**: Add `aria-pressed={boolean}` to all filter toggle buttons in both components:
- ActivityFeed.tsx: Added aria-pressed to "Semua", "Belum Dibaca", and activity type filter buttons (5 buttons total)
- NotificationHistory.tsx: Added aria-pressed to "Semua", "Nilai", "Sistem", "Pengumuman" filter buttons (4 buttons total)

**Files Fixed**:
- src/components/ActivityFeed.tsx - Added aria-pressed to 5 filter buttons
- src/components/NotificationHistory.tsx - Added aria-pressed to 4 filter buttons

**Pattern**: Always audit filter button groups (toggle buttons that change visual state) for aria-pressed attribute. This applies to:
- Filter buttons in activity/notification feeds
- Toggle button groups where only one can be selected
- Any button that changes appearance based on state (primary vs ghost variant)
- Search for pattern: variant={filter === ? 'primary' : 'ghost'}

