import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import ParentDashboard from './ParentDashboard';

// Mock the parent data
jest.mock('../data/parentData', () => ({
  currentParent: {
    id: 'PAR001',
    name: 'Bapak Ahmad Rahman',
    email: 'parent@ma-malnukananga.sch.id',
    phone: '081987654321',
    address: 'Jl. Pendidikan No. 123',
    relationship: 'Ayah',
    status: 'active'
  },
  parentChildren: [
    {
      id: 'CHD001',
      name: 'Ahmad Fauzi Rahman',
      class: 'XII IPA 1',
      studentId: 'STU001',
      profileImage: 'https://example.com/photo.jpg',
      dateOfBirth: '2007-03-15',
      academicYear: '2024/2025',
      status: 'active'
    }
  ],
  assignmentsData: [
    {
      id: 'ASG001',
      title: 'Laporan Praktikum Fisika',
      description: 'Buatlah laporan praktikum gerak parabola',
      subject: 'Fisika',
      teacherName: 'Prof. Budi Santoso, M.T.',
      classId: 'CLS001',
      dueDate: '2024-10-15',
      assignedDate: '2024-10-01',
      maxScore: 100,
      status: 'assigned'
    }
  ],
  messagesData: [
    {
      id: 'MSG001',
      from: { id: 'TCH001', name: 'Dr. Siti Nurhaliza, M.Pd.', role: 'teacher' },
      to: { id: 'PAR001', name: 'Bapak Ahmad Rahman', role: 'parent' },
      subject: 'Perkembangan Akademik Ahmad Fauzi',
      content: 'Assalamualaikum Bapak Ahmad, saya ingin memberikan update...',
      timestamp: '2024-10-01T10:30:00Z',
      isRead: false,
      priority: 'normal'
    }
  ],
  academicReports: [
    {
      id: 'RPT001',
      studentId: 'STU001',
      studentName: 'Ahmad Fauzi Rahman',
      semester: 1,
      academicYear: '2024/2025',
      overallGPA: 3.8,
      attendanceRate: 95,
      subjects: [
        {
          name: 'Matematika',
          teacher: 'Dr. Siti Nurhaliza, M.Pd.',
          midtermScore: 85,
          finalScore: 88,
          assignmentScore: 82,
          attendanceScore: 90,
          finalGrade: 'A',
          gradePoint: 4.0
        }
      ],
      teacherComments: 'Ahmad Fauzi menunjukkan kemajuan yang baik',
      generatedAt: '2024-09-30'
    }
  ],
  // Add the missing helper functions that ParentDashboard component uses
  getUnreadMessages: jest.fn((messages) => messages.filter(m => !m.isRead)),
  getPendingAssignments: jest.fn((assignments) => assignments.filter(a => a.status === 'assigned' || a.status === 'overdue')),
  getUpcomingAssignments: jest.fn((assignments) => assignments.filter(a => {
    const now = new Date();
    const dueDate = new Date(a.dueDate);
    return dueDate >= now && a.status === 'assigned';
  })),
  getAssignmentStats: jest.fn((assignments) => ({
    total: assignments.length,
    submitted: assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length,
    pending: assignments.filter(a => a.status === 'assigned').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
    averageScore: 0
  }))
}));

describe('ParentDashboard Component', () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render parent dashboard with correct title', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      expect(screen.getByText('Portal Orang Tua')).toBeInTheDocument();
      expect(screen.getByText('Selamat datang, Bapak Ahmad Rahman')).toBeInTheDocument();
    });

    test('should render navigation tabs', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      expect(screen.getByText('Ringkasan')).toBeInTheDocument();
      expect(screen.getByText('Anak')).toBeInTheDocument();
      expect(screen.getByText('Tugas')).toBeInTheDocument();
      expect(screen.getByText(/Pesan/)).toBeInTheDocument();
      expect(screen.getByText('Rapor')).toBeInTheDocument();
    });

    test('should render overview tab by default', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      expect(screen.getByText('Ringkasan Akademik')).toBeInTheDocument();
      expect(screen.getByText('Anak Aktif')).toBeInTheDocument();
      expect(screen.getByText('Tugas Pending')).toBeInTheDocument();
    });

    test('should render children information in overview', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      expect(screen.getByText('Ahmad Fauzi Rahman')).toBeInTheDocument();
      expect(screen.getByText('XII IPA 1')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('should switch to children tab when clicked', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText('Anak'));
      expect(screen.getByText('Informasi Anak')).toBeInTheDocument();
    });

    test('should switch to assignments tab when clicked', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText('Tugas'));
      expect(screen.getByText('Tugas & Penilaian')).toBeInTheDocument();
      expect(screen.getByText('Laporan Praktikum Fisika')).toBeInTheDocument();
    });

    test('should switch to messages tab when clicked', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText(/Pesan/));
      expect(screen.getByText('Pesan & Komunikasi')).toBeInTheDocument();
      expect(screen.getByText('Perkembangan Akademik Ahmad Fauzi')).toBeInTheDocument();
    });

    test('should switch to reports tab when clicked', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText('Rapor'));
      expect(screen.getByText('Laporan Akademik')).toBeInTheDocument();
      expect(screen.getByText('Rapor Semester 1 - 2024/2025')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('should call onLogout when logout button is clicked', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText('Keluar'));
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    test('should display correct assignment status', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText('Tugas'));
      expect(screen.getByText('Aktif')).toBeInTheDocument();
    });

    test('should display unread message count', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      // Should show unread count in tab
      expect(screen.getByText(/Pesan \(1\)/)).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    test('should display academic report details correctly', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText('Rapor'));

      expect(screen.getByText('3.8')).toBeInTheDocument(); // GPA
      expect(screen.getByText('95%')).toBeInTheDocument(); // Attendance
      expect(screen.getByText('Matematika')).toBeInTheDocument(); // Subject
      expect(screen.getByText('A')).toBeInTheDocument(); // Grade
    });

    test('should display assignment details correctly', () => {
      render(<ParentDashboard onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByText('Tugas'));

      expect(screen.getByText('Laporan Praktikum Fisika')).toBeInTheDocument();
      expect(screen.getByText('Fisika')).toBeInTheDocument();
      expect(screen.getByText('Prof. Budi Santoso, M.T.')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // Max score
    });
  });

  describe('Responsive Design', () => {
    test('should render correctly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ParentDashboard onLogout={mockOnLogout} />);

      expect(screen.getByText('Portal Orang Tua')).toBeInTheDocument();

      // Reset viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing data gracefully', () => {
      // Mock empty data
      jest.doMock('../data/parentData', () => ({
        currentParent: {
          id: 'PAR001',
          name: 'Test Parent',
          email: 'test@example.com',
          phone: '081234567890',
          address: 'Test Address',
          relationship: 'Ayah',
          status: 'active'
        },
        parentChildren: [],
        assignmentsData: [],
        messagesData: [],
        academicReports: []
      }));

      expect(() => render(<ParentDashboard onLogout={mockOnLogout} />)).not.toThrow();
    });
  });
});