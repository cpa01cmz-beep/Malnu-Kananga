# 📚 Component Library Documentation - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga frontend is built with React 18 + TypeScript, featuring a comprehensive component library with 60+ reusable components. This documentation provides complete reference for all components, their props, usage examples, and design patterns.

---

## 🏗️ Architecture Overview

### Technology Stack
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Strict type checking for reliability
- **Tailwind CSS**: Utility-first CSS with custom design system
- **Vite**: Fast build tool with HMR
- **Testing**: Vitest + React Testing Library

### Component Structure
```
src/components/
├── icons/           # 10+ SVG icon components
├── __tests__/       # Component test files
├── AuthButtons.tsx          # Authentication buttons
├── ChatWindow.tsx           # AI chat interface
├── StudentDashboard.tsx     # Student portal dashboard
├── TeacherDashboard.tsx     # Teacher portal dashboard
├── ParentDashboard.tsx      # Parent portal dashboard
└── ... (50+ more components)
```

---

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary-blue: #2563eb;      /* Main brand color */
--primary-dark: #1e40af;      /* Darker variant */
--primary-light: #3b82f6;     /* Lighter variant */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-900: #111827;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
```

### Spacing System
```css
/* Spacing (4px base unit) */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-4: 1rem;        /* 16px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
```

---

## 🧩 Core Components

### 1. Authentication Components

#### AuthButtons
Authentication buttons for login/logout actions.

```typescript
interface AuthButtonsProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  className?: string;
}
```

**Usage Example:**
```tsx
<AuthButtons
  isAuthenticated={user !== null}
  onLogin={() => setShowLoginModal(true)}
  onLogout={handleLogout}
  className="flex gap-2"
/>
```

**Features:**
- Dynamic button text based on auth state
- Loading states during authentication
- Accessible ARIA labels
- Responsive design

#### LoginModal
Modal component for magic link authentication.

```typescript
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}
```

**Usage Example:**
```tsx
<LoginModal
  isOpen={showLoginModal}
  onClose={() => setShowLoginModal(false)}
  onSuccess={handleLoginSuccess}
/>
```

**Features:**
- Email validation
- Loading states
- Error handling
- CSRF protection
- Responsive design

---

### 2. Dashboard Components

#### StudentDashboard
Main dashboard for student users.

```typescript
interface StudentDashboardProps {
  user: StudentUser;
  className?: string;
}
```

**Features:**
- Academic overview
- Recent grades display
- Attendance summary
- Navigation tabs
- Responsive layout

**Sub-components:**
- `StudentDashboardHeader`: User info and navigation
- `OverviewTab`: Academic summary
- `GradesTab`: Grade details
- `AttendanceTab`: Attendance records
- `ScheduleTab`: Class schedule

#### TeacherDashboard
Dashboard for teacher users.

```typescript
interface TeacherDashboardProps {
  user: TeacherUser;
  className?: string;
}
```

**Features:**
- Class management
- Grade input interface
- Attendance tracking
- Student analytics
- Announcement creation

#### ParentDashboard
Dashboard for parent users.

```typescript
interface ParentDashboardProps {
  user: ParentUser;
  children: Child[];
  className?: string;
}
```

**Features:**
- Child performance monitoring
- Communication with teachers
- Attendance tracking
- Announcements
- Progress reports

---

### 3. Chat Components

#### ChatWindow
AI chat interface with RAG system.

```typescript
interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}
```

**Features:**
- Real-time AI responses
- Message history
- Typing indicators
- File attachment support
- Responsive design

**Sub-components:**
- `ChatHeader`: Chat window header
- `ChatMessages`: Message display area
- `ChatInput`: Message input field
- `MessageBubble`: Individual message styling

#### ChatInput
Input component for chat messages.

```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}
```

**Features:**
- Multi-line support
- Character limit
- Send button
- Keyboard shortcuts (Enter to send)
- Accessibility support

---

### 4. Navigation Components

#### Header
Main application header.

```typescript
interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  className?: string;
}
```

**Features:**
- Logo display
- Navigation menu
- User authentication status
- Mobile responsive
- Search functionality

#### NavigationTabs
Tab navigation for dashboards.

```typescript
interface NavigationTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType;
  disabled?: boolean;
}
```

**Features:**
- Dynamic tab generation
- Active state indication
- Disabled state support
- Icon support
- Responsive design

---

### 5. Data Display Components

#### FeaturedProgramsSection
Display school programs and highlights.

```typescript
interface FeaturedProgramsSectionProps {
  programs: Program[];
  className?: string;
}
```

**Features:**
- Card-based layout
- Image lazy loading
- Responsive grid
- Hover effects
- Accessibility support

#### LatestNewsSection
Display latest news and announcements.

```typescript
interface LatestNewsSectionProps {
  news: NewsItem[];
  maxItems?: number;
  className?: string;
}
```

**Features:**
- Chronological ordering
- Excerpt display
- Read more links
- Category tags
- Date formatting

---

### 6. Form Components

#### AssignmentSubmission
Assignment submission form.

```typescript
interface AssignmentSubmissionProps {
  assignment: Assignment;
  onSubmit: (submission: Submission) => void;
  className?: string;
}
```

**Features:**
- File upload
- Text input
- Validation
- Progress tracking
- Error handling

#### FeedbackForm
User feedback collection form.

```typescript
interface FeedbackFormProps {
  onSubmit: (feedback: Feedback) => void;
  categories: FeedbackCategory[];
  className?: string;
}
```

**Features:**
- Category selection
- Rating system
- Text feedback
- Anonymous option
- Validation

---

### 7. Utility Components

#### LoadingSpinner
Animated loading indicator.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}
```

**Features:**
- Multiple sizes
- Custom colors
- Accessibility support
- Smooth animations

#### ErrorBoundary
Error boundary for component error handling.

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

**Features:**
- Error catching
- Custom fallback UI
- Error reporting
- Development vs production modes

#### LazyImage
Image component with lazy loading.

```typescript
interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}
```

**Features:**
- Lazy loading
- Placeholder support
- Error handling
- WebP format support
- Progressive enhancement

---

## 🎯 Icon Components

### Icon Library
10+ custom SVG icons for consistent UI.

```typescript
// Example icon component
interface ChatIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
```

**Available Icons:**
- `ChatIcon`: Chat/messaging
- `UsersIcon`: Users/people
- `MenuIcon`: Navigation menu
- `CloseIcon`: Close/dismiss
- `SendIcon`: Send message
- `DocumentTextIcon`: Documents
- `InformationCircleIcon`: Information
- `ClipboardDocumentCheckIcon`: Tasks/completion
- `BuildingLibraryIcon`: Education/school
- `ChevronDownIcon`: Expand/collapse

**Usage Example:**
```tsx
<ChatIcon 
  className="w-5 h-5" 
  size="md" 
  color="currentColor" 
/>
```

---

## 🧪 Testing Components

### Test Structure
Each component has comprehensive test coverage.

```typescript
// Example test file
describe('ChatWindow', () => {
  it('renders chat interface', () => {
    render(<ChatWindow isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('sends message on form submit', async () => {
    const mockSend = jest.fn();
    render(<ChatInput onSendMessage={mockSend} />);
    
    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    
    expect(mockSend).toHaveBeenCalledWith('Hello');
  });
});
```

### Testing Utilities
Custom testing utilities for consistent tests.

```typescript
// Test utility example
export const mockUser: StudentUser = {
  id: '1',
  name: 'Test Student',
  email: 'test@example.com',
  role: 'student',
  class: 'XII IPA 1'
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options = {}
) => {
  return render(
    <AuthProvider>
      <ChatProvider>
        {ui}
      </ChatProvider>
    </AuthProvider>,
    options
  );
};
```

---

## 📱 Responsive Design

### Breakpoint System
```css
/* Mobile-first responsive breakpoints */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
```

### Mobile Adaptations
- Touch-friendly button sizes (44px minimum)
- Swipe gestures for navigation
- Collapsible menus
- Optimized form inputs
- PWA support

### Desktop Enhancements
- Hover states
- Keyboard navigation
- Larger click targets
- Multi-column layouts
- Rich interactions

---

## 🔧 Custom Hooks

### useWebP
WebP format detection and fallback.

```typescript
const useWebP = () => {
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    setSupportsWebP(checkWebPSupport());
  }, []);

  return supportsWebP;
};
```

### useTouchGestures
Touch gesture handling for mobile.

```typescript
const useTouchGestures = (
  element: RefObject<HTMLElement>,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void
) => {
  // Touch gesture implementation
};
```

### useErrorReporting
Error reporting with Sentry integration.

```typescript
const useErrorReporting = () => {
  const reportError = useCallback((error: Error, context?: any) => {
    Sentry.captureException(error, {
      contexts: { custom: context }
    });
  }, []);

  return { reportError };
};
```

---

## 🎨 Styling Patterns

### Component Styling
Consistent styling patterns across components.

```typescript
// Style prop pattern
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Implementation
const className = cn(
  'base-styles',
  variant === 'primary' && 'primary-styles',
  variant === 'secondary' && 'secondary-styles',
  size === 'sm' && 'small-styles',
  size === 'lg' && 'large-styles',
  className
);
```

### CSS-in-JS Alternatives
Using Tailwind CSS with conditional classes.

```typescript
// Conditional styling
const buttonStyles = cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  isActive 
    ? 'bg-blue-600 text-white' 
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  disabled && 'opacity-50 cursor-not-allowed'
);
```

---

## 🚀 Performance Optimization

### Code Splitting
Components are lazy-loaded for better performance.

```typescript
// Lazy loading example
const LazyComponent = lazy(() => import('./LazyComponent'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### Memoization
Expensive components are memoized.

```typescript
const ExpensiveComponent = memo(({ data }: Props) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});
```

### Virtual Scrolling
For large lists, implement virtual scrolling.

```typescript
// Virtual scrolling implementation
const VirtualList = ({ items, itemHeight, containerHeight }: Props) => {
  // Virtual scrolling logic
};
```

---

## 🔒 Accessibility Features

### ARIA Support
All components include proper ARIA attributes.

```typescript
<button
  aria-label="Close chat window"
  aria-expanded={isOpen}
  aria-controls="chat-panel"
  onClick={onClose}
>
  <CloseIcon />
</button>
```

### Keyboard Navigation
Full keyboard navigation support.

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      onClose();
      break;
    case 'Enter':
      onSubmit();
      break;
    case 'ArrowDown':
      focusNextItem();
      break;
  }
};
```

### Screen Reader Support
Screen reader optimizations.

```typescript
// Live regions for dynamic content
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

