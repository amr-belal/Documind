// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import ForceGraph2D from 'react-force-graph-2d';
// import api from '../api/axios';
// import { Loader2, RefreshCw, Search, Filter } from 'lucide-react';

// export const GraphView = ({ onAskAI }: { onAskAI?: (nodeName: string) => void }) => {
//   const [data, setData] = useState({ nodes: [], links: [] });
//   const [loading, setLoading] = useState(true);
//   const fgRef = useRef<any>();
  
//   // تايمر حساب الضغطة المزدوجة
//   const lastClickTime = useRef(0);

//   const [highlightNodes, setHighlightNodes] = useState(new Set());
//   const [highlightLinks, setHighlightLinks] = useState(new Set());
//   const [hoverNode, setHoverNode] = useState<any>(null);
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeFilter, setActiveFilter] = useState<'All' | 'Paper' | 'Claim'>('All');

//   useEffect(() => {
//     api.get('/graph/data')
//       .then(res => {
//         setData(res.data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   const handleNodeHover = useCallback((node: any) => {
//     highlightNodes.clear();
//     highlightLinks.clear();
    
//     if (node) {
//       highlightNodes.add(node);
//       data.links.forEach((link: any) => {
//         if (link.source === node || link.target === node || link.source.id === node.id || link.target.id === node.id) {
//           highlightLinks.add(link);
//           highlightNodes.add(link.source === node ? link.target : link.source);
//         }
//       });
//     }

//     setHoverNode(node || null);
//     setHighlightNodes(new Set(highlightNodes));
//     setHighlightLinks(new Set(highlightLinks));
//   }, [data]);

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

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);
    
//     if (query.trim() === '') {
//       setHoverNode(null);
//       highlightNodes.clear();
//       setHighlightNodes(new Set());
//       return;
//     }

//     const foundNode = data.nodes.find((n: any) => 
//       n.name?.toLowerCase().includes(query.toLowerCase())
//     );

//     if (foundNode) {
//       fgRef.current?.centerAt((foundNode as any).x, (foundNode as any).y, 1000);
//       fgRef.current?.zoom(8, 1000);
//       handleNodeHover(foundNode);
//     }
//   };

//   // لوجيك الدابل كليك لربط الجراف بالشات
//   const handleNodeClick = useCallback((node: any) => {
//     const now = Date.now();
//     if (now - lastClickTime.current < 300) {
//       // دابل كليك -> ابعت للذكاء الاصطناعي
//       if (onAskAI) onAskAI(node.name);
//     } else {
//       // ضغطة عادية -> زووم
//       fgRef.current?.centerAt(node.x, node.y, 1000);
//       fgRef.current?.zoom(6, 1000);
//     }
//     lastClickTime.current = now;
//   }, [onAskAI]);

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
//       <Loader2 className="animate-spin" size={40} />
//       <p className="text-sm font-mono uppercase tracking-widest">Constructing Knowledge Graph...</p>
//     </div>
//   );

//   return (
//     <div className="w-full h-full bg-[#0f172a] relative group overflow-hidden">
      
//       {/* Control Panel */}
//       <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
//         <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-2.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all focus-within:border-blue-500/50 focus-within:shadow-blue-500/20">
//           <Search size={16} className="text-slate-400 ml-1" />
//           <input 
//             type="text" 
//             placeholder="Search entities or papers..." 
//             value={searchQuery}
//             onChange={handleSearch}
//             className="bg-transparent border-none text-[13px] text-white placeholder-slate-500 focus:outline-none w-56 pr-2 font-medium"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Filter size={14} className="text-slate-500 mr-1" />
//           {['All', 'Paper', 'Claim'].map(filter => (
//             <button
//               key={filter}
//               onClick={() => setActiveFilter(filter as any)}
//               className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
//                 activeFilter === filter 
//                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 border border-blue-500' 
//                 : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
//               }`}
//             >
//               {filter}
//             </button>
//           ))}
//         </div>
//       </div>

