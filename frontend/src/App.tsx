import React, { useState, useEffect, useRef } from 'react';
import api from './api/axios';
import { Sidebar } from './components/Sidebar';
import { GraphView } from './components/GraphView';
import { ThemeToggle } from './components/ThemeToggle';
import {
  Send, Loader2, MessageSquare, Share2, Trash2,
  Cpu, Sparkles
} from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
  meta?: string;
}

type Theme = 'dark' | 'light';

// ─── Typing dots animation ────────────────────────────────────────────────────
const TypingIndicator = ({ theme }: { theme: Theme }) => {
  const isDark = theme === 'dark';
  return (
    <div className="flex gap-3.5 items-end">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
           style={{
             background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
             boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
           }}>
        <Cpu size={16} className="text-white" />
      </div>
      <div className="px-5 py-4 rounded-3xl rounded-bl-lg"
           style={{
             background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
             border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e2e8f0',
             boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
           }}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isDark ? '#00e6ff' : '#3b82f6',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Single message bubble ────────────────────────────────────────────────────
const MessageBubble = ({ msg, theme }: { msg: Message; theme: Theme }) => {
  const isUser = msg.role === 'user';
  const isDark = theme === 'dark';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] px-5 py-3.5 rounded-3xl rounded-br-lg text-[13.5px] leading-relaxed font-medium text-white"
             style={{
               background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
               boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
             }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 items-end">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mb-0.5"
           style={{
             background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
             boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
           }}>
        <Cpu size={16} className="text-white" />
      </div>

      <div className="max-w-[80%] flex flex-col gap-2">
        <div className="px-5 py-3.5 rounded-3xl rounded-bl-lg text-[13.5px] leading-relaxed"
             style={{
               background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
               border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
               color: isDark ? 'rgba(220,230,245,0.92)' : '#334155',
               backdropFilter: isDark ? 'blur(12px)' : 'none',
               boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
             }}>
          {msg.text}
        </div>

        {msg.meta && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit"
               style={{
                 background: isDark ? 'rgba(0,230,255,0.06)' : '#eff6ff',
                 border: isDark ? '1px solid rgba(0,230,255,0.15)' : '1px solid #dbeafe',
               }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"
                  style={{ boxShadow: '0 0 6px rgba(34,197,94,0.6)', animation: 'pulse 2s infinite' }} />
            <span className="text-[9.5px] font-mono tracking-wider font-semibold"
                  style={{ color: isDark ? 'rgba(0,230,255,0.65)' : '#2563eb' }}>
              {msg.meta}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'graph'>('chat');
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  // ─── Theme state (persisted) ───────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('documind_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('documind_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('documind_history');
    return saved
      ? JSON.parse(saved)
      : [{ role: 'bot', text: 'Welcome Amr! Ready to query your knowledge base.' }];
  });

  const [files, setFiles] = useState<{ name: string; status: string }[]>(() => {
    const saved = localStorage.getItem('documind_files');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    api.get('/ingest/files').then(res => {
      setFiles(res.data);
      localStorage.setItem('documind_files', JSON.stringify(res.data));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('documind_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(f => formData.append('files', f));
    try {
      // 🔴 التعديل هنا: إضافة الـ Headers
      await api.post('/ingest/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const res = await api.get('/ingest/files');
      setFiles(res.data);
      localStorage.setItem('documind_files', JSON.stringify(res.data));
    } catch { 
      alert('Upload failed.'); 
    } finally { 
      setUploading(false); 
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/search/search', { query: text });
      const meta = `Claims: ${data.sources_used.graph_claims_found} | Context: ${data.sources_used.vector_chunks_used}`;
      setMessages(prev => [...prev, { role: 'bot', text: data.answer, meta }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Connection to RAG lost.' }]);
    } finally { setLoading(false); }
  };

  const handleSendMessage = (overrideQuery?: string | React.MouseEvent) => {
    const text = typeof overrideQuery === 'string' ? overrideQuery : input;
    sendMessage(text);
  };

  const handleGraphAskAI = (nodeName: string) => {
    setActiveTab('chat');
    sendMessage(`Tell me more about this entity from the knowledge graph: "${nodeName}"`);
  };

  const clearChat = () => {
    if (window.confirm('Clear chat history?')) {
      localStorage.removeItem('documind_history');
      setMessages([{ role: 'bot', text: 'History cleared. Ready for new queries.' }]);
    }
  };

  // ─── Theme-aware classes ───────────────────────────────────────────
  const mainBg     = isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]';
  const mainText   = isDark ? 'text-slate-100' : 'text-slate-900';
  const headerBg   = isDark ? 'bg-[#020617]/80' : 'bg-white/80';
  const headerBdr  = isDark ? 'border-white/5' : 'border-slate-200/70';
  const tabsBg     = isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200/70';
  const inactiveTabCls = isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700';
  const activeTabCls   = isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm';
  const trashCls   = isDark
    ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
    : 'text-slate-400 hover:text-red-500 hover:bg-red-50';

  const inputBarBg = isDark ? 'bg-[#020617]/70 border-white/5' : 'bg-white/70 border-slate-200/70';
  const inputWrapBg = isDark
    ? 'bg-white/5 border border-white/10'
    : 'bg-white border border-slate-200 shadow-sm';
  const inputTextCls = isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400';
  const hintCls = isDark ? 'text-slate-500' : 'text-slate-400';

  const scrollbarStyle = isDark
    ? `.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
       .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }`
    : `.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.1); }
       .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.2); }`;

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-[#020617]' : 'bg-white'}`}>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        ${scrollbarStyle}
        textarea:focus { outline: none; }
      `}</style>

      <input type="file" ref={fileInputRef} onChange={handleUpload}
             className="hidden" multiple accept=".pdf" />

      <Sidebar
        files={files}
        onUploadClick={() => fileInputRef.current?.click()}
        uploading={uploading}
        theme={theme}
      />

      {/* Main panel */}
      <main className={`flex-1 flex flex-col min-w-0 relative transition-colors duration-300 ${mainBg} ${mainText}`}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className={`h-14 flex items-center justify-between px-6 shrink-0 backdrop-blur-md border-b sticky top-0 z-30 ${headerBg} ${headerBdr}`}>

          {/* Tab switcher */}
          <nav className={`flex p-1 rounded-xl gap-0.5 border ${tabsBg}`}>
            {([
              { id: 'chat',  Icon: MessageSquare, label: 'Chat Agent' },
              { id: 'graph', Icon: Share2,         label: 'Knowledge Graph' },
            ] as const).map(({ id, Icon, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-widest transition-all duration-200 ${
                    active ? activeTabCls : inactiveTabCls
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right side: theme toggle + clear */}
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <div className={`w-px h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

            <button
              onClick={clearChat}
              className={`p-2 rounded-lg transition-all duration-200 ${trashCls}`}
              title="Clear Chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden relative">

          {/* ── CHAT TAB ── */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">

                  {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} theme={theme} />
                  ))}

                  {loading && <TypingIndicator theme={theme} />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input bar */}
              <div className={`px-6 pb-6 pt-3 shrink-0 backdrop-blur-md border-t ${inputBarBg}`}>
                <div className="max-w-3xl mx-auto relative flex items-end gap-3">

                  <div className={`flex-1 rounded-2xl transition-all duration-300 ${inputWrapBg}`}>
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask DocuMind about your documents…"
                      className={`w-full bg-transparent text-[13.5px] resize-none px-4 py-3.5 leading-relaxed ${inputTextCls}`}
                      style={{
                        fontFamily: 'inherit',
                        caretColor: isDark ? '#00e6ff' : '#2563eb',
                      }}
                      onFocus={e => {
                        const w = e.currentTarget.parentElement as HTMLElement;
                        if (isDark) {
                          w.style.borderColor = 'rgba(0,230,255,0.35)';
                          w.style.boxShadow = '0 0 0 3px rgba(0,230,255,0.06)';
                        } else {
                          w.style.borderColor = 'rgba(37,99,235,0.5)';
                          w.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.08)';
                        }
                      }}
                      onBlur={e => {
                        const w = e.currentTarget.parentElement as HTMLElement;
                        w.style.borderColor = '';
                        w.style.boxShadow = '';
                      }}
                    />

                    {/* Hint */}
                    <div className="flex items-center justify-between px-4 pb-2.5">
                      <span className={`text-[9px] font-mono tracking-wider ${hintCls}`}>
                        Shift+Enter for new line
                      </span>
                      <Sparkles size={11} className={isDark ? 'text-cyan-400/40' : 'text-blue-400'} />
                    </div>
                  </div>

                  {/* Send button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !input.trim()}
                    className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
                    style={{
                      background: loading || !input.trim()
                        ? (isDark ? 'rgba(255,255,255,0.04)' : '#e2e8f0')
                        : 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                      border: loading || !input.trim()
                        ? (isDark ? '1px solid rgba(255,255,255,0.07)' : 'none')
                        : 'none',
                      color: loading || !input.trim()
                        ? (isDark ? 'rgba(100,116,139,0.4)' : '#94a3b8')
                        : '#ffffff',
                      boxShadow: loading || !input.trim()
                        ? 'none'
                        : '0 4px 16px rgba(37,99,235,0.35)',
                    }}
                  >
                    {loading
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Send size={15} />
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── GRAPH TAB ── */}
          {activeTab === 'graph' && (
            <div className={`h-full p-5 ${isDark ? 'bg-[#020617]' : 'bg-slate-100'}`}>
              <div className={`h-full w-full rounded-3xl overflow-hidden shadow-2xl ${
                isDark ? 'border border-cyan-500/10' : 'border-8 border-white'
              }`}>
                <GraphView onAskAI={handleGraphAskAI} theme={theme} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;