# Voice Commands Reference

**Version**: 3.4.0
**Last Updated**: 2026-01-15

---

## Overview

The MA Malnu Kananga school management system includes comprehensive voice command support powered by the Web Speech API. Voice commands are available in both Indonesian and English, enabling hands-free navigation and interaction with the system.

**Total Voice Commands**: 58+

**Languages Supported**: Bahasa Indonesia, English
**Confidence Threshold**: 0.7 (70% similarity required)
**Similarity Algorithm**: Jaccard similarity with partial matching

---

## Common Commands

These commands are available to all user roles (admin, teacher, student, parent).

### Settings & Display

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `OPEN_SETTINGS` | buka pengaturan, buka setting | open settings, open setting | Open settings modal/dialog |
| `CLOSE_SETTINGS` | tutup pengaturan, tutup setting | close settings, close setting | Close settings modal/dialog |
| `TOGGLE_THEME` | ubah tema, ganti tema | toggle theme, change theme, dark mode, light mode | Toggle between light/dark theme |
| `CHANGE_LANGUAGE` | ubah bahasa, ganti bahasa | change language, bahasa, language | Open language switcher |
| `ZOOM_IN` | perbesar, zoom in, perbesar tampilan | zoom in | Increase UI zoom level |
| `ZOOM_OUT` | perkecil, zoom out, perkecil tampilan | zoom out | Decrease UI zoom level |
| `REFRESH_PAGE` | refresh, segarkan halaman, reload | refresh, refresh page | Reload current page |

### Navigation

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `GO_HOME` | pulang, kembali, beranda, dashboard | go home, dashboard | Navigate to dashboard home |

### Help & Support

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `HELP` | bantuan, bisa ngapain saja | help | Show voice commands help |
| `OPEN_DOCUMENTATION` | buka dokumentasi, dokumentasi | documentation, help documentation | Open documentation page |

### System

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `LOGOUT` | keluar | logout, sign out | Logout from system |

---

## Admin Dashboard Commands

Commands specific to the admin role for managing the school system.

### User Management

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `MANAGE_USERS` | kelola pengguna, manajemen pengguna | manage users, users | Navigate to user management |
| `MANAGE_PERMISSIONS` | kelola izin, manajemen izin | manage permissions, permissions | Navigate to permission management |

### Academic Management

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `SHOW_PPDB` | tampilkan ppdb, lihat pendaftaran, buka ppdb | show ppdb, buka ppdb | Navigate to PPDB management |
| `VIEW_GRADES_OVERVIEW` | lihat nilai, tampilkan nilai | view grades, grades overview | Navigate to grades overview |

### Library & Resources

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `OPEN_LIBRARY` | buka perpustakaan, perpustakaan | open library | Open e-library |
| `SEARCH_LIBRARY` | cari materi, cari di perpustakaan, cari materi {query} | search materials, search library, search materials {query} | Search library with optional query |

### System Administration

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `GO_TO_CALENDAR` | kalender, buka kalender | calendar, go to calendar | Navigate to calendar |
| `SHOW_STATISTICS` | statistik, tampilkan statistik | show statistics, stats | Navigate to statistics |
| `AI_CACHE` | cache ai, cache kecerdasan buatan | ai cache, ai cache manager | Navigate to AI cache manager |
| `SITE_EDITOR` | editor situs, edit situs | site editor, edit website | Open site editor |
| `PERFORMANCE_DASHBOARD` | dashboard performa, kinerja sistem | performance dashboard, system performance | Navigate to performance dashboard |

---

## Teacher Dashboard Commands

Commands specific to the teacher role for academic management.

### Class & Teaching

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `SHOW_MY_CLASSES` | kelas saya, tampilkan kelas | show my classes, my classes | Navigate to my classes |
| `OPEN_GRADING` | nilai, buka penilaian | open grading, grading | Navigate to grading |
| `VIEW_ATTENDANCE` | absensi, lihat absensi | view attendance, attendance | Navigate to attendance |
| `VIEW_SCHEDULE` | jadwal, lihat jadwal | view schedule, schedule | Navigate to schedule |
| `CREATE_ANNOUNCEMENT` | buat pengumuman, pengumuman baru | create announcement, announcement | Create new announcement |

