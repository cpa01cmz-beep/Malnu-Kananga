
import React from 'react';

export const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-4.5 6.01 6.01 0 0 0-3 0 6.01 6.01 0 0 0 1.5 4.5ZM13.5 6.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM7.5 15a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.281-.723 3.311-.266.588.163 1.25.806 1.25h4.333c.643 0 1.072-.662.806-1.25-.463-1.03-.723-2.16-.723-3.311A2.25 2.25 0 0 1 16.5 15m-9 0h9" />
  </svg>
);
