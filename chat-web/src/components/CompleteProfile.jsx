import React, { useState } from 'react';
import './CompleteProfile.css';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function CompleteProfile({ onSave }) {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [referral, setReferral] = useState('');
  const [religion, setReligion] = useState('');
  const [gender, setGender] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);
  const { currentUser } = useAuth();

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicUrl(URL.createObjectURL(file));
    }
  };
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
      setCoverPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !nickname.trim() || !email.trim()) return;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(
        userRef,
        {
          fullName,
          nickname,
          email,
          phone,
          dob,
          referral,
          religion,
          gender,
          // Optionally add profilePic/coverPhoto URLs if you upload them
        },
        { merge: true }
      );
    }
    setShowCongrats(true);
    // Remove window.location.reload();
    // Instead, let App.jsx detect the update and route automatically
    // Optionally, you can call onSave() if you want to trigger a callback
    if (onSave) onSave();
  };

  if (showCongrats) {
    return (
      <div
        className="complete-profile-bg"
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          className="complete-profile-form"
          style={{
            maxWidth: 340,
            boxShadow: '0 8px 32px #0002',
            padding: '32px 0 32px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <img
              src={profilePicUrl || '/logo192.png'}
              alt="Profile"
              className="complete-profile-avatar"
              style={{ width: 88, height: 88, marginBottom: 12 }}
            />
            <h2 style={{ color: '#232b3e', fontWeight: 700, marginBottom: 8 }}>
              Congratulations
            </h2>
            <div
              style={{
                color: '#444',
                fontSize: 15,
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              Your profile is set up and ready to go!
            </div>
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                className="go-to-chat-anim"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(90deg, #a259e6 0%, #ff5e13 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'bounce 1.2s infinite',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  (window.location.href = '/chat/' + (currentUser?.uid || ''))
                }
                title="Go to Chat"
              >
                <svg width="28" height="28" fill="#fff" viewBox="0 0 24 24">
                  <path
                    d="M12 4v16m0 0l-6-6m6 6l6-6"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span style={{ color: '#a259e6', fontWeight: 600, fontSize: 15 }}>
                Go to Chat
              </span>
            </div>
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-12px); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="complete-profile-bg"
      style={{ overflowY: 'auto', maxHeight: '100vh' }}
    >
      <form className="complete-profile-form" onSubmit={handleSubmit}>
        <div
          className="complete-profile-cover"
          style={{
            backgroundImage: coverPhotoUrl
              ? `url(${coverPhotoUrl})`
              : undefined,
          }}
        >
          <label className="complete-profile-cover-upload">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverPhotoChange}
            />
            Add your CP (cover photo)
          </label>
          <div className="complete-profile-avatar-wrapper">
            <label className="complete-profile-avatar-upload">
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
              />
              <img
                src={profilePicUrl || '/logo192.png'}
                alt="Profile"
                className="complete-profile-avatar"
              />
              <span className="complete-profile-avatar-edit">✎</span>
            </label>
            <div className="complete-profile-dp-label">Add your DP</div>
          </div>
        </div>
        <div className="complete-profile-fields">
          <div className="complete-profile-row">
            <input
              type="text"
              placeholder="Full Name*"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="complete-profile-row">
            <input
              type="text"
              placeholder="Nickname* (you will be found with this name)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="complete-profile-row">
            <input
              type="email"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="complete-profile-row">
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="complete-profile-row">
            <input
              type="date"
              placeholder="Date of Birth"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="complete-profile-row">
            <input
              type="text"
              placeholder="Where did you hear about us?"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            />
          </div>
          <div className="complete-profile-row">
            <input
              type="text"
              placeholder="Religion"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
            />
          </div>
          <div className="complete-profile-row">
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <button className="complete-profile-save-btn" type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}
