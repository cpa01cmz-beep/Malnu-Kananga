# Error Message Migration Guide

This guide explains how to use the centralized error message constants to ensure consistency across the application.

## Overview

The `src/utils/errorMessages.ts` file provides a single source of truth for all user-facing error, validation, success, and guidance messages. This ensures:
- **Consistency**: Same messages across all components
- **Maintainability**: Update messages in one place
- **Localization**: Easier to translate to other languages
- **Type Safety**: TypeScript autocomplete for all message constants

## Available Message Constants

### 1. ERROR_MESSAGES
For general error types mapped to `ErrorType` enum:
```typescript
ERROR_MESSAGES.NETWORK_ERROR        // 'Tidak dapat terhubung ke server...'
ERROR_MESSAGES.TIMEOUT_ERROR        // 'Waktu habis saat memproses permintaan...'
ERROR_MESSAGES.VALIDATION_ERROR     // 'Data yang dimasukkan tidak valid...'
// ... and 11 more
```

### 2. VALIDATION_MESSAGES
For field validation errors with parameter support:
```typescript
// With parameters
VALIDATION_MESSAGES.REQUIRED_FIELD('Nama')              // 'Nama wajib diisi'
VALIDATION_MESSAGES.MIN_LENGTH('Judul', 5)              // 'Judul minimal 5 karakter'
VALIDATION_MESSAGES.INVALID_RANGE('Nilai', 0, 100)       // 'Nilai harus antara 0 dan 100'

// Static messages
VALIDATION_MESSAGES.GRADE_REQUIRED                // 'Nilai wajib diisi'
VALIDATION_MESSAGES.CLASS_INCOMPLETE              // 'Tidak semua siswa memiliki nilai...'
// ... and 30+ more
```

### 3. API_ERROR_MESSAGES
For HTTP status and network errors:
```typescript
API_ERROR_MESSAGES.BAD_REQUEST              // 'Data yang dikirim tidak valid...'
API_ERROR_MESSAGES.UNAUTHORIZED             // 'Sesi Anda telah berakhir...'
API_ERROR_MESSAGES.FORBIDDEN               // 'Anda tidak memiliki izin...'
API_ERROR_MESSAGES.NETWORK_ERROR           // 'Koneksi Internet gagal...'
// ... and 10 more
```

### 4. USER_GUIDANCE
For action buttons and user feedback:
```typescript
USER_GUIDANCE.RETRY                      // 'Coba Lagi'
USER_GUIDANCE.REFRESH                    // 'Refresh Halaman'
USER_GUIDANCE.CONTACT_ADMIN              // 'Hubungi Administrator'
USER_GUIDANCE.SAVE_SUCCESS               // 'Data berhasil disimpan'
USER_GUIDANCE.OFFLINE_MODE              // 'Anda sedang offline...'
// ... and 10 more
```

### 5. SUCCESS_MESSAGES
For success notifications:
```typescript
SUCCESS_MESSAGES.GRADE_SAVED              // 'Nilai berhasil disimpan'
SUCCESS_MESSAGES.ASSIGNMENT_CREATED        // 'Tugas berhasil dibuat'
SUCCESS_MESSAGES.MATERIAL_UPLOADED        // 'Materi berhasil diunggah'
SUCCESS_MESSAGES.PPDB_REGISTRATION_SUCCESS // 'Pendaftaran PPDB berhasil dikirim...'
// ... and 20+ more
```

### 6. VOICE_ERROR_MESSAGES & VOICE_SUCCESS_MESSAGES
For voice recognition features:
```typescript
VOICE_ERROR_MESSAGES.NOT_ALLOWED          // 'Izin mikrofon ditolak...'
VOICE_SUCCESS_MESSAGES.TRANSCRIPTION_SUCCESS // 'Suara berhasil dikenali'
// ... and more
```

