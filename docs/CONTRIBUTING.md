# 📚 CONTRIBUTING Guide - MA Malnu Kananga

## 🌟 Overview

Panduan kontribusi untuk pengembang dan kontributor yang ingin berpartisipasi dalam pengembangan portal MA Malnu Kananga. Guide ini mencakup proses kontribusi, standar kode, dan workflow development.

---

## 🤋 Cara Berkontribusi

### 1. Setup Development Environment

```bash
# Fork repository
https://github.com/sulhi/ma-malnu-kananga/fork

# Clone fork Anda
git clone https://github.com/YOUR_USERNAME/ma-malnu-kananga.git
cd ma-malnu-kananga

# Tambahkan upstream repository
git remote add upstream https://github.com/sulhi/ma-malnu-kananga.git

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan API_KEY Anda
```

### 2. Pilih Issue atau Buat Issue Baru

- **Cari existing issue**: Cek [Issues](https://github.com/sulhi/ma-malnu-kananga/issues)
- **Buat issue baru**: Gunakan template yang tersedia
- **Label issue**: Pilih label yang sesuai (bug, enhancement, documentation)

### 3. Buat Branch untuk Fitur/Perbaikan

```bash
# Sync dengan main branch
git checkout main
git pull upstream main

# Buat branch baru
git checkout -b feature/nama-fitur
# atau
git checkout -b fix/perbaikan-bug
```

### 4. Development & Testing

```bash
# Start development server
npm run dev -- --port 9000

# Run tests
npm run test

# Run test coverage
npm run test:coverage

# Code quality checks
npm run lint
npm run type-check
```

### 5. Commit Changes

Gunakan [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Feature addition
git commit -m "feat: tambah fitur AI chat untuk student support"

# Bug fix
git commit -m "fix: perbaiki login modal environment variable handling"

# Documentation
git commit -m "docs: update API documentation dengan endpoint baru"

# Breaking change
git commit -m "feat!: change authentication flow to magic link only"
```

### 6. Push dan Create Pull Request

```bash
# Push ke fork Anda
git push origin feature/nama-fitur

# Buat Pull Request via GitHub
# 1. Kunjungi repository Anda di GitHub
# 2. Click "New Pull Request"
# 3. Isi template PR dengan lengkap
```

---

## 📝 Pull Request Template

### Judul PR
Gunakan format yang jelas dan deskriptif:
- `feat: Add student support AI categorization`
- `fix: Resolve authentication timeout issues`
- `docs: Update deployment guide with Cloudflare Pages`

### Deskripsi PR

```markdown
## 📋 Description
Deskripsi singkat dan jelas tentang perubahan yang dibuat.

## 🎯 Type of Change
- [ ] Bug fix (non-breaking change yang memperbaiki issue)
- [ ] New feature (non-breaking change yang menambah fitur)
- [ ] Breaking change (fix atau feature yang menyebabkan breaking change)
- [ ] Documentation update

## ✅ Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing completed

## 📸 Screenshots (jika applicable)
Tambahkan screenshots untuk UI changes.

## 🔗 Related Issues
Closes #123
Related to #456

## 📝 Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Ready for review
```

---

## 🎨 Code Style Guidelines

### TypeScript/JavaScript Standards

```typescript
// ✅ Good: Gunakan explicit types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'parent';
}

const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// ❌ Bad: Menggunakan any types
const getUserData = async (userId: any): Promise<any> => {
  // implementation
};
```

### React Component Standards

```tsx
// ✅ Good: Functional component dengan hooks
interface StudentDashboardProps {
  studentId: string;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentId,
  onLogout
}) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentGrades(studentId)
      .then(setGrades)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <GradeList grades={grades} />
      <LogoutButton onClick={onLogout} />
    </div>
  );
};

export default StudentDashboard;
```

### CSS/Tailwind Guidelines

```tsx
// ✅ Good: Responsive design dengan Tailwind
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 text-sm">
      {description}
    </p>
  </div>
</div>

// ❌ Bad: Inline styles dan non-responsive
<div style={{ display: 'grid', gap: '16px', padding: '16px' }}>
  <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
    {/* content */}
  </div>
</div>
```

---

## 🧪 Testing Guidelines

### Unit Testing

```typescript
// ✅ Good: Comprehensive unit test
describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestMagicLink', () => {
    it('should send magic link request successfully', async () => {
      const mockEmail = 'student@example.com';
      const mockResponse = { success: true };
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authService.requestMagicLink(mockEmail);

      expect(fetch).toHaveBeenCalledWith('/api/request-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mockEmail })
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(authService.requestMagicLink('test@example.com'))
        .rejects.toThrow('Network error');
    });
  });
});
```

### Integration Testing

```typescript
// ✅ Good: Integration test untuk API endpoints
describe('Chat API Integration', () => {
  it('should handle AI chat request end-to-end', async () => {
    const testMessage = 'Apa saja program unggulan sekolah?';
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testMessage })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('response');
    expect(data.response).toContain('program unggulan');
  });
});
```

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Modal, etc.)
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── pages/               # Page components
├── services/            # Business logic & API calls
│   ├── api/            # API service layer
│   └── auth/           # Authentication services
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── data/                # Static data & mock data
└── __tests__/           # Test files
```

