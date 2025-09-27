import React, { useRef, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, getDocs, collection } from 'firebase/firestore';
import GroupNotificationSettings from './GroupNotificationSettings';
import { useNavigate } from 'react-router-dom';

export default function GroupInfo({ group, members, currentUser, onClose, onSearch }) {
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState(group.title);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showDisappearing, setShowDisappearing] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showMediaVisibility, setShowMediaVisibility] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Upload group photo
  const handlePhotoClick = () => {
    if (currentUser && (group.admins?.includes(currentUser.uid) || group.createdBy === currentUser.uid)) {
      fileInputRef.current.click();
    }
  };
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'unsigned_upload');
      const res = await fetch('https://api.cloudinary.com/v1_1/dwdvb6rp0/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload failed');
      await updateDoc(doc(db, 'groups', group.id), { photoURL: data.secure_url });
      setUploading(false);
      onClose(); // Close modal to refresh group info
      return;
    } catch (err) {
      setError('Failed to upload image');
    }
    setUploading(false);
  };

  // Change group name
  const handleNameChange = async () => {
    if (!newName.trim()) return;
    setUploading(true);
    setError('');
    try {
      await updateDoc(doc(db, 'groups', group.id), { title: newName.trim() });
      setShowEditName(false);
      setUploading(false);
      onClose(); // Close modal to refresh group info
      return;
    } catch (err) {
      setError('Failed to update name');
    }
    setUploading(false);
  };

  // Add members logic (show modal)
  const handleAddMembers = () => setShowAddMembers(true);
  // Media gallery logic (show modal)
  const handleShowMedia = () => setShowMedia(true);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#181f2f', color: '#e1e4e8', borderRadius: 18, minWidth: 350, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px #000a', padding: 0, position: 'relative',
      }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '24px 24px 12px 24px', borderBottom: '1.5px solid #232b3e' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#25D366', fontSize: 26, marginRight: 18, cursor: 'pointer' }}>&larr;</button>
          <div style={{ position: 'relative' }}>
            <img
              src={group.photoURL || '/logo192.png'}
              alt={group.title}
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginRight: 18, cursor: (group.admins?.includes(currentUser.uid) || group.createdBy === currentUser.uid) ? 'pointer' : 'default', border: uploading ? '2px solid #25D366' : 'none' }}
              onClick={handlePhotoClick}
            />
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
            {uploading && <span style={{ position: 'absolute', top: 0, left: 0, color: '#25D366', fontSize: 12 }}>Uploading...</span>}
          </div>
          <div style={{ flex: 1 }}>
            {showEditName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} style={{ fontSize: 20, fontWeight: 700, borderRadius: 6, border: 'none', padding: 4, background: '#232b3e', color: '#fff' }} />
                <button onClick={handleNameChange} style={{ background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700 }}>Save</button>
                <button onClick={() => setShowEditName(false)} style={{ background: '#232b3e', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{group.title}</div>
                {(group.admins?.includes(currentUser.uid) || group.createdBy === currentUser.uid) && (
                  <button onClick={() => setShowEditName(true)} style={{ background: 'none', border: 'none', color: '#25D366', fontSize: 18, cursor: 'pointer' }}>✏️</button>
                )}
              </div>
            )}
            <div style={{ fontSize: 15, color: '#b3c2e0' }}>Group &bull; {members.length} members</div>
            {error && <div style={{ color: '#ff4d4f', fontSize: 13 }}>{error}</div>}
          </div>
        </div>
        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '18px 0', borderBottom: '1.5px solid #232b3e' }}>
          <button style={actionBtnStyle}><span role="img" aria-label="audio">📞</span><div>Audio</div></button>
          <button style={actionBtnStyle}><span role="img" aria-label="video">🎥</span><div>Video</div></button>
          <button style={actionBtnStyle} onClick={handleAddMembers}><span role="img" aria-label="add">➕</span><div>Add</div></button>
          <button style={actionBtnStyle} onClick={onSearch}><span role="img" aria-label="search">🔍</span><div>Search</div></button>
        </div>
        {/* Description and rules */}
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #232b3e' }}>
          <div style={{ fontStyle: 'italic', marginBottom: 8 }}>{group.description || 'No description.'}</div>
          {group.rules && <div style={{ fontStyle: 'italic', color: '#b3c2e0', marginBottom: 8 }}>{group.rules}</div>}
          <div style={{ fontSize: 13, color: '#b3c2e0' }}>Created by {group.createdByName || 'Unknown'}{group.createdAt && (', ' + new Date(group.createdAt.seconds * 1000).toLocaleDateString())}</div>
        </div>
        {/* Media, links, docs */}
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #232b3e', cursor: 'pointer' }} onClick={handleShowMedia}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Media, links, and docs <span style={{ color: '#25D366', fontWeight: 700 }}>{group.mediaCount || 0}</span></div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {(group.mediaThumbs || []).map((url, i) => (
              <img key={i} src={url} alt="media" style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover' }} />
            ))}
          </div>
        </div>
        {/* Members list */}
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #232b3e' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{members.length} members</div>
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <img src={m.profilePic || m.photoURL || '/logo192.png'} alt={m.nickname || m.displayName || m.email} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginRight: 10 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{m.nickname || m.displayName || m.email}</div>
                  {m.status && <div style={{ fontSize: 13, color: '#b3c2e0' }}>{m.status}</div>}
                </div>
                {group.admins && group.admins.includes(m.id) && <span style={{ background: '#25D366', color: '#181f2f', borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 12 }}>Admin</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Group settings and actions */}
        <div style={{ padding: '18px 24px' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button style={settingsBtnStyle} onClick={() => navigate(`/group/${group.id}/notifications`)}>Notifications</button>
            <button style={settingsBtnStyle} onClick={() => setShowMediaVisibility(true)}>Media visibility</button>
            <button style={settingsBtnStyle} onClick={() => setShowEncryption(true)}>Encryption</button>
            <button style={settingsBtnStyle} onClick={() => navigate(`/group/${group.id}/disappearing`)}>Disappearing messages</button>
            <button style={settingsBtnStyle} onClick={() => setShowLock(true)}>Chat lock</button>
            <button style={settingsBtnStyle} onClick={() => setShowPermissions(true)}>Group permissions</button>
            <button style={{ ...settingsBtnStyle, color: '#ff4d4f' }}>Exit group</button>
            <button style={{ ...settingsBtnStyle, color: '#ff4d4f' }}>Report group</button>
          </div>
        </div>
        {/* Add Members Modal */}
        {showAddMembers && (
          <AddMembersModal group={group} currentUser={currentUser} onClose={() => setShowAddMembers(false)} />
        )}
        {/* Media Gallery Modal */}
        {showMedia && (
          <MediaGalleryModal group={group} onClose={() => setShowMedia(false)} />
        )}
        {/* Advanced modals */}
        {showPermissions && <GroupPermissionsModal group={group} currentUser={currentUser} onClose={() => setShowPermissions(false)} />}
        {showLock && <ChatLockModal group={group} currentUser={currentUser} onClose={() => setShowLock(false)} />}
        {showMediaVisibility && <MediaVisibilityModal group={group} currentUser={currentUser} onClose={() => setShowMediaVisibility(false)} />}
        {showEncryption && <EncryptionInfoModal onClose={() => setShowEncryption(false)} />}
      </div>
    </div>
  );
}

