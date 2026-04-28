// import React, { useState, useEffect, useRef } from 'react';
// import api from './api/axios';
// import { Sidebar } from './components/Sidebar';
// import { GraphView } from './components/GraphView';
// import { Send, User, Bot, Loader2, MessageSquare, Share2, Trash2 } from 'lucide-react';

// interface Message {
//   role: 'user' | 'bot';
//   text: string;
//   meta?: string;
// }

// function App() {
//   const [activeTab, setActiveTab] = useState<'chat' | 'graph'>('chat');
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // 1. القراءة الفورية للشات من Storage
//   const [messages, setMessages] = useState<Message[]>(() => {
//     const savedChat = localStorage.getItem('documind_history');
//     return savedChat ? JSON.parse(savedChat) : [{ role: 'bot', text: 'Welcome Amr! Ready to query your knowledge base.' }];
//   });

//   // 2. القراءة الفورية للملفات
//   const [files, setFiles] = useState<{name: string, status: string}[]>(() => {
//     const savedFiles = localStorage.getItem('documind_files');
//     return savedFiles ? JSON.parse(savedFiles) : [];
//   });

//   // 3. مزامنة الملفات من الداتابيز الحقيقية في الخلفية
//   useEffect(() => {
//     const syncFiles = async () => {
//       try {
//         const res = await api.get('/ingest/files');
//         setFiles(res.data);
//         localStorage.setItem('documind_files', JSON.stringify(res.data));
//       } catch (e) {
//         console.error("Could not fetch files from DB, using local cache.");
//       }
//     };
//     syncFiles();
//   }, []);

//   // 4. حفظ الشات تلقائياً مع كل رسالة جديدة
//   useEffect(() => {
//     localStorage.setItem('documind_history', JSON.stringify(messages));
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     setUploading(true);
//     const formData = new FormData();
//     Array.from(e.target.files).forEach(f => formData.append('files', f));

//     try {
//       await api.post('/ingest/upload', formData);
//       const res = await api.get('/ingest/files');
//       setFiles(res.data);
//       localStorage.setItem('documind_files', JSON.stringify(res.data));
//     } catch (e) { 
//       alert("Upload failed. Please check server connection."); 
//     } finally { 
//       setUploading(false); 
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   // 5. دالة الإرسال المعدلة عشان تقبل نص من الشات أو من الجراف
//   const handleSendMessage = async (overrideQuery?: string | React.MouseEvent) => {
//     // التأكد إن المتغير نص (عشان زرار الإرسال بيبعت Event مش نص)
//     const textToSend = typeof overrideQuery === 'string' ? overrideQuery : input;
    
//     if (!textToSend.trim() || loading) return;

//     const userMsg = { role: 'user' as const, text: textToSend };
//     setMessages(prev => [...prev, userMsg]);
    
//     // تفريغ مربع البحث لو اليوزر هو اللي كتب بايده
//     if (typeof overrideQuery !== 'string') setInput('');
//     setLoading(true);

//     try {
//       const response = await api.post('/search/search', { query: textToSend });
//       const { answer, sources_used } = response.data;
//       const meta = `Claims: ${sources_used.graph_claims_found} | Context: ${sources_used.vector_chunks_used}`;
//       setMessages(prev => [...prev, { role: 'bot', text: answer, meta }]);
//     } catch (error) {
//       setMessages(prev => [...prev, { role: 'bot', text: "❌ Connection to RAG lost." }]);
//     } finally { 
//       setLoading(false); 
//     }
//   };

//   // 6. الدالة السحرية اللي الجراف هيناديها
//   const handleGraphAskAI = (nodeName: string) => {
//     setActiveTab('chat');
//     const aiQuery = `Tell me more about this entity from the knowledge graph: "${nodeName}"`;
//     handleSendMessage(aiQuery);
//   };

//   const clearChat = () => {
//     if (window.confirm("Are you sure you want to clear the chat history?")) {
//       localStorage.removeItem('documind_history');
//       setMessages([{ role: 'bot', text: 'History cleared. Ready for new queries.' }]);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
//       <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" multiple accept=".pdf" />
      
//       <Sidebar files={files} onUploadClick={() => fileInputRef.current?.click()} uploading={uploading} />
      
//       <main className="flex-1 flex flex-col bg-white relative">
//         <header className="h-16 border-b flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-50">
//           <div className="flex items-center gap-6">
//              <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
//                 <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-black transition-all ${activeTab === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
//                   <MessageSquare size={14} /> CHAT AGENT
//                 </button>
//                 <button onClick={() => setActiveTab('graph')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-black transition-all ${activeTab === 'graph' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
//                   <Share2 size={14} /> KNOWLEDGE GRAPH
//                 </button>
//              </nav>
//           </div>
          
