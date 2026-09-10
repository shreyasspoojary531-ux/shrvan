import { useState } from 'react';
import { IconDeviceFloppy, IconMapPin, IconX, IconAlertTriangle } from '@tabler/icons-react';
import { createEmergencyPoint } from '../../services/emergencyApi';

export default function EmergencyPointModal({ nodes = [], onClose, onSuccess, selectedNode = null }) {
  const [name, setName] = useState('Highway Collision Incident');
  const [description, setDescription] = useState('Critical medical response required for green corridor creation');
  const [typeofemergency, setTypeofemergency] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(selectedNode ? selectedNode.id : (nodes[0]?.id || 1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const targetNode = nodes.find((n) => n.id === Number(selectedNodeId)) || nodes[0] || { x: 270, y: 220 };
    
    try {
      const result = await createEmergencyPoint({
        x: targetNode.x,
        y: targetNode.y,
        typeofemergency: Number(typeofemergency),
        name,
        description,
      });

      onSuccess(result, targetNode);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create emergency point');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="emergency-title">
        <div className="modal-head">
          <div>
            <p className="section-kicker">INCIDENT CORRIDOR CONTROL</p>
            <h2 id="emergency-title">Create Emergency Point</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <IconAlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Incident Title
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Highway incident"
              required
            />
          </label>

          <label>
            Description / Context
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Incident details"
              rows={2}
            />
          </label>

          <div className="form-split">
            <label>
              Emergency Type
              <select
                value={typeofemergency}
                onChange={(e) => setTypeofemergency(Number(e.target.value))}
              >
                <option value={1}>Type 1 — Medical / Ambulance</option>
                <option value={2}>Type 2 — Police Dispatch</option>
                <option value={3}>Type 3 — Fire Response</option>
              </select>
            </label>

            <label>
              Target Node Location
              <select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(Number(e.target.value))}
              >
                {nodes.length > 0 ? (
                  nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      Node #{n.id} (X: {n.x.toFixed(1)}, Y: {n.y.toFixed(1)})
                    </option>
                  ))
                ) : (
                  <option value={1}>Default Graph Node #1</option>
                )}
              </select>
            </label>
          </div>

          <div className="location-box">
            <IconMapPin size={18} />
            <span>
              Connected to <strong>POST /api/graph/emergency</strong>. Submitting will clear traffic and activate the authoritative C++ green corridor route.
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              <IconDeviceFloppy size={16} />
              {isSubmitting ? 'Activating Corridor...' : 'Create Point'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
