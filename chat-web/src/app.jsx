import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import AppRoutes from './AppRoutes';
import { useLocation } from 'react-router-dom';

function App() {
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileNeedsCompletion, setProfileNeedsCompletion] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const location = useLocation();

  // 🧠 Check profile (nickname setup)
  useEffect(() => {
    if (!currentUser) {
      setProfileNeedsCompletion(false);
      setProfileChecked(true);
      return;
    }

   

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (userDoc) => {
      if (!userDoc.exists() || !userDoc.data().nickname) {
        if (!userDoc.exists()) {
          setDoc(userRef, { email: currentUser.email, nickname: '' });
        }
        setProfileNeedsCompletion(true);
      } else {
        setProfileNeedsCompletion(false);
      }
      setProfileChecked(true);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 🧼 Optional layout cleanup
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.removeAttribute('style');
      const child = root.firstElementChild;
      if (child) child.removeAttribute('style');
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#10182a',
      }}
    >
      <AppRoutes
        currentUser={currentUser}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        profileNeedsCompletion={profileNeedsCompletion}
        profileChecked={profileChecked}
        location={location}
      />
    </div>
  );
}

export default App;
