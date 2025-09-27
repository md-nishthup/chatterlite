import React from 'react';
import './LandingPage.css';

export default function Portfolio() {
  return (
    <div className="landing-root">
      <div className="landing-topbar">
        <div className="landing-logo">ChatterLite</div>
      </div>
      <div
        className="landing-main"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: 'auto' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 16 }}>Portfolio</h1>
          <p style={{ fontSize: '1.15rem', color: '#eee' }}>
            Explore our showcase of secure chats, AI bots, and creative
            features. ChatterLite is always evolving—see what we've built and
            what's coming next!
          </p>
        </div>
      </div>
    </div>
  );
}
