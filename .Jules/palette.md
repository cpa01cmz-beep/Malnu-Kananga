## 2026-02-10 - Icon-Only Button Accessibility Fix

**Learning:** Even in a well-maintained codebase with extensive ARIA labeling (450+ aria-label occurrences), icon-only buttons can still slip through without proper accessibility attributes. The QuizPreview component had two icon-only buttons (edit and delete) that were missing aria-label attributes, making them inaccessible to screen reader users.

**Action:** When auditing for accessibility, specifically target icon-only buttons in card components and table rows. Look for patterns like:
- `<Button><IconComponent /></Button>` without aria-label
- Buttons in card headers/footers with only icons
- Edit/delete action buttons in data tables

Always add descriptive aria-labels that clearly indicate the button's action and target (e.g., "Edit question", "Delete user" rather than just "Edit", "Delete").