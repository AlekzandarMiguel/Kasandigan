import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Clock, User, ShieldCheck, CheckCheck } from 'lucide-react';
import api from '../services/api';

export const TicketChatModal = ({ requestId, requestTitle, isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!requestId) return;
    try {
      const res = await api.get(`/requests/${requestId}/messages/`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !requestId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/requests/${requestId}/messages/`, {
        message: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg h-[580px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in">
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <MessageSquare className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Ticket Secure Chat</div>
              <h3 className="text-sm font-black text-white truncate max-w-[240px] sm:max-w-xs">{requestTitle}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-100 text-[11px] text-amber-800 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Ticket communications are private and monitored by barangay safety moderators.</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Connecting to secure ticket thread...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-700">No Messages Yet</div>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Coordinate task details, materials needed, exact address, or schedule updates directly with your counterpart.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-1">
                    <span>{isMe ? 'You' : msg.sender_name}</span>
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message to coordinate..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketChatModal;
