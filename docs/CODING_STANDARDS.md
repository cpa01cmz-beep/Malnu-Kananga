# Standar Pengkodean (Coding Standards)

**Created**: 2025-01-01
**Last Updated**: 2026-01-07
**Version**: 2.1.0
**Status**: Active

## 1. TypeScript & React

### 1.1 Type Safety
- **Interface Explicit**: Selalu gunakan `interface` untuk mendefinisikan props komponen dan struktur data. Hindari penggunaan `any` atau `unknown`.
  ```ts
  // Benar
  interface UserProps { name: string; age: number; }
  const User = ({ name, age }: UserProps) => ...

  // Salah
  const User = (props: any) => ...
  const User = (props: unknown) => ...
  ```

- **Strict Mode**: TypeScript strict mode wajib diaktifkan di `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true
    }
  }
  ```

- **Type Imports**: Gunakan `import type` untuk type-only imports
  ```ts
  // Benar
  import type { User, UserRole } from './types';
  import { UserService } from './services';

  // Salah
  import { User, UserRole, UserService } from './types';
  ```

### 1.2 Component Patterns
- **Functional Components**: Gunakan functional components dengan hooks. Hindari class components.
  ```tsx
  // Benar
  const UserProfile = ({ user }: UserProfileProps) => {
    const [loading, setLoading] = useState(false);
    return <div>{user.name}</div>;
  };

  // Salah
  class UserProfile extends Component {
    render() {
      return <div>{this.props.user.name}</div>;
    }
  }
  ```

- **Named Exports**: Gunakan named exports untuk utilitas, default exports untuk komponen utama (Page/Container).
  ```tsx
  // Komponen utama - default export
  export default function AdminDashboard() { ... }

  // Utilitas/components kecil - named export
  export const Button = ({ children, onClick }: ButtonProps) => { ... }
  export const formatDate = (date: Date) => { ... }
  ```

- **Component Props**: Definisikan props dengan interface yang jelas
  ```tsx
  interface CardProps {
    title: string;
    description?: string;
    onClick?: () => void;
    variant?: 'default' | 'hover' | 'interactive';
  }

  const Card = ({ title, description, onClick, variant = 'default' }: CardProps) => {
    return <div className={`card ${variant}`}>{title}</div>;
  };
  ```

### 1.3 Hooks Usage
- **Custom Hooks**: Buat custom hooks untuk logic yang bisa dipakai ulang
  ```ts
  // Benar
  const useVoiceRecognition = () => {
    const [transcript, setTranscript] = useState('');
    // ... logic
    return { transcript, startListening, stopListening };
  };

  // Salah
  // Mengulang logika yang sama di banyak komponen
  ```

- **Hooks Rules**: Selalu patuhi Rules of Hooks
  - Hanya panggil hooks di top level function
  - Jangan panggil hooks di dalam loops, conditions, atau nested functions
  - Hanya panggil hooks dari React functions atau custom hooks

### 1.4 Error Handling
- **Centralized Error Handling**: Gunakan `errorHandler.ts` untuk error handling konsisten
  ```ts
  import { handleError } from './utils/errorHandler';

  const fetchData = async () => {
    try {
      const data = await apiService.getData();
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  };
  ```

- **Logging**: Gunakan `logger.ts` untuk logging konsisten
  ```ts
  import { logger } from './utils/logger';

  logger.debug('Debugging user data', { userId: user.id });
  logger.info('User logged in', { userId: user.id });
  logger.warn('Session expired', { userId: user.id });
  logger.error('API request failed', { error, url });
  ```

## 2. Styling (Tailwind CSS)

### 2.1 Utility-First Approach
- **Utility Classes**: Gunakan kelas utility Tailwind. Hindari membuat file CSS kustom (`.css`) kecuali untuk animasi global `@keyframes`.
  ```tsx
  // Benar
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">

  // Salah
  // components/Card.css
  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  ```

### 2.2 Dark Mode
- **Dark Mode Support**: Selalu sertakan varian `dark:` untuk setiap warna latar belakang atau teks utama.
  ```tsx
  <div className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
      Title
    </h1>
  </div>
  ```

