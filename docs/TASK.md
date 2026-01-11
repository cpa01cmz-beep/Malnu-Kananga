# Task List

**Created**: 2025-01-01
**Last Updated**: 2026-01-11
**Version**: 2.1.0

---

## Priority Tasks

### P0: Critical
- [ ] Verify all API endpoints have consistent error handling
  - Audit all endpoints in worker.js
  - Ensure 404, 500, and validation errors are consistent
  - Test error messages are user-friendly

### P1: High
- [ ] Enhance test coverage to 80%+
  - Current: ~65%
  - Add unit tests for critical services (authService, apiService, geminiService)
  - Add integration tests for key workflows (login, PPDB, grade input)
  - Add component tests for major UI elements (AdminDashboard, StudentPortal, TeacherDashboard)

- [ ] Complete API documentation with examples
  - Add request/response examples for all endpoints
  - Document error responses and authentication
  - Document rate limits and pagination

- [ ] Create comprehensive component library documentation
  - Document all reusable UI components with props and usage examples
  - Include accessibility guidelines

### UI/UX Enhancements
- [x] Component Extraction (Phase 5 - COMPLETED 2026-01-07)
  - [x] Card component with 4 variants (default, hover, interactive, gradient)
  - [x] Textarea component with auto-resize functionality
  - [x] Modal component with focus trap and accessibility
  - [x] Badge component with 5 variants
  - [x] Button component with 14 variants
  - [x] Input, Select, Label components with form validation
  - [x] Alert component with 5 variants and 3 sizes
  - [x] FileInput component with accessibility
  - [x] Tab component with keyboard navigation
  - [x] IconButton component for icon-only buttons
  - [x] DashboardActionCard, EmptyState, SuspenseLoading, ProgressBar, GradientButton, LoadingSpinner, Skeleton, SearchInput, Pagination, PageHeader, Section, LinkCard, SmallActionButton, BackButton, Toast, LoadingOverlay, DataTable

- [x] Accessibility & Form Compliance (Phase 4 - COMPLETED 2026-01-07)
  - [x] All form inputs have proper id, name, autocomplete attributes
  - [x] Proper label-to-input associations with htmlFor
  - [x] ARIA labels maintained for voice settings
  - [x] WCAG 2.1 AA compliant
  - [x] Enhanced NotificationCenter keyboard navigation and ARIA compliance
  - [x] FolderNavigation keyboard accessibility
  - [x] OsisEvents keyboard accessibility
  - [x] StudentInsights trend icon accessibility

- [x] Gradient System Refactoring (Phase 5 - COMPLETED 2026-01-10)
  - [x] Centralized gradient configuration in src/config/gradients.ts
  - [x] Refactored 10+ components to use GRADIENT_CLASSES
  - [x] Added 4 background gradients and 5 decorative gradients
  - [x] Implemented getResponsiveGradient() for light/dark mode switching
  - [x] Refactored GradientButton component to use GRADIENT_CLASSES

- [x] Styling System Integration (Phase 5 - COMPLETED 2026-01-08)
  - [x] Fixed Tailwind v4 + ThemeManager integration conflicts
  - [x] Implemented CSS custom properties system (--theme-*)
  - [x] Updated index.css to use var(--theme-*) with fallback values
  - [x] Added missing --color-purple-* color scale definitions
  - [x] Updated themeManager.ts to control --theme-* CSS variables
  - [x] All Tailwind utility classes now adapt to theme changes

- [x] Inline Styles Elimination (Phase 5 - COMPLETED 2026-01-07 to 2026-01-10)
  - [x] Refactored 15+ components to use centralized UI components
  - [x] Eliminated ~150 lines of inline badge styles
  - [x] Eliminated ~60 lines of inline button styles (orange-solid)
  - [x] Eliminated ~100 lines of inline button styles (teal-solid, 26 instances)
  - [x] Eliminated ~200 lines of duplicate Suspense fallback code
  - [x] Refactored 3 inline alert styles to use Alert component
  - [x] Refactored 4 inline status alert boxes to use Alert component
  - [x] Refactored 15 components to use centralized EmptyState component
   - [x] Refactored form inputs to use SearchInput, Input, Select, Textarea
   - [x] Refactored UserManagement 'Coba lagi' button to use Button component (2026-01-11)
     - Replaced inline styled button with Button component using ghost variant
     - Improved accessibility with proper ARIA attributes
     - Enhanced consistency with design system
     - Maintained error retry functionality
     - PR #1032: https://github.com/cpa01cmz-beep/Malnu-Kananga/pull/1032

