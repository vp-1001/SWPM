import {
  AlertItem,
  AlertSeverity,
  DownstreamImpactResult,
  NodeTestResult,
  Pathway,
  PipelineEdge,
  PipelineGraph,
  PipelineNode,
  PipelineNodeStatus,
  SensorQualityStatus,
  SensorReadingsSnapshot,
  TopologyScenario,
} from '../types';

// =========================================================================
// 1. Centralized Initial Pipeline Graph Topology
// =========================================================================

export const INITIAL_TOPOLOGY_NODES: PipelineNode[] = [
  {
    id: 'PLANT-01',
    name: 'Palta Water Treatment Plant (WTP)',
    code: 'PLANT',
    location: 'Palta, North 24 Parganas',
    zone: 'Source & High-Lift Pumpstation',
    type: 'source',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.7932, lng: 88.3619 },
    readings: {
      pH: 7.35,
      tds: 185,
      turbidity: 1.1,
      temperature: 24.0,
      residualChlorine: 1.4,
      flowRate: 3600,
      pressure: 5.8,
    },
    batteryLevel: 100,
    signalStrength: -58,
    pressure: 5.8,
    flowRate: 3600,
    pipeDiameterMm: 1800,
    pipeMaterial: 'Prestressed Concrete (PCCP)',
    lastTested: '10 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-01', 'PATH-02'],
  },
  {
    id: 'NODE-01',
    name: 'Palta Raw Intake & Screening Unit',
    code: 'NODE 1',
    location: 'Hooghly Riverfront Intake 1A',
    zone: 'Intake Sector Alpha',
    type: 'node',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.7945, lng: 88.3635 },
    readings: {
      pH: 7.42,
      tds: 198,
      turbidity: 1.45,
      temperature: 24.2,
      residualChlorine: 1.25,
      flowRate: 3450,
      pressure: 5.4,
    },
    batteryLevel: 98,
    signalStrength: -62,
    pressure: 5.4,
    flowRate: 3450,
    pipeDiameterMm: 1500,
    pipeMaterial: 'Ductile Iron (Class K9)',
    lastTested: '5 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-01', 'PATH-02'],
  },
  {
    id: 'NODE-02',
    name: 'Palta Clarifier & Primary Splitter Basin',
    code: 'NODE 2',
    location: 'Clariflocculator Output Chamber B4',
    zone: 'Primary Transmission Junction',
    type: 'junction',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.765, lng: 88.368 },
    readings: {
      pH: 7.38,
      tds: 192,
      turbidity: 1.3,
      temperature: 24.1,
      residualChlorine: 1.15,
      flowRate: 3300,
      pressure: 5.2,
    },
    batteryLevel: 96,
    signalStrength: -65,
    pressure: 5.2,
    flowRate: 3300,
    pipeDiameterMm: 1500,
    pipeMaterial: 'Ductile Iron (Class K9)',
    lastTested: '8 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-01', 'PATH-02'],
  },
  // Branch A: Dum Dum Route
  {
    id: 'NODE-03',
    name: 'Tala Central Reservoir & Booster Complex',
    code: 'NODE 3',
    location: 'Tala Overhead Tank Complex',
    zone: 'Main Transmission Arterial',
    type: 'junction',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.6041, lng: 88.3752 },
    readings: {
      pH: 7.3,
      tds: 188,
      turbidity: 1.25,
      temperature: 23.9,
      residualChlorine: 0.95,
      flowRate: 2100,
      pressure: 4.8,
    },
    batteryLevel: 94,
    signalStrength: -69,
    pressure: 4.8,
    flowRate: 2100,
    pipeDiameterMm: 1200,
    pipeMaterial: 'Mild Steel Mortar Lined',
    lastTested: '12 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-01', 'PATH-03'],
  },
  {
    id: 'NODE-04',
    name: 'North Metro Booster Station',
    code: 'NODE 4',
    location: 'Belgachia - Metro Feeder Corridor',
    zone: 'North Urban Distribution Feeder',
    type: 'node',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.592, lng: 88.384 },
    readings: {
      pH: 7.25,
      tds: 204,
      turbidity: 1.6,
      temperature: 24.3,
      residualChlorine: 0.75,
      flowRate: 1250,
      pressure: 4.1,
    },
    batteryLevel: 91,
    signalStrength: -72,
    pressure: 4.1,
    flowRate: 1250,
    pipeDiameterMm: 900,
    pipeMaterial: 'Cast Iron (Rehabilitated)',
    lastTested: '15 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-01'],
  },
  {
    id: 'NODE-05',
    name: 'Dum Dum Inflow Gate Chamber',
    code: 'NODE 5',
    location: 'Jessore Road Transmission Vault',
    zone: 'Dum Dum Municipal Ingress',
    type: 'node',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.5815, lng: 88.396 },
    readings: {
      pH: 7.22,
      tds: 210,
      turbidity: 1.8,
      temperature: 24.5,
      residualChlorine: 0.6,
      flowRate: 850,
      pressure: 3.5,
    },
    batteryLevel: 89,
    signalStrength: -74,
    pressure: 3.5,
    flowRate: 850,
    pipeDiameterMm: 600,
    pipeMaterial: 'HDPE PN16',
    lastTested: '18 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-01'],
  },
  {
    id: 'DEST-DUMDUM',
    name: 'Dum Dum Municipal Distribution Terminal',
    code: 'DUM DUM',
    location: 'Dum Dum Municipality Sectors 1-4',
    zone: 'Terminal End-User Supply Network',
    type: 'destination',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.573, lng: 88.405 },
    readings: {
      pH: 7.18,
      tds: 215,
      turbidity: 1.95,
      temperature: 24.7,
      residualChlorine: 0.45,
      flowRate: 820,
      pressure: 2.8,
    },
    batteryLevel: 95,
    signalStrength: -70,
    pressure: 2.8,
    flowRate: 820,
    pipeDiameterMm: 450,
    pipeMaterial: 'HDPE PN12.5',
    lastTested: '20 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-01'],
  },
  // Branch B: Howrah Route (Branching from NODE-02)
  {
    id: 'NODE-06',
    name: 'Howrah River-Crossing Feeder Line',
    code: 'NODE 6',
    location: 'Bally Bridge Sub-Aqueous Pipeline Vault',
    zone: 'West River Transmission Trunk',
    type: 'node',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.652, lng: 88.345 },
    readings: {
      pH: 7.34,
      tds: 196,
      turbidity: 1.5,
      temperature: 24.2,
      residualChlorine: 0.85,
      flowRate: 1100,
      pressure: 4.4,
    },
    batteryLevel: 92,
    signalStrength: -75,
    pressure: 4.4,
    flowRate: 1100,
    pipeDiameterMm: 1000,
    pipeMaterial: 'Ductile Iron (Class K9)',
    lastTested: '14 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-02'],
  },
  {
    id: 'NODE-07',
    name: 'Howrah North Sump Chamber',
    code: 'NODE 7',
    location: 'Grand Trunk Road Junction Vault',
    zone: 'Howrah Municipal Intake',
    type: 'node',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.602, lng: 88.338 },
    readings: {
      pH: 7.28,
      tds: 208,
      turbidity: 1.7,
      temperature: 24.6,
      residualChlorine: 0.65,
      flowRate: 980,
      pressure: 3.6,
    },
    batteryLevel: 88,
    signalStrength: -78,
    pressure: 3.6,
    flowRate: 980,
    pipeDiameterMm: 800,
    pipeMaterial: 'Mild Steel Concrete Lined',
    lastTested: '16 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-02'],
  },
  {
    id: 'DEST-HOWRAH',
    name: 'Howrah Central Distribution Hub',
    code: 'HOWRAH',
    location: 'Howrah Station & Central Grid',
    zone: 'Howrah Municipal Corporation',
    type: 'destination',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.585, lng: 88.328 },
    readings: {
      pH: 7.21,
      tds: 222,
      turbidity: 2.1,
      temperature: 24.8,
      residualChlorine: 0.5,
      flowRate: 950,
      pressure: 2.9,
    },
    batteryLevel: 94,
    signalStrength: -71,
    pressure: 2.9,
    flowRate: 950,
    pipeDiameterMm: 600,
    pipeMaterial: 'Ductile Iron',
    lastTested: '22 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-02'],
  },
  // Branch C: Sector V Route (Branching from NODE-03)
  {
    id: 'NODE-08',
    name: 'Salt Lake Bypass Booster Station',
    code: 'NODE 8',
    location: 'EM Bypass / Ultadanga Junction',
    zone: 'East Urban Transmission Feeder',
    type: 'node',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.582, lng: 88.412 },
    readings: {
      pH: 7.32,
      tds: 195,
      turbidity: 1.35,
      temperature: 24.1,
      residualChlorine: 0.8,
      flowRate: 850,
      pressure: 4.2,
    },
    batteryLevel: 93,
    signalStrength: -68,
    pressure: 4.2,
    flowRate: 850,
    pipeDiameterMm: 750,
    pipeMaterial: 'Ductile Iron',
    lastTested: '11 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-03'],
  },
  {
    id: 'DEST-SECTORV',
    name: 'Sector V IT Commercial Water Hub',
    code: 'SECTOR V',
    location: 'Salt Lake Sector V Tech Park',
    zone: 'High-Demand Commercial Sub-grid',
    type: 'destination',
    status: 'healthy',
    sensorStatus: 'optimal',
    coordinates: { lat: 22.569, lng: 88.431 },
    readings: {
      pH: 7.26,
      tds: 202,
      turbidity: 1.5,
      temperature: 24.4,
      residualChlorine: 0.55,
      flowRate: 820,
      pressure: 3.1,
    },
    batteryLevel: 96,
    signalStrength: -64,
    pressure: 3.1,
    flowRate: 820,
    pipeDiameterMm: 500,
    pipeMaterial: 'HDPE PN16',
    lastTested: '19 mins ago',
    lastTestResult: 'pass',
    pathwayIds: ['PATH-03'],
  },
];

