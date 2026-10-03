import React, { useState } from 'react';
import {
  TreeStructure,
  Cpu,
  ArrowFatLineDown,
  ArrowFatLineUp,
  Sparkle,
  Info,
  Clock,
  ListNumbers
} from '@phosphor-icons/react';
import { HeapNode, Incident, SystemNode, SystemEdge } from '../types';
import { IncidentMaxHeap, calculateIncidentScore } from '../algorithms/priorityQueue';

interface PriorityQueueVisualizerProps {
  incidents: Incident[];
  nodes: SystemNode[];
  edges: SystemEdge[];
  onSelectNode: (nodeId: string) => void;
}

export const PriorityQueueVisualizer: React.FC<PriorityQueueVisualizerProps> = ({
  incidents,
  nodes,
  edges,
  onSelectNode
}) => {
  const [heapArray, setHeapArray] = useState<HeapNode[]>(() => {
    const heap = new IncidentMaxHeap();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    incidents.forEach(inc => {
      const node = nodeMap.get(inc.targetNodeId);
      if (!node) return;
      const { score, breakdown, cascadingImpact } = calculateIncidentScore(inc, node, edges);
      heap.insert({
        incident: inc,
        score,
        nodeName: node.name,
        criticality: node.criticality,
        cascadingImpact,
        formulaBreakdown: breakdown
      });
    });
    return heap.getHeapArray();
  });

  const [extractedHistory, setExtractedHistory] = useState<HeapNode[]>([]);
  const [lastActionLog, setLastActionLog] = useState<string>('Max-Heap built and balanced in O(K log K) time.');

  const handleExtractMax = () => {
    if (heapArray.length === 0) return;
    const heap = new IncidentMaxHeap();
    heapArray.forEach(item => heap.insert(item));

    const max = heap.extractMax();
    if (max) {
      setHeapArray(heap.getHeapArray());
      setExtractedHistory(prev => [max, ...prev]);
      setLastActionLog(`Extracted Top Priority: [${max.incident.title}] for ${max.nodeName} with Priority Score ${max.score}. Dispatched response team.`);
    }
  };

  const handleRebuildHeap = () => {
    const heap = new IncidentMaxHeap();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    incidents.forEach(inc => {
      const node = nodeMap.get(inc.targetNodeId);
      if (!node) return;
      const { score, breakdown, cascadingImpact } = calculateIncidentScore(inc, node, edges);
      heap.insert({
        incident: inc,
        score,
        nodeName: node.name,
        criticality: node.criticality,
        cascadingImpact,
        formulaBreakdown: breakdown
      });
    });
    setHeapArray(heap.getHeapArray());
    setExtractedHistory([]);
    setLastActionLog('Re-initialized Binary Max-Heap from incident pool.');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <TreeStructure size={20} className="text-[#3F0D1B]" />
            <h2 className="text-base font-bold text-[#3F0D1B] tracking-tight">
              Binary Max-Heap Incident Priority Queue
            </h2>
          </div>
          <p className="text-xs text-[#521A27] mt-1">
            DAA Core Data Structure: Evaluates multi-criteria urgency and maintains root-invariant for O(1) top-incident peek and O(log K) extraction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExtractMax}
            disabled={heapArray.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              heapArray.length > 0
                ? 'bg-[#3F0D1B] hover:bg-[#5C1D2D] text-[#FAF6EE] shadow-md shadow-[#3F0D1B]/20 active:scale-[0.98]'
                : 'bg-[#D8CBB5]/40 text-[#521A27]/60 cursor-not-allowed border border-[#CDBFA7]'
            }`}
          >
            <ArrowFatLineDown size={16} weight="bold" />
            <span>Extract Max (Dispatch Top)</span>
          </button>

          <button
            onClick={handleRebuildHeap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#EDE4D6] text-[#3F0D1B] text-xs font-semibold border border-[#CDBFA7] transition-colors shadow-xs"
          >
            <ArrowFatLineUp size={16} className="text-[#3F0D1B]" />
            <span>Rebalance Heap</span>
          </button>
        </div>
      </div>

      {/* DAA Big-O Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-[#CDBFA7] bg-[#FAF6EE] font-mono text-xs shadow-xs">
          <span className="text-[10px] text-[#521A27] block">PEEK ROOT</span>
          <span className="text-sm font-bold text-[#3F0D1B]">O(1)</span>
          <span className="text-[10px] text-[#521A27]/80 block mt-0.5">Heap array index 0</span>
        </div>
        <div className="p-3 rounded-lg border border-[#CDBFA7] bg-[#FAF6EE] font-mono text-xs shadow-xs">
          <span className="text-[10px] text-[#521A27] block">EXTRACT MAX</span>
          <span className="text-sm font-bold text-[#8A1E35]">O(log K)</span>
          <span className="text-[10px] text-[#521A27]/80 block mt-0.5">Sift-down swap chain</span>
        </div>
        <div className="p-3 rounded-lg border border-[#CDBFA7] bg-[#FAF6EE] font-mono text-xs shadow-xs">
          <span className="text-[10px] text-[#521A27] block">INSERT INCIDENT</span>
          <span className="text-sm font-bold text-[#3F0D1B]">O(log K)</span>
          <span className="text-[10px] text-[#521A27]/80 block mt-0.5">Sift-up parent bubble</span>
        </div>
        <div className="p-3 rounded-lg border border-[#CDBFA7] bg-[#FAF6EE] font-mono text-xs shadow-xs">
          <span className="text-[10px] text-[#521A27] block">SPACE COMPLEXITY</span>
          <span className="text-sm font-bold text-[#3F0D1B]">O(K)</span>
          <span className="text-[10px] text-[#521A27]/80 block mt-0.5">Contiguous array buffer</span>
        </div>
      </div>

      {/* Live Log Banner */}
      <div className="p-3 rounded-lg border border-[#3F0D1B]/25 bg-[#FAF6EE] text-xs font-mono text-[#3F0D1B] flex items-center gap-2 shadow-xs">
        <Sparkle size={16} className="text-[#3F0D1B] shrink-0" />
        <span className="truncate">{lastActionLog}</span>
      </div>

      {/* Visual Binary Tree Representation */}
      <div className="p-5 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-[#CDBFA7] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
              Binary Tree Hierarchy
            </span>
            <span className="text-[10px] font-mono text-[#521A27]">
              Parent = floor((i-1)/2) | Left = 2i+1 | Right = 2i+2
            </span>
          </div>
          <span className="text-xs font-mono text-[#3F0D1B] font-bold">
            {heapArray.length} Incidents in Heap
          </span>
        </div>

        {heapArray.length === 0 ? (
          <div className="p-8 text-center text-[#521A27] text-xs font-mono">
            Heap is empty. All incidents have been dispatched to response teams.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Level 0: Root */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-[#3F0D1B] font-bold mb-1">LEVEL 0 (ROOT / MAX PRIORITY)</span>
              {heapArray[0] && (
                <div
                  onClick={() => onSelectNode(heapArray[0].incident.targetNodeId)}
                  className="cursor-pointer max-w-sm w-full p-3.5 rounded-xl bg-[#EDE4D6] border-2 border-[#3F0D1B] shadow-md shadow-[#3F0D1B]/15 text-center hover:border-[#5C1D2D] transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#3F0D1B] font-bold mb-1">
                    <span>Index [0]</span>
                    <span className="text-xs text-[#3F0D1B]">Score: {heapArray[0].score}</span>
                  </div>
                  <h3 className="font-bold text-[#3F0D1B] text-xs truncate">{heapArray[0].incident.title}</h3>
                  <p className="text-[11px] font-mono text-[#521A27] mt-0.5">{heapArray[0].nodeName} (CVSS: {heapArray[0].incident.cvss})</p>
                </div>
              )}
            </div>

            {/* Level 1: Left and Right Children */}
            {heapArray.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Left: Index 1 */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-[#521A27] mb-1">Left Child (Index 1)</span>
                  <div
                    onClick={() => onSelectNode(heapArray[1].incident.targetNodeId)}
                    className="cursor-pointer w-full p-3 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] text-center hover:border-[#3F0D1B] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#521A27] mb-0.5">
                      <span>Index [1]</span>
                      <span className="text-[#3F0D1B] font-bold">Score: {heapArray[1].score}</span>
                    </div>
                    <h3 className="font-bold text-[#3F0D1B] text-xs truncate">{heapArray[1].incident.title}</h3>
                    <p className="text-[11px] font-mono text-[#521A27]">{heapArray[1].nodeName}</p>
                  </div>
                </div>

                {/* Right: Index 2 */}
                {heapArray[2] && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-[#521A27] mb-1">Right Child (Index 2)</span>
                    <div
                      onClick={() => onSelectNode(heapArray[2].incident.targetNodeId)}
                      className="cursor-pointer w-full p-3 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] text-center hover:border-[#3F0D1B] transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#521A27] mb-0.5">
                        <span>Index [2]</span>
                        <span className="text-[#3F0D1B] font-bold">Score: {heapArray[2].score}</span>
                      </div>
                      <h3 className="font-bold text-[#3F0D1B] text-xs truncate">{heapArray[2].incident.title}</h3>
                      <p className="text-[11px] font-mono text-[#521A27]">{heapArray[2].nodeName}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Level 2: Grandchildren (Indices 3..6) */}
            {heapArray.length > 3 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto pt-2">
                {[3, 4, 5, 6].map((idx) => {
                  const item = heapArray[idx];
                  if (!item) return null;
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectNode(item.incident.targetNodeId)}
                      className="cursor-pointer p-2.5 rounded bg-[#EDE4D6] border border-[#CDBFA7] hover:border-[#3F0D1B] text-center text-[11px] transition-colors"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#521A27]">
                        <span>[{idx}]</span>
                        <span className="text-[#3F0D1B] font-semibold">{item.score}</span>
                      </div>
                      <span className="font-bold text-[#3F0D1B] block truncate text-[11px] mt-0.5">{item.nodeName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contiguous Array Buffer Representation */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] space-y-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListNumbers size={18} className="text-[#3F0D1B]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
              Contiguous Array Memory Layout [0 .. K-1]
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#521A27]">Zero-indexed Flattened Heap</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {heapArray.map((item, index) => (
            <div
              key={item.incident.id + index}
              onClick={() => onSelectNode(item.incident.targetNodeId)}
              className={`shrink-0 cursor-pointer p-2.5 rounded-lg border text-center font-mono text-xs min-w-[120px] transition-all ${
                index === 0
                  ? 'bg-[#EDE4D6] border-2 border-[#3F0D1B] text-[#3F0D1B] font-bold shadow-md shadow-[#3F0D1B]/15'
                  : 'bg-[#FAF6EE] border border-[#CDBFA7] text-[#521A27] hover:border-[#3F0D1B]'
              }`}
            >
              <div className="text-[10px] text-[#521A27] mb-1">Index [{index}]</div>
              <div className="font-bold text-[#3F0D1B] text-xs truncate max-w-[110px]">{item.nodeName}</div>
              <div className="text-[#3F0D1B] font-bold text-xs mt-1">Score: {item.score}</div>
              <div className="text-[9px] text-[#521A27]/80 mt-1">CVSS {item.incident.cvss}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Criteria Scoring Formula Inspector */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] space-y-3 shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <Info size={17} className="text-[#3F0D1B]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
            Explicit Priority Criteria Formulation
          </h3>
        </div>

        <div className="p-3 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] font-mono text-xs text-[#3F0D1B] font-semibold leading-relaxed overflow-x-auto">
          Score = (CVSS × 3.5) + (Host Criticality × 3.0) + (Cascading Impact × 4.0) + (SLA Decay × 2.0)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#521A27]">
          <div className="space-y-1.5 p-3 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7]">
            <span className="font-bold text-[#3F0D1B] block">1. Vulnerability & Threat Severity (CVSS)</span>
            <p className="text-[#521A27] text-[11px] leading-relaxed">
              Normalized exploitability and blast potential from 0.0 to 10.0. A Zero-Day Remote Code Execution vulnerability scores higher than credential spray.
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7]">
            <span className="font-bold text-[#3F0D1B] block">2. Cascading Dependency Multiplier</span>
            <p className="text-[#521A27] text-[11px] leading-relaxed">
              Direct and indirect downstream services relying on this host. Compromise of an Identity SSO or Ledger DB carries a 4x multiplier to prevent blackout.
            </p>
          </div>
        </div>
      </div>

      {/* Dispatched Incidents Audit History */}
      {extractedHistory.length > 0 && (
        <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] space-y-3 shadow-xs transition-colors">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
            Dispatched Incident Sequence (Chronological Response Order)
          </h3>
          <div className="space-y-2">
            {extractedHistory.map((item, idx) => (
              <div
                key={item.incident.id + idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3F0D1B] border border-[#5C1D2D] text-[#FAF6EE] font-mono font-bold flex items-center justify-center text-[10px]">
                    #{extractedHistory.length - idx}
                  </span>
                  <div>
                    <span className="font-bold text-[#3F0D1B]">{item.incident.title}</span>
                    <span className="font-mono text-[#521A27] ml-2">({item.nodeName})</span>
                  </div>
                </div>
                <div className="font-mono text-[#3F0D1B] font-bold">
                  Score: {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
