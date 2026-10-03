import { Incident, SystemNode, SystemEdge, HeapNode, AlgorithmStep } from '../types';

/**
 * Multi-criteria priority score calculation
 * Explicitly balances CVSS vulnerability score, host business criticality,
 * cascading dependency blast multiplier, and regulatory SLA time decay.
 */
export function calculateIncidentScore(
  incident: Incident,
  node: SystemNode,
  edges: SystemEdge[]
): { score: number; breakdown: HeapNode['formulaBreakdown']; cascadingImpact: number } {
  // Calculate cascading impact: number of direct and indirect systems depending on this node
  const dependentsCount = edges.filter(e => e.target === node.id && e.isDependency).length;
  const cascadingImpact = dependentsCount;

  // SLA Urgency: increases as elapsed time approaches or surpasses SLA limit
  const elapsedMinutes = incident.discoveredMinutesAgo;
  const slaRemaining = Math.max(0, incident.slaLimitMinutes - elapsedMinutes);
  // Scale SLA urgency between 0 and 10 (higher means closer to breach)
  const slaUrgency = Math.min(10, Math.max(1, ((incident.slaLimitMinutes - slaRemaining) / incident.slaLimitMinutes) * 10));

  const cvssWeighted = Number((incident.cvss * 3.5).toFixed(2));
  const criticalityWeighted = Number((node.criticality * 3.0).toFixed(2));
  const cascadeWeighted = Number((cascadingImpact * 4.0).toFixed(2));
  const slaUrgencyWeighted = Number((slaUrgency * 2.0).toFixed(2));

  const totalScore = Number((cvssWeighted + criticalityWeighted + cascadeWeighted + slaUrgencyWeighted).toFixed(2));

  return {
    score: totalScore,
    cascadingImpact,
    breakdown: {
      cvssWeighted,
      criticalityWeighted,
      cascadeWeighted,
      slaUrgencyWeighted
    }
  };
}

export interface HeapSnapshot {
  array: HeapNode[];
  action: 'insert' | 'extract' | 'sift_up' | 'sift_down' | 'initial';
  description: string;
  affectedIndices: number[];
}

export class IncidentMaxHeap {
  private heap: HeapNode[] = [];
  public history: HeapSnapshot[] = [];
  public steps: AlgorithmStep[] = [];

  constructor() {
    this.heap = [];
    this.history = [];
    this.steps = [];
  }

  public size(): number {
    return this.heap.length;
  }

  public getHeapArray(): HeapNode[] {
    return [...this.heap];
  }

  public peek(): HeapNode | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  private parentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private rightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  public insert(item: HeapNode) {
    this.heap.push(item);
    let index = this.heap.length - 1;

    this.history.push({
      array: [...this.heap],
      action: 'insert',
      description: `Inserted incident [${item.incident.title}] with priority score ${item.score} at index ${index}`,
      affectedIndices: [index]
    });

    this.siftUp(index);
  }

  private siftUp(index: number) {
    while (index > 0) {
      const parent = this.parentIndex(index);
      if (this.heap[index].score > this.heap[parent].score) {
        this.swap(index, parent);
        this.history.push({
          array: [...this.heap],
          action: 'sift_up',
          description: `Score ${this.heap[parent].score} > ${this.heap[index].score}: Swapped index ${index} with parent index ${parent}`,
          affectedIndices: [index, parent]
        });
        index = parent;
      } else {
        break;
      }
    }
  }

  public extractMax(): HeapNode | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) {
      const max = this.heap.pop()!;
      this.history.push({
        array: [],
        action: 'extract',
        description: `Extracted single root incident [${max.incident.title}] (Score: ${max.score})`,
        affectedIndices: [0]
      });
      return max;
    }

    const max = this.heap[0];
    const last = this.heap.pop()!;
    this.heap[0] = last;

    this.history.push({
      array: [...this.heap],
      action: 'extract',
      description: `Dispatched top priority incident [${max.incident.title}] (Score: ${max.score}). Moved leaf [${last.incident.title}] to root index 0`,
      affectedIndices: [0]
    });

    this.siftDown(0);
    return max;
  }

  private siftDown(index: number) {
    const length = this.heap.length;
    while (this.leftChildIndex(index) < length) {
      let largest = index;
      const left = this.leftChildIndex(index);
      const right = this.rightChildIndex(index);

      if (left < length && this.heap[left].score > this.heap[largest].score) {
        largest = left;
      }

      if (right < length && this.heap[right].score > this.heap[largest].score) {
        largest = right;
      }

      if (largest !== index) {
        const prev = index;
        this.swap(index, largest);
        this.history.push({
          array: [...this.heap],
          action: 'sift_down',
          description: `Heap property restored: Swapped index ${prev} with larger child index ${largest} (Score ${this.heap[prev].score} vs ${this.heap[largest].score})`,
          affectedIndices: [prev, largest]
        });
        index = largest;
      } else {
        break;
      }
    }
  }
}

/**
 * Builds the Priority Queue execution trace from raw incidents and network state
 */
export function buildPriorityQueueTrace(
  incidents: Incident[],
  nodes: SystemNode[],
  edges: SystemEdge[]
): {
  heapInstance: IncidentMaxHeap;
  sortedQueue: HeapNode[];
  steps: AlgorithmStep[];
} {
  const heap = new IncidentMaxHeap();
  const nodeMap = new Map<string, SystemNode>(nodes.map(n => [n.id, n]));
  const steps: AlgorithmStep[] = [];

  // Step 1: Score calculation and insertion into heap
  incidents.forEach((inc, idx) => {
    const node = nodeMap.get(inc.targetNodeId);
    if (!node) return;

    const { score, breakdown, cascadingImpact } = calculateIncidentScore(inc, node, edges);
    const heapNode: HeapNode = {
      incident: inc,
      score,
      nodeName: node.name,
      criticality: node.criticality,
      cascadingImpact,
      formulaBreakdown: breakdown
    };

    heap.insert(heapNode);

    steps.push({
      stepNumber: idx + 1,
      title: `Evaluate & Enqueue: ${inc.title}`,
      algorithm: 'PriorityQueue',
      description: `Evaluated ${node.name} (CVSS: ${inc.cvss}, Criticality: ${node.criticality}/10, Dependents: ${cascadingImpact}). Calculated Priority Score = ${score}. Inserted into Max-Heap.`,
      activeNodeIds: [node.id],
      heapState: heap.getHeapArray()
    });
  });

  // Extract all elements to get the deterministic priority sequence
  const clonedHeap = new IncidentMaxHeap();
  heap.getHeapArray().forEach(item => clonedHeap.insert(item));

  const sortedQueue: HeapNode[] = [];
  let dispatchStep = steps.length;
  while (clonedHeap.size() > 0) {
    dispatchStep++;
    const top = clonedHeap.extractMax()!;
    sortedQueue.push(top);

    steps.push({
      stepNumber: dispatchStep,
      title: `Dispatch Top Priority: ${top.incident.title}`,
      algorithm: 'PriorityQueue',
      description: `Priority Queue extracted highest urgency incident for ${top.nodeName} with score ${top.score}. Response units dispatched before lower-scored assets.`,
      activeNodeIds: [top.incident.targetNodeId],
      heapState: clonedHeap.getHeapArray()
    });
  }

  return {
    heapInstance: heap,
    sortedQueue,
    steps
  };
}
