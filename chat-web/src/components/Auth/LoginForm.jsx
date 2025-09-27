import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  signInWithGoogle,
  signInWithEmailAndPassword,
} from '../../firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Checking Firebase connectivity...'); // Debug log
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase onAuthStateChanged triggered.'); // Debug log
      if (user) {
        console.log('User is logged in:', user); // Debug log
        navigate('/chat'); // Redirect to chat if user is logged in
      } else {
        console.log('No user is logged in.'); // Debug log
        setLoading(false); // Stop loading when the auth state is checked
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    console.log('Trying Google login...'); // Debug log
    try {
      await signInWithGoogle();
      console.log('Google login successful, navigating to chat...');
      navigate('/chat'); // Redirect to chat page after successful login
    } catch (err) {
      console.error('Google login failed', err); // Debug log
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    console.log('Trying to sign in with email:', email); // Debug log
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Email login successful, navigating to chat...');
      navigate('/chat');
    } catch (err) {
      console.error('Email login failed', err); // Debug log
      setError('Invalid credentials. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading message until authentication status is checked
  }

  return <h1>Hello LoginPage</h1>;
}
