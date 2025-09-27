import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase'; // Make sure firebase.js exports the configured Firebase instance
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import usePresence from '../hooks/usePresence';

const AuthContext = createContext();

// AuthProvider wraps your app and manages authentication state
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track presence for every authenticated session
  usePresence(null, { trackSelf: !!currentUser });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Google Sign In
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error.message);
      throw error;
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context anywhere
export function useAuth() {
  return useContext(AuthContext);
}
