import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  ArrowClockwise,
  SpeakerHigh,
  SpeakerSlash,
  ArrowsOut,
  ArrowsIn,
  FastForward,
  CheckCircle,
  ShieldCheck,
  ShieldWarning,
  Warning,
  Globe,
  Database,
  User,
  Cloud,
  Desktop,
  CaretRight,
  CaretLeft,
  X,
  Sparkle,
  FileText,
  Check,
  Cursor,
  Clock,
  ArrowRight
} from '@phosphor-icons/react';

interface DemoScene {
  id: number;
  title: string;
  shortLabel: string;
  startTime: number;
  endTime: number;
  narration: string;
}

const DEMO_SCENES: DemoScene[] = [
  {
    id: 1,
    title: 'Welcome to CyberCPR',
    shortLabel: 'Welcome',
    startTime: 0,
    endTime: 10,
    narration:
      "Welcome to CyberCPR Incident Planner. Let's see how you can prepare for and manage a cybersecurity incident."
  },
  {
    id: 2,
    title: 'Create an Incident Report',
    shortLabel: 'Create',
    startTime: 10,
    endTime: 22,
    narration:
      'Start by creating an incident report and identifying the type and severity of the threat.'
  },
  {
    id: 3,
    title: 'Analyze the Threat',
    shortLabel: 'Analyze',
    startTime: 22,
    endTime: 34,
    narration:
      'CyberCPR helps organize critical information so your response team understands the situation.'
  },
  {
    id: 4,
    title: 'Build the Response Plan',
    shortLabel: 'Plan',
    startTime: 34,
    endTime: 48,
    narration:
      'Create a structured response plan, assign responsibilities, and keep every action organized.'
  },
  {
    id: 5,
    title: 'Containment & Recovery Workflow',
    shortLabel: 'Timeline',
    startTime: 48,
    endTime: 62,
    narration:
      'Follow the response workflow, contain the incident, remove the threat, and restore affected systems.'
  },
  {
    id: 6,
    title: 'Incident Resolution & Audit',
    shortLabel: 'Resolution',
    startTime: 62,
    endTime: 72,
    narration:
      'Once the incident is resolved, review the response and document the lessons learned.'
  },
  {
    id: 7,
    title: 'CyberCPR Readiness Finale',
    shortLabel: 'Finish',
    startTime: 72,
    endTime: 80,
    narration:
      'Be Prepared. Respond Smarter. Recover Stronger.'
  }
];

const TOTAL_DURATION = 80;

interface InteractiveDemoVideoProps {
  onStartPlanner: () => void;
}

