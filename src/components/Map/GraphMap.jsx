import { useState, useRef } from 'react';
import {
  IconBuildingHospital, IconAmbulance, IconShield, IconFiretruck,
  IconMapPin, IconZoomIn, IconZoomOut, IconArrowsMaximize, IconRefresh,
} from '@tabler/icons-react';

export default function GraphMap({
  nodes = [],
  edges = [],
  facilities = {},
  emergencyPoint = null,
  activeRoute = null,
  showNodes = true,
  showEdges = true,
  showNodeIds = false,
  showEdgeIds = false,
  selectedNode = null,
  onSelectNode = () => {},
  onRefreshGraph = () => {},
  isLoading = false,
}) {
  const [transform, setTransform] = useState({ zoom: 1, x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const canvasRef = useRef(null);

  const adjustZoom = (delta) => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.min(3, Math.max(0.4, Number((prev.zoom + delta).toFixed(2)))),
    }));
  };

  const fitMap = () => setTransform({ zoom: 1, x: 0, y: 0 });

  const startPan = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStart({
      pointerX: e.clientX,
      pointerY: e.clientY,
      originX: transform.x,
      originY: transform.y,
    });
  };

  const panMap = (e) => {
    if (!dragStart) return;
    setTransform((prev) => ({
      ...prev,
      x: dragStart.originX + e.clientX - dragStart.pointerX,
      y: dragStart.originY + e.clientY - dragStart.pointerY,
    }));
  };

  const endPan = () => setDragStart(null);

  const handleWheel = (e) => {
    e.preventDefault();
    adjustZoom(e.deltaY < 0 ? 0.15 : -0.15);
  };

  // Map helper calculations
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Active corridor / route highlighted nodes and edges
  const highlightedNodeIds = new Set(
    emergencyPoint?.path?.nodes?.map((n) => (typeof n === 'object' ? n.id : n)) ||
      activeRoute?.nodes ||
      []
  );

  const highlightedEdgeIds = new Set(activeRoute?.edges || []);

  // Calculate bounding box for SVG viewBox to automatically center map coordinates
  let minX = 0, maxX = 1000, minY = 0, maxY = 800;
  if (nodes.length > 0) {
    minX = Math.min(...nodes.map((n) => n.x));
    maxX = Math.max(...nodes.map((n) => n.x));
    minY = Math.min(...nodes.map((n) => n.y));
    maxY = Math.max(...nodes.map((n) => n.y));
    // Include facilities in bounding box if available
    Object.values(facilities).flat().forEach((f) => {
      if (f && typeof f.x === 'number') {
        minX = Math.min(minX, f.x);
        maxX = Math.max(maxX, f.x);
        minY = Math.min(minY, f.y);
        maxY = Math.max(maxY, f.y);
      }
    });
  }
  const padding = 80;
  const viewBoxStr = `${minX - padding} ${minY - padding} ${Math.max(200, maxX - minX + padding * 2)} ${Math.max(200, maxY - minY + padding * 2)}`;

  return (
    <div
      className="map-canvas interactive-map"
      ref={canvasRef}
      onPointerDown={startPan}
      onPointerMove={panMap}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onWheel={handleWheel}
    >
      <svg
        className="map-svg-viewport"
        viewBox={viewBoxStr}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          <radialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <filter id="corridorGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. EDGES */}
        {showEdges &&
          edges.map((e) => {
            const fromNode = nodeMap.get(e.from);
            const toNode = nodeMap.get(e.to);
            const x1 = e.x1 !== undefined ? e.x1 : fromNode?.x;
            const y1 = e.y1 !== undefined ? e.y1 : fromNode?.y;
            const x2 = e.x2 !== undefined ? e.x2 : toNode?.x;
            const y2 = e.y2 !== undefined ? e.y2 : toNode?.y;

            if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;

            const isHighlighted = highlightedEdgeIds.has(e.id) ||
              (highlightedNodeIds.has(e.from) && highlightedNodeIds.has(e.to));

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={`edge-${e.id}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={`edge-line ${isHighlighted ? 'edge-corridor' : ''}`}
                  strokeWidth={isHighlighted ? 6 : 2}
                />
                {showEdgeIds && (
                  <text x={midX} y={midY - 4} className="edge-id-label">
                    E{e.id} {e.cost ? `(${e.cost}m)` : ''}
                  </text>
                )}
              </g>
            );
          })}

        {/* 2. NODES */}
        {showNodes &&
          nodes.map((n) => {
            const isSelected = selectedNode?.id === n.id;
            const isCorridorNode = highlightedNodeIds.has(n.id);
            const isEmergencyNode = emergencyPoint && Math.hypot(n.x - emergencyPoint.x, n.y - emergencyPoint.y) < 25;

            return (
              <g
                key={`node-${n.id}`}
                transform={`translate(${n.x}, ${n.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(n);
                }}
                onMouseEnter={() => setHoverInfo(n)}
                onMouseLeave={() => setHoverInfo(null)}
                style={{ cursor: 'pointer' }}
              >
                {isCorridorNode && (
                  <circle r={18} fill="url(#greenGlow)" className="corridor-pulse-ring" />
                )}
                <circle
                  r={isSelected ? 10 : isCorridorNode ? 8 : 6}
                  className={`node-circle ${
                    isSelected
                      ? 'is-selected'
                      : isEmergencyNode
                      ? 'is-emergency'
                      : isCorridorNode
                      ? 'is-corridor'
                      : ''
                  }`}
                />
                {showNodeIds && (
                  <text y={-12} className="node-id-label">
                    #{n.id}
                  </text>
                )}
              </g>
            );
          })}

        {/* 3. FACILITIES OVERLAY */}
        {facilities.hospitals?.map((h) => (
          <g key={`hosp-${h.id}`} transform={`translate(${h.x}, ${h.y})`} className="facility-marker hospital">
            <rect x="-14" y="-14" width="28" height="28" rx="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">H</text>
            <text x="0" y="24" textAnchor="middle" className="facility-map-label">{h.name}</text>
          </g>
        ))}

        {facilities.ambulanceHubs?.map((a) => (
          <g key={`amb-${a.id}`} transform={`translate(${a.x}, ${a.y})`} className="facility-marker ambulance">
            <rect x="-12" y="-12" width="24" height="24" rx="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">EMS</text>
            <text x="0" y="22" textAnchor="middle" className="facility-map-label">{a.name}</text>
          </g>
        ))}

        {facilities.policeStations?.map((p) => (
          <g key={`pol-${p.id}`} transform={`translate(${p.x}, ${p.y})`} className="facility-marker police">
            <rect x="-12" y="-12" width="24" height="24" rx="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">POL</text>
            <text x="0" y="22" textAnchor="middle" className="facility-map-label">{p.name}</text>
          </g>
        ))}

        {facilities.fireStations?.map((f) => (
          <g key={`fire-${f.id}`} transform={`translate(${f.x}, ${f.y})`} className="facility-marker fire">
            <rect x="-12" y="-12" width="24" height="24" rx="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">FIR</text>
            <text x="0" y="22" textAnchor="middle" className="facility-map-label">{f.name}</text>
          </g>
        ))}

        {/* 4. EMERGENCY INCIDENT POINT */}
        {emergencyPoint && (
          <g transform={`translate(${emergencyPoint.x}, ${emergencyPoint.y})`} className="emergency-point-beacon">
            <circle r={25} fill="#f43f5e" opacity="0.3" className="beacon-ping" />
            <circle r={14} fill="#f43f5e" stroke="#ffffff" strokeWidth="3" />
            <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">SOS</text>
          </g>
        )}
      </svg>

      {/* Map Tools */}
      <div className="map-tools">
        <button className="icon-button" title="Zoom In" onClick={() => adjustZoom(0.15)}>
          <IconZoomIn size={18} />
        </button>
        <button className="icon-button" title="Zoom Out" onClick={() => adjustZoom(-0.15)}>
          <IconZoomOut size={18} />
        </button>
        <button className="icon-button" title="Fit Graph" onClick={fitMap}>
          <IconArrowsMaximize size={18} />
        </button>
        <button className={`icon-button ${isLoading ? 'is-active' : ''}`} title="Refresh Graph" onClick={onRefreshGraph}>
          <IconRefresh size={18} />
        </button>
      </div>

      {/* Hover Info Tooltip */}
      {hoverInfo && (
        <div className="map-tooltip" style={{ left: hoverInfo.x * transform.zoom + transform.x + 20, top: hoverInfo.y * transform.zoom + transform.y - 30 }}>
          <strong>Node #{hoverInfo.id}</strong>
          <div>X: {hoverInfo.x.toFixed(1)} &nbsp; Y: {hoverInfo.y.toFixed(1)}</div>
          {hoverInfo.intersection_id && <small>{hoverInfo.intersection_id}</small>}
        </div>
      )}

      {/* Map Footer Scale */}
      <div className="map-scale">
        <span>0</span>
        <i />
        <span>500 m</span>
      </div>
    </div>
  );
}
