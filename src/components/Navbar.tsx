import React from 'react';
import {
  ShieldCheck,
  Compass,
  FileText,
  Sliders,
  Graph,
  TreeStructure,
  Path,
  ChartBar,
  Terminal,
  ArrowRight
} from '@phosphor-icons/react';
import { SCENARIOS } from '../data/scenarios';

interface NavbarProps {
  currentScenarioId: string;
  onSelectScenario: (id: string) => void;
  viewMode: 'editorial' | 'planner' | 'console';
  onToggleViewMode: (mode: 'editorial' | 'planner' | 'console') => void;
  activeConsoleTab: 'console' | 'heap' | 'topological' | 'routing' | 'benchmark';
  onSelectConsoleTab: (tab: 'console' | 'heap' | 'topological' | 'routing' | 'benchmark') => void;
  onOpenReportModal: () => void;
  onOpenInjectModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScenarioId,
  onSelectScenario,
  viewMode,
  onToggleViewMode,
  activeConsoleTab,
  onSelectConsoleTab,
  onOpenReportModal,
  onOpenInjectModal,
  onScrollToSection
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#5C1D2D] bg-[#3F0D1B]/95 text-[#D8CBB5] backdrop-blur-md h-18 transition-all shadow-md">
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Brand Monogram */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div
            onClick={() => {
              onToggleViewMode('editorial');
              onScrollToSection('hero');
            }}
            className="w-10 h-10 rounded-xl bg-[#2C0712] border border-[#5C1D2D] flex items-center justify-center text-[#D8CBB5] shadow-xs cursor-pointer hover:bg-[#4C1222] transition-colors"
          >
            <ShieldCheck size={22} weight="fill" />
          </div>