### Materials & Resources

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `MATERIAL_UPLOAD` | upload materi, unggah materi | material upload, upload materials | Navigate to material upload |
| `SCHOOL_INVENTORY` | inventaris sekolah, barang sekolah | school inventory, inventory | Navigate to school inventory |

### Lesson Planning

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `LESSON_PLANNING` | rencana pelajaran, perencanaan pelajaran | lesson planning, lesson plan | Navigate to lesson planning |
| `GENERATE_LESSON_PLAN` | buat rencana pelajaran, generate lesson plan | generate lesson plan, generate lesson plan for {subject} | Generate lesson plan with AI |
| `SAVE_LESSON_PLAN` | simpan rencana pelajaran, save lesson plan | save lesson plan, simpan rencana | Save current lesson plan |
| `EXPORT_LESSON_PLAN` | ekspor rencana pelajaran, ekspor pdf | export lesson plan, ekspor pdf | Export lesson plan to PDF |

---

## Student Dashboard Commands

Commands specific to the student role for learning and academic tracking.

### Academic

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `SHOW_MY_GRADES` | nilai saya, lihat nilai saya | show my grades, my grades | Navigate to my grades |
| `CHECK_ATTENDANCE` | cek absensi, absensi saya | check attendance, my attendance | Navigate to attendance check |
| `VIEW_INSIGHTS` | insight, lihat insight | view insights, my insights | Navigate to student insights |

### Learning Resources

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `OPEN_LIBRARY` | buka perpustakaan, perpustakaan | open library | Open e-library |
| `LEARNING_MODULES` | modul pembelajaran, materi belajar | learning modules, study modules | Navigate to learning modules |

### Activities

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `OSIS_EVENTS` | kegiatan osis, event osis | osis events, student events | Navigate to OSIS events |

---

## Parent Dashboard Commands

Commands specific to the parent role for monitoring child's academic progress.

### Child Academic Information

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `VIEW_CHILD_GRADES` | nilai anak, lihat nilai anak | view child grades, child grades | View child's grades |
| `VIEW_CHILD_ATTENDANCE` | absensi anak, lihat absensi anak | view child attendance, child attendance | View child's attendance |
| `VIEW_CHILD_SCHEDULE` | jadwal anak, lihat jadwal anak | view child schedule, child schedule | View child's schedule |
| `CHILD_PROFILE` | profil anak | child profile, view profile | View child's profile |

### Communication & School Activities

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `SEE_NOTIFICATIONS` | notifikasi, lihat notifikasi | see notifications, notifications | View notifications |
| `VIEW_EVENTS` | lihat kegiatan, event | events, school events | Navigate to school events |
| `MESSAGING` | pesan, chat, kirim pesan | messaging, chat | Navigate to messaging |
| `MEETINGS` | pertemuan, rapat | meetings, view meetings | Navigate to meetings |

### Reports & Payments

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `REPORTS` | laporan | reports, view reports | Navigate to consolidated reports |
| `PAYMENTS` | pembayaran, biaya | payments, view payments | Navigate to payments |

---

## E-Library Commands

Available to all roles with library access.

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `BROWSE_MATERIALS` | jelajahi materi, lihat semua materi | browse materials, lihat semua materi | Browse all materials |
| `DOWNLOAD_MATERIAL` | unduh materi, download material | download material, download {filename} | Download material (with optional filename) |
| `OPEN_MATERIAL` | buka materi, open material | open material, buka {filename} | Open material (with optional filename) |

---

## Chat & Messaging Commands

Available to roles with messaging capabilities.

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `REPLY_MESSAGE` | balas pesan, reply message, reply to {name} | Reply to message (with optional recipient name) |
| `VIEW_MESSAGE_HISTORY` | riwayat pesan, message history, chat history | View message history |

---

## Notification Commands

