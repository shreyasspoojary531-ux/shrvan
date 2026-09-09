import { IconDatabaseOff, IconDeviceFloppy, IconMapPin, IconX } from '@tabler/icons-react';

export default function EmergencyPointModal({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="emergency-title">
        <div className="modal-head">
          <div><p className="section-kicker">NEW INCIDENT</p><h2 id="emergency-title">Create emergency point</h2></div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}><IconX size={18} /></button>
        </div>
        <div className="pending"><IconDatabaseOff size={15} /> Endpoint and payload have not been verified</div>
        <form>
          <label>Name<input placeholder="e.g. Highway incident" disabled /></label>
          <label>Description<textarea placeholder="Incident details" disabled /></label>
          <div className="form-split"><label>Emergency type<select disabled><option>Medical</option></select></label><label>Priority<select disabled><option>Critical</option></select></label></div>
          <label>Related facility<select disabled><option>Select facility type</option></select></label>
          <div className="location-box"><IconMapPin size={18} /><span>Choose an existing node, map coordinate, or road after graph data is connected.</span></div>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled><IconDeviceFloppy size={16} />Create point</button></div>
        </form>
      </section>
    </div>
  );
}