### P2: Medium
- [ ] Optimize bundle size to <500KB initial load
  - Implement code splitting for heavy modules
  - Lazy load non-critical components
  - Optimize images and assets

- [ ] Implement database query optimization
  - Add indexes for frequently queried columns
  - Optimize JOIN operations
  - Implement query result caching

- [ ] Add real-time notifications with WebSocket
  - Replace polling with WebSocket for live updates
  - Implement reconnection logic
  - Add notification queue for offline users

### P3: Low
- [ ] Update dependencies to latest stable versions
  - Review and test compatibility of major updates
  - Run security audit

- [ ] Clean up stale remote branches
  - Identify and coordinate deletion of branches >30 days old
  - Document branch lifecycle policy

- [ ] Improve error monitoring and alerting
  - Integrate error tracking service
  - Add performance monitoring
  - Set up alerts for critical failures

---

## Current Status

  | Metric | Status | Details |
   |--------|--------|---------|
   | TypeScript | ✅ Passing | 0 errors, strict mode enabled |
   | Tests | ✅ Passing | 591 tests passing, 32 test files |
   | Build | ✅ Success | ~10s build time |
   | Linting | ✅ Passing | 0 errors, <20 warnings |
   | Security | ✅ Clean | 0 vulnerabilities |
   | Accessibility | ✅ Compliant | WCAG 2.1 AA compliant |
   | UI/UX | ✅ Excellent | Comprehensive design system, 95%+ component consistency |
   | Responsive Design | ✅ Complete | Mobile-first approach with proper breakpoints |
   | Design System | ✅ Centralized | Gradients, colors, components all standardized |

---

## Milestones

