# 💻 Developer Guide - MA Malnu Kananga

## 🚀 Getting Started

Welcome to the MA Malnu Kananga developer guide! This comprehensive guide will help you understand the codebase, setup development environment, and contribute effectively to the project.

---

## 🏗️ Project Architecture

### Tech Stack Overview

**Frontend (React + TypeScript)**
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Strict type checking for better code quality
- **Vite**: Fast build tool with HMR and optimized bundles
- **Tailwind CSS**: Utility-first CSS framework
- **PWA**: Progressive Web App capabilities

**Backend (Cloudflare Workers)**
- **Cloudflare Workers**: Serverless JavaScript runtime
- **D1 Database**: SQLite-compatible serverless database
- **Vectorize**: Vector database for AI RAG system
- **Google Gemini AI**: Large language model integration

**Development Tools**
- **Jest**: Testing framework with comprehensive coverage
- **ESLint + Prettier**: Code quality and formatting
- **Husky**: Git hooks for pre-commit validation
- **GitHub Actions**: CI/CD pipeline automation

### Project Structure

```
malnu-kananga/
├── 📂 src/                          # Source code
│   ├── 📂 components/               # React components
│   │   ├── 📂 icons/                # Custom SVG icons
│   │   ├── ChatWindow.tsx           # AI chat interface
│   │   ├── StudentDashboard.tsx     # Student portal
│   │   ├── TeacherDashboard.tsx     # Teacher portal
│   │   ├── ParentDashboard.tsx      # Parent portal
│   │   └── ...                      # Other components
│   ├── 📂 services/                 # Business logic
│   │   ├── 📂 api/                  # API service layer
│   │   ├── geminiService.ts         # AI integration
│   │   ├── authService.ts           # Authentication
│   │   └── ...                      # Other services
│   ├── 📂 hooks/                    # Custom React hooks
│   ├── 📂 memory/                   # Memory bank system
│   ├── 📂 data/                     # Static data
│   └── 📂 utils/                    # Utility functions
├── 📂 public/                       # Static assets
├── 📂 docs/                         # Documentation
├── worker.js                        # Cloudflare Worker
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite configuration
└── tsconfig.json                    # TypeScript config
```

---

## 🛠️ Development Setup

### Prerequisites

**Required Software:**
- **Node.js**: Version 18+ (use nvm for version management)
- **npm**: Latest version or yarn
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions

**VS Code Extensions (Recommended):**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/your-username/malnu-kananga.git
cd malnu-kananga
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: API_KEY (Google Gemini)
# Optional: VITE_WORKER_URL, VITE_JWT_SECRET
```

4. **Start Development Server**
```bash
npm run dev -- --port 9000
```

5. **Verify Installation**
- Open http://localhost:9000
- Check browser console for errors
- Test basic functionality

### Environment Variables

**Development (.env):**
```bash
# Google Gemini AI (Required)
API_KEY=your_gemini_api_key_here

# Worker URL (Optional - defaults to production)
VITE_WORKER_URL=https://malnu-api.sulhi-cmz.workers.dev

# Development Settings
VITE_DEV_MODE=true
VITE_JWT_SECRET=dev-secret-key

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ANALYTICS=false
```

**Production:**
```bash
# Set via Cloudflare Workers secrets
API_KEY=production_gemini_key
SECRET_KEY=jwt_secret_key
NODE_ENV=production
```

---

## 🧪 Testing

### Test Structure

**Test Files Location:**
```
src/
├── __tests__/                       # Global test utilities
├── components/
│   ├── ComponentName.test.tsx       # Component tests
│   └── ComponentName.test.ts        # Hook tests
├── services/
│   ├── serviceName.test.ts          # Service tests
│   └── __tests__/                   # Service test utilities
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- ChatWindow.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="authentication"
```

### Writing Tests

**Component Test Example:**
```typescript
// ChatWindow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';

