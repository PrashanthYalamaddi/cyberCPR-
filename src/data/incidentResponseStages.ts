export interface StageTelemetryMetric {
  label: string;
  value: string;
}

export interface IncidentResponseStage {
  id: number;
  stageNumber: string;
  badge: string;
  category: string;
  title: string;
  explanation: string;
  displayPoints: string[];
  visualDescription: string;
  statusTag: string;
  statusColor: string;
  telemetryMetrics: StageTelemetryMetric[];
  camera: {
    pos: [number, number, number];
    lookAt: [number, number, number];
    arcOffset: [number, number, number];
  };
}

export const INCIDENT_RESPONSE_STAGES: IncidentResponseStage[] = [
  {
    id: 1,
    stageNumber: '01',
    badge: 'STAGE 01 / 07',
    category: 'DETECTION PHASE',
    title: 'Threat Detected',
    explanation:
      'An unusual activity has been detected within the network. The incident response process begins with identifying potential threats.',
    displayPoints: [
      'Threat detected',
      'Suspicious login activity',
      'Unusual network traffic',
      'Security alert generated'
    ],
    visualDescription:
      'Futuristic security monitoring dashboard with red threat indicators and expanding digital alert rings.',
    statusTag: 'CRITICAL ALERT',
    statusColor: '#E05A47',
    telemetryMetrics: [
      { label: 'Anomaly Index', value: '94.8%' },
      { label: 'Ingress Vector', value: 'Edge Proxy : Port 443' },
      { label: 'Alert Tier', value: 'P1 Urgent' }
    ],
    camera: {
      pos: [8.5, 6.2, 14.5],
      lookAt: [0, 0.4, 0],
      arcOffset: [2, 3, 2]
    }
  },
  {
    id: 2,
    stageNumber: '02',
    badge: 'STAGE 02 / 07',
    category: 'TRIAGE & FORENSICS',
    title: 'Identification & Analysis',
    explanation:
      'Security analysts investigate the alert to determine its severity, scope, and potential impact.',
    displayPoints: [
      'Analyze system logs',
      'Identify affected assets',
      'Determine attack vector',
      'Classify incident severity'
    ],
    visualDescription:
      'Digital investigation interface with floating holographic log matrices, IP telemetry, and attack patterns.',
    statusTag: 'FORENSIC TRIAGE',
    statusColor: '#D8CBB5',
    telemetryMetrics: [
      { label: 'Ingested Logs', value: '1,840 pkts/s' },
      { label: 'Asset Scope', value: 'Gateway + Identity' },
      { label: 'Severity Score', value: 'CVSS 8.9 High' }
    ],
    camera: {
      pos: [-6.8, 4.5, 9.8],
      lookAt: [-1.2, 0.6, 0.2],
      arcOffset: [-3, 2.5, 1.5]
    }
  },
  {
    id: 3,
    stageNumber: '03',
    badge: 'STAGE 03 / 07',
    category: 'CONTAINMENT PHASE',
    title: 'Incident Containment',
    explanation:
      'Contain the threat to prevent it from spreading to other systems.',
    displayPoints: [
      'Isolate compromised devices',
      'Block malicious connections',
      'Disable affected accounts',
      'Prevent lateral movement'
    ],
    visualDescription:
      'Interactive 3D network map isolating the compromised node with hexagonal digital barriers and severed links.',
    statusTag: 'ACTIVE ISOLATION',
    statusColor: '#F59E0B',
    telemetryMetrics: [
      { label: 'Lateral Spread', value: '0% (Halted)' },
      { label: 'Severed Conduits', value: '4 Cut Paths' },
      { label: 'Quarantine Gate', value: 'Engaged' }
    ],
    camera: {
      pos: [0.1, 13.5, 15.8],
      lookAt: [0, 0.2, 0],
      arcOffset: [0, 4, 3]
    }
  },
  {
    id: 4,
    stageNumber: '04',
    badge: 'STAGE 04 / 07',
    category: 'ERADICATION PHASE',
    title: 'Eradication',
    explanation:
      'Remove the root cause of the incident and eliminate malicious components from affected systems.',
    displayPoints: [
      'Remove malware',
      'Eliminate persistence mechanisms',
      'Patch vulnerabilities',
      'Remove unauthorized access'
    ],
    visualDescription:
      'Close orbital rotation around infected system as high-intensity laser sweeps purge malware particles.',
    statusTag: 'PURGE & SANITIZE',
    statusColor: '#D8CBB5',
    telemetryMetrics: [
      { label: 'Purged Artifacts', value: '26 Signatures' },
      { label: 'Persistence Keys', value: '0 Remaining' },
      { label: 'CVE Mitigated', value: 'CVE-2024-912' }
    ],
    camera: {
      pos: [-4.6, 3.4, 7.8],
      lookAt: [0, 0.3, 0],
      arcOffset: [-2, 1.8, 2]
    }
  },
  {
    id: 5,
    stageNumber: '05',
    badge: 'STAGE 05 / 07',
    category: 'RECOVERY PHASE',
    title: 'System Recovery',
    explanation:
      'Restore affected systems to normal operation while verifying that they are secure.',
    displayPoints: [
      'Restore clean backups',
      'Validate system integrity',
      'Monitor network activity',
      'Confirm secure operations'
    ],
    visualDescription:
      'Futuristic restoration environment with clean backup streams, reconnected conduits, and green health indicators.',
    statusTag: 'RESTORE VERIFIED',
    statusColor: '#52B788',
    telemetryMetrics: [
      { label: 'Backup State', value: 'Clean Image v4.2' },
      { label: 'Service Uptime', value: '99.98%' },
      { label: 'Node Health', value: '100% Operational' }
    ],
    camera: {
      pos: [7.2, 5.8, 12.4],
      lookAt: [1.2, 0.5, -0.8],
      arcOffset: [2.5, 2.5, 1.5]
    }
  },
  {
    id: 6,
    stageNumber: '06',
    badge: 'STAGE 06 / 07',
    category: 'POST-MORTEM & AUDIT',
    title: 'Post-Incident Review',
    explanation:
      'Review the incident to understand its root cause, response effectiveness, and opportunities for improvement.',
    displayPoints: [
      'Document incident timeline',
      'Identify security gaps',
      'Evaluate response effectiveness',
      'Record lessons learned'
    ],
    visualDescription:
      '3D digital timeline reconstructing the attack sequence, response milestones, and forensic conclusions.',
    statusTag: 'TIMELINE AUDIT',
    statusColor: '#D8CBB5',
    telemetryMetrics: [
      { label: 'MTTD (Detect)', value: '2.1 minutes' },
      { label: 'MTTC (Contain)', value: '5.8 minutes' },
      { label: 'Audit Compliance', value: 'NIST 800-61 Pass' }
    ],
    camera: {
      pos: [-11.2, 7.4, 13.6],
      lookAt: [-0.8, 0.2, 0.8],
      arcOffset: [-3, 3, 2]
    }
  },
  {
    id: 7,
    stageNumber: '07',
    badge: 'STAGE 07 / 07',
    category: 'DEFENSE REINFORCEMENT',
    title: 'Security Reinforcement',
    explanation:
      'Strengthen defenses and update the incident response plan to reduce the risk of future attacks.',
    displayPoints: [
      'Improve security controls',
      'Update response procedures',
      'Strengthen monitoring',
      'Conduct security training'
    ],
    visualDescription:
      'Panoramic pull-back revealing a multi-layer geodesic orbital protective shield activated around the network.',
    statusTag: 'FORTRESS ACTIVE',
    statusColor: '#FAF6EE',
    telemetryMetrics: [
      { label: 'Defense Score', value: '99.8%' },
      { label: 'Shield Integrity', value: 'Maximum Lock' },
      { label: 'Readiness Index', value: 'Gold Certified' }
    ],
    camera: {
      pos: [0, 16.5, 28.5],
      lookAt: [0, 0, 0],
      arcOffset: [0, 5, 4]
    }
  }
];

export interface HeroPhaseInfo {
  id: number;
  label: string;
  badge: string;
  description: string;
}

export const HERO_PHASES: HeroPhaseInfo[] = INCIDENT_RESPONSE_STAGES.map((s) => ({
  id: s.id,
  label: s.title,
  badge: s.badge,
  description: s.explanation
}));

