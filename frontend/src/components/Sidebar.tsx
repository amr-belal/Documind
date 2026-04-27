// import React, { useRef, useState, useEffect } from 'react';
// import api from '../api/axios';
// import { 
//   UploadCloud, 
//   FileText, 
//   CheckCircle2, 
//   Loader2, 
//   LayoutDashboard, 
//   Database, 
//   ShieldCheck,
//   AlertCircle 
// } from 'lucide-react'; // أيقونات احترافية

// export const Sidebar = () => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);
//   const [statusMsg, setStatusMsg] = useState('');
  
//   // داتا وهمية أو قائمة للملفات المرفوعة حالياً لتحسين الـ UX
//   const [uploadedFiles, setUploadedFiles] = useState<{name: string, status: string}[]>([]);

//   const handleUploadClick = () => fileInputRef.current?.click();

//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     setUploading(true);
//     setStatusMsg(`🚀 Processing ${files.length} files...`);
    
//     // إضافة الملفات للقائمة بشكل مؤقت لمتابعة الرفع
//     const newFiles = Array.from(files).map(f => ({ name: f.name, status: 'uploading' }));
//     setUploadedFiles(prev => [...newFiles, ...prev]);

//     const formData = new FormData();
//     Array.from(files).forEach((file) => {
//       formData.append('files', file); 
//     });

//     try {
//       const response = await api.post('/ingest/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
      
//       setStatusMsg(`✅ Upload Complete`);
//       // تحديث الحالة لـ Success
//       setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
//     } catch (error: any) {
//       setStatusMsg(`❌ Upload Failed`);
//       setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
//     } finally {
//       setUploading(false);
//       setTimeout(() => setStatusMsg(''), 5000);
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <aside className="w-72 bg-[#0f172a] text-slate-300 p-6 flex flex-col h-screen border-r border-slate-800 transition-all shadow-2xl">
      
//       {/* Brand Header */}
//       <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-800/60">
//         <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform hover:rotate-12 transition-transform">
//           <Database className="text-white" size={22} />
//         </div>
//         <div className="flex flex-col text-left">
//           <span className="text-xl font-bold text-white tracking-tight">DocuMind</span>
//           <span className="text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase">AI Engine v1.0</span>
//         </div>
//       </div>

//       <div className="flex-1 flex flex-col gap-8 overflow-hidden">
        
//         {/* Main Action */}
//         <section>
//           <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.2em] font-bold text-left">Actions</p>
//           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
          
//           <button 
//             onClick={handleUploadClick}
//             disabled={uploading}
//             className={`w-full group relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl transition-all font-bold overflow-hidden ${
//               uploading 
//               ? 'bg-slate-800 text-slate-500 cursor-wait border border-slate-700' 
//               : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'
//             }`}
//           >
//             {uploading ? (
//                <Loader2 className="animate-spin" size={20} />
//             ) : (
//               <>
//                 <UploadCloud size={20} className="group-hover:-translate-y-1 transition-transform" />
//                 <span>UPLOAD PAPERS</span>
//               </>
//             )}
//           </button>
//         </section>

//         {/* Files Library (هنا التحسين الحقيقي) */}
//         <section className="flex-1 flex flex-col overflow-hidden">
//           <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.2em] font-bold text-left">Recent Uploads</p>
//           <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
//             {uploadedFiles.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-10 opacity-20">
//                 <FileText size={40} />
//                 <span className="text-xs mt-2 italic">Library empty</span>
//               </div>
//             ) : (
//               uploadedFiles.map((file, idx) => (
//                 <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors group">
//                   <FileText size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
//                   <span className="flex-1 text-[11px] truncate text-slate-300 text-left font-medium">{file.name}</span>
//                   {file.status === 'uploading' && <Loader2 size={12} className="animate-spin text-blue-500" />}
//                   {file.status === 'success' && <CheckCircle2 size={12} className="text-green-500" />}
//                   {file.status === 'error' && <AlertCircle size={12} className="text-red-500" />}
//                 </div>
//               ))
//             )}
//           </div>
//         </section>
        

//         {/* Systems Health */}
//         <section className="mb-4">
//           <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.2em] font-bold text-left">Infrastructure</p>
//           <div className="space-y-2">
//              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
//                 <div className="flex items-center gap-2">
//                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
//                    <span className="text-[10px] text-slate-400 font-medium">Worker Node</span>
//                 </div>
//                 <ShieldCheck size={12} className="text-slate-600" />
//              </div>
//              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
//                 <div className="flex items-center gap-2">
//                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
//                    <span className="text-[10px] text-slate-400 font-medium">Kafka Broker</span>
//                 </div>
//                 <Database size={12} className="text-slate-600" />
//              </div>
//           </div>
//         </section>
//       </div>