### 7. FILE_ERROR_MESSAGES
For file upload errors:
```typescript
FILE_ERROR_MESSAGES.FILE_TOO_LARGE('10MB')      // 'Ukuran file terlalu besar. Maksimal: 10MB'
FILE_ERROR_MESSAGES.INVALID_FILE_TYPE('PDF')      // 'Tipe file tidak valid. Harap unggah: PDF'
// ... and more
```

### 8. NOTIFICATION_ERROR_MESSAGES
For push notification errors:
```typescript
NOTIFICATION_ERROR_MESSAGES.PERMISSION_DENIED   // 'Notifikasi dinonaktifkan...'
NOTIFICATION_ERROR_MESSAGES.FAILED_TO_SEND     // 'Gagal mengirim notifikasi...'
// ... and more
```

## Migration Examples

### Before (Inline Error Messages)
```tsx
const validateForm = () => {
  if (!title) {
    onShowToast('Judul tugas harus diisi', 'error');
    return false;
  }
  if (!description) {
    onShowToast('Deskripsi harus diisi', 'error');
    return false;
  }
  if (!subjectId) {
    onShowToast('Mata pelajaran harus dipilih', 'error');
    return false;
  }
  return true;
};
```

### After (Using Centralized Constants)
```tsx
import { VALIDATION_MESSAGES } from '../utils/errorMessages';

const validateForm = () => {
  if (!title) {
    onShowToast(VALIDATION_MESSAGES.TITLE_REQUIRED, 'error');
    return false;
  }
  if (!description) {
    onShowToast(VALIDATION_MESSAGES.DESCRIPTION_REQUIRED, 'error');
    return false;
  }
  if (!subjectId) {
    onShowToast(VALIDATION_MESSAGES.SUBJECT_REQUIRED, 'error');
    return false;
  }
  return true;
};
```

### Before (Inline Success Messages)
```tsx
const handleSave = async () => {
  try {
    await api.save(data);
    onShowToast('Data berhasil disimpan', 'success');
  } catch (error) {
    onShowToast('Gagal menyimpan data', 'error');
  }
};
```

### After (Using Centralized Constants)
```tsx
import { SUCCESS_MESSAGES, API_ERROR_MESSAGES } from '../utils/errorMessages';

const handleSave = async () => {
  try {
    await api.save(data);
    onShowToast(SUCCESS_MESSAGES.SAVE_SUCCESS, 'success');
  } catch (error) {
    onShowToast(API_ERROR_MESSAGES.OPERATION_FAILED, 'error');
  }
};
```

### Before (Inline User Guidance)
```tsx
<Modal
  title="Konfirmasi Hapus"
  message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
  actions={[
    { label: 'Batal', onClick: onCancel },
    { label: 'Hapus', onClick: onConfirm, variant: 'danger' }
  ]}
/>
```

### After (Using Centralized Constants)
```tsx
import { USER_GUIDANCE } from '../utils/errorMessages';

<Modal
  title="Konfirmasi Hapus"
  message={USER_GUIDANCE.CONFIRM_DELETE}
  actions={[
    { label: 'Batal', onClick: onCancel },
    { label: 'Hapus', onClick: onConfirm, variant: 'danger' }
  ]}
/>
```

## Best Practices

### 1. Always Import from errorMessages.ts
```tsx
// ✅ Good
import { VALIDATION_MESSAGES } from '../utils/errorMessages';

// ❌ Bad - Hardcoded messages
const errorMsg = 'Nama wajib diisi';
```

### 2. Use Parameterized Messages for Dynamic Content
```tsx
// ✅ Good - Using parameters
onShowToast(VALIDATION_MESSAGES.MIN_LENGTH('Judul', 5), 'error');

// ❌ Bad - String concatenation
onShowToast(`Judul minimal 5 karakter`, 'error');
```