export const INITIAL_TOPOLOGY_EDGES: PipelineEdge[] = [
  // Trunk: Plant -> Node 1 -> Node 2
  {
    id: 'EDGE-P-N1',
    fromNodeId: 'PLANT-01',
    toNodeId: 'NODE-01',
    pathwayId: 'PATH-01',
    flowDirection: 'downstream',
    distanceKm: 1.2,
    flowRateM3h: 3450,
    pipeDiameterMm: 1800,
    status: 'normal',
  },
  {
    id: 'EDGE-N1-N2',
    fromNodeId: 'NODE-01',
    toNodeId: 'NODE-02',
    pathwayId: 'PATH-01',
    flowDirection: 'downstream',
    distanceKm: 3.8,
    flowRateM3h: 3300,
    pipeDiameterMm: 1500,
    status: 'normal',
  },
  // Branch A: Node 2 -> Node 3 -> Node 4 -> Node 5 -> Dum Dum
  {
    id: 'EDGE-N2-N3',
    fromNodeId: 'NODE-02',
    toNodeId: 'NODE-03',
    pathwayId: 'PATH-01',
    flowDirection: 'downstream',
    distanceKm: 16.5,
    flowRateM3h: 2100,
    pipeDiameterMm: 1200,
    status: 'normal',
  },
  {
    id: 'EDGE-N3-N4',
    fromNodeId: 'NODE-03',
    toNodeId: 'NODE-04',
    pathwayId: 'PATH-01',
    flowDirection: 'downstream',
    distanceKm: 2.1,
    flowRateM3h: 1250,
    pipeDiameterMm: 900,
    status: 'normal',
  },
  {
    id: 'EDGE-N4-N5',
    fromNodeId: 'NODE-04',
    toNodeId: 'NODE-05',
    pathwayId: 'PATH-01',
    flowDirection: 'downstream',
    distanceKm: 2.4,
    flowRateM3h: 850,
    pipeDiameterMm: 600,
    status: 'normal',
  },
  {
    id: 'EDGE-N5-DD',
    fromNodeId: 'NODE-05',
    toNodeId: 'DEST-DUMDUM',
    pathwayId: 'PATH-01',
    flowDirection: 'downstream',
    distanceKm: 1.5,
    flowRateM3h: 820,
    pipeDiameterMm: 450,
    status: 'normal',
  },
  // Branch B: Node 2 -> Node 6 -> Node 7 -> Howrah
  {
    id: 'EDGE-N2-N6',
    fromNodeId: 'NODE-02',
    toNodeId: 'NODE-06',
    pathwayId: 'PATH-02',
    flowDirection: 'downstream',
    distanceKm: 12.2,
    flowRateM3h: 1100,
    pipeDiameterMm: 1000,
    status: 'normal',
  },
  {
    id: 'EDGE-N6-N7',
    fromNodeId: 'NODE-06',
    toNodeId: 'NODE-07',
    pathwayId: 'PATH-02',
    flowDirection: 'downstream',
    distanceKm: 4.6,
    flowRateM3h: 980,
    pipeDiameterMm: 800,
    status: 'normal',
  },
  {
    id: 'EDGE-N7-HW',
    fromNodeId: 'NODE-07',
    toNodeId: 'DEST-HOWRAH',
    pathwayId: 'PATH-02',
    flowDirection: 'downstream',
    distanceKm: 2.0,
    flowRateM3h: 950,
    pipeDiameterMm: 600,
    status: 'normal',
  },
  // Branch C: Node 3 -> Node 8 -> Sector V
  {
    id: 'EDGE-N3-N8',
    fromNodeId: 'NODE-03',
    toNodeId: 'NODE-08',
    pathwayId: 'PATH-03',
    flowDirection: 'downstream',
    distanceKm: 4.8,
    flowRateM3h: 850,
    pipeDiameterMm: 750,
    status: 'normal',
  },
  {
    id: 'EDGE-N8-SV',
    fromNodeId: 'NODE-08',
    toNodeId: 'DEST-SECTORV',
    pathwayId: 'PATH-03',
    flowDirection: 'downstream',
    distanceKm: 2.2,
    flowRateM3h: 820,
    pipeDiameterMm: 500,
    status: 'normal',
  },
];