### 2.3 Color System
- **Neutral Colors**: Gunakan `neutral-*` bukan `gray-*` untuk konsistensi
  ```tsx
  // Benar
  <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900">

  // Salah (migration in progress)
  <div className="bg-gray-100 dark:bg-gray-800 text-gray-900">
  ```

### 2.4 Responsive Design
- **Mobile-First**: Design mobile-first dengan Tailwind responsive classes
  ```tsx
  <div className="w-full md:w-1/2 lg:w-1/3">
    Content
  </div>
  ```

## 3. Struktur Folder & File Organization

### 3.1 Directory Structure
- **`/components`**: Komponen UI yang dapat digunakan kembali (Button, Card, Modal)
  - `/components/ui` - Reusable UI components
  - `/components/icons` - Icon components SVG murni
  - `/components/sections` - Bagian-bagian besar halaman
  - `/components/admin` - Admin-specific components

- **`/services`**: Logika bisnis dan pemanggilan API (Gemini, Fetch)
  - `apiService.ts` - Main API service dengan JWT auth
  - `authService.ts` - Authentication service
  - `geminiService.ts` - AI/LLM integration
  - `speechRecognitionService.ts` - Voice recognition
  - `speechSynthesisService.ts` - Text-to-speech
  - `pushNotificationService.ts` - PWA notifications
  - `ocrService.ts` - OCR untuk PPDB documents
  - `permissionService.ts` - Role-based permissions

- **`/hooks`**: Custom React hooks
  - `useVoiceRecognition.ts`
  - `useVoiceSynthesis.ts`
  - `useAuth.ts`
  - `useLocalStorage.ts`

- **`/types`**: Definisi tipe TypeScript global
- **`/utils`**: Utility functions dan helpers
- **`/constants`**: Konstanta dan konfigurasi
- **`/config`**: Konfigurasi aplikasi
- **`/contexts`**: React Context providers
- **`/data`**: Data statis atau konfigurasi default

### 3.2 File Naming
- **Components**: PascalCase (`UserProfile.tsx`, `Button.tsx`)
- **Services**: camelCase (`apiService.ts`, `authService.ts`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`, `useVoiceRecognition.ts`)
- **Utils**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL.ts`, `STORAGE_KEYS.ts`)
- **Types**: PascalCase for interfaces/Types (`User.ts`, `UserRole.ts`)
- **Tests**: `.test.ts` or `.test.tsx` suffix (`apiService.test.ts`, `Button.test.tsx`)

## 4. API & Data Management

### 4.1 API Service
- **Centralized API Calls**: Semua API calls harus melalui `apiService.ts`
  ```ts
  // Benar
  import apiService from './services/apiService';

  const getUsers = async () => {
    return apiService.get('/users');
  };

  // Salah
  const getUsers = async () => {
    const response = await fetch('/api/users');
    return response.json();
  };
  ```

### 4.2 Authentication
- **JWT Token Management**: Gunakan `authService.ts` untuk token management
  ```ts
  // Login
  const { user, token } = await authService.login(email, password);

  // Refresh token
  const newToken = await authService.refreshToken(refreshToken);

  // Logout
  await authService.logout();
  ```

### 4.3 Error Handling
- **API Error Handling**: Tangani error dengan baik di setiap API call
  ```ts
  const fetchData = async () => {
    try {
      const data = await apiService.get('/data');
      return { success: true, data };
    } catch (error) {
      handleError(error);
      return { success: false, error: error.message };
    }
  };
  ```

## 5. Storage & State Management

### 5.1 LocalStorage
- **Centralized Keys**: Gunakan konstanta dari `STORAGE_KEYS` di `constants.ts`
  ```ts
  // Benar
  import { STORAGE_KEYS } from './constants';
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

  // Salah
  localStorage.setItem('auth_session', JSON.stringify(session));
  localStorage.setItem('token', token);
  ```

- **Prefix Semua Keys**: Semua localStorage keys harus menggunakan prefix `malnu_`
  ```ts
  // Benar
  'malnu_auth_session', 'malnu_users', 'malnu_site_content'

  // Salah
  'auth_session', 'users', 'site_content'
  ```

### 5.2 State Management
- **React State**: Gunakan `useState` dan `useReducer` untuk local state
  ```tsx
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  ```

