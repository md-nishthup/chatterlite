import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export default function GroupNotificationSettings({ groupId, currentUser, onClose }) {
  const [loading, setLoading] = useState(true);
  const [mute, setMute] = useState(false);
  const [notifyFor, setNotifyFor] = useState('all'); // 'all' or 'selected'
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [tone, setTone] = useState('default');
  const [vibrate, setVibrate] = useState('default');
  const [callMute, setCallMute] = useState(false);
  const [members, setMembers] = useState([]);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const userId = currentUser?.uid;

  // Load group members and settings
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch group members
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      let groupMembers = [];
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        if (data.members) {
          // Fetch user info for each member
          const usersSnap = await getDocs(collection(db, 'users'));
          groupMembers = usersSnap.docs
            .map(docu => ({ id: docu.id, ...docu.data() }))
            .filter(u => data.members.includes(u.id));
        }
      }
      setMembers(groupMembers);
      // Fetch notification settings
      if (userId) {
        const settingsDoc = await getDoc(doc(db, 'groups', groupId, 'notificationSettings', userId));
        if (settingsDoc.exists()) {
          const s = settingsDoc.data();
          setMute(!!s.mute);
          setNotifyFor(s.notifyFor || 'all');
          setSelectedMembers(s.selectedMembers || []);
          setTone(s.tone || 'default');
          setVibrate(s.vibrate || 'default');
          setCallMute(!!s.callMute);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [groupId, userId]);

  // Save settings
  const saveSettings = async () => {
    if (!userId) return;
    await setDoc(doc(db, 'groups', groupId, 'notificationSettings', userId), {
      mute,
      notifyFor,
      selectedMembers,
      tone,
      vibrate,
      callMute,
    }, { merge: true });
    if (onClose) onClose();
  };

  // Member picker modal
  const MemberPicker = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#232b3e', color: '#fff', borderRadius: 12, padding: 32, minWidth: 320, maxHeight: 400, overflowY: 'auto' }}>
        <h3>Select group members</h3>
        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
          {members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={() => {
                setSelectedMembers(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id]);
              }} />
              <img src={m.profilePic || m.photoURL || '/logo192.png'} alt={m.nickname || m.displayName || m.email} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginLeft: 8, marginRight: 8 }} />
              <span>{m.nickname || m.displayName || m.email}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setShowMemberPicker(false)} style={{ background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, marginRight: 8 }}>Done</button>
      </div>
    </div>
  );

  if (loading) return <div style={{ color: '#fff', background: '#181f2f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#181f2f', color: '#fff', minHeight: '100vh', width: '100vw', padding: 0, fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '24px 0 12px 0' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#25D366', fontSize: 26, marginRight: 18, cursor: 'pointer' }}>&larr;</button>
          <h2 style={{ fontFamily: 'cursive', fontWeight: 600, fontSize: 28, margin: 0 }}>Notifications</h2>
        </div>
        <div style={{ margin: '18px 0', borderTop: '1.5px solid #232b3e', paddingTop: 18 }}>
          <div style={{ fontSize: 15, color: '#b3c2e0', marginBottom: 4 }}>Message</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: 18 }}>Mute notifications</span>
            <input type="checkbox" checked={mute} onChange={e => setMute(e.target.checked)} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 18 }}>Notify for</span>
            <select value={notifyFor} onChange={e => setNotifyFor(e.target.value)} style={{ marginLeft: 12, fontSize: 16, background: '#232b3e', color: '#fff', border: '1px solid #232b3e', borderRadius: 6, padding: '4px 10px' }}>
              <option value="all">All</option>
              <option value="selected">Selected users</option>
            </select>
            {notifyFor === 'selected' && (
              <button onClick={() => setShowMemberPicker(true)} style={{ marginLeft: 12, background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>Choose Members</button>
            )}
            {notifyFor === 'selected' && selectedMembers.length > 0 && (
              <div style={{ marginTop: 8, color: '#25D366', fontSize: 15 }}>
                {selectedMembers.length} member(s) selected
              </div>
            )}
          </div>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 18 }}>Notification tone</span>
            <select value={tone} onChange={e => setTone(e.target.value)} style={{ marginLeft: 12, fontSize: 16, background: '#232b3e', color: '#fff', border: '1px solid #232b3e', borderRadius: 6, padding: '4px 10px' }}>
              <option value="default">Default</option>
              <option value="carlock">Car Lock</option>
              <option value="beep">Beep</option>
              <option value="chime">Chime</option>
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 18 }}>Vibrate</span>
            <select value={vibrate} onChange={e => setVibrate(e.target.value)} style={{ marginLeft: 12, fontSize: 16, background: '#232b3e', color: '#fff', border: '1px solid #232b3e', borderRadius: 6, padding: '4px 10px' }}>
              <option value="default">Default</option>
              <option value="off">Off</option>
              <option value="short">Short</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div style={{ margin: '18px 0 8px', fontSize: 15, color: '#b3c2e0' }}>Advanced settings</div>
          {/* Placeholder for advanced settings */}
          <div style={{ fontSize: 15, color: '#b3c2e0', marginBottom: 4 }}>Call</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: 18 }}>Mute notifications</span>
            <input type="checkbox" checked={callMute} onChange={e => setCallMute(e.target.checked)} />
          </div>
        </div>
        <button onClick={saveSettings} style={{ background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, marginTop: 18 }}>Save</button>
      </div>
      {showMemberPicker && <MemberPicker />}
    </div>
  );
} 