export const INITIAL_PATHWAYS: Pathway[] = [
  {
    id: 'PATH-01',
    name: 'Pathway 1 — Palta Plant to Dum Dum',
    code: 'PLANT → DUM DUM',
    sourceNodeId: 'PLANT-01',
    destination: 'Dum Dum Distribution Terminal',
    destinationNodeId: 'DEST-DUMDUM',
    nodeIds: ['PLANT-01', 'NODE-01', 'NODE-02', 'NODE-03', 'NODE-04', 'NODE-05', 'DEST-DUMDUM'],
    edgeIds: ['EDGE-P-N1', 'EDGE-N1-N2', 'EDGE-N2-N3', 'EDGE-N3-N4', 'EDGE-N4-N5', 'EDGE-N5-DD'],
    status: 'normal',
    criticalNodeCount: 0,
    affectedNodeCount: 0,
    healthyNodeCount: 7,
    description: 'Primary northern transmission line delivering treated water across Tala Reservoir to Dum Dum municipality.',
  },
  {
    id: 'PATH-02',
    name: 'Pathway 2 — Palta Plant to Howrah Branch',
    code: 'PLANT → HOWRAH',
    sourceNodeId: 'PLANT-01',
    destination: 'Howrah Central Distribution Hub',
    destinationNodeId: 'DEST-HOWRAH',
    nodeIds: ['PLANT-01', 'NODE-01', 'NODE-02', 'NODE-06', 'NODE-07', 'DEST-HOWRAH'],
    edgeIds: ['EDGE-P-N1', 'EDGE-N1-N2', 'EDGE-N2-N6', 'EDGE-N6-N7', 'EDGE-N7-HW'],
    status: 'normal',
    criticalNodeCount: 0,
    affectedNodeCount: 0,
    healthyNodeCount: 6,
    description: 'Western branch splitting at Node 2 crossing the Hooghly sub-aqueous line to serve Howrah.',
  },
  {
    id: 'PATH-03',
    name: 'Pathway 3 — Tala Complex to Sector V Hub',
    code: 'TALA → SECTOR V',
    sourceNodeId: 'NODE-03',
    destination: 'Sector V IT Commercial Water Hub',
    destinationNodeId: 'DEST-SECTORV',
    nodeIds: ['NODE-03', 'NODE-08', 'DEST-SECTORV'],
    edgeIds: ['EDGE-N3-N8', 'EDGE-N8-SV'],
    status: 'normal',
    criticalNodeCount: 0,
    affectedNodeCount: 0,
    healthyNodeCount: 3,
    description: 'Eastern arterial spur branching from Tala Reservoir supplying the Bidhannagar Sector V commercial IT park.',
  },
];

