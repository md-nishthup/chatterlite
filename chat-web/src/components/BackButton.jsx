import React from 'react';

const BackButton = ({ onClick, color = '#0a84ff', size = 28, ariaLabel = 'Go back' }) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        background: 'none',
        border: 'none',
        padding: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
};

export default BackButton;
