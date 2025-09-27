// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import auth
import { getFirestore } from 'firebase/firestore'; // Import Firestore

const firebaseConfig = {
  apiKey: 'AIzaSyDspFZkpvfv-7iSSejaiF9sH7uoQY8_s7U',
  authDomain: 'friends-talk-d1481.firebaseapp.com',
  projectId: 'friends-talk-d1481',
  storageBucket: 'friends-talk-d1481.appspot.com',
  messagingSenderId: '650234233409',
  appId: '1:650234233409:web:58221743e84a742870fcc0',
  measurementId: 'G-GESYGGZ9EG',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database

export { auth, db, app };
