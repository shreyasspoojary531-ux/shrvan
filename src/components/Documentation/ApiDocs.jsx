import { IconCode, IconServer, IconSend } from '@tabler/icons-react';

const endpoints = [
  {
    method: 'GET',
    path: '/api/status',
    description: 'System health check and Arduino connection status',
    response: `{ "server": "online" }`,
  },
  {
    method: 'GET',
    path: '/api/graph',
    description: 'Fetches the authoritative C++ road graph with nodes & edges',
    response: `{
  "success": true,
  "data": {
    "nodes": [{ "id": 1, "x": 270.0, "y": 100.0 }],
    "edges": [{ "id": 1, "from": 1, "to": 2, "cost": 120.5 }]
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/facilities',
    description: 'Returns centroids for Hospitals, Ambulance Hubs, Police & Fire Stations',
    response: `{
  "success": true,
  "hospitals": [{ "id": "H1", "name": "General Hospital", "x": 270, "y": 100 }],
  "ambulanceHubs": [],
  "policeStations": [],
  "fireStations": []
}`,
  },
  {
    method: 'POST',
    path: '/api/graph/emergency',
    description: 'Calculates emergency path (type 1=Hospital, 2=Police, 3=Fire) & redirects nearby mobile traffic',
    request: `{ "x": 270.0, "y": 100.0, "typeofemergency": 1 }`,
    response: `{ "nodes": [...], "edges": [...], "distance": 450.0 }`,
  },
  {
    method: 'POST',
    path: '/api/disaster',
    description: 'Declares public disaster and broadcasts to all WebSocket clients',
    request: `{ "type": "Flash Flood", "message": "Evacuate lower zone", "severity": "high" }`,
    response: `{ "success": true, "notified": true }`,
  },
  {
    method: 'GET',
    path: '/api/disaster',
    description: 'Retrieves current active public disaster status',
    response: `{ "active": true, "disaster": { "type": "Flash Flood", "message": "..." } }`,
  },
  {
    method: 'DELETE',
    path: '/api/disaster',
    description: 'Clears active public disaster and notifies mobile clients',
    response: `{ "success": true }`,
  },
];

const wsEvents = [
  {
    direction: 'Client -> Server',
    action: 'register',
    payload: `{ "action": "register", "mobileId": "MOBILE-8491", "nodeId": 5 }`,
    note: 'Registers mobile client and tracks live node position',
  },
  {
    direction: 'Client -> Server',
    action: 'route',
    payload: `{ "action": "route", "mobileId": "MOBILE-8491", "startNodeId": 1, "destinationNodeId": 24 }`,
    note: 'Requests A* shortest path from authoritative C++ backend graph',
  },
  {
    direction: 'Server -> Client',
    action: 'emergency-corridor',
    payload: `{ "action": "emergency-corridor", "message": "Corridor active", "pathNodes": [1, 2, 5, 8] }`,
    note: 'Pushed to mobile users standing on or routed along the green corridor',
  },
];

export default function ApiDocs() {
  return (
    <div className="api-docs-container">
      <div className="docs-header">
        <div>
          <p className="section-kicker">C++ CROW BACKEND</p>
          <h2>API & WebSocket Specification</h2>
        </div>
        <div className="backend-badge">
          <IconServer size={18} /> C++ Crow Engine (Port 3000)
        </div>
      </div>

      <section className="docs-section">
        <h3><IconCode size={20} /> REST Endpoints</h3>
        <div className="endpoints-list">
          {endpoints.map((ep) => (
            <div key={ep.path} className="endpoint-card">
              <div className="endpoint-meta">
                <span className={`method-badge ${ep.method.toLowerCase()}`}>{ep.method}</span>
                <code className="endpoint-path">{ep.path}</code>
              </div>
              <p className="endpoint-desc">{ep.description}</p>
              {ep.request && (
                <div className="code-block">
                  <small>REQUEST BODY</small>
                  <pre>{ep.request}</pre>
                </div>
              )}
              <div className="code-block">
                <small>RESPONSE BODY</small>
                <pre>{ep.response}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="docs-section" style={{ marginTop: 40 }}>
        <h3><IconSend size={20} /> WebSocket Gateway (ws://localhost:3000/ws)</h3>
        <div className="endpoints-list">
          {wsEvents.map((ws) => (
            <div key={ws.action} className="endpoint-card">
              <div className="endpoint-meta">
                <span className="method-badge ws">{ws.direction}</span>
                <code className="endpoint-path">action: "{ws.action}"</code>
              </div>
              <p className="endpoint-desc">{ws.note}</p>
              <div className="code-block">
                <small>PAYLOAD FORMAT</small>
                <pre>{ws.payload}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
