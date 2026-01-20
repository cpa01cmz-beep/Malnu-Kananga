import React from 'react';

interface AssignmentIconProps {
  className?: string;
}

const AssignmentIcon: React.FC<AssignmentIconProps> = ({ className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`w-6 h-6 ${className}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 01-.123-.088M7.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 01-.714-.616A4.006 4.006 0 0111.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 00-.714-.616m-1.372 6.006l-2.5 2.5a.75.75 0 111.06-1.061l2.5-2.5a.75.75 0 01-1.061 1.06z"
      />
    </svg>
  );
};

export default AssignmentIcon;
