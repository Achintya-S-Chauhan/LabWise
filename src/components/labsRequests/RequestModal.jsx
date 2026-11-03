import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { validateRequestInput } from '../../utils/validation';

export default function RequestModal({
  isOpen,
  onClose,
  onSave,
  existingRequests = [],
  editingRequest = null
}) {
  const [formData, setFormData] = useState({
    id: '',
    department: '',
    computersNeeded: '',
    allowedSlots: ['S1'],
    priority: 'Normal',
    courseName: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingRequest) {
      setFormData({
        id: editingRequest.id,
        department: editingRequest.department,
        computersNeeded: editingRequest.computersNeeded,
        allowedSlots: [...editingRequest.allowedSlots],
        priority: editingRequest.priority || 'Normal',
        courseName: editingRequest.courseName || ''
      });
    } else {
      setFormData({
        id: '',
        department: '',
        computersNeeded: '',
        allowedSlots: ['S1'],
        priority: 'Normal',
        courseName: ''
      });
    }
    setErrors({});
  }, [editingRequest, isOpen]);

  if (!isOpen) return null;

  const handleSlotToggle = (slot) => {
    const current = formData.allowedSlots;
    let updated;
    if (current.includes(slot)) {
      updated = current.filter((s) => s !== slot);
    } else {
      updated = [...current, slot].sort();
    }
    setFormData({ ...formData, allowedSlots: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reqToValidate = {
      ...formData,
      computersNeeded: Number(formData.computersNeeded)
    };

    const validation = validateRequestInput(
      reqToValidate,
      existingRequests,
      editingRequest ? editingRequest.id : null
    );
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(reqToValidate);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} className="text-violet" />
            <span>{editingRequest ? 'Edit Laboratory Request' : 'New Academic Lab Request'}</span>
          </h3>
          <button className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Request ID */}
            <div className="form-group">
              <label className="form-label">Request ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. R6"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!editingRequest}
              />
              {errors.id && <span className="form-error">{errors.id}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science & Engineering (CSE)"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              {errors.department && <span className="form-error">{errors.department}</span>}
            </div>

            {/* Course Name */}
            <div className="form-group">
              <label className="form-label">Course / Laboratory Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Distributed Operating Systems Practical"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              />
            </div>

            {/* Computers Needed */}
            <div className="form-group">
              <label className="form-label">Computers Demanded (Seats) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 45"
                min="1"
                step="1"
                value={formData.computersNeeded}
                onChange={(e) => setFormData({ ...formData, computersNeeded: e.target.value })}
              />
              {errors.computersNeeded && (
                <span className="form-error">{errors.computersNeeded}</span>
              )}
            </div>

            {/* Allowed Slots */}
            <div className="form-group">
              <label className="form-label">Allowed Academic Time Slots *</label>
              <div className="slot-checkbox-group">
                {['S1', 'S2', 'S3'].map((slot) => {
                  const isChecked = formData.allowedSlots.includes(slot);
                  return (
                    <label
                      key={slot}
                      className={`slot-checkbox-pill ${isChecked ? 'active' : ''}`}
                    >
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
              {errors.allowedSlots && <span className="form-error">{errors.allowedSlots}</span>}
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Curricular Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Normal">Normal Curriculum</option>
                <option value="High">High (Examinations / Accreditation)</option>
                <option value="Low">Low (Elective Lab Session)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent btn-sm">
              {editingRequest ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
