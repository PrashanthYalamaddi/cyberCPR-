import React from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
import { LegalTab } from './LegalModal';

interface FooterProps {
  onOpenLegal: (tab: LegalTab) => void;
  onOpenReportModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenReportModal }) => {
  return (
    <footer className="w-full border-t border-[#5C1D2D] bg-[#2C0712] text-[#D8CBB5] text-xs py-10 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3F0D1B] border border-[#5C1D2D] flex items-center justify-center text-[#D8CBB5] shadow-xs">
              <ShieldCheck size={18} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-base font-bold text-[#FAF6EE] tracking-tight">
                  CyberCPR
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8CBB5]" />
                <span className="text-[11px] font-mono text-[#D8CBB5]/80">
                  Cyber Incident Response Planner
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#D8CBB5]/65">
                MERN Hackathon Submission: Problem 92 Cyber Incident Response Planner (CyberCPR)
              </p>
            </div>
          </div>

          {/* Legal and Compliance Links */}
          <nav className="flex flex-wrap items-center gap-4 text-xs font-mono" aria-label="Legal and Compliance">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="text-[#D8CBB5]/80 hover:text-[#FAF6EE] transition-colors focus:outline-none focus:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-[#5C1D2D]">/</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="text-[#D8CBB5]/80 hover:text-[#FAF6EE] transition-colors focus:outline-none focus:underline cursor-pointer"
            >
              Terms and Conditions
            </button>
            <span className="text-[#5C1D2D]">/</span>
            <button
              onClick={() => onOpenLegal('cookies')}
              className="text-[#D8CBB5]/80 hover:text-[#FAF6EE] transition-colors focus:outline-none focus:underline cursor-pointer"
            >
              Cookie Policy
            </button>
            <span className="text-[#5C1D2D]">/</span>
            <button
              onClick={() => onOpenLegal('refund')}
              className="text-[#D8CBB5]/80 hover:text-[#FAF6EE] transition-colors focus:outline-none focus:underline cursor-pointer"
            >
              Security Governance
            </button>
            <span className="text-[#5C1D2D]">/</span>
            <button
              onClick={onOpenReportModal}
              className="text-[#D8CBB5] hover:text-[#FAF6EE] font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Incident Playbook
            </button>
          </nav>
        </div>

        <div className="border-t border-[#5C1D2D] pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#D8CBB5]/65 font-mono">
          <p>
            Engineered with React, TypeScript, Three.js WebGL, and DAA graph containment algorithms. Aligned with NIST SP 800-61 Rev 2 guidelines and DPDP Act principles.
          </p>
          <p className="shrink-0 text-[#D8CBB5]/75">
            Zero-Telemetry Client-Side Verification
          </p>
        </div>
      </div>
    </footer>
  );
};
