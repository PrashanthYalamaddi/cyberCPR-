import React, { useState } from 'react';
import {
  Path,
  Lightning,
  Sliders,
  Check,
  ArrowRight,
  ShieldCheck,
  Cpu
} from '@phosphor-icons/react';
import { SystemNode, SystemEdge } from '../types';
import { runDijkstraContainmentPath, runAStarContainmentPath } from '../algorithms/shortestPath';

interface ContainmentRouterProps {
  nodes: SystemNode[];
  edges: SystemEdge[];
  onSelectNode: (nodeId: string) => void;
  onSetRoutePath: (path: string[], severedEdges: string[]) => void;
}

export const ContainmentRouter: React.FC<ContainmentRouterProps> = ({
  nodes,
  edges,
  onSelectNode,
  onSetRoutePath
}) => {
  const [sourceId, setSourceId] = useState<string>(nodes[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(nodes[nodes.length - 1]?.id || '');
  const [algorithmType, setAlgorithmType] = useState<'Dijkstra' | 'AStar'>('Dijkstra');
  const [stepIndex, setStepIndex] = useState<number>(0);

  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));

  const dijkstraResult = runDijkstraContainmentPath(sourceId, targetId, nodes, edges);
  const astarResult = runAStarContainmentPath(sourceId, targetId, nodes, edges);

  const activeResult = algorithmType === 'Dijkstra' ? dijkstraResult : astarResult;
  const currentStep = activeResult.steps[stepIndex] || activeResult.steps[0];

  const handleCompute = () => {
    setStepIndex(activeResult.steps.length - 1);
    onSetRoutePath(activeResult.path, activeResult.edgesCut);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Path size={20} className="text-[#3F0D1B]" />
            <h2 className="text-base font-bold text-[#3F0D1B] tracking-tight">
              Shortest Path Containment & Minimum Disruption Router
            </h2>
          </div>
          <p className="text-xs text-[#521A27] mt-1">
            Computes the least-disruption isolation boundary or forensic dispatch route across weighted infrastructure edges.
          </p>
        </div>

        {/* Algorithm Toggle */}
        <div className="flex items-center bg-[#EDE4D6] p-1 rounded-lg border border-[#CDBFA7]">
          <button
            onClick={() => {
              setAlgorithmType('Dijkstra');
              setStepIndex(0);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              algorithmType === 'Dijkstra'
                ? 'bg-[#3F0D1B] text-[#FAF6EE] shadow-xs font-bold'
                : 'text-[#521A27] hover:text-[#3F0D1B]'
            }`}
          >
            Dijkstra (Optimal)
          </button>
          <button
            onClick={() => {
              setAlgorithmType('AStar');
              setStepIndex(0);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              algorithmType === 'AStar'
                ? 'bg-[#3F0D1B] text-[#FAF6EE] shadow-xs font-bold'
                : 'text-[#521A27] hover:text-[#3F0D1B]'
            }`}
          >
            A* Search (Heuristic)
          </button>
        </div>
      </div>

      {/* Route Parameters Picker */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] grid grid-cols-1 sm:grid-cols-3 gap-4 items-end shadow-xs transition-colors">
        <div>
          <label htmlFor="source-node-select" className="block text-[11px] font-mono text-[#521A27] mb-1">
            SOURCE (RESPONDER / INGRESS)
          </label>
          <select
            id="source-node-select"
            value={sourceId}
            onChange={e => {
              setSourceId(e.target.value);
              setStepIndex(0);
            }}
            className="w-full bg-[#EDE4D6] border border-[#CDBFA7] text-xs text-[#3F0D1B] rounded-lg p-2 focus:ring-1 focus:ring-[#3F0D1B]"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.ip})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="target-node-select" className="block text-[11px] font-mono text-[#521A27] mb-1">
            TARGET (INFECTED ASSET / VAULT)
          </label>
          <select
            id="target-node-select"
            value={targetId}
            onChange={e => {
              setTargetId(e.target.value);
              setStepIndex(0);
            }}
            className="w-full bg-[#EDE4D6] border border-[#CDBFA7] text-xs text-[#3F0D1B] rounded-lg p-2 focus:ring-1 focus:ring-[#3F0D1B]"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.ip})
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={handleCompute}
            className="w-full py-2 px-4 rounded-lg bg-[#3F0D1B] hover:bg-[#5C1D2D] text-[#FAF6EE] font-bold text-xs tracking-wide shadow-md shadow-[#3F0D1B]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <Lightning size={16} weight="fill" />
            <span>Compute & Highlight Path</span>
          </button>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] text-xs font-mono transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-[#521A27]">Step:</span>
          <span className="text-[#3F0D1B] font-bold">{stepIndex + 1} / {activeResult.steps.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStepIndex(prev => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
            className="px-2.5 py-1 rounded bg-[#EDE4D6] hover:bg-[#D8CBB5] disabled:opacity-40 text-[#3F0D1B] border border-[#CDBFA7] transition-colors shadow-xs"
          >
            Back
          </button>
          <button
            onClick={() => setStepIndex(prev => Math.min(activeResult.steps.length - 1, prev + 1))}
            disabled={stepIndex === activeResult.steps.length - 1}
            className="px-2.5 py-1 rounded bg-[#EDE4D6] hover:bg-[#D8CBB5] disabled:opacity-40 text-[#3F0D1B] border border-[#CDBFA7] transition-colors shadow-xs"
          >
            Forward
          </button>
        </div>
      </div>

      {/* Active Step Description */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] space-y-2 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#3F0D1B] uppercase tracking-wider">
            {currentStep.title}
          </span>
          <span className="text-[11px] font-mono text-[#521A27]">
            {algorithmType === 'Dijkstra' ? 'O((V+E) log V)' : 'O(E) pruned'}
          </span>
        </div>
        <p className="text-xs text-[#3F0D1B] leading-relaxed font-mono">
          {currentStep.description}
        </p>
      </div>

      {/* Reconstructed Path Banner */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#EDE4D6] text-[#3F0D1B] space-y-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-[#3F0D1B] font-bold" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
              Computed Containment Route
            </h3>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[#521A27]">Total Disruption Cost:</span>
            <span className="text-[#3F0D1B] font-bold text-sm">{activeResult.totalCost} pts</span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {activeResult.path.map((nodeId, idx) => {
            const node = nodeMap.get(nodeId);
            if (!node) return null;
            return (
              <React.Fragment key={nodeId}>
                <div
                  onClick={() => onSelectNode(node.id)}
                  className="shrink-0 cursor-pointer p-2.5 rounded-lg bg-[#FAF6EE] border border-[#CDBFA7] hover:border-[#3F0D1B] text-center font-mono min-w-[130px] transition-colors shadow-xs"
                >
                  <div className="text-[10px] text-[#3F0D1B] font-bold">Hop {idx}</div>
                  <div className="font-bold text-[#3F0D1B] text-xs truncate mt-0.5">{node.name}</div>
                  <div className="text-[9px] text-[#521A27] mt-1">{node.ip}</div>
                </div>
                {idx < activeResult.path.length - 1 && (
                  <ArrowRight size={16} className="text-[#3F0D1B] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Edge Relaxation Trace Table */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] space-y-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-[#CDBFA7] pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
            Dijkstra Edge Relaxation Log (d[u] + w &lt; d[v])
          </span>
          <span className="text-xs font-mono text-[#521A27]">
            {activeResult.stepRecords.length} Relaxations Recorded
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1.5 font-mono text-xs">
          {activeResult.stepRecords.map((rec, i) => (
            <div
              key={i}
              className="p-2 rounded bg-[#EDE4D6] border border-[#CDBFA7] text-[#3F0D1B] flex items-center justify-between hover:bg-[#D8CBB5] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#3F0D1B] font-bold">#{rec.step}</span>
                <span>{rec.explanation}</span>
              </div>
              <span className="text-[10px] text-[#521A27]">Evaluated</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
