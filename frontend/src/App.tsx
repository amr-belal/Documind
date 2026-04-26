// import React, { useState } from 'react';
// import api from './api/axios';
// import { Sidebar } from './components/Sidebar';
// import { GraphView } from './components/GraphView';
// import { 
//   Send, User, Bot, Loader2, Sparkles, 
//   MessageSquare, Share2, Zap 
// } from 'lucide-react';

// interface Message {
//   role: 'user' | 'bot';
//   text: string;
//   meta?: string;
// }

// function App() {
//   const [activeTab, setActiveTab] = useState<'chat' | 'graph'>('chat');
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState<Message[]>([
//     { role: 'bot', text: 'Welcome Amr! Ready to query the OptiGraph knowledge base.' }
//   ]);
//   const [loading, setLoading] = useState(false);

//   const handleSendMessage = async () => {
//     if (!input.trim() || loading) return;

//     const userMessage = { role: 'user' as const, text: input };
//     setMessages(prev => [...prev, userMessage]);
//     const currentInput = input;
//     setInput('');
//     setLoading(true);

//     try {
//       // نستخدم المسار اللي اشتغل معاك في البوست مان
//       const response = await api.post('/search/search', { query: currentInput });
//       const { answer, sources_used } = response.data;
      
//       const metadata = `Graph Claims: ${sources_used.graph_claims_found} | Vector Chunks: ${sources_used.vector_chunks_used}`;

//       setMessages(prev => [...prev, { role: 'bot', text: answer, meta: metadata }]);
//     } catch (error) {
//       setMessages(prev => [...prev, { role: 'bot', text: "❌ Error connecting to the RAG pipeline." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
//       <Sidebar />
      
//       <main className="flex-1 flex flex-col bg-white relative">
//         {/* Modern Header with Tabs */}
//         <header className="h-16 border-b flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-50">
//           <div className="flex items-center gap-8">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
//                 <Zap size={16} className="text-white fill-current" />
//               </div>
//               <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">DocuMind</h2>
//             </div>

//             <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
//               <button 
//                 onClick={() => setActiveTab('chat')}
//                 className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-black transition-all ${activeTab === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//               >
//                 <MessageSquare size={14} /> CHAT AGENT
//               </button>
//               <button 
//                 onClick={() => setActiveTab('graph')}
//                 className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-black transition-all ${activeTab === 'graph' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//               >
//                 <Share2 size={14} /> KNOWLEDGE GRAPH
//               </button>
//             </nav>
//           </div>
          
//           <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 uppercase animate-pulse">
//             <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
//             {activeTab === 'chat' ? 'Hybrid RAG Active' : 'Real-time Visualization'}
//           </div>
//         </header>

//         {/* View Switcher */}
//         <div className="flex-1 overflow-hidden relative">
//           {activeTab === 'chat' ? (
//             <div className="h-full flex flex-col">
//               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
//                 <div className="max-w-4xl mx-auto space-y-8">
//                   {messages.map((msg, i) => (
//                     <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'text-left'}`}>
//                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 ${
//                         msg.role === 'bot' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-white border-slate-700'
//                       }`}>
//                         {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
//                       </div>
//                       <div className={`p-6 rounded-[2rem] max-w-[85%] text-[14px] leading-relaxed shadow-sm border ${
//                         msg.role === 'bot' ? 'bg-white border-slate-100 rounded-tl-none' : 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
//                       }`}>
//                         {msg.text}
//                         {msg.meta && (
//                           <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center gap-3 uppercase tracking-widest">
//                              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
//                                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
//                                 {msg.meta}
//                              </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                   {loading && (
//                     <div className="flex gap-4 animate-pulse">
//                       <div className="w-10 h-10 bg-slate-100 rounded-2xl"></div>
//                       <div className="bg-slate-50 h-20 w-80 rounded-[2rem] rounded-tl-none"></div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Chat Input Bar */}
//               <div className="p-8 bg-gradient-to-t from-white via-white to-transparent border-t">
//                 <div className="max-w-3xl mx-auto relative group">
//                   <input 
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//                     placeholder="Ask OptiGraph about research papers..." 
//                     className="w-full p-5 pl-8 pr-16 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-sm shadow-xl bg-slate-50/50 backdrop-blur-sm"
//                   />
//                   <button 
//                     onClick={handleSendMessage}
//                     disabled={loading}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/40"
//                   >
//                     {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="h-full bg-slate-100 p-8">
//                <div className="h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-[#0f172a]">
//                   <GraphView /> 
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
import { Send, User, Bot, Loader2, Sparkles, MessageSquare, Share2, Zap, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
  meta?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'graph'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{name: string, status: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. عند تشغيل الأبلكيشن لأول مرة (Load Data)
  useEffect(() => {
    // تحميل الملفات من الباكيند
    const loadFiles = async () => {
      try {
        const res = await api.get('/ingest/files');
        setFiles(res.data);
      } catch (e) { console.error("Could not fetch files history"); }
    };

    // تحميل الشات من الـ Storage
    const savedChat = localStorage.getItem('documind_history');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([{ role: 'bot', text: 'Welcome Amr! Ready to query your knowledge base.' }]);
    }

    loadFiles();
  }, []);

  // 2. حفظ الشات في الـ Storage كل ما يتغير
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('documind_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(f => formData.append('files', f));

    try {
      await api.post('/ingest/upload', formData);
      const res = await api.get('/ingest/files');
      setFiles(res.data);
    } catch (e) { alert("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/search/search', { query: currentInput });
      const { answer, sources_used } = response.data;
      const meta = `Claims: ${sources_used.graph_claims_found} | Context: ${sources_used.vector_chunks_used}`;
      setMessages(prev => [...prev, { role: 'bot', text: answer, meta }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "❌ Connection to RAG lost." }]);
    } finally { setLoading(false); }
  };

  const clearChat = () => {
    localStorage.removeItem('documind_history');
    setMessages([{ role: 'bot', text: 'History cleared. Ready for new queries.' }]);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" multiple accept=".pdf" />
      
      <Sidebar files={files} onUploadClick={() => fileInputRef.current?.click()} uploading={uploading} />
      
      <main className="flex-1 flex flex-col bg-white relative">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-6">
             <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-black transition-all ${activeTab === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                  <MessageSquare size={14} /> CHAT AGENT
                </button>
                <button onClick={() => setActiveTab('graph')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-black transition-all ${activeTab === 'graph' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                  <Share2 size={14} /> KNOWLEDGE GRAPH
                </button>
             </nav>
          </div>
          
          <button onClick={clearChat} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Clear Chat">
             <Trash2 size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'text-left animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${msg.role === 'bot' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
                        {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
                      </div>
                      <div className={`p-6 rounded-[2rem] max-w-[85%] text-[14px] leading-relaxed shadow-sm border ${msg.role === 'bot' ? 'bg-white border-slate-100 rounded-tl-none' : 'bg-blue-600 text-white border-blue-500 rounded-tr-none'}`}>
                        {msg.text}
                        {msg.meta && (
                          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                             {msg.meta}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-4 animate-pulse">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl"></div>
                      <div className="bg-slate-50 h-20 w-80 rounded-[2rem]"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-white border-t">
                <div className="max-w-3xl mx-auto relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Amr's AI about documents..." 
                    className="w-full p-5 pl-8 pr-16 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-sm shadow-xl bg-slate-50/50"
                  />
                  <button onClick={handleSendMessage} disabled={loading} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-100 p-8">
               <div className="h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-[#0f172a]">
                  <GraphView /> 
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;