import React, { useState, useEffect } from "react";
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  saveUserProfile,
  getRooms,
} from "./firebase";
import ChatWindow from "./ChatWindow";
import DebugOverlay from "./components/DebugOverlay";
import "./ChatApp.css"; // Optional CSS file for styling

const ChatApp = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await saveUserProfile(authUser); // Save to Firestore
      } else {
        setUser(null);
        setUsername("");
        setSelectedRoom(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch rooms on load
  useEffect(() => {
    const fetchRooms = async () => {
      const list = await getRooms();
      setRooms(list);
    };
    fetchRooms();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleUsernameSubmit = async () => {
    if (username.trim()) {
      await saveUserProfile({ ...user, displayName: username });
      setUser((prev) => ({ ...prev, displayName: username }));
    }
  };

  if (!user) {
    return (
      <div className="welcome-screen">
        <h1>Welcome to FriendsChat by Nishchup</h1>
        <button onClick={handleLogin}>Sign in with Google</button>
      </div>
    );
  }

  if (!user.displayName || user.displayName === "Anonymous") {
    return (
      <div className="set-username-screen">
        <h2>Set your display name</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a username"
        />
        <button onClick={handleUsernameSubmit}>Continue</button>
      </div>
    );
  }

  return (
    <div className="chat-app relative">
      <DebugOverlay />
      <header className="chat-header">
        <h2>FriendsChat</h2>
        <div>
          <span>{user.displayName}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <aside className="room-sidebar">
        <h3>Rooms</h3>
        {rooms.length ? (
          rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={
                selectedRoom === room.id ? "room-btn active" : "room-btn"
              }
            >
              {room.name}
            </button>
          ))
        ) : (
          <p>No rooms yet</p>
        )}
      </aside>

      <main className="chat-main">
        {selectedRoom ? (
          <ChatWindow roomId={selectedRoom} user={user} />
        ) : (
          <p className="no-room-msg">Select a room to start chatting</p>
        )}
      </main>
    </div>
  );
};

export default ChatApp;
