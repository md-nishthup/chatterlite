import { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { db, auth } from '../firebase'; // Use shared auth instance
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const useSignIn = () => {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const signInWithEmail = async () => {
    setIsSigningIn(true);
    try {
      if (!email.trim() || !password) {
        alert('Please fill in both fields.');
        setIsSigningIn(false);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.error('Email login error:', err.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          nickname: '',
        });
      }
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithFacebook = () => {
    alert('Facebook Sign-In not implemented yet.');
  };

  const sendResetEmail = async () => {
    if (!forgotEmail && !email) {
      setForgotMsg('Please enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, forgotEmail || email);
      setForgotMsg('Password reset email sent.');
    } catch (error) {
      setForgotMsg('Error sending reset email.');
      console.error(error);
    }
  };

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const userRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: result.user.email,
              nickname: '',
            });
          }
          navigate('/');
        }
      } catch (err) {
        console.error('Redirect login error:', err);
      }
    };
    checkRedirect();
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSigningIn,
    forgotEmail,
    setForgotEmail,
    forgotMsg,
    setForgotMsg,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    sendResetEmail,
  };
};
