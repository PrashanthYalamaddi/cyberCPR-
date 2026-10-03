import React, { useState, useEffect } from 'react';
import {
  Broadcast,
  MagnifyingGlass,
  ShieldCheck,
  ShieldWarning,
  ArrowsSplit,
  ArrowsCounterClockwise,
  CheckCircle,
  Pulse,
  Circuitry,
  Terminal,
  Crosshair,
  LockKey,
  Database,
  Lightning
} from '@phosphor-icons/react';

interface StoryPhase {
  number: string;
  badge: string;
  heading: string;
  subheading: string;
  narrative: string;
  daaPrinciple: string;
  keyMetrics: { label: string; value: string }[];
}

const PHASES: StoryPhase[] = [
  {
    number: '01',
    badge: 'PHASE 01 : DETECT',
    heading: 'Every Threat Leaves a Signal.',
    subheading: 'Heuristic anomaly detection and priority queue ingestion.',
    narrative:
      'In high-throughput environments, cyber adversaries attempt to blend malicious executions into background operational noise. Our detection engine ingests network telemetry, endpoint logs, and honeypot signals into an explicit Binary Max-Heap priority queue, ordering critical threats before SLA decay begins.',
    daaPrinciple: 'Priority Queue (Binary Max-Heap) with composite CVSS, SLA, and criticality scoring.',
    keyMetrics: [
      { label: 'Ingestion Latency', value: '< 2.4 ms' },
      { label: 'Queue Time-Complexity', value: 'O(log N)' },
      { label: 'Confidence Threshold', value: '99.4%' }
    ]
  },
  {
    number: '02',
    badge: 'PHASE 02 : INVESTIGATE',
    heading: 'Clarity Before Action.',
    subheading: 'System dependency DAG expansion and lateral movement blast radius.',
    narrative:
      'Blindly severing cables causes catastrophic operational collateral. By modeling interconnected enterprise systems as a Directed Acyclic Graph (DAG), Kahn Topological Sort and Breadth-First Search (BFS) traverse downstream dependencies to unveil root causes, impacted database clusters, and blast radii in real time.',
    daaPrinciple: 'Kahn Algorithm DAG Traversal & Breadth-First Search (BFS) blast radius mapping.',
    keyMetrics: [
      { label: 'Graph Verification', value: 'O(V + E)' },
      { label: 'Dependency Depth', value: '4 Tiers' },
      { label: 'Collateral Avoidance', value: '100% Zero-Loop' }
    ]
  },
  {
    number: '03',
    badge: 'PHASE 03 : CONTAIN',
    heading: 'Stop the Spread.',
    subheading: 'Minimal-disruption cut set and Dijkstra shortest containment route.',
    narrative:
      'Containment requires surgical precision. Using weighted shortest path algorithms (Dijkstra and A*), CyberCPR computes the exact minimum-weight network edges to sever, quarantining compromised assets behind fortified burgundy defense perimeters while preserving vital revenue pipelines.',
    daaPrinciple: 'Dijkstra and A* Shortest Path Isolation Route with Min-Disruption Cut Set.',
    keyMetrics: [
      { label: 'Containment Speed', value: '12.8 sec' },
      { label: 'Path Complexity', value: 'O(E log V)' },
      { label: 'Operational Uptime', value: '96.2%' }
    ]
  },
  {
    number: '04',
    badge: 'PHASE 04 : ERADICATE',
    heading: 'Remove the Threat.',
    subheading: 'Controlled threat dissolution and memory footprint sanitization.',
    narrative:
      'Once isolated, rootkits, persistent implants, and compromised access tokens are systematically neutralized. Memory-resident artifacts dissolve under automated cryptographic scrubbing, ensuring lateral re-infection is mathematically impossible before systems are authorized for reboot.',
    daaPrinciple: 'Cryptographic Checksum Verification & Max-Heap Task Dequeue Execution.',
    keyMetrics: [
      { label: 'Threat Dissolution', value: '100%' },
      { label: 'Hash Validation', value: 'SHA-384' },
      { label: 'Persistence Removal', value: 'Zero Backdoor' }
    ]
  },
  {
    number: '05',
    badge: 'PHASE 05 : RECOVER',
    heading: 'Restore What Matters.',
    subheading: 'Topological service boot sequence and telemetry normalization.',
    narrative:
      'Recovery follows the reverse topological ordering discovered during graph analysis. Critical authentication services boot first, followed by data layers and user gateways. Interconnecting conduits illuminate in harmonious ivory pulses as full enterprise stability is restored.',
    daaPrinciple: 'Reverse Kahn Topological Sequential Bootstrapping with Zero-Trust Re-handshake.',
    keyMetrics: [
      { label: 'Restoration Order', value: 'Topological' },
      { label: 'MTTR Velocity', value: '14.2 min' },
      { label: 'Post-Audit State', value: 'Verified Nominal' }
    ]
  }
];

