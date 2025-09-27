import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const NewMessageIndicator = ({ show, senderName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle show/hide with animation
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsClosing(false);
      
      // Only auto-hide if not hovered
      if (!isHovered) {
        const timer = setTimeout(() => {
          closeIndicator();
        }, 4000); // Hide after 4 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [show, isHovered]);

  const closeIndicator = () => {
    setIsClosing(true);
    // Wait for the close animation to complete
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-3 px-6 rounded-lg shadow-lg z-50 transition-all duration-300 ease-out ${
        isClosing ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      style={{
        maxWidth: 'calc(100% - 2rem)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-sm font-medium">
          New message from <span className="font-bold">{senderName}</span>
        </div>
        <button 
          onClick={closeIndicator}
          className="text-white/70 hover:text-white transition-colors p-1"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
      {!isHovered && (
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-white/30"
          style={{
            width: '100%',
            animation: 'progress 4s linear forwards',
          }}
        />
      )}
      <style jsx>{`
        @keyframes progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NewMessageIndicator;