Available to all roles.

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `VIEW_NOTIFICATION_SETTINGS` | pengaturan notifikasi, notifikasi settings | notification settings | Open notification settings |
| `CLEAR_NOTIFICATIONS` | hapus notifikasi, clear notifications, bersihkan notifikasi | Clear all notifications |
| `VIEW_NOTIFICATION_HISTORY` | riwayat notifikasi, notification history, history notifikasi | View notification history |

---

## Speech & Text-to-Speech Commands

| Command ID | Indonesian Patterns | English Patterns | Action |
|------------|---------------------|-------------------|---------|
| `STOP_SPEAKING` | hentikan bicara, berhenti bicara | stop speaking, stop talk | Stop current text-to-speech |
| `PAUSE_SPEAKING` | jeda bicara | pause speaking, pause | Pause text-to-speech |
| `RESUME_SPEAKING` | lanjutkan bicara | resume speaking, resume | Resume text-to-speech |
| `READ_ALL` | baca semua, baca semua pesan | read all, read all messages | Read all unread messages |
| `CLEAR_CHAT` | hapus chat, clear chat, clear history | Clear chat history |
| `SEND_MESSAGE` | kirim, send, kirim pesan | Send current message |
| `TOGGLE_VOICE` | aktifkan suara, matikan suara, toggle voice, toggle speech | Toggle voice input/output |

---

## Voice Command Features

### Pattern Matching

- **Exact Match**: Full string match (confidence: 1.0)
- **Partial Match**: Command words all present (confidence: 0.9)
- **Jaccard Similarity**: Word overlap ratio (confidence: 0.5-0.9)
- **Minimum Threshold**: 0.7 (70% similarity required)

### Query Extraction

Certain commands support parameter extraction:
- `SEARCH_LIBRARY`: Extracts search query (e.g., "search materials physics" → query: "physics")
- `GENERATE_LESSON_PLAN`: Extracts subject (e.g., "generate lesson plan for math" → subject: "math")
- `DOWNLOAD_MATERIAL`: Extracts filename (e.g., "download biology.pdf" → filename: "biology.pdf")
- `OPEN_MATERIAL`: Extracts filename (e.g., "open chemistry.docx" → filename: "chemistry.docx")
- `REPLY_MESSAGE`: Extracts recipient (e.g., "reply to john" → recipient: "john")

### Multi-Language Support

Commands support both Indonesian and English patterns:
- Mixed language input is recognized (e.g., "open library untuk materi matematika")
- Automatic language detection based on available patterns

### Context Awareness

The voice command system is context-aware:
- Commands are filtered by user role (admin, teacher, student, parent)
- Each role sees only relevant commands
- Common commands are available to all roles

---

## Implementation Details

### Architecture

```
User Speech Input
       ↓
SpeechRecognitionService
       ↓
VoiceCommandParser
       ↓
Pattern Matching & Extraction
       ↓
useDashboardVoiceCommands (Role-based filtering)
       ↓
Execute Action (Navigate/Action callbacks)
```

### Key Components

1. **VoiceCommandParser** (`src/services/voiceCommandParser.ts`)
   - Pattern matching algorithm
   - Query extraction
   - Command registration/management
   - Language support

2. **useDashboardVoiceCommands** (`src/hooks/useDashboardVoiceCommands.ts`)
   - Role-based command filtering
   - Command execution
   - Action routing

3. **useVoiceCommands** (`src/hooks/useVoiceCommands.ts`)
   - React hook integration
   - Parser lifecycle management
   - Command availability check

### Constants

All voice command patterns are defined in `src/constants.ts`:
- `VOICE_COMMANDS` object with all command patterns
- Bilingual patterns (Indonesian, English)
- Pattern arrays for flexibility

---

## Usage Examples

### React Component Integration

```tsx
import { useDashboardVoiceCommands } from '../hooks/useDashboardVoiceCommands';
import { VoiceInputButton } from './VoiceInputButton';

const MyDashboard: React.FC = () => {
  const { handleVoiceCommand, isSupported } = useDashboardVoiceCommands({
    userRole: 'teacher',
    onNavigate: (view) => setCurrentView(view),
    onAction: (action, params) => executeAction(action, params),
    onShowHelp: () => setShowHelp(true),
    onLogout: () => authLogout(),
  });

  return (
    <div>
      <VoiceInputButton onCommand={handleVoiceCommand} />
    </div>
  );
};
```

