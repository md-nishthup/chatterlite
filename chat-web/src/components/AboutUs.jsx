import React from 'react';

export default function AboutUs() {
  return (
    <div style={styles.root}>
      <div style={styles.glowBackground}></div>

      <div style={styles.topbar}>
        <div style={styles.logo}>ChatterLite</div>
      </div>

      <div style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.heading}>About Us</h1>
          <p style={styles.paragraph}>
            ChatterLite is dedicated to providing the most secure, interactive,
            and AI-powered chat experience. Our mission is to connect people
            with privacy, fun, and intelligence at the core. Built by passionate
            developers for a new era of communication.
          </p>
        </div>
      </div>
    </div>
  );
}

// Neon color palette
const neonColor = '#0ff';
const pinkGlow = '#f0f';
const font = `'Orbitron', sans-serif`;

const styles = {
  root: {
    fontFamily: font,
    background: 'black',
    overflow: 'hidden',
    position: 'relative',
    minHeight: '100vh',
    color: '#fff',
  },

  glowBackground: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    background: `radial-gradient(circle at center, ${neonColor}20 0%, #000 70%)`,
    animation: 'rotateGlow 20s linear infinite',
    zIndex: 0,
    filter: 'blur(100px)',
  },

  topbar: {
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#111a',
    backdropFilter: 'blur(6px)',
    boxShadow: `0 0 20px ${neonColor}`,
    borderBottom: `1px solid ${neonColor}50`,
  },

  logo: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: neonColor,
    textShadow: `0 0 5px ${neonColor}, 0 0 10px ${neonColor}, 0 0 20px ${neonColor}`,
    letterSpacing: '2px',
  },

  main: {
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '4rem 1rem',
    minHeight: 'calc(100vh - 80px)',
  },

  content: {
    maxWidth: 700,
    backgroundColor: '#1119',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: `0 0 25px ${pinkGlow}`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${pinkGlow}40`,
  },

  heading: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#fff',
    textShadow: `0 0 10px ${pinkGlow}, 0 0 20px ${pinkGlow}`,
  },

  paragraph: {
    fontSize: '1.2rem',
    lineHeight: '1.8',
    color: '#ccc',
    textShadow: `0 0 6px ${neonColor}`,
  },
};

// ⬇ Add to global CSS (or inject via <style> tag)
const styleTag = document.createElement('style');
styleTag.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');

@keyframes rotateGlow {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(360deg) scale(1); }
}
`;
document.head.appendChild(styleTag);
