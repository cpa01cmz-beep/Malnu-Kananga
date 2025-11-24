import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentSupport from '../StudentSupport';

declare global {
  var alert: jest.Mock;
}

// Mock window.alert
(global as any).alert = jest.fn();

// Mock the student support service
jest.mock('../../services/studentSupportService', () => ({
  studentSupportService: {
    getSupportRequests: jest.fn(() => [
      {
        id: 'REQ001',
        studentId: 'STU001',
        type: 'academic',
        category: 'math',
        priority: 'medium',
        title: 'Bantuan Matematika',
        description: 'Saya kesulitan dengan kalkulus',
        status: 'pending',
        createdAt: '2024-01-01T10:00:00Z'
      }
    ]),
    getRelevantResources: jest.fn(() => [
      {
        id: 'RES001',
        title: 'Panduan Belajar Efektif',
        type: 'guide',
        category: 'academic',
        content: 'Teknik belajar efektif',
        difficulty: 'beginner',
        tags: ['belajar', 'metode']
      }
    ]),
    getStudentProgress: jest.fn(() => ({
      studentId: 'STU001',
      academicMetrics: {
        gpa: 3.5,
        gradeTrend: 'improving',
        subjectsAtRisk: [],
        attendanceRate: 85,
        assignmentCompletion: 90
      },
      engagementMetrics: {
        loginFrequency: 5,
        resourceAccess: 10,
        supportRequests: 2,
        participationScore: 75
      },
      riskLevel: 'low',
      lastUpdated: '2024-01-01T10:00:00Z'
    })),
    createSupportRequest: jest.fn(() => ({
      id: 'REQ002',
      studentId: 'STU001',
      type: 'academic',
      category: 'physics',
      priority: 'medium',
      title: 'Bantuan Fisika',
      description: 'Saya kesulitan dengan mekanika',
      status: 'pending',
      createdAt: '2024-01-01T11:00:00Z'
    }))
  }
}));

