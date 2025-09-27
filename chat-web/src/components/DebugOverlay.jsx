import React from 'react';
import useIsMobile from '../hooks/useIsMobile';

const DebugOverlay = () => {
  const isMobile = useIsMobile();
  const [showDebug, setShowDebug] = React.useState(false);

  // Log window dimensions on mount and resize
  React.useEffect(() => {
    const logDimensions = () => {
      console.log('Window size:', {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile
      });
    };

    logDimensions();
    window.addEventListener('resize', logDimensions);
    return () => window.removeEventListener('resize', logDimensions);
  }, [isMobile]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold"
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>

      {showDebug && (
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-xs">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Window Width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</p>
          <p>isMobile: {String(isMobile)}</p>
          <p>Screen Width: {typeof window !== 'undefined' ? window.screen.width : 'N/A'}</p>
          <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default DebugOverlay;
