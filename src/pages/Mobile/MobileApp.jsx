import { useState, useEffect } from 'react';
import {
  IconDeviceMobile, IconNavigation, IconAlertTriangle, IconCheck, IconRefresh,
  IconArrowLeft, IconRoute2, IconWifi, IconWifiOff, IconBroadcast,
} from '@tabler/icons-react';
import { MobileWebSocketClient } from '../../services/mobileApi';
import { getGraph } from '../../services/graphApi';

export default function MobileApp({ onBackToDashboard }) {
  const [mobileId] = useState(`MOBILE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [startNodeId, setStartNodeId] = useState(1);
  const [destNodeId, setDestNodeId] = useState(15);
  const [activeRoute, setActiveRoute] = useState(null);
  const [corridorAlert, setCorridorAlert] = useState(null);
  const [disasterAlert, setDisasterAlert] = useState(null);
  const [graphNodes, setGraphNodes] = useState([]);
  const [wsClient, setWsClient] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  useEffect(() => {
    getGraph().then((data) => {
      if (data && data.nodes) setGraphNodes(data.nodes);
    });

    const client = new MobileWebSocketClient(
      mobileId,
      (data) => {
        addLog(`Received WS message: ${data.action || 'payload'}`);

        if (data.action === 'route') {
          setActiveRoute(data);
          addLog(`Route calculated: ${data.nodes?.length || 0} nodes, distance ${data.distance?.toFixed(0)}m`);
        } else if (data.action === 'disaster') {
          setDisasterAlert(data);
          addLog(`ALERT: Disaster declared — ${data.type}`);
        } else if (data.action === 'disaster-cleared') {
          setDisasterAlert(null);
          addLog(`Disaster cleared`);
        } else if (data.action === 'emergency-corridor') {
          setCorridorAlert(data);
          addLog(`ALERT: Green corridor active along path!`);
        } else if (data.action === 'route-error') {
          alert('Routing error from C++ server: ' + data.message);
        }
      },
      (status) => {
        setWsStatus(status);
        addLog(`WebSocket status: ${status}`);
      }
    );

    client.connect();
    setWsClient(client);

    return () => {
      client.close();
    };
  }, [mobileId]);

  const handleRequestRoute = (e) => {
    e.preventDefault();
    if (!wsClient) return;
    addLog(`Requesting A* route from Node #${startNodeId} to Node #${destNodeId}...`);
    wsClient.requestRoute(Number(startNodeId), Number(destNodeId));
  };

  return (
    <div className="mobile-shell">
      {/* Mobile Device Frame Header */}
      <header className="mobile-header">
        <button className="icon-button" type="button" onClick={onBackToDashboard} title="Back to Command Center">
          <IconArrowLeft size={20} />
        </button>
        <div className="mobile-header-title">
          <IconDeviceMobile size={20} />
          <span>Public Route Navigation</span>
        </div>
        <div className={`ws-badge ${wsStatus}`}>
          {wsStatus === 'connected' ? <IconWifi size={16} /> : <IconWifiOff size={16} />}
          <span>{wsStatus.toUpperCase()}</span>
        </div>
      </header>

      <main className="mobile-content">
        {/* Disaster Alert Banner */}
        {disasterAlert && (
          <div className="disaster-banner">
            <IconBroadcast size={24} className="banner-icon" />
            <div>
              <strong>PUBLIC SAFETY ALERT: {disasterAlert.type}</strong>
              <p>{disasterAlert.message}</p>
            </div>
          </div>
        )}

        {/* Green Corridor Alert Banner */}
        {corridorAlert && (
          <div className="corridor-banner">
            <IconAlertTriangle size={24} className="banner-icon" />
            <div>
              <strong>EMERGENCY GREEN CORRIDOR ACTIVE</strong>
              <p>{corridorAlert.message}</p>
            </div>
          </div>
        )}

        {/* Route Selector Form */}
        <section className="mobile-card">
          <h2><IconNavigation size={20} /> Request Authoritative Route</h2>
          <form onSubmit={handleRequestRoute}>
            <div className="mobile-form-row">
              <label>
                Current Node (Start)
                <select
                  value={startNodeId}
                  onChange={(e) => setStartNodeId(Number(e.target.value))}
                >
                  {graphNodes.map((n) => (
                    <option key={n.id} value={n.id}>Node #{n.id}</option>
                  ))}
                </select>
              </label>

              <label>
                Destination Node
                <select
                  value={destNodeId}
                  onChange={(e) => setDestNodeId(Number(e.target.value))}
                >
                  {graphNodes.map((n) => (
                    <option key={n.id} value={n.id}>Node #{n.id}</option>
                  ))}
                </select>
              </label>
            </div>

            <button type="submit" className="primary-button full-width" disabled={wsStatus !== 'connected'}>
              <IconRoute2 size={18} /> Calculate A* Route over WebSocket
            </button>
          </form>
        </section>

        {/* Active Route View */}
        {activeRoute && (
          <section className="mobile-card route-card">
            <div className="route-header">
              <span className="route-success-tag"><IconCheck size={16} /> ROUTE READY</span>
              <h3>Distance: {(activeRoute.distance || 0).toFixed(0)} meters</h3>
            </div>

            <div className="route-path-summary">
              <div>
                <small>Waypoints</small>
                <strong>{activeRoute.nodes?.length || 0} Nodes</strong>
              </div>
              <div>
                <small>Road Segments</small>
                <strong>{activeRoute.edges?.length || 0} Edges</strong>
              </div>
              <div>
                <small>Mobile Client ID</small>
                <strong>{mobileId}</strong>
              </div>
            </div>

            <div className="nodes-sequence">
              <small>PATH TRAJECTORY:</small>
              <div className="node-chips">
                {activeRoute.nodes?.map((n, idx) => (
                  <span key={idx} className="node-chip">
                    #{typeof n === 'object' ? n.id : n}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WebSocket Activity Log */}
        <section className="mobile-card logs-card">
          <h3>WebSocket Traffic Log ({mobileId})</h3>
          <div className="logs-box">
            {logs.map((log, i) => (
              <div key={i} className="log-line">{log}</div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
