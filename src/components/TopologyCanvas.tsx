import React, { useRef, useEffect, useState } from 'react';
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsClockwise,
  Eye,
  ShieldWarning,
  Lock,
  Cpu,
  Database,
  Globe,
  DeviceTablet
} from '@phosphor-icons/react';
import { SystemNode, SystemEdge, Incident } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TopologyCanvasProps {
  nodes: SystemNode[];
  edges: SystemEdge[];
  incidents: Incident[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  activePathNodeIds?: string[];
  severedEdgeIds?: string[];
  highlightedNodeIds?: string[];
  frontierNodeIds?: string[];
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  nodes,
  edges,
  incidents,
  selectedNodeId,
  onSelectNode,
  activePathNodeIds = [],
  severedEdgeIds = [],
  highlightedNodeIds = [],
  frontierNodeIds = []
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [showA11yTable, setShowA11yTable] = useState<boolean>(false);

  // Initialize node positions based on props
  useEffect(() => {
    const initialPos: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      initialPos[n.id] = { x: n.x, y: n.y };
    });
    setNodePositions(initialPos);
  }, [nodes]);

  // Center pan initially
  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight || 500;
      setPan({ x: Math.max(20, (width - 1000) / 2), y: Math.max(20, (height - 400) / 2) });
    }
  }, []);

  // Animation frame loop for packet particles and pulsing rings
  useEffect(() => {
    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark';

      // Draw subtle grid (adaptive to theme)
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      ctx.strokeStyle = 'rgba(63, 13, 27, 0.12)';
      ctx.lineWidth = 1 / zoom;
      const gridSize = 40;
      const startX = -pan.x / zoom;
      const startY = -pan.y / zoom;
      const endX = (width - pan.x) / zoom;
      const endY = (height - pan.y) / zoom;

      ctx.beginPath();
      for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // Draw Edges
      edges.forEach((edge) => {
        const p1 = nodePositions[edge.source] || { x: 0, y: 0 };
        const p2 = nodePositions[edge.target] || { x: 0, y: 0 };

        const isSevered = severedEdgeIds.includes(edge.id) || edge.isSevered;
        const isPath =
          activePathNodeIds.includes(edge.source) &&
          activePathNodeIds.includes(edge.target) &&
          Math.abs(activePathNodeIds.indexOf(edge.source) - activePathNodeIds.indexOf(edge.target)) === 1;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isSevered) {
          // Severed containment edge
          ctx.strokeStyle = 'rgba(138, 30, 53, 0.95)';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw cut marker in middle
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.fillStyle = '#8A1E35';
          ctx.beginPath();
          ctx.arc(midX, midY, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (isPath) {
          // Optimal containment route (Deep Burgundy with shadow)
          ctx.strokeStyle = '#3F0D1B';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = 'rgba(63, 13, 27, 0.45)';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (edge.isDependency) {
          // System dependency edge (directed dashed deep burgundy)
          ctx.strokeStyle = 'rgba(63, 13, 27, 0.65)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Regular network link
          ctx.strokeStyle = 'rgba(63, 13, 27, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw animated packet along active edge
        if (!isSevered && edge.isActive) {
          const t = ((particleOffset / 80) + (parseInt(edge.id.replace(/\D/g, '') || '1') * 0.2)) % 1;
          const px = p1.x + (p2.x - p1.x) * t;
          const py = p1.y + (p2.y - p1.y) * t;

          ctx.fillStyle = isPath ? '#3F0D1B' : edge.isDependency ? '#8A1E35' : '#521A27';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Edge label (weight/protocol)
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.fillStyle = isSevered ? '#8A1E35' : '#521A27';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Cost: ${edge.weight}`, midX, midY - 6);
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const pos = nodePositions[node.id] || { x: node.x, y: node.y };
        const isSelected = selectedNodeId === node.id;
        const isHighlighted = highlightedNodeIds.includes(node.id);
        const isFrontier = frontierNodeIds.includes(node.id);
        const isPathNode = activePathNodeIds.includes(node.id);
        const hasIncident = incidents.some((inc) => inc.targetNodeId === node.id);

        const nodeRadius = 24;

        // Outer glow / halo for compromised or selected nodes
        if (hasIncident || node.status === 'compromised') {
          const pulse = (Math.sin(particleOffset * 0.08) + 1) * 6;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 8 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(138, 30, 53, 0.2)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = '#8A1E35';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (isFrontier) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = '#3F0D1B';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (isHighlighted || isPathNode) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#3F0D1B';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Node Body Background
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? '#D8CBB5'
          : hasIncident
          ? '#F5E8EB'
          : '#FAF6EE';
        ctx.fill();

        // Node Border
        ctx.strokeStyle = isSelected
          ? '#3F0D1B'
          : hasIncident
          ? '#8A1E35'
          : node.status === 'healthy'
          ? '#3F0D1B'
          : '#CDBFA7';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Node Icon / Glyphs
        ctx.fillStyle = hasIncident
          ? '#8A1E35'
          : isPathNode
          ? '#3F0D1B'
          : isSelected
          ? '#3F0D1B'
          : '#3F0D1B';
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const typeBadge =
          node.type === 'database'
            ? 'DB'
            : node.type === 'auth_server'
            ? 'AUTH'
            : node.type === 'firewall'
            ? 'FW'
            : node.type === 'api_gateway'
            ? 'API'
            : node.type === 'scada_plc'
            ? 'PLC'
            : 'SRV';
        ctx.fillText(typeBadge, pos.x, pos.y - 2);

        // Draw Criticality badge
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = node.criticality >= 8 ? '#8A1E35' : '#521A27';
        ctx.fillText(`C:${node.criticality}`, pos.x, pos.y + 10);

        // Node Label (Below Node)
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#3F0D1B';
        ctx.fillText(node.name, pos.x, pos.y + nodeRadius + 14);

        // Node IP Label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#521A27';
        ctx.fillText(node.ip, pos.x, pos.y + nodeRadius + 26);
      });

      ctx.restore();
      ctx.restore();

      particleOffset += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, edges, incidents, nodePositions, zoom, pan, selectedNodeId, activePathNodeIds, severedEdgeIds, highlightedNodeIds, frontierNodeIds, theme]);

  // Mouse interaction: Click & Drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    let clickedNode: SystemNode | null = null;
    nodes.forEach((node) => {
      const pos = nodePositions[node.id] || { x: node.x, y: node.y };
      const dist = Math.hypot(mouseX - pos.x, mouseY - pos.y);
      if (dist <= 26) {
        clickedNode = node;
      }
    });

    if (clickedNode) {
      setDraggedNodeId(clickedNode.id);
      onSelectNode(clickedNode.id);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeId) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: { x: Math.round(mouseX), y: Math.round(mouseY) }
      }));
    } else if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNodeId(null);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.0, Math.max(0.6, Number((prev + delta).toFixed(2)))));
  };

  const handleResetView = () => {
    setZoom(1);
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight || 500;
      setPan({ x: Math.max(20, (width - 1000) / 2), y: Math.max(20, (height - 400) / 2) });
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedIncident = incidents.find((i) => i.targetNodeId === selectedNodeId);

  return (
    <div className="relative w-full rounded-2xl border border-[#CDBFA7] bg-[#EDE4D6] text-[#3F0D1B] overflow-hidden shadow-sm transition-colors" ref={containerRef}>
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#CDBFA7] bg-[#EDE4D6] text-[#3F0D1B] text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[#3F0D1B] font-bold tracking-wide">SYSTEM TOPOLOGY GRAPH</span>
          <span className="text-[11px] text-[#521A27] hidden sm:inline">
            Drag nodes to re-layout | Click node to inspect state
          </span>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowA11yTable(!showA11yTable)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF6EE] hover:bg-[#E2D5C0] text-[#3F0D1B] border border-[#CDBFA7] text-[11px] transition-colors shadow-xs cursor-pointer"
            title="Toggle accessible text equivalent table"
          >
            <Eye size={13} className="text-[#3F0D1B]" />
            <span className="hidden md:inline">{showA11yTable ? 'Canvas View' : 'Table View'}</span>
          </button>

          <button
            onClick={() => handleZoom(0.1)}
            aria-label="Zoom In"
            className="p-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E2D5C0] text-[#3F0D1B] border border-[#CDBFA7] transition-colors shadow-xs cursor-pointer"
          >
            <MagnifyingGlassPlus size={14} />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            aria-label="Zoom Out"
            className="p-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E2D5C0] text-[#3F0D1B] border border-[#CDBFA7] transition-colors shadow-xs cursor-pointer"
          >
            <MagnifyingGlassMinus size={14} />
          </button>
          <button
            onClick={handleResetView}
            aria-label="Reset View"
            className="p-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E2D5C0] text-[#3F0D1B] border border-[#CDBFA7] transition-colors shadow-xs cursor-pointer"
          >
            <ArrowsClockwise size={14} />
          </button>
          <span className="font-mono text-[10px] text-[#521A27] px-1">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Main Canvas Area or Accessible Table View */}
      {showA11yTable ? (
        <div className="p-4 max-h-[500px] overflow-y-auto bg-[#FAF6EE] text-[#3F0D1B]">
          <h2 className="text-sm font-bold text-[#3F0D1B] mb-2">Network Infrastructure State (Screen Reader Table)</h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#CDBFA7] text-[#521A27] font-mono">
                <th className="py-2 px-3">Node Name</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3">Subnet</th>
                <th className="py-2 px-3">Criticality</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Active Incident</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CDBFA7] font-mono text-[#3F0D1B]">
              {nodes.map((node) => {
                const inc = incidents.find((i) => i.targetNodeId === node.id);
                return (
                  <tr key={node.id} className="hover:bg-[#EDE4D6] transition-colors">
                    <td className="py-2 px-3 font-semibold text-[#3F0D1B]">{node.name}</td>
                    <td className="py-2 px-3 text-[#3F0D1B] font-bold">{node.ip}</td>
                    <td className="py-2 px-3 text-[#521A27]">{node.subnet}</td>
                    <td className="py-2 px-3">{node.criticality}/10</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        node.status === 'compromised' ? 'bg-[#8A1E35]/15 text-[#8A1E35] border border-[#8A1E35]/40' : 'bg-[#3F0D1B]/10 text-[#3F0D1B] border border-[#3F0D1B]/20'
                      }`}>
                        {node.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[#8A1E35] font-semibold">{inc ? `${inc.title} (${inc.cve})` : 'None'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="topology-canvas w-full h-[460px] sm:h-[520px] bg-[#EDE4D6] block transition-colors"
        />
      )}

      {/* Selected Node Inspector Flyout */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 rounded-2xl bg-[#FAF6EE]/95 text-[#3F0D1B] backdrop-blur-md border border-[#3F0D1B]/40 p-4 shadow-xl text-xs space-y-2.5 z-20">
          <div className="flex items-center justify-between border-b border-[#CDBFA7] pb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedNode.status === 'compromised' ? 'bg-[#8A1E35] animate-ping' : 'bg-[#3F0D1B]'}`} />
              <span className="font-bold text-[#3F0D1B] text-sm">{selectedNode.name}</span>
            </div>
            <button
              onClick={() => onSelectNode(null)}
              className="text-[#521A27] hover:text-[#3F0D1B] px-1 text-sm font-bold cursor-pointer"
            >
              x
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-[#521A27] block text-[10px]">IP / SUBNET</span>
              <span className="text-[#3F0D1B] font-semibold">{selectedNode.ip}</span>
            </div>
            <div>
              <span className="text-[#521A27] block text-[10px]">CRITICALITY</span>
              <span className="text-[#3F0D1B] font-bold">{selectedNode.criticality} / 10</span>
            </div>
            <div>
              <span className="text-[#521A27] block text-[10px]">DISRUPTION COST</span>
              <span className="text-[#3F0D1B]">{selectedNode.operatingCost} pts / min</span>
            </div>
            <div>
              <span className="text-[#521A27] block text-[10px]">CLASSIFICATION</span>
              <span className="text-[#3F0D1B]">{selectedNode.dataClassification}</span>
            </div>
          </div>

          {selectedIncident && (
            <div className="p-2.5 rounded-xl bg-[#EDE4D6] border border-[#8A1E35]/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#8A1E35] font-bold flex items-center gap-1">
                  <ShieldWarning size={14} />
                  <span>ACTIVE BREACH INJECT</span>
                </span>
                <span className="font-mono text-[10px] text-[#8A1E35] font-bold">CVSS {selectedIncident.cvss}</span>
              </div>
              <p className="text-[#3F0D1B] font-semibold text-[11px]">{selectedIncident.title}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#521A27]">
                <span>{selectedIncident.cve}</span>
                <span>SLA Limit: {selectedIncident.slaLimitMinutes}m</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-14 right-3 rounded-xl bg-[#FAF6EE]/95 text-[#3F0D1B] backdrop-blur-sm border border-[#CDBFA7] p-3 text-[10px] font-mono space-y-1.5 hidden md:block shadow-sm">
        <div className="text-[#521A27] font-bold tracking-wider">TOPOLOGY LEGEND</div>
        <div className="flex items-center gap-2 text-[#3F0D1B]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3F0D1B] inline-block" />
          <span>Nominal Host</span>
        </div>
        <div className="flex items-center gap-2 text-[#3F0D1B]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8A1E35] inline-block animate-pulse" />
          <span>Compromised Host</span>
        </div>
        <div className="flex items-center gap-2 text-[#3F0D1B]">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#3F0D1B] inline-block" />
          <span>Containment Route</span>
        </div>
        <div className="flex items-center gap-2 text-[#3F0D1B]">
          <span className="w-3 border-t-2 border-[#8A1E35] border-dashed inline-block" />
          <span>Severed Boundary</span>
        </div>
      </div>
    </div>
  );
};
