// usePresence.js
import { useEffect, useState, useRef } from 'react';
import {
  getDatabase,
  ref,
  onDisconnect,
  set,
  serverTimestamp,
  onValue,
  update,
} from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { db as firestore, auth } from '../firebase';

/**
 * usePresence - React hook for robust real-time presence tracking and subscription.
 *
 * @param {string} selectedUserId - The UID of the user whose presence you want to subscribe to (for display).
 * @param {object} options - { trackSelf: boolean, activeChatWith: string|null }
 * @returns {object|null} - The selected user's real-time presence data (isOnline, lastSeen, inApp, activeChatWith)
 */
export default function usePresence(selectedUserId, options = {}) {
  const [presence, setPresence] = useState(null);
  const currentUser = auth.currentUser;
  const db = getDatabase();
  const { trackSelf = false, activeChatWith = null } = options;
  const selfPresenceRef = useRef(null);

  // Track current user's presence in Realtime DB
  useEffect(() => {
    if (!trackSelf || !currentUser) return;
    const userStatusRef = ref(db, `/presence/${currentUser.uid}`);
    selfPresenceRef.current = userStatusRef;
    // Firestore user doc (optional mirroring)
    const userDocRef = doc(firestore, 'users', currentUser.uid);
    // Track connection
    const connectedRef = ref(db, '.info/connected');
    const unsub = onValue(connectedRef, (snap) => {
      if (snap.val() === false) return;
      // On disconnect: set offline status
      onDisconnect(userStatusRef).set({
        isOnline: false,
        lastSeen: serverTimestamp(),
        inApp: false,
        activeChatWith: null,
      });
      // When connected: update presence
      set(userStatusRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        inApp: true,
        activeChatWith: activeChatWith || null,
      });
      // Optional: mirror to Firestore
      updateDoc(userDocRef, {
        isOnline: true,
        lastSeen: new Date(),
        inApp: true,
        activeChatWith: activeChatWith || null,
      }).catch(() => {});
    });
    // Listen for tab visibility (inApp)
    const handleVisibility = () => {
      update(userStatusRef, {
        inApp: !document.hidden,
        lastSeen: serverTimestamp(),
      });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      unsub();
    };
  }, [trackSelf, currentUser, activeChatWith]);

  // Update activeChatWith when changed
  useEffect(() => {
    if (!trackSelf || !currentUser) return;
    if (!selfPresenceRef.current) return;
    update(selfPresenceRef.current, { activeChatWith: activeChatWith || null });
  }, [activeChatWith, trackSelf, currentUser]);

  // Subscribe to selected user's presence
  useEffect(() => {
    if (!selectedUserId) return;
    const selectedUserPresenceRef = ref(db, `/presence/${selectedUserId}`);
    const unsub = onValue(selectedUserPresenceRef, (snapshot) => {
      setPresence(snapshot.val() || null);
    });
    return () => unsub();
  }, [selectedUserId]);

  return presence;
}