export const INITIAL_PIPELINE_GRAPH: PipelineGraph = {
  nodes: INITIAL_TOPOLOGY_NODES,
  edges: INITIAL_TOPOLOGY_EDGES,
  pathways: INITIAL_PATHWAYS,
};

// =========================================================================
// 2. Graph Traversal Algorithms (BFS / DFS without hardcoding)
// =========================================================================

/**
 * Traverses downstream from a given start node following directed pipeline edges (from -> to).
 * Returns all reachable downstream nodes (excluding the start node itself).
 * Handles branching and cycles safely via visited Set.
 */
export function getDownstreamNodes(nodeId: string, graph: PipelineGraph): PipelineNode[] {
  const downstream: PipelineNode[] = [];
  const visited = new Set<string>([nodeId]);
  const queue: string[] = [nodeId];

  // Map for fast node lookup
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    // Find all outgoing edges from current node
    const outgoingEdges = graph.edges.filter((e) => e.fromNodeId === currentId);

    for (const edge of outgoingEdges) {
      if (!visited.has(edge.toNodeId)) {
        visited.add(edge.toNodeId);
        queue.push(edge.toNodeId);
        const node = nodeMap.get(edge.toNodeId);
        if (node) {
          downstream.push(node);
        }
      }
    }
  }

  return downstream;
}

