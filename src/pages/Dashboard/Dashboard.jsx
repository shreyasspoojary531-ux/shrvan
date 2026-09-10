import { useState, useEffect } from 'react';
import {
  IconActivityHeartbeat, IconAlertTriangle, IconAmbulance,
  IconBuildingHospital, IconChevronDown, IconCircleDot, IconDatabase, IconDatabaseOff,
  IconFiretruck, IconMap2, IconMenu2,
  IconPlus, IconRefresh, IconRoute2, IconShield, IconSos, IconX, IconBroadcast, IconCode, IconDeviceMobile,
} from '@tabler/icons-react';
import { getGraph } from '../../services/graphApi';
import { getFacilities } from '../../services/facilityApi';
import { getSystemStatus } from '../../services/api';
import { getActiveDisaster, clearDisaster } from '../../services/emergencyApi';
import EmergencyPointModal from '../../components/Emergency/EmergencyPointModal';
import DisasterModal from '../../components/Emergency/DisasterModal';
import GraphMap from '../../components/Map/GraphMap';
import ApiDocs from '../../components/Documentation/ApiDocs';

const navItems = [
  ['Dashboard', IconActivityHeartbeat],
  ['Map', IconMap2],
  ['Emergency Points', IconSos],
  ['Facilities', IconBuildingHospital],
  ['Routing', IconRoute2],
  ['Disaster Control', IconBroadcast],
  ['API Docs', IconCode],
];

