
import React, { useRef, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import Button from './ui/Button';

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
    <div className={`flex items-end gap-2 bg-neutral-100 dark:bg-neutral-700 rounded-xl p-2.5 border border-neutral-200 dark:border-neutral-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 shadow-sm transition-all ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 max-h-[150px] w-full min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 leading-relaxed custom-scrollbar"
      />
      <Button
        variant="primary"
        size="sm"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        icon={<SendIcon />}
        aria-label="Kirim"
      />
    </div>
  );
};

export default AutoResizeTextarea;
