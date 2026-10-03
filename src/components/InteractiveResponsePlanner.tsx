import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldWarning,
  CheckCircle,
  FileText,
  Clock,
  ArrowsClockwise,
  LockKey,
  Database,
  Lightning,
  Sparkle,
  Copy,
  DownloadSimple,
  Sliders
} from '@phosphor-icons/react';

export type ThreatType = 'ransomware' | 'phishing' | 'databreach' | 'ddos' | 'malware';

interface WorkflowPhase {
  id: string;
  title: string;
  timeframe: string;
  items: { text: string; completedDefault: boolean }[];
  daaNote: string;
}

interface ThreatProfile {
  type: ThreatType;
  title: string;
  actor: string;
  cvss: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  slaMinutes: number;
  impactedSystems: string[];
  vector: string;
  mitreTTP: string;
  pqScoreFormula: string;
  pqScoreValue: number;
  workflowPhases: WorkflowPhase[];
}

const THREAT_PROFILES: Record<ThreatType, ThreatProfile> = {
  ransomware: {
    type: 'ransomware',
    title: 'Ransomware Outbreak',
    actor: 'DarkSide / FIN7 Affiliate',
    cvss: 9.8,
    severity: 'CRITICAL',
    slaMinutes: 15,
    impactedSystems: ['Payment Gateway', 'Customer DB', 'Storage SAN'],
    vector: 'Compromised VPN credentials with PsExec lateral spread',
    mitreTTP: 'T1486 (Data Encrypted for Impact), T1021.002 (SMB/Windows Admin Shares)',
    pqScoreFormula: '(CVSS 9.8 * 10) + (SLA 15m * 1.5) + (3 Critical Dependencies * 8)',
    pqScoreValue: 144.5,
    workflowPhases: [
      {
        id: 'immediate',
        title: 'Immediate Actions (0 - 15 min)',
        timeframe: 'Immediate SLA: 15 min',
        daaNote: 'Priority Queue orders this incident as root of the Max-Heap due to active encryption velocity.',
        items: [
          { text: 'Isolate compromised Payment Gateway via Dijkstra minimal-cut edge severing.', completedDefault: true },
          { text: 'Revoke active Kerberos ticket granting tokens (TGT) and enterprise VPN sessions.', completedDefault: true },
          { text: 'Take immutable memory snapshots of affected hosts before power cycling.', completedDefault: false },
          { text: 'Engage legal counsel and regulatory incident notification dispatchers.', completedDefault: false }
        ]
      },
      {
        id: 'investigation',
        title: 'Investigation & Blast Radius',
        timeframe: 'Hours 0 - 2',
        daaNote: 'BFS traversal computes 3-hop blast radius across all SAN connected nodes.',
        items: [
          { text: 'Inspect Domain Controller event log 4624 (type 3 logon) for lateral credential spread.', completedDefault: true },
          { text: 'Analyze file integrity monitoring telemetry to calculate encryption boundary.', completedDefault: false },
          { text: 'Query SIEM for outbound DNS tunneling and C2 heartbeat indicators.', completedDefault: false }
        ]
      },
      {
        id: 'containment',
        title: 'Containment Protocols',
        timeframe: 'Hours 2 - 4',
        daaNote: 'Kahn DAG verification isolates storage volumes without creating circular system lockups.',
        items: [
          { text: 'Enforce VLAN micro-segmentation around customer database clusters.', completedDefault: true },
          { text: 'Block adversarial C2 IP addresses and hashes at perimeter edge proxies.', completedDefault: true },
          { text: 'Verify cold air-gapped backup catalog integrity and immutability locks.', completedDefault: false }
        ]
      },
      {
        id: 'recovery',
        title: 'Recovery & Service Boot',
        timeframe: 'Hours 4 - 8',
        daaNote: 'Reverse topological order boots authentication tier first, then database, then API gateway.',
        items: [
          { text: 'Restore clean system images from verified offline snapshots.', completedDefault: false },
          { text: 'Rotate all enterprise database connection secrets and administrative passwords.', completedDefault: false },
          { text: 'Perform cryptographic integrity audits before routing external traffic.', completedDefault: false }
        ]
      },
      {
        id: 'review',
        title: 'Post-Incident Review',
        timeframe: 'Day 1 - 3',
        daaNote: 'Generates NIST SP 800-61 / CERT-In compliance audit report automatically.',
        items: [
          { text: 'Assemble complete timeline audit trail with cryptographic timestamps.', completedDefault: false },
          { text: 'Publish executive briefing and customer advisory communications.', completedDefault: false },
          { text: 'Patch VPN zero-day vulnerability and enforce mandatory hardware FIDO2 MFA.', completedDefault: false }
        ]
      }
    ]
  },
  phishing: {
    type: 'phishing',
    title: 'Executive Spear-Phishing & Session Hijacking',
    actor: 'Cozy Bear / APT29',
    cvss: 8.4,
    severity: 'HIGH',
    slaMinutes: 30,
    impactedSystems: ['Identity Provider', 'Executive Mailbox', 'SSO Portal'],
    vector: 'Reverse proxy AitM phishing capturing OAuth session cookies',
    mitreTTP: 'T1566.002 (Spearphishing Link), T1539 (Steal Web Session Cookie)',
    pqScoreFormula: '(CVSS 8.4 * 10) + (SLA 30m * 1.5) + (2 Critical Dependencies * 8)',
    pqScoreValue: 125.0,
    workflowPhases: [
      {
        id: 'immediate',
        title: 'Immediate Actions (0 - 30 min)',
        timeframe: 'Immediate SLA: 30 min',
        daaNote: 'Priority Queue places session revocation in top priority tier to thwart token replay.',
        items: [
          { text: 'Terminate all active IdP session tokens and OAuth refresh grants for targeted user.', completedDefault: true },
          { text: 'Block phishing domain and reverse proxy hosting infrastructure at DNS sinkhole.', completedDefault: true },
          { text: 'Force password and MFA seed regeneration under hardware supervision.', completedDefault: false }
        ]
      },
      {
        id: 'investigation',
        title: 'Investigation & Blast Radius',
        timeframe: 'Hours 0 - 2',
        daaNote: 'Graph traversal checks cross-tenant mail forwarding and API consent permissions.',
        items: [
          { text: 'Audit mail forwarding inbox rules (Rule 0x04 stealth exfiltration).', completedDefault: true },
          { text: 'Enumerate OAuth multi-tenant applications granted permissions in Azure/Okta.', completedDefault: false },
          { text: 'Review cloud audit logs for anomalous geo-location IP access spikes.', completedDefault: false }
        ]
      },
      {
        id: 'containment',
        title: 'Containment Protocols',
        timeframe: 'Hours 2 - 4',
        daaNote: 'Isolates user identity tier while preserving normal departmental workflows.',
        items: [
          { text: 'Quarantine all emails originating from the malicious campaign domain.', completedDefault: true },
          { text: 'Disable compromised user API tokens across internal microservices.', completedDefault: false }
        ]
      },
      {
        id: 'recovery',
        title: 'Recovery & Service Boot',
        timeframe: 'Hours 4 - 6',
        daaNote: 'Verifies zero token residue before re-enabling SSO access.',
        items: [
          { text: 'Re-issue hardware security keys (FIDO2 WebAuthn).', completedDefault: false },
          { text: 'Restore mailbox inbox rules to known-good baseline configuration.', completedDefault: false }
        ]
      },
      {
        id: 'review',
        title: 'Post-Incident Review',
        timeframe: 'Day 1 - 2',
        daaNote: 'Updates threat intel feed and employee awareness simulation telemetry.',
        items: [
          { text: 'Document adversary AitM architecture and share IOCs with ISAC community.', completedDefault: false },
          { text: 'Enforce FIDO2 phishing-resistant conditional access policies company-wide.', completedDefault: false }
        ]
      }
    ]
  },
  databreach: {
    type: 'databreach',
    title: 'Customer Data Breach & Exfiltration',
    actor: 'Lapsus$ Extortion Syndicate',
    cvss: 9.4,
    severity: 'CRITICAL',
    slaMinutes: 20,
    impactedSystems: ['Core Database Cluster', 'S3 Exfiltration Bucket', 'API Gateway'],
    vector: 'SQL Injection chained with cloud role privilege escalation',
    mitreTTP: 'T1190 (Exploit Public-Facing App), T1567 (Exfiltration to Cloud Storage)',
    pqScoreFormula: '(CVSS 9.4 * 10) + (SLA 20m * 1.5) + (4 Critical Dependencies * 8)',
    pqScoreValue: 146.0,
    workflowPhases: [
      {
        id: 'immediate',
        title: 'Immediate Actions (0 - 20 min)',
        timeframe: 'Immediate SLA: 20 min',
        daaNote: 'Binary Max-Heap marks data containment cut as highest emergency triage priority.',
        items: [
          { text: 'Sever outbound network routes from primary database cluster to untrusted public IP ranges.', completedDefault: true },
          { text: 'Rotate Master Database encryption keys (KMS) and administrative credentials.', completedDefault: true },
          { text: 'Block adversary extraction buckets at egress proxy tier.', completedDefault: false }
        ]
      },
      {
        id: 'investigation',
        title: 'Investigation & Blast Radius',
        timeframe: 'Hours 0 - 3',
        daaNote: 'BFS dependency traversal correlates SQL query logs with exfiltrated byte counts.',
        items: [
          { text: 'Reconstruct SQL injection query parameters from WAF and database audit logs.', completedDefault: true },
          { text: 'Quantify exact volume and nature of exfiltrated PII/financial customer records.', completedDefault: false },
          { text: 'Analyze cloud storage access logs for adversary IP ingress points.', completedDefault: false }
        ]
      },
      {
        id: 'containment',
        title: 'Containment Protocols',
        timeframe: 'Hours 3 - 6',
        daaNote: 'Dijkstra minimal-cut preserves read-only replication while terminating write queries.',
        items: [
          { text: 'Deploy hotfix WAF virtual patch for vulnerable API endpoint.', completedDefault: true },
          { text: 'Place database cluster into read-only quarantine replication mode.', completedDefault: false }
        ]
      },
      {
        id: 'recovery',
        title: 'Recovery & Service Boot',
        timeframe: 'Hours 6 - 12',
        daaNote: 'Topological verification ensures database integrity before returning to production traffic.',
        items: [
          { text: 'Validate database transaction log integrity against cold replica backups.', completedDefault: false },
          { text: 'Re-enable production routing following peer code audit of patched endpoint.', completedDefault: false }
        ]
      },
      {
        id: 'review',
        title: 'Post-Incident Review',
        timeframe: 'Day 1 - 7',
        daaNote: 'Meets mandatory GDPR 72-hour and SEC 4-day material incident disclosure rules.',
        items: [
          { text: 'File official regulatory notifications with data protection supervisory authorities.', completedDefault: false },
          { text: 'Notify impacted consumers with identity protection and credit monitoring resources.', completedDefault: false }
        ]
      }
    ]
  },
  ddos: {
    type: 'ddos',
    title: 'Volumetric Multi-Vector DDoS Flood',
    actor: 'Anonymous Sudan / Killnet Botnet',
    cvss: 7.5,
    severity: 'MEDIUM',
    slaMinutes: 45,
    impactedSystems: ['Edge Anycast BGP', 'Load Balancer Cluster', 'Public Web Gateway'],
    vector: 'Amplified UDP DNS reflection paired with HTTP/2 Rapid Reset flood',
    mitreTTP: 'T1498.001 (Direct Network Flood), T1499.003 (HTTP Flood)',
    pqScoreFormula: '(CVSS 7.5 * 10) + (SLA 45m * 1.5) + (1 Critical Dependency * 8)',
    pqScoreValue: 100.5,
    workflowPhases: [
      {
        id: 'immediate',
        title: 'Immediate Actions (0 - 45 min)',
        timeframe: 'Immediate SLA: 45 min',
        daaNote: 'Priority Queue manages DDoS scrubbing while maintaining critical transaction routes.',
        items: [
          { text: 'Engage Tier-1 upstream transit provider BGP blackholing for targeted /32 host.', completedDefault: true },
          { text: 'Activate Cloudflare/Akamai scrubbing center Anycast route redirection.', completedDefault: true },
          { text: 'Enable rate-limiting and challenge mode on API endpoints.', completedDefault: false }
        ]
      },
      {
        id: 'investigation',
        title: 'Investigation & Blast Radius',
        timeframe: 'Hours 0 - 1',
        daaNote: 'Traffic graph analysis separates authentic customer sessions from bot signatures.',
        items: [
          { text: 'Inspect NetFlow telemetry to identify peak Gbps and pps amplification factors.', completedDefault: true },
          { text: 'Profile HTTP/2 reset frame headers to isolate botnet user-agent strings.', completedDefault: false }
        ]
      },
      {
        id: 'containment',
        title: 'Containment Protocols',
        timeframe: 'Hours 1 - 2',
        daaNote: 'Preserves internal microservice traffic by shedding edge gateway overload.',
        items: [
          { text: 'Deploy custom edge filtering rules dropping malicious UDP reflection packets.', completedDefault: true },
          { text: 'Scale load-balancer autoscaling groups across backup cloud regions.', completedDefault: false }
        ]
      },
      {
        id: 'recovery',
        title: 'Recovery & Service Boot',
        timeframe: 'Hours 2 - 4',
        daaNote: 'Gradually relaxes scrubbing thresholds as flood traffic subsides.',
        items: [
          { text: 'Gradually withdraw upstream BGP blackhole advertisements.', completedDefault: false },
          { text: 'Verify latency and packet loss metrics return to baseline < 25ms.', completedDefault: false }
        ]
      },
      {
        id: 'review',
        title: 'Post-Incident Review',
        timeframe: 'Day 1 - 2',
        daaNote: 'Calculates financial cost of downtime and edge transit overage bandwidth.',
        items: [
          { text: 'Review CDN scrubbing SLA metrics and refine automated edge response thresholds.', completedDefault: false },
          { text: 'Update edge firewall rules to permanently throttle UDP reflection vectors.', completedDefault: false }
        ]
      }
    ]
  },
  malware: {
    type: 'malware',
    title: 'Lateral Worm Propagation & Kernel Exploit',
    actor: 'Volt Typhoon Cyber Unit',
    cvss: 8.9,
    severity: 'HIGH',
    slaMinutes: 25,
    impactedSystems: ['Hypervisor Cluster', 'Domain Controller', 'Internal File Server'],
    vector: 'Zero-day privilege escalation into BYOVD (Bring Your Own Vulnerable Driver)',
    mitreTTP: 'T1068 (Exploitation for Privilege Escalation), T1021 (Remote Services)',
    pqScoreFormula: '(CVSS 8.9 * 10) + (SLA 25m * 1.5) + (3 Critical Dependencies * 8)',
    pqScoreValue: 130.5,
    workflowPhases: [
      {
        id: 'immediate',
        title: 'Immediate Actions (0 - 25 min)',
        timeframe: 'Immediate SLA: 25 min',
        daaNote: 'Priority Queue triggers immediate hypervisor cut to halt worm propagation.',
        items: [
          { text: 'Sever physical switch trunk ports connecting affected hypervisor rack.', completedDefault: true },
          { text: 'Revoke local administrative credentials and block SMB port 445 cross-subnet.', completedDefault: true },
          { text: 'Deploy endpoint detection containment isolation on all infected workstations.', completedDefault: false }
        ]
      },
      {
        id: 'investigation',
        title: 'Investigation & Blast Radius',
        timeframe: 'Hours 0 - 2',
        daaNote: 'BFS blast radius maps all systems that established RPC sessions with Patient Zero.',
        items: [
          { text: 'Extract malicious kernel driver memory dumps for static and dynamic malware triage.', completedDefault: true },
          { text: 'Query EDR for process injection into svchost.exe and lsass.exe.', completedDefault: false }
        ]
      },
      {
        id: 'containment',
        title: 'Containment Protocols',
        timeframe: 'Hours 2 - 4',
        daaNote: 'Dijkstra shortest path isolates Domain Controller from lateral infection vectors.',
        items: [
          { text: 'Apply driver blocklist policy preventing unsigned kernel module execution.', completedDefault: true },
          { text: 'Quarantine infected host images into an air-gapped forensic VLAN.', completedDefault: false }
        ]
      },
      {
        id: 'recovery',
        title: 'Recovery & Service Boot',
        timeframe: 'Hours 4 - 8',
        daaNote: 'Reverse Kahn boot sequence verifies clean kernel hashes before reconnecting cluster.',
        items: [
          { text: 'Re-image affected hypervisor nodes with verified golden master images.', completedDefault: false },
          { text: 'Enable Secure Boot and Memory Integrity (HVCI) across all bare-metal nodes.', completedDefault: false }
        ]
      },
      {
        id: 'review',
        title: 'Post-Incident Review',
        timeframe: 'Day 1 - 3',
        daaNote: 'Shares IOC driver hashes with Microsoft Security Response Center and CERT-In.',
        items: [
          { text: 'Publish root cause advisory detailing driver exploitation mechanics.', completedDefault: false },
          { text: 'Audit all third-party software agents installed across the server fleet.', completedDefault: false }
        ]
      }
    ]
  }
};

