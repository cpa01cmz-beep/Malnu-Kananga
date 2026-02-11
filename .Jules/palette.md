# Palette's UX Journal

Critical UX/accessibility learnings specific to MA Malnu Kananga school management system.

---

## 2026-02-11 - Accessibility Aria-Label Pattern
**Learning:** Even in a well-maintained codebase with 456+ aria-label implementations, critical accessibility gaps exist in high-traffic components. The GradingActions component handles CSV/PDF exports for thousands of users but was missing screen reader support on the "Export CSV" button.

**Action:** Systematically audit all Button components that:
1. Have text content (not icon-only)
2. Are in critical user flows (exports, data operations)
3. May have been overlooked due to having visible text

Always verify aria-label exists on action buttons, regardless of visible text presence. Screen readers benefit from descriptive labels that clarify context beyond just the visible text.

**Pattern Found:** Export buttons are high-risk - users expect clear action descriptions for data operations affecting their work.