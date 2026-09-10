import { useState } from 'react';
import { IconBroadcast, IconX, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { declareDisaster, clearDisaster } from '../../services/emergencyApi';

export default function DisasterModal({ activeDisaster, onClose, onUpdate }) {
  const [type, setType] = useState('Severe Flash Flood');
  const [message, setMessage] = useState('Major evacuation route active. Drivers should avoid lower bypass road.');
  const [severity, setSeverity] = useState('high');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeclare = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await declareDisaster({ type, message, severity });
      onUpdate();
      onClose();
    } catch (err) {
      alert('Failed to broadcast disaster: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    setIsSubmitting(true);
    try {
      await clearDisaster();
      onUpdate();
      onClose();
    } catch (err) {
      alert('Failed to clear disaster: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="disaster-title">
        <div className="modal-head">
          <div>
            <p className="section-kicker">PUBLIC SAFETY CONTROL</p>
            <h2 id="disaster-title">Public Disaster Broadcast</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        {activeDisaster ? (
          <div className="disaster-active-box">
            <div className="alert-badge warning">
              <IconAlertTriangle size={18} /> Active Disaster Recorded
            </div>
            <h3>{activeDisaster.type || 'Disaster Alert'}</h3>
            <p>{activeDisaster.message}</p>
            <small>Severity: <strong>{(activeDisaster.severity || 'high').toUpperCase()}</strong></small>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="secondary-button" onClick={onClose}>
                Close
              </button>
              <button type="button" className="danger-button" onClick={handleClear} disabled={isSubmitting}>
                <IconTrash size={16} /> Clear Public Disaster
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDeclare}>
            <label>
              Disaster Type
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. Flash Flood, Earthquake"
                required
              />
            </label>

            <label>
              Public Broadcast Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Broadcast instructions to mobile users..."
                rows={3}
                required
              />
            </label>

            <label>
              Severity Level
              <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="critical">Critical Emergency</option>
                <option value="high">High Alert</option>
                <option value="medium">Medium Warning</option>
                <option value="low">Low Priority Info</option>
              </select>
            </label>

            <div className="location-box">
              <IconBroadcast size={18} />
              <span>
                Communicates via <strong>POST /api/disaster</strong> and instantly broadcasts over <strong>WebSocket /ws</strong> to all active mobile clients.
              </span>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                <IconBroadcast size={16} /> Broadcast Alert
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
