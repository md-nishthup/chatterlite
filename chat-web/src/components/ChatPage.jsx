import React, { useState } from 'react';
import CallWindow from './CallWindow';
import './ChatPage.css';
import { FaPhone } from 'react-icons/fa'; // Import call icon

export default function ChatPage() {
  const [callActive, setCallActive] = useState(false);

  return (
    <>
      <button className="call-icon" onClick={() => setCallActive(true)}>
        <FaPhone />
      </button>
      {callActive && (
        <div className="fade-in">
          <CallWindow roomUrl="https://chatterlite.daily.co/chatterlite" />
        </div>
      )}
    </>
  );
}
