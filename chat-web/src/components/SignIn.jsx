// components/SignIn.jsx
import React from 'react';
import { useSignIn } from '../hooks/useSignIn';
import { useTypingText } from '../hooks/useTypingText';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

function SignIn() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSigningIn,
    forgotEmail,
    setForgotEmail,
    forgotMsg,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    sendResetEmail,
  } = useSignIn();
  const navigate = useNavigate();

  const welcomeText = useTypingText('Welcome to Chatter Lite');
  const subtitleText = useTypingText(
    'Lets dive in to the new chatting dimension'
    
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#181a20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 90,
          height: 90,
          background:
            'radial-gradient(circle at 30% 30%, #a259e6 60%, #232b3e 100%)',
          borderRadius: '50%',
          zIndex: 1,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 80,
          width: 40,
          height: 40,
          background:
            'radial-gradient(circle at 60% 60%, #444 60%, #232b3e 100%)',
          borderRadius: '50%',
          zIndex: 1,
          opacity: 0.7,
        }}
      />
      <form
        style={{
          background: '#232b3e',
          borderRadius: 18,
          boxShadow: '0 4px 32px #0007',
          padding: '44px 32px 32px 32px',
          minWidth: 320,
          width: '100%',
          maxWidth: 350,
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <img
          src="/logo/logo.jpg"
          alt="ChatterLite Logo"
          style={{
            width: 100,
            height: 100,
            borderRadius: 16,
            marginBottom: 18,
            marginTop: -60,
            boxShadow: '0 2px 12px #0005',
          }}
        />
        <h2
          style={{
            color: '#fff',
            fontWeight: 700,
            marginBottom: 8,
            fontSize: '1.7rem',
            letterSpacing: 1,
          }}
        >
          {welcomeText}
        </h2>
        <div
          style={{
            color: '#b3c2e0',
            marginBottom: 24,
            fontSize: 15,
            minHeight: 22,
          }}
        >
          {subtitleText}
        </div>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1.5px solid #444',
            background: '#181a20',
            color: '#fff',
            marginBottom: 12,
            fontSize: 15,
            outline: 'none',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1.5px solid #444',
            background: '#181a20',
            color: '#fff',
            marginBottom: 18,
            fontSize: 15,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={signInWithEmail}
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #a259e6 0%, #ff5e13 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 10,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0005',
          }}
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Signing in...' : 'Sign In'}
        </button>
        <div
          style={{
            color: '#b3c2e0',
            margin: '10px 0 8px 0',
            fontSize: 13,
          }}
        >
          or
        </div>
        <button
          type="button"
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            background: '#4285F4',
            color: '#fff',
            border: '1.5px solid #a259e6',
            borderRadius: 8,
            padding: '10px 0',
            marginBottom: 12,
            fontWeight: 500,
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s',
          }}
          disabled={isSigningIn}
        >
          <span style={{ fontSize: 20 }}>G</span> Continue with Google
        </button>
       
        <button
          type="button"
          onClick={signInWithFacebook}
          style={{
            width: '100%',
            background: '#232b3e',
            color: '#fff',
            border: '1.5px solid #a259e6',
            borderRadius: 8,
            padding: '10px 0',
            marginBottom: 18,
            fontWeight: 500,
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s',
          }}
          disabled={isSigningIn}
        >
          <span style={{ fontSize: 20 }}>f</span> Continue with Facebook
        </button>
        <div
          style={{
            color: '#b3c2e0',
            fontSize: 13,
            marginTop: 8,
          }}
        >
          don't have an account?{' '}
          <span
            style={{
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            onClick={() => navigate('/register')}
          >
            Create a account.
          </span>
        </div>
        <div
          style={{
            color: '#b3c2e0',
            fontSize: 13,
            marginTop: 4,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          onClick={sendResetEmail}
        >
          Forgot password?
        </div>
        {forgotMsg && (
          <div
            style={{
              color: '#8fbc8f',
              fontSize: 13,
              marginTop: 8,
            }}
          >
            {forgotMsg}
          </div>
        )}
      </form>
    </div>
  );
}

export default SignIn;
