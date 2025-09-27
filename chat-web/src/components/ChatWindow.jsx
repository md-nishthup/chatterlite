import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import useAudioNotification from '../hooks/useAudioNotification';
import NewMessageIndicator from './NewMessageIndicator';
import BackButton from './BackButton';
import SimpleDropdown from './SimpleDropdown';
import MessageInput from './ui/MessageInput';

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import { Video, Phone, Search, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import './ChatWindow.css';
import JitsiCall from './JitsiCall';
import usePresence from '../hooks/usePresence';
import GroupInfo from './GroupInfo';

// Add this function at the top (or import from utils if you prefer)
async function uploadImageToCloudinaryUnsigned(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_upload'); // Your unsigned preset name
  try {
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dwdvb6rp0/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    if (data.secure_url) {
      console.log('Cloudinary upload successful:', data.secure_url);
      return data.secure_url;
    } else {
      throw new Error('No secure_url returned from Cloudinary');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
  }
}

// 🔥 ChatWindow Component
const ChatWindow = ({ selectedUser, onBack = () => {} }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCall, setShowCall] = useState(false);
  const messagesEndRef = useRef(null);
  // Sound effects and notifications
  const [newMessageArrived, setNewMessageArrived] = useState(false);
  const [lastMessageSender, setLastMessageSender] = useState('');
  const audioRef = useAudioNotification(newMessageArrived);
  // Track window focus for notification logic
  const [windowFocused, setWindowFocused] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const sendAudio = useRef(null);
  const [lastKeyWasEnter, setLastKeyWasEnter] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState(0); // ms
  const [disappearingLoaded, setDisappearingLoaded] = useState(false);

  // Group chat support
  const isGroupChat = selectedUser?.type === 'group';
  const groupId = isGroupChat ? selectedUser.groupId : null;

  // For 1-to-1 chat
  const roomId = !isGroupChat && selectedUser?.uid
    ? (currentUser.uid > selectedUser.uid
      ? `${currentUser.uid}_${selectedUser.uid}`
      : `${selectedUser.uid}_${currentUser.uid}`)
    : null;

  // Add state to cache group members' info
  const [groupMembers, setGroupMembers] = useState({});

  // Fetch group members' info when in a group chat
  useEffect(() => {
    if (isGroupChat && selectedUser?.members) {
      const fetchMembers = async () => {
        const members = {};
        for (const uid of selectedUser.members) {
          if (!groupMembers[uid]) {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              members[uid] = userDoc.data();
            }
          }
        }
        setGroupMembers(prev => ({ ...prev, ...members }));
      };
      fetchMembers();
    }
    // eslint-disable-next-line
  }, [isGroupChat, selectedUser?.groupId]);

  // Fetch disappearing timer for group chat
  useEffect(() => {
    async function fetchDisappearing() {
      setDisappearingLoaded(false);
      if (isGroupChat && groupId) {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          setDisappearingTimer(groupDoc.data().disappearingTimer || 0);
        } else {
          setDisappearingTimer(0);
        }
      } else {
        setDisappearingTimer(0);
      }
      setDisappearingLoaded(true);
    }
    fetchDisappearing();
  }, [isGroupChat, groupId]);

  // 🔄 Load Messages
  useEffect(() => {
    if (isGroupChat && groupId) {
      const q = query(
        collection(db, 'groups', groupId, 'messages'),
        orderBy('timestamp')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } else if (!isGroupChat && roomId) {
      const messagesRef = collection(db, 'messages', roomId, 'chat');
      const q = query(messagesRef, orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [isGroupChat, groupId, roomId, selectedUser, currentUser]);

  // Mark messages as read when chat is opened (only for 1-to-1)
  useEffect(() => {
    if (!isGroupChat && currentUser?.uid && selectedUser?.uid) {
      const chatId = [currentUser.uid, selectedUser.uid].sort().join('_');
      const metaRef = doc(db, 'chats', chatId, 'metadata', currentUser.uid);
      setDoc(metaRef, { unreadCount: 0 }, { merge: true });
    }
  }, [isGroupChat, currentUser?.uid, selectedUser?.uid]);

  // 📨 Send Message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (isGroupChat && groupId) {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
      return;
    }
    if (!selectedUser || !selectedUser.uid) {
      alert(
        'No chat selected or user is invalid. Please select a valid user to chat with.'
      );
      return;
    }
    const messageRef = collection(db, 'messages', roomId, 'chat');
    try {
      await addDoc(messageRef, {
        text: newMessage,
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      // Enhanced error logging for debugging
      console.error('Failed to send message:', err);
      console.error('currentUser:', currentUser);
      console.error('selectedUser:', selectedUser);
      alert(
        'Failed to send message. ' +
          (err && err.message ? err.message : 'Unknown error')
      );
    }
  };

  // 🗑 Delete All Messages
  const deleteAllMessages = async () => {
    const messagesRef = collection(db, 'messages', roomId, 'chat');
    const snapshot = await getDocs(messagesRef);
    const deletions = snapshot.docs.map((docu) =>
      deleteDoc(doc(db, 'messages', roomId, 'chat', docu.id)).catch((err) => {
        console.error('Failed to delete message:', err);
      })
    );
    await Promise.all(deletions).catch((err) => {
      console.error('Failed to delete all messages:', err);
    });
  };

  // ⬇ Scroll to Bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // 📞 Handle Call (audio/video)
  const handleCall = () => {
    setShowCall(true);
  };

  useEffect(() => {
    const onFocus = () => setWindowFocused(true);
    const onBlur = () => setWindowFocused(false);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Handle new incoming messages
  useEffect(() => {
    if (!messages.length) return;
    
    const lastMsg = messages[messages.length - 1];
    
    // Only trigger for new messages that aren't from the current user
    if (lastMsg.senderId !== currentUser.uid) {
      // Set flag to trigger audio notification (handled by the useAudioNotification hook)
      setNewMessageArrived(true);
      
      // Get sender's name for the notification
      const senderName = isGroupChat 
        ? groupMembers[lastMsg.senderId]?.displayName || 'Someone'
        : selectedUser?.displayName || 'Someone';
      
      setLastMessageSender(senderName);
      
      // Show browser notification if window is not focused
      if (!windowFocused && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`${senderName} sent a message`, {
            body: lastMsg.text || 'New message',
            icon: selectedUser?.photoURL || '/logo192.png',
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
      
      // Reset the flag after a short delay
      const timer = setTimeout(() => {
        setNewMessageArrived(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, currentUser.uid, selectedUser, windowFocused, isGroupChat, groupMembers]);

  const handleAttachmentClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Group chat image upload
    if (isGroupChat && groupId) {
      if (!currentUser) {
        alert('User not logged in.');
        return;
      }
      const url = await uploadImageToCloudinaryUnsigned(file);
      if (url) {
        const messageRef = collection(db, 'groups', groupId, 'messages');
        await addDoc(messageRef, {
          type: 'image',
          imageUrl: url,
          senderId: currentUser.uid,
          timestamp: serverTimestamp(),
        });
      }
      return;
    }

    // 1-to-1 chat image upload
    if (!roomId || !currentUser || !selectedUser || !selectedUser.uid) {
      alert('No chat selected or user is invalid. Please select a chat before sending a file.');
      return;
    }
    const url = await uploadImageToCloudinaryUnsigned(file);
    if (url) {
      const messageRef = collection(db, 'messages', roomId, 'chat');
      await addDoc(messageRef, {
        type: 'image',
        imageUrl: url,
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        timestamp: serverTimestamp(),
      });
    }
  };

  // Real-time presence for selected user
  const selectedUserPresence = usePresence(selectedUser?.uid, {});
  // Track own presence and update activeChatWith
  usePresence(null, { trackSelf: true, activeChatWith: selectedUser?.uid });

  // Screenshot detection (demo: button)
  const handleScreenshot = async () => {
    if (disappearingTimer && isGroupChat && groupId) {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        text: `${currentUser.displayName || currentUser.nickname || 'A user'} took a screenshot`,
        type: 'system',
        senderId: 'system',
        timestamp: serverTimestamp(),
      });
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <NewMessageIndicator 
        show={newMessageArrived} 
        senderName={lastMessageSender} 
      />
      {/* 🔹 Header */}
      <div className="chat-header flex items-center justify-between bg-gray-100 p-3 border-b">
        {/* Mobile-only back button */}
        <div className="back-button-mobile-only" style={{ display: 'none' }}>
          <BackButton onClick={onBack} color="#232b3e" size={32} />
        </div>
        <style>{`
          @media (max-width: 768px) {
            .back-button-mobile-only { display: block !important; margin-right: 8px; }
          }
        `}</style>
        <div className="chat-username flex items-center gap-2" style={{ cursor: isGroupChat ? 'pointer' : 'default' }} onClick={() => { if (isGroupChat) setShowGroupInfo(true); }}>
          {/* Presence indicator ball and label (from real-time presence) */}
          {(() => {
            const user = selectedUserPresence || {};
            const currentUserId = currentUser.uid;
            let color = '#b3b2c0'; // gray by default
            let label = 'Offline';
            if (user.isOnline) {
              if (user.activeChatWith === currentUserId) {
                color = '#22c55e'; // green
                label = 'Active now';
              } else if (user.inApp) {
                color = '#2563eb'; // blue
                label = 'Online';
              } else {
                color = '#a259e6'; // purple
                const now = Date.now();
                const lastSeen = user.lastSeen || 0;
                const mins = Math.max(1, Math.floor((now - lastSeen) / 60000));
                label = `${mins} min ago`;
              }
            }
            return (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid #161b22',
                    marginRight: 4,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: '#b3c2e0',
                    fontWeight: 500,
                    marginRight: 8,
                  }}
                >
                  {label}
                </span>
              </>
            );
          })()}
          <img
            src={
              selectedUser.profilePic || selectedUser.photoURL || '/logo192.png'
            }
            alt={
              selectedUser.displayName || selectedUser.nickname || 'User Avatar'
            }
            className="w-9 h-9 rounded-full"
            style={{ objectFit: 'cover', width: 36, height: 36, marginLeft: 6 }}
          />
          <span className="font-semibold">
            {isGroupChat
              ? selectedUser.title || selectedUser.name || 'Group'
              : selectedUser.displayName || selectedUser.nickname || 'User'}
          </span>
        </div>
        <div className="header-actions flex items-center gap-4">
          <button
            className="header-icon-btn"
            title="Search"
            onClick={() => setShowSearch(true)}
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            className="header-icon-btn"
            title="Call"
            onClick={() => handleCall(false)}
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            className="header-icon-btn"
            title="Video Call"
            onClick={() => handleCall(true)}
          >
            <Video className="w-5 h-5" />
          </button>
          <SimpleDropdown
            trigger={
              <div className="header-icon-btn three-dots-btn" title="More">
                <MoreVertical className="w-5 h-5" />
              </div>
            }
            items={[
              ...(isGroupChat ? [{
                label: 'View Group Info',
                icon: <span role="img" aria-label="info">ℹ️</span>,
                onClick: () => setShowGroupInfo(true),
              }] : []),
              {
                label: 'Delete All Messages',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: deleteAllMessages,
                danger: true,
              },
              {
                label: 'Mute Notifications',
                icon: (
                  <span role="img" aria-label="mute">
                    🔕
                  </span>
                ),
                onClick: () => alert('Mute feature coming soon'),
              },
              {
                label: 'Block User',
                icon: (
                  <span role="img" aria-label="block">
                    🚫
                  </span>
                ),
                onClick: () => alert('Block user feature coming soon'),
              },
            ]}
          />
        </div>
      </div>

      {/* Screenshot button for demo */}
      {isGroupChat && disappearingTimer > 0 && (
        <button
          onClick={handleScreenshot}
          style={{ position: 'absolute', top: 16, right: 120, zIndex: 10, background: '#232b3e', color: '#25D366', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 700, fontSize: 15, boxShadow: '0 2px 8px #25d36633', cursor: 'pointer' }}
          title="Simulate Screenshot (demo)"
        >
          📸 
        </button>
      )}

      {/* 🔹 Messages */}
      <div className="messages flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-[var(--bg-secondary)]">
        {messages
          .filter((message) => {
            // Disappearing logic: only for group chat
            if (isGroupChat && disappearingTimer > 0 && message.timestamp) {
              const msgTime = message.timestamp.seconds ? message.timestamp.seconds * 1000 : (message.timestamp.toDate ? new Date(message.timestamp.toDate()).getTime() : 0);
              const now = Date.now();
              return now - msgTime < disappearingTimer || message.type === 'system';
            }
            return true;
          })
          .filter(
            (message) =>
              message.timestamp &&
              (message.timestamp.toDate || message.timestamp.seconds)
          )
          .map((message) => {
            const sender = isGroupChat ? groupMembers[message.senderId] : null;
            const isOwn = message.senderId === currentUser.uid;
            if (isGroupChat) {
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    marginBottom: 18,
                    gap: 10,
                  }}
                >
                  {/* Avatar for others, not for own messages */}
                  {!isOwn && sender && (
                    <img
                      src={sender.profilePic || sender.photoURL || '/logo192.png'}
                      alt={sender.nickname || sender.displayName || 'User'}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginBottom: 2 }}
                    />
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    {/* Name for others, not for own messages */}
                    {!isOwn && sender && (
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#25D366', marginBottom: 2, marginLeft: 2 }}>{sender.nickname || sender.displayName || 'User'}</span>
                    )}
                    {/* Message bubble */}
                    <div
                      className={`message ${isOwn ? 'self-end outgoing' : 'self-start incoming'}`}
                      style={{
                        margin: 0,
                        borderRadius: 16,
                        background: isOwn ? 'linear-gradient(90deg, #1f6feb 0%, #25D366 100%)' : '#232b3e',
                        color: isOwn ? '#fff' : '#e1e4e8',
                        boxShadow: isOwn ? '0 2px 8px #25d36633' : '0 2px 8px #232b3e22',
                        minWidth: 80,
                        maxWidth: '70%',
                        padding: '1rem 1.3rem',
                        fontWeight: 500,
                        fontSize: '1.08rem',
                        wordBreak: 'break-word',
                        alignItems: 'flex-start',
                      }}
                    >
                      {message.type === 'image' && message.imageUrl ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={message.imageUrl}
                            alt="Sent"
                            className="chat-image"
                            style={{
                              maxWidth: 220,
                              borderRadius: 8,
                              marginBottom: 4,
                              cursor: 'pointer',
                              border: '1.5px solid #232b3e',
                            }}
                            onClick={() => window.open(message.imageUrl, '_blank')}
                          />
                          {isOwn && (
                            <a
                              href={message.imageUrl}
                              download={`chat-image-${message.id}.png`}
                              className="chat-image-download-btn"
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: '#232b3e',
                                color: '#7ed6df',
                                border: 'none',
                                borderRadius: 6,
                                padding: '4px 10px',
                                fontSize: 12,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                opacity: 0.85,
                                zIndex: 2,
                              }}
                            >
                              Download
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="msg-content">{message.text}</span>
                      )}
                    </div>
                    {/* Time */}
                    <span className="msg-time" style={{ fontSize: 12, color: '#b3e6ff', marginTop: 4, opacity: 0.8, textAlign: isOwn ? 'right' : 'left' }}>
                      {message.timestamp && message.timestamp.toDate
                        ? new Date(message.timestamp.toDate()).toLocaleTimeString()
                        : ''}
                    </span>
                  </div>
                </div>
              );
            }
            // 1-to-1 chat fallback
            return (
              <div
                key={message.id}
                className={`message ${
                  isOwn ? 'self-end outgoing' : 'self-start incoming'
                }`}
              >
                {message.type === 'image' && message.imageUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={message.imageUrl}
                      alt="Sent"
                      className="chat-image"
                      style={{
                        maxWidth: 220,
                        borderRadius: 8,
                        marginBottom: 4,
                        cursor: 'pointer',
                        border: '1.5px solid #232b3e',
                      }}
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                    {isOwn && (
                      <a
                        href={message.imageUrl}
                        download={`chat-image-${message.id}.png`}
                        className="chat-image-download-btn"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: '#232b3e',
                          color: '#7ed6df',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                          textDecoration: 'none',
                          opacity: 0.85,
                          zIndex: 2,
                        }}
                      >
                        Download
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="msg-content">{message.text}</div>
                )}
                <div className="msg-time">
                  {message.timestamp && message.timestamp.toDate
                    ? new Date(message.timestamp.toDate()).toLocaleTimeString()
                    : ''}
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="search-modal-bg" onClick={() => setShowSearch(false)}>
          <div
            className="search-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              type="text"
              className="search-modal-input"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-modal-results">
              {messages
                .filter((m) =>
                  m.text.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((m, i) => (
                  <div key={m.id || i} className="search-modal-result">
                    <span className="search-modal-result-text">{m.text}</span>
                    <span className="search-modal-result-time">
                      {m.timestamp && m.timestamp.toDate
                        ? new Date(m.timestamp.toDate()).toLocaleString()
                        : ''}
                    </span>
                  </div>
                ))}
              {searchQuery &&
                messages.filter((m) =>
                  m.text.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="search-modal-no-result">
                    No results found.
                  </div>
                )}
            </div>
            <button
              className="search-modal-close"
              onClick={() => setShowSearch(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Input */}
      {/* Message Input Modernized */}
      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={(e)=>{ if(e && e.preventDefault) e.preventDefault(); sendMessage(e||{preventDefault:()=>{}});} }
        onAttach={handleAttachmentClick}
        autoFocus={false}
      />

      {showCall && (
        <JitsiCall
          roomName={`ChatterLiteTestRoom`}
          onClose={() => setShowCall(false)}
        />
      )}

      {/* Group Info Modal */}
      {isGroupChat && showGroupInfo && (
        <GroupInfo
          group={selectedUser}
          members={Object.entries(groupMembers).map(([id, data]) => ({ id, ...data }))}
          currentUser={currentUser}
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;