describe('StudentSupport Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard tab by default', () => {
    render(<StudentSupport studentId="STU001" />);
    
    expect(screen.getByText('Pusat Dukungan Siswa')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Menunggu Respon')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(<StudentSupport studentId="STU001" />);
    
    // Click on requests tab
    fireEvent.click(screen.getByText('Permintaan Saya'));
    expect(screen.getByText('Permintaan Dukungan Saya')).toBeInTheDocument();
    
    // Click on resources tab
    fireEvent.click(screen.getByText('Resources'));
    expect(screen.getByText('Resources Pembelajaran')).toBeInTheDocument();
    
    // Click on progress tab
    fireEvent.click(screen.getByText('Progress'));
    expect(screen.getByText('Progress Akademik')).toBeInTheDocument();
  });

  it('displays support requests in requests tab', () => {
    render(<StudentSupport studentId="STU001" />);
    
    fireEvent.click(screen.getByText('Permintaan Saya'));
    
    expect(screen.getByText('Bantuan Matematika')).toBeInTheDocument();
    expect(screen.getByText('Saya kesulitan dengan kalkulus')).toBeInTheDocument();
    expect(screen.getByText('academic - math')).toBeInTheDocument();
  });

  it('displays resources in resources tab', () => {
    render(<StudentSupport studentId="STU001" />);
    
    fireEvent.click(screen.getByText('Resources'));
    
    expect(screen.getByText('Panduan Belajar Efektif')).toBeInTheDocument();
    expect(screen.getByText('Teknik belajar efektif')).toBeInTheDocument();
    expect(screen.getByText('#belajar')).toBeInTheDocument();
  });

  it('displays student progress in progress tab', () => {
    render(<StudentSupport studentId="STU001" />);
    
    fireEvent.click(screen.getByText('Progress'));
    
    expect(screen.getByText('3.5')).toBeInTheDocument(); // GPA
    expect(screen.getByText('85%')).toBeInTheDocument(); // Attendance
    expect(screen.getByText('90%')).toBeInTheDocument(); // Assignment completion
    expect(screen.getByText(/Tingkat Risiko:/)).toBeInTheDocument(); // Risk level
  });

  it('opens new request form when button is clicked', () => {
    render(<StudentSupport studentId="STU001" />);
    
    // Click on "Buat Permintaan Baru" button
    fireEvent.click(screen.getByText('📝 Buat Permintaan Baru'));
    
    expect(screen.getByText('Buat Permintaan Dukungan Baru')).toBeInTheDocument();
    expect(screen.getByText('Judul')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi')).toBeInTheDocument();
  });

it('creates new support request when form is submitted', async () => {
    const mockCreateRequest = jest.fn().mockReturnValue({
      id: 'REQ-001',
      studentId: 'STU001',
      type: 'academic',
      category: 'physics',
      title: 'Bantuan Fisika',
      description: 'Saya kesulitan dengan mekanika',
      priority: 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    jest.doMock('../../services/studentSupportService', () => ({
      studentSupportService: {
        createSupportRequest: mockCreateRequest,
        getSupportRequests: jest.fn().mockReturnValue([]),
        getSupportResources: jest.fn().mockReturnValue([])
      }
    }));
    
    render(<StudentSupport studentId="STU001" />);
    
    // Open new request form
    fireEvent.click(screen.getByText('📝 Buat Permintaan Baru'));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Judul permintaan'), {
      target: { value: 'Bantuan Fisika' }
    });
    fireEvent.change(screen.getByPlaceholderText('Jelaskan masalah atau bantuan yang Anda butuhkan'), {
      target: { value: 'Saya kesulitan dengan mekanika' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Kirim Permintaan'));
    
    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith({
        studentId: 'STU001',
        type: 'academic',
        category: 'physics',
        title: 'Bantuan Fisika',
        description: 'Saya kesulitan dengan mekanika',
        priority: 'medium'
      });
    }, { timeout: 10000 });
  });
    fireEvent.change(screen.getByPlaceholderText('Jelaskan masalah atau bantuan yang Anda butuhkan'), {
      target: { value: 'Saya kesulitan dengan mekanika' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Kirim Permintaan'));
    
    await waitFor(() => {
      expect(studentSupportService.createSupportRequest).toHaveBeenCalledWith(
        'STU001',
        'academic',
        'umum',
        'Bantuan Fisika',
        'Saya kesulitan dengan mekanika',
        'medium'
      );
    });
  });

  it('filters resources based on search term', () => {
    render(<StudentSupport studentId="STU001" />);
    
    fireEvent.click(screen.getByText('Resources'));
    
    // Type in search box
    fireEvent.change(screen.getByPlaceholderText('Cari resources...'), {
      target: { value: 'belajar' }
    });
    
    // Should still show the resource since it has 'belajar' tag
    expect(screen.getByText('Panduan Belajar Efektif')).toBeInTheDocument();
  });

  it('shows empty state when no requests exist', () => {
    // Mock empty requests
    const { studentSupportService } = require('../../services/studentSupportService');
    studentSupportService.getSupportRequests.mockReturnValue([]);
    
    render(<StudentSupport studentId="STU001" />);
    
    fireEvent.click(screen.getByText('Permintaan Saya'));
    
    expect(screen.getByText('Belum ada permintaan dukungan')).toBeInTheDocument();
    expect(screen.getByText('Buat permintaan baru untuk mendapatkan bantuan')).toBeInTheDocument();
  });

  it('validates form before submission', () => {
    render(<StudentSupport studentId="STU001" />);
    
    // Open new request form
    fireEvent.click(screen.getByText('📝 Buat Permintaan Baru'));
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Kirim Permintaan'));
    
    // Should show validation alert
    expect(window.alert).toHaveBeenCalledWith('Mohon lengkapi judul dan deskripsi permintaan');
  });

  it('closes modal when cancel is clicked', () => {
    render(<StudentSupport studentId="STU001" />);
    
    // Open new request form
    fireEvent.click(screen.getByText('📝 Buat Permintaan Baru'));
    
    // Click cancel
    fireEvent.click(screen.getByText('Batal'));
    
    // Modal should be closed (form should not be visible)
    expect(screen.queryByText('Buat Permintaan Dukungan Baru')).not.toBeInTheDocument();
  });
});