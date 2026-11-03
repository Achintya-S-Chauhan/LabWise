import { useState } from 'react';
import {
  Server,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Search
} from 'lucide-react';
import LabModal from './LabModal';
import RequestModal from './RequestModal';

export default function LabsRequestsView({
  labs = [],
  requests = [],
  onSaveLab,
  onDeleteLab,
  onSaveRequest,
  onDeleteRequest,
  onExportJSON,
  onImportJSON,
  hasUnsavedChanges = false,
  activeSubTab = 'labs',
  onSubTabChange
}) {
  const [internalSubTab, setInternalSubTab] = useState('labs');
  const currentSubTab = onSubTabChange ? activeSubTab : internalSubTab;
  const setSubTab = onSubTabChange || setInternalSubTab;
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  const [deletingItem, setDeletingItem] = useState(null); // { type: 'lab'|'request', item }

  // Filtered lists
  const filteredLabs = labs.filter(
    (l) =>
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRequests = requests.filter(
    (r) =>
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.courseName && r.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddLab = () => {
    setEditingLab(null);
    setIsLabModalOpen(true);
  };

  const handleOpenEditLab = (lab) => {
    setEditingLab(lab);
    setIsLabModalOpen(true);
  };

  const handleOpenAddRequest = () => {
    setEditingRequest(null);
    setIsRequestModalOpen(true);
  };

  const handleOpenEditRequest = (req) => {
    setEditingRequest(req);
    setIsRequestModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.type === 'lab') {
      onDeleteLab(deletingItem.item.id);
    } else {
      onDeleteRequest(deletingItem.item.id);
    }
    setDeletingItem(null);
  };

  return (
    <div className="labs-requests-page">
      {/* Header and Sub-tab Controls */}
      <div className="section-toolbar">
        <div>
          <h2 className="page-title">
            <Server size={22} className="text-blue" />
            Campus Resources & Academic Demand Management
          </h2>
          <p className="page-subtitle">
            Configure laboratory capacities, time slot availabilities, and department computer requirements.
            All modifications automatically persist to IndexedDB.
          </p>
        </div>

        <div className="toolbar-actions">
          {currentSubTab === 'labs' ? (
            <button className="btn btn-primary" onClick={handleOpenAddLab}>
              <Plus size={16} />
              <span>Add Laboratory</span>
            </button>
          ) : (
            <button className="btn btn-accent" onClick={handleOpenAddRequest}>
              <Plus size={16} />
              <span>New Academic Request</span>
            </button>
          )}

          <button className="btn btn-secondary btn-sm" onClick={onExportJSON} title="Export database to JSON file">
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <label className="btn btn-secondary btn-sm file-input-label" title="Import database from JSON file">
            <Upload size={14} />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => onImportJSON(event.target.result);
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Subtab Toggle Buttons */}
      <div className="subtabs-bar">
        <div className="subtabs-group">
          <button
            className={`subtab-btn ${currentSubTab === 'labs' ? 'active' : ''}`}
            onClick={() => {
              setSubTab('labs');
              setSearchTerm('');
            }}
          >
            <Server size={16} />
            <span>Laboratories</span>
            <span className="count-pill">{labs.length}</span>
          </button>

          <button
            className={`subtab-btn ${currentSubTab === 'requests' ? 'active' : ''}`}
            onClick={() => {
              setSubTab('requests');
              setSearchTerm('');
            }}
          >
            <FileText size={16} />
            <span>Academic Requests</span>
            <span className="count-pill">{requests.length}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={currentSubTab === 'labs' ? 'Search laboratories by ID or name...' : 'Search requests by ID or department...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="changes-alert-banner">
          <AlertTriangle size={16} className="text-amber" />
          <span>
            Input dataset has been updated. Allocation schedules will be automatically refreshed when you run the engine.
          </span>
        </div>
      )}

      {/* LABORATORIES TAB CONTENT */}
      {currentSubTab === 'labs' && (
        <div className="card table-card" data-demo-target="labs-table">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lab ID</th>
                  <th>Facility Name</th>
                  <th>Capacity (Seats)</th>
                  <th>Available Slots</th>
                  <th>Specialization</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-muted">
                      No laboratories found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredLabs.map((lab) => (
                    <tr key={lab.id}>
                      <td className="font-bold text-bright">{lab.id}</td>
                      <td>{lab.name || lab.id}</td>
                      <td>
                        <span className="capacity-badge">{lab.capacity} Seats</span>
                      </td>
                      <td>
                        <div className="slots-pills-row">
                          {['S1', 'S2', 'S3'].map((s) => {
                            const isAvail = lab.availableSlots.includes(s);
                            return (
                              <span
                                key={s}
                                className={`slot-tag ${isAvail ? 'active' : 'inactive'}`}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-slate">{lab.type || 'General'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions-group">
                          <button
                            className="btn btn-secondary btn-sm action-icon-btn"
                            title="Edit Laboratory"
                            onClick={() => handleOpenEditLab(lab)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm action-icon-btn"
                            title="Delete Laboratory"
                            onClick={() => setDeletingItem({ type: 'lab', item: lab })}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUESTS TAB CONTENT */}
      {currentSubTab === 'requests' && (
        <div className="card table-card" data-demo-target="requests-table">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Department</th>
                  <th>Course / Lab Session</th>
                  <th>Computers Needed</th>
                  <th>Allowed Slots</th>
                  <th>Priority</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-muted">
                      No academic requests found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="font-bold text-violet">{req.id}</td>
                      <td>
                        <span className="dept-tag">{req.department}</span>
                      </td>
                      <td className="text-muted">{req.courseName || 'Standard Laboratory Practicum'}</td>
                      <td>
                        <span className="demand-badge">{req.computersNeeded} Computers</span>
                      </td>
                      <td>
                        <div className="slots-pills-row">
                          {['S1', 'S2', 'S3'].map((s) => {
                            const isAllowed = req.allowedSlots.includes(s);
                            return (
                              <span
                                key={s}
                                className={`slot-tag ${isAllowed ? 'allowed' : 'inactive'}`}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${req.priority === 'High' ? 'badge-rose' : 'badge-blue'}`}>
                          {req.priority || 'Normal'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions-group">
                          <button
                            className="btn btn-secondary btn-sm action-icon-btn"
                            title="Edit Request"
                            onClick={() => handleOpenEditRequest(req)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm action-icon-btn"
                            title="Delete Request"
                            onClick={() => setDeletingItem({ type: 'request', item: req })}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={18} className="text-rose" />
                <span>Confirm Deletion</span>
              </h3>
            </div>
            <div className="modal-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Are you sure you want to delete {deletingItem.type === 'lab' ? 'Laboratory' : 'Request'}{' '}
              <strong style={{ color: '#fff' }}>"{deletingItem.item.id}"</strong>?
              This action will take effect immediately.
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeletingItem(null)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleConfirmDelete}>
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modals */}
      <LabModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        onSave={onSaveLab}
        existingLabs={labs}
        editingLab={editingLab}
      />

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSave={onSaveRequest}
        existingRequests={requests}
        editingRequest={editingRequest}
      />
    </div>
  );
}
