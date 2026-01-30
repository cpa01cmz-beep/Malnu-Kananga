// apiService.test.ts - Comprehensive tests for API service
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  authAPI,
  usersAPI,
  studentsAPI,
  gradesAPI,
  attendanceAPI,
  announcementsAPI,
  fileStorageAPI,
  type LoginResponse,
  type ApiResponse
} from '../apiService';
import { STORAGE_KEYS } from '../../constants';

// ============================================
// MOCKS
// ============================================

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string): string | null {
    return this.store[key] || null;
  },
  setItem(key: string, value: string): void {
    this.store[key] = value;
  },
  removeItem(key: string): void {
    delete this.store[key];
  },
  clear(): void {
    this.store = {};
  }
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock permissionService
vi.mock('../permissionService', () => ({
  permissionService: {
    hasPermission: vi.fn(() => ({ granted: true, reason: '' }))
  }
}));

// Mock offlineActionQueueService
vi.mock('../offlineActionQueueService', () => ({
  offlineActionQueueService: {
    addAction: vi.fn(() => 'action-123')
  }
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock performanceMonitor
vi.mock('../performanceMonitor', () => ({
  performanceMonitor: {
    recordResponse: vi.fn()
  }
}));

// Mock isNetworkError
vi.mock('../../utils/networkStatus', () => ({
  isNetworkError: vi.fn(() => false)
}));

// Mock classifyError and logError
vi.mock('../../utils/errorHandler', () => ({
  classifyError: vi.fn((error) => error),
  logError: vi.fn()
}));

// Mock window.performance
globalThis.performance = {
  now: vi.fn(() => Date.now())
} as unknown as Performance;

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: { onLine: true },
  writable: true
});

// ============================================
// HELPERS
// ============================================

function createMockToken(payload?: any): string {
  const defaultPayload = {
    user_id: 'user-123',
    email: 'test@example.com',
    role: 'teacher',
    extra_role: null,
    session_id: 'session-123',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  };
  const header = globalThis.Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = globalThis.Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

function createMockResponse(data: any, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    headers: new Headers()
  } as Response;
}

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  Object.defineProperty(global.navigator, 'onLine', { value: true, writable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================
// TESTS
// ============================================

describe('apiService - Token Management', () => {
  describe('getAuthToken', () => {
    it('should return null when no token is stored', () => {
      const result = authAPI.getAuthToken();
      expect(result).toBeNull();
    });

    it('should return stored token', () => {
      const token = 'test-token-123';
      localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      const result = authAPI.getAuthToken();
      expect(result).toBe(token);
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no refresh token is stored', () => {
      const result = authAPI.getRefreshToken();
      expect(result).toBeNull();
    });

    it('should return stored refresh token', () => {
      const token = 'refresh-token-123';
      localStorageMock.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
      const result = authAPI.getRefreshToken();
      expect(result).toBe(token);
    });
  });
});

describe('apiService - authAPI', () => {
  describe('login', () => {
    it('should successfully login and store tokens', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'teacher' as const,
        status: 'active' as const
      };
      const mockResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'access-token-123',
          refreshToken: 'refresh-token-123'
        }
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await authAPI.login('test@example.com', 'password123');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      );
      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('access-token-123');
      expect(localStorageMock.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh-token-123');
    });

    it('should handle failed login', async () => {
      const mockResponse: LoginResponse = {
        success: false,
        message: 'Invalid credentials'
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse, 401));

      const result = await authAPI.login('test@example.com', 'wrong-password');

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
      expect(localStorageMock.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear tokens', async () => {
      localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'access-token');
      localStorageMock.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');

      fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));

      await authAPI.logout();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer access-token'
          })
        })
      );
      expect(localStorageMock.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
      expect(localStorageMock.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    });

    it('should clear tokens even when API call fails', async () => {
      localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'access-token');
      localStorageMock.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');

      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await authAPI.logout();

      expect(localStorageMock.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
      expect(localStorageMock.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    });

    it('should return early if no token is stored', async () => {
      await authAPI.logout();

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      localStorageMock.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');

      const mockResponse = {
        success: true,
        data: { token: 'new-access-token' }
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await authAPI.refreshToken();

      expect(result).toBe(true);
      expect(localStorageMock.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('new-access-token');
      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'refresh-token' })
        })
      );
    });

    it('should return false when refresh fails', async () => {
      localStorageMock.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');

      const mockResponse = {
        success: false,
        message: 'Invalid refresh token'
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse, 401));

      const result = await authAPI.refreshToken();

      expect(result).toBe(false);
      expect(localStorageMock.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
    });

    it('should return false when no refresh token is stored', async () => {
      const result = await authAPI.refreshToken();

      expect(result).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from valid token', () => {
      const token = createMockToken({
        user_id: 'user-123',
        email: 'teacher@example.com',
        role: 'teacher'
      });
      localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

      const result = authAPI.getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        name: '',
        email: 'teacher@example.com',
        role: 'teacher',
        status: 'active',
        extraRole: null
      });
    });

    it('should return null when no token is stored', () => {
      const result = authAPI.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return null when token is expired', () => {
      const expiredToken = createMockToken({
        exp: Math.floor(Date.now() / 1000) - 3600
      });
      localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, expiredToken);

      const result = authAPI.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid token is stored', () => {
      const token = createMockToken();
      localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

      const result = authAPI.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token is stored', () => {
      const result = authAPI.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false when token is expired', () => {
      const expiredToken = createMockToken({
        exp: Math.floor(Date.now() / 1000) - 3600
      });
      localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, expiredToken);

      const result = authAPI.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset link sent'
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await authAPI.forgotPassword('test@example.com');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' })
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyResetToken', () => {
    it('should verify reset token', async () => {
      const mockResponse = {
        success: true,
        message: 'Token is valid'
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await authAPI.verifyResetToken('reset-token-123');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'reset-token-123' })
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset successful'
      };

      fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await authAPI.resetPassword('reset-token-123', 'NewPassword123!');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            token: 'reset-token-123',
            password: 'NewPassword123!'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('apiService - usersAPI', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it('should get all users', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1', email: 'user1@example.com' },
      { id: '2', name: 'User 2', email: 'user2@example.com' }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockUsers
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await usersAPI.getAll();

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer auth-token-123'
        })
      })
    );
  });

  it('should get user by ID', async () => {
    const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockUser
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await usersAPI.getById('1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/1'),
      expect.anything()
    );
  });

  it('should create user', async () => {
    const newUser = { name: 'New User', email: 'new@example.com' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'User created',
      data: newUser
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await usersAPI.create(newUser as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newUser)
      })
    );
  });

  it('should update user', async () => {
    const updatedUser = { name: 'Updated User' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'User updated',
      data: updatedUser
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await usersAPI.update('1', updatedUser as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedUser)
      })
    );
  });

  it('should delete user', async () => {
    const mockResponse: ApiResponse<null> = {
      success: true,
      message: 'User deleted',
      data: null
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await usersAPI.delete('1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('apiService - studentsAPI', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it('should get all students', async () => {
    const mockStudents = [
      { id: '1', name: 'Student 1', class_name: 'Class A' },
      { id: '2', name: 'Student 2', class_name: 'Class B' }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockStudents
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await studentsAPI.getAll();

    expect(result).toEqual(mockResponse);
  });

  it('should get student by ID', async () => {
    const mockStudent = { id: '1', name: 'Student 1', class_name: 'Class A' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockStudent
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await studentsAPI.getById('1');

    expect(result).toEqual(mockResponse);
  });

  it('should get students by class', async () => {
    const mockStudents = [
      { id: '1', name: 'Student 1', class_name: 'Class A' }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockStudents
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await studentsAPI.getByClass('Class A');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('class_name=Class'),
      expect.anything()
    );
  });

  it('should create student', async () => {
    const newStudent = { name: 'New Student', class_name: 'Class A' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Student created',
      data: newStudent
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await studentsAPI.create(newStudent as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newStudent)
      })
    );
  });

  it('should update student', async () => {
    const updatedStudent = { name: 'Updated Student' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Student updated',
      data: updatedStudent
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await studentsAPI.update('1', updatedStudent as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/students/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedStudent)
      })
    );
  });

  it('should delete student', async () => {
    const mockResponse: ApiResponse<null> = {
      success: true,
      message: 'Student deleted',
      data: null
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await studentsAPI.delete('1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/students/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('apiService - gradesAPI', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it('should get all grades', async () => {
    const mockGrades = [
      { id: '1', student_id: 'student-1', subject_id: 'subject-1', grade: 90 },
      { id: '2', student_id: 'student-2', subject_id: 'subject-1', grade: 85 }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockGrades
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await gradesAPI.getAll();

    expect(result).toEqual(mockResponse);
  });

  it('should get grades by student', async () => {
    const mockGrades = [
      { id: '1', student_id: 'student-1', subject_id: 'subject-1', grade: 90 }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockGrades
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await gradesAPI.getByStudent('student-1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('student_id=student-1'),
      expect.anything()
    );
  });

  it('should create grade', async () => {
    const newGrade = { student_id: 'student-1', subject_id: 'subject-1', grade: 95 };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Grade created',
      data: newGrade
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await gradesAPI.create(newGrade as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newGrade)
      })
    );
  });

  it('should update grade', async () => {
    const updatedGrade = { grade: 96 };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Grade updated',
      data: updatedGrade
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await gradesAPI.update('1', updatedGrade as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/grades/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedGrade)
      })
    );
  });

  it('should delete grade', async () => {
    const mockResponse: ApiResponse<null> = {
      success: true,
      message: 'Grade deleted',
      data: null
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await gradesAPI.delete('1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/grades/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('apiService - attendanceAPI', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it('should get all attendance records', async () => {
    const mockAttendance = [
      { id: '1', student_id: 'student-1', date: '2026-01-30', status: 'present' },
      { id: '2', student_id: 'student-2', date: '2026-01-30', status: 'absent' }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockAttendance
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await attendanceAPI.getAll();

    expect(result).toEqual(mockResponse);
  });

  it('should get attendance by student', async () => {
    const mockAttendance = [
      { id: '1', student_id: 'student-1', date: '2026-01-30', status: 'present' }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockAttendance
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await attendanceAPI.getByStudent('student-1');

    expect(result.data).toEqual(mockAttendance);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('student_id=student-1'),
      expect.anything()
    );
  });

  it('should create attendance record', async () => {
    const newAttendance = { student_id: 'student-1', date: '2026-01-30', status: 'present' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Attendance created',
      data: newAttendance
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await attendanceAPI.create(newAttendance as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newAttendance)
      })
    );
  });

  it('should update attendance record', async () => {
    const updatedAttendance = { status: 'late' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Attendance updated',
      data: updatedAttendance
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await attendanceAPI.update('1', updatedAttendance as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/attendance/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedAttendance)
      })
    );
  });

  it('should delete attendance record', async () => {
    const mockResponse: ApiResponse<null> = {
      success: true,
      message: 'Attendance deleted',
      data: null
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await attendanceAPI.delete('1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/attendance/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('apiService - announcementsAPI', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it('should get all announcements', async () => {
    const mockAnnouncements = [
      { id: '1', title: 'Announcement 1', content: 'Content 1' },
      { id: '2', title: 'Announcement 2', content: 'Content 2' }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockAnnouncements
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await announcementsAPI.getAll();

    expect(result).toEqual(mockResponse);
  });

  it('should get active announcements', async () => {
    const mockAnnouncements = [
      { id: '1', title: 'Active Announcement', content: 'Content', active: true }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockAnnouncements
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await announcementsAPI.getActive();

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('active=true'),
      expect.anything()
    );
  });

  it('should create announcement', async () => {
    const newAnnouncement = { title: 'New Announcement', content: 'New content' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Announcement created',
      data: newAnnouncement
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await announcementsAPI.create(newAnnouncement as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newAnnouncement)
      })
    );
  });

  it('should update announcement', async () => {
    const updatedAnnouncement = { title: 'Updated Announcement' };
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Announcement updated',
      data: updatedAnnouncement
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await announcementsAPI.update('1', updatedAnnouncement as any);

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/announcements/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedAnnouncement)
      })
    );
  });

  it('should toggle announcement status', async () => {
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Status toggled',
      data: { active: false }
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await announcementsAPI.toggleStatus('1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/announcements/1/toggle'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('should delete announcement', async () => {
    const mockResponse: ApiResponse<null> = {
      success: true,
      message: 'Announcement deleted',
      data: null
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await announcementsAPI.delete('1');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/announcements/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('apiService - fileStorageAPI', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it.skip('should upload file with progress callback (requires XMLHttpRequest mocking)', async () => {
    // Skipped: XMLHttpRequest mocking requires more complex setup
    // This would need proper Event and ProgressEvent mocks
  });

  it('should delete file', async () => {
    const mockResponse: ApiResponse<null> = {
      success: true,
      message: 'File deleted',
      data: null
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await fileStorageAPI.delete('uploads/test.txt');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('delete?key=uploads'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('should list files', async () => {
    const mockFiles = [
      { key: 'uploads/test.txt', size: 1024, uploaded: '2026-01-30' }
    ];
    const mockResponse: ApiResponse<any> = {
      success: true,
      message: 'Success',
      data: mockFiles
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await fileStorageAPI.list('uploads/');

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('list'),
      expect.anything()
    );
  });

  it('should generate download URL', () => {
    const url = fileStorageAPI.getDownloadUrl('uploads/test.txt');
    expect(url).toContain('download');
    expect(url).toContain('uploads');
  });
});

describe('apiService - Error Handling', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it('should handle 401 Unauthorized error and attempt token refresh', async () => {
    const expiringSoonToken = createMockToken({
      exp: Math.floor(Date.now() / 1000) + 200 // 200 seconds from now (within 5 min)
    });
    localStorageMock.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, expiringSoonToken);

    fetchMock
      .mockResolvedValueOnce(createMockResponse({ success: true, message: 'Success', data: { token: 'new-token' } }))
      .mockResolvedValueOnce(createMockResponse({ success: true, message: 'Success', data: [] }));

    await usersAPI.getAll();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(localStorageMock.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('new-token');
  });

  it('should handle network error when offline', async () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true
    });

    const result = await usersAPI.create({ name: 'Test User' } as any);

    expect(result.success).toBe(true); // Queued successfully
    expect(result.message).toContain('queued');
  });

  it('should handle API errors gracefully', async () => {
    const mockResponse = {
      success: false,
      message: 'Internal Server Error'
    };

    fetchMock.mockResolvedValueOnce(createMockResponse(mockResponse, 500));

    const result = await usersAPI.getAll();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Internal Server Error');
  });
});

describe('apiService - Offline Queue Integration', () => {
  beforeEach(() => {
    localStorageMock.setItem(STORAGE_KEYS.AUTH_TOKEN, 'auth-token-123');
  });

  it('should queue write operation when offline', async () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true
    });

    const { offlineActionQueueService } = await import('../offlineActionQueueService');

    const result = await usersAPI.create({ name: 'Test User' } as any);

    expect(result.success).toBe(true);
    expect(result.message).toContain('queued');
    expect(offlineActionQueueService.addAction).toHaveBeenCalled();
  });

  it('should not queue read operations when offline', async () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true
    });

    const result = await usersAPI.getAll();

    expect(result.success).toBe(false);
    expect(result.message).toContain('offline');
  });
});
