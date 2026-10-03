import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import Lenis from 'lenis';
import {
  ShieldCheck,
  ShieldWarning,
  Sliders,
  TreeStructure,
  Path,
  ChartBar,
  FileText,
  Play,
  Pause,
  ArrowClockwise,
  CheckCircle,
  Warning,
  Eye,
  Lightning,
  Terminal,
  Sparkle
} from '@phosphor-icons/react';

import { SCENARIOS } from './data/scenarios';
import { SystemNode, SystemEdge, Incident, AlgorithmStep } from './types';
import { buildPriorityQueueTrace } from './algorithms/priorityQueue';
import { runKahnsTopologicalSort, runBFSBlastRadius } from './algorithms/graphTraversal';
import { runDijkstraContainmentPath } from './algorithms/shortestPath';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ScrollStorytelling } from './components/ScrollStorytelling';
import { InteractiveResponsePlanner, ThreatType } from './components/InteractiveResponsePlanner';
import { IncidentPlanner } from './components/IncidentPlanner';
import { ClosingSection } from './components/ClosingSection';
import { TopologyCanvas } from './components/TopologyCanvas';
import { AlgorithmStepper } from './components/AlgorithmStepper';
import { PriorityQueueVisualizer } from './components/PriorityQueueVisualizer';
import { DependencyMatrix } from './components/DependencyMatrix';
import { ContainmentRouter } from './components/ContainmentRouter';
import { BenchmarkView } from './components/BenchmarkView';
import { ScenarioBuilderModal } from './components/ScenarioBuilderModal';
import { AuditReportModal } from './components/AuditReportModal';
import { LegalModal, LegalTab } from './components/LegalModal';
import { Footer } from './components/Footer';

