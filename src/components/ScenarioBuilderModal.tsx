import React, { useState } from 'react';
import { ShieldWarning, Plus, X } from '@phosphor-icons/react';
import { Incident, SystemNode, IncidentSeverity } from '../types';

interface ScenarioBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: SystemNode[];
  onAddIncident: (incident: Incident) => void;
}

export const ScenarioBuilderModal: React.FC<ScenarioBuilderModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onAddIncident
}) => {
  const [targetNodeId, setTargetNodeId] = useState<string>(nodes[0]?.id || '');
  const [title, setTitle] = useState<string>('Suspicious Lateral PowerShell Injection');
  const [cve, setCve] = useState<string>('CVE-2024-38077 (Windows RDL RCE)');
  const [cvss, setCvss] = useState<number>(9.0);
  const [attackVector, setAttackVector] = useState<Incident['attackVector']>('Lateral Movement');
  const [discoveredMinutesAgo, setDiscoveredMinutesAgo] = useState<number>(15);
  const [slaLimitMinutes, setSlaLimitMinutes] = useState<number>(60);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const severity: IncidentSeverity =
      cvss >= 9.0 ? 'CRITICAL' : cvss >= 7.0 ? 'HIGH' : cvss >= 4.0 ? 'MEDIUM' : 'LOW';

    const newIncident: Incident = {
      id: `custom-inc-${Date.now()}`,
      targetNodeId,
      title,
      cve,
      cvss,
      severity,
      attackVector,
      discoveredMinutesAgo,
      slaLimitMinutes
    };

    onAddIncident(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#CDBFA7] bg-[#FAF6EE] text-[#3F0D1B] p-6 shadow-2xl space-y-4 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#CDBFA7] pb-3">
          <div className="flex items-center gap-2">
            <ShieldWarning size={22} className="text-[#3F0D1B]" />
            <h2 className="text-base font-bold text-[#3F0D1B] tracking-tight">
              Inject Custom Cyber Incident
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#521A27] hover:text-[#3F0D1B] hover:bg-[#EDE4D6] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#521A27] font-semibold mb-1">Target Host System</label>
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
              className="w-full bg-[#EDE4D6] border border-[#CDBFA7] rounded-lg p-2.5 text-[#3F0D1B] focus:ring-1 focus:ring-[#3F0D1B]"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.ip}) - Criticality: {n.criticality}/10
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#521A27] font-semibold mb-1">Incident Title / Threat Vector</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-[#EDE4D6] border border-[#CDBFA7] rounded-lg p-2.5 text-[#3F0D1B] focus:ring-1 focus:ring-[#3F0D1B]"
              placeholder="e.g. Kerberos Ticket Forgery"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#521A27] font-semibold mb-1">CVE / MITRE Technique</label>
              <input
                type="text"
                value={cve}
                onChange={(e) => setCve(e.target.value)}
                required
                className="w-full bg-[#EDE4D6] border border-[#CDBFA7] rounded-lg p-2.5 text-[#3F0D1B] font-mono text-[11px] focus:ring-1 focus:ring-[#3F0D1B]"
                placeholder="CVE-2024-XXXX"
              />
            </div>

            <div>
              <label className="block text-[#521A27] font-semibold mb-1">
                CVSS v3.1 Score: <span className="text-[#3F0D1B] font-mono font-bold">{cvss}</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.1"
                value={cvss}
                onChange={(e) => setCvss(parseFloat(e.target.value))}
                className="w-full accent-[#3F0D1B] mt-2 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#521A27] font-semibold mb-1">Attack Classification</label>
              <select
                value={attackVector}
                onChange={(e) => setAttackVector(e.target.value as Incident['attackVector'])}
                className="w-full bg-[#EDE4D6] border border-[#CDBFA7] rounded-lg p-2.5 text-[#3F0D1B] focus:ring-1 focus:ring-[#3F0D1B]"
              >
                <option value="Lateral Movement">Lateral Movement</option>
                <option value="Zero-Day RCE">Zero-Day RCE</option>
                <option value="Credential Dumping">Credential Dumping</option>
                <option value="Ransomware Encryption">Ransomware Encryption</option>
                <option value="Data Exfiltration">Data Exfiltration</option>
              </select>
            </div>

            <div>
              <label className="block text-[#521A27] font-semibold mb-1">SLA Containment Limit</label>
              <select
                value={slaLimitMinutes}
                onChange={(e) => setSlaLimitMinutes(parseInt(e.target.value))}
                className="w-full bg-[#EDE4D6] border border-[#CDBFA7] rounded-lg p-2.5 text-[#3F0D1B] focus:ring-1 focus:ring-[#3F0D1B]"
              >
                <option value={15}>15 Minutes (Critical SCADA)</option>
                <option value={60}>60 Minutes (Tier 1 Banking)</option>
                <option value={120}>2 Hours (Enterprise SOC)</option>
                <option value={360}>6 Hours (CERT-In Mandatory)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#CDBFA7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#EDE4D6] hover:bg-[#D8CBB5] text-[#3F0D1B] font-medium border border-[#CDBFA7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#3F0D1B] hover:bg-[#5C1D2D] text-[#FAF6EE] font-bold tracking-wide shadow-md shadow-[#3F0D1B]/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <Plus size={16} weight="bold" />
              <span>Enqueue & Recalculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
