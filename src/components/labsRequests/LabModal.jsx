import { useState, useEffect } from 'react';
import { X, Server } from 'lucide-react';
import { validateLabInput } from '../../utils/validation';

export default function LabModal({
  isOpen,
  onClose,
  onSave,
  existingLabs = [],
  editingLab = null
}) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    capacity: '',
    availableSlots: ['S1', 'S2', 'S3'],
    type: 'General Computer Lab'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingLab) {
      setFormData({
        id: editingLab.id,
        name: editingLab.name || editingLab.id,
        capacity: editingLab.capacity,
        availableSlots: [...editingLab.availableSlots],
        type: editingLab.type || 'General Computer Lab'
      });
    } else {
      setFormData({
        id: '',
        name: '',
        capacity: '',
        availableSlots: ['S1', 'S2', 'S3'],
        type: 'General Computer Lab'
      });
    }
    setErrors({});
  }, [editingLab, isOpen]);

  if (!isOpen) return null;

  const handleSlotToggle = (slot) => {
    const current = formData.availableSlots;
    let updated;
    if (current.includes(slot)) {
      updated = current.filter((s) => s !== slot);
    } else {
      updated = [...current, slot].sort();
    }
    setFormData({ ...formData, availableSlots: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const labToValidate = {
      ...formData,
      capacity: Number(formData.capacity)
    };

    const validation = validateLabInput(labToValidate, existingLabs, editingLab ? editingLab.id : null);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(labToValidate);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={18} className="text-blue" />
            <span>{editingLab ? 'Edit Laboratory' : 'Add New Laboratory'}</span>
          </h3>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Lab ID */}
            <div className="form-group">
              <label className="form-label">Laboratory ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lab E"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!editingLab}
              />
              {errors.id && <span className="form-error">{errors.id}</span>}
            </div>

            {/* Lab Name / Department */}
            <div className="form-group">
              <label className="form-label">Display Name / Facility</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. High Performance Computing Lab"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Capacity */}
            <div className="form-group">
              <label className="form-label">Computer Seating Capacity *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 60"
                min="1"
                step="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
              {errors.capacity && <span className="form-error">{errors.capacity}</span>}
            </div>

            {/* Available Slots */}
            <div className="form-group">
              <label className="form-label">Operational Time Slots *</label>
              <div className="slot-checkbox-group">
                {['S1', 'S2', 'S3'].map((slot) => {
                  const isChecked = formData.availableSlots.includes(slot);
                  return (
                    <label key={slot} className={`slot-checkbox-pill ${isChecked ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSlotToggle(slot)}
                      />
                      <span>Slot {slot}</span>
                    </label>
                  );
                })}
              </div>
              {errors.availableSlots && <span className="form-error">{errors.availableSlots}</span>}
            </div>

            {/* Lab Category */}
            <div className="form-group">
              <label className="form-label">Laboratory Specialization</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="General / HPC">General / HPC</option>
                <option value="Networking">Networking</option>
                <option value="Software Dev">Software Dev</option>
                <option value="Hardware / IoT">Hardware / IoT</option>
                <option value="AI / Data Science">AI / Data Science</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {editingLab ? 'Save Changes' : 'Create Laboratory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
