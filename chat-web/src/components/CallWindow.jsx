import React, { useState, useEffect, useRef } from 'react';

export default function CallWindow({
  currentUser,
  otherUser,
  callStatus = 'ringing', // 'ringing' | 'active' | 'ended'
  isIncoming = false,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
  onToggleVideo,
  onAIAssistantJoin,
  callDuration = 0,
  localStream,
  remoteStream,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Handle stream attachments
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  // Format call duration
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className={`call-window ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="call-header">
        <button
          className="minimize-btn"
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? 'Maximize' : 'Minimize'}
        >
          {isMinimized ? '↗' : '–'}
        </button>
        <h3 className="call-title">
          {callStatus === 'active' ? formatTime(callDuration) : 'Calling...'}
        </h3>
        <div className="call-status">
          {callStatus === 'ringing' &&
            (isIncoming ? 'Incoming Call' : 'Ringing...')}
        </div>
      </div>

      {/* Main Content */}
      {!isMinimized && (
        <div className="call-content">
          {/* Remote Video/Avatar */}
          <div className="remote-media">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="remote-video"
              />
            ) : (
              <div className="user-avatar">
                <img
                  src={otherUser.photoURL || '/default-avatar.png'}
                  alt={otherUser.displayName}
                />
                <div className="user-name">{otherUser.displayName}</div>
              </div>
            )}
          </div>

          {/* Local Video Preview */}
          {localStream && (
            <div className="local-preview">
              <video ref={localVideoRef} autoPlay playsInline muted />
            </div>
          )}

          {/* Call Controls */}
          <div className="call-controls">
            {callStatus === 'ringing' && isIncoming ? (
              <>
                <button className="control-btn accept" onClick={onAccept}>
                  <i className="icon-phone"></i>
                </button>
                <button className="control-btn reject" onClick={onReject}>
                  <i className="icon-phone-off"></i>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`control-btn ${onToggleVideo ? 'active' : ''}`}
                  onClick={onToggleVideo}
                >
                  <i className="icon-video"></i>
                </button>
                <button
                  className={`control-btn ${onToggleMute ? 'active' : ''}`}
                  onClick={onToggleMute}
                >
                  <i className="icon-mic"></i>
                </button>
                <button
                  className={`control-btn ${onToggleSpeaker ? 'active' : ''}`}
                  onClick={onToggleSpeaker}
                >
                  <i className="icon-volume-2"></i>
                </button>
                <button
                  className="control-btn ai-assistant"
                  onClick={onAIAssistantJoin}
                >
                  <i className="icon-robot"></i>
                </button>
                <button className="control-btn end-call" onClick={onEnd}>
                  <i className="icon-phone-off"></i>
                </button>
              </>
            )}
          </div>

          {/* Call Metadata */}
          <div className="call-meta">
            <div className="connection-status">
              <span className="indicator"></span>
              <span>Secure E2E Encrypted</span>
            </div>
            {callStatus === 'active' && (
              <button className="add-participant">
                <i className="icon-user-plus"></i> Add Participant
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
