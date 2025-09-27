import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const TIMER_OPTIONS = [
  { value: 24 * 60 * 60 * 1000, label: '24 hours' },
  { value: 7 * 24 * 60 * 60 * 1000, label: '7 days' },
  { value: 90 * 24 * 60 * 60 * 1000, label: '90 days' },
  { value: 0, label: 'Off' },
];

export default function DisappearingMessages() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [timer, setTimer] = useState(0);
  const [defaultTimer, setDefaultTimer] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load group and user settings
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      setError('');
      try {
        // Get group info
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const group = groupDoc.data();
          setIsAdmin(group.admins?.includes(currentUser.uid) || group.createdBy === currentUser.uid);
          setTimer(group.disappearingTimer || 0);
        }
        // Get user default
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setDefaultTimer(userDoc.data().disappearingDefault || 0);
        }
      } catch (e) {
        setError('Failed to load settings');
      }
      setLoading(false);
    }
    fetchSettings();
  }, [groupId, currentUser]);

  // Save group timer
  const saveTimer = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(db, 'groups', groupId), { disappearingTimer: timer }, { merge: true });
      navigate(-1);
    } catch (e) {
      setError('Failed to save setting');
    }
    setSaving(false);
  };

  // Save user default timer
  const saveDefaultTimer = async () => {
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { disappearingDefault: defaultTimer }, { merge: true });
    } catch (e) {
      setError('Failed to save default');
    }
    setSaving(false);
  };

  // Placeholder for screenshot detection logic
  useEffect(() => {
    // In real app, use browser APIs or platform-specific code
    // For demo, you could add a button in ChatWindow to simulate screenshot
  }, [timer]);

  if (loading) return <div style={{ color: '#fff', background: '#181f2f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{ background: '#181f2f', color: '#fff', minHeight: '100vh', width: '100vw', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '24px 0 12px 0' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#25D366', fontSize: 26, marginRight: 18, cursor: 'pointer' }}>&larr;</button>
          <h2 style={{ fontFamily: 'cursive', fontWeight: 600, fontSize: 28, margin: 0 }}>Disappearing messages</h2>
        </div>
        <div style={{ textAlign: 'center', margin: '18px 0' }}>
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="disappear" style={{ width: 90, marginBottom: 12 }} />
        </div>
        <div style={{ color: '#b3c2e0', fontSize: 16, margin: '0 0 18px 0', textAlign: 'center' }}>
          Make messages in this chat disappear<br />
          <span style={{ fontSize: 15, color: '#b3c2e0' }}>
            For more privacy and storage, new messages will disappear from this chat for everyone after the selected duration except when kept. Group admins control who can change this setting.
          </span>
        </div>
        <div style={{ color: '#25D366', fontSize: 15, marginBottom: 18, textAlign: 'center', cursor: 'pointer' }}>
          <a href="https://faq.whatsapp.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'underline' }}>Learn more</a>
        </div>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Message timer</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          {TIMER_OPTIONS.map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', fontSize: 18, color: timer === opt.value ? '#25D366' : '#fff', cursor: isAdmin ? 'pointer' : 'not-allowed', opacity: isAdmin ? 1 : 0.6 }}>
              <input type="radio" name="timer" value={opt.value} checked={timer === opt.value} onChange={() => isAdmin && setTimer(opt.value)} disabled={!isAdmin} style={{ marginRight: 12 }} />
              {opt.label}
            </label>
          ))}
        </div>
        <button onClick={saveTimer} disabled={!isAdmin || saving} style={{ background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 17, marginBottom: 18, opacity: isAdmin ? 1 : 0.6, cursor: isAdmin ? 'pointer' : 'not-allowed' }}>Save</button>
        {error && <div style={{ color: '#ff4d4f', marginBottom: 12 }}>{error}</div>}
        <div style={{ borderTop: '1.5px solid #232b3e', margin: '24px 0 0 0', paddingTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22, color: '#25D366' }}>⏲️</span>
            <div style={{ fontWeight: 600, fontSize: 17 }}>Try a default message timer</div>
          </div>
          <div style={{ color: '#b3c2e0', fontSize: 15, marginBottom: 10 }}>Start your new chats with disappearing</div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 10 }}>
            {TIMER_OPTIONS.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', fontSize: 16, color: defaultTimer === opt.value ? '#25D366' : '#fff', cursor: 'pointer' }}>
                <input type="radio" name="defaultTimer" value={opt.value} checked={defaultTimer === opt.value} onChange={() => setDefaultTimer(opt.value)} style={{ marginRight: 8 }} />
                {opt.label}
              </label>
            ))}
          </div>
          <button onClick={saveDefaultTimer} disabled={saving} style={{ background: '#25D366', color: '#181f2f', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 15 }}>Save Default</button>
        </div>
      </div>
    </div>
  );
} 