export default function App() {
  // View Mode: 'editorial' (Cinematic Story), 'planner' (Dedicated Functional Planner), or 'console' (Deep DAA Command Center)
  const [viewMode, setViewMode] = useState<'editorial' | 'planner' | 'console'>('editorial');

  // Scenario State
  const [currentScenarioId, setCurrentScenarioId] = useState<string>('scenario-fintech');
  const currentScenario = useMemo(
    () => SCENARIOS.find((s) => s.id === currentScenarioId) || SCENARIOS[0],
    [currentScenarioId]
  );

  const [nodes, setNodes] = useState<SystemNode[]>(currentScenario.nodes);
  const [edges, setEdges] = useState<SystemEdge[]>(currentScenario.edges);
  const [incidents, setIncidents] = useState<Incident[]>(currentScenario.incidents);

  // Re-sync when scenario changes
  useEffect(() => {
    setNodes(currentScenario.nodes);
    setEdges(currentScenario.edges);
    setIncidents(currentScenario.incidents);
    setSelectedNodeId(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [currentScenario]);

  // Console Active Tab State
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'heap' | 'topological' | 'routing' | 'benchmark'>('console');

  // Interactive Node Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Active path and cut edges for shortest path & blast radius
  const [activeRoutePath, setActiveRoutePath] = useState<string[]>([]);
  const [activeSeveredEdges, setActiveSeveredEdges] = useState<string[]>([]);

  // Simulation Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Modals
  const [isInjectModalOpen, setIsInjectModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; tab: LegalTab }>({
    isOpen: false,
    tab: 'privacy'
  });

  // Lenis Smooth Scroll Instance
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    } catch (e) {
      console.warn('Lenis initialization notice', e);
    }
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    if (viewMode !== 'editorial') {
      setViewMode('editorial');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          lenisRef.current?.scrollTo(el) || el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        lenisRef.current?.scrollTo(el) || el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Calculate Combined Algorithm Steps Trace
  const allSimulationSteps: AlgorithmStep[] = useMemo(() => {
    // 1. Priority Queue Steps
    const pqTrace = buildPriorityQueueTrace(incidents, nodes, edges);
    // 2. Kahn's Topological Sort Steps
    const kahnTrace = runKahnsTopologicalSort(nodes, edges);
    // 3. BFS Blast Radius Steps
    const compNodeIds = incidents.map((i) => i.targetNodeId);
    const bfsTrace = runBFSBlastRadius(compNodeIds.slice(0, 1), nodes, edges);
    // 4. Dijkstra Shortest Path Steps
    const dijkstraTrace =
      nodes.length >= 2 ? runDijkstraContainmentPath(nodes[0].id, nodes[nodes.length - 1].id, nodes, edges) : null;

    return [
      ...pqTrace.steps,
      ...kahnTrace.steps,
      ...bfsTrace.steps,
      ...(dijkstraTrace ? dijkstraTrace.steps : [])
    ];
  }, [nodes, edges, incidents]);

  // Active step in simulation
  const currentStep = allSimulationSteps[currentStepIndex] || allSimulationSteps[0];

  // Playback timer
  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= allSimulationSteps.length - 1) {
            setIsPlaying(false);
            // Trigger celebration confetti on containment completion
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#3F0D1B', '#D8CBB5', '#FAF6EE']
            });
            return prev;
          }
          return prev + 1;
        });
      }, 1400 / playbackSpeed);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, playbackSpeed, allSimulationSteps.length]);

  // Handle adding custom incident
  const handleAddIncident = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    // Mark target node as compromised
    setNodes((prev) =>
      prev.map((n) => (n.id === newIncident.targetNodeId ? { ...n, status: 'compromised' } : n))
    );
    setSelectedNodeId(newIncident.targetNodeId);
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setNodes(currentScenario.nodes);
    setActiveRoutePath([]);
    setActiveSeveredEdges([]);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#3F0D1B] text-[#D8CBB5] selection:bg-[#D8CBB5]/30 selection:text-[#FAF6EE]">
      {/* Top Minimal Luxury Navigation */}
      <Navbar
        currentScenarioId={currentScenarioId}
        onSelectScenario={(id) => setCurrentScenarioId(id)}
        viewMode={viewMode}
        onToggleViewMode={(mode) => setViewMode(mode)}
        activeConsoleTab={activeConsoleTab}
        onSelectConsoleTab={(tab) => setActiveConsoleTab(tab)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenInjectModal={() => setIsInjectModalOpen(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* VIEW MODE 1: EDITORIAL CINEMATIC NARRATIVE */}
      {viewMode === 'editorial' ? (
        <div className="flex-1 flex flex-col">
          {/* Section 2: Homepage Hero with 3D Cybersecurity Architecture Canvas */}
          <div id="hero">
            <HeroSection
              onExplorePlatform={() => handleScrollToSection('lifecycle-narrative')}
              onBuildResponsePlan={() => setViewMode('planner')}
              onOpenConsole={() => setViewMode('console')}
              incidentCount={incidents.length}
            />
          </div>

          {/* Section 3: Cinematic Scroll Storytelling (01 Detect to 05 Recover on Aged Ivory Surface) */}
          <ScrollStorytelling />

          {/* Section 4: Interactive Response Planner (Plan for the Unexpected on Aged Ivory Surface) */}
          <InteractiveResponsePlanner
            onSimulateInConsole={(threatType: ThreatType) => {
              setViewMode('console');
            }}
            onOpenPlanner={() => setViewMode('planner')}
          />

          {/* Section 7: Deliberate Deep Burgundy Closing Section */}
          <ClosingSection
            onBuildResponsePlan={() => setViewMode('planner')}
            onOpenConsole={() => setViewMode('console')}
          />
        </div>
      ) : viewMode === 'planner' ? (
        /* VIEW MODE 2: DEDICATED FUNCTIONAL INCIDENT RESPONSE PLANNER */
        <IncidentPlanner
          onBackToEditorial={() => setViewMode('editorial')}
          onOpenConsole={() => setViewMode('console')}
        />
      ) : (
        /* VIEW MODE 3: DAA ALGORITHMIC COMMAND CENTER (Problem 92 Core Algorithms on Aged Ivory) */
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6 bg-[#EDE4D6] text-[#3F0D1B] rounded-3xl my-6 border border-[#CDBFA7] shadow-xl">
          {/* Workflow Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CDBFA7] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#3F0D1B] font-bold uppercase tracking-wider">
                  DAA ENGINE CONSOLE
                </span>
                <span className="text-[#CDBFA7]">/</span>
                <h2 className="text-lg font-bold text-[#3F0D1B] capitalize">
                  {activeConsoleTab === 'console'
                    ? 'Interactive Topology & Response Console'
                    : activeConsoleTab === 'heap'
                    ? 'Priority Queue Binary Max-Heap Inspector'
                    : activeConsoleTab === 'topological'
                    ? 'System Dependency DAG & Kahn Traversal'
                    : activeConsoleTab === 'routing'
                    ? 'Shortest Path Containment Router'
                    : 'DAA Comparative Benchmark Matrix'}
                </h2>
              </div>
              <p className="text-xs text-[#521A27] mt-1">
                {currentScenario.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#521A27]">Threat Actor:</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#3F0D1B]/10 border border-[#3F0D1B]/30 text-[#3F0D1B] text-xs font-mono font-semibold">
                {currentScenario.threatActor}
              </span>
              <button
                onClick={() => setViewMode('editorial')}
                className="px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#E2D5C0] text-[#3F0D1B] text-xs font-mono font-semibold transition-colors border border-[#CDBFA7] cursor-pointer"
              >
                Back to Story
              </button>
            </div>
          </div>

          {/* Console Tab 1: Interactive Console (Topology Canvas + Stepper + Details) */}
          {activeConsoleTab === 'console' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Interactive Topology Canvas & Stepper */}
                <div className="lg:col-span-8 space-y-4">
                  <TopologyCanvas
                    nodes={nodes}
                    edges={edges}
                    incidents={incidents}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={(id) => setSelectedNodeId(id)}
                    activePathNodeIds={currentStep?.optimalRoute || activeRoutePath}
                    severedEdgeIds={currentStep?.severedEdgeIds || activeSeveredEdges}
                    highlightedNodeIds={currentStep?.activeNodeIds || []}
                    frontierNodeIds={currentStep?.frontierNodeIds || []}
                  />

                  {/* Unified Algorithm Stepper */}
                  <AlgorithmStepper
                    steps={allSimulationSteps}
                    currentStepIndex={currentStepIndex}
                    onStepChange={(idx) => setCurrentStepIndex(idx)}
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    playbackSpeed={playbackSpeed}
                    onChangeSpeed={(spd) => setPlaybackSpeed(spd)}
                  />
                </div>

                {/* Right Column: Live Telemetry, Priority Score Card, & Fast Actions */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Active Incident Pool Card */}
                  <div className="p-4 rounded-2xl border border-[#CDBFA7] bg-[#FAF6EE] space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#CDBFA7] pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldWarning size={18} className="text-[#3F0D1B]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
                          Active Incident Pool ({incidents.length})
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsInjectModalOpen(true)}
                        className="text-[11px] font-semibold text-[#3F0D1B] hover:text-[#521A27] transition-colors cursor-pointer"
                      >
                        + Inject
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {incidents.map((inc) => {
                        const hostNode = nodes.find((n) => n.id === inc.targetNodeId);
                        const isSelected = selectedNodeId === inc.targetNodeId;
                        return (
                          <div
                            key={inc.id}
                            onClick={() => setSelectedNodeId(inc.targetNodeId)}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#EDE4D6] border-[#3F0D1B] shadow-xs'
                                : 'bg-[#EDE4D6]/70 border-[#CDBFA7] hover:border-[#3F0D1B]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                              <span className="text-[#8A1E35] font-bold">{inc.severity}</span>
                              <span className="text-[#521A27]">CVSS {inc.cvss}</span>
                            </div>
                            <h4 className="font-bold text-[#3F0D1B] text-xs leading-snug">{inc.title}</h4>
                            <div className="flex items-center justify-between font-mono text-[10px] text-[#521A27] mt-1.5">
                              <span>Host: {hostNode?.name || inc.targetNodeId}</span>
                              <span>SLA: {inc.slaLimitMinutes}m</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DAA Decision Engine Status */}
                  <div className="p-4 rounded-2xl border border-[#CDBFA7] bg-[#FAF6EE] space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-[#CDBFA7] pb-2">
                      <Lightning size={18} className="text-[#3F0D1B]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#3F0D1B]">
                        Algorithmic Containment State
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7]">
                        <span className="text-[#521A27]">Priority Queue:</span>
                        <span className="text-[#3F0D1B] font-bold">Max-Heap Root Synchronized</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7]">
                        <span className="text-[#521A27]">Dependency Order:</span>
                        <span className="text-[#3F0D1B] font-bold">Topological Drain Active</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-[#EDE4D6] border border-[#CDBFA7]">
                        <span className="text-[#521A27]">Containment Routing:</span>
                        <span className="text-[#3F0D1B] font-bold">Dijkstra Min-Disruption Cut</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#3F0D1B] hover:bg-[#4C1222] text-[#FAF6EE] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <FileText size={15} className="text-[#D8CBB5]" />
                        <span>Generate Incident Playbook</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-World Guidance Note */}
                  <div className="p-3.5 rounded-2xl border border-[#CDBFA7] bg-[#FAF6EE] text-xs text-[#521A27] space-y-1 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[#3F0D1B] font-semibold text-[11px]">
                      <ShieldCheck size={14} className="text-[#3F0D1B]" />
                      <span>NIST SP 800-61 / CERT-In Aligned</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#521A27]">
                      Containment decisions balance operational disruption costs against lateral malware propagation. Top priority queue items trigger graceful failovers before physical network unplugs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Console Tab 2: Priority Queue Heap Inspector */}
          {activeConsoleTab === 'heap' && (
            <PriorityQueueVisualizer
              incidents={incidents}
              nodes={nodes}
              edges={edges}
              onSelectNode={(nodeId) => {
                setSelectedNodeId(nodeId);
                setActiveConsoleTab('console');
              }}
            />
          )}

          {/* Console Tab 3: System Dependency DAG & Kahn Traversal */}
          {activeConsoleTab === 'topological' && (
            <DependencyMatrix
              nodes={nodes}
              edges={edges}
              onSelectNode={(nodeId) => {
                setSelectedNodeId(nodeId);
                setActiveConsoleTab('console');
              }}
            />
          )}

          {/* Console Tab 4: Containment Route Planner */}
          {activeConsoleTab === 'routing' && (
            <ContainmentRouter
              nodes={nodes}
              edges={edges}
              onSelectNode={(nodeId) => {
                setSelectedNodeId(nodeId);
                setActiveConsoleTab('console');
              }}
              onSetRoutePath={(path, cuts) => {
                setActiveRoutePath(path);
                setActiveSeveredEdges(cuts);
                setActiveConsoleTab('console');
              }}
            />
          )}

          {/* Console Tab 5: Benchmark Matrix */}
          {activeConsoleTab === 'benchmark' && (
            <BenchmarkView
              nodes={nodes}
              edges={edges}
              incidents={incidents}
            />
          )}
        </main>
      )}

      {/* Architectural Luxury Footer */}
      <Footer
        onOpenLegal={(tab) => setLegalModalState({ isOpen: true, tab })}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Scenario Builder Modal */}
      <ScenarioBuilderModal
        isOpen={isInjectModalOpen}
        onClose={() => setIsInjectModalOpen(false)}
        nodes={nodes}
        onAddIncident={handleAddIncident}
      />

      {/* Audit Report Modal */}
      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        scenario={currentScenario}
        nodes={nodes}
        edges={edges}
        incidents={incidents}
      />

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
        initialTab={legalModalState.tab}
      />
    </div>
  );
}
