import React, { useState } from 'react';
import {
  ChartBar,
  Trophy,
  CheckCircle,
  WarningCircle,
  Cpu,
  ArrowsClockwise,
  DownloadSimple
} from '@phosphor-icons/react';
import { SystemNode, SystemEdge, Incident, BenchmarkMetrics } from '../types';
import { runFullAlgorithmBenchmark } from '../algorithms/benchmark';

interface BenchmarkViewProps {
  nodes: SystemNode[];
  edges: SystemEdge[];
  incidents: Incident[];
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  nodes,
  edges,
  incidents
}) => {
  const [metrics, setMetrics] = useState<BenchmarkMetrics[]>(() =>
    runFullAlgorithmBenchmark(nodes, edges, incidents)
  );
  const [activeCategory, setActiveCategory] = useState<'All' | 'Priority Queue' | 'Graph Traversal' | 'Shortest Path'>('All');

  const handleReRun = () => {
    setMetrics(runFullAlgorithmBenchmark(nodes, edges, incidents));
  };

  const filteredMetrics =
    activeCategory === 'All'
      ? metrics
      : metrics.filter(m => m.category === activeCategory);

  const handleExportCSV = () => {
    const headers = "Algorithm,Category,Time Complexity,Space Complexity,Execution Time (ms),Disruption Cost,Cascading Prevented (%),SLA Adherence (%),Verdict\n";
    const rows = metrics.map(m =>
      `"${m.algorithmName}","${m.category}","${m.timeComplexity}","${m.spaceComplexity}",${m.executionTimeMs},${m.containmentCost},${m.cascadingDamagePrevented}%,${m.slaAdherenceRate}%,"${m.verdict}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybercpr_daa_benchmark_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <ChartBar size={20} className="text-[#3F0D1B]" />
            <h2 className="text-base font-bold text-[#3F0D1B] tracking-tight">
              DAA Comparative Trade-Off Benchmark Suite
            </h2>
          </div>
          <p className="text-xs text-[#521A27] mt-1">
            Empirical runtime profiling, time-space asymptotic complexity, and objective containment quality metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDE4D6] hover:bg-[#D8CBB5] text-[#3F0D1B] text-xs font-semibold border border-[#CDBFA7] transition-colors shadow-xs"
          >
            <ArrowsClockwise size={15} className="text-[#3F0D1B]" />
            <span>Re-Profile</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#3F0D1B] hover:bg-[#5C1D2D] text-[#FAF6EE] text-xs font-bold shadow-md shadow-[#3F0D1B]/20 transition-all"
          >
            <DownloadSimple size={15} weight="bold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['All', 'Priority Queue', 'Graph Traversal', 'Shortest Path'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-[#3F0D1B] text-[#FAF6EE] shadow-xs font-bold'
                : 'bg-[#FAF6EE] text-[#521A27] hover:text-[#3F0D1B] border border-[#CDBFA7]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Benchmark Results Cards / Table */}
      <div className="space-y-4">
        {filteredMetrics.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] hover:border-[#3F0D1B] transition-all space-y-3 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CDBFA7] pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  item.slaAdherenceRate > 90 ? 'bg-[#3F0D1B]' : 'bg-[#8A1E35]'
                }`} />
                <h3 className="font-bold text-[#3F0D1B] text-sm">{item.algorithmName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDE4D6] border border-[#CDBFA7] text-[#521A27]">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#521A27]">Runtime:</span>
                <span className="text-[#3F0D1B] font-bold">{item.executionTimeMs} ms</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-[#EDE4D6] border border-[#CDBFA7]">
                <span className="text-[10px] text-[#521A27] block">TIME COMPLEXITY</span>
                <span className="font-bold text-[#3F0D1B] text-xs">{item.timeComplexity}</span>
              </div>

              <div className="p-2.5 rounded bg-[#EDE4D6] border border-[#CDBFA7]">
                <span className="text-[10px] text-[#521A27] block">SPACE COMPLEXITY</span>
                <span className="font-bold text-[#521A27] text-xs">{item.spaceComplexity}</span>
              </div>

              <div className="p-2.5 rounded bg-[#EDE4D6] border border-[#CDBFA7]">
                <span className="text-[10px] text-[#521A27] block">DISRUPTION COST</span>
                <span className={`font-bold text-xs ${item.containmentCost < 50 ? 'text-[#3F0D1B]' : 'text-[#8A1E35]'}`}>
                  {item.containmentCost} pts
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#EDE4D6] border border-[#CDBFA7]">
                <span className="text-[10px] text-[#521A27] block">SLA ADHERENCE</span>
                <span className="font-bold text-[#3F0D1B] text-xs">{item.slaAdherenceRate}%</span>
              </div>
            </div>

            {/* Verdict Explanation */}
            <div className="p-3 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7] text-xs text-[#521A27] flex items-start gap-2">
              <Trophy size={16} className="text-[#3F0D1B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#3F0D1B] mr-1.5">Algorithmic Trade-off Analysis:</span>
                <span className="leading-relaxed">{item.verdict}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
