import React, { useState } from 'react';

const ChatSidebar = ({ chatHistory = [], onSelectChat, onClose }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Placeholder for user's groups and public groups
  const userGroups = chatHistory; // Replace with Firestore query for real groups
  const publicGroups = chatHistory.filter(chat => chat.title && chat.title.toLowerCase().includes(search.toLowerCase()));

  const createGroup = () => {
    if (!newGroupName.trim()) return;
    // Placeholder: In real app, call Firestore to create group
    alert(`Group '${newGroupName}' created! (Implement Firestore logic here)`);
    setShowModal(false);
    setNewGroupName('');
  };

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, height: '100vh', width: 320, background: '#181f2f', color: '#fff', boxShadow: '-2px 0 16px #00f9ff22', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      {/* Top bar with back arrow and search */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '18px 12px 8px 12px', borderBottom: '1.5px solid #00f9ff33', gap: 8 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#00f9ff', fontSize: 22, cursor: 'pointer', marginRight: 8 }}>&larr;</button>
        <input
          type="text"
          placeholder="Search public groups"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: '#232b3e', color: '#fff' }}
        />
      </div>
      {/* User's groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        <div style={{ fontWeight: 700, margin: '8px 0 8px 18px', color: '#00f9ff' }}>Your Groups</div>
        {userGroups.length === 0 ? (
          <div style={{ color: '#8b949e', textAlign: 'center', marginTop: 40 }}>No groups yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {userGroups.map((chat, idx) => (
              <li key={idx} style={{ padding: '12px 22px', cursor: 'pointer', borderBottom: '1px solid #232b3e', color: '#e1e4e8', transition: 'background 0.18s' }} onClick={() => onSelectChat(chat, idx)}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{chat.title || `Chat ${idx + 1}`}</div>
                <div style={{ fontSize: '0.93rem', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.preview || ''}</div>
              </li>
            ))}
          </ul>
        )}
        <div style={{ fontWeight: 700, margin: '16px 0 8px 18px', color: '#00f9ff' }}>Public Groups</div>
        {publicGroups.length === 0 ? (
          <div style={{ color: '#8b949e', textAlign: 'center', marginTop: 10 }}>No public groups found.</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {publicGroups.map((group, idx) => (
              <li key={idx} style={{ padding: '12px 22px', cursor: 'pointer', borderBottom: '1px solid #232b3e', color: '#e1e4e8', transition: 'background 0.18s' }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{group.title || `Group ${idx + 1}`}</div>
                <div style={{ fontSize: '0.93rem', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.preview || ''}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Floating + button */}
      <button
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#39FF14',
          color: '#181f2f',
          fontSize: 32,
          border: 'none',
          boxShadow: '0 2px 8px #3fb950',
          cursor: 'pointer'
        }}
        onClick={() => setShowModal(true)}
      >+</button>
      {/* Modal for group creation */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#222236', padding: 32, borderRadius: 16 }}>
            <h2 style={{ color: '#39FF14' }}>Create Group</h2>
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 8, marginBottom: 16, border: 'none', background: '#232b3e', color: '#fff' }}
            />
            <button onClick={createGroup} style={{ background: '#39FF14', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600 }}>Create</button>
            <button onClick={() => setShowModal(false)} style={{ marginLeft: 8, background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar; 