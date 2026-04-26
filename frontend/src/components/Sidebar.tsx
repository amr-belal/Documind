// import React, { useRef, useState } from 'react';
// import api from '../api/axios';

// export const Sidebar = () => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);
//   const [statusMsg, setStatusMsg] = useState('');

//   const handleUploadClick = () => fileInputRef.current?.click();

//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     setUploading(true);
//     setStatusMsg(`🚀 Uploading ${files.length} files...`);
    
//     const formData = new FormData();
//     // مهم جداً: الـ Key لازم يكون 'files' عشان يطابق الـ Backend
//     Array.from(files).forEach((file) => {
//       formData.append('files', file); 
//     });

//     try {
//       console.log("📤 Sending bulk upload request...");
//       const response = await api.post('/ingest/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       console.log("✅ Backend Response:", response.data);
//       setStatusMsg(`✅ Successfully uploaded ${files.length} files!`);
//     } catch (error: any) {
//       console.error("❌ Upload Error:", error.response?.data || error.message);
//       setStatusMsg(`❌ Error: ${error.response?.status === 404 ? 'Route Not Found' : 'Check Logs'}`);
//     } finally {
//       setUploading(false);
//       setTimeout(() => setStatusMsg(''), 5000);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shadow-xl h-screen border-r border-slate-800">
//       <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-800/50">
//         <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">D</div>
//         <div className="flex flex-col text-left">
//           <span className="text-lg font-bold leading-none">DocuMind</span>
//           <span className="text-[10px] text-blue-500 font-mono tracking-tighter">PIPELINE READY</span>
//         </div>
//       </div>

//       <div className="flex-1">
//         <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.2em] font-bold text-left">Management</p>
        
//         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />

//         <button 
//           onClick={handleUploadClick}
//           disabled={uploading}
//           className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl transition-all font-bold shadow-2xl ${
//             uploading ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
//           }`}
//         >
//           {uploading ? (
//              <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
//           ) : (
//             "+ UPLOAD PDFS"
//           )}
//         </button>

//         {statusMsg && (
//           <div className={`mt-4 p-3 rounded-xl text-[11px] font-medium leading-relaxed border ${
//             statusMsg.includes('❌') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
//           }`}>
//             {statusMsg}
//           </div>
//         )}

//         <div className="mt-12 text-left">
//           <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 font-bold">Systems Health</p>
//           <div className="space-y-3">
//              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800">
//                 <span className="text-xs text-slate-400">Celery Worker</span>
//                 <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
//              </div>
//              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800">
//                 <span className="text-xs text-slate-400">Kafka Broker</span>
//                 <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
//              </div>
//           </div>
//         </div>
//       </div>

//       <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-600 font-mono">
//         <span>V1.0.0-STABLE</span>
//         <div className="flex items-center gap-1">
//           <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
//           <span>API LIVE</span>
//         </div>
//       </div>
//     </aside>
//   );
// };

import React, { useRef, useState } from 'react';
import api from '../api/axios';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  LayoutDashboard, 
  Database, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react'; // أيقونات احترافية

export const Sidebar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // داتا وهمية أو قائمة للملفات المرفوعة حالياً لتحسين الـ UX
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, status: string}[]>([]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setStatusMsg(`🚀 Processing ${files.length} files...`);
    
    // إضافة الملفات للقائمة بشكل مؤقت لمتابعة الرفع
    const newFiles = Array.from(files).map(f => ({ name: f.name, status: 'uploading' }));
    setUploadedFiles(prev => [...newFiles, ...prev]);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file); 
    });

    try {
      const response = await api.post('/ingest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatusMsg(`✅ Upload Complete`);
      // تحديث الحالة لـ Success
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
    } catch (error: any) {
      setStatusMsg(`❌ Upload Failed`);
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
    } finally {
      setUploading(false);
      setTimeout(() => setStatusMsg(''), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <aside className="w-72 bg-[#0f172a] text-slate-300 p-6 flex flex-col h-screen border-r border-slate-800 transition-all shadow-2xl">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-800/60">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform hover:rotate-12 transition-transform">
          <Database className="text-white" size={22} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xl font-bold text-white tracking-tight">DocuMind</span>
          <span className="text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase">AI Engine v1.0</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8 overflow-hidden">
        
        {/* Main Action */}
        <section>
          <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.2em] font-bold text-left">Actions</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
          
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className={`w-full group relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl transition-all font-bold overflow-hidden ${
              uploading 
              ? 'bg-slate-800 text-slate-500 cursor-wait border border-slate-700' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'
            }`}
          >
            {uploading ? (
               <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <UploadCloud size={20} className="group-hover:-translate-y-1 transition-transform" />
                <span>UPLOAD PAPERS</span>
              </>
            )}
          </button>
        </section>

        {/* Files Library (هنا التحسين الحقيقي) */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.2em] font-bold text-left">Recent Uploads</p>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-20">
                <FileText size={40} />
                <span className="text-xs mt-2 italic">Library empty</span>
              </div>
            ) : (
              uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                  <FileText size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="flex-1 text-[11px] truncate text-slate-300 text-left font-medium">{file.name}</span>
                  {file.status === 'uploading' && <Loader2 size={12} className="animate-spin text-blue-500" />}
                  {file.status === 'success' && <CheckCircle2 size={12} className="text-green-500" />}
                  {file.status === 'error' && <AlertCircle size={12} className="text-red-500" />}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Systems Health */}
        <section className="mb-4">
          <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.2em] font-bold text-left">Infrastructure</p>
          <div className="space-y-2">
             <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                   <span className="text-[10px] text-slate-400 font-medium">Worker Node</span>
                </div>
                <ShieldCheck size={12} className="text-slate-600" />
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                   <span className="text-[10px] text-slate-400 font-medium">Kafka Broker</span>
                </div>
                <Database size={12} className="text-slate-600" />
             </div>
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-slate-800/60 flex justify-between items-center text-[9px] text-slate-600 font-mono tracking-widest uppercase">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-blue-500/20 rounded-full flex items-center justify-center">
             <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
           </span>
           <span>API Stable</span>
        </div>
        <span>v1.2.0</span>
      </div>
    </aside>
  );
};