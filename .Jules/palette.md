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