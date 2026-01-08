
import React from 'react';

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`} aria-label="Typing indicator">
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0s]" aria-hidden="true"></span>
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" aria-hidden="true"></span>
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" aria-hidden="true"></span>
    </div>
  );
};

export default TypingIndicator;