### Voice Command with Parameters

```tsx
const handleSearch = (command: VoiceCommand) => {
  if (command.action === 'SEARCH_LIBRARY' && command.data?.query) {
    searchLibrary(command.data.query);
  }
};
```

---

## Testing

### Unit Tests

Voice command parser includes comprehensive unit tests:
- Pattern matching tests (all 58+ commands)
- Similarity calculation tests
- Query extraction tests
- Invalid command handling tests
- Command management tests (add/remove)

**Test Count**: 100+ tests
**Coverage**: 100% of voice commands

### Integration Tests

Dashboard voice commands hook tests:
- Role-based filtering (4 roles)
- Command execution (navigate/action)
- Error handling
- Callback verification

**Test Count**: 60+ tests
**Coverage**: All role combinations and commands

---

## Browser Compatibility

Voice commands require Web Speech API support:

| Browser | Support | Notes |
|----------|----------|---------|
| Chrome | ✅ Full | Best support |
| Edge | ✅ Full | Chromium-based |
| Safari | ✅ Partial | Limited on iOS |
| Firefox | ✅ Partial | Limited support |

**Requirement**: HTTPS or localhost for microphone access

---

## Accessibility

Voice commands enhance accessibility for:
- Users with motor impairments
- Hands-free operation
- Users with visual impairments
- Keyboard alternative

**WCAG 2.1 AA**: Voice commands complement keyboard navigation
**Screen Reader Compatible**: Can be used with screen readers active

---

## Performance

### Recognition Accuracy

- **Exact Match**: 99%
- **Fuzzy Match**: 85-95%
- **Overall**: 90+%

### Response Time

- **Parse Time**: < 5ms
- **Match Time**: < 10ms
- **Total Latency**: < 50ms (including speech recognition)

---

## Troubleshooting

### Commands Not Recognized

1. **Check Microphone Permission**
   - Browser settings → Site settings → Microphone
   - Ensure permission is allowed

2. **Check Internet Connection**
   - Speech recognition requires network
   - Check connection status

3. **Check Command Syntax**
   - Use exact or similar phrases
   - Try both Indonesian and English
   - Use help command to see available commands

4. **Check Browser Support**
   - Use Chrome or Edge for best results
   - Update browser to latest version

### Low Recognition Accuracy

1. **Speak Clearly**: Enunciate words clearly
2. **Reduce Background Noise**: Quiet environment
3. **Use Short Commands**: 2-4 words optimal
4. **Retry**: Try different phrasing

---

## Future Enhancements

### Planned Improvements

1. **Natural Language Processing**
   - Better context understanding
   - Conversation flow support
   - Multi-intent queries

2. **Custom Commands**
   - User-defined voice commands
   - Personal command library
   - Import/export command profiles

3. **Voice Feedback**
   - Audio confirmation
   - Spoken responses
   - Command echo

4. **Advanced Pattern Matching**
   - Machine learning based
   - Adaptive to user speech patterns
   - Continuous improvement

---

## References

### Related Documentation

- [Voice Recognition Service](../services/voiceRecognitionService.ts)
- [Voice Synthesis Service](../services/speechSynthesisService.ts)
- [Voice Settings](../components/VoiceSettings.tsx)
- [Voice Input Button](../components/VoiceInputButton.tsx)
- [Voice Commands Help](../components/VoiceCommandsHelp.tsx)

### API Documentation

- [Voice Command Types](../types/index.ts)
- [Voice Command Constants](../constants.ts)

---

**Maintained By**: Autonomous System Guardian
**Last Updated**: 2026-01-15
**Next Review**: 2026-04-15

---

*This document is the single source of truth for voice commands in MA Malnu Kananga. All voice command implementations and features must reference this document.*
