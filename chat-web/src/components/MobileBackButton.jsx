import React from 'react';

const MobileBackButton = ({ onBack }) => {
  return (
    <button
      className="fixed top-4 left-4 md:hidden z-[100] p-3 rounded-full bg-white shadow-lg hover:bg-gray-100 text-2xl text-blue-600 hover:text-blue-700 transition-all duration-200 flex items-center justify-center w-12 h-12"
      onClick={onBack}
      aria-label="Go back to user list"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
    </button>
  );
};

export default MobileBackButton;
