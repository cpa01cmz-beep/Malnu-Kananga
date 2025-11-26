import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentProgressMonitor from './StudentProgressMonitor';

describe('StudentProgressMonitor', () => {
  const mockProps = {
    studentId: 'student-123',
    studentName: 'Test Student'
  };

  test('renders student progress monitor', () => {
    render(<StudentProgressMonitor {...mockProps} />);
    expect(screen.getByText('📊 Monitoring Progress Siswa')).toBeInTheDocument();
  });

  test('displays academic metrics', () => {
    render(<StudentProgressMonitor {...mockProps} />);
    expect(screen.getByText('📚 Metrik Akademis')).toBeInTheDocument();
  });
});