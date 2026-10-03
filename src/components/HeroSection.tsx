import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkle,
  Terminal,
  HandGrabbing,
  X
} from '@phosphor-icons/react';
import { HeroThreeCanvas } from './HeroThreeCanvas';

interface HeroSectionProps {
  onExplorePlatform: () => void;
  onBuildResponsePlan: () => void;
  onOpenConsole?: () => void;
  incidentCount?: number;
  readinessScore?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplorePlatform,
  onBuildResponsePlan,
  onOpenConsole,
  incidentCount = 6,
  readinessScore = 98.4
}) => {
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);

  // Keyboard shortcut: Escape to exit zoomed-in 3D inspection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomedIn) {
        setIsZoomedIn(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomedIn]);

  const handleToggleZoom = () => {
    setIsZoomedIn((prev) => !prev);
  };

  // Heading transition style: Centered, slow, silky smooth, hardware-accelerated
  const getHeadingStyle = (): React.CSSProperties => {
    if (isZoomedIn) {
      return {
        transform: 'scale(28) translateZ(0)',
        opacity: 0,
        transformOrigin: 'center center',
        transition:
          'transform 2.8s cubic-bezier(0.25, 0.85, 0.25, 1), opacity 2.1s cubic-bezier(0.35, 0, 0.2, 1)',
        willChange: 'transform, opacity',
        pointerEvents: 'none'
      };
    }
    return {
      transform: 'scale(1) translateZ(0)',
      opacity: 1,
      transformOrigin: 'center center',
      transition:
        'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'transform, opacity',
      pointerEvents: 'auto'
    };
  };

  return (
    <section
      onDoubleClick={handleToggleZoom}
      className="relative w-full min-h-[96vh] lg:min-h-[100vh] flex items-center justify-center bg-[#3F0D1B] text-[#D8CBB5] border-b border-[#5C1D2D] overflow-hidden select-none"
    >
      {/* Layer 0: Full-Bleed 3D Cybersecurity Infrastructure Telemetry Canvas (Background) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <HeroThreeCanvas isZoomedIn={isZoomedIn} onToggleZoom={handleToggleZoom} />
      </div>

      {/* Layer 1: Luxury Centered Radial Vignette for Supreme Typographic Readability & Depth */}
      <div
        className={`absolute inset-0 pointer-events-none z-[1] bg-[radial-gradient(ellipse_at_center,rgba(63,13,27,0.78)_0%,rgba(44,7,18,0.92)_100%)] transition-opacity duration-1000 ${
          isZoomedIn ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />
      <div
        className={`absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#3F0D1B] via-[#3F0D1B]/60 to-transparent pointer-events-none z-[1] transition-opacity duration-1000 ${
          isZoomedIn ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />
      <div
        className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#3F0D1B]/80 to-transparent pointer-events-none z-[1] transition-opacity duration-1000 ${
          isZoomedIn ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />



      {/* Layer 3: Monumental Centered Editorial Content with Netflix-Style Zoom-Through Transition */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center pointer-events-none min-h-[90vh]">
        <div className="max-w-4xl space-y-8 flex flex-col items-center">
          {/* Supporting Eyebrow Pill (Fades gently when zoom-in starts) */}
          <div
            style={{
              opacity: isZoomedIn ? 0 : 1,
              transform: isZoomedIn ? 'translateY(-16px) scale(0.95)' : 'translateY(0) scale(1)',
              transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
              pointerEvents: isZoomedIn ? 'none' : 'auto'
            }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#2C0712]/90 border border-[#5C1D2D] text-[#D8CBB5] shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#D8CBB5] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest font-semibold text-[#D8CBB5]">
                CyberCPR : Cyber Incident Response Planner
              </span>
              <span className="text-[#5C1D2D]">|</span>
              <span className="text-[#D8CBB5]/60 font-mono text-xs">CyberCPR-v2.4</span>
            </div>
          </div>

          {/* Monumental Editorial Heading: Centered Netflix-Style Zoom-Through Transition */}
          <div style={getHeadingStyle()} className="space-y-1 select-none">
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-[#FAF6EE] leading-[1.04] drop-shadow-xl text-center">
              SECURITY IS
              <br />
              <span className="text-[#FAF6EE]">NOT A REACTION.</span>
              <br />
              <span className="italic font-normal text-[#D8CBB5]">IT'S A PLAN.</span>
            </h1>
          </div>

          {/* Description & Supporting UI (Fades and glides away during zoom) */}
          <div
            style={{
              opacity: isZoomedIn ? 0 : 1,
              transform: isZoomedIn ? 'translateY(24px) scale(0.95)' : 'translateY(0) scale(1)',
              transition: isZoomedIn
                ? 'opacity 0.7s ease-out, transform 0.7s ease-out'
                : 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
              pointerEvents: isZoomedIn ? 'none' : 'auto'
            }}
            className="space-y-8 flex flex-col items-center w-full"
          >
            <p className="text-lg sm:text-xl text-[#D8CBB5]/90 max-w-xl leading-relaxed font-light drop-shadow-sm text-center">
              Anticipate threats. Coordinate response. Restore confidence.
            </p>

            {/* Action Buttons Centered */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={onExplorePlatform}
                className="group px-7 py-3.5 rounded-xl bg-[#D8CBB5] hover:bg-[#FAF6EE] text-[#3F0D1B] font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <span>Explore the Platform</span>
                <ArrowRight size={17} className="text-[#3F0D1B] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBuildResponsePlan}
                className="px-7 py-3.5 rounded-xl bg-[#2C0712]/90 hover:bg-[#4C1222] text-[#D8CBB5] font-semibold text-sm tracking-wide border border-[#5C1D2D] hover:border-[#D8CBB5]/60 transition-all flex items-center gap-2 cursor-pointer shadow-xs backdrop-blur-md"
              >
                <Sparkle size={16} className="text-[#D8CBB5]" />
                <span>Build Response Plan</span>
              </button>

              {/* Highlighted 3D Command Center "CLICK HERE / CLICK ME" Button */}
              <button
                onClick={() => setIsZoomedIn(true)}
                className="relative group px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D8CBB5] via-[#FAF6EE] to-[#D8CBB5] hover:from-[#FAF6EE] hover:to-[#FFFFFF] text-[#3F0D1B] font-bold text-sm tracking-wide border-2 border-[#FAF6EE] shadow-[0_0_25px_rgba(216,203,181,0.55)] hover:shadow-[0_0_35px_rgba(250,246,238,0.85)] transition-all flex items-center gap-2.5 cursor-pointer transform hover:scale-105 active:scale-95 ring-2 ring-[#D8CBB5]/60 hover:ring-[#FAF6EE]"
                title="Click to launch interactive 3D Cyber Incident Response Command Center"
              >
                {/* Floating "CLICK ME" Badge */}
                <span className="absolute -top-3.5 -right-2 px-2.5 py-0.5 rounded-full bg-[#E05A47] text-[#FAF6EE] font-mono text-[10px] font-black tracking-wider uppercase shadow-lg border border-[#FAF6EE] animate-bounce">
                  CLICK ME
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E05A47] animate-ping" />
                <ShieldCheck size={18} weight="bold" className="text-[#3F0D1B]" />
                <span className="font-extrabold text-[#3F0D1B]">Click Here : 3D Command Center</span>
              </button>

              {onOpenConsole && (
                <button
                  onClick={onOpenConsole}
                  className="px-5 py-3.5 rounded-xl bg-[#2C0712]/60 hover:bg-[#2C0712] text-[#D8CBB5] font-mono text-xs tracking-wider border border-[#5C1D2D] hover:border-[#D8CBB5]/40 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <Terminal size={15} />
                  <span>DAA Console</span>
                </button>
              )}
            </div>

            {/* Architectural Telemetry Bar Centered */}
            <div className="pt-6 border-t border-[#5C1D2D] grid grid-cols-3 gap-6 sm:gap-10 text-[#D8CBB5] max-w-xl w-full">
              <div>
                <div className="font-mono text-2xl font-bold tracking-tight text-[#FAF6EE]">
                  {readinessScore}%
                </div>
                <div className="text-xs text-[#D8CBB5]/70 font-mono mt-0.5">
                  Containment Confidence
                </div>
              </div>

              <div>
                <div className="font-mono text-2xl font-bold tracking-tight text-[#D8CBB5]">
                  O(E log V)
                </div>
                <div className="text-xs text-[#D8CBB5]/70 font-mono mt-0.5">
                  Dijkstra Minimal Cut
                </div>
              </div>

              <div>
                <div className="font-mono text-2xl font-bold tracking-tight text-[#FAF6EE]">
                  NIST 800-61
                </div>
                <div className="text-xs text-[#D8CBB5]/70 font-mono mt-0.5">
                  Compliance Aligned
                </div>
              </div>
            </div>

            {/* Interaction Guidance Banner Centered - Highlighted */}
            <div
              onClick={() => setIsZoomedIn(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#2C0712]/95 hover:bg-[#3F0D1B] border-2 border-[#D8CBB5] hover:border-[#FAF6EE] text-xs font-mono text-[#FAF6EE] shadow-[0_0_20px_rgba(216,203,181,0.3)] hover:shadow-[0_0_30px_rgba(216,203,181,0.55)] backdrop-blur-md cursor-pointer transition-all transform hover:scale-105 active:scale-95"
            >
              <span className="px-2 py-0.5 rounded-md bg-[#E05A47] text-[#FAF6EE] font-mono font-bold text-[10px] tracking-wider uppercase animate-pulse">
                CLICK HERE
              </span>
              <HandGrabbing size={15} weight="bold" className="text-[#D8CBB5]" />
              <span className="font-semibold text-[#FAF6EE]">Launch 3D Cyber Incident Response Command Center</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
