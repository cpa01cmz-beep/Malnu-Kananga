import React from 'react';

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18a2.25 2.25 0 012.25 2.25V20.25A2.25 2.25 0 0118 22.5h-7.5A2.25 2.25 0 016 20.25V6a2.25 2.25 0 012.25-2.25h7.5z" />
  </svg>
);