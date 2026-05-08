import React, { useRef, useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  UploadCloud, 
  FileText, 
  Loader2, 
  Database, 
  ShieldCheck,
  AlertCircle,
  Zap
} from 'lucide-react';

interface SidebarProps {
  files?: { name: string; status: string }[];
  onUploadClick?: () => void;
  uploading?: boolean;
  theme?: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  files: filesProp,
  onUploadClick,
  uploading: uploadingProp,
  theme = 'dark',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLocal, setUploadingLocal] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; status: string }[]>(filesProp || []);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (filesProp) setUploadedFiles(filesProp);
  }, [filesProp]);

  useEffect(() => {
    if (filesProp) return;
    (async () => {
      try {
        const res = await api.get('/ingest/files');
        if (res.data) setUploadedFiles(res.data);
      } catch (error) {
        console.error('❌ Failed to load existing files:', error);
      }
    })();
  }, []);

  const uploading = uploadingProp ?? uploadingLocal;

  const handleUploadClick = () => {
    if (onUploadClick) return onUploadClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingLocal(true);
    setStatusMsg(`🚀 Processing ${files.length} files...`);

    const newFiles = Array.from(files).map(f => ({ name: f.name, status: 'uploading' }));
    setUploadedFiles(prev => [...newFiles, ...prev]);

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      await api.post('/ingest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatusMsg(`✅ Upload Complete`);
      const refreshRes = await api.get('/ingest/files');
      setUploadedFiles(refreshRes.data);
    } catch (error: any) {
      setStatusMsg(`❌ Upload Failed`);
      setUploadedFiles(prev =>
        prev.map(f => (f.status === 'uploading' ? { ...f, status: 'error' } : f))
      );
    } finally {
      setUploadingLocal(false);
      setTimeout(() => setStatusMsg(''), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Theme-aware classes ────────────────────────────────────────────
  const asideCls = isDark
    ? 'bg-[#020617] text-slate-400 border-slate-800/50'
    : 'bg-white text-slate-600 border-slate-200';

  const headerBorder = isDark ? 'border-slate-800/40' : 'border-slate-200';
  const labelCls = isDark ? 'text-slate-600' : 'text-slate-400';
  const brandTextCls = isDark ? 'text-white' : 'text-slate-900';

  const uploadBtnCls = uploading
    ? isDark
      ? 'bg-slate-900 text-slate-600 cursor-wait border border-slate-800'
      : 'bg-slate-100 text-slate-400 cursor-wait border border-slate-200'
    : isDark
    ? 'bg-white text-black hover:bg-slate-200 active:scale-95'
    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95';

  const emptyBoxCls = isDark
    ? 'opacity-20 border-slate-800'
    : 'opacity-40 border-slate-300';

  const fileCardCls = isDark
    ? 'bg-slate-900/40 border-slate-800/50 hover:border-blue-500/30'
    : 'bg-slate-50 border-slate-200 hover:border-blue-400/50';

  const fileIconWrapCls = isDark
    ? 'bg-slate-800 group-hover:bg-blue-600/10'
    : 'bg-white group-hover:bg-blue-50 border border-slate-200';

  const fileNameCls = isDark ? 'text-slate-300' : 'text-slate-700';

  const infraCardCls = isDark
    ? 'bg-slate-900/50 border-slate-800/30'
    : 'bg-slate-50 border-slate-200';

  const infraLabelCls = isDark ? 'text-slate-500' : 'text-slate-500';

  const footerNameCls = isDark ? 'text-white' : 'text-slate-900';
  const footerSubCls = isDark ? 'text-slate-500' : 'text-slate-500';

  return (
    <aside className={`w-80 p-6 flex flex-col h-screen border-r relative shadow-2xl shrink-0 transition-colors duration-300 ${asideCls}`}>

      {/* Brand Header */}
      <div className={`flex items-center gap-3 mb-10 pb-6 border-b ${headerBorder}`}>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transform hover:rotate-6 transition-transform">
          <Zap className="text-white fill-current" size={20} />
        </div>
        <div className="flex flex-col text-left">
          <span className={`text-lg font-black tracking-tight leading-none ${brandTextCls}`}>DocuMind</span>
          <span className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase mt-1">Graph Engine v1.2</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8 overflow-hidden">

        {/* Action Button */}
        <section>
          <p className={`text-[10px] mb-4 uppercase tracking-[0.2em] font-black text-left ${labelCls}`}>Management</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />

          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className={`w-full group flex items-center justify-center gap-3 py-4 px-4 rounded-2xl transition-all font-bold shadow-xl ${uploadBtnCls}`}
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
          {statusMsg && <p className="text-[10px] mt-3 text-center font-bold text-blue-500 animate-pulse">{statusMsg}</p>}
        </section>

        {/* Library Section */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <p className={`text-[10px] mb-4 uppercase tracking-[0.2em] font-black text-left ${labelCls}`}>Knowledge Base</p>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {uploadedFiles.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-3xl ${emptyBoxCls}`}>
                <FileText size={32} />
                <span className="text-[10px] mt-3 font-bold uppercase tracking-widest">Library Empty</span>
              </div>
            ) : (
              uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all group ${fileCardCls}`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${fileIconWrapCls}`}>
                    <FileText size={14} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <span className={`flex-1 text-[11px] truncate text-left font-bold ${fileNameCls}`}>{file.name}</span>
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
        <section className={`mb-6 pt-6 border-t ${headerBorder}`}>
          <p className={`text-[10px] mb-4 uppercase tracking-[0.2em] font-black text-left ${labelCls}`}>Infrastructure</p>
          <div className="grid grid-cols-2 gap-2">
            <div className={`flex flex-col gap-2 p-3 rounded-2xl border ${infraCardCls}`}>
              <ShieldCheck size={14} className="text-blue-500" />
              <span className={`text-[9px] font-bold uppercase ${infraLabelCls}`}>Worker</span>
            </div>
            <div className={`flex flex-col gap-2 p-3 rounded-2xl border ${infraCardCls}`}>
              <Database size={14} className="text-indigo-500" />
              <span className={`text-[9px] font-bold uppercase ${infraLabelCls}`}>Neo4j</span>
            </div>
          </div>
        </section>
      </div>

      {/* User Footer */}
      <div className={`mt-auto pt-6 border-t flex items-center gap-3 ${headerBorder}`}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg">
          AE
        </div>
        <div className="flex flex-col text-left">
          <span className={`text-xs font-bold leading-none ${footerNameCls}`}>Amr Belal</span>
          <span className={`text-[9px] font-medium mt-1 ${footerSubCls}`}>AI Engineer يسعي للزواج</span>
        </div>
      </div>
    </aside>
  );
};