# MA Malnu Kananga - System Blueprint

**Last Updated**: 2026-01-22 (Documentation Synchronization Complete)

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Cloudflare Workers (Serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **AI/ML**: Google Gemini API
- **Testing**: Vitest + React Testing Library
- **PWA**: vite-plugin-pwa with Workbox
- **Rate Limiting**: Cloudflare Workers KV (Sliding Window Algorithm)

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React 19   │  │  Tailwind 4  │  │  Vite PWA    │  │
│  │  Components  │  │    Styles    │  │  Service     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────┴────────────────────────────────────┐
│                  API Gateway Layer                      │
│              Cloudflare Workers (JWT Auth)               │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        ▼            ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Cloudflare  │ │   R2     │ │  Gemini  │ │  OCR     │
│     D1       │ │  Storage  │ │    API   │ │  Service │
│  (SQLite)    │ │           │ │          │ │          │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Module Structure

#### Core Services (`src/services/`)
- **`apiService.ts`** - Main API communication with JWT auth
- **`authService.ts`** - Authentication & authorization logic
- **`permissionService.ts`** - Role-based access control (RBAC)
- **`errorHandler.ts`** - Centralized error handling
- **`logger.ts`** - Structured logging utility
- **`webSocketService.ts`** - WebSocket client for real-time communication
- **`offlineDataService.ts`** - Offline data caching and synchronization
- **`offlineActionQueueService.ts`** - Queue for offline actions to sync
- **`errorMonitoringService.ts`** - Sentry error tracking integration
- **`performanceMonitor.ts`** - Performance metrics collection

#### AI & Voice Services
- **`geminiService.ts`** - Google Gemini AI integration
- **`aiCacheService.ts`** - AI response caching and management
- **`speechRecognitionService.ts`** - Web Speech API (Voice → Text)
- **`speechSynthesisService.ts`** - Text-to-Speech (Text → Voice)

#### Voice Input Hook (added 2026-01-21)
- **`useVoiceInput.ts`** - Field-level voice input hook for forms
  - Provides voice-to-text transcription for form fields
  - Supports different field types: text, number, email, phone, textarea
  - Validates input after transcription
  - Provides voice feedback (success/error messages)
  - Indonesian language support
  - Field-specific configuration (validation rules, labels)
  - Error handling and retry logic
  - Integration with speechRecognitionService and speechSynthesisService

- **`FieldVoiceInput.tsx`** - Reusable voice input button component
  - Wraps useVoiceInput hook with UI feedback
  - Visual indicators for listening, error states
  - Compact and normal size variants
  - Accessibility features (aria-labels, tooltips)
  - Supports disabled state

#### Voice Input Integration (added 2026-01-21)
- **`PPDBRegistration.tsx`** - PPDB registration form with voice input (Phase 2 Complete)
  - Voice input for 7 form fields: fullName, nisn, originSchool, parentName, phoneNumber, email, address
  - Inline VoiceButton component next to each form field
  - Field-specific processing (title case for names, phone normalization, email normalization)
  - Indonesian language voice feedback
  - Real-time validation integration
  - Visual feedback (listening pulse animation, error states)

- **`MaterialUpload.tsx`** - Material upload form with voice input (Phase 4 Complete)
  - Voice input for 2 form fields: Title, Description
  - FieldVoiceInput component integrated next to each input field
  - Title field: text type with title-case transformation
  - Description field: textarea type
  - Indonesian language voice feedback
  - Flex layout for voice button placement next to inputs
  - Visual feedback (listening, error states, success messages)

#### Real-Time Services (added 2026-01-21)
 - **`useRealtimeEvents.ts`** - Custom hook for WebSocket event subscription and management
   - Subscribes to real-time event types
   - Provides connection status (connected, connecting, reconnect attempts)
   - Event filtering support
   - Automatic cleanup on unmount
   - Connection state polling

 #### Dashboard Components (Enhanced 2026-01-21)
 - **`ActivityFeed.tsx`** - Real-time activity feed component (completed 2026-01-21, Phase 1)
   - Displays recent activities grouped by time (Hari Ini, Kemarin, Minggu Ini)
   - Activity filtering by type (all, unread, or specific type)
   - Connection status indicator (online/offline)
   - Visual indicators for unread activities
   - Local storage persistence for activity history
   - Supports activity types: grades, attendance, materials, announcements, events, messages
   - **Integrated into StudentPortal** (2026-01-21, Phase 2)
     - Grade events navigate to Grades view
     - Attendance events navigate to Attendance view
     - Material events navigate to E-Library view
     - Message events navigate to Groups view
   - **Integrated into TeacherDashboard** (2026-01-21, Phase 2)
     - Grade events navigate to Analytics view
     - Announcement events show toast notifications
     - Event events show toast notifications
     - Message events navigate to Messages view
   - **Integrated into ParentDashboard** (2026-01-21, Phase 2)
     - Grade events navigate to Grades view
     - Attendance events navigate to Attendance view
     - Announcement events navigate to Events view
     - Event events navigate to Events view

- **`StudentPortal.tsx`** - Student dashboard with real-time data refresh (completed 2026-01-21, Phase 3)
  - Auto-refreshes grades, attendance, and materials when events received
  - Visual connection status indicator in Voice Commands section
  - Offline mode handling (real-time disabled when offline)
  - Cache updates on data refresh

- **`TeacherDashboard.tsx`** - Teacher dashboard with real-time data refresh (completed 2026-01-21, Phase 3)
  - Auto-refreshes dashboard data when grade/announcement/event events received
  - Visual connection status indicator in Voice Commands section
  - Toast notifications for new messages
  - Offline mode handling (real-time disabled when offline)

- **`ParentDashboard.tsx`** - Parent dashboard with real-time data refresh (completed 2026-01-21, Phase 3)
  - Auto-refreshes child data when grade/attendance events received
  - Visual connection status indicator
  - Child-specific data refresh (only refreshes selected child's data)
  - Cache updates on data refresh
  - Offline mode handling (real-time disabled when offline)
- **`voiceSettingsBackup.ts`** - Voice settings persistence
- **`voiceMessageQueue.ts`** - Queue for voice commands/messages
- **`voiceNotificationService.ts`** - Voice notification alerts
- **`voiceCommandParser.ts`** - Voice command parsing and validation
- **`ocrService.ts`** - OCR for PPDB documents
- **`ocrEnhancementService.ts`** - OCR result enhancement and validation

#### AI Functions (completed 2026-01-19)
- **`analyzeStudentPerformance()`** - Analyze individual student performance with insights
- **`analyzeClassPerformance()`** - Analyze class performance for teachers
- **`generateQuiz()`** - Generate quiz questions from learning materials
- **`generateAssignmentFeedback()`** - Generate AI feedback for student assignments
- **`generateStudyPlan()`** - Generate personalized study plans based on student performance
- **Study Plan Analytics** - Track and analyze study plan effectiveness and progress

#### Feature Services
- **`pushNotificationService.ts`** - PWA push notifications
- **`unifiedNotificationManager.ts`** - Unified notification system
- **`notificationTemplates.ts`** - Notification message templates
- **`emailService.ts`** - Email sending service (SendGrid, Mailgun, Cloudflare)
- **`emailQueueService.ts`** - Email sending queue and retry logic
- **`emailTemplates.ts`** - Email template management
- **`parentGradeNotificationService.ts`** - Parent grade change notifications
- **`messagesAPI`** - Real-time messaging API service (completed 2026-01-19)
  - Conversation CRUD operations (direct and group)
  - Message CRUD operations
  - File upload support
  - Read receipts
  - Typing indicators
  - Unread count tracking
  - Group management (add/remove participants, update metadata)
  - Real-time WebSocket integration
- **`themeManager.ts`** - Theme management and persistence
- **`categoryService.ts`** - Category management for resources
- **`pdfExportService.ts`** - PDF generation for reports and certificates
- **`materialPermissionService.ts`** - Material sharing permissions and access control
- **`generateAssignmentFeedback()`** - AI-powered assignment feedback generation with strengths, improvements, and suggested scores

#### Frontend Components (`src/components/`)

##### Messaging Components
- **`DirectMessage.tsx`** - Main messaging interface with conversation list and thread (completed 2026-01-19)
  - User selection for new conversations
  - Conversation list with filtering (all/direct/group, search, unread)
  - Real-time message updates via WebSocket
  - Typing indicators support
  - Read receipts
  - File attachment support (max 10MB)
  - Reply message functionality
  - Offline support with drafts
- **`MessageThread.tsx`** - Individual conversation view (completed 2026-01-19)
  - Message display with sender identification
  - Own vs. other message styling
  - Message status indicators (sending, sent, delivered, read)
  - Read receipt icons
  - Reply preview and handling
  - File attachment display
  - Timestamp formatting
  - Participant online status
  - Auto-mark as read on incoming messages
  - Auto-scroll to latest message
- **`MessageList.tsx`** - Conversation list with search and filtering (completed 2026-01-19)
- **`MessageInput.tsx`** - Message composer with file upload (completed 2026-01-19)
- **`GroupChat.tsx`** - Group chat interface with class/subject-based groups (completed 2026-01-19)
  - Group creation based on classes (auto-adds students)
  - Group creation based on subjects (auto-adds relevant students)
  - Custom group creation with manual participant selection
  - Group management (rename, description, add/remove participants)
  - Group admin functionality
  - Participant count display
  - Real-time message updates via WebSocket
  - File attachment support in groups
  - Read receipts in groups
  - Typing indicators
  - Voice command support (OPEN_GROUPS)
  - Search by conversation name
  - Filter by type (direct/group)
  - Filter by unread status
  - Unread count badges
  - Last message preview
  - Participant avatars
  - Time formatting
  - Loading, error, empty states
- **`MessageInput.tsx`** - Message composer with file upload (completed 2026-01-19)
  - Text input with Enter/Shift+Enter handling
  - File upload (max 10MB)
  - File preview with removal
  - Reply preview display
  - Draft auto-save to localStorage
  - Draft auto-load
  - Sending state indicator
  - Disabled state handling

##### Quiz Components
- **`QuizGenerator.tsx`** - AI-powered quiz generation from learning materials (completed 2026-01-19)
  - Material selection from E-Library
  - Quiz configuration (count, types, difficulty, points, focus areas)
  - AI-powered question generation
  - Real-time preview of generated questions
  - Question editing and customization
  - Add/delete questions
- **`QuizPreview.tsx`** - Quiz preview and editing interface (completed 2026-01-19)
  - Quiz metadata editing (title, description, duration, passing score)
  - Question editing (text, type, difficulty, points, options, correct answer, explanation)
  - Support for multiple question types (multiple choice, true/false, short answer, essay, fill blank)
  - Add/delete questions with automatic points recalculation
  - Add new questions manually

##### Dashboard Components
- **`AdminDashboard.tsx`** - Admin dashboard with management cards

##### Admin Components
- **`SystemStats.tsx`** - System statistics and monitoring
- **`NotificationAnalytics.tsx`** - Notification analytics dashboard
- **`NotificationCenter.tsx`** - Notification management center
- **`BatchManagement.tsx`** - Batch operation management
- **`UserImport.tsx`** - CSV bulk user import with validation and preview

##### Teacher Components
- **`TeacherDashboard.tsx`** - Teacher dashboard with class and grade management

##### Announcement Components
- **`AnnouncementManager.tsx`** - Full announcement management system (completed 2026-01-20, TypeScript fixes 2026-01-20)
  - Create/edit/delete announcements
  - Targeting options (all users, by roles, by classes, specific users)
  - Category selection (umum, akademik, kegiatan, keuangan)
  - Search and filtering (by category, status)
  - Announcement preview modal
  - Announcement analytics modal (read tracking, read rate)
  - Draft auto-save
  - Push notification integration with complete PushNotification properties (id, timestamp, read)
  - Permission-based access control (announcements.manage, announcements.view)
  - Offline support indicators
  - Integrated into AdminDashboard

- **`AssignmentCreation.tsx`** - Teacher creates assignments with rubrics (completed 2026-01-19)
- **`AssignmentGrading.tsx`** - Assignment grading interface with submissions view (completed 2026-01-19)
- **`GradeAnalytics.tsx`** - Comprehensive grade analytics dashboard for teachers (completed 2026-01-19)
  - Class-wide grade distribution
  - Subject performance metrics
  - Student performance ranking (top performers, needs attention)
  - Assignment submission rates
  - Grade trends over time
  - Export analytics reports
- **`QuizGenerator.tsx`** - AI-powered quiz generation from learning materials (completed 2026-01-19)
  - Material selection from E-Library
  - Quiz configuration (count, types, difficulty, points, focus areas)
  - AI-powered question generation
  - Real-time preview of generated questions
  - Question editing and customization
  - Add/delete questions
- **`QuizPreview.tsx`** - Quiz preview and editing interface (completed 2026-01-19)
  - Quiz metadata editing (title, description, duration, passing score)
  - Question editing (text, type, difficulty, points, options, correct answer, explanation)
  - Support for multiple question types (multiple choice, true/false, short answer, essay, fill blank)
  - Add/delete questions with automatic points recalculation
  - Add new questions manually

##### Feature Components
- **`UserManagement.tsx`** - User CRUD with permissions
- **`UserProfileEditor.tsx`** - User profile editing interface (self-service, admin override)
- **`PPDBRegistration.tsx`** - New student registration form
- **`PPDBManagement.tsx`** - PPDB application management (PDF export, email integration, document preview, OCR results)
- **`SiteEditor.tsx`** - WYSIWYG site content editor
- **`MaterialUpload.tsx`** - Learning material upload interface with advanced search and filtering:
  - Real-time search by title, description, category
  - Category filter (subjects-based dropdown)
  - File type filter (PDF, DOCX, PPT, VIDEO)
  - Sharing status filter (Shared/Private toggle)
  - Active filter chips with individual clear buttons
  - Reset all filters with count display
  - Filtered material count in header
- **`MaterialSharing.tsx`** - Material sharing with permissions (basic version)
- **`EnhancedMaterialSharing.tsx`** - Advanced material sharing with role-based access, analytics, and audit trail
- **`MaterialAnalytics.tsx`** - Material usage analytics
- **`MaterialTemplatesLibrary.tsx`** - Template library for materials
 - **`GradingManagement.tsx`** - Grade entry and management (direct entry model) (voice input integrated 2026-01-21)
   - Voice input for all grade fields: assignment, midExam, finalExam (using FieldVoiceInput component)
   - Voice input for batch grade operations (assignment, UTS, UAS)
   - Number field type with Indonesian language voice feedback
   - Visual voice buttons next to each grade input in table
   - Real-time validation with inline error messages
   - Supports both individual student grade input and batch grade operations
   - Compact voice button layout for table cells (no feedback text)
- **`ClassManagement.tsx`** - Class schedule and management
- **`AcademicGrades.tsx`** - Academic grades display for students
- **`ParentGradesView.tsx`** - Parent view of child's grades
- **`ProgressAnalytics.tsx`** - Student progress and performance analytics
- **`StudentLearningModule.tsx`** - Student learning modules interface
- **`CalendarView.tsx`** - Calendar with events and schedule
- **`ScheduleView.tsx`** - Class schedule display
- **`AttendanceView.tsx`** - Attendance tracking and management
- **`SchoolInventory.tsx`** - School inventory management
- **`ELibrary.tsx`** - E-library browsing and access
- **`StudentInsights.tsx`** - Student performance insights
- **`ELibrary.tsx`** - E-library browsing and access
- **`StudentInsights.tsx`** - Student performance insights
- **`CalendarView.tsx`** - Calendar with events and schedule
- **`AICacheManager.tsx`** - AI cache management interface

##### UI Components (`src/components/ui/`)
- **Button**, **Input**, **Select**, **Textarea**, **FormGrid** - Form elements
- **Modal**, **ConfirmationDialog**, **Dialog** - Dialog components
- **Card**, **PageHeader**, **Section** - Layout components
- **Table**, **DataTable**, **Pagination** - Data display
- **Badge**, **ProgressBar**, **LoadingSpinner** - Status indicators
- **Tab**, **Toggle**, **SearchInput** - Interactive components
- **FileUploader**, **FileInput**, **FileUploader** - File handling
- **Toast**, **ErrorBoundary**, **LoadingState** - Error/loading states
- **SuspenseLoading**, **LoadingOverlay** - Loading states
- **DashboardActionCard** - Dashboard action card component

##### Icon Components (`src/components/icons/`)
- Reusable SVG icon components for consistent iconography
- **ChartBarIcon** - Bar chart icon
- **ChartLineIcon** - Line chart icon (new)
- **UsersIcon** - Users/people icon
- **ClipboardDocumentCheckIcon** - Clipboard with check icon
- **ArchiveBoxIcon** - Archive/box icon
- **AssignmentIcon** - Assignment icon
- **ClockIcon** - Clock/time icon
- **XCircleIcon** - X circle icon
- And 40+ more icons...

##### Section Components (`src/components/sections/`)
- **`HeroSection.tsx`** - Landing page hero
- **`ProfileSection.tsx`** - School profile section
- **`ProgramsSection.tsx`** - Featured programs display
- **`NewsSection.tsx`** - Latest news display
- **`PPDBSection.tsx`** - PPDB information section
- **`RelatedLinksSection.tsx`** - Related links display

##### Layout Components
- **`Header.tsx`** - Main navigation header
- **`Footer.tsx`** - Page footer
- **`LoginModal.tsx`** - Login form modal
- **`ForgotPassword.tsx`** - Forgot password modal (email input)
- **`ResetPassword.tsx`** - Password reset form (token-based)
- **`ChatWindow.tsx`** - AI chat interface
- **`Toast.tsx`** - Toast notification component
- **`ThemeSelector.tsx`** - Theme selection modal
- **`AccessDenied.tsx`** - Permission denied page
- **`DocumentationPage.tsx`** - Documentation viewer

#### Configuration (`src/config/`)
- **`permissions.ts`** - Role permission matrix
- **Feature flags** - Feature toggles
- **Environment configs** - Environment-specific settings

### Data Models

#### Users
- `id`, `username`, `email`, `password_hash`
- `role`: admin, teacher, student, parent, staff, osis, wakasek, kepsek
- `phone`, `address`, `bio`, `avatar`, `dateOfBirth`
- `profile_data`, `created_at`, `updated_at`

#### Analytics Data Models
- **ClassGradeAnalytics**: Class-level grade analytics with distribution, top performers, and needs attention
- **GradeDistribution**: Grade distribution by letter (A, B, C, D, F)
- **SubjectAnalytics**: Subject-level analytics with metrics and trends
- **StudentPerformance**: Individual student performance metrics and trends
- **AssignmentAnalytics**: Assignment-level analytics with submission and grading data

#### Messaging Data Models
- **DirectMessage**: Individual message with sender, recipient, content, status, timestamp
- **Conversation**: Conversation container with participants, metadata, last message
- **Participant**: Conversation participant with online status, last seen
- **MessageStatus**: Message status (sending, sent, delivered, read, failed)
- **MessageType**: Message type (text, image, file, audio, video)
- **ConversationType**: Conversation type (direct, group)
- **MessageSendRequest**: Request payload for sending messages
- **ConversationCreateRequest**: Request payload for creating conversations
- **MessageReadReceipt**: Read receipt with message ID, user ID, timestamp
- **TypingIndicator**: Typing status for conversation participants

#### AI Feedback Data Models
- **AIFeedback**: AI-generated feedback with assignment/submission ID, feedback text, strengths, improvements, suggested score
- **AssignmentFeedbackRequest**: Request payload for AI feedback generation
- **AssignmentFeedbackResponse**: AI-generated feedback with confidence score

#### Study Plan Data Models
- **StudyPlan**: Personalized study plan with ID, student info, title, description, subjects, schedule, recommendations, timestamps
- **StudyPlanSubject**: Subject-specific plan with name, current grade, target grade, priority, weekly hours, focus areas, resources
- **StudyPlanSchedule**: Weekly schedule with day, time slot, subject, activity type, duration
- **StudyPlanRecommendation**: AI recommendations with category, title, description, priority

#### Password Reset
- `password_reset_tokens` table stores secure reset tokens
- Token expiration: 1 hour from creation
- Tokens marked as `is_used` after successful reset
- All sessions invalidated after password reset for security

#### Content Management
- Site pages, announcements, news
- Learning materials, assignments
- Events, schedules
- Material sharing with role-based permissions (view/edit/admin)
- Material access control and audit logging
- Public/private material sharing with optional expiration
- Sharing analytics (views, downloads, unique users, top users)

#### PPDB (New Student Admission)
- Student registration data
- Document uploads (OCR processed and saved)
- Status tracking
- Admin management interface with:
  - Filtering and sorting (status, date, score, school)
  - Bulk actions (approve/reject)
  - Scoring system with rubrics
  - PDF generation for acceptance/rejection letters
  - Email integration for notifications
  - Document preview (images, PDFs)
  - **OCR results display** (extracted grades, confidence, quality metrics)
  - **Re-run OCR capability** for any document
  - Statistics dashboard

#### Assignments & Grading
- **Current Implementation**: Full assignment lifecycle model (enhanced 2026-01-19)
   - `GradingManagement.tsx`: Teachers enter grades directly with assignment metadata (validation enhanced 2026-01-21, GAP-111)
   - `AssignmentCreation.tsx`: Teachers create comprehensive assignments (completed 2026-01-19)
   - `AssignmentGrading.tsx`: Assignment-specific grading workflow (completed 2026-01-19)
   - `StudentAssignments.tsx`: Students view and submit assignments (completed 2026-01-19)
   - `GradeAnalytics.tsx`: Comprehensive grade analytics dashboard for teachers (completed 2026-01-19)
   - Database: `grades` table includes `assignment_type`, `assignment_name` fields
   - Assignment creation → submission → grading workflow (fully implemented)
   - Students view grades via `AcademicGrades.tsx`
   - Parents view grades via `ParentGradesView.tsx`
   - Student analytics via `ProgressAnalytics.tsx`
   - Teacher analytics via `GradeAnalytics.tsx`

- **Grade Validation Enhancements** (completed 2026-01-21, GAP-111):
  - Inline validation errors displayed next to input fields with red border highlighting
  - Real-time grade feedback (error/warning/info messages)
  - Class-level validation (checks if all students have grades before final save)
  - Grade history tracking with audit trail (localStorage: `malnu_grade_history`)
  - Enhanced CSV import with detailed success/failure reporting and summary dialog
  - Validation utilities: `validateClassCompletion`, `validateCSVImport`, `getInlineValidationMessage`
  - Comprehensive test coverage (19 test cases in `teacherValidation.enhanced.test.ts`)
  - Storage: Grade history persisted to localStorage with max 100 entries (FIFO)

- **Assignment Creation**: Full assignment creation UI (completed 2026-01-19)
   - `AssignmentCreation.tsx`: Comprehensive assignment creation interface
   - Assignment types: ASSIGNMENT, PROJECT, QUIZ, EXAM, LAB_WORK, PRESENTATION, HOMEWORK, OTHER
   - Assignment status: DRAFT, PUBLISHED, CLOSED, ARCHIVED
   - Rubric creation with weighted criteria
   - File attachment support
   - Draft/Publish functionality

- **Assignment Grading**: Full grading workflow (completed 2026-01-19)
   - `AssignmentGrading.tsx`: Comprehensive assignment grading interface
   - Assignment list view (published/closed assignments by teacher)
   - Submissions list view with status filtering (all/ungraded/graded)
   - Submission detail view with student work display (text, attachments)
   - Score input with validation (0 to max_score)
   - Feedback textarea
   - Previous grade/feedback display for graded submissions
   - Download attachments functionality
   - Status indicators (submitted, late, graded)
   - Permission-based access control
   - Notification integration (notifyGradeUpdate)
   - Offline support indicators

- **Student Submissions**: Full student submission interface (completed 2026-01-19)
   - `StudentAssignments.tsx`: Comprehensive student assignment submission interface
   - Assignment list view with status indicators (Belum Dikirim, Dikirim, Terlambat, Dinilai)
   - Due date tracking with days remaining
   - Assignment detail view with instructions and attachments
   - Submission form with text input and file attachments
   - Draft submission support
   - Late submission detection (auto-marked as "Terlambat")
   - View graded submissions with score and feedback

- **Database**: Assignment tables (completed 2026-01-19)
   - `assignments`: Assignment metadata (title, description, type, subject, class, teacher, academic_year, semester, max_score, due_date, status, instructions)
   - `assignment_attachments`: File attachments for assignments
   - `assignment_rubrics`: Rubric definitions
   - `rubric_criteria`: Individual rubric criteria with weights
   - `assignment_submissions`: Student submissions (submission_text, attachments, submitted_at, score, feedback, graded_by, graded_at, status)
   - `submission_attachments`: File attachments for submissions

- **API**: Assignment endpoints (completed 2026-01-19)
   - GET/POST/PUT/DELETE `/api/assignments`
   - GET `/api/assignments?subject_id=...&class_id=...&teacher_id=...&status=...`
   - POST `/api/assignments/:id/publish`: Publish assignment
   - POST `/api/assignments/:id/close`: Close assignment
   - GET/POST/PUT/DELETE `/api/assignment-submissions`: Student submission CRUD
   - PUT `/api/assignment-submissions/:id`: Update submission with grading support (enhanced 2026-01-19)
   - GET `/api/assignment-submissions?assignment_id=...`: Get submissions for assignment
   - GET `/api/assignment-submissions?student_id=...`: Get submissions by student

- **Full Assignment System Status**: ✅ COMPLETED (2026-01-19)
   - Assignment creation UI (teachers) - ✅ COMPLETED
   - Student submission interface - ✅ COMPLETED
   - Assignment-specific grading workflow - ✅ COMPLETED
   - Enhanced assignment analytics (next phase)

### Storage Architecture (`STORAGE_KEYS`)
All localStorage keys use `malnu_` prefix:
- Authentication: `malnu_auth_session`, `malnu_refresh_token`
- Password Reset: URL parameter `?token=<token>` (not stored)
- Users: `malnu_users`, `malnu_current_user`
- Content: `malnu_site_content`, `malnu_materials`
- Notifications: `malnu_notifications`
- Voice: `malnu_voice_settings`, `malnu_voice_enabled`
- AI: `malnu_ai_cache`, `malnu_ai_interactions`
- OCR: `malnu_ocr_cache`
- PPDB: `malnu_ppdb_data`, `malnu_ppdb_status`
- Offline: `malnu_offline_queue`
- Analytics: `malnu_grade_analytics_export_{classId}` (dynamic factory function)
- Messaging:
  - `malnu_messages` - Message storage
  - `malnu_conversations` - Conversation storage
  - `malnu_active_conversation` - Currently active conversation
  - `malnu_typing_indicators` - Typing status tracking
  - `malnu_message_drafts_{conversationId}` - Message drafts per conversation (dynamic factory function)
  - `malnu_unread_counts` - Unread message counts
- Real-Time:
  - `malnu_activity_feed` - Activity feed storage (added 2026-01-21)
- Study Plans:
  - `malnu_study_plans_{studentId}` - Study plan storage (dynamic factory function)
  - `malnu_active_study_plan_{studentId}` - Active study plan (dynamic factory function)
  - `malnu_study_plan_analytics_{studentId}` - Study plan analytics (dynamic factory function)
  - `malnu_study_plan_history_{studentId}` - Study plan history (dynamic factory function)
  - `malnu_weekly_progress_{studentId}_{weekNumber}` - Weekly progress tracking (dynamic factory function)

### Authentication Flow

1. User logs in → `authService.login()`
2. JWT token received → Stored in `malnu_auth_session`
3. Each API request includes `Authorization: Bearer <token>`
4. Token expires → Refresh via `apiService.refreshToken()`
5. Refresh fails → Logout → Redirect to login

### Password Reset Flow

1. User clicks "Lupa Password?" in login form → Opens ForgotPassword modal
2. User enters email → `authService.forgotPassword(email)` → `/api/auth/forgot-password`
3. Backend validates email exists → Generates secure token (1 hour expiry)
4. Token stored in `password_reset_tokens` table with email
5. Password reset email sent with token via SendGrid/Cloudflare Email
6. User clicks link in email → Opens `/reset-password?token=<token>`
7. Backend verifies token → `/api/auth/verify-reset-token` → Returns email
8. User enters new password → Validates strength requirements
9. User confirms password → `/api/auth/reset-password`
10. Backend validates token, checks password != old password → Updates password hash
11. All user sessions invalidated → Forces re-login with new password
12. Token marked as used → Cannot be reused

### API Architecture

#### Base URL
- Configured via `VITE_API_BASE_URL` environment variable
- Default: Cloudflare Worker endpoint
- Production: `https://malnu-kananga-worker-prod.cpa01cmz.workers.dev`

#### RESTful Endpoints
```
/auth/*          - Authentication (login, logout, refresh, password reset)
  - POST /auth/forgot-password - Request password reset
  - POST /auth/verify-reset-token - Validate reset token
  - POST /auth/reset-password - Reset password with token
/users/*         - User management (CRUD)
/students/*      - Student records
/teachers/*      - Teacher records
/ppdb/*          - PPDB management
/content/*       - Content CRUD (programs, news)
/materials/*     - Learning materials
/schedules/*     - Class schedules
/grades/*        - Grade management
/attendance/*    - Attendance records
/e-library/*      - E-library resources
/files/*         - File operations (upload, download, delete, list)
/notifications/* - Push notifications
/email/*         - Email sending
/ai/*            - AI endpoints (chat, embeddings)
/ocr/*           - OCR processing
/sessions/*      - Session management
/events/*         - School events
/inventory/*     - Inventory management
/analytics/*     - Analytics endpoints (grade analytics, performance metrics) - TODO
/messages/*      - Real-time messaging (completed 2026-01-19)
  - GET/POST `/api/messages/conversations` - Conversation list and creation
  - GET/PUT/DELETE `/api/messages/conversations/:id` - Conversation CRUD
  - POST `/api/messages/conversations/:id/read` - Mark conversation as read
  - GET `/api/messages/conversations/:id/messages` - Get conversation messages
  - POST `/api/messages` - Send message (text + optional file)
  - PUT `/api/messages/:id` - Update message
  - DELETE `/api/messages/:id` - Delete message
  - POST `/api/messages/:id/read` - Mark message as read
  - GET `/api/messages/conversations/:id/typing` - Get typing indicators
  - POST `/api/messages/conversations/:id/typing` - Send typing indicator
  - GET `/api/messages/unread-count` - Get total unread count
```

### PWA Architecture

#### Service Worker
- Caches: static assets, API responses, offline pages
- Offline queue: Stores requests when offline, syncs when online
- Update strategy: Stale-while-revalidate

#### Push Notifications
- VAPID keys configured
- User opt-in
- Background sync support

### Voice Integration

#### Speech Recognition
- Browser Web Speech API
- Chrome/Edge/Safari support
- Configurable language & continuous mode

#### Speech Synthesis
- Browser SpeechSynthesis API
- Configurable voice, rate, pitch
- Text-to-speech for accessibility

### Error Handling

#### Error Categories
- Network errors (API failures)
- Authentication errors (401, 403)
- Validation errors (400)
- Server errors (500)
- Client errors (Type errors, etc.)

#### Error Handler (`errorHandler.ts`)
- Logs errors with context
- User-friendly messages
- Retry logic for transient failures
- Error boundary for React components

### Security Measures

#### OWASP Top 10 Coverage
1. **Injection**: Parameterized queries, input validation
2. **Broken Auth**: JWT with refresh tokens, secure storage, rate limiting on auth endpoints
3. **XSS**: React auto-escaping, CSP headers
4. **SSRF**: No external URL fetching from user input
5. **Security Misconfiguration**: Environment variables, .env.example
6. **XSS**: Content Security Policy
7. **Broken Access Control**: RBAC, permission checks
8. **Cryptographic Failures**: HTTPS, secure headers
9. **Logging**: Structured logging (no sensitive data)
10. **SSRF**: Same-origin policy, CORS restrictions

#### API Rate Limiting (New - 2026-01-21)
- **Implementation**: Sliding window algorithm using Cloudflare Workers KV
- **Endpoint Categories**:
  - Auth endpoints: 5 requests/minute (prevents brute force attacks)
  - Upload endpoints: 10 requests/minute (controls resource usage)
  - Sensitive endpoints: 20 requests/minute (limits user modifications)
  - Default endpoints: 100 requests/minute (normal API usage)
- **Identifier Selection**:
  - Authenticated requests: Uses `user_id` from JWT token
  - Unauthenticated requests: Uses client IP address (CF-Connecting-IP header)
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Timestamp when window resets
  - `Retry-After`: Seconds until retry (only when rate limited)
- **Error Handling**: Fail-open strategy - allows requests if KV unavailable
- **Documentation**: See `docs/API_RATE_LIMITING.md` for complete guide

#### Secrets Management
- `.env.example` for reference
- `.env` in `.gitignore`
- `.secrets.baseline` for security scanning
- No hardcoded secrets in code
- Centralized URL constants in `EXTERNAL_URLS` (constants.ts)
- All localStorage access uses `STORAGE_KEYS` constants (TECH-1092: Fixed all hardcoded keys in production code, 2026-01-21)

#### Code Quality & Security
- Zero `any` types in production code (TypeScript strict mode)
- No console.log usage in production code (uses logger.ts)
- All async functions have proper error handling with try-catch
- WCAG accessibility compliance (2026-01-20: Button component aria-label fix)
- ARIA labels available for all interactive elements
- Centralized error handling in `errorHandler.ts`
- Structured logging via `logger.ts`
- Regular security scans (npm audit, SecretLint)

### Performance Optimization

#### Frontend
- Code splitting (Vite)
- Lazy loading components
- Memoization (React.memo, useMemo, useCallback)
- Virtualization for long lists

#### Backend
- Cloudflare Edge caching
- D1 query optimization
- R2 CDN distribution

#### Bundle Size
- Tree-shaking enabled
- Dynamic imports
- Bundle analysis (can be added)

### Testing Strategy

#### Unit Tests
- Services: `src/**/__tests__/*.test.ts`
- Components: `src/components/**/__tests__/*.test.tsx`
- Utilities: `src/utils/**/__tests__/*.test.ts`

#### Integration Tests
- API service tests
- Auth flow tests
- Multi-component tests
- Offline functionality tests
- OCR validation tests

#### End-to-End Tests (E2E)
- Tool: Playwright (@playwright/test)
- Location: `e2e/` directory
- Browsers: Chromium, Firefox, WebKit (Safari)
- Test Suites (as of 2026-01-20):
  - Authentication flow (10 tests)
  - PPDB registration workflow (10 tests)
  - Assignment lifecycle (9 tests)
  - Messaging system (12 tests)
  - AI features (10 tests)
  - Role-based access control (16 tests)
  - **Total: 67 E2E tests**
- Key user journeys tested:
  - Login/logout flows
  - Password reset flow
  - PPDB registration and admin review
  - Assignment creation, submission, and grading
  - Direct and group messaging
  - AI quiz generation and study plan creation
  - Role-based dashboard access
- E2E Test Commands:
  - `npm run test:e2e` - Run all E2E tests (headless)
  - `npm run test:e2e:ui` - Run E2E tests with Playwright UI
  - `npm run test:e2e:headed` - Run E2E tests in headed mode
  - `npm run test:e2e:debug` - Debug E2E tests with step-by-step execution
  - `npm run test:e2e:install` - Install Playwright browser binaries
  - `npm run test:all` - Run unit tests and E2E tests

#### Test Coverage (as of 2026-01-20)
- **93 test files** (unit/integration)
- **1750+ tests passing** (unit/integration)
- **67 E2E tests** (new)
- **10 tests skipped**
- **Coverage areas**:
  - All core services (auth, API, permissions)
  - All UI components (40+ components)
  - PPDB components (registration, management with full test coverage)
  - Voice services (recognition, synthesis)
  - AI services (Gemini, cache management, study plan generation)
  - OCR services (validation, enhancement)
  - Notification services (push, email, unified)
  - Offline services (data sync, action queue)
  - Dashboard components (admin, teacher, student, parent)
  - Material search and filtering (60+ test cases for MaterialUpload)
  - Assignment system (creation, submission, grading)
  - Grade analytics (20+ test cases for GradeAnalytics)
  - Messaging system (30+ test cases for MessageInput, MessageList, MessageThread, DirectMessage)
  - Group chat (25+ test cases for GroupChat)
  - Study plan generation (20+ test cases for StudyPlanGenerator)
  - E2E user journeys (67 tests covering critical flows)

#### Test Commands
- `npm test` - Run all unit/integration tests
- `npm run test:run` - Run tests once
- `npm run test:ui` - Vitest UI
- `npm run test:coverage` - Coverage report
- `npm run test:e2e` - Run all E2E tests (headless)
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:all` - Run unit tests and E2E tests

### Deployment Architecture

#### Frontend (Cloudflare Pages)
- Build: `npm run build`
- Deploy: `wrangler pages deploy dist --project-name=malnu-kananga`
- Auto-deploy on main branch push
- Production URL: https://ma-malnukananga.sch.id (configured)

#### Backend (Cloudflare Workers)
- Deploy: `wrangler deploy --env production`
- Production worker: `malnu-kananga-worker-prod`
- Production URL: https://malnu-kananga-worker-prod.cpa01cmz.workers.dev
- Dev: `wrangler dev --env dev` (uses dev DB)
- D1 database attached
- Production DB: `malnu-kananga-db-prod` (ID: 7fbd7834-0fd2-475f-8787-55ce81988642)
- Dev DB: `malnu-kananga-db-dev` (ID: 69605f72-4b69-4dd6-a72c-a17006f61254)

#### CI/CD
- GitHub Actions in `.github/workflows/`
- Lint on PR
- Test on PR
- Type check on PR
- Deploy on merge to main
- Pre-commit hooks (Husky, lint-staged)

#### CI/CD
- GitHub Actions in `.github/workflows/`
- Lint on PR
- Test on PR
- Type check on PR
- Deploy on merge to main

### Design System

#### Color Palette
- Primary: Blue (Tailwind `blue-500` to `blue-700`)
- Secondary: Green (`green-500` to `green-700`)
- Error: Red (`red-500`)
- Warning: Yellow (`yellow-500`)
- Success: Green (`green-500`)

#### Typography
- Font: System default (San Francisco, Inter, Segoe UI)
- Scale: Tailwind default text sizes

#### Spacing
- Tailwind spacing scale (4px base unit)

#### Components
- Consistent prop interfaces
- Reusable variants
- Accessible (ARIA labels, keyboard navigation)

### Monitoring & Observability

#### Logging
- Structured logs via `logger.ts`
- Log levels: ERROR, WARN, INFO, DEBUG
- Production: INFO and above
- Development: DEBUG and above

#### Error Tracking
- Error boundary captures React errors
- API errors logged with context
- User-friendly error messages

#### Analytics
- Can be integrated (Google Analytics, etc.)
- Currently not implemented

### Scalability Considerations

#### Database
- D1 scales automatically
- Connection pooling handled by Cloudflare
- Query optimization needed for large datasets

#### Storage
- R2 unlimited storage
- CDN distribution
- File size limits (per Cloudflare)

#### API Rate Limiting
- Can be implemented in Workers
- Per-user or per-IP limits
- Caching reduces load

### Future Enhancements

#### Planned Features
- Real-time chat (WebSocket)
- Video conferencing integration
- Advanced analytics dashboard
- Mobile app (React Native / PWA)
- Offline-first architecture enhancement

#### Technical Debt
- Add comprehensive integration tests
- Implement bundle analysis
- Add performance monitoring
- Enhance error tracking
- Add API rate limiting

---

**Notes**:
- This blueprint is the Single Source of Truth for architecture
- Update this file when making structural changes
- Refer to `AGENTS.md` for coding standards
- See `roadmap.md` for planned features
