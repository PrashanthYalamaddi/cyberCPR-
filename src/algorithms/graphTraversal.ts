import { SystemNode, SystemEdge, AlgorithmStep } from '../types';

/**
 * Result structure for Topological Containment Ordering
 */
export interface TopologicalResult {
  order: string[]; // Node IDs in safe containment order
  hasCycle: boolean;
  cycleNodes: string[];
  inDegreeHistory: Array<{
    nodeId: string;
    inDegrees: Record<string, number>;
    processedNode: string;
    description: string;
  }>;
  steps: AlgorithmStep[];
}

/**
 * Kahn's Algorithm for Topological Sort on System Dependency Graph
 * Solves: "In what order should affected systems be isolated or patched without crashing dependent downstream services?"
 */
export function runKahnsTopologicalSort(
  nodes: SystemNode[],
  edges: SystemEdge[]
): TopologicalResult {
  const steps: AlgorithmStep[] = [];
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};
  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));

  nodes.forEach(node => {
    inDegree[node.id] = 0;
    adjList[node.id] = [];
  });

  // Build graph for dependencies:
  // If A depends on B (isDependency = true, source = A, target = B),
  // then B must be protected or isolated carefully before A is taken down,
  // or B -> A in isolation order (upstream dependency must be resolved).
  edges.forEach(edge => {
    if (edge.isDependency) {
      // Source depends on Target: Target -> Source dependency flow
      if (!adjList[edge.target]) adjList[edge.target] = [];
      adjList[edge.target].push(edge.source);
      inDegree[edge.source] = (inDegree[edge.source] || 0) + 1;
    }
  });

  const inDegreeHistory: TopologicalResult['inDegreeHistory'] = [];
  const queue: string[] = [];
  const order: string[] = [];

  // Step 1: Initial In-Degree calculation
  nodes.forEach(node => {
    if (inDegree[node.id] === 0) {
      queue.push(node.id);
    }
  });

  steps.push({
    stepNumber: 1,
    title: "Kahn's Algorithm: In-Degree Initialization",
    algorithm: 'KahnTopological',
    description: `Calculated dependency in-degrees for all ${nodes.length} infrastructure nodes. Nodes with In-Degree 0 have no upstream blocking dependencies and can be safely sequenced: [${queue.map(id => nodeMap.get(id)?.name).join(', ')}].`,
    activeNodeIds: [...queue],
    inDegreeTable: { ...inDegree }
  });

  let currentStep = 1;

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    order.push(currentId);
    const currentNode = nodeMap.get(currentId);

    inDegreeHistory.push({
      nodeId: currentId,
      inDegrees: { ...inDegree },
      processedNode: currentNode?.name || currentId,
      description: `Dispatched containment priority to [${currentNode?.name}] (In-degree = 0). Graceful failover initiated.`
    });

    currentStep++;
    const neighbors = adjList[currentId] || [];
    const reducedNeighbors: string[] = [];

    neighbors.forEach(neighborId => {
      inDegree[neighborId]--;
      reducedNeighbors.push(neighborId);
      if (inDegree[neighborId] === 0) {
        queue.push(neighborId);
      }
    });

    steps.push({
      stepNumber: currentStep,
      title: `Topological Drain: ${currentNode?.name}`,
      algorithm: 'KahnTopological',
      description: `Sequenced ${currentNode?.name}. Removed dependency edges to downstream services [${reducedNeighbors.map(id => nodeMap.get(id)?.name).join(', ') || 'none'}]. In-degrees decremented. Ready queue: [${queue.map(id => nodeMap.get(id)?.name).join(', ') || 'empty'}].`,
      activeNodeIds: [currentId],
      frontierNodeIds: [...queue],
      visitedNodeIds: [...order],
      inDegreeTable: { ...inDegree }
    });
  }

  const hasCycle = order.length !== nodes.length;
  const cycleNodes = hasCycle ? nodes.filter(n => !order.includes(n.id)).map(n => n.id) : [];

  if (hasCycle) {
    steps.push({
      stepNumber: currentStep + 1,
      title: "Deadlock Alert: Circular Dependency Cycle Detected",
      algorithm: 'CycleDetection',
      description: `Graph traversal found an unresolved circular dependency among nodes: [${cycleNodes.map(id => nodeMap.get(id)?.name).join(', ')}]. Manual circuit breaker required to break cycle.`,
      activeNodeIds: cycleNodes,
      inDegreeTable: { ...inDegree }
    });
  }

  return {
    order,
    hasCycle,
    cycleNodes,
    inDegreeHistory,
    steps
  };
}

