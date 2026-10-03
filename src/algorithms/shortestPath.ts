import { SystemNode, SystemEdge, AlgorithmStep } from '../types';

export interface PathStepRecord {
  step: number;
  evaluatedNode: string;
  relaxedEdge?: { from: string; to: string; weight: number };
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: string[];
  explanation: string;
}

export interface ShortestPathResult {
  sourceId: string;
  targetId: string;
  path: string[];
  pathNames: string[];
  totalCost: number;
  visitedNodesCount: number;
  edgesCut: string[];
  steps: AlgorithmStep[];
  stepRecords: PathStepRecord[];
}

/**
 * Dijkstra's Algorithm for Least-Disruption Containment Route
 */
export function runDijkstraContainmentPath(
  sourceId: string,
  targetId: string,
  nodes: SystemNode[],
  edges: SystemEdge[]
): ShortestPathResult {
  const steps: AlgorithmStep[] = [];
  const stepRecords: PathStepRecord[] = [];
  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));

  // Adjacency graph with edge weights
  const adj = new Map<string, Array<{ target: string; weight: number; edgeId: string }>>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push({ target: e.target, weight: e.weight, edgeId: e.id });
    adj.get(e.target)?.push({ target: e.source, weight: e.weight, edgeId: e.id });
  });

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();
  const visited = new Set<string>();

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
    unvisited.add(n.id);
  });

  distances[sourceId] = 0;

  steps.push({
    stepNumber: 1,
    title: `Dijkstra: Initialize from ${nodeMap.get(sourceId)?.name}`,
    algorithm: 'Dijkstra',
    description: `Initialized distance table. Set Source [${nodeMap.get(sourceId)?.name}] distance to 0, all other nodes to Infinity. Evaluating least disruption route to ${nodeMap.get(targetId)?.name}.`,
    activeNodeIds: [sourceId],
    distanceTable: { ...distances }
  });

  let stepNumber = 1;

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const id of unvisited) {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        currentId = id;
      }
    }

    if (!currentId || minDistance === Infinity) {
      break; // Remaining nodes are unreachable
    }

    unvisited.delete(currentId);
    visited.add(currentId);
    const currentNode = nodeMap.get(currentId);

    if (currentId === targetId) {
      stepNumber++;
      steps.push({
        stepNumber,
        title: `Dijkstra: Target Reached (${currentNode?.name})`,
        algorithm: 'Dijkstra',
        description: `Target node [${currentNode?.name}] settled with optimal minimum disruption cost = ${distances[targetId]}. Halting search.`,
        activeNodeIds: [targetId],
        visitedNodeIds: Array.from(visited),
        distanceTable: { ...distances }
      });
      break;
    }

    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      if (unvisited.has(edge.target)) {
        const alt = distances[currentId] + edge.weight;
        const targetNode = nodeMap.get(edge.target);

        if (alt < distances[edge.target]) {
          const oldDist = distances[edge.target] === Infinity ? 'Infinity' : distances[edge.target];
          distances[edge.target] = alt;
          previous[edge.target] = currentId;

          stepNumber++;
          const explanation = `Relaxed edge ${currentNode?.name} -> ${targetNode?.name}: Cost updated from ${oldDist} to ${alt} (Weight: ${edge.weight})`;

          stepRecords.push({
            step: stepNumber,
            evaluatedNode: currentId,
            relaxedEdge: { from: currentId, to: edge.target, weight: edge.weight },
            distances: { ...distances },
            previous: { ...previous },
            visited: Array.from(visited),
            explanation
          });

          steps.push({
            stepNumber,
            title: `Edge Relaxation: ${currentNode?.name} -> ${targetNode?.name}`,
            algorithm: 'Dijkstra',
            description: explanation,
            activeNodeIds: [currentId, edge.target],
            frontierNodeIds: Array.from(unvisited),
            visitedNodeIds: Array.from(visited),
            distanceTable: { ...distances }
          });
        }
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = targetId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const finalCost = distances[targetId] !== Infinity ? distances[targetId] : 0;
  const pathNames = path.map(id => nodeMap.get(id)?.name || id);

  // Identify edges cut along this route
  const edgesCut: string[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const matchingEdge = edges.find(e => (e.source === u && e.target === v) || (e.source === v && e.target === u));
    if (matchingEdge) edgesCut.push(matchingEdge.id);
  }

  steps.push({
    stepNumber: stepNumber + 1,
    title: "Optimal Containment Route Verified",
    algorithm: 'Dijkstra',
    description: `Optimal path constructed: [${pathNames.join(' -> ')}]. Total operational disruption index: ${finalCost}. Evaluated ${visited.size} nodes out of ${nodes.length}.`,
    activeNodeIds: path,
    optimalRoute: path,
    containmentCost: finalCost,
    distanceTable: { ...distances }
  });

  return {
    sourceId,
    targetId,
    path,
    pathNames,
    totalCost: finalCost,
    visitedNodesCount: visited.size,
    edgesCut,
    steps,
    stepRecords
  };
}

