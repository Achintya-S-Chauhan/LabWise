import { Ban } from 'lucide-react';

export default function ScheduleGrid({
  labs = [],
  slots = ['S1', 'S2', 'S3'],
  assignments = [],
  highlightChanges = false,
  changedRequestIds = []
}) {
  // Build lookup map: `${labId}-${slot}` -> assignment
  const assignmentMap = new Map();
  for (const a of assignments) {
    assignmentMap.set(`${a.labId}-${a.slot}`, a);
  }

  return (
    <div className="schedule-grid-container">
      <div className="schedule-grid-table-wrapper">
        <table className="schedule-grid-table">
          <thead>
            <tr>
              <th className="grid-header-lab">Laboratory</th>
              {slots.map((slot) => (
                <th key={slot} className="grid-header-slot">
                  <div className="slot-name">{slot}</div>
                  <div className="slot-time">
                    {slot === 'S1' ? '09:00 - 11:00' : slot === 'S2' ? '11:30 - 13:30' : '14:00 - 16:00'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr key={lab.id} className="grid-lab-row">
                <td className="grid-lab-cell">
                  <div className="lab-cell-name">{lab.id}</div>
                  <div className="lab-cell-capacity">Cap: {lab.capacity} seats</div>
                </td>

                {slots.map((slot) => {
                  const isAvailableInLab = lab.availableSlots.includes(slot);
                  const key = `${lab.id}-${slot}`;
                  const assignment = assignmentMap.get(key);

                  if (!isAvailableInLab) {
                    return (
                      <td key={slot} className="grid-cell slot-disabled">
                        <div className="disabled-cell-content">
                          <Ban size={14} className="text-muted" />
                          <span>Not Available</span>
                        </div>
                      </td>
                    );
                  }

                  if (assignment) {
                    const isChanged = highlightChanges && changedRequestIds.includes(assignment.requestId);
                    return (
                      <td key={slot} className={`grid-cell slot-occupied ${isChanged ? 'highlight-changed' : ''}`}>
                        <div className="assignment-ticket">
                          <div className="ticket-header">
                            <span className="ticket-req-id">{assignment.requestId}</span>
                            <span className="badge badge-blue">{assignment.department}</span>
                          </div>
                          <div className="ticket-body">
                            <div className="ticket-stat">
                              <span className="stat-label">Demanded:</span>
                              <span className="stat-value">{assignment.computersNeeded}</span>
                            </div>
                            <div className="ticket-stat">
                              <span className="stat-label">Unused:</span>
                              <span className="stat-value text-amber">{assignment.unusedSeats}</span>
                            </div>
                          </div>
                          <div className="ticket-footer">
                            <div className="mini-progress-bar">
                              <div
                                className="mini-progress-fill"
                                style={{
                                  width: `${Math.min(100, (assignment.computersNeeded / lab.capacity) * 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={slot} className="grid-cell slot-free">
                      <div className="free-cell-content">
                        <span className="free-label">Available</span>
                        <span className="free-cap">{lab.capacity} idle</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