describe('ChatWindow', () => {
  it('renders chat interface', () => {
    render(<ChatWindow />);
    expect(screen.getByPlaceholderText('Ketik pesan...')).toBeInTheDocument();
  });

  it('sends message when form is submitted', () => {
    const mockOnSendMessage = jest.fn();
    render(<ChatWindow onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Ketik pesan...');
    const button = screen.getByRole('button', { name: 'Kirim' });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello');
  });
});
```

**Service Test Example:**
```typescript
// authService.test.ts
import { AuthService } from './authService';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates email format', async () => {
    const result = await AuthService.requestLoginLink('invalid-email');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Format email tidak valid');
  });

  it('requests login link successfully', async () => {
    const result = await AuthService.requestLoginLink('test@example.com');
    expect(result.success).toBe(true);
  });
});
```

### Test Coverage Requirements

- **Components**: Minimum 80% coverage
- **Services**: Minimum 90% coverage
- **Hooks**: Minimum 85% coverage
- **Utils**: Minimum 95% coverage

---

## 🎨 Component Development

### Component Architecture

**Component Structure:**
```typescript
// ComponentName.tsx
import React, { useState, useEffect } from 'react';
import { ComponentNameProps } from './types';
import './ComponentName.css';

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2,
  onAction
}) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleClick = () => {
    onAction?.(data);
  };

  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

**Types Definition:**
```typescript
// types.ts
export interface ComponentNameProps {
  prop1: string;
  prop2?: number; // Optional prop
  onAction?: (data: SomeType) => void; // Optional callback
}

export interface ComponentState {
  data: SomeType[];
  loading: boolean;
  error: string | null;
}
```

### Best Practices

1. **Use TypeScript interfaces** for all props and state
2. **Follow naming conventions**: PascalCase for components, camelCase for functions
3. **Implement proper error boundaries** for error handling
4. **Use React.memo** for performance optimization
5. **Follow accessibility guidelines** (ARIA labels, semantic HTML)

### Custom Hooks

**Hook Structure:**
```typescript
// useCustomHook.ts
import { useState, useEffect } from 'react';

export interface UseCustomHookReturn {
  data: SomeType | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCustomHook = (param: string): UseCustomHookReturn => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiCall(param);
      setState(prev => ({ ...prev, data: response, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        loading: false 
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [param]);

  return {
    ...state,
    refetch: fetchData
  };
};
```

---

## 🔌 API Integration

### Service Layer Architecture

**Base API Service:**
```typescript
// baseApiService.ts
export class BaseApiService {
  protected static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(response.statusText, response.status);
      }

      return await response.json();
    } catch (error) {
      throw new ApiError(error.message, 500);
    }
  }

  private static getAuthHeaders(): Record<string, string> {
    const token = TokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
```

**Specific API Service:**
```typescript
// studentApiService.ts
export class StudentApiService extends BaseApiService {
  static async getStudentData(studentId: string): Promise<Student> {
    return this.request<Student>(`/api/student/${studentId}`);
  }

  static async getStudentGrades(studentId: string): Promise<Grade[]> {
    return this.request<Grade[]>(`/api/student/${studentId}/grades`);
  }

  static async getStudentSchedule(studentId: string): Promise<ScheduleItem[]> {
    return this.request<ScheduleItem[]>(`/api/student/${studentId}/schedule`);
  }
}
```

### Error Handling

**Global Error Boundary:**
```typescript
// ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
    ErrorReportingService.logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Terjadi kesalahan</h2>
          <p>Halaman ini tidak dapat dimuat. Silakan refresh halaman.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🤖 AI Integration

### Gemini Service Architecture

**AI Service Implementation:**
```typescript
// geminiService.ts
export async function* getAIResponseStream(
  message: string,
  history: { role: 'user' | 'model', parts: string }[]
): AsyncGenerator<string> {
  // 1. Fetch context from vector database
  const context = await fetchContext(message);
  
  // 2. Augment message with context
  const augmentedMessage = augmentMessage(message, context);
  
  // 3. Call Gemini API
  const responseStream = await callGeminiAPI(augmentedMessage, history);
  
  // 4. Stream response
  for await (const chunk of responseStream) {
    yield chunk.text;
  }
  
  // 5. Store in memory bank
  await storeConversation(message, fullResponse);
}
```

### Memory Bank System

**Memory Management:**
```typescript
// memory/MemoryBank.ts
export class MemoryBank {
  async addMemory(
    content: string,
    type: 'conversation' | 'knowledge' | 'user_data',
    metadata?: Record<string, any>
  ): Promise<string> {
    const memory = {
      id: generateId(),
      content,
      type,
      metadata,
      timestamp: new Date().toISOString(),
      embeddings: await generateEmbeddings(content)
    };
    
    await this.storage.store(memory);
    return memory.id;
  }

