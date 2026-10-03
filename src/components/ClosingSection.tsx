import React, { useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, Sparkle, Terminal, CaretRight } from '@phosphor-icons/react';

interface ClosingSectionProps {
  onBuildResponsePlan: () => void;
  onOpenConsole?: () => void;
}

export const ClosingSection: React.FC<ClosingSectionProps> = ({
  onBuildResponsePlan,
  onOpenConsole
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background animated network architecture in aged ivory
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1200);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Node particles
    const nodeCount = 38;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: 2 + Math.random() * 2.5
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // Draw interconnecting conduits in aged ivory
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(216, 203, 181, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#D8CBB5';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(216, 203, 181, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative w-full bg-[#2C0712] text-[#D8CBB5] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-[#5C1D2D]">
      {/* Aged Ivory Animated Network Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-35 z-0" />

      {/* Subtle radial ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#3F0D1B]/60 blur-[130px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto text-center space-y-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3F0D1B] border border-[#5C1D2D] text-[#D8CBB5] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#D8CBB5] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest font-semibold">
            Architectural Readiness Assurance
          </span>
        </div>

        {/* Monumental Heading */}
        <div className="space-y-3">
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF6EE] leading-[1.08]">
            Prepared Before
            <br />
            <span className="text-[#D8CBB5] italic font-normal">the Breach.</span>
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg sm:text-xl text-[#D8CBB5]/85 max-w-2xl mx-auto leading-relaxed font-light">
          Because the difference between an incident and a crisis is how you respond.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onBuildResponsePlan}
            className="group px-8 py-4 rounded-xl bg-[#D8CBB5] hover:bg-[#FAF6EE] text-[#3F0D1B] font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <span>Build Your Response Plan</span>
            <ArrowRight size={17} className="text-[#3F0D1B] group-hover:translate-x-1 transition-transform" />
          </button>

          {onOpenConsole && (
            <button
              onClick={onOpenConsole}
              className="px-8 py-4 rounded-xl bg-[#3F0D1B] hover:bg-[#4C1222] text-[#FAF6EE] font-semibold text-sm tracking-wide border border-[#5C1D2D] hover:border-[#D8CBB5]/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Terminal size={17} className="text-[#D8CBB5]" />
              <span>Launch Algorithmic Command Center</span>
            </button>
          )}
        </div>

        {/* Compliance and Framework Certifications */}
        <div className="pt-14 border-t border-[#5C1D2D] flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-[#D8CBB5]/75">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D8CBB5]" />
            <span>NIST SP 800-61 Rev 2</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D8CBB5]" />
            <span>ISO/IEC 27035:2023</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D8CBB5]" />
            <span>MITRE ATT&CK Framework v14</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#D8CBB5]" />
            <span>CERT-In Response Mandate</span>
          </div>
        </div>
      </div>
    </section>
  );
};
