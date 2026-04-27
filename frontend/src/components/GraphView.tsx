// // import React, { useEffect, useState, useRef } from 'react';
// // import ForceGraph2D from 'react-force-graph-2d';
// // import api from '../api/axios';
// // import { Loader2 } from 'lucide-react';

// // export const GraphView = () => {
// //   const [data, setData] = useState({ nodes: [], links: [] });
// //   const [loading, setLoading] = useState(true);
// //   const fgRef = useRef();

// //   useEffect(() => {
// //     api.get('/graph/data')
// //       .then(res => {
// //         setData(res.data);
// //         setLoading(false);
// //       })
// //       .catch(() => setLoading(false));
// //   }, []);

// //   if (loading) return (
// //     <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
// //       <Loader2 className="animate-spin" size={40} />
// //       <p className="text-sm font-mono uppercase tracking-widest">Mapping Knowledge Graph...</p>
// //     </div>
// //   );

// //   return (
// //     <div className="w-full h-full bg-[#0f172a]">
// //       <ForceGraph2D
// //         ref={fgRef}
// //         graphData={data}
// //         nodeLabel={(node: any) => `${node.label}: ${node.name}`}
// //         nodeAutoColorBy="label"
// //         nodeRelSize={6}
// //         linkDirectionalParticles={3}
// //         linkDirectionalParticleSpeed={0.005}
// //         linkColor={() => '#334155'}
// //         linkDirectionalArrowLength={3.5}
// //         linkDirectionalArrowRelPos={1}
// //         onNodeClick={(node: any) => {
// //           // زووم عند الضغط على Node
// //           (fgRef.current as any).centerAt(node.x, node.y, 1000);
// //           (fgRef.current as any).zoom(6, 1000);
// //         }}
// //         nodeCanvasObject={(node: any, ctx, globalScale) => {
// //           const label = node.name;
// //           const fontSize = 12 / globalScale;
// //           ctx.font = `${fontSize}px Inter`;
// //           ctx.fillStyle = node.color;
// //           ctx.beginPath();
// //           ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
// //           ctx.fill();
          
// //           ctx.textAlign = 'center';
// //           ctx.textBaseline = 'middle';
// //           ctx.fillStyle = '#94a3b8';
// //           ctx.fillText(label, node.x, node.y + 10);
// //         }}
// //       />
// //     </div>
// //   );
// // };

// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import ForceGraph2D from 'react-force-graph-2d';
// import api from '../api/axios';
// import { Loader2, RefreshCw } from 'lucide-react';

// export const GraphView = () => {
//   const [data, setData] = useState({ nodes: [], links: [] });
//   const [loading, setLoading] = useState(true);
//   const fgRef = useRef<any>();

//   // States للتفاعل
//   const [highlightNodes, setHighlightNodes] = useState(new Set());
//   const [highlightLinks, setHighlightLinks] = useState(new Set());
//   const [hoverNode, setHoverNode] = useState(null);

//   useEffect(() => {
//     api.get('/graph/data')
//       .then(res => {
//         setData(res.data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   // 1️⃣ دالة التظليل عند الـ Hover
//   const handleNodeHover = useCallback((node: any) => {
//     highlightNodes.clear();
//     highlightLinks.clear();
//     if (node) {
//       highlightNodes.add(node);
//       data.links.forEach((link: any) => {
//         if (link.source === node || link.target === node) {
//           highlightLinks.add(link);
//           highlightNodes.add(link.source === node ? link.target : link.source);
//         }
//       });
//     }

//     setHoverNode(node || null);
//     setHighlightNodes(new Set(highlightNodes));
//     setHighlightLinks(new Set(highlightLinks));
//   }, [data]);

//   // 2️⃣ دالة التعامل مع اللينكات عند الـ Hover
//   const handleLinkHover = useCallback((link: any) => {
//     highlightNodes.clear();
//     highlightLinks.clear();

//     if (link) {
//       highlightLinks.add(link);
//       highlightNodes.add(link.source);
//       highlightNodes.add(link.target);
//     }

//     setHighlightNodes(new Set(highlightNodes));
//     setHighlightLinks(new Set(highlightLinks));
//   }, []);

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
//       <Loader2 className="animate-spin" size={40} />
//       <p className="text-sm font-mono uppercase tracking-widest">Constructing Knowledge Graph...</p>
//     </div>
//   );

//   return (
//     <div className="w-full h-full bg-[#0f172a] relative group">
//       {/* زرار إعادة ترتيب الجراف */}
//       <button 
//         onClick={() => {
//           fgRef.current?.zoomToFit(400);
//           fgRef.current?.d3ReheatSimulation();
//         }}
//         className="absolute top-6 right-6 z-10 p-3 bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-all shadow-xl"
//         title="Reheat Simulation"
//       >
//         <RefreshCw size={18} />
//       </button>