  async getRelevantMemories(query: string, limit = 5): Promise<Memory[]> {
    const queryEmbedding = await generateEmbeddings(query);
    return this.storage.searchSimilar(queryEmbedding, limit);
  }
}
```

---

## 📱 PWA Development

### Service Worker

**Service Worker Implementation:**
```javascript
// public/sw.js
const CACHE_NAME = 'malnu-kananga-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

### PWA Manifest

**Manifest Configuration:**
```json
// public/manifest.json
{
  "name": "MA Malnu Kananga",
  "short_name": "Malnu Kananga",
  "description": "Portal Siswa MA Malnu Kananga",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🚀 Deployment

### Build Process

**Production Build:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

**Build Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
          utils: ['date-fns', 'lodash']
        }
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
```

### Cloudflare Workers Deployment

**Worker Configuration:**
```toml
# wrangler.toml
name = "malnu-kananga"
main = "worker.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your_database_id"

[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

[vars]
NODE_ENV = "production"
```

**Deployment Commands:**
```bash
# Deploy worker
wrangler deploy

# Deploy with environment
wrangler deploy --env=production

# Seed vector database
curl https://your-worker.workers.dev/seed
```

---

## 🔧 Development Tools

### Code Quality

**ESLint Configuration:**
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Prettier Configuration:**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Git Hooks

**Pre-commit Hook:**
```bash
#!/bin/sh
# .husky/pre-commit
npm run lint
npm run test
npm run type-check
```

**Commit Message Format:**
```
feat: add new feature
fix: resolve bug in authentication
docs: update API documentation
style: format code with prettier
refactor: optimize component structure
test: add unit tests for auth service
```

---

## 📊 Performance Optimization

### Code Splitting

**Route-based Splitting:**
```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Routes>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
        </Routes>
      </Router>
    </Suspense>
  );
}
```

### Bundle Optimization

**Dynamic Imports:**
```typescript
// Load heavy libraries on demand
const loadChartLibrary = () => import('chart.js').then(module => module.default);

// Use in component
const handleShowChart = async () => {
  const Chart = await loadChartLibrary();
  // Use Chart library
};
```

### Caching Strategy

**API Caching:**
```typescript
// useApiCache hook
export const useApiCache = <T>(key: string, fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
    }

    fetcher().then(freshData => {
      setData(freshData);
      localStorage.setItem(key, JSON.stringify(freshData));
      setLoading(false);
    });
  }, [key, fetcher]);

  return { data, loading };
};
```

---

## 🔍 Debugging

### Chrome DevTools

**React Developer Tools:**
- Install React DevTools extension
- Use Components tab to inspect component hierarchy
- Profile component performance with Profiler tab

**Network Debugging:**
- Monitor API calls in Network tab
- Check response times and status codes
- Analyze bundle loading in Coverage tab

### Logging Strategy

**Structured Logging:**
```typescript
// logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  
  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      data
    });
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};
```

---

## 🤝 Contributing Guidelines

### Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

2. **Make Changes**
- Follow code style guidelines
- Write tests for new features
- Update documentation

3. **Commit Changes**
```bash
git commit -m "feat: add amazing feature"
```

4. **Push and Create PR**
```bash
git push origin feature/amazing-feature
# Create Pull Request on GitHub
```

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] TypeScript types are properly defined
- [ ] Accessibility guidelines are followed
- [ ] Performance impact is considered

### Release Process

1. **Update Version**
```bash
npm version patch  # or minor, major
```

2. **Generate Changelog**
```bash
npm run changelog
```

3. **Create Release Tag**
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 📚 Learning Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

### Best Practices
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Performance Optimization](https://web.dev/performance/)

### Community
- [React Discord](https://discord.gg/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react)
- [GitHub Discussions](https://github.com/facebook/react/discussions)

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Development server not starting**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: TypeScript errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

**Issue: Tests failing**
```bash
# Run tests with verbose output
npm test -- --verbose
```

### Getting Help

1. **Check Documentation**: Review relevant docs
2. **Search Issues**: Check GitHub issues
3. **Ask Team**: Post in development chat
4. **Create Issue**: Report bugs with detailed information

---

**💻 Happy Coding!**

*This developer guide is maintained by the MA Malnu Kananga development team. For questions or contributions, please reach out to the development team.*

---

*Developer Guide Version: 1.0.0*  
*Last Updated: November 2024*