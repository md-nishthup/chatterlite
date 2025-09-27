import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './BotSection.css';
import './ChatWithMe.css';

const BotSection = () => {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Hi! I'm your ChatterLite Assistant, created by Nischup. 
Ask me anything! The version 1.0 will have OpenAI API giving you ChatGPT like interface. 
This is from Groq API, just a prototype, so you may have poor experience.`,
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Sound effects
  const sendAudio = useRef(null);
  const receiveAudio = useRef(null);

  // Preload audio on mount
  useEffect(() => {
    sendAudio.current?.load();
    receiveAudio.current?.load();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (sendAudio.current)
      sendAudio.current
        .play()
        .catch((e) => console.error('Send audio error:', e.message));

    // Fake loading effect
    const loadingMsg = { from: 'bot', text: 'Typing...' };
    setMessages((prev) => [...prev, loadingMsg]);

    // Check for 'who created you' intent
    const lowerInput = input.trim().toLowerCase();
    if (
      lowerInput.includes('who created you') ||
      lowerInput.includes('who made you') ||
      lowerInput.includes('your creator') ||
      lowerInput.includes('who is your creator') ||
      lowerInput.includes('you are created by whom  ') ||
      lowerInput.includes('who is your owner') ||
      lowerInput.includes('who is your developer') ||
      lowerInput.includes('who is your father') ||
      lowerInput.includes('who is your mother') ||
      lowerInput.includes('who is your maker') ||
      lowerInput.includes('who is your god') ||
      lowerInput.includes('who is your boss') ||
      lowerInput.includes('who is your parent') ||
      lowerInput.includes('who is your creator?') ||
      lowerInput.includes('who made you?')
    ) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { from: 'bot', text: 'Nischup created me , he is my owner :).' },
        ]);
        if (receiveAudio.current)
          receiveAudio.current
            .play()
            .catch((e) => console.error('Receive audio error:', e.message));
      }, 600);
      return;
    }

    try {
      const botResponse = await getBotReply(input);

      setMessages((prev) => [
        ...prev.slice(0, -1), // remove "Typing..."
        { from: 'bot', text: botResponse },
      ]);
      if (receiveAudio.current)
        receiveAudio.current
          .play()
          .catch((e) => console.error('Receive audio error:', e.message));
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { from: 'bot', text: 'Sorry, something went wrong.' },
      ]);
      if (receiveAudio.current)
        receiveAudio.current
          .play()
          .catch((e) => console.error('Receive audio error:', e.message));
    }
  };

  async function getBotReply(prompt) {
    try {
  const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const botReply =
        data.assistant?.content || 'Sorry, no response from bot.';
      return botReply;
    } catch (error) {
      console.error('Failed to get bot response:', error.message);
      return "Sorry, I couldn't get a response from the bot.";
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bot-section-bg">
      {/* Sound effects */}
      <audio ref={sendAudio} src="/sent.mp3" preload="auto" />
      <audio ref={receiveAudio} src="/receive.mp3" preload="auto" />

      {/* Header for Bot Chat */}
      <div className="chat-header flex items-center justify-between bg-[#1f2a40] p-3 border-b border-[#232b3e]">
        <div className="flex items-center gap-3">
          <img
            src="/logo/d1db3fbf-d99d-4dda-8250-085369444801.png"
            alt="bot avatar"
            className="chatwithme-bot-avatar"
          />
          <span className="font-semibold text-[var(--accent)]">
            ChatWithMe Bot
          </span>
          <span className="status-badge text-green-500 bg-green-900/80">
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages flex-1 overflow-y-auto p-4 space-y-2 bg-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${
              msg.from === 'user'
                ? 'self-end outgoing neon-user-bubble'
                : 'self-start incoming neon-bot-bubble'
            }`}
          >
            <div className="msg-content neon-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        className="send-message flex items-center gap-2 p-4 border-t bg-[#1f2a40]/80"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ position: 'sticky', bottom: 0, zIndex: 30 }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-2xl border-none bg-[#232b3e] text-[var(--text-primary)] text-base shadow focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          style={{ fontSize: '1.13rem', fontWeight: 500 }}
          onKeyDown={handleKeyPress}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] hover:from-[var(--accent-light)] hover:to-[var(--accent)] text-white px-6 py-3 rounded-2xl font-bold text-base shadow transition"
          style={{ minWidth: 80 }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default BotSection;