//       <ForceGraph2D
//         ref={fgRef}
//         graphData={data}
//         nodeLabel={(node: any) => `${node.label}: ${node.name}`}
//         nodeRelSize={6}
        
//         // --- 🌟 التفاعلات الجديدة ---
//         onNodeHover={handleNodeHover}
//         onLinkHover={handleLinkHover}
        
//         // التثبيت عند السحب (Pinning)
//         onNodeDragEnd={node => {
//           node.fx = node.x;
//           node.fy = node.y;
//         }}
        
//         // فك التثبيت بالكليك يمين (Unpinning)
//         onNodeRightClick={node => {
//           node.fx = null;
//           node.fy = null;
//         }}

//         // التركيز عند الضغط (Zoom Focus)
//         onNodeClick={(node: any) => {
//           fgRef.current?.centerAt(node.x, node.y, 1000);
//           fgRef.current?.zoom(6, 1000);
//         }}

//         // --- 🎨 الرسم الديناميكي (Custom Canvas) ---
//         nodeCanvasObject={(node: any, ctx, globalScale) => {
//           const isHighlight = highlightNodes.has(node);
//           const isHover = node === hoverNode;
          
//           // لو في حاجة منورة، ضلم الباقي
//           const opacity = highlightNodes.size === 0 ? 1 : isHighlight ? 1 : 0.1;
          
//           const label = node.name;
//           const fontSize = (isHover ? 16 : 12) / globalScale;
          
//           ctx.font = `${isHover ? 'bold' : 'normal'} ${fontSize}px Inter`;
          
//           // تلوين العقد بناءً على النوع مع إضافة الشفافية
//           const baseColor = node.label === 'Paper' ? '59, 130, 246' : '16, 185, 129';
//           ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
          
//           ctx.beginPath();
//           // العقدة المنورة بتكبر شوية
//           ctx.arc(node.x, node.y, isHover ? 7 : 5, 0, 2 * Math.PI, false);
//           ctx.fill();
          
//           ctx.textAlign = 'center';
//           ctx.textBaseline = 'middle';
//           ctx.fillStyle = `rgba(203, 213, 225, ${opacity})`; // لون النص
//           ctx.fillText(label, node.x, node.y + (isHover ? 12 : 10));
//         }}

//         // تلوين الخطوط
//         linkColor={(link: any) => highlightLinks.has(link) ? '#cbd5e1' : 'rgba(51, 65, 85, 0.2)'}
//         linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
//         linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
//         linkDirectionalParticleWidth={3}
//       />

//       {/* لوحة إرشادات صغيرة لليوزر */}
//       <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
//          <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Interaction Guide</p>
//          <ul className="text-[10px] text-slate-500 space-y-1">
//             <li><span className="text-blue-400">Hover:</span> Highlight connections</li>
//             <li><span className="text-blue-400">Drag:</span> Pin node in place</li>
//             <li><span className="text-blue-400">Right-Click:</span> Unpin node</li>
//             <li><span className="text-blue-400">Click:</span> Zoom to node</li>
//          </ul>
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../api/axios';
import { Loader2, RefreshCw, Search, Filter } from 'lucide-react';