          <div
            onClick={() => {
              onToggleViewMode('editorial');
              onScrollToSection('hero');
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-editorial text-lg font-bold tracking-tight text-[#FAF6EE]">
                CyberCPR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8CBB5]" />
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#2C0712] border border-[#5C1D2D] text-[#D8CBB5] font-semibold">
                DAA Engine
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#D8CBB5]/70 hidden sm:block">
              Cyber Incident Response Planner
            </p>
          </div>
        </div>

        {/* Minimal Editorial Navigation Links */}
        {viewMode !== 'console' ? (
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-[#D8CBB5]/80">
            <button
              onClick={() => {
                onToggleViewMode('editorial');
                onScrollToSection('hero');
              }}
              className={`hover:text-[#FAF6EE] transition-colors cursor-pointer ${
                viewMode === 'editorial' ? 'text-[#FAF6EE] font-bold' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                onToggleViewMode('editorial');
                onScrollToSection('lifecycle-narrative');
              }}
              className="hover:text-[#FAF6EE] transition-colors cursor-pointer"
            >
              01-05 Lifecycle
            </button>
            <button
              onClick={() => onToggleViewMode('planner')}
              className={`hover:text-[#FAF6EE] transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg ${
                viewMode === 'planner'
                  ? 'bg-[#D8CBB5] text-[#3F0D1B] font-bold shadow-xs'
                  : 'text-[#D8CBB5]'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Incident Planner</span>
            </button>
            <button
              onClick={() => onToggleViewMode('console')}
              className="hover:text-[#FAF6EE] transition-colors cursor-pointer flex items-center gap-1.5 text-[#D8CBB5] font-semibold"
            >
              <Terminal size={14} className="text-[#D8CBB5]" />
              <span>DAA Console</span>
            </button>
          </nav>
        ) : (
          /* DAA Console Navigation Tabs when in Console View */
          <nav className="hidden lg:flex items-center gap-1 bg-[#2C0712] p-1 rounded-xl border border-[#5C1D2D]">
            <button
              onClick={() => onSelectConsoleTab('console')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                activeConsoleTab === 'console'
                  ? 'bg-[#D8CBB5] text-[#3F0D1B] font-bold shadow-xs'
                  : 'text-[#D8CBB5]/80 hover:text-[#FAF6EE]'
              }`}
            >
              <Graph size={14} />
              <span>Topology</span>
            </button>
            <button
              onClick={() => onSelectConsoleTab('heap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                activeConsoleTab === 'heap'
                  ? 'bg-[#D8CBB5] text-[#3F0D1B] font-bold shadow-xs'
                  : 'text-[#D8CBB5]/80 hover:text-[#FAF6EE]'
              }`}
            >
              <TreeStructure size={14} />
              <span>Priority Queue</span>
            </button>
            <button
              onClick={() => onSelectConsoleTab('topological')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                activeConsoleTab === 'topological'
                  ? 'bg-[#D8CBB5] text-[#3F0D1B] font-bold shadow-xs'
                  : 'text-[#D8CBB5]/80 hover:text-[#FAF6EE]'
              }`}
            >
              <Sliders size={14} />
              <span>Dependency DAG</span>
            </button>
            <button
              onClick={() => onSelectConsoleTab('routing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                activeConsoleTab === 'routing'
                  ? 'bg-[#D8CBB5] text-[#3F0D1B] font-bold shadow-xs'
                  : 'text-[#D8CBB5]/80 hover:text-[#FAF6EE]'
              }`}
            >
              <Path size={14} />
              <span>Containment Route</span>
            </button>
            <button
              onClick={() => onSelectConsoleTab('benchmark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                activeConsoleTab === 'benchmark'
                  ? 'bg-[#D8CBB5] text-[#3F0D1B] font-bold shadow-xs'
                  : 'text-[#D8CBB5]/80 hover:text-[#FAF6EE]'
              }`}
            >
              <ChartBar size={14} />
              <span>Benchmark</span>
            </button>
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Scenario Selector */}
          <div className="relative">
            <select
              aria-label="Select Infrastructure Scenario"
              value={currentScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-[#2C0712] border-[#5C1D2D] text-[#FAF6EE] hover:border-[#D8CBB5] text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#D8CBB5] shadow-xs cursor-pointer"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#2C0712] text-[#FAF6EE]">
                  {s.industry}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle Button */}
          <button
            onClick={() => onToggleViewMode(viewMode === 'planner' ? 'editorial' : 'planner')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all border flex items-center gap-2 cursor-pointer ${
              viewMode === 'planner'
                ? 'bg-[#D8CBB5] text-[#3F0D1B] border-[#D8CBB5]'
                : 'bg-[#4C1222] hover:bg-[#5C1729] text-[#FAF6EE] border-[#5C1D2D]'
            }`}
          >
            <ShieldCheck size={15} />
            <span className="hidden sm:inline">
              {viewMode === 'planner' ? 'Editorial Story' : 'Incident Planner'}
            </span>
          </button>

          {/* Primary Action Button */}
          {viewMode === 'editorial' ? (
            <button
              onClick={() => onToggleViewMode('planner')}
              className="px-4 py-2 rounded-xl bg-[#D8CBB5] hover:bg-[#FAF6EE] text-[#3F0D1B] text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Build Plan</span>
              <ArrowRight size={14} className="text-[#3F0D1B]" />
            </button>
          ) : viewMode === 'planner' ? (
            <button
              onClick={() => onToggleViewMode('console')}
              className="px-4 py-2 rounded-xl bg-[#D8CBB5] hover:bg-[#FAF6EE] text-[#3F0D1B] text-xs font-bold tracking-wide transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Terminal size={14} className="text-[#3F0D1B]" />
              <span className="hidden sm:inline">DAA Console</span>
            </button>
          ) : (
            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-2 rounded-xl bg-[#D8CBB5] hover:bg-[#FAF6EE] text-[#3F0D1B] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText size={15} className="text-[#3F0D1B]" />
              <span className="hidden sm:inline">Audit Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