interface InteractiveResponsePlannerProps {
  onSimulateInConsole?: (threatType: ThreatType) => void;
  onOpenPlanner?: () => void;
}

export const InteractiveResponsePlanner: React.FC<InteractiveResponsePlannerProps> = ({
  onSimulateInConsole,
  onOpenPlanner
}) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatType>('ransomware');
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const profile = THREAT_PROFILES[selectedThreat];
  const activePhase = profile.workflowPhases[activePhaseIndex] || profile.workflowPhases[0];

  const handleToggleItem = (itemKey: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const handleCopyPlaybook = () => {
    const markdownContent = `# CYBERCPR INCIDENT RESPONSE PLAYBOOK: ${profile.title.toUpperCase()}
- Classification: ${profile.title}
- Threat Actor: ${profile.actor}
- CVSS Severity: ${profile.cvss} (${profile.severity})
- Target SLA: ${profile.slaMinutes} minutes
- MITRE ATT&CK: ${profile.mitreTTP}
- Priority Queue Score: ${profile.pqScoreValue} [${profile.pqScoreFormula}]

## 1. IMMEDIATE ACTIONS
${profile.workflowPhases[0].items.map((i) => `- [ ] ${i.text}`).join('\n')}

## 2. INVESTIGATION & BLAST RADIUS
${profile.workflowPhases[1].items.map((i) => `- [ ] ${i.text}`).join('\n')}

## 3. CONTAINMENT PROTOCOLS
${profile.workflowPhases[2].items.map((i) => `- [ ] ${i.text}`).join('\n')}

## 4. RECOVERY & RESTORATION
${profile.workflowPhases[3].items.map((i) => `- [ ] ${i.text}`).join('\n')}

## 5. POST-INCIDENT REVIEW
${profile.workflowPhases[4].items.map((i) => `- [ ] ${i.text}`).join('\n')}
`;

    navigator.clipboard.writeText(markdownContent);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2400);
  };

  return (
    <section id="interactive-planner" className="w-full bg-[#EDE4D6] text-[#3F0D1B] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#CDBFA7]">
      <div className="max-w-[1400px] w-full mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#CDBFA7] text-[#3F0D1B]">
              <span className="w-2 h-2 rounded-full bg-[#3F0D1B]" />
              <span className="font-mono text-xs uppercase tracking-widest font-semibold text-[#3F0D1B]">
                Dynamic Incident Workflows
              </span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#3F0D1B] leading-tight">
              Plan for the Unexpected.
            </h2>

            <p className="text-base sm:text-lg text-[#521A27] leading-relaxed">
              Select any cyber incident archetype to generate an orchestrated, algorithmically sequenced response workflow complete with priority rankings and containment cut orders.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {onOpenPlanner && (
              <button
                onClick={onOpenPlanner}
                className="px-5 py-2.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F0EDE7] text-[#3F0D1B] font-bold text-xs border border-[#CDBFA7] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <ShieldCheck size={16} className="text-[#3F0D1B]" weight="fill" />
                <span>Open Incident Planner</span>
              </button>
            )}

            <button
              onClick={handleCopyPlaybook}
              className="px-5 py-2.5 rounded-xl bg-[#3F0D1B] hover:bg-[#4C1222] text-[#FAF6EE] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle size={16} className="text-[#D8CBB5]" />
                  <span>Playbook Copied</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-[#D8CBB5]" />
                  <span>Export Playbook (Markdown)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Threat Type Selector Buttons */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {(['ransomware', 'phishing', 'databreach', 'ddos', 'malware'] as ThreatType[]).map((type) => {
            const isSelected = selectedThreat === type;
            const p = THREAT_PROFILES[type];
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedThreat(type);
                  setActivePhaseIndex(0);
                }}
                className={`px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#3F0D1B] text-[#FAF6EE] shadow-md'
                    : 'bg-[#FAF6EE] text-[#3F0D1B] hover:bg-[#E2D5C0] border border-[#CDBFA7]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#D8CBB5]' : 'bg-[#3F0D1B]'}`} />
                <span className="capitalize">{type}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  isSelected ? 'bg-[#2C0712] text-[#D8CBB5]' : 'bg-[#EDE4D6] text-[#3F0D1B]'
                }`}>
                  CVSS {p.cvss}
                </span>
              </button>
            );
          })}
        </div>

        {/* Threat Summary Card (Editorial & Algorithmic Telemetry on Aged Ivory) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6EE] border border-[#CDBFA7] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Metadata */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-[#3F0D1B] text-[#FAF6EE] font-mono text-xs font-bold">
                  {profile.severity} SEVERITY
                </span>
                <span className="text-xs font-mono text-[#521A27]">
                  Actor: <strong className="text-[#3F0D1B]">{profile.actor}</strong>
                </span>
                <span className="text-[#CDBFA7]">|</span>
                <span className="text-xs font-mono text-[#521A27]">
                  Target Containment SLA: <strong className="text-[#3F0D1B]">{profile.slaMinutes} minutes</strong>
                </span>
              </div>

              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#3F0D1B]">
                {profile.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#EDE4D6] border border-[#CDBFA7]">
                  <span className="text-[#521A27] block">Primary Attack Vector:</span>
                  <span className="font-semibold text-[#3F0D1B] mt-1 block">{profile.vector}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#EDE4D6] border border-[#CDBFA7]">
                  <span className="text-[#521A27] block">MITRE ATT&CK Mapping:</span>
                  <span className="font-semibold text-[#3F0D1B] mt-1 block">{profile.mitreTTP}</span>
                </div>
              </div>
            </div>

            {/* Right: DAA Priority Score Formula Badge */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#EDE4D6] border border-[#CDBFA7] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#521A27] font-bold">
                  DAA Priority Score
                </span>
                <Lightning size={18} className="text-[#3F0D1B]" />
              </div>

              <div className="font-mono text-3xl font-extrabold text-[#3F0D1B]">
                {profile.pqScoreValue.toFixed(1)}
              </div>

              <div className="text-[11px] font-mono text-[#3F0D1B] bg-[#FAF6EE] p-2 rounded-lg border border-[#CDBFA7] leading-relaxed">
                <code>{profile.pqScoreFormula}</code>
              </div>

              <div className="text-[11px] text-[#521A27]">
                Priority Queue ranks this incident into the active Max-Heap root tier for containment.
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Phase Step Tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[#CDBFA7] pb-3">
            {profile.workflowPhases.map((phase, idx) => (
              <button
                key={phase.id}
                onClick={() => setActivePhaseIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activePhaseIndex === idx
                    ? 'bg-[#3F0D1B] text-[#FAF6EE] shadow-sm'
                    : 'bg-[#FAF6EE] text-[#521A27] hover:bg-[#E2D5C0] border border-[#CDBFA7]'
                }`}
              >
                <span className={activePhaseIndex === idx ? 'text-[#D8CBB5]' : 'text-[#3F0D1B]'}>
                  0{idx + 1}
                </span>
                <span>{phase.title.split(' (')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Phase Card with Actionable Checkbox Tasks */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6EE] border border-[#CDBFA7] space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CDBFA7] pb-4">
              <div>
                <h4 className="font-editorial text-xl sm:text-2xl font-bold text-[#3F0D1B]">
                  {activePhase.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={15} className="text-[#3F0D1B]" />
                  <span className="text-xs font-mono font-medium text-[#521A27]">
                    {activePhase.timeframe}
                  </span>
                </div>
              </div>

              {/* DAA Algorithmic Grounding Note */}
              <div className="p-2.5 rounded-xl bg-[#EDE4D6] border border-[#CDBFA7] text-xs font-mono text-[#3F0D1B] max-w-md">
                <span className="font-bold text-[#3F0D1B]">DAA Engine: </span>
                <span className="text-[#521A27]">{activePhase.daaNote}</span>
              </div>
            </div>

            {/* Checkable Task List */}
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#521A27] font-bold block">
                Standard Operating Procedures ({activePhase.items.length} Directives)
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {activePhase.items.map((item, iIdx) => {
                  const key = `${selectedThreat}-${activePhase.id}-${iIdx}`;
                  const isChecked = checkedItems[key] ?? item.completedDefault;
                  return (
                    <div
                      key={iIdx}
                      onClick={() => handleToggleItem(key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-[#EDE4D6] border-[#3F0D1B]/40 text-[#3F0D1B]'
                          : 'bg-[#EDE4D6]/60 border-[#CDBFA7] text-[#521A27] hover:border-[#3F0D1B]/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleItem(key)}
                        className="mt-0.5 w-4 h-4 rounded text-[#3F0D1B] focus:ring-[#3F0D1B] cursor-pointer accent-[#3F0D1B]"
                      />
                      <div className="space-y-0.5">
                        <span className={`text-sm ${isChecked ? 'font-medium text-[#3F0D1B]' : 'line-through text-[#7E5762]'}`}>
                          {item.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
