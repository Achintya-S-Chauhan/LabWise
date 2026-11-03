import { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Bug,
  PlayCircle
} from 'lucide-react';
import { validateSchedule } from '../../utils/validation';

export default function ConstraintAuditPanel({
  activeAllocation = null,
  labs = [],
  requests = [],
  onNavigateToTestLab
}) {
  const [testCorruptedSchedule, setTestCorruptedSchedule] = useState(false);

  // If user clicks "Simulate Constraint Violation", inject malicious assignments to test the auditor!
  const assignmentsToAudit = testCorruptedSchedule
    ? [
        ...(activeAllocation?.assignments || []),
        // Corrupt Hard Constraint 2 (Double booking Lab A in S1)
        { requestId: 'R_CORRUPT', department: 'TEST', computersNeeded: 10, labId: 'Lab A', slot: 'S1', labCapacity: 60 },
        // Corrupt Hard Constraint 3 (Capacity violation: Lab D cap 30 vs 80 needed)
        { requestId: 'R_OVERFLOW', department: 'TEST', computersNeeded: 80, labId: 'Lab D', slot: 'S3', labCapacity: 30 }
      ]
    : activeAllocation?.assignments || [];

  const auditReport = validateSchedule(assignmentsToAudit, labs, requests);

  // Map conflicts to each of the 7 Hard Constraints
  const hardConstraints = [
    {
      id: 1,
      name: 'Hard Constraint 1: No Request Splitting',
      mathematicalRule: '∀ r ∈ Requests, |Placements(r)| ≤ 1 ∧ Placements(r) = {(l, s)}',
      description: 'A request cannot be split across multiple laboratories or partitioned across multiple time slots.',
      conflictCodes: ['DUPLICATE_OR_SPLIT_REQUEST']
    },
    {
      id: 2,
      name: 'Hard Constraint 2: No Laboratory Double Booking',
      mathematicalRule: '∀ l ∈ Labs, ∀ s ∈ Slots, |{r | Assigned(r, l, s)}| ≤ 1',
      description: 'A laboratory can host at most one department request per time slot. Double booking is strictly prohibited.',
      conflictCodes: ['DOUBLE_BOOKING']
    },
    {
      id: 3,
      name: 'Hard Constraint 3: Capacity Sufficiency',
      mathematicalRule: '∀ (r, l, s) ∈ Assignments, Capacity(l) ≥ ComputersNeeded(r)',
      description: 'A laboratory capacity must be greater than or equal to the computers requested by the department cohort.',
      conflictCodes: ['INSUFFICIENT_CAPACITY']
    },
    {
      id: 4,
      name: 'Hard Constraint 4: Allowed Time Slot Restriction',
      mathematicalRule: '∀ (r, l, s) ∈ Assignments, s ∈ AllowedSlots(r)',
      description: 'A request can only be scheduled during one of the academic time slots explicitly authorized by the department.',
      conflictCodes: ['DISALLOWED_SLOT']
    },
    {
      id: 5,
      name: 'Hard Constraint 5: Laboratory Operational Availability',
      mathematicalRule: '∀ (r, l, s) ∈ Assignments, s ∈ AvailableSlots(l)',
      description: 'A laboratory can only host a session during time slots when that laboratory facility is officially open and staffed.',
      conflictCodes: ['UNAVAILABLE_LAB_SLOT']
    },
    {
      id: 6,
      name: 'Hard Constraint 6: Single Allocation Invariant',
      mathematicalRule: 'Each request is scheduled exactly once across the campus timetable or remains cleanly unallocated.',
      description: 'Prevents phantom duplicate bookings or multi-slot reservations for a single curricular requirement.',
      conflictCodes: ['DUPLICATE_OR_SPLIT_REQUEST']
    },
    {
      id: 7,
      name: 'Hard Constraint 7: Verification Integrity',
      mathematicalRule: 'Invalid(Schedule) ⟹ Status = REJECTED (Zero false-positive allocations allowed)',
      description: 'An invalid schedule with any constraint violation must never be displayed as a successful schedule.',
      conflictCodes: ['UNKNOWN_REQUEST', 'UNKNOWN_LAB']
    }
  ];

  return (
    <div className="eval-audit-panel-root" data-demo-target="constraint-audit">
      {/* Audit Header Banner */}
      <div className="card audit-summary-card">
        <div className="audit-summary-left">
          <div className="audit-icon-box">
            <ShieldCheck size={28} className={auditReport.isValid ? 'text-emerald' : 'text-rose'} />
          </div>
          <div>
            <h3 className="audit-title">
              Independent 7-Constraint Verification Audit
            </h3>
            <p className="audit-subtitle">
              Evaluated strictly by an independent validator function decoupled from the scheduling algorithms.
            </p>
          </div>
        </div>

        <div className="audit-summary-right">
          <div className="audit-stat-item">
            <span className="audit-stat-label">Total Hard Constraints:</span>
            <span className="audit-stat-val text-bright">7 Rules</span>
          </div>
          <div className="audit-stat-item">
            <span className="audit-stat-label">Audit Conflicts:</span>
            <span className={`audit-stat-val font-mono font-bold ${auditReport.isValid ? 'text-emerald' : 'text-rose'}`}>
              {auditReport.conflictCount} Violations
            </span>
          </div>
          <div className="audit-stat-item">
            <span className="audit-stat-label">Schedule Integrity:</span>
            <span className={`badge ${auditReport.isValid ? 'badge-emerald' : 'badge-rose'}`}>
              {auditReport.isValid ? 'VERIFIED PASSED' : 'REJECTED (INVALID)'}
            </span>
          </div>

          {/* Jump to Test Lab Link */}
          {onNavigateToTestLab && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onNavigateToTestLab}
              title="Jump directly to the Acceptance Test Laboratory"
            >
              <PlayCircle size={14} />
              <span>Acceptance Test Lab (10 Tests) &rarr;</span>
            </button>
          )}

          {/* Adversarial Testing Trigger */}
          <button
            className={`btn btn-sm ${testCorruptedSchedule ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setTestCorruptedSchedule(!testCorruptedSchedule)}
            title="Inject an invalid double-booking and capacity violation to test the auditor"
          >
            <Bug size={14} />
            <span>{testCorruptedSchedule ? 'Clear Injected Faults' : 'Test Adversarial Fault'}</span>
          </button>
        </div>
      </div>

      {testCorruptedSchedule && (
        <div className="changes-alert-banner" style={{ background: 'rgba(244, 63, 94, 0.15)', borderColor: '#f43f5e', color: '#fda4af' }}>
          <AlertTriangle size={18} />
          <span>
            <strong>ADVERSARIAL STRESS TESTING ACTIVE:</strong> Artificially injected 2 illegal assignments (Double Booking in Lab A [S1] & Insufficient Capacity in Lab D [S3]).
            Notice how the independent auditor immediately flags and pinpoints the exact violations!
          </span>
        </div>
      )}

      {/* Constraints Table */}
      <div className="card table-card" style={{ marginTop: 20 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rule</th>
                <th style={{ width: '22%' }}>Constraint Definition</th>
                <th style={{ width: '12%' }}>Audit Status</th>
                <th style={{ width: '28%' }}>Mathematical Formulation & Description</th>
                <th style={{ width: '15%' }}>Violations Detected</th>
                <th style={{ width: '15%' }}>Compliance Guarantee</th>
              </tr>
            </thead>
            <tbody>
              {hardConstraints.map((c) => {
                const matchedViolations = auditReport.conflicts.filter((conf) =>
                  c.conflictCodes.includes(conf.code)
                );
                const isPassed = matchedViolations.length === 0;

                return (
                  <tr key={c.id} className={!isPassed ? 'row-violation' : ''}>
                    <td className="font-bold text-muted font-mono">HC-{c.id}</td>
                    <td className="font-bold text-bright">{c.name}</td>
                    <td>
                      <span className={`badge ${isPassed ? 'badge-emerald' : 'badge-rose'}`}>
                        {isPassed ? 'PASS [✓]' : 'FAIL [✗]'}
                      </span>
                    </td>
                    <td>
                      <div className="font-mono" style={{ fontSize: 11.5, color: '#93c5fd', marginBottom: 4 }}>
                        {c.mathematicalRule}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {c.description}
                      </div>
                    </td>
                    <td>
                      {isPassed ? (
                        <span className="text-emerald font-mono font-bold" style={{ fontSize: 12.5 }}>
                          0 Violations
                        </span>
                      ) : (
                        <div style={{ color: '#fda4af', fontSize: 12 }}>
                          <strong>{matchedViolations.length} Violations:</strong>
                          <ul style={{ margin: '4px 0 0 16px' }}>
                            {matchedViolations.map((v, idx) => (
                              <li key={idx}>{v.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-slate" style={{ fontSize: 11 }}>
                        Active Independent Check
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