/**
 * Traverses upstream against directed pipeline edges (to -> from).
 * Returns all predecessor nodes that feed water into this node (excluding the start node itself).
 */
export function getUpstreamNodes(nodeId: string, graph: PipelineGraph): PipelineNode[] {
  const upstream: PipelineNode[] = [];
  const visited = new Set<string>([nodeId]);
  const queue: string[] = [nodeId];

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    // Find incoming edges to current node
    const incomingEdges = graph.edges.filter((e) => e.toNodeId === currentId);

    for (const edge of incomingEdges) {
      if (!visited.has(edge.fromNodeId)) {
        visited.add(edge.fromNodeId);
        queue.push(edge.fromNodeId);
        const node = nodeMap.get(edge.fromNodeId);
        if (node) {
          upstream.push(node);
        }
      }
    }
  }

  return upstream;
}

/**
 * Finds all terminal destinations reachable from a node.
 */
export function getReachableDestinations(nodeId: string, graph: PipelineGraph): PipelineNode[] {
  const downstream = getDownstreamNodes(nodeId, graph);
  return downstream.filter((n) => n.type === 'destination');
}

/**
 * Computes downstream impact summary for a failed/abnormal node.
 */
export function calculateDownstreamImpact(
  failedNodeId: string,
  graph: PipelineGraph
): DownstreamImpactResult {
  const failedNode = graph.nodes.find((n) => n.id === failedNodeId);
  const downstream = getDownstreamNodes(failedNodeId, graph);
  const upstream = getUpstreamNodes(failedNodeId, graph);

  const downstreamIds = downstream.map((n) => n.id);
  const upstreamIds = upstream.map((n) => n.id);

  // Determine affected pathways: pathways that include both the failed node and any downstream node
  const impactedPathways = graph.pathways
    .filter((p) => p.nodeIds.includes(failedNodeId))
    .map((p) => p.id);

  // Determine impacted destinations
  const destinations = downstream
    .filter((n) => n.type === 'destination')
    .map((n) => n.name);

  const failedNodeCode = failedNode?.code || failedNodeId;
  const description =
    downstream.length > 0
      ? `Quality anomaly detected at ${failedNodeCode}. Automated hydraulic propagation indicates ${downstream.length} downstream nodes potentially affected across ${impactedPathways.length} distribution pathways.`
      : `Quality anomaly localized at ${failedNodeCode} with no downstream nodes configured.`;

  return {
    failedNodeId,
    downstreamNodeIds: downstreamIds,
    upstreamNodeIds: upstreamIds,
    impactedPathwayIds: impactedPathways,
    impactedDestinations: destinations,
    severity: 'critical',
    description,
  };
}

// =========================================================================
// 3. Water Quality Evaluation & Testing Engine
// =========================================================================

export interface QualityEvaluation {
  status: 'pass' | 'warning' | 'critical';
  sensorStatus: SensorQualityStatus;
  violations: string[];
  summaryMessage: string;
  isAbnormal: boolean;
}

/**
 * Evaluates sensor readings against operational prototype thresholds.
 */
export function evaluateNodeSensorCheck(readings: SensorReadingsSnapshot): QualityEvaluation {
  const violations: string[] = [];
  let status: 'pass' | 'warning' | 'critical' = 'pass';
  let sensorStatus: SensorQualityStatus = 'optimal';

  // 1. pH check (Permissible 6.5 - 8.5)
  if (readings.pH < 6.5 || readings.pH > 8.5) {
    status = 'critical';
    violations.push(`pH ${readings.pH.toFixed(2)} outside safe range (6.5 – 8.5)`);
  } else if (readings.pH < 6.8 || readings.pH > 8.2) {
    status = 'warning';
    violations.push(`pH ${readings.pH.toFixed(2)} nearing permissible threshold boundary`);
  }

  // 2. Turbidity check (Desirable < 1.0 NTU, Permissible < 5.0 NTU)
  if (readings.turbidity >= 5.0) {
    status = 'critical';
    violations.push(`Turbidity ${readings.turbidity.toFixed(2)} NTU exceeded permissible limit (5.0 NTU)`);
  } else if (readings.turbidity > 2.5) {
    if (status !== 'critical') status = 'warning';
    violations.push(`Turbidity ${readings.turbidity.toFixed(2)} NTU elevated above desirable baseline (<1.0 NTU)`);
  }

  // 3. TDS check (Desirable < 500 ppm, Permissible < 2000 ppm)
  if (readings.tds >= 500) {
    status = 'critical';
    violations.push(`TDS ${readings.tds} mg/L exceeds desirable limit (500 mg/L)`);
  } else if (readings.tds > 350) {
    if (status !== 'critical') status = 'warning';
    violations.push(`TDS ${readings.tds} mg/L elevated above standard baseline`);
  }

  // 4. Residual Chlorine check (if present, min 0.2 mg/L)
  if (readings.residualChlorine !== undefined) {
    if (readings.residualChlorine < 0.2) {
      if (status !== 'critical') status = 'warning';
      violations.push(`Residual Chlorine ${readings.residualChlorine.toFixed(2)} mg/L below minimum bacteriological barrier (0.2 mg/L)`);
    }
  }

  if (status === 'critical') {
    sensorStatus = 'critical';
  } else if (status === 'warning') {
    sensorStatus = 'warning';
  } else {
    sensorStatus = 'optimal';
  }

  const isAbnormal = status === 'critical' || status === 'warning';
  const summaryMessage = isAbnormal
    ? `Water quality anomaly detected: ${violations.join(' · ')}`
    : 'Water quality within expected limits. All parameters meet operational safety standards.';

  return {
    status,
    sensorStatus,
    violations,
    summaryMessage,
    isAbnormal,
  };
}