### 3. Follow Message Type Guidelines
- Use `ERROR_MESSAGES` for system-level errors (network, timeout, server errors)
- Use `VALIDATION_MESSAGES` for form field validation errors
- Use `API_ERROR_MESSAGES` for HTTP/API specific errors
- Use `SUCCESS_MESSAGES` for success notifications
- Use `USER_GUIDANCE` for button labels and user feedback

### 4. Don't Modify Messages Directly
```tsx
// ❌ Bad - Modifying message
onShowToast(VALIDATION_MESSAGES.REQUIRED_FIELD('Email').toUpperCase(), 'error');

// ✅ Good - Use message as-is or create new constant
onShowToast(VALIDATION_MESSAGES.REQUIRED_FIELD('Email'), 'error');
```

## Component Migration Checklist

To migrate a component to use centralized error messages:

1. [ ] Import message constants: `import { ... } from '../utils/errorMessages'`
2. [ ] Find all hardcoded error strings in the component
3. [ ] Replace with appropriate message constants
4. [ ] Replace hardcoded success strings with `SUCCESS_MESSAGES`
5. [ ] Replace hardcoded validation strings with `VALIDATION_MESSAGES`
6. [ ] Replace hardcoded user guidance with `USER_GUIDANCE`
7. [ ] Test all error/success scenarios
8. [ ] Run typecheck: `npm run typecheck`
9. [ ] Run lint: `npm run lint`

## Type Safety

All message constants are fully typed with TypeScript:

```typescript
// Type exports available
export type ErrorMessageType = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type ValidationMessageType = typeof VALIDATION_MESSAGES[keyof typeof VALIDATION_MESSAGES];
// ... etc.
```

This gives you autocomplete and prevents typos:
```typescript
const message: ErrorMessageType = ERROR_MESSAGES.NETWOR_ERROR; // ❌ Typo caught by TypeScript
const message: ErrorMessageType = ERROR_MESSAGES.NETWORK_ERROR; // ✅ Correct
```

## Adding New Messages

If you need to add new message constants:

1. Open `src/utils/errorMessages.ts`
2. Add to the appropriate message group:
```typescript
export const VALIDATION_MESSAGES = {
  // ... existing messages
  YOUR_NEW_MESSAGE: 'Your new message here',
} as const;
```
3. Add corresponding tests in `src/utils/__tests__/errorMessages.test.ts`
4. Update this documentation with usage examples

## Testing

Run the centralized error messages tests:
```bash
npm test -- errorMessages
```

All 35 tests should pass, covering:
- All error type messages
- All validation messages
- All API error messages
- All user guidance messages
- All success messages
- Voice, file, and notification error messages

## Related Files

- `src/utils/errorMessages.ts` - Centralized error message constants
- `src/utils/errorHandler.ts` - Error classification and handling
- `src/utils/teacherErrorHandler.ts` - API error handling utilities
- `src/utils/teacherValidation.ts` - Validation utilities
- `src/utils/__tests__/errorMessages.test.ts` - Comprehensive test coverage

## Migration Progress

| Component | Status | Notes |
|-----------|--------|-------|
| errorHandler.ts | ✅ Migrated | Uses `CENTRALIZED_ERROR_MESSAGES` |
| teacherErrorHandler.ts | ✅ Migrated | Uses `API_ERROR_MESSAGES` |
| teacherValidation.ts | ✅ Partial | Updated grade validation, needs full migration |
| AnnouncementManager.tsx | ⏳ Pending | Needs validation message migration |
| AssignmentCreation.tsx | ⏳ Pending | Needs validation message migration |
| PPDBRegistration.tsx | ⏳ Pending | Needs validation message migration |
| AcademicGrades.tsx | ⏳ Pending | Needs error message migration |
| All other components | ⏳ Pending | Incremental migration needed |

## Questions or Issues?

If you encounter issues or have questions about error message migration:
1. Check this guide for examples
2. Review `errorMessages.ts` for available constants
3. Review existing tests in `errorMessages.test.ts`
4. Consult the blueprint.md for architecture guidelines
