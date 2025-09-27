import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const images = [
  '/Welcome-to-C-hatter-L-ite/ChatGPT Image May 19, 2025, 10_48_25 AM.png',
  '/Welcome-to-C-hatter-L-ite/2_Seamless-Messaging.png',
  '/Welcome-to-C-hatter-L-ite/3_Experience-Authentic-Bots.png',
  '/Welcome-to-C-hatter-L-ite/4_Other-interactive-features.png',
  '/Welcome-to-C-hatter-L-ite/5_Mood-guesser.png',
  '/Welcome-to-C-hatter-L-ite/6_Crystal-Clear-Voice-and-Video-Calls.png',
  '/Welcome-to-C-hatter-L-ite/7_Channels-for-Focused-Discussions.png',
  '/Welcome-to-C-hatter-L-ite/8_Stories-Share-Your-Moments.png',
  '/Welcome-to-C-hatter-L-ite/9_Privacy-First-Design.png',
  '/Welcome-to-C-hatter-L-ite/10_Join-the-ChatterLite-Community.png',
];

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-root">
      {/* Neonwave Hero Section */}
      <header>
        <div className="logo">ChatterLite (Prototype)</div>
        <br />
        <p>version 1.o soon</p>
        <nav>
          <a href="./chat-web/src/components/Portfolio.jsx">Home</a>
          <a href="#">Features</a>
          <a href="./chat-web/src/components/AboutUs.jsx">About</a>
        </nav>
      </header>

      <section className="hero">
        <div className="glow-ring"></div>
        <div className="hero-left">
          <h1>Welcome to the Future chatter app </h1>
          <p>
            Experience the next generation of design. Smooth. Fast. Visually
            stunning, user-friendly, and secure. ChatterLite is the ultimate
            chat app for everyone. Whether you're a casual user or a business.
          </p>
          <button onClick={() => navigate('/login')}>Get Started</button>
        </div>
        <div className="hero-right">
          <div className="slideshow-frame">
            <img
              src={images[current]}
              alt="ChatterLite Slide"
              className="slideshow-img"
            />
            <div className="slideshow-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === current ? 'active' : ''}`}
                  onClick={() => setCurrent(idx)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer>&copy; 2025 Neonwave Inc. All rights reserved.</footer>

     
    </div>
  );
}
