# Feature Matrix

**Created**: 2025-01-01
**Last Updated**: 2026-01-06
**Version**: 2.1.0
**Status**: Active

Feature availability by user role.

## Feature Matrix

| Feature | Public | Student | Teacher | Admin | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Landing Page Access** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AI Chat Assistant** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Portal Dashboard** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Class Schedule** | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Grade Input** | ❌ | ✅ (View) | ✅ (Active) | ✅ (View) | ❌ |
| **Class Advisor** | ❌ | ❌ | ✅ (Active) | ❌ | ❌ |
| **Material Upload** | ❌ | ❌ | ✅ (Active) | ❌ | ❌ |
| **E-Library** | ❌ | ✅ (Download) | ❌ | ❌ | ❌ |
| **PPDB Online** | ✅ (Register) | ❌ | ❌ | ✅ (Manage) | ❌ |
| **AI Site Editor** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **User Management** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Inventory Management**| ❌ | ❌ | ✅ (**Staff Role**) | ❌ | ❌ |
| **OSIS Events** | ❌ | ✅ (**OSIS Role**) | ❌ | ❌ | ❌ |
| **Attendance** | ❌ | ✅ (View) | ✅ (Input) | ✅ (View) | ✅ (View) |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Presence** | ❌ | ✅ (View) | ✅ (Input) | ✅ (View) | ✅ (View) |

## Secondary Roles Feature

The system now supports **Extra Roles** for Teachers and Students with special responsibilities:

1. **Teacher as Staff (Administration/Facilities)**
    - Gets additional **"Inventaris"** menu in dashboard
    - Can add, edit, and delete school asset data (Desks, Chairs, Electronics)

2. **Student as OSIS Officer**
    - Gets additional **"Kegiatan OSIS"** menu in portal
    - Can schedule school events and monitor activity status (Upcoming/Done)

3. **Teacher as Wakasek (Academic Oversight)**
    - Gets additional academic oversight permissions
    - Can evaluate teacher performance
    - Can manage student discipline
    - Can access academic reports and oversee operations

4. **Teacher as Kepsek (Principal)**
    - Gets maximum academic and administrative permissions
    - Can manage and approve curriculum changes
    - Can create and update school policies
    - Can evaluate teachers and approve PPDB applications
    - Full access to school reports and oversight

## Feature Descriptions

### Core Features

**AI Chat Assistant**
- RAG-powered AI chatbot with vector search
- Context-aware responses based on school data
- Multi-language support (Indonesian, English)

**Portal Dashboard**
- Role-based dashboards with tailored views
- Real-time data synchronization
- Responsive design for all devices

**Class Schedule**
- Weekly schedule view (Monday-Friday)
- Subject and teacher information
- Time-based organization

### Academic Features

**Grade Input & Management**
- Input grades for Assignments, Midterms, Finals
- Automatic final grade calculation
- Grade reports with predicate (A/B/C)
- Parent visibility for child's grades

**Class Advisor Management**
- Student list management per class
- Daily attendance tracking (Present/Sick/Permission/Absent)
- Attendance reports generation

**Material Upload & E-Library**
- Upload teaching materials by teachers
- Material categorization by subject
- Student download access
- File storage on Cloudflare R2

### Administrative Features

**PPDB Online (New Student Registration)**
- Online registration form
- Document upload
- OCR automatic grade extraction
- Status tracking (Pending/Approved/Rejected)
- Admin approval workflow

**AI Site Editor**
- Natural language content editing
- Live preview of changes
- Apply changes to public website
- Admin-only access

**User Management**
- Create and manage user accounts
- Role assignment (Admin, Teacher, Student, Parent)
- Extra role assignment (Staff, OSIS)
- User data CRUD operations

**Inventory Management (Staff Role)**
- School asset tracking
- Add, edit, delete asset records
- Asset condition monitoring
- Quantity and location tracking

**OSIS Event Management (OSIS Role)**
- Event scheduling
- Event status tracking
- Upcoming and completed events view
- Event announcements with notifications

### Communication & Notifications

**Push Notifications**
- Announcement notifications
- Grade release notifications
- PPDB status notifications
- Event notifications
- Library material notifications
- System notifications
- Role-based filtering
- Quiet hours functionality
- Notification history

**Voice Interaction**
- Speech-to-text (Speech Recognition)
- Text-to-speech (Speech Synthesis)
- Multi-language support (id-ID, en-US)
- Voice commands ("Open settings", "Stop speaking")
- Continuous mode
- Auto-read all feature
- Voice settings backup & restore

### Accessibility & PWA

**Progressive Web App**
- Offline support with service workers
- "Add to Home Screen" capability
- Runtime caching for fonts, images, API
- Background sync
- Mobile-optimized experience

**Accessibility Compliance**
- WCAG 2.1 AA compliant
- ARIA labels
- Keyboard navigation support
- Screen reader compatible
- Voice control support

---

## Related Documentation

- [User Guide (HOW_TO.md)](./HOW_TO.md) - Detailed usage instructions
- [API Reference](./api-documentation.md) - Complete API documentation
- [Blueprint (BLUEPRINT.md)](./BLUEPRINT.md) - System architecture and specifications