function AddMembersModal({ group, currentUser, onClose }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const snap = await getDocs(collection(db, 'users'));
        const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Only users not already in group
        setUsers(all.filter(u => !group.members.includes(u.id)));
      } catch (e) {
        setError('Failed to load users');
      }
      setLoading(false);
    }
    fetchUsers();
  }, [group.members]);
  const handleToggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleAdd = async () => {
    if (!selected.length) return;
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(db, 'groups', group.id), {
        members: arrayUnion(...selected)
      });
      onClose();
    } catch (e) {
      setError('Failed to add members');
    }
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#232b3e', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320 }}>
        <h3>Add Members</h3>
        {loading ? <div>Loading...</div> : (
          <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <input type="checkbox" checked={selected.includes(u.id)} onChange={() => handleToggle(u.id)} />
                <img src={u.profilePic || u.photoURL || '/logo192.png'} alt={u.nickname || u.displayName || u.email} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginLeft: 8, marginRight: 8 }} />
                <span>{u.nickname || u.displayName || u.email}</span>
              </div>
            ))}
          </div>
        )}
        {error && <div style={{ color: '#ff4d4f', marginBottom: 8 }}>{error}</div>}
        <button onClick={handleAdd} style={{ background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, marginRight: 8 }} disabled={loading || !selected.length}>Add</button>
        <button onClick={onClose} style={{ background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );
}