//       <button 
//         onClick={() => {
//           fgRef.current?.zoomToFit(400);
//           fgRef.current?.d3ReheatSimulation();
//         }}
//         className="absolute top-6 right-6 z-20 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-300 rounded-2xl hover:bg-slate-800 hover:text-white hover:border-blue-500/50 transition-all shadow-xl active:scale-95"
//         title="Reheat Simulation & Fit"
//       >
//         <RefreshCw size={18} />
//       </button>

//       <ForceGraph2D
//         ref={fgRef}
//         graphData={data}
//         nodeLabel={(node: any) => `${node.label}: ${node.name}`}
//         nodeRelSize={6}
        
//         nodeVisibility={(node: any) => activeFilter === 'All' || node.label === activeFilter}
//         linkVisibility={(link: any) => {
//           if (activeFilter === 'All') return true;
//           const sourceVisible = link.source.label === activeFilter || data.nodes.find((n:any) => n.id === link.source)?.label === activeFilter;
//           const targetVisible = link.target.label === activeFilter || data.nodes.find((n:any) => n.id === link.target)?.label === activeFilter;
//           return sourceVisible && targetVisible;
//         }}

//         onNodeHover={handleNodeHover}
//         onLinkHover={handleLinkHover}
        
//         onNodeDragEnd={node => {
//           node.fx = node.x;
//           node.fy = node.y;
//         }}
        
//         onNodeRightClick={node => {
//           node.fx = null;
//           node.fy = null;
//         }}

//         // دالة الـ Click المدمجة
//         onNodeClick={handleNodeClick}

//         nodeCanvasObject={(node: any, ctx, globalScale) => {
//           const isHighlight = highlightNodes.has(node);
//           const isHover = node === hoverNode;
          
//           const opacity = highlightNodes.size === 0 ? 1 : isHighlight ? 1 : 0.1;
//           const label = node.name;
//           // تكبير الخط شوية عشان يبقى مقروء لما يظهر
//           const fontSize = (isHover ? 16 : 12) / globalScale;
          
//           ctx.font = `${isHover ? '900' : '600'} ${fontSize}px Inter`;
          
//           const baseColor = node.label === 'Paper' ? '59, 130, 246' : '16, 185, 129';
//           ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
          
//           // 1. رسم الدائرة (هتترسم دايماً)
//           ctx.beginPath();
//           ctx.arc(node.x, node.y, isHover ? 8 : 5, 0, 2 * Math.PI, false);
//           ctx.fill();
          
//           if (isHighlight) {
//             ctx.strokeStyle = `rgba(255, 255, 255, ${isHover ? 0.8 : 0.3})`;
//             ctx.lineWidth = 1.5 / globalScale;
//             ctx.stroke();
//           }
          
//           // 2. 🔴 السحر هنا: شرط إظهار النص 🔴
//           // هنظهر النص في حالتين:
//           // - لو إنت عامل Hover على النقطة دي
//           // - أو لو إنت عامل Hover على نقطة تانية، ودي واحدة من جيرانها (عشان تقرأ العلاقة)
//           const shouldShowText = isHover || (highlightNodes.size > 0 && isHighlight);

//           // 💡 لو عايز تخلي أسامي الأبحاث (Papers) بس اللي ظاهرة دايماً، والـ Claims تختفي استخدم السطر ده بدل اللي فوق:
//           // const shouldShowText = isHover || (highlightNodes.size > 0 && isHighlight) || (highlightNodes.size === 0 && node.label === 'Paper');

//           if (shouldShowText) {
//             ctx.textAlign = 'center';
//             ctx.textBaseline = 'middle';
//             // لون أبيض فاقع للنقطة الأساسية، ولون باهت شوية للجيران
//             ctx.fillStyle = isHover ? 'rgba(255, 255, 255, 1)' : `rgba(203, 213, 225, 0.9)`;
//             ctx.fillText(label, node.x, node.y + (isHover ? 16 : 12));
//           }
//         }}

