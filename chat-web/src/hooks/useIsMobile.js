import { useState, useEffect } from 'react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      console.log('Window width:', window.innerWidth, 'isMobile:', mobile);
      setIsMobile(mobile);
    };

    // Initial check
    handleResize();
    
    // Log when the hook is first used
    console.log('useIsMobile hook mounted');
    
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('useIsMobile hook unmounted');
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
