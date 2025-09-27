import React, { useEffect, useState, useRef } from 'react';
import { getUsers, auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaPalette, FaNewspaper, FaGamepad } from 'react-icons/fa';
import { FiSidebar } from 'react-icons/fi';
import { collection, doc, onSnapshot, setDoc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import './Sidebar.css';
import ProfileImageUploader from './ProfileImageUploader';

export default function Sidebar({ currentUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('chats'); // chats, groups, bots
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [newProfilePicUrl, setNewProfilePicUrl] = useState('');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [themeCategory, setThemeCategory] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupStep, setGroupStep] = useState(1);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupType, setGroupType] = useState('public');
  const [showGroupProfile, setShowGroupProfile] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [groupMenuAnchor, setGroupMenuAnchor] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);

  // Update styles for dark mode
  const accentGreen = '#25D366';
  const sidebarBg = '#181f2f';
  const groupItemBg = '#232b3e';
  const groupItemHover = '#222c36';
  const borderColor = '#232b3e';
  const textColor = '#e1e4e8';
  const fabStyle = {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: accentGreen,
    color: '#181f2f',
    fontSize: 32,
    border: 'none',
    boxShadow: '0 2px 8px #25d36633',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'background 0.18s',
  };
  const modalStyle = {
    background: '#232b3e',
    padding: 32,
    borderRadius: 16,
    minWidth: 320,
    maxWidth: 400,
    boxShadow: '0 4px 32px #0006',
    border: `1.5px solid ${borderColor}`,
  };
  const inputStyle = {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    border: `1.5px solid ${borderColor}`,
    background: '#181f2f',
    color: textColor,
    fontWeight: 500,
    fontSize: '1.05rem',
  };
  const btnStyle = {
    background: accentGreen,
    color: '#181f2f',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontWeight: 600,
    fontSize: '1.05rem',
    marginRight: 8,
    cursor: 'pointer',
    transition: 'background 0.18s',
  };
  const cancelBtnStyle = {
    ...btnStyle,
    background: '#232b3e',
    color: textColor,
    border: `1.5px solid ${borderColor}`,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers(currentUser);
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [currentUser]);

  // Real-time listen for chat metadata (unreadCount, lastMessage)
  useEffect(() => {
    if (!currentUser?.uid || users.length === 0) return;
    const unsubscribes = users.map((user) => {
      if (!user.id) return null;
      const chatId = [currentUser.uid, user.id].sort().join('_');
      const metaRef = doc(db, 'chats', chatId, 'metadata', currentUser.uid);
      return onSnapshot(metaRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    unreadCount: data.unreadCount || 0,
                    lastMessage: data.lastMessage || '',
                  }
                : u
            )
          );
        }
      });
    });
    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [users.length, currentUser?.uid]);

  // Fetch groups where current user is a member
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUserGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSelectUser = (user) => {
    if (setSelectedUser) {
      // Always provide a uid property for ChatWindow compatibility
      const userWithUid = { ...user, uid: user.uid || user.id };
      setSelectedUser(userWithUid);
    }
    if (user && user.id) {
      navigate(`/chat/${user.id}`); // Navigate to chat route
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to landing page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setNewProfilePicUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    // For demo: just update nickname and profilePicUrl in Firestore
    try {
      if (currentUser && (newNickname.trim() || newProfilePicUrl)) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userRef,
          {
            ...(newNickname.trim() && { nickname: newNickname.trim() }),
            ...(newProfilePicUrl && { profilePic: newProfilePicUrl }),
          },
          { merge: true }
        );
      }
      setShowEditProfile(false);
      setShowSettings(false);
    } catch (e) {
      alert('Error updating profile');
    }
  };

  // Filter users by search term (nickname or displayName)
  const filteredUsers = users.filter((user) => {
    const name = (user.displayName || user.nickname || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const createGroup = async () => {
    if (!newGroupName.trim() || selectedFriends.length === 0) return;
    const groupData = {
      title: newGroupName,
      type: groupType, // 'public', 'private', 'secret'
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid,
      members: [currentUser.uid, ...selectedFriends],
      admins: [currentUser.uid],
      description: '',
      visibility: groupType,
    };
    try {
      await addDoc(collection(db, 'groups'), groupData);
      closeGroupModal();
    } catch (e) {
      alert('Error creating group: ' + e.message);
    }
  };

  // Helper for toggling friend selection
  const toggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Reset modal state on open/close
  const openGroupModal = () => {
    setShowModal(true);
    setGroupStep(1);
    setNewGroupName('');
    setSelectedFriends([]);
    setGroupType('public');
  };
  const closeGroupModal = () => {
    setShowModal(false);
    setGroupStep(1);
    setNewGroupName('');
    setSelectedFriends([]);
    setGroupType('public');
  };

  return (
    <div
      className="sidebar custom-sidebar"
      style={{ overflowX: 'hidden', maxWidth: '100vw', position: 'relative' }}
    >
      {/* Sidebar icon with sign out dropdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px 0 16px',
        }}
      >
        <div className="sidebar-icon-dropdown" style={{ position: 'relative' }}>
          <FiSidebar
            style={{
              fontSize: 28,
              color: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => setShowMenu((v) => !v)}
            title="Sidebar menu"
          />
          {showMenu && (
            <div
              className="sidebar-settings-menu"
              style={{
                position: 'absolute',
                left: 0,
                top: 36,
                background: '#232b3e',
                borderRadius: 8,
                boxShadow: '0 2px 12px #0006',
                zIndex: 10,
              }}
            >
              <div
                className="sidebar-settings-menu-item"
                role="button"
                tabIndex={0}
                onClick={handleSignOut}
                onKeyDown={(e) => e.key === 'Enter' && handleSignOut()}
                style={{
                  color: '#ff5e13',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
        <span style={{ flex: 1 }} />
      </div>
      <div
        className="sidebar-tabs"
        style={{
          display: 'flex',
          gap: 8,
          padding: '8px 12px',
          background: '#151c2c',
          borderBottom: '1px solid #232b3e',
        }}
      >
        <button
          className={`sidebar-tab${activeTab === 'chats' ? ' active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          <FiSidebar
            style={{ marginRight: 6, fontSize: 18, verticalAlign: 'middle' }}
          />
          Chats
        </button>
        <button
          className={`sidebar-tab${activeTab === 'groups' ? ' active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </button>
        <button
          className={`sidebar-tab${activeTab === 'bots' ? ' active' : ''}`}
          onClick={() => setActiveTab('bots')}
        >
          Bots <FaRobot style={{ marginLeft: 4 }} />
        </button>
      </div>
      {activeTab === 'chats' && (
        <>
          <div
            className="sidebar-header searchbar-row"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Only one 3-dots button, always visible */}
            <button
              className="sidebar-settings-btn"
              style={{
                marginLeft: 6,
                display: 'flex',
                alignItems: 'center',
                fontSize: 22,
                color: '#fff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setShowSettings(true)}
              title="More options"
            >
              <span
                className="dots-icon"
                style={{ fontSize: 22, color: '#fff' }}
              >
                &#8942;
              </span>
            </button>
          </div>
          <ul className="sidebar-user-list">
            {filteredUsers.map((user) => {
              const isUnread = user.unreadCount > 0;
              const avatarUrl =
                user.profilePic || user.photoURL || '/logo192.png';
              // Presence indicator logic
              let presenceColor = null;
              let showPresence = false;
              if (user.status === 'chat') {
                presenceColor = '#22c55e'; // green
                showPresence = true;
              } else if (user.status === 'online') {
                presenceColor = '#2563eb'; // blue
                showPresence = true;
              } else if (user.status === 'away' && user.lastActive) {
                // Only show away if lastActive within 30 min
                const mins = Math.round((Date.now() - user.lastActive) / 60000);
                if (mins <= 30) {
                  presenceColor = '#a259e6'; // purple
                  showPresence = true;
                }
              }
              // Typing indicator
              const isTyping = !!user.typing;
              return (
                <li
                  key={user.id}
                  className="user-item"
                  onClick={() => handleSelectUser(user)}
                >
                  <div
                    style={{ position: 'relative', display: 'inline-block' }}
                  >
                    <img
                      src={avatarUrl}
                      alt={user.displayName || user.nickname || 'User Avatar'}
                      className="avatar"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(avatarUrl, '_blank');
                      }}
                    />
                    {showPresence && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: presenceColor,
                          border: '2px solid #161b22',
                          boxShadow: '0 0 0 2px #232b3e',
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-name">
                      {user.nickname || user.displayName || 'User'}
                    </span>
                    <span
                      className={`user-last-message ${
                        isUnread ? 'unread-message' : 'read-message'
                      }`}
                      style={{
                        fontWeight: isUnread ? 700 : 400,
                        color: isUnread
                          ? 'var(--accent, #1f6feb)'
                          : 'var(--text-secondary, #8b949e)',
                      }}
                    >
                      {isTyping ? (
                        <span
                          style={{
                            color: '#22c55e',
                            fontWeight: 600,
                            opacity: 0.85,
                            animation: 'fadeTyping 1.2s infinite',
                          }}
                        >
                          typing...
                        </span>
                      ) : (
                        user.lastMessage || ''
                      )}
                    </span>
                  </div>
                  {user.unreadCount > 0 && (
                    <span className="unread-badge">{user.unreadCount}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
      {activeTab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: sidebarBg, borderRight: `1.5px solid ${borderColor}` }}>
          <div style={{ padding: '12px 16px', borderBottom: `1.5px solid ${borderColor}`, background: '#fafafa' }}>
            <input
              type="text"
              placeholder="Search public groups"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, background: '#232b3e', border: 'none', color: '#e1e4e8', boxShadow: 'none', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
            <div style={{ fontWeight: 700, fontSize: '1.08rem', margin: '8px 0 8px 18px', color: accentGreen }}>Your Groups</div>
            {userGroups.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 40, fontWeight: 500, fontSize: '1.05rem' }}>
                You're not in any groups yet.<br />
                <button style={btnStyle} onClick={openGroupModal}>Create or Join a Group</button>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {userGroups.map((group, idx) => (
                  <li key={idx} style={{ padding: '14px 22px', cursor: 'pointer', borderBottom: `1.5px solid ${borderColor}`, color: textColor, background: groupItemBg, borderRadius: 10, margin: '0 10px 8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.18s' }}
                    onMouseOver={e => e.currentTarget.style.background = groupItemHover}
                    onMouseOut={e => e.currentTarget.style.background = groupItemBg}
                    onClick={() => {
                      setSelectedGroup(group);
                      setSelectedUser({ ...group, type: 'group', groupId: group.id || group.title });
                      navigate(`/chat/group-${group.id}`);
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {group.title || `Group ${idx + 1}`}
                        {group.type && <span style={{ fontSize: 12, background: '#e9f5ee', color: accentGreen, borderRadius: 6, padding: '2px 8px', marginLeft: 6, fontWeight: 600 }}>{group.type}</span>}
                        {group.isAdmin && <span style={{ fontSize: 12, background: accentGreen, color: '#fff', borderRadius: 6, padding: '2px 8px', marginLeft: 6, fontWeight: 700 }}>Admin</span>}
                      </div>
                      <div style={{ fontSize: '0.98rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                        {group.lastMessage ? (
                          group.lastMessage.includes('@you') ? <span style={{ color: accentGreen, fontWeight: 700 }}>You were mentioned: </span> : null
                        ) : null}
                        {group.lastMessage || ''}
                      </div>
                    </div>
                    {group.unreadCount > 0 && (
                      <span style={{ background: accentGreen, color: '#fff', borderRadius: 10, padding: '3px 10px', fontWeight: 700, fontSize: 12 }}>{group.unreadCount}</span>
                    )}
                    <button style={{ background: 'none', border: 'none', color: '#888', fontSize: 20, marginLeft: 8, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setSelectedGroup(group); setShowGroupMenu(true); setGroupMenuAnchor(e.target); }}>&#8942;</button>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ fontWeight: 700, fontSize: '1.08rem', margin: '16px 0 8px 18px', color: accentGreen }}>Public Groups</div>
            {publicGroups.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 10, fontWeight: 500 }}>No public groups found.</div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {publicGroups.map((group, idx) => (
                  <li key={idx} style={{ padding: '12px 22px', cursor: 'pointer', borderBottom: `1.5px solid ${borderColor}`, color: textColor, background: groupItemBg, borderRadius: 10, margin: '0 10px 8px 10px', fontWeight: 600, fontSize: '1.05rem', letterSpacing: '1.05px', transition: 'background 0.18s' }}
                    onMouseOver={e => e.currentTarget.style.background = groupItemHover}
                    onMouseOut={e => e.currentTarget.style.background = groupItemBg}
                  >
                    {group.title || `Group ${idx + 1}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button style={fabStyle} onClick={openGroupModal}>+</button>
          {showModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div style={modalStyle}>
                <h2 style={{ color: accentGreen, fontWeight: 800, fontSize: '1.45rem', marginBottom: 18, textAlign: 'center' }}>Create Group</h2>
                {groupStep === 1 && (
                  <>
                    <input
                      type="text"
                      placeholder="Group name"
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      style={inputStyle}
                    />
                    <button disabled={!newGroupName.trim()} onClick={() => setGroupStep(2)} style={{ ...btnStyle, opacity: newGroupName.trim() ? 1 : 0.5 }}>Next</button>
                    <button onClick={closeGroupModal} style={cancelBtnStyle}>Cancel</button>
                  </>
                )}
                {groupStep === 2 && (
                  <>
                    <div style={{ marginBottom: 10, color: '#444', fontWeight: 600 }}>Select friends to add:</div>
                    <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 16 }}>
                      {users.map((user) => (
                        <div key={user.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                          <input
                            type="checkbox"
                            checked={selectedFriends.includes(user.id)}
                            onChange={() => toggleFriend(user.id)}
                            id={`friend-${user.id}`}
                            style={{ accentColor: accentGreen, width: 16, height: 16 }}
                          />
                          <label htmlFor={`friend-${user.id}`} style={{ marginLeft: 10, color: textColor, fontWeight: 500, fontSize: '1.01rem' }}>{user.nickname || user.displayName || user.email}</label>
                        </div>
                      ))}
                    </div>
                    <button disabled={selectedFriends.length === 0} onClick={() => setGroupStep(3)} style={{ ...btnStyle, opacity: selectedFriends.length ? 1 : 0.5 }}>Next</button>
                    <button onClick={() => setGroupStep(1)} style={cancelBtnStyle}>Back</button>
                    <button onClick={closeGroupModal} style={cancelBtnStyle}>Cancel</button>
                  </>
                )}
                {groupStep === 3 && (
                  <>
                    <div style={{ marginBottom: 10, color: '#444', fontWeight: 600 }}>Choose group type:</div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                      <button onClick={() => setGroupType('public')} style={{ ...btnStyle, background: groupType === 'public' ? accentGreen : '#f7f7f7', color: groupType === 'public' ? '#fff' : textColor, border: groupType === 'public' ? 'none' : `1.5px solid ${borderColor}` }}>Public</button>
                      <button onClick={() => setGroupType('private')} style={{ ...btnStyle, background: groupType === 'private' ? accentGreen : '#f7f7f7', color: groupType === 'private' ? '#fff' : textColor, border: groupType === 'private' ? 'none' : `1.5px solid ${borderColor}` }}>Private</button>
                      <button onClick={() => setGroupType('secret')} style={{ ...btnStyle, background: groupType === 'secret' ? accentGreen : '#f7f7f7', color: groupType === 'secret' ? '#fff' : textColor, border: groupType === 'secret' ? 'none' : `1.5px solid ${borderColor}` }}>Secret</button>
                    </div>
                    <button onClick={createGroup} style={{ ...btnStyle, fontSize: '1.12rem', padding: '12px 24px', background: accentGreen }}>Create Group</button>
                    <button onClick={() => setGroupStep(2)} style={cancelBtnStyle}>Back</button>
                    <button onClick={closeGroupModal} style={cancelBtnStyle}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'bots' && (
        <div className="sidebar-bots-list" style={{ padding: '18px 0' }}>
          <div
            className="bot-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              cursor: 'pointer',
              borderBottom: '1px solid #232b3e',
            }}
            onClick={() => {
              const bot = {
                id: 'chatwithme-bot',
                displayName: 'ChatWithMe 🤖',
                photoURL: '/logo192.png',
                type: 'bot',
                uid: 'chatwithme-bot',
              };
              if (setSelectedUser) setSelectedUser(bot);
              navigate(`/chat/${bot.id}`);
            }}
          >
            <FaRobot style={{ fontSize: 22 }} />{' '}
            <span style={{ fontWeight: 600 }}>ChatWithMe 🤖</span>
          </div>
          <div
            className="bot-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              cursor: 'pointer',
              borderBottom: '1px solid #232b3e',
            }}
            onClick={() => {
              const bot = {
                id: 'cosmochat-bot',
                displayName: 'CosmoChat 🚀',
                photoURL: '/logo192.png',
                type: 'bot',
                uid: 'cosmochat-bot',
              };
              if (setSelectedUser) setSelectedUser(bot);
              navigate(`/chat/${bot.id}`);
            }}
          >
            <FaRobot style={{ fontSize: 22 }} />{' '}
            <span style={{ fontWeight: 600 }}>CosmoChat 🚀</span>
          </div>
          <div
            className="bot-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              cursor: 'pointer',
            }}
            onClick={() => {
              const bot = {
                id: 'chattoimage-bot',
                displayName: 'ChatToImage 🎨',
                photoURL: '/logo192.png',
                type: 'bot',
                uid: 'chattoimage-bot',
              };
              if (setSelectedUser) setSelectedUser(bot);
              navigate(`/chat/${bot.id}`);
            }}
          >
            <FaPalette style={{ fontSize: 22 }} />{' '}
            <span style={{ fontWeight: 600 }}>ChatToImage 🎨</span>
          </div>
          <div
            className="bot-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              cursor: 'pointer',
            }}
            onClick={() => {
              const bot = {
                id: 'chatfornews-bot',
                displayName: 'ChatForNews 📰',
                photoURL: '/logo192.png',
                type: 'bot',
                uid: 'chatfornews-bot',
              };
              if (setSelectedUser) setSelectedUser(bot);
              navigate(`/chat/${bot.id}`);
            }}
          >
            <FaNewspaper style={{ fontSize: 22 }} />{' '}
            <span style={{ fontWeight: 600 }}>ChatForNews 📰</span>
          </div>
        </div>
      )}
      {showSettings && (
        <div className="modal-bg" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>
            <button
              className="login-btn"
              style={{ marginBottom: 12 }}
              onClick={() => setShowEditProfile(true)}
            >
              Edit Your Profile
            </button>
            <button
              className="login-btn"
              style={{ marginBottom: 12 }}
              onClick={() => setShowThemeMenu(true)}
            >
              Theme
            </button>
            <button
              className="login-btn"
              style={{ marginBottom: 12 }}
              onClick={() => alert('Notifications settings coming soon!')}
            >
              Notifications (Demo)
            </button>
            <button
              className="login-btn"
              style={{ marginBottom: 12 }}
              onClick={() => alert('Theme settings coming soon!')}
            >
              Theme (Demo)
            </button>
            <button
              className="login-btn"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showEditProfile && (
        <div className="modal-bg" onClick={() => setShowEditProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Your Profile</h2>
            <input
              className="login-input"
              type="text"
              placeholder="New Nickname"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <ProfileImageUploader
              onImageUploaded={(url) => setNewProfilePicUrl(url)}
            />
            {newProfilePicUrl && (
              <img
                src={newProfilePicUrl}
                alt="Preview"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #fff',
                  marginBottom: 12,
                }}
              />
            )}
            <button
              className="login-btn"
              onClick={handleSaveProfile}
              style={{ marginBottom: 8 }}
            >
              Save
            </button>
            <button
              className="login-btn"
              style={{ background: '#888' }}
              onClick={() => setShowEditProfile(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showThemeMenu && (
        <div
          className="modal-bg"
          onClick={() => {
            setShowThemeMenu(false);
            setThemeCategory(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!themeCategory ? (
              <>
                <h2>Select Theme Category</h2>
                <button
                  className="login-btn"
                  style={{ marginBottom: 8 }}
                  onClick={() => setThemeCategory('legendary')}
                >
                  🛡️ Legendary & Regal
                </button>
                <button
                  className="login-btn"
                  style={{ marginBottom: 8 }}
                  onClick={() => setThemeCategory('dark')}
                >
                  🗡️ Dark & Supreme
                </button>
                <button
                  className="login-btn"
                  style={{ marginBottom: 8 }}
                  onClick={() => setThemeCategory('cosmic')}
                >
                  🌌 Cosmic & Celestial
                </button>
                <button
                  className="login-btn"
                  style={{ marginBottom: 8 }}
                  onClick={() => setThemeCategory('futuristic')}
                >
                  🔥 Futuristic & Electric
                </button>
                <button
                  className="login-btn"
                  style={{ marginBottom: 8 }}
                  onClick={() => setThemeCategory('custom')}
                >
                  Custom
                </button>
                <button
                  className="login-btn"
                  style={{ background: '#888' }}
                  onClick={() => setShowThemeMenu(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2 style={{ marginBottom: 12 }}>
                  {themeCategory === 'legendary' && '🛡️ Legendary & Regal'}
                  {themeCategory === 'dark' && '🗡️ Dark & Supreme'}
                  {themeCategory === 'cosmic' && '🌌 Cosmic & Celestial'}
                  {themeCategory === 'futuristic' && '🔥 Futuristic & Electric'}
                  {themeCategory === 'custom' && 'Custom'}
                </h2>
                {themeCategory === 'legendary' &&
                  [
                    'Arcane Flame',
                    'Drakonite',
                    'Mythos Blade',
                    'Titanium Dawn',
                    'Emerald Tyrant',
                    'Royal Ember',
                    'Lionheart',
                    'Iron Warden',
                    'Valorborn',
                    'Crystalline Majesty',
                  ].map((theme) => (
                    <button
                      key={theme}
                      className="login-btn"
                      style={{ marginBottom: 8 }}
                      onClick={() => alert(`Theme: ${theme} coming soon!`)}
                    >
                      {theme}
                    </button>
                  ))}
                {themeCategory === 'dark' &&
                  [
                    'Obsidian Reign',
                    'Onyx Phantom',
                    'Crimson Monarch',
                    'Venom Pulse',
                    'Void King',
                    'Imperial Dusk',
                    'Grimlight',
                    'Abyss Crown',
                    'Blackfire Edge',
                    'Eternal Night',
                  ].map((theme) => (
                    <button
                      key={theme}
                      className="login-btn"
                      style={{ marginBottom: 8 }}
                      onClick={() => alert(`Theme: ${theme} coming soon!`)}
                    >
                      {theme}
                    </button>
                  ))}
                {themeCategory === 'cosmic' &&
                  [
                    'Galaxy Blue',
                    'Crimson Nebula',
                    'Dark Matter',
                    'Astral Echo',
                    'Eclipse Void',
                    'Solar Flare',
                    'Celestia Rise',
                    'Lunar Frost',
                    'Stellar Rift',
                    'Nova Storm',
                  ].map((theme) => (
                    <button
                      key={theme}
                      className="login-btn"
                      style={{ marginBottom: 8 }}
                      onClick={() => alert(`Theme: ${theme} coming soon!`)}
                    >
                      {theme}
                    </button>
                  ))}
                {themeCategory === 'futuristic' &&
                  [
                    'Neon Blaze',
                    'Ultron Core',
                    'Nitro Pulse',
                    'Cyber Flux',
                    'Quantum Chrome',
                    'Vanta Surge',
                    'Synthwave Sky',
                    'Electric Mirage',
                    'Plasma Shadow',
                    'Photon Drift',
                  ].map((theme) => (
                    <button
                      key={theme}
                      className="login-btn"
                      style={{ marginBottom: 8 }}
                      onClick={() => alert(`Theme: ${theme} coming soon!`)}
                    >
                      {theme}
                    </button>
                  ))}
                {themeCategory === 'custom' && (
                  <div style={{ marginBottom: 12 }}>
                    <input
                      className="login-input"
                      placeholder="Custom theme name..."
                      style={{ marginBottom: 8 }}
                    />
                    <button
                      className="login-btn"
                      style={{ marginBottom: 8 }}
                      onClick={() => alert('Custom theme coming soon!')}
                    >
                      Apply Custom Theme
                    </button>
                  </div>
                )}
                <button
                  className="login-btn"
                  style={{ background: '#888' }}
                  onClick={() => setThemeCategory(null)}
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Group profile/settings modal */}
      {showGroupProfile && selectedGroup && (
        <div className="modal-bg" onClick={() => setShowGroupProfile(false)}>
          <div className="modal-content" style={{ minWidth: 340, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#39FF14', marginBottom: 8 }}>{selectedGroup.title}</h2>
            <div style={{ marginBottom: 8, color: '#b3c2e0' }}>{selectedGroup.description || 'No description.'}</div>
            <div style={{ marginBottom: 8, color: '#b3c2e0' }}>Type: <b>{selectedGroup.type}</b></div>
            <div style={{ marginBottom: 8, color: '#b3c2e0' }}>Created: {selectedGroup.createdAt ? new Date(selectedGroup.createdAt).toLocaleString() : 'Unknown'}</div>
            <div style={{ marginBottom: 8, color: '#b3c2e0' }}>Members: {selectedGroup.members?.length || 1}</div>
            <div style={{ marginBottom: 8, color: '#b3c2e0' }}>Admins: {selectedGroup.admins?.join(', ') || 'You'}</div>
            <button style={{ background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', marginRight: 8 }} onClick={() => setShowGroupProfile(false)}>Close</button>
            {/* TODO: Add manage, invite, leave, mute, etc. */}
          </div>
        </div>
      )}
      {/* Group 3-dot menu */}
      {showGroupMenu && selectedGroup && (
        <div className="modal-bg" onClick={() => setShowGroupMenu(false)}>
          <div className="modal-content" style={{ minWidth: 220, maxWidth: 260 }} onClick={e => e.stopPropagation()}>
            <button style={{ width: '100%', background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', marginBottom: 8 }} onClick={() => { setShowGroupProfile(true); setShowGroupMenu(false); }}>View Group Info</button>
            <button style={{ width: '100%', background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', marginBottom: 8 }} onClick={() => { alert('Invite link coming soon!'); setShowGroupMenu(false); }}>Invite Link</button>
            <button style={{ width: '100%', background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', marginBottom: 8 }} onClick={() => { alert('Visibility settings coming soon!'); setShowGroupMenu(false); }}>Visibility</button>
            <button style={{ width: '100%', background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', marginBottom: 8 }} onClick={() => { alert('Leave group coming soon!'); setShowGroupMenu(false); }}>Leave Group</button>
            {selectedGroup.isAdmin && <button style={{ width: '100%', background: '#232b3e', color: '#ffb300', border: 'none', borderRadius: 8, padding: '8px 0', marginBottom: 8 }} onClick={() => { alert('Manage members coming soon!'); setShowGroupMenu(false); }}>Manage Members</button>}
            <button style={{ width: '100%', background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0' }} onClick={() => setShowGroupMenu(false)}>Close</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeTyping {
          0% { opacity: 0.85; }
          50% { opacity: 1; }
          100% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
