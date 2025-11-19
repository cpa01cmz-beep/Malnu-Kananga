import React from 'react';
import StudentSupport from '../components/StudentSupport';

const StudentSupportPage: React.FC = () => {
  // Mock student ID - in real app, this would come from authentication
  const studentId = 'STU001';

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSupport studentId={studentId} />
    </div>
  );
};

export default StudentSupportPage;