### File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `StudentDashboard.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useAuth.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Types**: `camelCase.ts` (e.g., `userTypes.ts`)
- **Tests**: `componentName.test.tsx` (e.g., `StudentDashboard.test.tsx`)

---

## 🔧 Development Workflow

### 1. Setup Git Hooks

```bash
# Install husky untuk git hooks
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"

# Setup commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

### 2. Branch Naming Conventions

- `feature/nama-fitur` - untuk fitur baru
- `fix/deskripsi-bug` - untuk perbaikan bug
- `docs/update-documentasi` - untuk update dokumentasi
- `refactor/nama-refactor` - untuk refactoring
- `hotfix/perbaikan-critical` - untuk hotfix production

### 3. Commit Message Format

Gunakan Conventional Commits:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: Fitur baru
- `fix`: Perbaikan bug
- `docs`: Perubahan dokumentasi
- `style`: Perubahan formatting (tidak mengubah kode)
- `refactor`: Perubahan kode yang tidak menambah fitur atau memperbaiki bug
- `test`: Menambah atau memperbaiki tests
- `chore`: Perubahan build process atau dependency management

**Examples:**
```bash
feat(auth): add magic link authentication
fix(chat): resolve AI response timeout
docs(api): update authentication endpoints
refactor(components): extract common button component
test(student): add dashboard integration tests
```

---

## 🚀 Deployment Process

### 1. Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code coverage minimum 80%
- [ ] No console errors in production build
- [ ] Environment variables validated
- [ ] Documentation updated
- [ ] Performance benchmarks met

### 2. Build Process

```bash
# Build untuk production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

### 3. Deployment Commands

```bash
# Deploy ke Cloudflare Workers
wrangler deploy

# Deploy frontend ke Cloudflare Pages
wrangler pages deploy dist --compatibility-date=2024-01-01

# Seed vector database (jika diperlukan)
curl https://your-worker-url.workers.dev/seed
```

---

## 📊 Code Review Process

### Reviewer Guidelines

1. **Functionality**: Apakah kode berfungsi sesuai expected?
2. **Performance**: Apakah ada potensi performance issues?
3. **Security**: Apakah ada security vulnerabilities?
4. **Maintainability**: Apakah kode mudah dipahami dan maintain?
5. **Testing**: Apakah tests mencukupi?
6. **Documentation**: Apakah dokumentasi sudah update?

### Review Response Templates

**Approval:**
```markdown
✅ LGTM! Changes look good.

- [x] Functionality verified
- [x] Tests passing
- [x] Documentation updated
- [x] Ready to merge
```

**Request Changes:**
```markdown
🔄 Review Feedback

### Required Changes:
1. **Security**: Add input validation untuk user input
2. **Performance**: Optimize API call dengan caching
3. **Testing**: Add unit tests untuk new function

### Suggestions:
- Consider using React.memo untuk component optimization
- Add error boundaries untuk better error handling
```

---

## 🔍 Debugging Guidelines

### Common Issues & Solutions

**1. Environment Variable Issues**
```bash
# Check environment variables
echo $API_KEY
echo $NODE_ENV

# Test API key
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY"
```

**2. Build Issues**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit

# Check ESLint errors
npx eslint src/ --ext .ts,.tsx
```

**3. Testing Issues**
```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm test -- StudentDashboard.test.tsx

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📚 Resources & References

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)

### Tools & Extensions
- **VS Code Extensions**:
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense
  - GitLens

---

## 🏆 Recognition Program

### Contributor Types
- **Code Contributors**: Submit PR dengan code changes
- **Documentation Contributors**: Improve documentation
- **Bug Reporters**: Report bugs dengan detail reproduksi
- **Feature Requesters**: Submit well-defined feature requests

### Recognition
- **Contributor List**: Di-mention di README.md
- **Release Notes**: Kontributor di-mention di changelog
- **Community Recognition**: Highlight di newsletter atau social media

---

## 📞 Support & Communication

### Getting Help
- **GitHub Issues**: Untuk bug reports dan feature requests
- **GitHub Discussions**: Untuk pertanyaan dan diskusi
- **Email**: dev@ma-malnukananga.sch.id untuk technical support

### Code of Conduct
Kami berkomitmen untuk menjaga komunitas yang inklusif dan respectful. Harap membaca [Code of Conduct](./CODE_OF_CONDUCT.md) sebelum berpartisipasi.

---

## ✅ Contribution Checklist

### Before Submitting PR
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests passing
- [ ] Build successful
- [ ] Manual testing completed

### After PR Submission
- [ ] Respond to review feedback promptly
- [ ] Make requested changes
- [ ] Keep PR description updated
- [ ] Ensure CI/CD checks pass

---

**📚 CONTRIBUTING Guide - MA Malnu Kananga**

*Building better education technology together*

---

*Guide Version: 1.2.0*  
*Last Updated: November 23, 2025*  
*Maintained by: MA Malnu Kananga Development Team*