/**
 * Recalculates all node statuses, edge statuses, and pathway metrics across the entire graph.
 * Traverses downstream from every failed node to mark downstream nodes as 'potentially_affected'.
 * Leaves upstream nodes and un-affected branches strictly 'healthy'!
 */
export function recalculateGraphTopology(graph: PipelineGraph): PipelineGraph {
  // Step 1: Initialize all nodes with their direct sensor evaluation
  const newNodes: PipelineNode[] = graph.nodes.map((node) => {
    // If the node itself is manually marked as a failed source
    if (node.isFailedSource) {
      const evalResult = evaluateNodeSensorCheck(node.readings);
      return {
        ...node,
        status: evalResult.status === 'pass' ? 'critical' : (evalResult.status as PipelineNodeStatus),
        sensorStatus: evalResult.sensorStatus === 'optimal' ? 'critical' : evalResult.sensorStatus,
        lastTestResult: evalResult.status === 'pass' ? 'critical' : evalResult.status,
      };
    }

    // Direct sensor health
    const evalResult = evaluateNodeSensorCheck(node.readings);
    let initialStatus: PipelineNodeStatus = 'healthy';
    if (evalResult.status === 'critical') initialStatus = 'critical';
    else if (evalResult.status === 'warning') initialStatus = 'warning';

    return {
      ...node,
      status: initialStatus,
      sensorStatus: evalResult.sensorStatus,
      lastTestResult: evalResult.status,
      anomalyReason: evalResult.violations.length > 0 ? evalResult.violations.join('; ') : undefined,
    };
  });

  const nodeMap = new Map(newNodes.map((n) => [n.id, n]));

  // Step 2: Identify all directly failed/critical/warning nodes
  const criticalNodes = newNodes.filter(
    (n) => n.status === 'critical' || n.isFailedSource || n.status === 'warning'
  );

  // Set of all downstream node IDs that should be marked potentially affected
  const affectedDownstreamIds = new Set<string>();

  for (const failedNode of criticalNodes) {
    const downstream = getDownstreamNodes(failedNode.id, {
      nodes: newNodes,
      edges: graph.edges,
      pathways: graph.pathways,
    });

    for (const dNode of downstream) {
      affectedDownstreamIds.add(dNode.id);
    }
  }

  // Step 3: Apply 'potentially_affected' status ONLY to nodes that are NOT directly critical themselves
  for (const node of newNodes) {
    if (node.status !== 'critical' && node.status !== 'warning' && !node.isFailedSource) {
      if (affectedDownstreamIds.has(node.id)) {
        node.status = 'potentially_affected';
      } else {
        node.status = 'healthy';
      }
    }
  }

  // Step 4: Update edge statuses
  const newEdges: PipelineEdge[] = graph.edges.map((edge) => {
    const fromNode = nodeMap.get(edge.fromNodeId);
    const toNode = nodeMap.get(edge.toNodeId);

    let edgeStatus: 'normal' | 'impacted' | 'warning' = 'normal';
    if (fromNode?.status === 'critical' || toNode?.status === 'critical') {
      edgeStatus = 'impacted';
    } else if (
      fromNode?.status === 'potentially_affected' ||
      toNode?.status === 'potentially_affected' ||
      fromNode?.status === 'warning' ||
      toNode?.status === 'warning'
    ) {
      edgeStatus = 'impacted';
    }

    return {
      ...edge,
      status: edgeStatus,
    };
  });

  // Step 5: Recalculate pathway metrics
  const newPathways: Pathway[] = graph.pathways.map((pathway) => {
    const pathwayNodes = pathway.nodeIds
      .map((id) => nodeMap.get(id))
      .filter((n): n is PipelineNode => Boolean(n));

    const criticalCount = pathwayNodes.filter((n) => n.status === 'critical').length;
    const affectedCount = pathwayNodes.filter((n) => n.status === 'potentially_affected').length;
    const warningCount = pathwayNodes.filter((n) => n.status === 'warning').length;
    const healthyCount = pathwayNodes.filter((n) => n.status === 'healthy').length;

    let pathwayStatus: 'normal' | 'impacted' | 'warning' = 'normal';
    if (criticalCount > 0) {
      pathwayStatus = 'impacted';
    } else if (affectedCount > 0 || warningCount > 0) {
      pathwayStatus = 'impacted';
    }

    return {
      ...pathway,
      status: pathwayStatus,
      criticalNodeCount: criticalCount,
      affectedNodeCount: affectedCount,
      healthyNodeCount: healthyCount,
    };
  });

  return {
    nodes: newNodes,
    edges: newEdges,
    pathways: newPathways,
  };
}