//       {/* Footer Info */}
//       <div className="pt-6 border-t border-slate-800/60 flex justify-between items-center text-[9px] text-slate-600 font-mono tracking-widest uppercase">
//         <div className="flex items-center gap-2">
//            <span className="w-2 h-2 bg-blue-500/20 rounded-full flex items-center justify-center">
//              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
//            </span>
//            <span>API Stable</span>
//         </div>
//         <span>v1.2.0</span>
//       </div>
//     </aside>



//   );
// };


import React, { useRef, useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Database, 
  ShieldCheck,
  AlertCircle,
  Zap
} from 'lucide-react';

export const Sidebar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, status: string}[]>([]);

  // --- التحديث الجديد: جلب الملفات عند تحميل الصفحة (Persistence) ---
  useEffect(() => {
    const fetchExistingFiles = async () => {
      try {
        const response = await api.get('/ingest/files');
        // تحديث القائمة بالبيانات القادمة من PostgreSQL
        if (response.data) {
          setUploadedFiles(response.data);
        }
      } catch (error) {
        console.error("❌ Failed to load existing files:", error);
      }
    };

    fetchExistingFiles();
  }, []); 

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setStatusMsg(`🚀 Processing ${files.length} files...`);
    
    // إضافة الملفات للقائمة بشكل مؤقت (Optimistic UI)
    const newFiles = Array.from(files).map(f => ({ name: f.name, status: 'uploading' }));
    setUploadedFiles(prev => [...newFiles, ...prev]);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file); 
    });

    try {
      await api.post('/ingest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatusMsg(`✅ Upload Complete`);
      
      // إعادة جلب القائمة المحدثة من الباك إند للتأكد من المزامنة
      const refreshRes = await api.get('/ingest/files');
      setUploadedFiles(refreshRes.data);

    } catch (error: any) {
      setStatusMsg(`❌ Upload Failed`);
      setUploadedFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'error' } : f));
    } finally {
      setUploading(false);
      setTimeout(() => setStatusMsg(''), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <aside className="w-80 bg-[#020617] text-slate-400 p-6 flex flex-col h-screen border-r border-slate-800/50 relative shadow-2xl">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-800/40">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transform hover:rotate-6 transition-transform">
          <Zap className="text-white fill-current" size={20} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-lg font-black text-white tracking-tight leading-none">DocuMind</span>
          <span className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase mt-1">Graph Engine v1.2</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8 overflow-hidden">
        
        {/* Action Button */}
        <section>
          <p className="text-[10px] text-slate-600 mb-4 uppercase tracking-[0.2em] font-black text-left">Management</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
          
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className={`w-full group flex items-center justify-center gap-3 py-4 px-4 rounded-2xl transition-all font-bold shadow-xl ${
              uploading 
              ? 'bg-slate-900 text-slate-600 cursor-wait border border-slate-800' 
              : 'bg-white text-black hover:bg-slate-200 active:scale-95'
            }`}
          >
            {uploading ? (
               <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <UploadCloud size={20} />
                <span className="text-xs uppercase tracking-widest">Upload Papers</span>
              </>
            )}
          </button>
          {statusMsg && <p className="text-[10px] mt-3 text-center font-bold text-blue-400 animate-pulse">{statusMsg}</p>}
        </section>

        {/* Library Section */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <p className="text-[10px] text-slate-600 mb-4 uppercase tracking-[0.2em] font-black text-left">Knowledge Base</p>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-20 border-2 border-dashed border-slate-800 rounded-3xl">
                <FileText size={32} />
                <span className="text-[10px] mt-3 font-bold uppercase tracking-widest">Library Empty</span>
              </div>
            ) : (
              uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-900/40 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all group">
                  <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600/10 transition-colors">
                    <FileText size={14} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <span className="flex-1 text-[11px] truncate text-slate-300 text-left font-bold">{file.name}</span>
                  {file.status === 'uploading' && <Loader2 size={12} className="animate-spin text-blue-500" />}
                  {file.status === 'success' && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  )}
                  {file.status === 'error' && <AlertCircle size={14} className="text-red-500" />}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Infrastructure Health */}
        <section className="mb-6 pt-6 border-t border-slate-800/40">
          <p className="text-[10px] text-slate-600 mb-4 uppercase tracking-[0.2em] font-black text-left">Infrastructure</p>
          <div className="grid grid-cols-2 gap-2">
             <div className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-2xl border border-slate-800/30">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-[9px] text-slate-500 font-bold uppercase">Worker</span>
             </div>
             <div className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-2xl border border-slate-800/30">
                <Database size={14} className="text-indigo-500" />
                <span className="text-[9px] text-slate-500 font-bold uppercase">Neo4j</span>
             </div>
          </div>
        </section>
      </div>

      {/* User Footer */}
      <div className="mt-auto pt-6 border-t border-slate-800/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs border border-slate-700 shadow-lg">
          AE
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-white leading-none">Amr Belal</span>
          <span className="text-[9px] text-slate-500 font-medium mt-1">AI Engineer يسعي للزواج</span>
        </div>
      </div>
    </aside>
  );
};