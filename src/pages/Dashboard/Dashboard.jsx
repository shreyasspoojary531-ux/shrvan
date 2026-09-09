import { useState } from 'react';
import {
  IconActivityHeartbeat, IconAlertTriangle, IconAmbulance, IconArrowsMaximize,
  IconBuildingHospital, IconChevronDown, IconCircleDot, IconDatabaseOff,
  IconFiretruck, IconMap2, IconMenu2,
  IconPlus, IconRefresh, IconRoute2, IconShield, IconSos, IconX,
  IconZoomIn, IconZoomOut,
} from '@tabler/icons-react';
import { getGraph } from '../../services/graphApi';
import EmergencyPointModal from '../../components/Emergency/EmergencyPointModal';

const nav = [
  ['Dashboard', IconActivityHeartbeat], ['Map', IconMap2], ['Emergency Points', IconSos],
  ['Hospitals', IconBuildingHospital], ['Ambulance Hubs', IconAmbulance],
  ['Police Stations', IconShield], ['Fire Stations', IconFiretruck], ['Routing', IconRoute2],
  ['System Status', IconCircleDot],
];

const soon = ['Graph Editor', 'Traffic / Obstacles', 'Mobile Users'];

const facilityGroups = [
  ['Hospitals', IconBuildingHospital, 'hospital'],
  ['Ambulance Hubs', IconAmbulance, 'ambulance'],
  ['Police Stations', IconShield, 'police'],
  ['Fire Stations', IconFiretruck, 'fire'],
];

function Pending({ label = 'Backend connection pending' }) {
  return <div className="pending"><IconDatabaseOff size={15} /> {label}</div>;
}

