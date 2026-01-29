# Voice Commands Guide for Teachers

**Last Updated**: 2026-01-29
**Target Audience**: Teachers, Administrators
**Language Support**: Indonesian (id-ID) & English (en-US)

---

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Attendance Commands](#attendance-commands)
4. [Grading Commands](#grading-commands)
5. [Navigation Commands](#navigation-commands)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

Voice commands allow teachers to perform common tasks using natural speech recognition. This feature uses the browser's Web Speech API and works best in Chrome, Edge, and Safari.

### Features
- **Hands-free operation**: Perform tasks without typing or clicking
- **Bilingual support**: Commands work in both Indonesian and English
- **Permission-aware**: Only commands for which you have permission are available
- **Voice feedback**: Get audio confirmation of executed commands

### Requirements
- Microphone access enabled
- Compatible browser (Chrome, Edge, Safari)
- Internet connection (for online operations)

---

## Getting Started

### Enabling Voice Commands

1. Go to **Settings** (Pengaturan)
2. Enable **Voice Commands** (Perintah Suara)
3. Allow microphone access when prompted
4. Choose your preferred language (Indonesian/English)

### Using Voice Commands

1. Click the **Microphone** icon or press the activation key
2. Speak the command clearly
3. Wait for voice confirmation
4. The action will be executed

---

## Attendance Commands

### Mark Individual Attendance

#### Mark Present
```
Indonesian: "hadir [nama siswa]"
English: "mark present [student name]"

Examples:
- "hadir Ahmad"
- "hadir Budi Santoso"
- "mark present John Doe"
```

#### Mark Absent
```
Indonesian: "absen [nama siswa]"
English: "mark absent [student name]"

Examples:
- "absen Siti"
- "absen Dewi Lestari"
- "mark absent Jane Smith"
```

#### Mark Late
```
Indonesian: "terlambat [nama siswa]"
English: "mark late [student name]"

Examples:
- "terlambat Rudi"
- "mark late Bob Johnson"
```

#### Mark Permitted
```
Indonesian: "izin [nama siswa]"
English: "mark permitted [student name]"

Examples:
- "izin Maya"
- "mark permitted Alice Brown"
```

### Bulk Attendance Commands

#### Mark All Present
```
Indonesian: "semua hadir"
English: "all present"
```

#### Submit Attendance
```
Indonesian: "kirim kehadiran"
English: "submit attendance"
```

#### Show Attendance List
```
Indonesian: "tampilkan kehadiran"
English: "show attendance"
```

#### Export Attendance
```
Indonesian: "ekspor kehadiran"
English: "export attendance"
```

---

## Grading Commands

### Set Grade
```
Indonesian: "set [nama siswa] nilai [nilai]"
English: "set [student name] grade to [value]"

Examples:
- "set Ahmad nilai 85"
- "set Budi grade to 90"
- "set John nilai 75"
- "set Jane grade to 88"
```

### Grading Actions

#### Pass Student
```
Indonesian: "lulus"
English: "pass"

Examples:
- "lulus"
- "pass"
```

#### Fail Student
```
Indonesian: "gagal"
English: "fail"

Examples:
- "gagal"
- "fail"
```

#### Mark Absent for Exam
```
Indonesian: "tidak ikut ujian"
English: "absent for exam"

Examples:
- "tidak ikut ujian"
- "absent for exam"
```

### Bulk Grading

#### Grade All
```
Indonesian: "nilai semua"
English: "grade all"
```

#### Submit Grades
```
Indonesian: "kirim nilai"
English: "submit grades"

Examples:
- "kirim nilai"
- "submit grades"
```

#### Go to Next Student
```
Indonesian: "siswa berikutnya"
English: "next student"

Examples:
- "siswa berikutnya"
- "next student"
```

---

## Navigation Commands

### Open Grading
```
Indonesian: "nilai" or "buka penilaian"
English: "open grading" or "grading"

Examples:
- "buka penilaian"
- "open grading"
```

### View Attendance
```
Indonesian: "absensi" or "lihat absensi"
English: "view attendance" or "attendance"

Examples:
- "lihat absensi"
- "view attendance"
```

### Open Library
```
Indonesian: "buka perpustakaan" or "perpustakaan"
English: "open library"

Examples:
- "buka perpustakaan"
- "open library"
```

### Show My Classes
```
Indonesian: "kelas saya" or "tampilkan kelas"
English: "show my classes" or "my classes"

Examples:
- "kelas saya"
- "show my classes"
```

### Go Home
```
Indonesian: "pulang" or "kembali" or "beranda"
English: "go home" or "home"

Examples:
- "kembali"
- "go home"
```

### Logout
```
Indonesian: "keluar"
English: "logout" or "sign out"

Examples:
- "keluar"
- "logout"
```

### Help
```
Indonesian: "bantuan" or "bisa ngapain saja"
English: "help"

Examples:
- "bantuan"
- "help"
```

---

## Best Practices

### Speaking Tips

1. **Speak clearly**: Enunciate words properly
2. **Wait for confirmation**: Don't speak immediately after command
3. **Use consistent language**: Mix Indonesian and English commands sparingly
4. **Check recognition confidence**: Low confidence may indicate misunderstood command

### Command Patterns

- **Full name recognition**: Use full student names when possible
- **Avoid background noise**: Commands work best in quiet environments
- **Pause between commands**: Wait 1-2 seconds between multiple commands

### Permission Requirements

Some commands require specific permissions:

| Command Category | Required Permission | Role |
|----------------|---------------------|-------|
| Attendance | `academic.attendance` | Teacher, Admin, Wakasek, Kepsek |
| Grading | `academic.grades` | Teacher, Admin, Wakasek, Kepsek |
| Navigation | Various | All users |

If a command fails, check if you have the required permission.

---

## Troubleshooting

### Command Not Recognized

**Problem**: System doesn't recognize command

**Solutions**:
1. Check microphone is enabled
2. Speak more clearly and slowly
3. Try alternative command phrasing
4. Check browser compatibility (use Chrome/Edge/Safari)

### Permission Denied

**Problem**: "You don't have permission" message

**Solutions**:
1. Check your user role
2. Contact administrator if role is incorrect
3. Verify permission for the specific command

### Voice Feedback Not Working

**Problem**: No voice confirmation

**Solutions**:
1. Check volume settings
2. Ensure speech synthesis is enabled
3. Check browser audio settings
4. Refresh the page and try again

### Background Noise Issues

**Problem**: Commands recognized incorrectly

**Solutions**:
1. Move to a quieter location
2. Use headphones with microphone
3. Reduce background noise
4. Pause playback/music while speaking

---

## Complete Command Reference

### Attendance Commands

| Command | Indonesian | English | Permission |
|---------|-------------|----------|-------------|
| Mark Present | hadir [nama] | mark present [name] | academic.attendance |
| Mark Absent | absen [nama] | mark absent [name] | academic.attendance |
| Mark Late | terlambat [nama] | mark late [name] | academic.attendance |
| Mark Permitted | izin [nama] | mark permitted [name] | academic.attendance |
| Mark All Present | semua hadir | all present | academic.attendance |
| Submit Attendance | kirim kehadiran | submit attendance | academic.attendance |
| Show Attendance | tampilkan kehadiran | show attendance | academic.attendance |
| Export Attendance | ekspor kehadiran | export attendance | academic.attendance |

### Grading Commands

| Command | Indonesian | English | Permission |
|---------|-------------|----------|-------------|
| Set Grade | set [nama] nilai [nilai] | set [name] grade to [value] | academic.grades |
| Pass Student | lulus | pass | academic.grades |
| Fail Student | gagal | fail | academic.grades |
| Mark Exam Absent | tidak ikut ujian | absent for exam | academic.grades |
| Grade All | nilai semua | grade all | academic.grades |
| Submit Grades | kirim nilai | submit grades | academic.grades |
| Next Student | siswa berikutnya | next student | academic.grades |

### Navigation Commands

| Command | Indonesian | English | Permission |
|---------|-------------|----------|-------------|
| Open Grading | buka penilaian | open grading | academic.grades |
| View Attendance | lihat absensi | view attendance | academic.attendance |
| Open Library | buka perpustakaan | open library | student.library |
| Show Classes | kelas saya | show my classes | academic.classes |
| Go Home | kembali | go home | content.read |
| Logout | keluar | logout | content.read |
| Help | bantuan | help | content.read |

---

## Technical Details

### Browser Support

| Browser | Voice Recognition | Speech Synthesis | Recommended |
|---------|----------------|-----------------|-------------|
| Chrome | ✅ Excellent | ✅ Excellent | ✅ Yes |
| Edge | ✅ Excellent | ✅ Excellent | ✅ Yes |
| Safari | ✅ Good | ✅ Good | ✅ Yes |
| Firefox | ❌ Not Supported | ✅ Good | ❌ No |

### Performance Metrics

- **Recognition latency**: 500-2000ms
- **Synthesis latency**: 100-500ms
- **Command accuracy**: ~90% in optimal conditions
- **Supported languages**: Indonesian (id-ID), English (en-US)

---

## Getting Help

If you encounter issues:

1. **Check this guide**: Verify command syntax
2. **Contact IT support**: For technical issues
3. **Report bugs**: Use the feedback system in-app
4. **Check permissions**: Contact administrator for role issues

---

## Future Enhancements

Planned features for future releases:

- [ ] More languages (Japanese, Arabic)
- [ ] Custom command aliases
- [ ] Command history
- [ ] Voice command suggestions
- [ ] Batch voice command processing

---

**Document Version**: 1.0
**Last Updated**: 2026-01-29
**Maintained By**: MA Malnu Kananga Development Team
