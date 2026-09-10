/**
 * Route calculation service connecting to Crow graph pathfinding.
 */
export async function calculateRoute(startNodeId, endNodeId, graph) {
  if (!graph || !graph.nodes || !graph.edges) {
    throw new Error('Graph data not loaded');
  }

  const startNode = graph.nodes.find((n) => n.id === Number(startNodeId));
  const endNode = graph.nodes.find((n) => n.id === Number(endNodeId));

  if (!startNode || !endNode) {
    throw new Error('Start or destination node not found on graph');
  }

  // BFS / Shortest path helper over frontend graph if WS route is unavailable
  const path = findShortestPath(startNodeId, endNodeId, graph);

  return {
    success: true,
    startNode,
    endNode,
    nodes: path.nodeIds,
    edges: path.edgeIds,
    distance: path.distance,
  };
}

function findShortestPath(startId, endId, graph) {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const adj = new Map();

  graph.nodes.forEach((n) => adj.set(n.id, []));
  graph.edges.forEach((e) => {
    if (adj.has(e.from)) adj.get(e.from).push({ to: e.to, edgeId: e.id, cost: e.cost || 100 });
  });

  const distances = new Map();
  const previous = new Map();
  const edgeUsed = new Map();
  const queue = new Set(graph.nodes.map((n) => n.id));

  graph.nodes.forEach((n) => distances.set(n.id, Infinity));
  distances.set(startId, 0);

  while (queue.size > 0) {
    let smallest = null;
    queue.forEach((nodeId) => {
      if (smallest === null || distances.get(nodeId) < distances.get(smallest)) {
        smallest = nodeId;
      }
    });

    if (smallest === null || distances.get(smallest) === Infinity) break;
    if (smallest === endId) break;

    queue.delete(smallest);

    const neighbors = adj.get(smallest) || [];
    for (const neighbor of neighbors) {
      if (queue.has(neighbor.to)) {
        const alt = distances.get(smallest) + neighbor.cost;
        if (alt < distances.get(neighbor.to)) {
          distances.set(neighbor.to, alt);
          previous.set(neighbor.to, smallest);
          edgeUsed.set(neighbor.to, neighbor.edgeId);
        }
      }
    }
  }

  const pathNodes = [];
  const pathEdges = [];
  let curr = endId;

  if (previous.has(curr) || curr === startId) {
    while (curr !== undefined) {
      pathNodes.unshift(curr);
      const edge = edgeUsed.get(curr);
      if (edge) pathEdges.unshift(edge);
      curr = previous.get(curr);
    }
  }

  return {
    nodeIds: pathNodes,
    edgeIds: pathEdges,
    distance: distances.get(endId) === Infinity ? 0 : Math.round(distances.get(endId)),
  };
}

