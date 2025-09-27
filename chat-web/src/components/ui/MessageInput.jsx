import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

/**
 * MessageInput Component
 * Features:
 * - Auto-expanding textarea
 * - Double-Enter to send (Shift+Enter for newline)
 * - Attachment trigger
 * - (Placeholder) Emoji & extra actions buttons
 * - Optional disabled state
 */
export default function MessageInput({
  value,
  onChange,
  onSend,
  onAttach,
  placeholder = 'Type a message... (Enter x2 to send)',
  disabled = false,
  autoFocus = false,
}) {
  const textareaRef = useRef(null);
  const [lastKeyWasEnter, setLastKeyWasEnter] = useState(false);

  // Auto expand height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (lastKeyWasEnter) {
        e.preventDefault();
        if (value.trim()) onSend();
        setLastKeyWasEnter(false);
      } else {
        setLastKeyWasEnter(true);
      }
    } else {
      setLastKeyWasEnter(false);
    }
  };

  return (
    <div className="message-input-bar">
      <button
        type="button"
        className="mi-btn ghost"
        aria-label="Add attachment"
        onClick={onAttach}
        disabled={disabled}
      >
        📎
      </button>

      <div className="mi-textarea-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
            onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="mi-textarea"
          rows={1}
          autoFocus={autoFocus}
        />
      </div>

      <button
        type="button"
        className="mi-btn primary"
        onClick={() => value.trim() && onSend()}
        disabled={disabled || !value.trim()}
      >
        ➤
      </button>
    </div>
  );
}
