import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SignIn from './components/SignIn';
import { useAuth } from './contexts/AuthContext';
import { doc, setDoc, onSnapshot, getDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import BotSection from './components/BotSection.jsx';
import ChatToImage from './components/chattoimage.jsx';
import LandingPage from './components/LandingPage';
import AboutUs from './components/AboutUs';
import Portfolio from './components/Portfolio';
import ContactUs from './components/ContactUs';
import CompleteProfile from './components/CompleteProfile';
import Notification from './components/Notification';
import DisappearingMessages from './components/DisappearingMessages';
import ChatForNews from './components/ChatForNews.jsx';
import CosmoChat from './components/CosmoChat.jsx';

function ChatRouteWrapper({ currentUser, setSelectedUser }) {
  const { userId } = useParams();
  console.log('userId:', userId);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      setLoading(true);
      // Handle group chats
      if (userId && userId.startsWith('group-')) {
        const groupId = userId.replace('group-', '');
        const groupRef = doc(db, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          const groupData = { id: groupId, ...groupSnap.data(), type: 'group', groupId };
          if (isMounted) {
            setUser(groupData);
            setSelectedUser && setSelectedUser(groupData);
            setLoading(false);
          }
          return;
        } else {
          if (isMounted) setUser(null);
          setLoading(false);
          return;
        }
      }
      // Handle bots
      if (userId && userId.endsWith('-bot')) {
        let bot;
        if (userId === 'chatwithme-bot') {
          bot = {
            id: 'chatwithme-bot',
            displayName: 'ChatWithMe 🤖',
            photoURL: '/logo192.png',
            type: 'bot',
            uid: 'chatwithme-bot',
          };
        } else if (userId === 'cosmochat-bot') {
          bot = {
            id: 'cosmochat-bot',
            displayName: 'CosmoChat 🚀',
            photoURL: '/logo192.png',
            type: 'bot',
            uid: 'cosmochat-bot',
          };
        } else if (userId === 'chattoimage-bot') {
          bot = {
            id: 'chattoimage-bot',
            displayName: 'ChatToImage 🎨',
            photoURL: '/logo192.png',
            type: 'bot',
            uid: 'chattoimage-bot',
          };
        } else if (userId === 'chatfornews-bot') {
          bot = {
            id: 'chatfornews-bot',
            displayName: 'ChatForNews 📰',
            photoURL: '/logo192.png',
            type: 'bot',
            uid: 'chatfornews-bot',
          };
        } else if (userId === 'gameinchat-bot') {
          bot = {
            id: 'gameinchat-bot',
            displayName: 'GameInChat 🎮',
            photoURL: '/logo192.png',
            type: 'bot',
            uid: 'gameinchat-bot',
          };
        }
        console.log('Bot object:', bot);
        if (isMounted) {
          setUser(bot);
          setSelectedUser && setSelectedUser(bot);
          setLoading(false);
        }
        return;
      }
      // Handle real users
      if (userId && currentUser && userId !== currentUser.uid) {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = { id: userId, ...userSnap.data(), uid: userId };
          if (isMounted) {
            setUser(userData);
            setSelectedUser && setSelectedUser(userData);
          }
        } else {
          if (isMounted) setUser(null);
        }
      } else if (userId === currentUser?.uid) {
        // Chatting with self
        const self = {
          id: currentUser.uid,
          ...currentUser,
          uid: currentUser.uid,
        };
        setUser(self);
        setSelectedUser && setSelectedUser(self);
      }
      setLoading(false);
    }
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [userId, currentUser, setSelectedUser]);

  if (loading || !user)
    return <div style={{ color: '#fff', padding: 32 }}>Loading chat...</div>;
  if (user.type === 'bot') {
    if (user.id === 'chatwithme-bot') return <BotSection />;
    if (user.id === 'cosmochat-bot') return <CosmoChat />;
    if (user.id === 'chattoimage-bot') return <ChatToImage />;
    if (user.id === 'chatfornews-bot') return <ChatForNews />;
    // Add more bots as needed
    return <div style={{ color: '#fff', padding: 32 }}>Bot not found.</div>;
  }
  return <ChatWindow selectedUser={user} />;
}

export default function AppRoutes({
  currentUser,
  selectedUser,
  setSelectedUser,
  profileNeedsCompletion,
  profileChecked,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect after login if profile is incomplete
  useEffect(() => {
    if (
      currentUser &&
      profileChecked &&
      profileNeedsCompletion &&
      location.pathname !== '/complete-profile'
    ) {
      navigate('/complete-profile', { replace: true });
    }
  }, [
    currentUser,
    profileNeedsCompletion,
    profileChecked,
    location.pathname,
    navigate,
  ]);

  // Redirect existing users with complete profile to chat if on / or /login
  useEffect(() => {
    if (
      currentUser &&
      profileChecked &&
      !profileNeedsCompletion &&
      (location.pathname === '/' || location.pathname === '/login')
    ) {
      navigate(`/chat/${currentUser.uid}`, { replace: true });
    }
  }, [
    currentUser,
    profileChecked,
    profileNeedsCompletion,
    location.pathname,
    navigate,
  ]);

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (!profileChecked) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route
        path="/chat/:userId"
        element={
          <div className="flex h-screen min-h-0 bg-[#101624]">
            <Sidebar
              currentUser={currentUser}
              setSelectedUser={setSelectedUser}
            />
            <div className="flex-1 flex flex-col min-h-0 relative">
              <ChatRouteWrapper
                currentUser={currentUser}
                setSelectedUser={setSelectedUser}
              />
            </div>
          </div>
        }
      />
      <Route path="/group/:groupId/notifications" element={<Notification />} />
      <Route path="/group/:groupId/disappearing" element={<DisappearingMessages />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
