import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import api from '../api/axios';
import {
  Loader2, RefreshCw, Search, SlidersHorizontal,
  Maximize2, Download, Focus, X, Activity,
  Network, Eye, EyeOff, Zap, FileText, Tag,
  GitBranch, Hash
} from 'lucide-react';

type Theme = 'dark' | 'light';

// ═══════════════════════════════════════════════════
//  Theme-aware palettes
// ═══════════════════════════════════════════════════
const PALETTES = {
  dark: {
    paper:    { r: 0,   g: 230, b: 255 },
    claim:    { r: 255, g: 190, b: 60  },
    claimAlt: { r: 255, g: 130, b: 200 },
    bg:       '#04070f',
    panelBg:  'rgba(4,7,15,0.82)',
    panelBdr: 'rgba(0,230,255,0.15)',
    text:     'rgba(220,235,250,0.9)',
    textDim:  'rgba(148,163,184,0.7)',
    dimLink:  'rgba(255,255,255,0.06)',
    hlLink:   'rgba(0,230,255,0.55)',
    labelBg:  'rgba(4,7,15,0.88)',
  },
  light: {
    paper:    { r: 37,  g: 99,  b: 235 },
    claim:    { r: 234, g: 88,  b: 12  },
    claimAlt: { r: 219, g: 39,  b: 119 },
    bg:       '#f8fafc',
    panelBg:  'rgba(255,255,255,0.92)',
    panelBdr: 'rgba(37,99,235,0.18)',
    text:     'rgba(15,23,42,0.92)',
    textDim:  'rgba(71,85,105,0.85)',
    dimLink:  'rgba(15,23,42,0.08)',
    hlLink:   'rgba(37,99,235,0.55)',
    labelBg:  'rgba(255,255,255,0.95)',
  },
};

const rgb = (c: { r: number; g: number; b: number }, a = 1) =>
  `rgba(${c.r},${c.g},${c.b},${a})`;

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
  isFocused: boolean,
  opacity: number,
  t: number,
  COLORS: typeof PALETTES.dark,
  degree: number = 1
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

  const degreeBoost = Math.min(1 + Math.log(degree + 1) * 0.25, 2.2);
  const baseR = (isPaper ? 5.5 : 3.2) * degreeBoost;
  const pulse = isHover ? 1 + Math.sin(t * 3.5) * 0.18 : 1;
  const nodeR = (isHover ? baseR * 1.55 : baseR) * pulse;

  if (isHighlight || isFocused) {
    const g1 = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR * 7);
    g1.addColorStop(0, rgb(col, 0.12 * opacity));
    g1.addColorStop(1, rgb(col, 0));
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeR * 7, 0, Math.PI * 2);
    ctx.fillStyle = g1;
    ctx.fill();
  }

  const g2 = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeR * 3);
  g2.addColorStop(0, rgb(col, (isHighlight ? 0.35 : 0.1) * opacity));
  g2.addColorStop(1, rgb(col, 0));
  ctx.beginPath();
  ctx.arc(node.x, node.y, nodeR * 3, 0, Math.PI * 2);
  ctx.fillStyle = g2;
  ctx.fill();

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

  if (isHighlight) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
    ctx.strokeStyle = rgb(col, 0.85 * opacity);
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  if (isFocused) {
    const fp = (Math.sin(t * 2) + 1) / 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeR + 6 + fp * 2, 0, Math.PI * 2);
    ctx.strokeStyle = rgb(col, 0.9);
    ctx.lineWidth = 1.5 / globalScale;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

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

  if (isHover || isHighlight || isFocused) {
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
    ctx.fillStyle = COLORS.labelBg;
    ctx.fill();
    ctx.strokeStyle = rgb(col, isHover ? 0.55 : 0.2);
    ctx.lineWidth = 0.5 / globalScale;
    ctx.stroke();

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = isHover ? rgb(col, 1) : COLORS.text;
    ctx.fillText(label, node.x, bgY + bgH / 2);
  }
}

// ════════════════════════════════════════════════════════════════════════════
interface GraphViewProps {
  onAskAI?: (nodeName: string) => void;
  theme?: Theme;
}