---

## 📊 Component Metrics

### Library Statistics
- **Total Components**: 60+ components
- **Icon Components**: 10+ icons
- **Test Coverage**: 90%+ average
- **Bundle Size**: < 500KB gzipped
- **Performance**: 95+ Lighthouse scores

### Component Categories
| Category | Count | Description |
|----------|-------|-------------|
| Authentication | 3 | Login, logout, user management |
| Dashboard | 15 | Student, teacher, parent dashboards |
| Chat | 8 | AI chat interface components |
| Navigation | 6 | Header, tabs, menus |
| Forms | 7 | Input forms and validation |
| Display | 12 | Data presentation components |
| Utility | 9 | Helper and utility components |

---

## 🔗 Integration Examples

### Complete Dashboard Example
```typescript
const StudentPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return <AuthButtons />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <StudentDashboardHeader user={user} />
        <NavigationTabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'grades', label: 'Grades' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'schedule', label: 'Schedule' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <StudentDashboard user={user} activeTab={activeTab} />
      </main>
      <ChatWindow />
    </div>
  );
};
```

### Chat Integration Example
```typescript
const ChatIntegration = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, sender: 'ai' }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatWindow>
      <ChatMessages messages={messages} isTyping={isTyping} />
      <ChatInput onSendMessage={handleSendMessage} />
    </ChatWindow>
  );
};
```

