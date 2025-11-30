
import React, { useRef, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Ketik pesan...",
  disabled = false,
  className = ""
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`; // Grow up to 150px
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-3xl p-2 border border-transparent focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 max-h-[150px] w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 leading-relaxed custom-scrollbar"
        style={{ minHeight: '44px' }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="p-3 mb-1 bg-green-600 text-white rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition-colors shadow-sm flex-shrink-0"
        aria-label="Kirim"
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default AutoResizeTextarea;
