import React from 'react';

const JitsiCall = ({ roomName = 'ChatterLiteTestRoom', onClose }) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(10,16,32,0.95)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
      <button
        onClick={onClose}
        style={{
          fontSize: 22,
          background: '#232b3e',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 18px',
          cursor: 'pointer',
        }}
      >
        Close Call
      </button>
    </div>
    <iframe
      src={`https://meet.jit.si/${roomName}`}
      allow="camera; microphone; fullscreen; display-capture"
      title="Jitsi Meet"
      style={{
        flex: 1,
        width: '100%',
        border: 0,
        borderRadius: '1rem',
        minHeight: 0,
      }}
      frameBorder="0"
      allowFullScreen
    />
  </div>
);

export default JitsiCall;