---

## 🛠️ Development Guidelines

### Component Creation
When creating new components:

1. **TypeScript First**: Always define interfaces first
2. **Test-Driven**: Write tests before implementation
3. **Accessibility**: Include ARIA attributes from start
4. **Responsive**: Design mobile-first
5. **Performance**: Consider lazy loading for heavy components

### Code Style
```typescript
// Component template
interface ComponentProps {
  // Required props first
  requiredProp: string;
  // Optional props with defaults
  optionalProp?: number;
  // Event handlers
  onAction?: () => void;
  // Styling
  className?: string;
}

const Component = ({
  requiredProp,
  optionalProp = 0,
  onAction,
  className
}: ComponentProps) => {
  // Component implementation
  return (
    <div className={cn('base-styles', className)}>
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### Best Practices
- Use meaningful prop names
- Provide default values for optional props
- Include proper TypeScript types
- Write comprehensive tests
- Document complex logic
- Follow accessibility guidelines

---

## 🔗 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Backend API integration
- [Database Schema](./DATABASE_SCHEMA.md) - Data structure reference
- [Testing Guide](./TESTING_GUIDE.md) - Testing procedures and tools
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Build and deployment processes
- [Security Guide](./SECURITY_GUIDE.md) - Security best practices

---

## 📞 Support

For component-related questions:
- **Email**: frontend@ma-malnukananga.sch.id
- **Documentation**: Available in repository src/components/
- **Issues**: Report via GitHub Issues
- **Examples**: Check Storybook (planned)

---

 
*Component Library Documentation Version: 1.3.1*  
*Last Updated: 2025-11-24*  


*Component Library Documentation Version: 1.0.0*  
*Last Updated: 2025-11-24

*Total Components: 60+*  
*Test Coverage: 90%+*  
*Framework: React 18 + TypeScript*