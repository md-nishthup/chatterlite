// src/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  where,
  increment,
} from 'firebase/firestore';

// --- 🔧 Firebase Configuration (env driven) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// --- 🚀 Initialize ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- 🔐 Google Sign-In ---
const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, 'users', user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return user;
};

// --- 🔄 Listen to Auth Changes ---
const listenToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// --- 🚪 Sign Out ---
const signOutUser = async () => {
  await signOut(auth);
};

// --- 👥 Fetch All Users (except current user) ---
const getUsers = async (currentUser) => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  return usersSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((user) => user.id !== currentUser.uid);
};

// --- 🏠 Get All Rooms ---
const getRooms = async () => {
  const roomsSnapshot = await getDocs(collection(db, 'rooms'));
  return roomsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// --- 💬 Send Message to Room ---
const sendMessageToRoom = async (roomId, text, user) => {
  if (!text.trim()) return;

  await addDoc(collection(db, 'rooms', roomId, 'messages'), {
    text,
    createdAt: serverTimestamp(),
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
  });
};

// --- 🔁 Send 1-to-1 Message ---
const sendMessage = async (senderId, receiverId, messageText) => {
  const chatId = [senderId, receiverId].sort().join('_');
  const messagesRef = collection(db, 'chats', chatId, 'messages');

  try {
    await addDoc(messagesRef, {
      text: messageText,
      senderId,
      receiverId,
      timestamp: serverTimestamp(),
    });
    // Update metadata for receiver
    const receiverMetaRef = doc(db, 'chats', chatId, 'metadata', receiverId);
    await setDoc(
      receiverMetaRef,
      {
        unreadCount: increment(1),
        lastMessage: messageText,
        lastTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
    // Update metadata for sender (reset unreadCount)
    const senderMetaRef = doc(db, 'chats', chatId, 'metadata', senderId);
    await setDoc(
      senderMetaRef,
      {
        unreadCount: 0,
        lastMessage: messageText,
        lastTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// --- 🔔 Real-time Listener for Messages ---
const listenForMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// --- 🆔 Generate Chat ID ---
const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

// --- ✅ Exports ---
export {
  app,
  auth,
  db,
  signInWithGoogle,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOutUser,
  listenToAuthChanges,
  getUsers,
  getRooms,
  sendMessageToRoom,
  sendMessage,
  listenForMessages,
  getChatId,
};