//           <button onClick={clearChat} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Clear Chat">
//              <Trash2 size={18} />
//           </button>
//         </header>

//         <div className="flex-1 overflow-hidden relative">
//           {activeTab === 'chat' ? (
//             <div className="h-full flex flex-col">
//               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
//                 <div className="max-w-4xl mx-auto space-y-8">
//                   {messages.map((msg, i) => (
//                     <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'text-left animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
//                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${msg.role === 'bot' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
//                         {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
//                       </div>
//                       <div className={`p-6 rounded-[2rem] max-w-[85%] text-[14px] leading-relaxed shadow-sm border ${msg.role === 'bot' ? 'bg-white border-slate-100 rounded-tl-none' : 'bg-blue-600 text-white border-blue-500 rounded-tr-none'}`}>
//                         {msg.text}
//                         {msg.meta && (
//                           <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center gap-2">
//                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
//                              {msg.meta}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={messagesEndRef} />
//                   {loading && (
//                     <div className="flex gap-4 animate-pulse">
//                       <div className="w-10 h-10 bg-slate-100 rounded-2xl"></div>
//                       <div className="bg-slate-50 h-20 w-80 rounded-[2rem]"></div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="p-8 bg-white border-t">
//                 <div className="max-w-3xl mx-auto relative">
//                   <input 
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//                     placeholder="Ask DocuMind about documents..." 
//                     className="w-full p-5 pl-8 pr-16 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-sm shadow-xl bg-slate-50/50"
//                   />
//                   <button onClick={handleSendMessage} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50">
//                     {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="h-full bg-slate-100 p-8">
//                <div className="h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-[#0f172a]">
//                   {/* تمرير دالة الذكاء الاصطناعي للجراف هنا */}
//                   <GraphView onAskAI={handleGraphAskAI} /> 
//                </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect, useRef } from 'react';
import api from './api/axios';
import { Sidebar } from './components/Sidebar';
import { GraphView } from './components/GraphView';
import {
  Send, Loader2, MessageSquare, Share2, Trash2,
  Cpu, Sparkles
} from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
  meta?: string;
}

// ─── Typing dots animation ────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-4 items-end">
    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
         style={{ background: 'rgba(0,230,255,0.1)', border: '1px solid rgba(0,230,255,0.2)' }}>
      <Cpu size={16} style={{ color: '#00e6ff' }} />
    </div>
    <div className="px-5 py-4 rounded-3xl rounded-bl-lg"
         style={{
           background: 'rgba(255,255,255,0.03)',
           border: '1px solid rgba(255,255,255,0.07)',
         }}>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#00e6ff',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Single message bubble ────────────────────────────────────────────────────
const MessageBubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] px-5 py-4 rounded-3xl rounded-br-lg text-[13.5px] leading-relaxed font-medium"
             style={{
               background: 'linear-gradient(135deg, rgba(37,99,235,0.85) 0%, rgba(99,102,241,0.85) 100%)',
               border: '1px solid rgba(99,102,241,0.4)',
               color: 'rgba(255,255,255,0.95)',
               boxShadow: '0 4px 24px rgba(37,99,235,0.25)',
             }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 items-end">
      {/* Bot avatar */}
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mb-0.5"
           style={{
             background: 'rgba(0,230,255,0.1)',
             border: '1px solid rgba(0,230,255,0.2)',
             boxShadow: '0 0 12px rgba(0,230,255,0.08)',
           }}>
        <Cpu size={16} style={{ color: '#00e6ff' }} />
      </div>

      <div className="max-w-[80%] flex flex-col gap-2">
        {/* Message card */}
        <div className="px-5 py-4 rounded-3xl rounded-bl-lg text-[13.5px] leading-relaxed"
             style={{
               background: 'rgba(255,255,255,0.04)',
               border: '1px solid rgba(255,255,255,0.08)',
               color: 'rgba(220,230,245,0.92)',
               backdropFilter: 'blur(12px)',
             }}>
          {msg.text}
        </div>

        {/* Meta pill */}
        {msg.meta && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit"
               style={{
                 background: 'rgba(0,230,255,0.06)',
                 border: '1px solid rgba(0,230,255,0.15)',
               }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)', animation: 'pulse 2s infinite' }} />
            <span className="text-[9.5px] font-mono tracking-wider"
                  style={{ color: 'rgba(0,230,255,0.65)' }}>
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
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
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
      await api.post('/ingest/upload', formData);
      const res = await api.get('/ingest/files');
      setFiles(res.data);
      localStorage.setItem('documind_files', JSON.stringify(res.data));
    } catch { alert('Upload failed.'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
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

  return (
    <div className="flex h-screen overflow-hidden font-sans"
         style={{ background: '#020617', color: '#e2e8f0' }}>

      {/* Inject bounce keyframe */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        textarea:focus { outline: none; }
      `}</style>

      <input type="file" ref={fileInputRef} onChange={handleUpload}
             className="hidden" multiple accept=".pdf" />

      <Sidebar
        files={files}
        onUploadClick={() => fileInputRef.current?.click()}
        uploading={uploading}
      />

      {/* Main panel */}
      <main className="flex-1 flex flex-col min-w-0 relative"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="h-14 flex items-center justify-between px-6 shrink-0"
                style={{
                  background: 'rgba(2,6,23,0.8)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                }}>

          {/* Tab switcher */}
          <nav className="flex p-1 rounded-xl gap-0.5"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {([
              { id: 'chat',  Icon: MessageSquare, label: 'Chat Agent' },
              { id: 'graph', Icon: Share2,         label: 'Knowledge Graph' },
            ] as const).map(({ id, Icon, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-widest transition-all duration-200"
                  style={{
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: active ? '#ffffff' : 'rgba(100,116,139,0.8)',
                    boxShadow: active ? '0 1px 8px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Clear chat */}
          <button
            onClick={clearChat}
            className="p-2 rounded-lg transition-all duration-200 group"
            style={{ color: 'rgba(100,116,139,0.7)' }}
            title="Clear Chat"
          >
            <Trash2 size={16}
              className="group-hover:text-red-400 transition-colors"
              style={{ color: 'inherit' }} />
          </button>
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
                    <MessageBubble key={i} msg={msg} />
                  ))}

                  {loading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input bar */}
              <div className="px-6 pb-6 pt-3 shrink-0"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-3xl mx-auto relative flex items-end gap-3">

                  <div className="flex-1 rounded-2xl transition-all duration-300"
                       style={{
                         background: 'rgba(255,255,255,0.04)',
                         border: '1px solid rgba(255,255,255,0.09)',
                       }}
                       onFocus={() => {}}
                  >
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
                      className="w-full bg-transparent text-[13.5px] resize-none px-4 py-3.5 leading-relaxed"
                      style={{
                        color: 'rgba(226,232,240,0.9)',
                        fontFamily: 'inherit',
                        caretColor: '#00e6ff',
                      }}
                      // inline focus glow via JS
                      onFocus={e => {
                        (e.currentTarget.parentElement as HTMLElement).style.border =
                          '1px solid rgba(0,230,255,0.35)';
                        (e.currentTarget.parentElement as HTMLElement).style.boxShadow =
                          '0 0 0 3px rgba(0,230,255,0.06)';
                      }}
                      onBlur={e => {
                        (e.currentTarget.parentElement as HTMLElement).style.border =
                          '1px solid rgba(255,255,255,0.09)';
                        (e.currentTarget.parentElement as HTMLElement).style.boxShadow = 'none';
                      }}
                    />

                    {/* Hint */}
                    <div className="flex items-center justify-between px-4 pb-2.5">
                      <span className="text-[9px] font-mono tracking-wider"
                            style={{ color: 'rgba(100,116,139,0.5)' }}>
                        Shift+Enter for new line
                      </span>
                      <Sparkles size={11} style={{ color: 'rgba(0,230,255,0.3)' }} />
                    </div>
                  </div>

                  {/* Send button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !input.trim()}
                    className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
                    style={{
                      background: loading || !input.trim()
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,230,255,0.12)',
                      border: loading || !input.trim()
                        ? '1px solid rgba(255,255,255,0.07)'
                        : '1px solid rgba(0,230,255,0.35)',
                      color: loading || !input.trim()
                        ? 'rgba(100,116,139,0.4)'
                        : '#00e6ff',
                      boxShadow: loading || !input.trim()
                        ? 'none'
                        : '0 0 16px rgba(0,230,255,0.2)',
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
            <div className="h-full p-5">
              <div className="h-full w-full rounded-3xl overflow-hidden"
                   style={{
                     border: '1px solid rgba(0,230,255,0.1)',
                     boxShadow: '0 0 40px rgba(0,230,255,0.05)',
                   }}>
                <GraphView onAskAI={handleGraphAskAI} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;