export const InteractiveDemoVideo: React.FC<InteractiveDemoVideoProps> = ({
  onStartPlanner
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const lastSpokenSceneRef = useRef<number | null>(null);

  // Active scene based on time
  const currentSceneIndex = useMemo(() => {
    const idx = DEMO_SCENES.findIndex(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    return idx !== -1 ? idx : DEMO_SCENES.length - 1;
  }, [currentTime]);

  const currentScene = DEMO_SCENES[currentSceneIndex];

  // Speech narration using Web Speech API when unmuted
  const speakNarration = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (isMuted || !isPlaying) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackRate * 0.96;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel'))
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech fallback
    }
  };

  // Trigger narration speech when scene changes during playback
  useEffect(() => {
    if (isPlaying && !isMuted) {
      if (lastSpokenSceneRef.current !== currentScene.id) {
        lastSpokenSceneRef.current = currentScene.id;
        speakNarration(currentScene.narration);
      }
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      lastSpokenSceneRef.current = null;
    }
  }, [currentScene.id, isPlaying, isMuted]);

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimestampRef.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current !== null) {
        const delta = (timestamp - lastTimestampRef.current) * 0.001 * playbackRate;
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return next;
        });
      }
      lastTimestampRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackRate]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Seek handler
  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, newTime));
    setCurrentTime(clamped);
    lastSpokenSceneRef.current = null;
    if (isPlaying && !isMuted) {
      const scene = DEMO_SCENES.find((s) => clamped >= s.startTime && clamped < s.endTime) || DEMO_SCENES[0];
      speakNarration(scene.narration);
    }
  };

  const handleTogglePlay = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
      lastSpokenSceneRef.current = null;
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    setCurrentTime(0);
    lastSpokenSceneRef.current = null;
    setIsPlaying(true);
  };

  const handleSkipIntro = () => {
    handleSeek(10);
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen exit
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // If user minimized the demo, show a high-visibility launcher banner
  if (isMinimized) {
    return (
      <div className="w-full rounded-2xl bg-[#2C0712] border-2 border-[#5C1D2D] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl text-[#FAF6EE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5C1D2D] flex items-center justify-center text-[#D8CBB5] shrink-0 border border-[#D8CBB5]/40 shadow-inner">
            <Play size={20} weight="fill" className="translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D8CBB5]">
                See How It Works : Interactive Demo
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#3F0D1B] border border-[#5C1D2D] text-[10px] font-mono text-[#D8CBB5]">
                80s Walkthrough
              </span>
            </div>
            <p className="text-sm text-[#D8CBB5]/80 font-light mt-0.5">
              Watch a fictional ransomware response scenario and learn how to generate action checklists.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              setIsMinimized(false);
              setIsPlaying(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#D8CBB5] hover:bg-[#FAF6EE] text-[#3F0D1B] font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Play size={14} weight="fill" />
            <span>Watch Demo Video</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate scene progress (0 to 1 inside current scene)
  const sceneDuration = currentScene.endTime - currentScene.startTime;
  const sceneProgress = Math.min(1, Math.max(0, (currentTime - currentScene.startTime) / sceneDuration));

  return (
    <section className="w-full space-y-4 select-none">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5C1D2D] pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C0712] border border-[#5C1D2D] text-[11px] font-mono text-[#D8CBB5] shadow-xs">
            <Sparkle size={13} weight="fill" className="text-[#D8CBB5]" />
            <span className="font-bold tracking-wider uppercase">Interactive Product Tour</span>
            <span className="text-[#5C1D2D]">|</span>
            <span className="text-[#FAF6EE]">Ransomware Response Case Study</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#FAF6EE] tracking-tight">
            See How It Works : Interactive Demo
          </h2>
          <p className="text-sm text-[#D8CBB5]/90 font-light max-w-2xl">
            Watch our step-by-step walkthrough demonstrating how a company experiences, assesses, contains, and resolves a cybersecurity incident with CyberCPR.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setIsPlaying(false);
              setIsMinimized(true);
            }}
            className="p-2 rounded-xl bg-[#2C0712] hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Minimize demo"
          >
            <span>Minimize Demo</span>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Cinematic Video Player Container */}
      <div
        ref={playerContainerRef}
        className={`relative w-full rounded-2xl bg-[#140307] border-2 border-[#5C1D2D] shadow-2xl overflow-hidden flex flex-col ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'aspect-video min-h-[460px] sm:min-h-[520px]'
        }`}
      >
        {/* Top Video Header HUD Bar */}
        <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-[#100306]/95 via-[#100306]/75 to-transparent pointer-events-none">
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E05A47] animate-ping" />
            <span className="font-mono text-xs font-bold text-[#FAF6EE] tracking-wide hidden sm:inline">
              CYBERCPR SIMULATION : APEX LOGISTICS
            </span>
            <span className="text-[#5C1D2D] hidden sm:inline">|</span>
            <span className="px-2 py-0.5 rounded bg-[#3F0D1B] border border-[#5C1D2D] text-[10px] font-mono font-semibold text-[#D8CBB5]">
              SCENE {currentScene.id} OF 7 : {currentScene.shortLabel.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="px-2 py-0.5 rounded bg-[#2C0712]/90 border border-[#5C1D2D] text-[10px] font-mono text-[#D8CBB5]">
              1080p 60fps
            </span>
            <span className="font-mono text-xs text-[#FAF6EE] bg-[#2C0712]/90 px-2 py-0.5 rounded border border-[#5C1D2D]">
              {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
            </span>
          </div>
        </div>

        {/* Video Canvas Stage: Animated Realistic Walkthrough UI */}
        <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-4 sm:p-8 pt-12 pb-24">
          {/* Background Ambient Grid & Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(63,13,27,0.85)_0%,rgba(20,3,7,0.98)_100%)] z-0 pointer-events-none" />
          <div
            className="absolute inset-0 opacity-15 pointer-events-none z-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, #D8CBB5 1px, transparent 1px), linear-gradient(to bottom, #D8CBB5 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* ========================================================================= */}
          {/* SCENE 1: Welcome to CyberCPR (0s - 10s) */}
          {/* ========================================================================= */}
          {currentScene.id === 1 && (
            <div className="relative z-10 w-full max-w-2xl text-center space-y-6 animate-fadeIn">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#2C0712] border border-[#5C1D2D] text-xs font-mono text-[#D8CBB5] shadow-lg">
                <ShieldCheck size={16} weight="bold" className="text-[#D8CBB5]" />
                <span>Cyber Incident Response Planner</span>
                <span className="text-[#5C1D2D]">|</span>
                <span className="text-[#FAF6EE]">Case Study 104</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-editorial font-bold text-[#FAF6EE] tracking-tight leading-tight">
                  Welcome to CyberCPR
                </h3>
                <p className="text-base sm:text-lg text-[#D8CBB5]/90 font-light max-w-xl mx-auto">
                  Preparing and managing active cybersecurity crises with structured response playbooks.
                </p>
              </div>

              {/* Three Readiness Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#2C0712]/90 border border-[#5C1D2D] text-left space-y-1">
                  <div className="text-[#D8CBB5] font-mono text-xs font-bold">01. INTAKE</div>
                  <div className="text-[#FAF6EE] text-sm font-semibold">Structured Triage</div>
                  <div className="text-[11px] text-[#D8CBB5]/70">Capture symptoms without exposing secrets</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#2C0712]/90 border border-[#5C1D2D] text-left space-y-1">
                  <div className="text-[#D8CBB5] font-mono text-xs font-bold">02. FORMULATE</div>
                  <div className="text-[#FAF6EE] text-sm font-semibold">Automated Steps</div>
                  <div className="text-[11px] text-[#D8CBB5]/70">NIST 800-61 containment checklists</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#2C0712]/90 border border-[#5C1D2D] text-left space-y-1">
                  <div className="text-[#D8CBB5] font-mono text-xs font-bold">03. RESOLVE</div>
                  <div className="text-[#FAF6EE] text-sm font-semibold">Audited Recovery</div>
                  <div className="text-[11px] text-[#D8CBB5]/70">Exportable executive playbook report</div>
                </div>
              </div>

              {/* Simulated Cursor entering */}
              <div
                className="absolute -bottom-6 right-12 transition-all duration-700 flex items-center gap-2 pointer-events-none"
                style={{
                  transform: `translate(${Math.sin(sceneProgress * 4) * 20}px, ${Math.cos(sceneProgress * 3) * 10}px)`
                }}
              >
                <div className="p-1 rounded-full bg-[#FAF6EE] text-[#3F0D1B] shadow-xl animate-pulse">
                  <Cursor size={22} weight="fill" />
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FAF6EE] text-[#3F0D1B] font-mono text-[10px] font-bold shadow-md">
                  User Cursor
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 2: Create an Incident (10s - 22s) */}
          {/* ========================================================================= */}
          {currentScene.id === 2 && (
            <div className="relative z-10 w-full max-w-2xl bg-[#2C0712]/95 border border-[#5C1D2D] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn text-left">
              <div className="flex items-center justify-between border-b border-[#5C1D2D] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E05A47]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF6EE]">
                    Create Incident Report : Intake Form
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#3F0D1B] border border-[#5C1D2D] text-[10px] font-mono text-[#D8CBB5]">
                  Step 1 of 2
                </span>
              </div>

              {/* Form Fields Simulation */}
              <div className="space-y-3 text-xs">
                {/* Incident Type Selector */}
                <div>
                  <label className="font-mono text-[#D8CBB5] text-[11px] block mb-1">Incident Type</label>
                  <div className="p-2.5 rounded-lg bg-[#3F0D1B] border-2 border-[#D8CBB5] text-[#FAF6EE] font-bold flex items-center justify-between shadow-inner">
                    <span className="flex items-center gap-2">
                      <ShieldWarning size={16} className="text-[#E05A47]" weight="bold" />
                      <span>Ransomware (LockBit 3.0 Variant)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-[#E05A47] text-[#FAF6EE] px-2 py-0.5 rounded font-bold">
                      SELECTED
                    </span>
                  </div>
                </div>

                {/* Problem Description with Typing Simulation */}
                <div>
                  <label className="font-mono text-[#D8CBB5] text-[11px] block mb-1">Describe the problem</label>
                  <div className="p-2.5 rounded-lg bg-[#20050D] border border-[#5C1D2D] text-[#D8CBB5] font-mono text-[11px] leading-relaxed min-h-[54px]">
                    {sceneProgress > 0.2 ? (
                      <span className="text-[#FAF6EE]">
                        All primary file servers encrypted with .lockbit extension. Ransom note left on desktop. Database inaccessible.
                        <span className="inline-block w-1.5 h-3.5 bg-[#FAF6EE] ml-1 animate-pulse" />
                      </span>
                    ) : (
                      <span className="text-[#D8CBB5]/40">Typing incident details...</span>
                    )}
                  </div>
                </div>

                {/* Severity & Affected Systems */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[#D8CBB5] text-[11px] block mb-1">Calculated Severity</label>
                    <div className="p-2 rounded-lg bg-[#3F0D1B] border border-[#E05A47] text-[#E05A47] font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E05A47] animate-ping" />
                      <span>CRITICAL (P1)</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[#D8CBB5] text-[11px] block mb-1">Affected Systems</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-1 rounded bg-[#3F0D1B] border border-[#5C1D2D] text-[#FAF6EE] text-[10px] font-mono">
                        Server
                      </span>
                      <span className="px-2 py-1 rounded bg-[#3F0D1B] border border-[#5C1D2D] text-[#FAF6EE] text-[10px] font-mono">
                        Database
                      </span>
                      <span className="px-2 py-1 rounded bg-[#3F0D1B] border border-[#5C1D2D] text-[#FAF6EE] text-[10px] font-mono">
                        Cloud
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button Highlight */}
                <div className="pt-2 flex justify-end">
                  <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D8CBB5] to-[#FAF6EE] text-[#3F0D1B] font-mono font-bold text-xs flex items-center gap-2 shadow-lg border-2 border-[#FAF6EE] scale-102">
                    <Sparkle size={15} weight="bold" />
                    <span>Analyze Incident</span>
                    <ArrowRight size={14} weight="bold" />
                  </div>
                </div>
              </div>

              {/* Animated Cursor clicking Submit */}
              <div
                className="absolute bottom-6 right-20 transition-all duration-500 pointer-events-none flex items-center gap-1.5"
                style={{
                  transform: `scale(${sceneProgress > 0.7 ? 0.9 : 1})`
                }}
              >
                <div className="p-1 rounded-full bg-[#FAF6EE] text-[#3F0D1B] shadow-2xl animate-bounce">
                  <Cursor size={20} weight="fill" />
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#FAF6EE] text-[#3F0D1B] font-mono text-[9px] font-black uppercase shadow-md">
                  Clicking Analyze
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 3: Analyze the Threat (22s - 34s) */}
          {/* ========================================================================= */}
          {currentScene.id === 3 && (
            <div className="relative z-10 w-full max-w-2xl bg-[#2C0712]/95 border border-[#5C1D2D] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn text-left">
              <div className="flex items-center justify-between border-b border-[#5C1D2D] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E05A47] animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF6EE]">
                    Incident Assessment Dashboard
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E05A47]/20 border border-[#E05A47] text-[#E05A47] font-mono text-[10px] font-bold">
                  ACTIVE CRISIS
                </span>
              </div>

              {/* Assessment Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Classified Threat</div>
                  <div className="text-sm font-bold text-[#FAF6EE] mt-0.5">Ransomware</div>
                  <div className="text-[10px] text-[#E05A47] font-mono mt-1">LockBit 3.0</div>
                </div>

                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Severity Score</div>
                  <div className="text-sm font-bold text-[#E05A47] mt-0.5">CRITICAL (9.4)</div>
                  <div className="text-[10px] text-[#D8CBB5]/70 font-mono mt-1">Tier 1 Urgent</div>
                </div>

                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Affected Scope</div>
                  <div className="text-sm font-bold text-[#FAF6EE] mt-0.5">3 Systems</div>
                  <div className="text-[10px] text-[#D8CBB5]/70 font-mono mt-1">Server, DB, IAM</div>
                </div>

                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Initial Priority</div>
                  <div className="text-sm font-bold text-[#FAF6EE] mt-0.5">Immediate Cut</div>
                  <div className="text-[10px] text-[#52B788] font-mono mt-1">Plan Formulated</div>
                </div>
              </div>

              {/* Initial Planning Assessment Box */}
              <div className="p-3.5 rounded-xl bg-[#20050D] border border-[#5C1D2D] space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#D8CBB5] font-semibold">
                  <ShieldWarning size={14} className="text-[#E05A47]" weight="bold" />
                  <span>Initial Planning Assessment</span>
                </div>
                <p className="text-xs text-[#FAF6EE]/90 leading-relaxed font-light">
                  High probability of lateral credential stuffing. Host isolation required immediately on Core Server subnet (10.0.4.0/24) to protect immutable ledger backups.
                </p>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#D8CBB5]/80 pt-1 border-t border-[#5C1D2D]/60">
                <span>NIST 800-61 Phase : Triage & Verification</span>
                <span className="text-[#52B788] font-semibold">Response Engine Ready</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 4: Build the Response Plan (34s - 48s) */}
          {/* ========================================================================= */}
          {currentScene.id === 4 && (
            <div className="relative z-10 w-full max-w-2xl bg-[#2C0712]/95 border border-[#5C1D2D] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn text-left">
              <div className="flex items-center justify-between border-b border-[#5C1D2D] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="bold" className="text-[#52B788]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF6EE]">
                    Organized Response Checklist & Delegation
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#D8CBB5]">
                  <span>Progress:</span>
                  <span className="font-bold text-[#FAF6EE]">{sceneProgress > 0.5 ? '66%' : '33%'}</span>
                </div>
              </div>

              {/* Response Steps Checklist */}
              <div className="space-y-2.5">
                {/* Task 1 */}
                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#52B788] flex items-center justify-center text-[#140307]">
                      <Check size={14} weight="bold" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#FAF6EE]">Sever network interfaces to isolate infected server</div>
                      <div className="text-[10px] font-mono text-[#D8CBB5]/70">Priority: URGENT (0-30 min)</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-[#20050D] border border-[#5C1D2D] text-[10px] font-mono text-[#D8CBB5]">
                    Alex R. (SecOps Lead)
                  </div>
                </div>

                {/* Task 2 */}
                <div
                  className={`p-3 rounded-xl transition-all border flex items-center justify-between gap-3 ${
                    sceneProgress > 0.4
                      ? 'bg-[#3F0D1B] border-[#52B788]'
                      : 'bg-[#20050D] border-[#5C1D2D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        sceneProgress > 0.4
                          ? 'bg-[#52B788] text-[#140307]'
                          : 'border border-[#5C1D2D] bg-[#2C0712]'
                      }`}
                    >
                      {sceneProgress > 0.4 && <Check size={14} weight="bold" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#FAF6EE]">Revoke compromised Active Directory tokens & passwords</div>
                      <div className="text-[10px] font-mono text-[#D8CBB5]/70">Priority: HIGH (0-1 hr)</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-[#20050D] border border-[#5C1D2D] text-[10px] font-mono text-[#D8CBB5]">
                    Sarah K. (IAM Admin)
                  </div>
                </div>

                {/* Task 3 */}
                <div className="p-3 rounded-xl bg-[#20050D] border border-[#5C1D2D] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md border border-[#5C1D2D] bg-[#2C0712] flex items-center justify-center" />
                    <div>
                      <div className="text-xs font-bold text-[#FAF6EE]">Preserve volatile RAM and forensic event logs</div>
                      <div className="text-[10px] font-mono text-[#D8CBB5]/70">Priority: HIGH (1-2 hr)</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-[#20050D] border border-[#5C1D2D] text-[10px] font-mono text-[#D8CBB5]">
                    David M. (DFIR)
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#100306] h-2 rounded-full overflow-hidden border border-[#5C1D2D]">
                <div
                  className="bg-gradient-to-r from-[#D8CBB5] to-[#52B788] h-full transition-all duration-500 rounded-full"
                  style={{ width: sceneProgress > 0.5 ? '66%' : '33%' }}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 5: Containment and Recovery (48s - 62s) */}
          {/* ========================================================================= */}
          {currentScene.id === 5 && (
            <div className="relative z-10 w-full max-w-2xl bg-[#2C0712]/95 border border-[#5C1D2D] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 animate-fadeIn text-left">
              <div className="flex items-center justify-between border-b border-[#5C1D2D] pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} weight="bold" className="text-[#D8CBB5]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF6EE]">
                    Lifecycle Timeline : 5-Stage Response Workflow
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#52B788]/20 border border-[#52B788] text-[#52B788] font-mono text-[10px] font-bold">
                  ACTIVE PROGRESSION
                </span>
              </div>

              {/* Horizontal 5-Stage Workflow Pipeline */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
                {[
                  { label: 'DETECT', time: 'T+00m', status: 'done', desc: 'Alert Verified' },
                  { label: 'ANALYZE', time: 'T+05m', status: 'done', desc: 'Scope Triaged' },
                  { label: 'CONTAIN', time: 'T+14m', status: 'active', desc: 'Subnet Isolated' },
                  { label: 'ERADICATE', time: 'T+28m', status: sceneProgress > 0.4 ? 'done' : 'next', desc: 'Malware Purged' },
                  { label: 'RECOVER', time: 'T+45m', status: sceneProgress > 0.8 ? 'done' : 'standby', desc: 'Clean Restore' }
                ].map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-between transition-all ${
                      st.status === 'done'
                        ? 'bg-[#3F0D1B] border-[#52B788] text-[#FAF6EE]'
                        : st.status === 'active'
                        ? 'bg-[#5C1D2D] border-[#FAF6EE] text-[#FAF6EE] shadow-lg scale-105'
                        : 'bg-[#20050D] border-[#5C1D2D]/60 text-[#D8CBB5]/60'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold">{st.label}</div>
                    <div className="my-1.5">
                      {st.status === 'done' ? (
                        <CheckCircle size={18} weight="fill" className="text-[#52B788]" />
                      ) : st.status === 'active' ? (
                        <div className="w-4 h-4 rounded-full bg-[#FAF6EE] animate-ping" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-[#D8CBB5]/40" />
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-[#D8CBB5]">{st.time}</div>
                    <div className="text-[8px] text-[#D8CBB5]/70 truncate max-w-full">{st.desc}</div>
                  </div>
                ))}
              </div>

              {/* Status Callout */}
              <div className="p-3.5 rounded-xl bg-[#20050D] border border-[#5C1D2D] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#FAF6EE]">Containment Protocol Active</div>
                  <div className="text-[11px] text-[#D8CBB5]/80">Lateral spread halted 100%. Safe bypass routing restored.</div>
                </div>
                <div className="text-xs font-mono font-bold text-[#52B788] bg-[#3F0D1B] px-3 py-1 rounded-lg border border-[#5C1D2D]">
                  ZERO DATA EXFILTRATION
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 6: Incident Resolution (62s - 72s) */}
          {/* ========================================================================= */}
          {currentScene.id === 6 && (
            <div className="relative z-10 w-full max-w-2xl bg-[#2C0712]/95 border border-[#5C1D2D] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn text-left">
              <div className="flex items-center justify-between border-b border-[#5C1D2D] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} weight="bold" className="text-[#52B788]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF6EE]">
                    Incident Resolved : Post-Mortem Briefing
                  </span>
                </div>
                <span className="px-3 py-0.5 rounded-full bg-[#52B788]/20 border border-[#52B788] text-[#52B788] font-mono text-xs font-bold">
                  100% COMPLETE
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Tasks Verified</div>
                  <div className="text-base font-bold text-[#FAF6EE] mt-0.5">14 / 14</div>
                  <div className="text-[10px] text-[#52B788] font-mono mt-1">100% Executed</div>
                </div>

                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Total MTTC</div>
                  <div className="text-base font-bold text-[#FAF6EE] mt-0.5">48 Minutes</div>
                  <div className="text-[10px] text-[#52B788] font-mono mt-1">82% Under Target</div>
                </div>

                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Audit Rating</div>
                  <div className="text-base font-bold text-[#FAF6EE] mt-0.5">Pass Grade A</div>
                  <div className="text-[10px] text-[#D8CBB5]/70 font-mono mt-1">NIST 800-61</div>
                </div>

                <div className="p-3 rounded-xl bg-[#3F0D1B] border border-[#5C1D2D]">
                  <div className="text-[10px] font-mono text-[#D8CBB5]/70">Recovery State</div>
                  <div className="text-base font-bold text-[#52B788] mt-0.5">Nominal</div>
                  <div className="text-[10px] text-[#D8CBB5]/70 font-mono mt-1">Backups Verified</div>
                </div>
              </div>

              {/* Export Brief Card */}
              <div className="p-3.5 rounded-xl bg-[#20050D] border border-[#5C1D2D] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-[#D8CBB5]" />
                  <div>
                    <div className="text-xs font-bold text-[#FAF6EE]">Executive Incident Playbook Generated</div>
                    <div className="text-[11px] text-[#D8CBB5]/70">Full forensic timeline and post-incident review ready for download.</div>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#D8CBB5] text-[#3F0D1B] font-mono text-xs font-bold shadow-xs">
                  Export Ready
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCENE 7: Final Screen (72s - 80s) */}
          {/* ========================================================================= */}
          {currentScene.id === 7 && (
            <div className="relative z-10 w-full max-w-xl text-center space-y-6 animate-fadeIn">
              {/* CyberCPR Logo with subtle rose-gold glow */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5C1D2D] to-[#2C0712] border-2 border-[#D8CBB5] shadow-[0_0_35px_rgba(216,203,181,0.5)] flex items-center justify-center text-[#FAF6EE]">
                <ShieldCheck size={44} weight="bold" className="text-[#D8CBB5]" />
              </div>

              <div className="space-y-3">
                <div className="font-mono text-xs uppercase tracking-widest text-[#D8CBB5] font-semibold">
                  CyberCPR Incident Response Planner
                </div>
                <h3 className="text-3xl sm:text-4xl font-editorial font-bold text-[#FAF6EE] tracking-tight leading-snug drop-shadow-md">
                  Be Prepared.
                  <br />
                  Respond Smarter.
                  <br />
                  <span className="italic font-normal text-[#D8CBB5]">Recover Stronger.</span>
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onStartPlanner}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D8CBB5] via-[#FAF6EE] to-[#D8CBB5] text-[#3F0D1B] font-mono font-bold text-xs tracking-wider shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105"
                >
                  START USING INCIDENT PLANNER
                </button>

                <button
                  onClick={handleReplay}
                  className="px-4 py-3 rounded-xl bg-[#2C0712] hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] font-mono text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowClockwise size={14} />
                  <span>Replay Demo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Subtitles Banner (Narration Captions) */}
        {showCaptions && (
          <div className="absolute bottom-16 inset-x-4 sm:inset-x-12 z-30 flex justify-center pointer-events-none">
            <div className="max-w-3xl w-full bg-[#1A040B]/92 backdrop-blur-md border border-[#5C1D2D] px-4 py-2.5 rounded-xl shadow-2xl text-center">
              <span className="font-sans text-xs sm:text-sm text-[#FAF6EE] font-medium leading-relaxed drop-shadow-sm">
                "{currentScene.narration}"
              </span>
            </div>
          </div>
        )}

        {/* Bottom Video Player Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-gradient-to-t from-[#100306]/98 via-[#100306]/85 to-transparent flex flex-col gap-2 pointer-events-auto">
          {/* Interactive Scrubbable Progress Bar with Scene Markers */}
          <div className="relative w-full group">
            {/* Clickable timeline track */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(pos * TOTAL_DURATION);
              }}
              className="relative w-full h-2 rounded-full bg-[#2C0712] hover:h-3 cursor-pointer transition-all border border-[#5C1D2D]"
            >
              {/* Buffered progress fill */}
              <div
                className="h-full bg-gradient-to-r from-[#5C1D2D] via-[#D8CBB5] to-[#FAF6EE] rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
              />

              {/* 7 Scene Milestone Indicators on timeline */}
              {DEMO_SCENES.map((s) => {
                const pct = (s.startTime / TOTAL_DURATION) * 100;
                return (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeek(s.startTime);
                    }}
                    className="absolute top-0 bottom-0 w-1 bg-[#100306] hover:bg-[#FAF6EE] transition-colors"
                    style={{ left: `${pct}%` }}
                    title={`${s.shortLabel} (${formatTime(s.startTime)})`}
                  />
                );
              })}
            </div>
          </div>

          {/* Controls Bar Row */}
          <div className="flex items-center justify-between gap-3 text-[#FAF6EE]">
            {/* Left Controls: Play/Pause, Replay, Skip, Time */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className="p-2 rounded-lg bg-[#D8CBB5] hover:bg-[#FAF6EE] text-[#3F0D1B] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                title={isPlaying ? 'Pause demo' : 'Play demo'}
              >
                {isPlaying ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" />}
              </button>

              <button
                onClick={handleReplay}
                className="p-2 rounded-lg bg-[#2C0712] hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] transition-colors cursor-pointer"
                title="Replay from start"
              >
                <ArrowClockwise size={15} />
              </button>

              <button
                onClick={handleSkipIntro}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2C0712] hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] text-[11px] font-mono transition-colors cursor-pointer"
                title="Skip intro to Create Incident"
              >
                <FastForward size={13} />
                <span>Skip Intro</span>
              </button>

              <span className="font-mono text-xs text-[#D8CBB5] ml-1">
                {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
              </span>
            </div>

            {/* Center Scene Pills (Hidden on very small screens) */}
            <div className="hidden lg:flex items-center gap-1">
              {DEMO_SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => handleSeek(scene.startTime)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    currentSceneIndex === idx
                      ? 'bg-[#D8CBB5] text-[#3F0D1B] font-bold shadow-xs'
                      : 'text-[#D8CBB5]/70 hover:text-[#FAF6EE] hover:bg-[#3F0D1B]'
                  }`}
                  title={scene.title}
                >
                  {scene.shortLabel}
                </button>
              ))}
            </div>

            {/* Right Controls: Volume/Voice, Speed, Captions, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Volume / Voice narration toggle */}
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (isMuted && isPlaying) {
                    speakNarration(currentScene.narration);
                  }
                }}
                className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                  !isMuted
                    ? 'bg-[#3F0D1B] border-[#D8CBB5] text-[#FAF6EE]'
                    : 'bg-[#2C0712] border-[#5C1D2D] text-[#D8CBB5]/60 hover:text-[#FAF6EE]'
                }`}
                title={isMuted ? 'Unmute voice narration' : 'Mute voice narration'}
              >
                {!isMuted ? <SpeakerHigh size={15} /> : <SpeakerSlash size={15} />}
              </button>

              {/* Playback speed toggle */}
              <button
                onClick={() => {
                  const rates = [1, 1.5, 2];
                  const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
                  setPlaybackRate(next);
                }}
                className="px-2 py-1 rounded-lg bg-[#2C0712] hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] text-[11px] font-mono transition-colors cursor-pointer"
                title="Playback speed"
              >
                {playbackRate}x
              </button>

              {/* Captions toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer border ${
                  showCaptions
                    ? 'bg-[#3F0D1B] border-[#D8CBB5] text-[#FAF6EE]'
                    : 'bg-[#2C0712] border-[#5C1D2D] text-[#D8CBB5]/50'
                }`}
                title={showCaptions ? 'Hide captions' : 'Show captions'}
              >
                CC
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={handleToggleFullscreen}
                className="p-2 rounded-lg bg-[#2C0712] hover:bg-[#3F0D1B] text-[#D8CBB5] hover:text-[#FAF6EE] border border-[#5C1D2D] transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <ArrowsIn size={15} /> : <ArrowsOut size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Call to Action Button Below Video */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#2C0712]/80 border border-[#5C1D2D] shadow-md">
        <div className="text-left">
          <div className="text-sm font-bold text-[#FAF6EE]">Ready to formulate your incident response plan?</div>
          <div className="text-xs text-[#D8CBB5]/80 font-light">
            Skip the demo anytime and enter your real cybersecurity incident parameters directly.
          </div>
        </div>

        <button
          onClick={onStartPlanner}
          className="group px-7 py-3 rounded-xl bg-gradient-to-r from-[#D8CBB5] via-[#FAF6EE] to-[#D8CBB5] hover:from-[#FAF6EE] hover:to-[#FFFFFF] text-[#3F0D1B] font-mono font-bold text-xs tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:scale-102 shrink-0 border-2 border-[#FAF6EE]"
        >
          <span>START USING INCIDENT PLANNER</span>
          <ArrowRight size={15} weight="bold" className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};