### Q1 2026 (January - March)
  - [x] Complete color system migration (gray → neutral)
    - [x] Refactor SiteEditor.tsx to use reusable Modal component (2026-01-10)
      - Replaced custom modal implementation (lines 283-469) with Modal component
      - Replaced confirmation modal (lines 472-553) with Modal component
      - Improved accessibility with built-in focus trap and ARIA compliance
      - Maintained all functionality and styling
    - [x] Refactor MaterialSharing.tsx to use reusable Modal component (2026-01-10)
      - Replaced custom modal implementation (lines 193-377) with Modal component
      - Improved accessibility with built-in focus trap and ARIA compliance
      - Maintained all functionality and styling
   - [x] Review NotificationCenter.tsx - N/A (dropdown pattern, not modal) (2026-01-10)
       - Confirmed NotificationCenter uses dropdown pattern, not modal pattern
       - Modal component not appropriate for this use case
       - No changes needed
     - [x] Complete remaining gray → neutral color migration (2026-01-10)
       - Refactored RealTimeExample.tsx - Replaced 27 gray- color classes with neutral- classes with dark mode support
       - Refactored WebSocketStatus.tsx - Replaced 6 gray- color classes with neutral- classes with dark mode support
       - All color classes now follow design system standard (neutral palette)
    - [x] Create reusable Textarea component with auto-resize (2026-01-07)
    - [x] Refactor NotificationHistory to use Badge and IconButton components (2026-01-10)
    - [x] Refactor MaterialSharing to use Button and IconButton components (2026-01-10)
    - [x] Create reusable Modal component with focus trap and accessibility (2026-01-07)
    - [x] Extract repeated BackButton pattern into reusable component with accessibility (2026-01-07)
    - [x] Create reusable Badge component for status indicators (2026-01-07)
    - [x] Refactor UserManagement and OsisEvents forms to use Input/Select components (2026-01-07)
    - [x] Create reusable IconButton component for icon-only buttons (2026-01-07)
    - [x] Refactor Toast, ThemeSelector, LoginModal, Header, UserManagement to use IconButton (2026-01-07)
    - [x] Create reusable DashboardActionCard component with icon, title, description, color theme, and online/offline status (2026-01-07)
    - [x] Refactor TeacherDashboard, StudentPortal, ParentDashboard, AdminDashboard to use DashboardActionCard (2026-01-07)
    - [x] Fix useFocusTrap hook code formatting issue (2026-01-07)
     - [x] Refactor VoiceSettings to use reusable Modal component with proper focus trap (3 modals) (2026-01-07)
     - [x] Refactor LoginModal to use reusable Modal component with proper focus trap (2026-01-07)
       - [x] Refactor inline button and badge styles to use reusable Button and Badge components (2026-01-07)
       - [x] Create reusable GradientButton component for hero sections with primary/secondary variants and gradient backgrounds (2026-01-07)
       - [x] Refactor HeroSection to use GradientButton component instead of inline styles (2026-01-07)
       - [x] Fix Tailwind v4 + ThemeManager integration conflicts (2026-01-08)
        - [x] Fix inconsistent scrollbar styling system to use Tailwind v4 CSS variables (2026-01-08)
         - [x] Create reusable ProgressBar component with 4 sizes (sm, md, lg, xl), 12 colors, and 3 variants (default, striped, animated) - Refactored 15+ progress bar instances across 7 files (2026-01-08)
          - [x] Fix type error in NotificationAnalytics.tsx - convert string percentage to number for ProgressBar (2026-01-08)
          - [x] Fix ProgressBar component to use max prop for aria-valuemax when custom ARIA values not provided (2026-01-08)
           - [x] Fix ProgressBar test to handle floating-point precision in width calculation (2026-01-08)
             - [x] Refactor TemplateManagement.tsx to use Button, Input, Select, Textarea, and IconButton components - Eliminated 11 inline styles, improved consistency and accessibility (2026-01-08)
             - [x] Refactor ChatWindow and SiteEditor to use reusable Textarea component with separate send buttons - Eliminated AutoResizeTextarea redundancy, improved design system consistency (2026-01-08)
              - [x] Refactor VoiceCommandsHelp to use reusable Modal component - Eliminated hardcoded modal pattern, improved accessibility with focus trap, body scroll lock, and proper ARIA compliance (2026-01-08)
               - [x] Enhance ChatWindow accessibility with focus management, keyboard navigation, and screen reader support - Added useFocusTrap hook, Escape key handler, ARIA roles (dialog, log, list, listitem), aria-live updates, and semantic HTML structure with <ul> and <li> for messages (2026-01-08)
               - [x] Refactor chart colors to use centralized design tokens - Created CHART_COLORS configuration in src/config/chartColors.ts, updated StudentInsights, SchoolInventory, ProgressAnalytics, and AcademicGrades components to use design tokens instead of hardcoded hex values (2026-01-08)
                - [x] Fix FolderNavigation accessibility - Added role="button", tabIndex={0}, and onKeyDown handlers for keyboard navigation to folder selection areas (2026-01-08)
               - [x] Fix ProgressBar striped pattern to use theme-aware CSS variables - Replaced hardcoded rgba(255, 255, 255, 0.15) with CSS variable --progress-bar-striped-overlay that adapts to light/dark themes (2026-01-08)
                 - [x] Fix StudentInsights trend icon accessibility - Replaced color-only trend indicators (↗, ↘, →) with accessible version including aria-label, role="img", and sr-only text labels for screen readers (WCAG 2.1 SC 1.4.1 compliance) (2026-01-09)
       - [x] Fix OsisEvents keyboard accessibility - Add role="button", tabIndex={0}, and onKeyDown handler to event card div; add aria-label to budget approval, delete, and close buttons; improve focus indicators (WCAG 2.1 SC 2.1.1 compliance) (2026-01-09)
       - [x] Refactor inline badges to use reusable Badge component - Replaced inline badge implementations across 9 files (NewsCard, SchoolInventory, ParentMeetingsView, ParentGradesView, ParentPaymentsView, BatchManagement, AcademicGrades, DashboardActionCard, StudentPortal) with Badge component; improved consistency, accessibility, and maintainability; eliminated ~150 lines of inline badge styles (2026-01-09)
        - [x] Refactor VoiceSettings.tsx to use reusable Button component - Replaced 3 hardcoded button styles ("Tes Suara" with bg-green-600, "Backup Pengaturan" with bg-blue-600, "Reset ke Pengaturan Awal" with bg-red-600) with Button component using green-solid, blue-solid, and red-solid variants; added proper aria-labels for accessibility; improved consistency with design system (2026-01-09)
         - [x] Refactor inline button styles to use reusable Button component - Added orange-solid variant to Button component; refactored 12 hardcoded button styles across 5 files (ParentPaymentsView: 2 buttons, AttendanceView: 1 button, AcademicGrades: 4 buttons, FolderNavigation: 1 button, GradingManagement: 4 buttons); improved consistency, accessibility with built-in ARIA attributes, and maintainability; eliminated ~60 lines of inline button styles (2026-01-09)
         - [x] Refactor inline button styles to use reusable Button component - Added teal-solid variant to Button component; refactored 26 hardcoded button instances across 15 files (StudentLearningModule: 3 buttons, PPDBRegistration: 2 buttons, OsisEvents: 1 button, ParentMeetingsView: 2 buttons, ParentScheduleView: 1 button, ParentMessagingView: 1 button, ProgressAnalytics: 3 buttons, GradingManagement: 3 buttons, MaterialUpload: 3 buttons, NotificationHistory: 1 button, MaterialTemplatesLibrary: 2 buttons, ClassManagement: 1 button, ParentNotificationSettings: 2 buttons, ScheduleView: 1 button, ConsolidatedReportsView: 1 button); improved consistency, accessibility with built-in ARIA attributes, and maintainability; eliminated ~100 lines of inline button styles (2026-01-09, 2026-01-10)
          - [x] Refactor inline button styles in GradingManagement - Replaced 3 hardcoded button instances (Batch Mode toggle, Export PDF, AI Analysis) with Button component using blue-solid, green-solid, and purple-solid variants; added isLoading prop support for loading states; improved consistency, accessibility with built-in ARIA attributes, and maintainability; eliminated ~15 lines of inline styles (2026-01-10)
             - [x] Refactor hardcoded gradient classes to use centralized GRADIENT_CLASSES - Added 4 new background gradients (FOOTER, PROFILE, PPDB, RELATED_LINKS) and 5 new decorative gradients (PRIMARY_DECORATIVE, PRIMARY_DECORATIVE_SOFT, CHAT_HEADER, AI_SEMANTIC, HERO_DECORATIVE) to gradients.ts config; refactored 10+ components (HeroSection, Footer, App.tsx, ProfileSection, PPDBSection, RelatedLinksSection, ProgramsSection, NewsSection, ELibrary, ChatWindow, ParentDashboard) to use centralized gradient system via getResponsiveGradient() helper; eliminated code duplication and improved design system consistency (2026-01-10)
             - [x] Add HERO_DECORATIVE radial gradient to centralized configuration - Added HERO_DECORATIVE radial gradient to GRADIENT_CLASSES in gradients.ts; added HERO_DECORATIVE to DARK_GRADIENT_CLASSES for dark mode support; updated HeroSection.tsx to use centralized gradient via getResponsiveGradient(); updated GRADIENTS.md documentation; eliminated hardcoded radial gradient in HeroSection; improves design system consistency and maintainability (2026-01-10)
           - [x] Create reusable Alert component with 5 variants (info, success, warning, error, neutral), 3 sizes (sm, md, lg), 3 border options (left, full, none), and full accessibility support (2026-01-10)
           - [x] Refactor ParentPaymentsView to use Alert component - Replaced 8 hardcoded alert/box styles (3 summary cards + 4 status cards) with Alert component; improved consistency and maintainability (2026-01-10)
           - [x] Refactor AttendanceView to use Alert component - Replaced 4 hardcoded status alert boxes with Alert component; improved consistency and maintainability (2026-01-10)
           - [x] Refactor VoiceNotificationDemo to use Alert component - Replaced 1 hardcoded status alert box with Alert component; improved consistency and maintainability (2026-01-10)
            - [x] Create reusable FileInput component with 3 sizes (sm, md, lg), 3 states (default, error, success), full accessibility support, and integrated file button styling - Refactored 2+ inline file input instances across VersionControl and MaterialTemplatesLibrary; improved consistency, accessibility with proper ARIA attributes, and maintainability (2026-01-10)
              - [x] Extract and standardize EmptyState component - Exported EmptyState as standalone component from LoadingState.tsx with new variant prop (default, minimal, illustrated) and enhanced ARIA attributes (role="status", aria-live="polite", aria-label); refactored 3 components (NotificationHistory, ELibrary, OsisEvents) to use standalone EmptyState component; improved consistency, accessibility, and maintainability across 47+ inline empty state instances in codebase (2026-01-10)
             - [x] Refactor CalendarView to use Card component - Replaced 4 hardcoded 'bg-white rounded-lg shadow' divs with Card component; used padding="none" for month, week views, and view mode selector; used default padding for day view; improves dark mode support with dark:bg-neutral-800 and dark:border-neutral-700; enhances design system consistency; maintains all ARIA attributes and semantic structure (2026-01-10)
             - [x] Create reusable SuspenseLoading component for consistent React Suspense fallbacks - Created SuspenseLoading component with 3 sizes (sm, md, lg), customizable loading messages, full ARIA support (role="status", aria-live="polite", aria-busy="true"), skeleton loading, and dark mode support; refactored 7 inline Suspense fallbacks in App.tsx (AdminDashboard, TeacherDashboard, ParentDashboard, StudentPortal, PPDBRegistration, DocumentationPage, SiteEditor) to use SuspenseLoading component; improved consistency, accessibility, and maintainability; eliminated ~200 lines of duplicate inline fallback code (2026-01-10)
            - [x] Refactor ConfirmationDialog to use Button component - Replaced inline button styles (cancel and confirm buttons) with reusable Button component; removed LoadingSpinner import and inline loading logic; uses Button's built-in isLoading prop for consistent loading states; improved maintainability and consistency with design system (2026-01-10)
               - [x] Create reusable Tab component with 3 variants (pill, border, icon), 6 color options (green, blue, purple, red, yellow, neutral), badge notification support, full keyboard navigation, orientation options (horizontal, vertical), and comprehensive ARIA compliance (WCAG 2.1 AA) (2026-01-10)
               - [x] Refactor ProgressAnalytics to use Tab component - Replaced hardcoded tab button styles with reusable Tab component; improved consistency and accessibility (2026-01-10)
               - [x] Refactor VoiceNotificationSettings to use Tab component - Replaced hardcoded tab button styles with reusable Tab component; improved consistency and accessibility (2026-01-10)
               - [x] Refactor NotificationSettings to use Tab component with badge support - Replaced hardcoded tab button styles with reusable Tab component including badge notification for pending batches; improved consistency and accessibility (2026-01-10)
               - [x] Refactor SchoolInventory to use Tab component with icons - Replaced hardcoded tab button styles with reusable Tab component including icon support; improved consistency and accessibility (2026-01-10)
                - [x] Refactor PermissionManager to use Tab component - Replaced hardcoded tab button styles with reusable Tab component; improved consistency and accessibility (2026-01-10)
                - [x] Refactor NotificationHistory to use Badge and IconButton components - Replaced inline badge styles (priority "Penting" and status "Baru") and inline button/IconButton styles (close button, filter buttons, mark-as-read button, check-circle button) with Badge and IconButton components; improved consistency, accessibility with built-in ARIA attributes, and maintainability; eliminated ~40 lines of inline styles (2026-01-10)
                - [x] Refactor MaterialSharing to use Button and IconButton components - Replaced inline button styles (close modal button, revoke access button, cancel button) with Button and IconButton components; improved consistency, accessibility with proper aria-labels, and maintainability; eliminated ~30 lines of inline styles (2026-01-10)
                  - [x] Refactor inline form input styles to use reusable UI components - Replaced inline search input (ELibrary), form inputs/selects/textareas (MaterialUpload), and message inputs/selects (ParentMessagingView) with SearchInput, Input, Select, and Textarea components; improved consistency with design system, enhanced accessibility (proper ARIA attributes), better dark mode support, and maintainability; eliminated ~60 lines of inline styles (2026-01-10)
                 - [x] Fix redundant gradient usage in StudentPortal.tsx - Removed conflicting className={getGradientClass('ORANGE_SOFT')} that was applied alongside gradient prop in DashboardActionCard; eliminated redundant gradient backgrounds, improved design system consistency, and clarified component API usage (2026-01-10)
                  - [x] Complete EmptyState component refactoring - Refactored 15 remaining components to use centralized EmptyState component:
                      - ParentAttendanceView - "Belum ada data kehadiran"
                      - ParentGradesView - "Belum ada nilai tersedia"
                      - ParentMessagingView - "Belum ada pesan"
                      - ParentMeetingsView - "Belum ada pertemuan terjadwal"
                      - NotificationAnalytics - "Belum ada data analytics"
                      - NotificationSettings - "Belum ada riwayat notifikasi"
                      - NotificationCenter - "Belum ada notifikasi" + action button support
                      - VoiceNotificationSettings - "Belum ada riwayat notifikasi suara"
                      - BatchManagement - "Belum ada batch notifikasi"
                      - MaterialUpload - "Belum ada materi yang diunggah" / "Belum ada materi di folder X"
                      - ProgressAnalytics - "Belum ada target prestasi yang ditetapkan"
                      - AcademicGrades - "Belum ada data nilai tersedia"
                      - AttendanceView - "Belum ada riwayat kehadiran"
                      - PPDBManagement - "Belum ada data pendaftar"
                      - StudentLearningModule - "Belum ada kuis untuk topik X" + action button

                    Benefits: Consistency across entire application, automatic ARIA support (role="status", aria-live="polite", aria-label), centralized maintainability, ~17 net lines of duplicate code eliminated, support for 3 sizes (sm, md, lg) and 3 variants (default, minimal, illustrated), action button support for CTAs, custom icon support (2026-01-10)
                   - [x] Fix WebSocketStatus dark mode support and accessibility - Updated WebSocketStatus component to support dark mode with proper Tailwind dark: classes for background colors, text colors, and borders; added ARIA labels to reconnect buttons for screen reader accessibility; added role="status" and aria-label to WebSocketIndicator for improved screen reader support; improved keyboard navigation and focus states (2026-01-11)
                   - [x] Improve LoginModal form error display - Replaced confusing conditional error handling (error only showed on specific fields when other fields were filled) with dedicated error alert box above form fields; improved UX by making errors consistently visible; added role="alert" for screen readers; added error icon for better visual prominence; used consistent red color scheme matching design system (2026-01-10)
                   - [x] Refactor ThemeSelector to use centralized Modal component - Replaced custom modal implementation with Modal component; improved accessibility with built-in focus trap from useFocusTrap hook; added Escape key handler and body scroll lock; improved consistency with design system; eliminated ~30 lines of duplicate modal code; added focus:ring styles to all interactive elements for keyboard navigation; maintained custom positioning (top-20 right-4) while using Modal functionality (2026-01-11)
                  - [x] Refactor StudentLearningModule to use Card component - Replaced hardcoded topic cards (button with interactive styles), topic details card (bg-white with shadow), and flashcards (border rounded divs) with centralized Card component using interactive, default, and default variants; improved consistency with design system, enhanced accessibility via Card's built-in ARIA support (proper roles, focus management), and maintainability; eliminated ~30 lines of inline styles (2026-01-10)
         - [ ] Achieve 80% test coverage
  - [ ] Complete API documentation
  - [ ] Optimize bundle size to <500KB

### Q2 2026 (April - June)
- [ ] Implement WebSocket notifications
- [ ] Database query optimization
- [ ] Component library with Storybook
- [ ] Error monitoring integration

---

## Backlog

### Future Considerations
- Mobile app development (React Native)
- Advanced analytics dashboard
- Offline-first architecture improvements
- Multi-language support expansion
- Integration with external school systems
- Advanced AI features (sentiment analysis, predictive analytics)

---

**Maintainer**: Repository Team
**Review**: Monthly (first Friday of each month)