export const GraphView = () => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>();

  // --- States للتحكم والتفاعل ---
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Paper' | 'Claim'>('All');

  // جلب البيانات
  useEffect(() => {
    api.get('/graph/data')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- دوال التظليل (Hover Logic) ---
  const handleNodeHover = useCallback((node: any) => {
    highlightNodes.clear();
    highlightLinks.clear();
    
    if (node) {
      highlightNodes.add(node);
      data.links.forEach((link: any) => {
        if (link.source === node || link.target === node || link.source.id === node.id || link.target.id === node.id) {
          highlightLinks.add(link);
          highlightNodes.add(link.source === node ? link.target : link.source);
        }
      });
    }

    setHoverNode(node || null);
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  }, [data]);

  const handleLinkHover = useCallback((link: any) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  }, []);

  // --- دالة البحث السريع ---
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setHoverNode(null);
      highlightNodes.clear();
      setHighlightNodes(new Set());
      return;
    }

    // البحث عن أول نقطة تطابق النص
    const foundNode = data.nodes.find((n: any) => 
      n.name?.toLowerCase().includes(query.toLowerCase())
    );

    if (foundNode) {
      fgRef.current?.centerAt((foundNode as any).x, (foundNode as any).y, 1000);
      fgRef.current?.zoom(8, 1000);
      handleNodeHover(foundNode);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
      <Loader2 className="animate-spin" size={40} />
      <p className="text-sm font-mono uppercase tracking-widest">Constructing Knowledge Graph...</p>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#0f172a] relative group overflow-hidden">
      
      {/* 🎛️ Control Panel (Search & Filters) */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
        {/* Search Box */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-2.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all focus-within:border-blue-500/50 focus-within:shadow-blue-500/20">
          <Search size={16} className="text-slate-400 ml-1" />
          <input 
            type="text" 
            placeholder="Search entities or papers..." 
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent border-none text-[13px] text-white placeholder-slate-500 focus:outline-none w-56 pr-2 font-medium"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500 mr-1" />
          {['All', 'Paper', 'Claim'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === filter 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 border border-blue-500' 
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 🔄 Reset / Reheat Button */}
      <button 
        onClick={() => {
          fgRef.current?.zoomToFit(400);
          fgRef.current?.d3ReheatSimulation();
        }}
        className="absolute top-6 right-6 z-20 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-300 rounded-2xl hover:bg-slate-800 hover:text-white hover:border-blue-500/50 transition-all shadow-xl active:scale-95"
        title="Reheat Simulation & Fit"
      >
        <RefreshCw size={18} />
      </button>

      {/* 🕸️ The Force Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel={(node: any) => `${node.label}: ${node.name}`}
        nodeRelSize={6}
        
        // --- 🔍 الفلاتر اللحظية (Visibility) ---
        nodeVisibility={(node: any) => activeFilter === 'All' || node.label === activeFilter}
        linkVisibility={(link: any) => {
          if (activeFilter === 'All') return true;
          // إظهار اللينك فقط لو النقطتين بتوعه ظاهرين
          const sourceVisible = link.source.label === activeFilter || data.nodes.find((n:any) => n.id === link.source)?.label === activeFilter;
          const targetVisible = link.target.label === activeFilter || data.nodes.find((n:any) => n.id === link.target)?.label === activeFilter;
          return sourceVisible && targetVisible;
        }}

        // --- 🖱️ التفاعلات (Interactions) ---
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        
        onNodeDragEnd={node => {
          // Pin Node (تثبيت العقدة لما تسحبها وتفلتها)
          node.fx = node.x;
          node.fy = node.y;
        }}
        
        onNodeRightClick={node => {
          // Unpin Node (فك التثبيت بالكليك يمين)
          node.fx = null;
          node.fy = null;
        }}

        onNodeClick={(node: any) => {
          // Zoom on Click
          fgRef.current?.centerAt(node.x, node.y, 1000);
          fgRef.current?.zoom(6, 1000);
        }}

        // --- 🎨 الرسم الديناميكي للعقد (Custom Canvas) ---
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isHighlight = highlightNodes.has(node);
          const isHover = node === hoverNode;
          
          // إدارة الشفافية لو فيه نقطة متظللة
          const opacity = highlightNodes.size === 0 ? 1 : isHighlight ? 1 : 0.1;
          
          const label = node.name;
          const fontSize = (isHover ? 14 : 10) / globalScale;
          
          ctx.font = `${isHover ? '900' : '600'} ${fontSize}px Inter`;
          
          // تحديد لون النقطة (Paper = أزرق، Claim = أخضر)
          const baseColor = node.label === 'Paper' ? '59, 130, 246' : '16, 185, 129';
          ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
          
          // رسم الدائرة
          ctx.beginPath();
          ctx.arc(node.x, node.y, isHover ? 8 : 5, 0, 2 * Math.PI, false);
          ctx.fill();
          
          // رسم الإطار الخارجي (Stroke) للنقطة المتظللة
          if (isHighlight) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${isHover ? 0.8 : 0.3})`;
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();
          }
          
          // رسم النص
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(241, 245, 249, ${opacity})`; // slate-100
          ctx.fillText(label, node.x, node.y + (isHover ? 14 : 10));
        }}

        // --- 🔗 إعدادات الروابط (Links) ---
        linkColor={(link: any) => highlightLinks.has(link) ? 'rgba(148, 163, 184, 0.8)' : 'rgba(51, 65, 85, 0.3)'}
        linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
        linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0} // Particle Animation
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleSpeed={0.01}
      />

      {/* ℹ️ Interaction Guide (يظهر عند الـ Hover على الشاشة) */}
      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <p className="text-[10px] text-slate-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Graph Controls
         </p>
         <ul className="text-[11px] text-slate-300 space-y-2 font-medium">
            <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">Hover</kbd> Highlight connections</li>
            <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">Click</kbd> Zoom to entity</li>
            <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">Drag</kbd> Pin node position</li>
            <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">R-Click</kbd> Unpin node</li>
         </ul>
      </div>

    </div>
  );
};