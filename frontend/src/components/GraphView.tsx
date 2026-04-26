import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

export const GraphView = () => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();

  useEffect(() => {
    api.get('/graph/data')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
      <Loader2 className="animate-spin" size={40} />
      <p className="text-sm font-mono uppercase tracking-widest">Mapping Knowledge Graph...</p>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#0f172a]">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel={(node: any) => `${node.label}: ${node.name}`}
        nodeAutoColorBy="label"
        nodeRelSize={6}
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.005}
        linkColor={() => '#334155'}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node: any) => {
          // زووم عند الضغط على Node
          (fgRef.current as any).centerAt(node.x, node.y, 1000);
          (fgRef.current as any).zoom(6, 1000);
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter`;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(label, node.x, node.y + 10);
        }}
      />
    </div>
  );
};