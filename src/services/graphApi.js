import { request } from './api';

/**
/api/graph endpoint returns:
{
  "success": true,
  "data": {
    "nodes": [ { "id": 1, "x": 100, "y": 200 }, ... ],
    "edges": [ { "id": 1, "from": 1, "to": 2, "cost": 150.5 }, ... ]
  }
}
*/
export async function getGraph() {
  try {
    const response = await request('/graph');
    if (response && response.data) {
      return response.data;
    }
    if (response && response.nodes) {
      return response;
    }
    throw new Error('Invalid graph payload structure');
  } catch (err) {
    console.warn('[graphApi] Backend graph unreachable, using local fallback:', err.message);
    return getFallbackGraph();
  }
}

function getFallbackGraph() {
  // Generate sample graph grid matching the GeoJSON bounding region if offline
  const nodes = [];
  const edges = [];
  let nodeId = 1;
  const cols = 8;
  const rows = 6;
  const spacing = 120;
  const startX = 150;
  const startY = 100;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = nodeId++;
      nodes.push({
        id,
        x: startX + c * spacing + (Math.sin(r + c) * 15),
        y: startY + r * spacing + (Math.cos(r * c) * 15),
        intersection_id: `INT-${id}`,
      });
    }
  }

  let edgeId = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const current = r * cols + c + 1;
      if (c < cols - 1) {
        const right = current + 1;
        const dx = nodes[current - 1].x - nodes[right - 1].x;
        const dy = nodes[current - 1].y - nodes[right - 1].y;
        const dist = Math.hypot(dx, dy);
        edges.push({ id: edgeId++, from: current, to: right, cost: Math.round(dist) });
        edges.push({ id: edgeId++, from: right, to: current, cost: Math.round(dist) });
      }
      if (r < rows - 1) {
        const down = current + cols;
        const dx = nodes[current - 1].x - nodes[down - 1].x;
        const dy = nodes[current - 1].y - nodes[down - 1].y;
        const dist = Math.hypot(dx, dy);
        edges.push({ id: edgeId++, from: current, to: down, cost: Math.round(dist) });
        edges.push({ id: edgeId++, from: down, to: current, cost: Math.round(dist) });
      }
    }
  }

  return { nodes, edges };
}