/**
 * Runs a simulated water quality test on a node, recalculates the graph topology,
 * and produces alert items if abnormal.
 */
export function runNodeQualityTest(
  nodeId: string,
  currentGraph: PipelineGraph,
  simulatedReadings?: Partial<SensorReadingsSnapshot>,
  forceFail = false
): {
  result: NodeTestResult;
  updatedGraph: PipelineGraph;
  newAlert?: AlertItem;
} {
  const targetNode = currentGraph.nodes.find((n) => n.id === nodeId);
  if (!targetNode) {
    throw new Error(`Node ${nodeId} not found in topology.`);
  }

  // Combine current readings with simulated readings
  const newReadings: SensorReadingsSnapshot = {
    ...targetNode.readings,
    ...(simulatedReadings || {}),
  };

  if (forceFail) {
    newReadings.turbidity = 7.85;
    newReadings.tds = 485;
    newReadings.pH = 8.85;
  }

  const evalResult = evaluateNodeSensorCheck(newReadings);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const timeAgoStr = 'Just now';

  // Clone nodes and update tested node
  const updatedNodes = currentGraph.nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        readings: newReadings,
        lastTested: timeStr,
        lastTestResult: evalResult.status,
        anomalyReason: evalResult.violations.length > 0 ? evalResult.violations.join('; ') : undefined,
        isFailedSource: evalResult.isAbnormal,
      };
    }
    return node;
  });

  const intermediateGraph: PipelineGraph = {
    ...currentGraph,
    nodes: updatedNodes,
  };

  // Recalculate full graph propagation
  const finalGraph = recalculateGraphTopology(intermediateGraph);

  // Find downstream impact
  const downstreamNodes = getDownstreamNodes(nodeId, finalGraph);
  const downstreamIds = downstreamNodes.map((n) => n.id);
  const reachableDestinations = downstreamNodes
    .filter((n) => n.type === 'destination')
    .map((n) => n.name);

  const testResult: NodeTestResult = {
    nodeId,
    timestamp: now.toISOString(),
    status: evalResult.status,
    readings: newReadings,
    violations: evalResult.violations,
    summaryMessage: evalResult.isAbnormal
      ? `Water quality anomaly at ${targetNode.code} (${targetNode.name}). ${evalResult.violations.join(', ')}.`
      : `Water quality within expected limits at ${targetNode.code}.`,
    isAbnormal: evalResult.isAbnormal,
    affectedDownstreamNodeIds: downstreamIds,
    impactedDestinationIds: reachableDestinations,
  };

  let newAlert: AlertItem | undefined;
  if (evalResult.isAbnormal) {
    const primaryPathway = targetNode.pathwayIds[0] || 'PATH-01';
    const downstreamCodes = downstreamNodes.map((n) => n.code).join(', ');

    newAlert = {
      id: `ALT-TOPOLOGY-${Date.now().toString().slice(-4)}`,
      severity: evalResult.status === 'critical' ? 'critical' : 'warning',
      node: targetNode.id,
      nodeName: targetNode.name,
      timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
      timeAgo: timeAgoStr,
      title: `${evalResult.status === 'critical' ? 'CRITICAL' : 'WARNING'} — Water Quality Anomaly at ${targetNode.code}`,
      description: `Turbidity or physicochemical values deviated from baseline (${evalResult.violations.join('; ')}). Automated hydraulic topology propagation indicates potential impact on downstream nodes: ${downstreamCodes || 'None'}.`,
      status: 'active',
      parameterAffected: evalResult.violations[0]?.split(' ')[0] || 'Water Quality',
      observedValue: `Turbidity: ${newReadings.turbidity} NTU, pH: ${newReadings.pH}, TDS: ${newReadings.tds}`,
      thresholdValue: 'BIS IS 10500 Compliant Bracket',
    };
  }

  return {
    result: testResult,
    updatedGraph: finalGraph,
    newAlert,
  };
}

