import React, { useState } from 'react';
import {
  Sliders,
  WarningOctagon,
  CheckCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu
} from '@phosphor-icons/react';
import { SystemNode, SystemEdge } from '../types';
import { runKahnsTopologicalSort, runDFSCycleDetector } from '../algorithms/graphTraversal';

interface DependencyMatrixProps {
  nodes: SystemNode[];
  edges: SystemEdge[];
  onSelectNode: (nodeId: string) => void;
}

export const DependencyMatrix: React.FC<DependencyMatrixProps> = ({
  nodes,
  edges,
  onSelectNode
}) => {
  const [stepIndex, setStepIndex] = useState<number>(0);

  const kahnResult = runKahnsTopologicalSort(nodes, edges);
  const cycleResult = runDFSCycleDetector(nodes, edges);
  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));

  const currentStep = kahnResult.steps[stepIndex] || kahnResult.steps[0];

  const handleNextStep = () => {
    if (stepIndex < kahnResult.steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-[#3F0D1B]" />
            <h2 className="text-base font-bold text-[#3F0D1B] tracking-tight">
              System Dependency DAG & Kahn's Topological Containment Sequencer
            </h2>
          </div>
          <p className="text-xs text-[#521A27] mt-1">
            Solves containment order: Isolates downstream dependent nodes before severing parent services to prevent cascading system crashes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevStep}
            disabled={stepIndex === 0}
            className="px-3 py-1.5 rounded-lg bg-[#EDE4D6] hover:bg-[#D8CBB5] text-[#3F0D1B] disabled:opacity-40 text-xs font-semibold border border-[#CDBFA7] transition-colors shadow-xs"
          >
            Previous
          </button>
          <span className="font-mono text-xs text-[#3F0D1B] font-bold px-2">
            Step {stepIndex + 1} / {kahnResult.steps.length}
          </span>
          <button
            onClick={handleNextStep}
            disabled={stepIndex === kahnResult.steps.length - 1}
            className="px-3.5 py-1.5 rounded-lg bg-[#3F0D1B] hover:bg-[#5C1D2D] disabled:opacity-40 text-[#FAF6EE] text-xs font-bold shadow-md shadow-[#3F0D1B]/20 transition-all"
          >
            Next Step
          </button>
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg bg-[#EDE4D6] hover:bg-[#D8CBB5] text-[#521A27] hover:text-[#3F0D1B] text-xs border border-[#CDBFA7] transition-colors shadow-xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Cycle Detection Status Banner */}
      {cycleResult.hasCycle ? (
        <div className="p-3.5 rounded-xl border border-[#8A1E35] bg-[#FAF6EE] text-[#8A1E35] text-xs space-y-1 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#8A1E35]">
            <WarningOctagon size={18} />
            <span>CRITICAL ARCHITECTURAL DEADLOCK: CYCLIC DEPENDENCY DETECTED</span>
          </div>
          <p className="text-[#521A27]">
            DFS Cycle Detection identified mutual blocking dependencies: {cycleResult.cycleNames.join('; ')}.
            A circuit breaker policy must sever the weakest non-critical link to enable topological sequencing.
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl border border-[#3F0D1B]/30 bg-[#FAF6EE] text-[#3F0D1B] text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-[#3F0D1B]" />
            <span className="font-semibold text-[#3F0D1B]">Directed Acyclic Graph (DAG) Verified: No Circular Deadlocks</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-[#521A27]">Safe Order Achievable</span>
        </div>
      )}

      {/* Step Explanation Card */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] space-y-2 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#3F0D1B] uppercase tracking-wider">
            {currentStep.title}
          </span>
          <span className="text-[11px] font-mono text-[#521A27]">Complexity: O(V + E)</span>
        </div>
        <p className="text-xs text-[#3F0D1B] leading-relaxed font-mono">
          {currentStep.description}
        </p>
      </div>

      {/* In-Degree State Table */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] space-y-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-[#CDBFA7] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
              Dependency In-Degree Matrix
            </span>
            <span className="text-[10px] font-mono text-[#521A27]">
              In-Degree = Number of Unresolved Upstream Dependencies
            </span>
          </div>
          <span className="text-xs font-mono text-[#3F0D1B] font-bold">
            {kahnResult.order.length} Nodes Resolved
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {nodes.map(node => {
            const inDeg = currentStep.inDegreeTable ? currentStep.inDegreeTable[node.id] : 0;
            const isZero = inDeg === 0;
            const isProcessed = currentStep.visitedNodeIds?.includes(node.id);
            const isActive = currentStep.activeNodeIds?.includes(node.id);

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`cursor-pointer p-3 rounded-lg border text-xs transition-all ${
                  isActive
                    ? 'bg-[#EDE4D6] border-2 border-[#3F0D1B] shadow-md shadow-[#3F0D1B]/15'
                    : isProcessed
                    ? 'bg-[#D8CBB5]/40 border border-[#CDBFA7] opacity-60'
                    : isZero
                    ? 'bg-[#EDE4D6] border border-[#3F0D1B]/40'
                    : 'bg-[#FAF6EE] border border-[#CDBFA7] hover:border-[#3F0D1B]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                  <span className="text-[#521A27]">{node.ip}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    isZero ? 'bg-[#EDE4D6] text-[#3F0D1B] border border-[#CDBFA7]' : 'bg-[#FAF6EE] text-[#521A27] border border-[#CDBFA7]'
                  }`}>
                    deg: {inDeg}
                  </span>
                </div>
                <h4 className="font-bold text-[#3F0D1B] text-xs truncate">{node.name}</h4>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#521A27] mt-1">
                  <span>Crit: {node.criticality}/10</span>
                  <span className={isProcessed ? 'text-[#521A27] font-semibold' : isZero ? 'text-[#3F0D1B] font-bold' : 'text-[#521A27]'}>
                    {isProcessed ? 'Isolated' : isZero ? 'Ready' : 'Blocked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Computed Topological Sequence Ribbon */}
      <div className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] space-y-3 shadow-xs transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
          Deterministic Containment Sequencing (Kahn's Output)
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {kahnResult.order.map((nodeId, idx) => {
            const node = nodeMap.get(nodeId);
            if (!node) return null;
            return (
              <React.Fragment key={nodeId}>
                <div
                  onClick={() => onSelectNode(node.id)}
                  className="shrink-0 cursor-pointer p-2.5 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] hover:border-[#3F0D1B] text-center font-mono min-w-[130px] transition-colors"
                >
                  <div className="text-[10px] text-[#3F0D1B] font-bold">Sequence #{idx + 1}</div>
                  <div className="font-bold text-[#3F0D1B] text-xs truncate mt-0.5">{node.name}</div>
                  <div className="text-[9px] text-[#521A27] mt-1">{node.subnet}</div>
                </div>
                {idx < kahnResult.order.length - 1 && (
                  <ArrowRight size={16} className="text-[#3F0D1B]/60 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
