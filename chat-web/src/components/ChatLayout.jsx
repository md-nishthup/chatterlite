import React, { useState, useEffect, useRef } from 'react';
import MobileBackButton from './MobileBackButton';
import useIsMobile from '../hooks/useIsMobile';

const ChatLayout = ({ children, onBack }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatSidebarWidth');
      if (stored) return parseInt(stored, 10) || 260;
    }
    return 260; // default px
  });
  const resizingRef = useRef(false);
  const isMobile = useIsMobile();
  
  // Persist sidebar width
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSidebarWidth', String(sidebarWidth));
    }
  }, [sidebarWidth]);

  // Mouse event handlers for resizing
  useEffect(() => {
    const handleMove = (e) => {
      if (!resizingRef.current) return;
      const min = 200;
      const max = 420;
      let newWidth = e.clientX; // distance from left viewport edge
      // Prevent negative / too small when mobile menu overlay open
      if (newWidth < min) newWidth = min;
      if (newWidth > max) newWidth = max;
      setSidebarWidth(newWidth);
    };
    const stopResize = () => {
      if (resizingRef.current) {
        resizingRef.current = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stopResize);
    window.addEventListener('mouseleave', stopResize);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopResize);
      window.removeEventListener('mouseleave', stopResize);
    };
  }, []);

  const startResize = (e) => {
    if (isMobile) return; // skip resize on mobile
    resizingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative select-none">
      
      {/* Mobile Back Button */}
      {isMobile && (
        <MobileBackButton onBack={handleBack} />
      )}
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed left-4 top-4 md:hidden z-50 p-2 rounded-lg bg-white shadow-md"
      >
        <svg 
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          top-0 left-0
          h-screen
          bg-white
          shadow-lg
          transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col
        `}
        style={{ width: isMobile ? 256 : sidebarWidth }}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">ChatterLite</h2>
        </div>
        <nav className="p-4">
          {/* Your navigation items here */}
          <div className="space-y-2">
            <button className="w-full p-2 rounded-lg hover:bg-gray-100 text-left">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Chats
            </button>
            <button className="w-full p-2 rounded-lg hover:bg-gray-100 text-left">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contacts
            </button>
            <button className="w-full p-2 rounded-lg hover:bg-gray-100 text-left">
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Settings
            </button>
          </div>
        </nav>
        {/* Drag handle (desktop only) */}
        {!isMobile && (
          <div
            onMouseDown={startResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            className="absolute top-0 right-0 h-full w-2 cursor-col-resize group"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(99,102,241,0.15) 50%, rgba(0,0,0,0) 100%)'
            }}
          >
            <div className="opacity-0 group-hover:opacity-70 transition-opacity w-full h-full flex items-center justify-center">
              <div className="w-[3px] h-16 rounded bg-gradient-to-b from-indigo-400 via-indigo-300 to-indigo-400 shadow" />
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: isMobile ? 0 : 0 }}>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        {/* Chat Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatLayout;