export const GraphView: React.FC<GraphViewProps> = ({ onAskAI, theme = 'dark' }) => {
  const COLORS = PALETTES[theme];
  const isDark = theme === 'dark';

  const [data, setData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef(0);

  const [highlightNodes, setHighlightNodes] = useState(new Set<any>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const [focusedNode, setFocusedNode] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Paper' | 'Claim'>('All');
  const [minDegree, setMinDegree] = useState(0);

  const [showLegend, setShowLegend] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // ─── Compute node degrees ──────────────────────────────────────────
  const nodeDegrees = useMemo(() => {
    const map = new Map<string, number>();
    data.links.forEach((link: any) => {
      const sId = typeof link.source === 'object' ? link.source.id : link.source;
      const tId = typeof link.target === 'object' ? link.target.id : link.target;
      map.set(sId, (map.get(sId) ?? 0) + 1);
      map.set(tId, (map.get(tId) ?? 0) + 1);
    });
    return map;
  }, [data]);

  const maxDegree = useMemo(
    () => Math.max(1, ...Array.from(nodeDegrees.values())),
    [nodeDegrees]
  );

  // ─── Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const papers = data.nodes.filter((n: any) => n.label === 'Paper').length;
    const claims = data.nodes.filter((n: any) => n.label === 'Claim').length;
    const total  = data.nodes.length;
    const links  = data.links.length;
    const density = total > 1
      ? ((2 * links) / (total * (total - 1)) * 100).toFixed(2)
      : '0';
    const avgDegree = total ? (Array.from(nodeDegrees.values()).reduce((a, b) => a + b, 0) / total).toFixed(1) : '0';
    return { papers, claims, total, links, density, avgDegree };
  }, [data, nodeDegrees]);

  // ─── Fetch ─────────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    setLoading(true);
    api.get('/graph/data')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-280);
      fgRef.current.d3Force('link').distance(70);
    }
  }, [data]);

  // ─── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'f' || e.key === 'F') fgRef.current?.zoomToFit(500);
      if (e.key === 'r' || e.key === 'R') fgRef.current?.d3ReheatSimulation();
      if (e.key === 'Escape') {
        setFocusedNode(null);
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        setSearchQuery('');
      }
      if (e.key === 'l' || e.key === 'L') setShowLegend(s => !s);
      if (e.key === 's' || e.key === 'S') setShowStats(s => !s);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ─── Hover handlers ────────────────────────────────────────────────
  const handleNodeHover = useCallback((node: any) => {
    if (focusedNode) return;

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
  }, [data, focusedNode]);

  const handleLinkHover = useCallback((link: any) => {
    if (focusedNode) return;
    const hn = new Set<any>();
    const hl = new Set<any>();
    if (link) { hl.add(link); hn.add(link.source); hn.add(link.target); }
    setHighlightNodes(hn);
    setHighlightLinks(hl);
  }, [focusedNode]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoverPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // ─── Search ────────────────────────────────────────────────────────
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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return data.nodes
      .filter((n: any) => n.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6);
  }, [searchQuery, data.nodes]);

  // ─── Click handlers ────────────────────────────────────────────────
  const handleNodeClick = useCallback((node: any) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      setFocusedNode(node);
      const hn = new Set<any>([node]);
      const hl = new Set<any>();
      data.links.forEach((link: any) => {
        const s = link.source, tg = link.target;
        if (s === node || tg === node || s?.id === node.id || tg?.id === node.id) {
          hl.add(link);
          hn.add((s === node || s?.id === node.id) ? tg : s);
        }
      });
      setHighlightNodes(hn);
      setHighlightLinks(hl);
      onAskAI?.(node.name);
    } else {
      fgRef.current?.centerAt(node.x, node.y, 800);
      fgRef.current?.zoom(7, 800);
    }
    lastClickTime.current = now;
  }, [onAskAI, data]);

  const handleBackgroundClick = useCallback(() => {
    if (focusedNode) {
      setFocusedNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [focusedNode]);

  // ─── Export PNG ────────────────────────────────────────────────────
  const handleExport = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `documind-graph-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ─── Loading ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-5"
         style={{ background: COLORS.bg }}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 animate-spin"
             style={{
               borderColor: rgb(COLORS.paper, 0.2),
               borderTopColor: rgb(COLORS.paper, 1),
             }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
             style={{
               borderBottomColor: rgb(COLORS.claim, 0.4),
               animationDuration: '1.8s',
               animationDirection: 'reverse',
             }} />
      </div>
      <p className="text-[11px] tracking-[0.3em] uppercase font-mono"
         style={{ color: rgb(COLORS.paper, 0.6) }}>
        Mapping knowledge graph…
      </p>
    </div>
  );

  const panelStyle: React.CSSProperties = {
    background: COLORS.panelBg,
    border: `1px solid ${COLORS.panelBdr}`,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  };

  const hoveredDegree = hoverNode ? (nodeDegrees.get(hoverNode.id) ?? 0) : 0;

  // ─── Visibility predicates ─────────────────────────────────────────
  const nodeIsVisible = (node: any) => {
    if (activeFilter !== 'All' && node.label !== activeFilter) return false;
    const deg = nodeDegrees.get(node.id) ?? 0;
    if (deg < minDegree) return false;
    return true;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full h-full relative overflow-hidden group"
      style={{ background: COLORS.bg }}
    >
      {/* Inject custom slider styles */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${rgb(COLORS.paper, 1)};
          box-shadow: 0 0 8px ${rgb(COLORS.paper, 0.6)};
          cursor: pointer;
          border: 2px solid ${isDark ? '#04070f' : '#fff'};
        }
        input[type=range]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${rgb(COLORS.paper, 1)};
          box-shadow: 0 0 8px ${rgb(COLORS.paper, 0.6)};
          cursor: pointer;
          border: 2px solid ${isDark ? '#04070f' : '#fff'};
        }
        @keyframes graphPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* ═══ TOP-LEFT: Search + Filters ═══ */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300"
               style={{
                 ...panelStyle,
                 boxShadow: searchQuery ? `0 0 20px ${rgb(COLORS.paper, 0.2)}` : undefined,
               }}>
            <Search size={14} style={{ color: rgb(COLORS.paper, 0.6), flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search entities or papers…"
              value={searchQuery}
              onChange={handleSearch}
              className="bg-transparent border-none text-[12.5px] focus:outline-none w-52 font-mono"
              style={{ color: rgb(COLORS.paper, 0.95) }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setHighlightNodes(new Set()); }}
                      className="opacity-60 hover:opacity-100 transition-opacity">
                <X size={12} style={{ color: COLORS.textDim }} />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {searchResults.length > 1 && (
            <div className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-30"
                 style={panelStyle}>
              {searchResults.map((n: any, i) => {
                const isPaper = n.label === 'Paper';
                const c = isPaper ? COLORS.paper : COLORS.claim;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      fgRef.current?.centerAt(n.x, n.y, 900);
                      fgRef.current?.zoom(9, 900);
                      handleNodeHover(n);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 transition-colors text-left
                               hover:bg-opacity-80"
                    style={{
                      background: 'transparent',
                      borderBottom: i < searchResults.length - 1
                        ? `1px solid ${COLORS.dimLink}` : 'none',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: rgb(c, 1), boxShadow: `0 0 6px ${rgb(c, 0.8)}` }} />
                    <span className="text-[10.5px] font-mono truncate flex-1"
                          style={{ color: COLORS.text }}>
                      {n.name}
                    </span>
                    <span className="text-[8px] uppercase font-bold tracking-wider"
                          style={{ color: rgb(c, 0.7) }}>
                      {n.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={12} style={{ color: COLORS.textDim }} />
          {(['All', 'Paper', 'Claim'] as const).map(f => {
            const active = activeFilter === f;
            const accent = f === 'Claim' ? rgb(COLORS.claim, 1) : rgb(COLORS.paper, 1);
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-3.5 py-1 rounded-xl text-[9.5px] font-black uppercase
                           tracking-widest transition-all duration-200"
                style={{
                  background: active ? accent + '22' : COLORS.panelBg,
                  border: `1px solid ${active ? accent + '88' : COLORS.panelBdr}`,
                  color:  active ? accent : COLORS.textDim,
                  boxShadow: active ? `0 0 14px ${accent}44` : 'none',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Connection Strength Slider */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl" style={panelStyle}>
          <Network size={12} style={{ color: rgb(COLORS.paper, 0.7) }} />
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] uppercase tracking-widest font-mono font-black"
                    style={{ color: COLORS.textDim }}>
                Min Connections
              </span>
              <span className="text-[10px] font-mono font-bold"
                    style={{ color: rgb(COLORS.paper, 0.95) }}>
                {minDegree}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.min(maxDegree, 20)}
              value={minDegree}
              onChange={e => setMinDegree(Number(e.target.value))}
              className="w-44 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${rgb(COLORS.paper, 0.7)} 0%, ${rgb(COLORS.paper, 0.7)} ${(minDegree / Math.min(maxDegree, 20)) * 100}%, ${COLORS.dimLink} ${(minDegree / Math.min(maxDegree, 20)) * 100}%, ${COLORS.dimLink} 100%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══ TOP-RIGHT: Action Buttons ═══ */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        {[
          { Icon: Maximize2, title: 'Fit view (F)',         onClick: () => fgRef.current?.zoomToFit(500, 80) },
          { Icon: RefreshCw, title: 'Reheat simulation (R)', onClick: () => fgRef.current?.d3ReheatSimulation() },
          { Icon: Download,  title: 'Export PNG',            onClick: handleExport },
          { Icon: showLegend ? Eye : EyeOff, title: 'Toggle legend (L)', onClick: () => setShowLegend(s => !s) },
          { Icon: Activity,  title: 'Toggle stats (S)',      onClick: () => setShowStats(s => !s) },
        ].map(({ Icon, title, onClick }, i) => (
          <button
            key={i}
            onClick={onClick}
            title={title}
            className="p-2.5 rounded-xl transition-all duration-200 active:scale-95"
            style={{
              ...panelStyle,
              color: rgb(COLORS.paper, 0.75),
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 0 16px ${rgb(COLORS.paper, 0.3)}`;
              e.currentTarget.style.color = rgb(COLORS.paper, 1);
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.color = rgb(COLORS.paper, 0.75);
            }}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      {/* ═══ TOP-CENTER: Focus Mode banner ═══ */}
      {focusedNode && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20
                        flex items-center gap-3 px-4 py-2 rounded-full"
             style={{
               ...panelStyle,
               border: `1px solid ${rgb(COLORS.paper, 0.45)}`,
               boxShadow: `0 0 20px ${rgb(COLORS.paper, 0.25)}`,
             }}>
          <Focus size={13} style={{ color: rgb(COLORS.paper, 1) }} />
          <span className="text-[10px] font-mono font-black uppercase tracking-widest"
                style={{ color: rgb(COLORS.paper, 1) }}>
            Focused:
          </span>
          <span className="text-[11px] font-mono font-bold truncate max-w-[280px]"
                style={{ color: COLORS.text }}>
            {focusedNode.name}
          </span>
          <button
            onClick={handleBackgroundClick}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: COLORS.textDim }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ═══ Stats Panel (top-right, below buttons) ═══ */}
      {showStats && (
        <div className="absolute top-20 right-5 z-10 p-4 rounded-2xl w-56"
             style={panelStyle}>
          <p className="text-[9px] tracking-[0.25em] uppercase font-mono mb-3 flex items-center gap-2 font-black"
             style={{ color: rgb(COLORS.paper, 0.6) }}>
            <span className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: rgb(COLORS.paper, 1),
                    boxShadow: `0 0 6px ${rgb(COLORS.paper, 1)}`,
                    animation: 'graphPulse 2s ease-in-out infinite',
                  }} />
            Graph Metrics
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { Icon: FileText,  label: 'Papers',   value: stats.papers,    color: COLORS.paper },
              { Icon: Tag,       label: 'Claims',   value: stats.claims,    color: COLORS.claim },
              { Icon: GitBranch, label: 'Edges',    value: stats.links,     color: COLORS.paper },
              { Icon: Hash,      label: 'Avg Deg.', value: stats.avgDegree, color: COLORS.claim },
            ].map(({ Icon, label, value, color }, i) => (
              <div key={i} className="flex flex-col gap-1.5 p-2.5 rounded-xl"
                   style={{
                     background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.04)',
                     border: `1px solid ${COLORS.dimLink}`,
                   }}>
                <div className="flex items-center gap-1.5">
                  <Icon size={10} style={{ color: rgb(color, 0.85) }} />
                  <span className="text-[8px] uppercase tracking-widest font-black font-mono"
                        style={{ color: COLORS.textDim }}>
                    {label}
                  </span>
                </div>
                <span className="text-[15px] font-black font-mono leading-none"
                      style={{ color: rgb(color, 1) }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 flex items-center justify-between text-[9px] font-mono"
               style={{ borderTop: `1px solid ${COLORS.dimLink}`, color: COLORS.textDim }}>
            <span className="uppercase tracking-widest font-black">Density</span>
            <span className="font-bold" style={{ color: rgb(COLORS.paper, 0.95) }}>
              {stats.density}%
            </span>
          </div>
        </div>
      )}

      {/* ═══ Hover Tooltip ═══ */}
      {hoverNode && hoverPosition && !focusedNode && (
        <div
          className="absolute z-30 pointer-events-none p-3 rounded-2xl min-w-[180px] max-w-[260px]"
          style={{
            ...panelStyle,
            left: Math.min(hoverPosition.x + 16, (containerRef.current?.clientWidth ?? 999) - 280),
            top:  Math.min(hoverPosition.y + 16, (containerRef.current?.clientHeight ?? 999) - 140),
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${rgb(
              hoverNode.label === 'Paper' ? COLORS.paper : COLORS.claim, 0.18
            )}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2 pb-2"
               style={{ borderBottom: `1px solid ${COLORS.dimLink}` }}>
            <span className="w-2 h-2 rounded-full"
                  style={{
                    background: rgb(hoverNode.label === 'Paper' ? COLORS.paper : COLORS.claim, 1),
                    boxShadow: `0 0 8px ${rgb(hoverNode.label === 'Paper' ? COLORS.paper : COLORS.claim, 0.8)}`,
                  }} />
            <span className="text-[8.5px] font-black uppercase tracking-[0.2em] font-mono"
                  style={{ color: rgb(hoverNode.label === 'Paper' ? COLORS.paper : COLORS.claim, 1) }}>
              {hoverNode.label}
            </span>
          </div>
          <p className="text-[11px] font-bold leading-snug mb-2 break-words"
             style={{ color: COLORS.text, fontFamily: 'monospace' }}>
            {hoverNode.name}
          </p>
          <div className="flex items-center justify-between text-[9px] font-mono pt-2"
               style={{ borderTop: `1px solid ${COLORS.dimLink}`, color: COLORS.textDim }}>
            <span className="uppercase tracking-widest font-black">Connections</span>
            <span className="font-bold" style={{ color: rgb(COLORS.paper, 0.95) }}>
              {hoveredDegree}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[8.5px] font-mono opacity-70"
               style={{ color: COLORS.textDim }}>
            <Zap size={9} />
            <span>Double-click for AI insight</span>
          </div>
        </div>
      )}

      {/* ═══ Graph ═══ */}
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel={() => ''}
        nodeRelSize={6}
        backgroundColor={COLORS.bg}

        nodeVisibility={nodeIsVisible}
        linkVisibility={(link: any) => {
          const sNode = typeof link.source === 'object'
            ? link.source
            : data.nodes.find((n: any) => n.id === link.source);
          const tNode = typeof link.target === 'object'
            ? link.target
            : data.nodes.find((n: any) => n.id === link.target);
          if (!sNode || !tNode) return false;
          if (!nodeIsVisible(sNode) || !nodeIsVisible(tNode)) return false;
          if (focusedNode) {
            return sNode === focusedNode || tNode === focusedNode
                || sNode.id === focusedNode.id || tNode.id === focusedNode.id;
          }
          return true;
        }}

        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        onNodeDragEnd={(node: any) => { node.fx = node.x; node.fy = node.y; }}
        onNodeRightClick={(node: any) => { node.fx = null; node.fy = null; }}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}

        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (node.x === undefined || node.y === undefined) return;

          const t = performance.now() / 1000;
          const degree = nodeDegrees.get(node.id) ?? 1;

          let opacity: number;
          if (focusedNode) {
            opacity = highlightNodes.has(node) ? 1 : 0.04;
          } else if (highlightNodes.size === 0) {
            opacity = 0.8;
          } else {
            opacity = highlightNodes.has(node) ? 1 : 0.06;
          }

          paintNode(
            node, ctx, globalScale,
            highlightNodes.has(node),
            node === hoverNode,
            focusedNode === node,
            opacity,
            t,
            COLORS,
            degree
          );
        }}

        linkColor={(link: any) => highlightLinks.has(link) ? COLORS.hlLink : COLORS.dimLink}
        linkWidth={(link: any) => highlightLinks.has(link) ? 1.4 : 0.4}
        linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleSpeed={0.007}
        linkDirectionalParticleColor={() => rgb(COLORS.paper, 0.9)}
      />

      {/* ═══ BOTTOM-LEFT: Legend ═══ */}
      {showLegend && (
        <div className="absolute bottom-5 left-5 z-10 p-4 rounded-2xl transition-opacity duration-300"
             style={panelStyle}>
          <p className="text-[9px] tracking-[0.25em] uppercase font-mono mb-3 flex items-center gap-2 font-black"
             style={{ color: rgb(COLORS.paper, 0.6) }}>
            <span className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: rgb(COLORS.paper, 1),
                    boxShadow: `0 0 6px ${rgb(COLORS.paper, 1)}`,
                    animation: 'graphPulse 2s ease-in-out infinite',
                  }} />
            Graph Controls
          </p>

          <div className="flex items-center gap-4 mb-3 pb-3"
               style={{ borderBottom: `1px solid ${COLORS.dimLink}` }}>
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold"
                  style={{ color: rgb(COLORS.paper, 0.85) }}>
              <span className="w-2 h-2 rounded-full"
                    style={{
                      background: rgb(COLORS.paper, 1),
                      boxShadow: `0 0 8px ${rgb(COLORS.paper, 1)}`,
                    }} />
              Paper
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold"
                  style={{ color: rgb(COLORS.claim, 0.85) }}>
              <span className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: rgb(COLORS.claim, 1),
                      boxShadow: `0 0 6px ${rgb(COLORS.claim, 1)}`,
                    }} />
              Claim
            </span>
          </div>

          <ul className="space-y-1.5">
            {([
              ['Hover',    'Highlight connections'],
              ['Click',    'Zoom to entity'],
              ['2× Click', 'Focus + Ask AI'],
              ['Drag',     'Pin node position'],
              ['R-click',  'Unpin node'],
              ['F / R',    'Fit / Reheat'],
              ['Esc',      'Clear focus'],
            ] as [string, string][]).map(([key, label]) => {
              const isPrimary = key === '2× Click';
              return (
                <li key={key} className="flex items-center gap-2.5 text-[10.5px] font-mono"
                    style={{ color: COLORS.text }}>
                  <kbd className="px-1.5 py-0.5 rounded text-[8.5px] font-bold min-w-[52px] text-center"
                       style={{
                         background: isPrimary ? rgb(COLORS.paper, 0.12) : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)'),
                         border: `1px solid ${isPrimary ? rgb(COLORS.paper, 0.4) : COLORS.dimLink}`,
                         color: isPrimary ? rgb(COLORS.paper, 1) : COLORS.textDim,
                       }}>
                    {key}
                  </kbd>
                  <span style={{ color: COLORS.textDim }}>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ═══ BOTTOM-RIGHT: Mini Status Bar ═══ */}
      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-3 px-3.5 py-2 rounded-full"
           style={panelStyle}>
        <span className="w-1.5 h-1.5 rounded-full"
              style={{
                background: '#22c55e',
                boxShadow: '0 0 8px rgba(34,197,94,0.7)',
                animation: 'graphPulse 1.8s ease-in-out infinite',
              }} />
        <span className="text-[9.5px] font-mono font-black uppercase tracking-widest"
              style={{ color: COLORS.textDim }}>
          Live · {stats.total} nodes · {stats.links} edges
        </span>
      </div>
    </div>
  );
};