function IconButton({ label, children, onClick, active = false }) {
  return <button className={`icon-button ${active ? 'is-active' : ''}`} type="button" aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

export default function App() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [showNodes, setShowNodes] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [showNodeIds, setShowNodeIds] = useState(false);
  const [showEdgeIds, setShowEdgeIds] = useState(false);
  const [facility, setFacility] = useState(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [graphState, setGraphState] = useState('idle');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mapTransform, setMapTransform] = useState({ zoom: 1, x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);

  async function refreshGraph() {
    setGraphState('loading');
    try {
      await getGraph();
      setGraphState('ready');
    } catch {
      setGraphState('pending');
    }
  }

  const adjustZoom = (amount) => setMapTransform((current) => ({ ...current, zoom: Math.min(2.5, Math.max(.5, current.zoom + amount)) }));
  const fitMap = () => setMapTransform({ zoom: 1, x: 0, y: 0 });
  const startPan = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ pointerX: event.clientX, pointerY: event.clientY, originX: mapTransform.x, originY: mapTransform.y });
  };
  const panMap = (event) => {
    if (!dragStart) return;
    setMapTransform((current) => ({ ...current, x: dragStart.originX + event.clientX - dragStart.pointerX, y: dragStart.originY + event.clientY - dragStart.pointerY }));
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><IconRoute2 size={21} /></span><span>GCCS</span></div>
        <p className="brand-subtitle">GREEN CORRIDOR<br />COMMAND SYSTEM</p>
        <nav aria-label="Command center navigation">
          <p className="nav-label">COMMAND</p>
          {nav.map(([name, Icon]) => <button key={name} type="button" className={`nav-item ${activeNav === name ? 'selected' : ''}`} onClick={() => { setActiveNav(name); setSidebarOpen(false); }}><Icon size={18} /><span>{name}</span></button>)}
          <p className="nav-label nav-label-spaced">PLANNING</p>
          {soon.map((name) => <button key={name} type="button" className="nav-item disabled" disabled><span className="nav-placeholder" /><span>{name}</span><small>SOON</small></button>)}
        </nav>
        <div className="sidebar-footer"><span className="live-dot" />CONSOLE OFFLINE</div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="mobile-menu" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(!isSidebarOpen)}><IconMenu2 /></button>
          <div><p className="section-kicker">COMMAND CENTER / {activeNav.toUpperCase()}</p><h1>Operational overview</h1></div>
          <div className="topbar-actions"><span className="clock">LOCAL TIME <strong>--:--:--</strong></span><button type="button" className="operator"><span>OPERATOR</span><IconChevronDown size={16} /></button></div>
        </header>

        <section className="status-strip" aria-label="System status">
          <div><span className="status-label">SYSTEM</span><strong><span className="live-dot" />STANDBY</strong></div>
          <div><span className="status-label">ACTIVE INCIDENT</span><strong className="muted-value">NONE</strong></div>
          <div><span className="status-label">ROUTE ENGINE</span><strong className="amber-value">VERIFY BACKEND</strong></div>
          <div className="status-note">Awaiting authoritative Crow API</div>
        </section>

        <div className="console-grid">
          <section className="map-panel panel">
            <div className="panel-heading"><div><p className="section-kicker">NETWORK VIEW</p><h2>Road graph</h2></div><Pending label={graphState === 'loading' ? 'Refreshing graph' : 'No verified graph endpoint'} /></div>
            <div className="map-canvas" aria-label="Graph map, backend data unavailable" onPointerDown={startPan} onPointerMove={panMap} onPointerUp={() => setDragStart(null)} onPointerCancel={() => setDragStart(null)} onWheel={(event) => { event.preventDefault(); adjustZoom(event.deltaY < 0 ? .1 : -.1); }}>
              <div className="map-grid" style={{ transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.zoom})` }} />
              <div className="map-empty"><IconMap2 size={34} /><strong>Graph unavailable</strong><p>Connect the verified Crow graph endpoint to render nodes, roads, and route geometry.</p></div>
              <div className="map-scale"><span>0</span><i /><span>500 m</span></div>
              <div className="map-tools">
                <IconButton label="Zoom in" onClick={() => adjustZoom(.15)}><IconZoomIn size={18} /></IconButton>
                <IconButton label="Zoom out" onClick={() => adjustZoom(-.15)}><IconZoomOut size={18} /></IconButton>
                <IconButton label="Fit graph" onClick={fitMap}><IconArrowsMaximize size={18} /></IconButton>
                <IconButton label="Refresh graph" onClick={refreshGraph} active={graphState === 'loading'}><IconRefresh size={18} /></IconButton>
              </div>
            </div>
            <div className="map-footer"><span>NODES <strong>--</strong></span><span>EDGES <strong>--</strong></span><span>SELECTED <strong>NONE</strong></span><span className="map-coordinates">X: --.---- &nbsp; Y: --.----</span></div>
          </section>

          <aside className="controls-column">
            <section className="panel compact-panel"><div className="panel-heading"><div><p className="section-kicker">LAYERS</p><h2>Graph visibility</h2></div></div>
              <div className="toggle-list">
                <Toggle label="Nodes" checked={showNodes} onChange={setShowNodes} />
                <Toggle label="Edges" checked={showEdges} onChange={setShowEdges} />
                <Toggle label="Node IDs" checked={showNodeIds} onChange={setShowNodeIds} />
                <Toggle label="Edge IDs" checked={showEdgeIds} onChange={setShowEdgeIds} />
              </div>
            </section>
            <section className="panel compact-panel emergency-panel"><div className="panel-heading"><div><p className="section-kicker">INCIDENT CONTROL</p><h2>Emergency point</h2></div><IconAlertTriangle size={19} className="amber-value" /></div>
              <p className="empty-copy">No active emergency point.</p>
              <button type="button" className="primary-button" onClick={() => setFormOpen(true)}><IconPlus size={17} />Create emergency point</button>
              <p className="form-note">Creation will be enabled after the emergency-point API is verified.</p>
            </section>
          </aside>
        </div>

        <section className="lower-grid">
          <section className="panel facilities-panel"><div className="panel-heading"><div><p className="section-kicker">RESPONSE NETWORK</p><h2>Facilities</h2></div><Pending label="Facility APIs pending" /></div>
            <div className="facility-grid">{facilityGroups.map(([name, Icon, key]) => <button key={key} type="button" className={`facility-row ${facility === key ? 'selected' : ''}`} onClick={() => setFacility(facility === key ? null : key)}><span className={`facility-icon ${key}`}><Icon size={20} /></span><span><strong>{name}</strong><small>Awaiting facility feed</small></span><span className="facility-count">--</span></button>)}</div>
          </section>
          <section className="panel route-panel"><div className="panel-heading"><div><p className="section-kicker">ROUTING</p><h2>Emergency route</h2></div><span className="route-state">NOT READY</span></div>
            <div className="route-stops"><div><span className="stop-marker start" /><p>START <strong>Emergency point not set</strong></p></div><div><span className="stop-marker end" /><p>END <strong>Facility not selected</strong></p></div></div>
            <div className="route-actions"><button type="button" className="primary-button" disabled><IconRoute2 size={17} />Calculate route</button><button type="button" className="secondary-button" disabled><IconX size={17} />Clear route</button></div>
            <p className="form-note">BACKEND TODO: verify route request fields and returned path structure.</p>
          </section>
        </section>
      </main>

      {isFormOpen && <EmergencyPointModal onClose={() => setFormOpen(false)} />}
    </div>
  );
}

function Toggle({ label, checked, onChange }) { return <label className="toggle-row"><span>{label}</span><button type="button" role="switch" aria-checked={checked} className={`toggle ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)}><span /></button></label>; }