export const ScrollStorytelling: React.FC = () => {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number>(0);
  const [pulseTick, setPulseTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="lifecycle-narrative" className="w-full bg-[#EDE4D6] text-[#3F0D1B] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#CDBFA7]">
      <div className="max-w-[1400px] w-full mx-auto space-y-20">
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#CDBFA7] text-[#3F0D1B]">
            <span className="w-2 h-2 rounded-full bg-[#3F0D1B]" />
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-[#3F0D1B]">
              The Incident Response Lifecycle
            </span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#3F0D1B] leading-tight">
            Cinematic Incident Governance.
          </h2>

          <p className="text-base sm:text-lg text-[#521A27] leading-relaxed">
            From initial perimeter anomaly to verified system reconstitution: five orchestrated phases governed by provable graph algorithms and priority queues.
          </p>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#CDBFA7]">
          {PHASES.map((p, idx) => (
            <button
              key={p.number}
              onClick={() => setActiveStoryIdx(idx)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeStoryIdx === idx
                  ? 'bg-[#3F0D1B] text-[#FAF6EE] shadow-sm font-bold'
                  : 'bg-[#FAF6EE] text-[#521A27] hover:bg-[#E2D5C0] hover:text-[#3F0D1B] border border-[#CDBFA7]'
              }`}
            >
              <span className={activeStoryIdx === idx ? 'text-[#D8CBB5]' : 'text-[#3F0D1B]'}>
                {p.number}
              </span>
              <span>{p.badge.split(' : ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Detailed Storytelling Cards (Interactive Spotlight) */}
        <div className="space-y-16">
          {PHASES.map((phase, idx) => {
            const isSelected = activeStoryIdx === idx;
            return (
              <div
                key={phase.number}
                className={`p-8 sm:p-12 rounded-3xl border transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#FAF6EE] border-[#3F0D1B]/50 shadow-md ring-1 ring-[#3F0D1B]/30'
                    : 'bg-[#FAF6EE]/75 border-[#CDBFA7] hover:border-[#3F0D1B]/40'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  {/* Left Column: Editorial Description on Aged Ivory */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="font-editorial text-5xl sm:text-6xl font-black text-[#3F0D1B] leading-none">
                        {phase.number}
                      </span>
                      <div className="h-8 w-px bg-[#CDBFA7]" />
                      <span className="font-mono text-xs font-bold text-[#3F0D1B] tracking-wider uppercase">
                        {phase.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-[#3F0D1B] leading-snug">
                        {phase.heading}
                      </h3>
                      <p className="text-sm font-semibold text-[#521A27]">
                        {phase.subheading}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base text-[#340A16] leading-relaxed">
                      {phase.narrative}
                    </p>

                    {/* DAA Algorithmic Grounding */}
                    <div className="p-3.5 rounded-xl bg-[#EDE4D6] border border-[#CDBFA7] flex items-start gap-3">
                      <Terminal size={18} className="text-[#3F0D1B] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-mono font-bold text-[#3F0D1B]">DAA Principle: </span>
                        <span className="text-[#521A27]">{phase.daaPrinciple}</span>
                      </div>
                    </div>

                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      {phase.keyMetrics.map((metric, mIdx) => (
                        <div key={mIdx} className="p-3 rounded-xl bg-[#EDE4D6] border border-[#CDBFA7]">
                          <div className="font-mono text-base sm:text-lg font-bold text-[#3F0D1B]">
                            {metric.value}
                          </div>
                          <div className="text-[11px] font-mono text-[#521A27] mt-0.5">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Custom Interactive Phase Animation Visual */}
                  <div className="lg:col-span-6">
                    <PhaseVisualizer phaseNumber={phase.number} pulseTick={pulseTick} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Specialized Visualizer Sub-component for each of the 5 phases
interface PhaseVisualizerProps {
  phaseNumber: string;
  pulseTick: number;
}

const PhaseVisualizer: React.FC<PhaseVisualizerProps> = ({ phaseNumber, pulseTick }) => {
  return (
    <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl bg-[#EDE4D6] border border-[#CDBFA7] p-5 flex flex-col justify-between overflow-hidden shadow-inner">
      {/* Background Architectural Grid */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#3F0D1B 1px, transparent 1px), linear-gradient(90deg, #3F0D1B 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#521A27] border-b border-[#CDBFA7] pb-2">
        <span className="font-bold text-[#3F0D1B]">PHASE {phaseNumber} TELEMETRY</span>
        <span className="flex items-center gap-1.5 text-[#3F0D1B] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#3F0D1B] animate-ping" />
          ACTIVE STREAM
        </span>
      </div>

      {/* Visual Content based on phase */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        {phaseNumber === '01' && (
          /* 01 DETECT: Burgundy network + glowing ivory beacon + radar reticle */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Radar Circle */}
            <div className="absolute w-44 h-44 rounded-full border border-[#3F0D1B]/40 animate-[spin_8s_linear_infinite]" />
            <div className="absolute w-28 h-28 rounded-full border border-[#3F0D1B]/25" />
            
            {/* Center Node */}
            <div className="w-12 h-12 rounded-xl bg-[#3F0D1B] border-2 border-[#D8CBB5] flex items-center justify-center shadow-md z-10">
              <Broadcast size={22} className="text-[#FAF6EE]" />
            </div>

            {/* Suspicious Beacon Alert */}
            <div className="absolute top-10 left-16 px-2.5 py-1 rounded bg-[#3F0D1B] text-[#FAF6EE] text-[10px] font-mono font-bold animate-bounce shadow-sm">
              ! Suspicious Beacon [192.168.1.104]
            </div>

            <div className="absolute bottom-12 right-20 flex items-center gap-2 p-2 rounded-lg bg-[#FAF6EE] border border-[#CDBFA7] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#3F0D1B]" />
              <span className="text-[#3F0D1B] font-bold">Priority: Max-Heap Root [Score: 94.2]</span>
            </div>
          </div>
        )}

        {phaseNumber === '02' && (
          /* 02 INVESTIGATE: Dependency DAG graph + blast radius tiers */
          <div className="w-full flex flex-col justify-center items-center gap-4">
            <div className="flex items-center justify-center gap-6">
              <div className="p-3 rounded-xl bg-[#3F0D1B] text-[#FAF6EE] text-xs font-mono border border-[#CDBFA7] text-center shadow-xs">
                <Database size={18} className="mx-auto text-[#D8CBB5] mb-1" />
                Auth Vault
              </div>
              <div className="w-10 h-0.5 bg-[#3F0D1B] relative">
                <span className="absolute -top-1.5 right-0 text-[10px] text-[#3F0D1B]">▶</span>
              </div>
              <div className="p-3 rounded-xl bg-[#732238] text-[#FAF6EE] text-xs font-mono font-bold text-center shadow-md animate-pulse">
                <ShieldWarning size={18} className="mx-auto mb-1 text-[#FAF6EE]" />
                Affected Gateway
              </div>
              <div className="w-10 h-0.5 bg-[#3F0D1B] relative">
                <span className="absolute -top-1.5 right-0 text-[10px] text-[#3F0D1B]">▶</span>
              </div>
              <div className="p-3 rounded-xl bg-[#3F0D1B] text-[#FAF6EE] text-xs font-mono border border-[#CDBFA7] text-center shadow-xs">
                <Circuitry size={18} className="mx-auto text-[#D8CBB5] mb-1" />
                Ledger DB
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-[#FAF6EE] border border-[#CDBFA7] text-xs font-mono text-[#3F0D1B] flex items-center gap-2">
              <span className="font-bold text-[#3F0D1B]">Kahn In-Degree:</span>
              <span>All 3 tiers mapped; zero cycle deadlock.</span>
            </div>
          </div>
        )}

        {phaseNumber === '03' && (
          /* 03 CONTAIN: Burgundy security barriers forming + severed edges */
          <div className="relative w-full flex flex-col items-center justify-center gap-4">
            <div className="relative p-6 rounded-2xl bg-[#3F0D1B] border-2 border-[#D8CBB5] text-[#FAF6EE] text-center shadow-xl max-w-xs">
              <LockKey size={28} className="mx-auto text-[#D8CBB5] mb-2" />
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF6EE]">
                BURGUNDY DEFENSE BARRIER
              </div>
              <div className="text-[11px] text-[#D8CBB5] mt-1">
                Edge 01 & 04 severed. Quarantine active.
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-[#521A27]">
              <span className="px-2 py-0.5 rounded bg-[#3F0D1B] text-[#FAF6EE]">Dijkstra Min-Cut</span>
              <span className="font-semibold text-[#3F0D1B]">Operational routes intact: 96.2%</span>
            </div>
          </div>
        )}

        {phaseNumber === '04' && (
          /* 04 ERADICATE: Threat footprint dissolution */
          <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#3F0D1B] font-bold">Threat Footprint Dissolution</span>
              <span className="text-[#3F0D1B] font-bold">100% Complete</span>
            </div>

            {/* Progress bar in Deep Burgundy & Ivory */}
            <div className="w-full h-2.5 rounded-full bg-[#CDBFA7] overflow-hidden">
              <div className="w-full h-full bg-[#3F0D1B] rounded-full" />
            </div>

            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#CDBFA7] space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#521A27]">Memory Implants:</span>
                <span className="text-[#3F0D1B] font-bold">Purged</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#521A27]">Credential Revocation:</span>
                <span className="text-[#3F0D1B] font-bold">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#521A27]">Cryptographic Hash:</span>
                <span className="text-[#3F0D1B] font-bold">Pristine Checksum</span>
              </div>
            </div>
          </div>
        )}

        {phaseNumber === '05' && (
          /* 05 RECOVER: Full digital architecture reconnecting */
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-[#3F0D1B] border-2 border-[#D8CBB5] flex items-center justify-center shadow-lg">
              <CheckCircle size={28} className="text-[#FAF6EE]" />
            </div>

            <div className="space-y-1">
              <h4 className="font-editorial text-lg font-bold text-[#3F0D1B]">
                System Equilibrium Restored
              </h4>
              <p className="text-xs font-mono text-[#521A27]">
                Reverse Kahn sequence executed. Latency normalized.
              </p>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#CDBFA7] text-[#3F0D1B] text-[11px] font-mono font-semibold">
              Telemetry Heartbeat: 100% Operational
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#521A27] border-t border-[#CDBFA7] pt-2">
        <span>State: Synchronized</span>
        <span>Standard: NIST SP 800-61 Rev 2</span>
      </div>
    </div>
  );
};
