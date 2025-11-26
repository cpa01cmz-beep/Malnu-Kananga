import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentSupportDashboard from './StudentSupportDashboard';

describe('StudentSupportDashboard', () => {
  const mockProps = {
    studentId: 'student-123'
  };

  test('renders support dashboard', () => {
    render(<StudentSupportDashboard {...mockProps} />);
    expect(screen.getByText(/support/i)).toBeInTheDocument();
  });

  test('displays dashboard title', () => {
    render(<StudentSupportDashboard {...mockProps} />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});