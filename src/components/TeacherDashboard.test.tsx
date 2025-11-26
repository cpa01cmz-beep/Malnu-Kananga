import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeacherDashboard from './TeacherDashboard';

describe('TeacherDashboard', () => {
  test('renders teacher dashboard', () => {
    render(<TeacherDashboard />);
    expect(screen.getByText('Ringkasan')).toBeInTheDocument();
  });

  test('displays teacher name', () => {
    render(<TeacherDashboard />);
    expect(screen.getByText('Dr. Siti Nurhaliza, M.Pd.')).toBeInTheDocument();
  });

  test('displays class selector', () => {
    render(<TeacherDashboard />);
    expect(screen.getByText('Pilih Kelas')).toBeInTheDocument();
  });
});