//         linkColor={(link: any) => highlightLinks.has(link) ? 'rgba(148, 163, 184, 0.8)' : 'rgba(51, 65, 85, 0.3)'}
//         linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
//         linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
//         linkDirectionalParticleWidth={3}
//         linkDirectionalParticleSpeed={0.01}
//       />

//       {/* Interaction Guide */}
//       <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//          <p className="text-[10px] text-slate-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
//             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
//             Graph Controls
//          </p>
//          <ul className="text-[11px] text-slate-300 space-y-2 font-medium">
//             <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">Hover</kbd> Highlight connections</li>
//             <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">Click</kbd> Zoom to entity</li>
//             <li className="flex items-center gap-2"><kbd className="bg-blue-600/20 border border-blue-500/50 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">2x Click</kbd> Ask AI Agent</li>
//             <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[9px]">Drag</kbd> Pin node position</li>
//          </ul>
//       </div>

//     </div>
//   );
// };


// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import ForceGraph2D from 'react-force-graph-2d';
// import api from '../api/axios';
// import { Loader2, RefreshCw, Search, Filter } from 'lucide-react';

// export const GraphView = ({ onAskAI }: { onAskAI?: (nodeName: string) => void }) => {
//   const [data, setData] = useState({ nodes: [], links: [] });
//   const [loading, setLoading] = useState(true);
//   const fgRef = useRef<any>();
  
//   const lastClickTime = useRef(0);

//   const [highlightNodes, setHighlightNodes] = useState(new Set());
//   const [highlightLinks, setHighlightLinks] = useState(new Set());
//   const [hoverNode, setHoverNode] = useState<any>(null);
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeFilter, setActiveFilter] = useState<'All' | 'Paper' | 'Claim'>('All');

//   useEffect(() => {
//     api.get('/graph/data')
//       .then(res => {
//         setData(res.data);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   // 🪄 تظبيط فيزياء الجراف (عشان يفرش زي أوبسيديان وميكلكعش)
//   useEffect(() => {
//     if (fgRef.current) {
//       // زيادة قوة التنافر بين النقط
//       fgRef.current.d3Force('charge').strength(-250);
//       // تطويل المسافة بين النقط المربوطة
//       fgRef.current.d3Force('link').distance(60);
//     }
//   }, [data]);

//   const handleNodeHover = useCallback((node: any) => {
//     highlightNodes.clear();
//     highlightLinks.clear();
    
//     if (node) {
//       highlightNodes.add(node);
//       data.links.forEach((link: any) => {
//         if (link.source === node || link.target === node || link.source.id === node.id || link.target.id === node.id) {
//           highlightLinks.add(link);
//           highlightNodes.add(link.source === node ? link.target : link.source);
//         }
//       });
//     }

//     setHoverNode(node || null);
//     setHighlightNodes(new Set(highlightNodes));
//     setHighlightLinks(new Set(highlightLinks));
//   }, [data]);

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

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);
    
//     if (query.trim() === '') {
//       setHoverNode(null);
//       highlightNodes.clear();
//       setHighlightNodes(new Set());
//       return;
//     }

//     const foundNode = data.nodes.find((n: any) => 
//       n.name?.toLowerCase().includes(query.toLowerCase())
//     );

//     if (foundNode) {
//       fgRef.current?.centerAt((foundNode as any).x, (foundNode as any).y, 1000);
//       fgRef.current?.zoom(8, 1000);
//       handleNodeHover(foundNode);
//     }
//   };

//   const handleNodeClick = useCallback((node: any) => {
//     const now = Date.now();
//     if (now - lastClickTime.current < 300) {
//       if (onAskAI) onAskAI(node.name);
//     } else {
//       fgRef.current?.centerAt(node.x, node.y, 1000);
//       fgRef.current?.zoom(6, 1000);
//     }
//     lastClickTime.current = now;
//   }, [onAskAI]);

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
//       <Loader2 className="animate-spin" size={40} />
//       <p className="text-sm font-mono uppercase tracking-widest">Constructing Knowledge Graph...</p>
//     </div>
//   );