/**
 * A* Search for Fast Containment Boundary Isolation
 * Uses Euclidean / Topology Hop heuristic to guide the search towards the target.
 */
export function runAStarContainmentPath(
  sourceId: string,
  targetId: string,
  nodes: SystemNode[],
  edges: SystemEdge[]
): ShortestPathResult {
  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));
  const targetNode = nodeMap.get(targetId);

  // Admissible heuristic: Euclidean distance scaled to minimum edge weight
  const minEdgeWeight = Math.min(...edges.map(e => e.weight), 5);
  function heuristic(nodeId: string): number {
    const n = nodeMap.get(nodeId);
    if (!n || !targetNode) return 0;
    const dx = n.x - targetNode.x;
    const dy = n.y - targetNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.floor((dist / 300) * minEdgeWeight);
  }

  const steps: AlgorithmStep[] = [];
  const stepRecords: PathStepRecord[] = [];

  const adj = new Map<string, Array<{ target: string; weight: number; edgeId: string }>>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    adj.get(e.source)?.push({ target: e.target, weight: e.weight, edgeId: e.id });
    adj.get(e.target)?.push({ target: e.source, weight: e.weight, edgeId: e.id });
  });

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const openSet = new Set<string>([sourceId]);
  const closedSet = new Set<string>();

  nodes.forEach(n => {
    gScore[n.id] = Infinity;
    fScore[n.id] = Infinity;
    previous[n.id] = null;
  });

  gScore[sourceId] = 0;
  fScore[sourceId] = heuristic(sourceId);

  steps.push({
    stepNumber: 1,
    title: `A* Search: Heuristic Guided Start at ${nodeMap.get(sourceId)?.name}`,
    algorithm: 'AStar',
    description: `A* initialized with admissible distance heuristic h(n). Source fScore = g(0) + h(${fScore[sourceId]}). Pruning search frontier.`,
    activeNodeIds: [sourceId],
    distanceTable: { ...gScore }
  });

  let stepNumber = 1;

  while (openSet.size > 0) {
    let currentId = Array.from(openSet).reduce((lowest, id) =>
      fScore[id] < fScore[lowest] ? id : lowest
    );

    if (currentId === targetId) {
      stepNumber++;
      steps.push({
        stepNumber,
        title: `A* Search: Target Reached (${nodeMap.get(targetId)?.name})`,
        algorithm: 'AStar',
        description: `Target reached with fScore = ${fScore[targetId]}. A* visited only ${closedSet.size + 1} nodes by avoiding unpromising subnets.`,
        activeNodeIds: [targetId],
        visitedNodeIds: Array.from(closedSet),
        distanceTable: { ...gScore }
      });
      break;
    }

    openSet.delete(currentId);
    closedSet.add(currentId);
    const currentNode = nodeMap.get(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      if (closedSet.has(edge.target)) continue;

      const tentativeG = gScore[currentId] + edge.weight;
      if (tentativeG < gScore[edge.target]) {
        previous[edge.target] = currentId;
        gScore[edge.target] = tentativeG;
        fScore[edge.target] = tentativeG + heuristic(edge.target);

        if (!openSet.has(edge.target)) {
          openSet.add(edge.target);
        }

        stepNumber++;
        const targetN = nodeMap.get(edge.target);
        const explanation = `A* evaluated ${currentNode?.name} -> ${targetN?.name}: gScore = ${tentativeG}, hScore = ${heuristic(edge.target)}, fScore = ${fScore[edge.target]}`;

        steps.push({
          stepNumber,
          title: `A* Frontier Expand: ${targetN?.name}`,
          algorithm: 'AStar',
          description: explanation,
          activeNodeIds: [currentId, edge.target],
          frontierNodeIds: Array.from(openSet),
          visitedNodeIds: Array.from(closedSet),
          distanceTable: { ...gScore }
        });
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = targetId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const finalCost = gScore[targetId] !== Infinity ? gScore[targetId] : 0;
  const pathNames = path.map(id => nodeMap.get(id)?.name || id);

  return {
    sourceId,
    targetId,
    path,
    pathNames,
    totalCost: finalCost,
    visitedNodesCount: closedSet.size + 1,
    edgesCut: [],
    steps,
    stepRecords
  };
}