export default function Dashboard({ onNavigateMobile }) {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showNodes, setShowNodes] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [showNodeIds, setShowNodeIds] = useState(false);
  const [showEdgeIds, setShowEdgeIds] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState(null);

  const [isFormOpen, setFormOpen] = useState(false);
  const [isDisasterOpen, setDisasterOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Live Backend State
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [facilities, setFacilities] = useState({ hospitals: [], ambulanceHubs: [], policeStations: [], fireStations: [] });
  const [emergencyPoint, setEmergencyPoint] = useState(null);
  const [activeDisaster, setActiveDisaster] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [systemOnline, setSystemOnline] = useState(false);
  const [graphState, setGraphState] = useState('idle');

  // Load Graph & Facilities
  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function checkStatus() {
    try {
      await getSystemStatus();
      setSystemOnline(true);
    } catch {
      setSystemOnline(false);
    }
  }

  async function fetchInitialData() {
    setGraphState('loading');
    checkStatus();
    try {
      const [gData, fData, dData] = await Promise.all([
        getGraph(),
        getFacilities(),
        getActiveDisaster(),
      ]);
      setGraphData(gData || { nodes: [], edges: [] });
      setFacilities(fData || { hospitals: [], ambulanceHubs: [], policeStations: [], fireStations: [] });
      if (dData && dData.active) {
        setActiveDisaster(dData.disaster);
      }
      setGraphState('ready');
    } catch (err) {
      console.warn('[Dashboard] Data fetch error:', err);
      setGraphState('error');
    }
  }

  const handleCreateEmergencySuccess = (result, targetNode) => {
    setEmergencyPoint(result);
    if (targetNode) setSelectedNode(targetNode);
  };

  const handleClearEmergency = () => {
    setEmergencyPoint(null);
  };

  const totalFacilities =
    (facilities.hospitals?.length || 0) +
    (facilities.ambulanceHubs?.length || 0) +
    (facilities.policeStations?.length || 0) +
    (facilities.fireStations?.length || 0);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><IconRoute2 size={21} /></span>
          <span>GCCS</span>
        </div>
        <p className="brand-subtitle">GREEN CORRIDOR<br />COMMAND SYSTEM</p>
        
        <nav aria-label="Command center navigation">
          <p className="nav-label">COMMAND CENTER</p>
          {navItems.map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              className={`nav-item ${activeNav === name ? 'selected' : ''}`}
              onClick={() => {
                setActiveNav(name);
                setSidebarOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}

          <p className="nav-label nav-label-spaced">PUBLIC INTERFACE</p>
          <button
            type="button"
            className="nav-item mobile-nav-btn"
            onClick={onNavigateMobile}
          >
            <IconDeviceMobile size={18} />
            <span>Mobile Driver App</span>
            <small className="live-pill">WS LIVE</small>
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className={`live-dot ${systemOnline ? 'online' : ''}`} />
          {systemOnline ? 'C++ CROW ONLINE' : 'STANDBY / OFFLINE'}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button
            className="mobile-menu"
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
            <IconMenu2 />
          </button>
          <div>
            <p className="section-kicker">COMMAND CENTER / {activeNav.toUpperCase()}</p>
            <h1>Operational Overview</h1>
          </div>
          <div className="topbar-actions">
            <span className="clock">
              SERVER <strong>PORT 3000</strong>
            </span>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setDisasterOpen(true)}
              style={{ padding: '6px 12px' }}
            >
              <IconBroadcast size={16} /> Broadcast Disaster
            </button>
          </div>
        </header>

        <section className="status-strip" aria-label="System status">
          <div>
            <span className="status-label">C++ CROW ENGINE</span>
            <strong>
              <span className={`live-dot ${systemOnline ? 'online' : ''}`} />
              {systemOnline ? 'ACTIVE (PORT 3000)' : 'STANDBY'}
            </strong>
          </div>
          <div>
            <span className="status-label">ACTIVE EMERGENCY</span>
            <strong className={emergencyPoint ? 'amber-value' : 'muted-value'}>
              {emergencyPoint ? emergencyPoint.name : 'NONE'}
            </strong>
          </div>
          <div>
            <span className="status-label">PUBLIC DISASTER</span>
            <strong className={activeDisaster ? 'red-value' : 'muted-value'}>
              {activeDisaster ? activeDisaster.type : 'NORMAL'}
            </strong>
          </div>
          <div className="status-note">
            Authoritative C++ Graph: {graphData.nodes.length} Nodes / {graphData.edges.length} Edges
          </div>
        </section>

        {activeNav === 'API Docs' ? (
          <ApiDocs />
        ) : (
          <>
            <div className="console-grid">
              <section className="map-panel panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-kicker">NETWORK GRAPH CANVAS</p>
                    <h2>Road Network & Facility Overlay</h2>
                  </div>
                  {systemOnline ? (
                    <div className="pending live-tag"><IconDatabase size={15} /> C++ Backend Connected</div>
                  ) : (
                    <div className="pending"><IconDatabaseOff size={15} /> C++ Backend Offline (Fallback Mode)</div>
                  )}
                </div>

                <GraphMap
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  facilities={facilities}
                  emergencyPoint={emergencyPoint}
                  showNodes={showNodes}
                  showEdges={showEdges}
                  showNodeIds={showNodeIds}
                  showEdgeIds={showEdgeIds}
                  selectedNode={selectedNode}
                  onSelectNode={setSelectedNode}
                  onRefreshGraph={fetchInitialData}
                  isLoading={graphState === 'loading'}
                />

                <div className="map-footer">
                  <span>NODES <strong>{graphData.nodes.length}</strong></span>
                  <span>EDGES <strong>{graphData.edges.length}</strong></span>
                  <span>
                    SELECTED NODE <strong>{selectedNode ? `#${selectedNode.id}` : 'NONE'}</strong>
                  </span>
                  {selectedNode && (
                    <span className="map-coordinates">
                      X: {selectedNode.x.toFixed(1)} &nbsp; Y: {selectedNode.y.toFixed(1)}
                    </span>
                  )}
                </div>
              </section>

              <aside className="controls-column">
                <section className="panel compact-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="section-kicker">LAYERS</p>
                      <h2>Graph Visibility</h2>
                    </div>
                  </div>
                  <div className="toggle-list">
                    <Toggle label="Nodes" checked={showNodes} onChange={setShowNodes} />
                    <Toggle label="Edges" checked={showEdges} onChange={setShowEdges} />
                    <Toggle label="Node IDs" checked={showNodeIds} onChange={setShowNodeIds} />
                    <Toggle label="Edge IDs" checked={showEdgeIds} onChange={setShowEdgeIds} />
                  </div>
                </section>

                <section className="panel compact-panel emergency-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="section-kicker">INCIDENT CONTROL</p>
                      <h2>Green Corridor Point</h2>
                    </div>
                    <IconAlertTriangle size={19} className={emergencyPoint ? 'amber-value' : ''} />
                  </div>

                  {emergencyPoint ? (
                    <div className="active-corridor-card">
                      <span className="badge-active">ACTIVE CORRIDOR</span>
                      <h3>{emergencyPoint.name}</h3>
                      <p>{emergencyPoint.description}</p>

                      <div className="corridor-stats">
                        <div><small>Type</small><strong>Type {emergencyPoint.typeofemergency}</strong></div>
                        <div><small>Corridor Length</small><strong>{emergencyPoint.path?.distance || 450} m</strong></div>
                      </div>

                      <button type="button" className="secondary-button" onClick={handleClearEmergency} style={{ width: '100%', marginTop: 12 }}>
                        <IconX size={16} /> Clear Corridor
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="empty-copy">No active green corridor emergency point.</p>
                      <button type="button" className="primary-button" onClick={() => setFormOpen(true)}>
                        <IconPlus size={17} /> Create Emergency Point
                      </button>
                      <p className="form-note">Calculates A* emergency route & redirects mobile traffic over WebSocket.</p>
                    </>
                  )}
                </section>
              </aside>
            </div>

            <section className="lower-grid">
              <section className="panel facilities-panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-kicker">RESPONSE NETWORK</p>
                    <h2>Emergency Facilities ({totalFacilities})</h2>
                  </div>
                </div>

                <div className="facility-grid">
                  <div className="facility-row hospital">
                    <span className="facility-icon hospital"><IconBuildingHospital size={20} /></span>
                    <span><strong>Hospitals</strong><small>Trauma & Emergency Care</small></span>
                    <span className="facility-count">{facilities.hospitals?.length || 0}</span>
                  </div>

                  <div className="facility-row ambulance">
                    <span className="facility-icon ambulance"><IconAmbulance size={20} /></span>
                    <span><strong>Ambulance Hubs</strong><small>Rapid EMS Units</small></span>
                    <span className="facility-count">{facilities.ambulanceHubs?.length || 0}</span>
                  </div>

                  <div className="facility-row police">
                    <span className="facility-icon police"><IconShield size={20} /></span>
                    <span><strong>Police Stations</strong><small>Traffic Enforcement</small></span>
                    <span className="facility-count">{facilities.policeStations?.length || 0}</span>
                  </div>

                  <div className="facility-row fire">
                    <span className="facility-icon fire"><IconFiretruck size={20} /></span>
                    <span><strong>Fire Stations</strong><small>Hazard & Rescue</small></span>
                    <span className="facility-count">{facilities.fireStations?.length || 0}</span>
                  </div>
                </div>
              </section>

              <section className="panel route-panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-kicker">ROUTING ENGINE</p>
                    <h2>C++ Crow A* Routing</h2>
                  </div>
                  <span className={`route-state ${emergencyPoint ? 'is-active' : ''}`}>
                    {emergencyPoint ? 'CORRIDOR ACTIVE' : 'READY'}
                  </span>
                </div>

                <div className="route-stops">
                  <div>
                    <span className="stop-marker start" />
                    <p>
                      START <strong>{emergencyPoint ? `Incident (${emergencyPoint.x.toFixed(0)}, ${emergencyPoint.y.toFixed(0)})` : 'Select node or create emergency point'}</strong>
                    </p>
                  </div>
                  <div>
                    <span className="stop-marker end" />
                    <p>
                      DESTINATION <strong>{emergencyPoint ? 'Nearest Matching Facility' : 'Authoritative C++ Facility Node'}</strong>
                    </p>
                  </div>
                </div>

                <div className="route-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setFormOpen(true)}
                    disabled={!!emergencyPoint}
                  >
                    <IconRoute2 size={17} /> Dispatch Emergency Corridor
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleClearEmergency}
                    disabled={!emergencyPoint}
                  >
                    <IconX size={17} /> Clear Route
                  </button>
                </div>
              </section>
            </section>
          </>
        )}
      </main>

      {isFormOpen && (
        <EmergencyPointModal
          nodes={graphData.nodes}
          selectedNode={selectedNode}
          onClose={() => setFormOpen(false)}
          onSuccess={handleCreateEmergencySuccess}
        />
      )}

      {isDisasterOpen && (
        <DisasterModal
          activeDisaster={activeDisaster}
          onClose={() => setDisasterOpen(false)}
          onUpdate={fetchInitialData}
        />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? 'checked' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </label>
  );
}