- **Context**: Gunakan React Context untuk global state
  ```tsx
  // AuthContext.tsx
  const AuthContext = createContext<AuthContextType>(null);

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // ...
    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
  };
  ```

## 6. AI Integration

### 6.1 Gemini API
- **System Instructions**: Saat memanggil Gemini, selalu sertakan `systemInstruction` yang jelas untuk membatasi ruang lingkup jawaban AI.
  ```ts
  const response = await geminiService.generateText(prompt, {
    systemInstruction: 'You are a helpful school management assistant...',
  });
  ```

- **JSON Mode**: Gunakan `responseMimeType: "application/json"` saat membutuhkan output data terstruktur dari AI.
  ```ts
  const response = await geminiService.generateText(prompt, {
    responseMimeType: 'application/json',
  });
  ```

### 6.2 Error Recovery
- **Exponential Backoff**: Implement exponential backoff retry mechanism untuk API calls
  ```ts
  const retryWithBackoff = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  };
  ```

## 7. Accessibility (WCAG 2.1 AA)

### 7.1 Semantic HTML
- **Semantic Elements**: Gunakan semantic HTML elements
  ```tsx
  // Benar
  <nav>
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
    </ul>
  </nav>

  // Salah
  <div>
    <div>Dashboard</div>
  </div>
  ```

### 7.2 ARIA Labels
- **ARIA Labels**: Tambahkan ARIA labels untuk elements yang tidak jelas
  ```tsx
  <button
    onClick={handleClose}
    aria-label="Close dialog"
    aria-pressed={isOpen}
  >
    <XIcon />
  </button>
  ```

### 7.3 Form Accessibility
- **Form Attributes**: Semua form input harus memiliki `id`, `name`, dan `autocomplete` attributes
  ```tsx
  <input
    id="email"
    name="email"
    type="email"
    autoComplete="email"
    aria-describedby="email-error"
    aria-invalid={!!errors.email}
  />
  {errors.email && <span id="email-error">{errors.email}</span>}
  ```

### 7.4 Keyboard Navigation
- **Keyboard Support**: Semua interactive elements harus bisa diakses dengan keyboard
  ```tsx
  <div
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleClick();
      }
    }}
    onClick={handleClick}
  >
    Click me
  </div>
  ```

## 8. Performance Optimization

### 8.1 Code Splitting
- **Lazy Loading**: Gunakan `React.lazy()` untuk code splitting
  ```tsx
  const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

  <Suspense fallback={<Loading />}>
    <AdminDashboard />
  </Suspense>
  ```

### 8.2 Memoization
- **useMemo & useCallback**: Gunakan untuk prevent unnecessary re-renders
  ```tsx
  const expensiveValue = useMemo(() => {
    return heavyComputation(data);
  }, [data]);

  const handleClick = useCallback(() => {
    doSomething(id);
  }, [id]);
  ```

### 8.3 Bundle Optimization
- **Tree Shaking**: Import only what you need
  ```ts
  // Benar
  import { debounce } from 'lodash-es';

  // Salah
  import _ from 'lodash';
  ```

## 9. Testing

### 9.1 Unit Tests
- **Test Coverage**: Target minimum 80% coverage
- **Test Files**: Letakkan di `__tests__/` directory atau `*.test.tsx` di sebelah file yang di-test

### 9.2 Component Tests
- **Testing Library**: Gunakan React Testing Library
  ```tsx
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';

  test('renders user profile', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
  ```

## 10. Git Workflow

### 10.1 Branch Naming
- **Feature Branches**: `feature/feature-name`
- **Bug Fixes**: `fix/bug-description`
- **Hotfixes**: `hotfix/critical-fix`

### 10.2 Commit Messages
- **Conventional Commits**: Ikuti format Conventional Commits
  ```
  feat: add user profile page
  fix: resolve authentication issue
  docs: update README with new features
  refactor: simplify API service logic
  test: add unit tests for auth service
  ```

### 10.3 Pre-Commit Hooks
- **Linting**: Jalankan `npm run lint:fix` sebelum commit
- **Type Checking**: Jalankan `npm run typecheck` sebelum commit
- **Tests**: Jalankan `npm test` sebelum commit

---

**Last Updated**: 2026-01-07
**Version**: 2.1.0
**Review**: Monthly (first Friday of each month)
