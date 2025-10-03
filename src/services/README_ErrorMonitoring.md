# Error Monitoring System - Dokumentasi

## Overview

Sistem error monitoring yang komprehensif untuk production debugging dengan fitur-fitur berikut:

- **Error Logging Service**: Service utama untuk logging error dengan informasi lengkap
- **Local Storage Collection**: Penyimpanan error logs di local storage untuk debugging offline
- **Error Reporting Mechanism**: Hook dan utility untuk reporting error dari seluruh aplikasi
- **Production/Development Configuration**: Setup otomatis berdasarkan environment

## Komponen Utama

### 1. Error Logging Service (`errorLoggingService.ts`)

Service utama yang menangani semua logging error dengan fitur:

```typescript
interface ErrorLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'runtime' | 'component' | 'network' | 'user' | 'system';
  metadata?: Record<string, any>;
  resolved?: boolean;
  environment: string;
}
```

**Fitur Utama:**
- Auto-categorization berdasarkan tipe error
- Severity assessment otomatis
- Session tracking
- Environment detection
- Metadata support

### 2. Error Reporting Hook (`useErrorReporting.ts`)

Hook React untuk memudahkan penggunaan error monitoring:

```typescript
const {
  logError,
  logWarning,
  logInfo,
  reportError,
  clearLogs,
  getLogs,
  getStats,
  updateConfig
} = useErrorReporting({
  componentName: 'MyComponent',
  enableAutoCatch: true
});
```

**Utility Functions:**
- `safeExecute()`: Wrapper untuk try-catch dengan auto error reporting
- `reportError()`: Manual error reporting tanpa hook
- `withErrorReporting()`: HOC untuk wrapping components

### 3. Configuration (`errorMonitoringConfig.ts`)

Setup otomatis berdasarkan environment dengan konfigurasi berbeda untuk:

- **Development**: Console logging aktif, semua error disimpan
- **Production**: Minimal console logging, external service integration
- **Staging**: Kombinasi development dan production features

## Penggunaan

### Basic Setup

Error monitoring otomatis di-setup di `App.tsx`:

```typescript
import { setupErrorMonitoring } from './services/errorMonitoringConfig';

React.useEffect(() => {
  setupErrorMonitoring();
}, []);
```

### Menggunakan Hook di Component

```typescript
import { useErrorReporting } from '../hooks/useErrorReporting';

function MyComponent() {
  const { logError, logWarning } = useErrorReporting({
    componentName: 'MyComponent'
  });

  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      await logError(error, { operation: 'riskyOperation' });
    }
  };

  const handleWarning = () => {
    logWarning('This is a warning message', { userId: '123' });
  };

  return (
    // JSX content
  );
}
```

### Manual Error Reporting

```typescript
import { reportError, safeExecute } from '../hooks/useErrorReporting';

// Manual reporting
try {
  await someOperation();
} catch (error) {
  await reportError(error, 'someOperation', { userId: '123' });
}

// Safe execute wrapper
const result = await safeExecute(
  () => someOperation(),
  'someOperation',
  { userId: '123' }
);
```

### HOC Usage

```typescript
import { withErrorReporting } from '../hooks/useErrorReporting';

const MyComponentWithErrorReporting = withErrorReporting(MyComponent, {
  componentName: 'MyComponent',
  enableAutoCatch: true
});
```

## Development Helpers

Di environment development, tersedia global functions:

```javascript
// Di browser console
getErrorLogs()      // Get semua error logs
clearErrorLogs()    // Clear semua error logs
getErrorStats()     // Get statistik error
exportErrorLogs()   // Export logs sebagai JSON string
```

## Environment Variables

Setup environment variables di `.env`:

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
REACT_APP_ERROR_REPORTING_URL=https://your-error-service.com/api/errors
```

## Error Categories & Severity

### Categories:
- `runtime`: Error runtime JavaScript
- `component`: Error dari React components
- `network`: Error terkait network requests
- `user`: Error yang disebabkan oleh user interaction
- `system`: Error sistem atau environment

### Severity Levels:
- `low`: Warnings, deprecated features
- `medium`: General errors (default)
- `high`: Critical errors seperti chunk loading
- `critical`: Memory issues, stack overflow

## Best Practices

1. **Gunakan meaningful metadata**:
   ```typescript
   await logError(error, {
     userId: currentUser?.id,
     action: 'saveDocument',
     timestamp: Date.now()
   });
   ```

2. **Categorize errors dengan tepat**:
   ```typescript
   // Network errors
   if (error.message.includes('fetch')) {
     category = 'network';
   }
   ```

3. **Gunakan safeExecute untuk operasi kritis**:
   ```typescript
   const data = await safeExecute(
     () => fetchData(),
     'fetchUserData',
     { userId }
   );
   ```

4. **Monitor memory usage di production**:
   ```typescript
   // Otomatis aktif di production
   // Memory usage > 100MB akan di-log
   ```

## Debugging

### Development Mode:
- Error details ditampilkan di ErrorBoundary
- Global helpers tersedia di console
- Real-time error stats setiap menit

### Production Mode:
- Error dikirim ke external service
- Memory monitoring aktif
- Minimal console logging untuk performa

## Troubleshooting

### Error Logging Service Tidak Bekerja:
1. Pastikan `setupErrorMonitoring()` dipanggil di App component
2. Check environment variables
3. Verify error service initialization

### External Service Tidak Menerima Error:
1. Check `REACT_APP_ERROR_REPORTING_URL`
2. Verify CORS configuration
3. Check network connectivity

### Memory Issues:
1. Monitor memory usage di development tools
2. Check untuk memory leaks
3. Optimize component re-renders

## Extension Points

Sistem dapat diperluas dengan:

1. **Custom Error Categories**: Tambah kategori baru di interface
2. **External Services**: Integrasi dengan Sentry, LogRocket, dll
3. **User Context**: Auto-attach user information
4. **Performance Monitoring**: Track performance metrics
5. **Real User Monitoring**: Track user interactions

## Security Considerations

- Error logs tidak boleh berisi sensitive information
- Filter out passwords, tokens, PII data
- Implement rate limiting untuk external services
- Encrypt logs jika diperlukan

---

Dengan sistem ini, Anda memiliki monitoring error yang komprehensif untuk production debugging dengan minimal setup dan maximum insight.