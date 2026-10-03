// Data types for Cyber Incident Response Planner (CyberCPR)

export type NodeStatus = 'healthy' | 'compromised' | 'quarantined' | 'isolated' | 'mitigated';

export type NodeType = 'database' | 'auth_server' | 'api_gateway' | 'workstation' | 'firewall' | 'scada_plc' | 'cloud_service';

export interface SystemNode {
  id: string;
  name: string;
  type: NodeType;
  ip: string;
  subnet: string;
  criticality: number; // 1 (low) to 10 (mission critical)
  status: NodeStatus;
  x: number;
  y: number;
  incidentId?: string;
  operatingCost: number; // Disruption cost per minute if isolated
  forensicValue: number; // Evidence value 1 to 10
  dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  protocol: 'TCP' | 'UDP' | 'HTTPS' | 'gRPC' | 'Modbus';
  port: number;
  weight: number; // Containment / disconnection cost or network resistance
  isDependency: boolean; // source depends on target
  isActive: boolean;
  isSevered?: boolean;
}

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Incident {
  id: string;
  targetNodeId: string;
  title: string;
  cve: string;
  cvss: number; // 0.0 to 10.0
  severity: IncidentSeverity;
  attackVector: 'Lateral Movement' | 'Ransomware Encryption' | 'Credential Dumping' | 'Zero-Day RCE' | 'Data Exfiltration';
  discoveredMinutesAgo: number;
  slaLimitMinutes: number; // e.g. CERT-In 6-hour (360 min) or internal 60 min SLA
  rawPriorityScore?: number;
}

export interface HeapNode {
  incident: Incident;
  score: number;
  nodeName: string;
  criticality: number;
  cascadingImpact: number;
  formulaBreakdown: {
    cvssWeighted: number;
    criticalityWeighted: number;
    cascadeWeighted: number;
    slaUrgencyWeighted: number;
  };
}

export interface AlgorithmStep {
  stepNumber: number;
  title: string;
  algorithm: 'PriorityQueue' | 'KahnTopological' | 'BFS_BlastRadius' | 'Dijkstra' | 'AStar' | 'CycleDetection';
  description: string;
  activeNodeIds: string[];
  frontierNodeIds?: string[];
  visitedNodeIds?: string[];
  severedEdgeIds?: string[];
  heapState?: HeapNode[];
  inDegreeTable?: Record<string, number>;
  distanceTable?: Record<string, number>;
  optimalRoute?: string[];
  containmentCost?: number;
}

export interface Scenario {
  id: string;
  name: string;
  industry: 'Fintech Core Banking' | 'Healthcare Hospital Network' | 'Critical Infrastructure / SCADA';
  description: string;
  nodes: SystemNode[];
  edges: SystemEdge[];
  incidents: Incident[];
  threatActor: string;
}

export interface BenchmarkMetrics {
  algorithmName: string;
  category: 'Priority Queue' | 'Graph Traversal' | 'Shortest Path';
  timeComplexity: string;
  spaceComplexity: string;
  executionTimeMs: number;
  stepsCount: number;
  containmentCost: number; // Normalized cost score
  cascadingDamagePrevented: number; // Percentage 0-100
  slaAdherenceRate: number; // Percentage 0-100
  verdict: string;
}