//   return (
//     <div className="w-full h-full bg-[#0b0f19] relative group overflow-hidden">
      
//       {/* Control Panel */}
//       <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
//         <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 p-2.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all focus-within:border-blue-500/50">
//           <Search size={16} className="text-slate-400 ml-1" />
//           <input 
//             type="text" 
//             placeholder="Search entities or papers..." 
//             value={searchQuery}
//             onChange={handleSearch}
//             className="bg-transparent border-none text-[13px] text-white placeholder-slate-500 focus:outline-none w-56 pr-2 font-medium"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Filter size={14} className="text-slate-500 mr-1" />
//           {['All', 'Paper', 'Claim'].map(filter => (
//             <button
//               key={filter}
//               onClick={() => setActiveFilter(filter as any)}
//               className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
//                 activeFilter === filter 
//                 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-500' 
//                 : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white'
//               }`}
//             >
//               {filter}
//             </button>
//           ))}
//         </div>
//       </div>

//       <button 
//         onClick={() => {
//           fgRef.current?.zoomToFit(400);
//           fgRef.current?.d3ReheatSimulation();
//         }}
//         className="absolute top-6 right-6 z-20 p-3 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 text-slate-300 rounded-2xl hover:bg-slate-800 hover:text-white transition-all shadow-xl active:scale-95"
//         title="Reheat Simulation & Fit"
//       >
//         <RefreshCw size={18} />
//       </button>

//       <ForceGraph2D
//         ref={fgRef}
//         graphData={data}
//         nodeLabel={() => ''} // قفلنا الـ Tooltip العادي عشان عملنا واحد احترافي
//         nodeRelSize={6}
        
//         nodeVisibility={(node: any) => activeFilter === 'All' || node.label === activeFilter}
//         linkVisibility={(link: any) => {
//           if (activeFilter === 'All') return true;
//           const sourceVisible = link.source.label === activeFilter || data.nodes.find((n:any) => n.id === link.source)?.label === activeFilter;
//           const targetVisible = link.target.label === activeFilter || data.nodes.find((n:any) => n.id === link.target)?.label === activeFilter;
//           return sourceVisible && targetVisible;
//         }}

//         onNodeHover={handleNodeHover}
//         onLinkHover={handleLinkHover}
//         onNodeDragEnd={node => { node.fx = node.x; node.fy = node.y; }}
//         onNodeRightClick={node => { node.fx = null; node.fy = null; }}
//         onNodeClick={handleNodeClick}

//         // --- 🎨 Obsidian Style Canvas Rendering ---
//         nodeCanvasObject={(node: any, ctx, globalScale) => {
//           const isHighlight = highlightNodes.has(node);
//           const isHover = node === hoverNode;
          
//           // درجة الشفافية (عتمة كاملة للي مش متظلل لو في حاجة تانية متظللة)
//           const opacity = highlightNodes.size === 0 ? 0.8 : isHighlight ? 1 : 0.1;
          
//           // حجم العقدة (الـ Papers كبيرة، الـ Claims صغيرة)
//           const isPaper = node.label === 'Paper';
//           const nodeR = isHover ? 8 : (isPaper ? 5 : 2.5);
          
//           // ألوان أوبسيديان (بنفسجي للـ Papers، رمادي مزرق للـ Claims)
//           const colorRGB = isPaper ? '129, 140, 248' : '148, 163, 184'; // Indigo-400 & Slate-400
          
//           // --- رسم النقطة والتوهج (Glow) ---
//           ctx.beginPath();
//           ctx.arc(node.x, node.y, nodeR, 0, 2 * Math.PI, false);
//           ctx.fillStyle = `rgba(${colorRGB}, ${opacity})`;
          
//           if (isHighlight) {
//             ctx.shadowBlur = isHover ? 15 : 8;
//             ctx.shadowColor = `rgba(${colorRGB}, 0.8)`;
//           } else {
//             ctx.shadowBlur = 0; // مهم جداً للأداء
//           }
          