function MediaGalleryModal({ group, onClose }) {
  // TODO: Implement real media gallery
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#232b3e', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320 }}>
        <h3>Media Gallery (Coming Soon)</h3>
        <button onClick={onClose} style={{ marginTop: 18, background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  background: '#232b3e', color: '#25D366', border: 'none', borderRadius: 12, padding: '12px 18px', fontWeight: 600, fontSize: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', minWidth: 60,
};
const settingsBtnStyle = {
  background: '#232b3e', color: '#e1e4e8', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 500, fontSize: 15, textAlign: 'left', cursor: 'pointer',
};

function GroupPermissionsModal({ group, currentUser, onClose }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#232b3e', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320 }}>
        <h3>Group Permissions (Coming Soon)</h3>
        <button onClick={onClose} style={{ marginTop: 18, background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );
}
function ChatLockModal({ group, currentUser, onClose }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#232b3e', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320 }}>
        <h3>Chat Lock (Coming Soon)</h3>
        <button onClick={onClose} style={{ marginTop: 18, background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );
}
function MediaVisibilityModal({ group, currentUser, onClose }) {
  const [value, setValue] = useState(group.mediaVisibility || 'public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = group.admins?.includes(currentUser.uid) || group.createdBy === currentUser.uid;
  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(db, 'groups', group.id), { mediaVisibility: value });
      onClose();
    } catch (e) {
      setError('Failed to update media visibility');
    }
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#232b3e', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320 }}>
        <h3>Media Visibility</h3>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 10, cursor: isAdmin ? 'pointer' : 'not-allowed', opacity: isAdmin ? 1 : 0.6 }}>
            <input type="radio" name="mediaVisibility" value="public" checked={value === 'public'} onChange={() => isAdmin && setValue('public')} disabled={!isAdmin} style={{ marginRight: 8 }} />
            Set your media to public (everyone can download)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 10, cursor: isAdmin ? 'pointer' : 'not-allowed', opacity: isAdmin ? 1 : 0.6 }}>
            <input type="radio" name="mediaVisibility" value="private" checked={value === 'private'} onChange={() => isAdmin && setValue('private')} disabled={!isAdmin} style={{ marginRight: 8 }} />
            Set your media to private (no one can download)
          </label>
          {value === 'private' && <div style={{ color: '#ff4d4f', fontSize: 13, marginTop: 6 }}>No one can download the media/images you share in this group.</div>}
          {value === 'public' && <div style={{ color: '#25D366', fontSize: 13, marginTop: 6 }}>Everyone in the group can download shared media/images.</div>}
        </div>
        {error && <div style={{ color: '#ff4d4f', marginBottom: 8 }}>{error}</div>}
        <button onClick={handleSave} style={{ background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, marginRight: 8 }} disabled={loading || !isAdmin}>Save</button>
        <button onClick={onClose} style={{ background: '#232b3e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );
}
function EncryptionInfoModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#232b3e', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320 }}>
        <h3>Encryption Info</h3>
        <p>ChatterLite secures your conversations with end-to-end encryption. This means your messages, calls and status updates stay between you and the people you choose. Not even ChatterLite can read or listen to them.</p>
        <button onClick={onClose} style={{ marginTop: 18, background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700 }}>OK</button>
      </div>
    </div>
  );
} 