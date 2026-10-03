import React, { useState } from 'react';
import { ShieldCheck, X, FileLock, Scroll, Cookie, Receipt } from '@phosphor-icons/react';

export type LegalTab = 'privacy' | 'terms' | 'cookies' | 'refund';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[88vh] rounded-2xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#CDBFA7] bg-[#EDE4D6]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-[#3F0D1B]" />
            <div>
              <h2 className="text-base font-bold text-[#3F0D1B] tracking-tight">
                Trust, Compliance & Legal Policy Center
              </h2>
              <span className="text-[11px] font-mono text-[#521A27]">
                CyberCPR Cyber Incident Response Planner (MERN Hackathon Edition)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#521A27] hover:text-[#3F0D1B] hover:bg-[#D8CBB5] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Policy Tabs */}
        <div className="flex items-center border-b border-[#CDBFA7] bg-[#EDE4D6] px-4 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-[#3F0D1B] text-[#3F0D1B]'
                : 'border-transparent text-[#521A27] hover:text-[#3F0D1B]'
            }`}
          >
            <FileLock size={15} />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'terms'
                ? 'border-[#3F0D1B] text-[#3F0D1B]'
                : 'border-transparent text-[#521A27] hover:text-[#3F0D1B]'
            }`}
          >
            <Scroll size={15} />
            <span>Terms and Conditions</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'cookies'
                ? 'border-[#3F0D1B] text-[#3F0D1B]'
                : 'border-transparent text-[#521A27] hover:text-[#3F0D1B]'
            }`}
          >
            <Cookie size={15} />
            <span>Cookie Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'refund'
                ? 'border-[#3F0D1B] text-[#3F0D1B]'
                : 'border-transparent text-[#521A27] hover:text-[#3F0D1B]'
            }`}
          >
            <Receipt size={15} />
            <span>Refund Policy</span>
          </button>
        </div>

        {/* Policy Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-[#521A27] space-y-4 leading-relaxed bg-[#FAF6EE]">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#3F0D1B]">Privacy Policy</h3>
              <p className="font-mono text-[11px] text-[#521A27]/80">Effective Date: October 2026 | Last Updated: October 2, 2026</p>

              <h4 className="font-bold text-[#3F0D1B]">1. Zero Telemetry & Local Execution Architecture</h4>
              <p>
                CyberCPR is built with a zero-telemetry, privacy-first architecture. All graph calculations, priority heap sorting, topological traversals, and shortest path relaxations execute strictly within your local browser runtime. No network topology data, simulated incidents, system IP addresses, or CVE queries are transmitted to external cloud servers.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">2. India Digital Personal Data Protection (DPDP) Act 2023 Compliance</h4>
              <p>
                In alignment with the Digital Personal Data Protection Act 2023 (DPDP Act, India), this application operates under strict data minimization principles. It does not collect, record, process, or profile any personally identifiable information (PII). All simulated infrastructure nodes and CVE datasets represent synthetic benchmark models created exclusively for design and algorithmic demonstration.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">3. CERT-In Incident Notification Context</h4>
              <p>
                Under the CERT-In Directions 2022 (Section 70B of the Information Technology Act, 2000), critical cybersecurity incidents require mandatory reporting within 6 hours. This tool provides an educational compliance timer and SLA decay score in its priority queue to assist security analysts in prioritizing containment actions within statutory disclosure windows.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">4. Responsible Party & Contact Information</h4>
              <p>
                Project Entity: CyberCPR Open Source Team / Hackathon Project Submission.<br />
                Contact: [developer-team@cybercpr.local / Subject: Privacy Inquiry].
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#3F0D1B]">Terms and Conditions</h3>
              <p className="font-mono text-[11px] text-[#521A27]/80">Effective Date: October 2026</p>

              <h4 className="font-bold text-[#3F0D1B]">1. Acceptance of Terms</h4>
              <p>
                By accessing or using CyberCPR, you acknowledge that this software is an algorithm-centric hackathon prototype designed for educational, research, and demonstration purposes.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">2. Permitted Use & Academic Demonstration</h4>
              <p>
                You are granted a non-exclusive, revocable license to interact with the topology graph, inspect the DAA priority queue heap states, execute topological sorts, and benchmark path routing algorithms. You agree not to use the prototype as an authoritative real-time production fire control or automated network severing agent without independent human validation and formal cybersecurity testing.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">3. Disclaimer of Warranties</h4>
              <p>
                The software is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, or non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability arising from the use of the application.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">4. Governing Law</h4>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#3F0D1B]">Cookie Policy</h3>
              <p className="font-mono text-[11px] text-[#521A27]/80">Effective Date: October 2026</p>

              <h4 className="font-bold text-[#3F0D1B]">1. Absolute Absence of Tracking Cookies</h4>
              <p>
                CyberCPR does not use tracking cookies, marketing pixels, third-party analytics (such as Google Analytics or Meta Pixel), or fingerprinting technologies.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">2. Ephemeral In-Memory Storage Only</h4>
              <p>
                The prototype maintains scenario state and algorithm step playback entirely in component memory during your active browser session. When you reload or close the tab, state resets to the initial preset. No persistent tracking identifiers are placed in your browser storage.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">3. Consent Banner Determination</h4>
              <p>
                Because no non-essential cookies or third-party trackers are utilized, an invasive cookie consent banner is legally neither required nor implemented, avoiding deceptive dark patterns.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#3F0D1B]">Refund Policy</h3>
              <p className="font-mono text-[11px] text-[#521A27]/80">Effective Date: October 2026</p>

              <h4 className="font-bold text-[#3F0D1B]">1. Non-Commercial Free Prototype</h4>
              <p>
                CyberCPR is a free, non-commercial hackathon submission built for the MERN Hackathon under Problem 92. No subscription fees, software license purchases, or monetary transactions are processed.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">2. Applicability of Refunds</h4>
              <p>
                Because no payments are accepted, processed, or collected by the application, a monetary refund policy is not applicable. Any commercial derivatives or enterprise deployments in the future will establish independent commercial terms and SLA agreements.
              </p>

              <h4 className="font-bold text-[#3F0D1B]">3. Inquiries</h4>
              <p>
                For questions regarding project licensing or prototype verification, contact [developer-team@cybercpr.local].
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