//           ctx.fill();
//           ctx.shadowBlur = 0; // إعادة ضبط للرسم الجاي

//           // --- رسم النص بخلفية شفافة (Obsidian Labels) ---
//           const shouldShowText = isHover || (highlightNodes.size > 0 && isHighlight);

//           if (shouldShowText) {
//             const label = node.name;
//             const fontSize = (isHover ? 14 : 10) / globalScale;
//             ctx.font = `${isHover ? '600' : '500'} ${fontSize}px Inter, sans-serif`;
            
//             // حساب حجم خلفية النص
//             const textWidth = ctx.measureText(label).width;
//             const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

//             // رسم خلفية النص (عشان الخطوط متقطعش الكلمة)
//             ctx.fillStyle = `rgba(11, 15, 25, 0.85)`; // لون خلفية مقارب للوحة
//             ctx.fillRect(
//               node.x - bckgDimensions[0] / 2, 
//               node.y + nodeR + 2, 
//               bckgDimensions[0], 
//               bckgDimensions[1]
//             );

//             // رسم الكلمة نفسها
//             ctx.textAlign = 'center';
//             ctx.textBaseline = 'middle';
//             ctx.fillStyle = isHover ? '#ffffff' : `rgba(226, 232, 240, 0.9)`;
//             ctx.fillText(label, node.x, node.y + nodeR + 2 + bckgDimensions[1] / 2);
//           }
//         }}

//         // --- 🔗 خطوط رفيعة وأنيقة ---
//         linkColor={(link: any) => highlightLinks.has(link) ? 'rgba(129, 140, 248, 0.6)' : 'rgba(71, 85, 105, 0.15)'}
//         linkWidth={(link: any) => highlightLinks.has(link) ? 1.5 : 0.5}
        
//         // جزيئات الطاقة شغالة للخطوط المنورة بس
//         linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 3 : 0}
//         linkDirectionalParticleWidth={2}
//         linkDirectionalParticleSpeed={0.008}
//       />

//       <div className="absolute bottom-6 left-6 z-10 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//          <p className="text-[10px] text-slate-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
//             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
//             Graph Controls
//          </p>
//          <ul className="text-[11px] text-slate-300 space-y-2 font-medium">
//             <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400 font-mono text-[9px]">Hover</kbd> Highlight connections</li>
//             <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400 font-mono text-[9px]">Click</kbd> Zoom to entity</li>
//             <li className="flex items-center gap-2"><kbd className="bg-indigo-600/20 border border-indigo-500/50 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[9px]">2x Click</kbd> Ask AI Agent</li>
//             <li className="flex items-center gap-2"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400 font-mono text-[9px]">Drag</kbd> Pin node position</li>
//          </ul>
//       </div>

//     </div>
//   );
// };