/**
 * Preset Scenarios for demonstration
 */
export function applyTopologyScenario(
  scenario: TopologyScenario,
  baseGraph: PipelineGraph = INITIAL_PIPELINE_GRAPH
): PipelineGraph {
  let graphCopy: PipelineGraph = JSON.parse(JSON.stringify(INITIAL_PIPELINE_GRAPH));

  switch (scenario) {
    case 'normal':
    case 'recovery': {
      // All nodes restored to healthy
      const cleanNodes = graphCopy.nodes.map((node) => ({
        ...node,
        status: 'healthy' as PipelineNodeStatus,
        sensorStatus: 'optimal' as SensorQualityStatus,
        isFailedSource: false,
        lastTestResult: 'pass' as const,
        anomalyReason: undefined,
        readings: {
          ...node.readings,
          pH: 7.32,
          turbidity: 1.25,
          tds: 195,
          residualChlorine: 0.85,
        },
      }));
      return recalculateGraphTopology({ ...graphCopy, nodes: cleanNodes });
    }

    case 'node2_fail': {
      // Node 2 (Palta Clarifier / Junction) fails
      // Dum Dum and Howrah branches will BOTH turn potentially_affected, Node 1 & Plant remain healthy!
      const nodes = graphCopy.nodes.map((node) => {
        if (node.id === 'NODE-02') {
          return {
            ...node,
            isFailedSource: true,
            status: 'critical' as PipelineNodeStatus,
            sensorStatus: 'critical' as SensorQualityStatus,
            lastTestResult: 'critical' as const,
            anomalyReason: 'Turbidity 7.85 NTU exceeded ceiling (>5.0 NTU); TDS elevated to 465 ppm',
            readings: {
              ...node.readings,
              turbidity: 7.85,
              tds: 465,
              pH: 8.75,
              residualChlorine: 0.15,
            },
          };
        }
        return { ...node, isFailedSource: false };
      });
      return recalculateGraphTopology({ ...graphCopy, nodes });
    }

    case 'node3_fail': {
      // Node 3 (Tala) fails
      // Dum Dum and Sector V turn potentially_affected, Node 1, Node 2, Plant, and Howrah remain healthy!
      const nodes = graphCopy.nodes.map((node) => {
        if (node.id === 'NODE-03') {
          return {
            ...node,
            isFailedSource: true,
            status: 'critical' as PipelineNodeStatus,
            sensorStatus: 'critical' as SensorQualityStatus,
            lastTestResult: 'critical' as const,
            anomalyReason: 'Turbidity spiked to 6.40 NTU; Chlorine depleted to 0.08 mg/L',
            readings: {
              ...node.readings,
              turbidity: 6.4,
              tds: 390,
              pH: 8.6,
              residualChlorine: 0.08,
            },
          };
        }
        return { ...node, isFailedSource: false };
      });
      return recalculateGraphTopology({ ...graphCopy, nodes });
    }

    case 'node6_fail': {
      // Node 6 (Howrah Feeder) fails
      // Only Howrah branch is potentially_affected; Dum Dum & Sector V remain completely normal!
      const nodes = graphCopy.nodes.map((node) => {
        if (node.id === 'NODE-06') {
          return {
            ...node,
            isFailedSource: true,
            status: 'critical' as PipelineNodeStatus,
            sensorStatus: 'critical' as SensorQualityStatus,
            lastTestResult: 'critical' as const,
            anomalyReason: 'Cross-river line turbidity surge (8.10 NTU)',
            readings: {
              ...node.readings,
              turbidity: 8.1,
              tds: 420,
              pH: 8.4,
            },
          };
        }
        return { ...node, isFailedSource: false };
      });
      return recalculateGraphTopology({ ...graphCopy, nodes });
    }

    default:
      return recalculateGraphTopology(graphCopy);
  }
}
