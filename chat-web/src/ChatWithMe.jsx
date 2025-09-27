import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './components/ui/MessageInput';

const ChatWithMe = ({ onBack }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your ChatWithMe bot. Ask me anything.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const botReply =
        data.choices?.[0]?.message || { role: 'assistant', content: 'No response from bot.' };
      setMessages((prev) => [...prev, botReply]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E2F] text-white relative">
      {/* Mobile Back */}
      <div className="flex items-center gap-3 p-4 border-b border-[#2a2a40] bg-[#222236] sticky top-0 z-20">
        <button
          onClick={() => onBack && onBack()}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#2a2a40] hover:bg-[#34344a] text-gray-200"
          aria-label="Back"
        >
          ←
        </button>
        <img
          src="https://cdn-icons-png.flaticon.com/512/4712/4712106.png"
          alt="Bot"
          className="w-10 h-10 rounded-full border border-[#39FF14]"
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-[#39FF14]">ChatWithMe</h1>
          <p className="text-xs text-gray-400">Online - Ask anything!</p>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl shadow text-sm md:text-base leading-snug ${
                msg.role === 'user' ? 'bg-[#39FF14] text-black' : 'bg-[#2a2a40] text-white'
              } whitespace-pre-wrap break-words`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm pl-1">
            <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-150" />
            <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-300" />
            <span className="ml-2">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#2a2a40] bg-[#222236]">
        <MessageInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          disabled={loading}
          placeholder={
            loading ? 'Please wait...' : 'Type your message (Enter x2 to send)'
          }
        />
      </div>
    </div>
  );
};

export default ChatWithMe;