import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../api/axios';
import { Loader2, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';

// ═══════════════════════════════════════════════════
//  Color palette — Cosmic Neon
// ═══════════════════════════════════════════════════
const COLORS = {
  paper:   { r: 0,   g: 230, b: 255 },
  claim:   { r: 255, g: 190, b: 60  },
  bg:      '#04070f',
  dimLink: 'rgba(255,255,255,0.06)',
  hlLink:  'rgba(0,230,255,0.55)',
};

const rgb = (c: { r: number; g: number; b: number }, a = 1) =>
  `rgba(${c.r},${c.g},${c.b},${a})`;

// Manual roundRect – avoids TS lib version issues
function pillRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// ─── Node painter ─────────────────────────────────────────────────────────────
function paintNode(
  node: any,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  isHighlight: boolean,
  isHover: boolean,
  opacity: number,
  t: number
) {
  const isPaper = node.label === 'Paper';
  const col = isPaper ? COLORS.paper : COLORS.claim;

  if (opacity < 0.05) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = rgb(col, 0.04);
    ctx.fill();
    return;
  }

  const baseR = isPaper ? 5.5 : 3.2;
  const pulse = isHover ? 1 + Math.sin(t * 3.5) * 0.18 : 1;
  const nodeR  = (isHover ? baseR * 1.55 : baseR) * pulse;

  // Far ambient glow
  if (isHighlight) {
    const g1 = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR * 7);
    g1.addColorStop(0, rgb(col, 0.12 * opacity));
    g1.addColorStop(1, rgb(col, 0));
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeR * 7, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();
  }

  // Mid corona
  const g2 = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR * 3);
  g2.addColorStop(0, rgb(col, (isHighlight ? 0.35 : 0.1) * opacity));
  g2.addColorStop(1, rgb(col, 0));
  ctx.beginPath();
  ctx.arc(node.x, node.y, nodeR * 3, 0, Math.PI * 2);
  ctx.fillStyle = g2;
  ctx.fill();

  // Core
  const g3 = ctx.createRadialGradient(
    node.x - nodeR * 0.25, node.y - nodeR * 0.25, nodeR * 0.05,
    node.x, node.y, nodeR
  );
  g3.addColorStop(0, `rgba(255,255,255,${0.95 * opacity})`);
  g3.addColorStop(0.45, rgb(col, opacity));
  g3.addColorStop(1, rgb({ r: col.r * 0.5 | 0, g: col.g * 0.5 | 0, b: col.b * 0.5 | 0 }, opacity * 0.75));
  ctx.beginPath();
  ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
  ctx.fillStyle = g3;
  ctx.fill();

  // Rim
  if (isHighlight) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
    ctx.strokeStyle = rgb(col, 0.85 * opacity);
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // Pulsing ring (hover)
  if (isHover) {
    const rp = (Math.sin(t * 4) + 1) / 2;
    const r1 = nodeR + 3.5 + rp * 4;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r1, 0, Math.PI * 2);
    ctx.strokeStyle = rgb(col, 0.7 * rp);
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    const r2 = nodeR + 7 + rp * 3;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r2, 0, Math.PI * 2);
    ctx.strokeStyle = rgb(col, 0.25 * (1 - rp));
    ctx.lineWidth = 0.5 / globalScale;
    ctx.stroke();
  }

  // Rotating dashed orbit (Paper + highlighted)
  if (isPaper && isHighlight) {
    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.rotate(t * 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, nodeR + 3, 0, Math.PI * 2);
    ctx.strokeStyle = rgb(col, 0.28 * opacity);
    ctx.lineWidth = 0.6;
    ctx.setLineDash([3, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Label
  if (isHover || isHighlight) {
    const label = String(node.name ?? '');
    const fontSize = Math.max((isHover ? 12 : 8.5) / globalScale, 1.5);
    ctx.font = `${isHover ? '700' : '500'} ${fontSize}px "DM Mono","Space Mono",monospace`;

    const tw   = ctx.measureText(label).width;
    const padX = fontSize * 0.55;
    const padY = fontSize * 0.4;
    const bgW  = tw + padX * 2;
    const bgH  = fontSize + padY * 2;
    const bgX  = node.x - bgW / 2;
    const bgY  = node.y + nodeR + 4 / globalScale;

    pillRect(ctx, bgX, bgY, bgW, bgH, bgH / 2);
    ctx.fillStyle = 'rgba(4,7,15,0.88)';
    ctx.fill();
    ctx.strokeStyle = rgb(col, isHover ? 0.55 : 0.2);
    ctx.lineWidth = 0.5 / globalScale;
    ctx.stroke();

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = isHover ? rgb(col, 1) : 'rgba(210,225,240,0.88)';
    ctx.fillText(label, node.x, bgY + bgH / 2);
  }
}

// ════════════════════════════════════════════════════════════════════════════
export const GraphView = ({ onAskAI }: { onAskAI?: (nodeName: string) => void }) => {
  const [data, setData]     = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>();
  const lastClickTime = useRef(0);

  const [highlightNodes, setHighlightNodes] = useState(new Set<any>());
  const [highlightLinks, setHighlightLinks]  = useState(new Set<any>());
  const [hoverNode, setHoverNode] = useState<any>(null);

  const [searchQuery, setSearchQuery]     = useState('');
  const [activeFilter, setActiveFilter]   = useState<'All' | 'Paper' | 'Claim'>('All');

  useEffect(() => {
    api.get('/graph/data')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-280);
      fgRef.current.d3Force('link').distance(70);
    }
  }, [data]);

  const handleNodeHover = useCallback((node: any) => {
    const hn = new Set<any>();
    const hl = new Set<any>();
    if (node) {
      hn.add(node);
      data.links.forEach((link: any) => {
        const s = link.source, tg = link.target;
        if (s === node || tg === node || s?.id === node.id || tg?.id === node.id) {
          hl.add(link);
          hn.add((s === node || s?.id === node.id) ? tg : s);
        }
      });
    }
    setHoverNode(node ?? null);
    setHighlightNodes(hn);
    setHighlightLinks(hl);
  }, [data]);

  const handleLinkHover = useCallback((link: any) => {
    const hn = new Set<any>();
    const hl = new Set<any>();
    if (link) { hl.add(link); hn.add(link.source); hn.add(link.target); }
    setHighlightNodes(hn);
    setHighlightLinks(hl);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setHoverNode(null); setHighlightNodes(new Set()); return; }
    const found = data.nodes.find((n: any) => n.name?.toLowerCase().includes(q.toLowerCase()));
    if (found) {
      fgRef.current?.centerAt(found.x, found.y, 900);
      fgRef.current?.zoom(9, 900);
      handleNodeHover(found);
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      onAskAI?.(node.name);
    } else {
      fgRef.current?.centerAt(node.x, node.y, 800);
      fgRef.current?.zoom(7, 800);
    }
    lastClickTime.current = now;
  }, [onAskAI]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-5"
         style={{ background: COLORS.bg }}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-amber-400/40 animate-spin"
             style={{ animationDuration: '1.8s', animationDirection: 'reverse' }} />
      </div>
      <p className="text-[11px] tracking-[0.3em] uppercase font-mono text-cyan-400/60">
        Mapping knowledge graph…
      </p>
    </div>
  );

  return (
    <div className="w-full h-full relative overflow-hidden group"
         style={{ background: COLORS.bg }}>

      {/* Search + Filter */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300
                        focus-within:shadow-[0_0_20px_rgba(0,230,255,0.2)]"
             style={{ background: 'rgba(4,7,15,0.75)',
                      border: '1px solid rgba(0,230,255,0.15)',
                      backdropFilter: 'blur(16px)' }}>
          <Search size={14} style={{ color: 'rgba(0,230,255,0.5)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search entities or papers…"
            value={searchQuery}
            onChange={handleSearch}
            className="bg-transparent border-none text-[12.5px] placeholder-slate-600
                       focus:outline-none w-52 font-mono"
            style={{ color: 'rgba(0,230,255,0.9)' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={12} className="text-slate-600" />
          {(['All', 'Paper', 'Claim'] as const).map(f => {
            const active = activeFilter === f;
            const accent = f === 'Claim' ? '#ffbe3c' : '#00e6ff';
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-3.5 py-1 rounded-xl text-[9.5px] font-black uppercase
                           tracking-widest transition-all duration-200"
                style={{
                  background: active ? `${accent}18` : 'rgba(4,7,15,0.6)',
                  border: `1px solid ${active ? accent + '55' : 'rgba(255,255,255,0.07)'}`,
                  color:  active ? accent : 'rgba(148,163,184,0.7)',
                  boxShadow: active ? `0 0 14px ${accent}30` : 'none',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reheat */}
      <button
        onClick={() => { fgRef.current?.zoomToFit(500); fgRef.current?.d3ReheatSimulation(); }}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl transition-all duration-200
                   active:scale-95 hover:shadow-[0_0_16px_rgba(0,230,255,0.3)]"
        style={{ background: 'rgba(4,7,15,0.75)',
                 border: '1px solid rgba(0,230,255,0.15)',
                 backdropFilter: 'blur(12px)',
                 color: 'rgba(0,230,255,0.7)' }}
        title="Reheat & fit"
      >
        <RefreshCw size={16} />
      </button>

      {/* Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel={() => ''}
        nodeRelSize={6}
        backgroundColor={COLORS.bg}

        nodeVisibility={(node: any) =>
          activeFilter === 'All' || node.label === activeFilter}
        linkVisibility={(link: any) => {
          if (activeFilter === 'All') return true;
          const sl = link.source?.label ?? data.nodes.find((n: any) => n.id === link.source)?.label;
          const tl = link.target?.label ?? data.nodes.find((n: any) => n.id === link.target)?.label;
          return sl === activeFilter && tl === activeFilter;
        }}

        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        onNodeDragEnd={(node: any) => { node.fx = node.x; node.fy = node.y; }}
        onNodeRightClick={(node: any) => { node.fx = null; node.fy = null; }}
        onNodeClick={handleNodeClick}

        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          // 🔴 السطر ده هو اللي هيحل المشكلة: بيمنع الكراش قبل ما محرك الفيزياء يشتغل
          if (node.x === undefined || node.y === undefined) return;

          const t = performance.now() / 1000;
          paintNode(
            node, ctx, globalScale,
            highlightNodes.has(node),
            node === hoverNode,
            highlightNodes.size === 0 ? 0.8 : highlightNodes.has(node) ? 1 : 0.06,
            t
          );
        }}

        linkColor={(link: any) => highlightLinks.has(link) ? COLORS.hlLink : COLORS.dimLink}
        linkWidth={(link: any) => highlightLinks.has(link) ? 1.4 : 0.4}
        linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleSpeed={0.007}
        linkDirectionalParticleColor={() => 'rgba(0,230,255,0.9)'}
      />

      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-10 p-4 rounded-2xl opacity-0
                      group-hover:opacity-100 transition-opacity duration-300"
           style={{ background: 'rgba(4,7,15,0.82)',
                    border: '1px solid rgba(0,230,255,0.12)',
                    backdropFilter: 'blur(16px)' }}>
        <p className="text-[9px] tracking-[0.25em] uppercase font-mono mb-3 flex items-center gap-2"
           style={{ color: 'rgba(0,230,255,0.5)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
                style={{ boxShadow: '0 0 6px #00e6ff' }} />
          Graph Controls
        </p>

        <div className="flex items-center gap-4 mb-3 pb-3"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="flex items-center gap-1.5 text-[10px] font-mono"
                style={{ color: 'rgba(0,230,255,0.75)' }}>
            <span className="w-2 h-2 rounded-full"
                  style={{ background: '#00e6ff', boxShadow: '0 0 8px #00e6ff' }} />
            Paper
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono"
                style={{ color: 'rgba(255,190,60,0.75)' }}>
            <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#ffbe3c', boxShadow: '0 0 6px #ffbe3c' }} />
            Claim
          </span>
        </div>

        <ul className="space-y-1.5">
          {([
            ['Hover',    'Highlight connections'],
            ['Click',    'Zoom to entity'],
            ['2× Click', 'Ask AI Agent'],
            ['Drag',     'Pin node position'],
            ['R-click',  'Unpin node'],
          ] as [string, string][]).map(([key, label]) => (
            <li key={key} className="flex items-center gap-2.5 text-[10.5px]"
                style={{ color: 'rgba(200,215,230,0.75)', fontFamily: 'monospace' }}>
              <kbd className="px-1.5 py-0.5 rounded text-[8.5px]"
                   style={{
                     background: key === '2× Click' ? 'rgba(0,230,255,0.1)' : 'rgba(255,255,255,0.05)',
                     border: `1px solid ${key === '2× Click'
                       ? 'rgba(0,230,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
                     color: key === '2× Click' ? '#00e6ff' : 'rgba(180,200,220,0.8)',
                   }}>
                {key}
              </kbd>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};