/**
 * Breadth-First Search (BFS) for Lateral Attack Blast Radius & Perimeter Mapping
 */
export interface BlastRadiusResult {
  hopLevels: Record<number, string[]>; // Hop distance -> Node IDs
  containmentPerimeterEdgeIds: string[]; // Edges that cross from compromised/infected zone to clean zone
  steps: AlgorithmStep[];
}

export function runBFSBlastRadius(
  compromisedNodeIds: string[],
  nodes: SystemNode[],
  edges: SystemEdge[]
): BlastRadiusResult {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const hopLevels: Record<number, string[]> = {};
  const nodeHop: Record<string, number> = {};
  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));

  // Adjacency for network traffic
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    adj.get(e.target)?.push(e.source);
  });

  const queue: Array<{ id: string; hop: number }> = [];

  compromisedNodeIds.forEach(id => {
    visited.add(id);
    queue.push({ id, hop: 0 });
    nodeHop[id] = 0;
    if (!hopLevels[0]) hopLevels[0] = [];
    hopLevels[0].push(id);
  });

  steps.push({
    stepNumber: 1,
    title: "BFS Blast Radius: Patient Zero Initialization",
    algorithm: 'BFS_BlastRadius',
    description: `Initiated Breadth-First Search from initial compromised root breach point(s): [${compromisedNodeIds.map(id => nodeMap.get(id)?.name).join(', ')}]. Hop count = 0.`,
    activeNodeIds: [...compromisedNodeIds],
    visitedNodeIds: Array.from(visited)
  });

  let stepCount = 1;

  while (queue.length > 0) {
    const { id, hop } = queue.shift()!;
    const currentNode = nodeMap.get(id);
    const neighbors = adj.get(id) || [];
    const newFrontier: string[] = [];

    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const nextHop = hop + 1;
        nodeHop[neighborId] = nextHop;
        if (!hopLevels[nextHop]) hopLevels[nextHop] = [];
        hopLevels[nextHop].push(neighborId);
        queue.push({ id: neighborId, hop: nextHop });
        newFrontier.push(neighborId);
      }
    });

    if (newFrontier.length > 0) {
      stepCount++;
      steps.push({
        stepNumber: stepCount,
        title: `BFS Expansion: Hop ${hop + 1} Lateral Perimeter`,
        algorithm: 'BFS_BlastRadius',
        description: `Expanded lateral movement wave from ${currentNode?.name}. Reached ${newFrontier.length} adjacent systems at Hop ${hop + 1}: [${newFrontier.map(nid => nodeMap.get(nid)?.name).join(', ')}].`,
        activeNodeIds: [id],
        frontierNodeIds: newFrontier,
        visitedNodeIds: Array.from(visited)
      });
    }
  }

  // Find containment perimeter: edges connecting Hop 0 / Hop 1 (infected/at-risk) to unreached or Hop 2+
  const infectedZone = new Set([...(hopLevels[0] || []), ...(hopLevels[1] || [])]);
  const perimeterEdges: string[] = [];

  edges.forEach(e => {
    const sourceIn = infectedZone.has(e.source);
    const targetIn = infectedZone.has(e.target);
    if ((sourceIn && !targetIn) || (!sourceIn && targetIn)) {
      perimeterEdges.push(e.id);
    }
  });

  steps.push({
    stepNumber: stepCount + 1,
    title: "BFS Blast Radius: Containment Perimeter Established",
    algorithm: 'BFS_BlastRadius',
    description: `Blast radius calculation complete. Identified ${perimeterEdges.length} strategic network segment cut lines separating the infected zone from unaffected crown jewels.`,
    activeNodeIds: Array.from(infectedZone),
    severedEdgeIds: perimeterEdges,
    visitedNodeIds: Array.from(visited)
  });

  return {
    hopLevels,
    containmentPerimeterEdgeIds: perimeterEdges,
    steps
  };
}

/**
 * Depth-First Search for cycle detection and critical paths
 */
export function runDFSCycleDetector(nodes: SystemNode[], edges: SystemEdge[]) {
  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    if (e.isDependency) adj.get(e.source)?.push(e.target);
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(curr: string, path: string[]) {
    visited.add(curr);
    inStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (inStack.has(neighbor)) {
        const cycleStartIndex = path.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          cycles.push(path.slice(cycleStartIndex));
        }
      }
    }

    inStack.delete(curr);
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  });

  return {
    hasCycle: cycles.length > 0,
    cycles,
    cycleNames: cycles.map(c => c.map(id => nodeMap.get(id)?.name || id).join(' -> '))
  };
}
