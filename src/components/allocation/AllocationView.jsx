import { useState } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Zap,
  ListOrdered
} from 'lucide-react';
import ScheduleGrid from './ScheduleGrid';

export default function AllocationView({
  labs = [],
  requests = [],
  fcfsResult = null,
  improvedResult = null,
  onRunFCFS,
  onRunImproved,
  onRunBoth,
  isComputing = false
}) {
  const [selectedAlgo, setSelectedAlgo] = useState(improvedResult ? 'improved' : 'fcfs');
  const [showLogs, setShowLogs] = useState(false);

  const currentResult = selectedAlgo === 'improved' ? improvedResult : fcfsResult;
  const metrics = currentResult ? currentResult.metrics : null;

  return (
    <div className="allocation-page">
      {/* Action Bar / Controls */}
      <div className="card engine-controls-card">
        <div className="engine-controls-left">
          <div className="engine-title-group">
            <h2 className="engine-title">
              <Cpu size={22} className="text-blue" />
              Algorithmic Scheduling Engine
            </h2>
            <p className="engine-subtitle">
              Execute deterministic FCFS baseline or multi-pass constraint-aware heuristics.
            </p>
          </div>
        </div>

        <div className="engine-controls-right">
          <button
            className="btn btn-secondary"
            onClick={onRunFCFS}
            disabled={isComputing}
          >
            <Clock size={15} />
            <span>Run FCFS Baseline</span>
          </button>

          <button
            className="btn btn-accent"
            onClick={onRunImproved}
            disabled={isComputing}
          >
            <Zap size={15} />
            <span>Run Improved Heuristic</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={onRunBoth}
            disabled={isComputing}
          >
            <Play size={15} fill="currentColor" />
            <span>Run Both Algorithms</span>
          </button>
        </div>
      </div>

      {/* Algorithm Switcher Tabs (when results exist) */}
      <div className="algo-switch-container">
        <div className="algo-switch-pills">
          <button
            className={`switch-pill ${selectedAlgo === 'improved' ? 'active improved' : ''}`}
            onClick={() => setSelectedAlgo('improved')}
          >
            <Zap size={15} />
            <span>Improved Heuristic Result</span>
            {improvedResult && (
              <span className="pill-metric">
                {improvedResult.assignments.length}/{requests.length} ({improvedResult.metrics.totalUnusedSeats}w)
              </span>
            )}
          </button>

          <button
            className={`switch-pill ${selectedAlgo === 'fcfs' ? 'active fcfs' : ''}`}
            onClick={() => setSelectedAlgo('fcfs')}
          >
            <Clock size={15} />
            <span>FCFS Baseline Result</span>
            {fcfsResult && (
              <span className="pill-metric">
                {fcfsResult.assignments.length}/{requests.length} ({fcfsResult.metrics.totalUnusedSeats}w)
              </span>
            )}
          </button>
        </div>

        {currentResult && (
          <div className="audit-badge-pill">
            <ShieldCheck size={16} className="text-emerald" />
            <span>Audit: {metrics.conflictCount} Conflicts (Valid Schedule)</span>
          </div>
        )}
      </div>

      {/* Main Allocation Content */}
      {currentResult ? (
        <div className="allocation-content-grid">
          {/* Metrics Summary Strip */}
          <div className="stats-strip">
            <div className="strip-item">
              <span className="strip-label">Scheduled Requests</span>
              <span className="strip-value font-bold text-emerald">
                {metrics.scheduledCount} / {requests.length}
              </span>
              <span className="strip-caption">{metrics.scheduleRatePct}% fulfillment</span>
            </div>

            <div className="strip-item">
              <span className="strip-label">Unallocated Requests</span>
              <span className={`strip-value font-bold ${metrics.unallocatedCount > 0 ? 'text-amber' : 'text-bright'}`}>
                {metrics.unallocatedCount}
              </span>
              <span className="strip-caption">
                {metrics.unallocatedCount === 0 ? 'Zero backlogged' : 'Capacity deficit'}
              </span>
            </div>

            <div className="strip-item">
              <span className="strip-label">Total Unused Seats</span>
              <span className={`strip-value font-bold ${selectedAlgo === 'improved' ? 'text-emerald' : 'text-rose'}`}>
                {metrics.totalUnusedSeats} seats
              </span>
              <span className="strip-caption">
                {selectedAlgo === 'improved'
                  ? 'Optimized via Best-Fit'
                  : 'Alphabetical first-fit waste'}
              </span>
            </div>

            <div className="strip-item">
              <span className="strip-label">Seat Utilization</span>
              <span className="strip-value font-bold text-blue">
                {metrics.seatEfficiencyPct}%
              </span>
              <span className="strip-caption">Served / Allocated</span>
            </div>

            <div className="strip-item">
              <span className="strip-label">Algorithm Runtime</span>
              <span className="strip-value font-mono text-bright">
                {metrics.runtimeMs} ms
              </span>
              <span className="strip-caption">performance.now()</span>
            </div>
          </div>

          {/* Strategy Callout Banner for Heuristic */}
          {selectedAlgo === 'improved' && currentResult.winningStrategy && (
            <div className="strategy-banner">
              <div className="strategy-icon-box">
                <Zap size={20} className="text-violet" />
              </div>
              <div>
                <div className="strategy-title">
                  Winning Heuristic Policy: <strong>{currentResult.winningStrategy}</strong>
                </div>
                <div className="strategy-desc">
                  Selected through deterministic multi-candidate evaluation. Requests evaluated with fewest feasible domain placements first,
                  and labs assigned using Best-Fit capacity gap minimization.
                </div>
              </div>
            </div>
          )}

          {/* Visual Schedule Timetable */}
          <div className="card schedule-view-card">
            <h3 className="card-title">
              <Layers size={18} className="text-blue" />
              <span>Campus Laboratory Allocation Matrix ({currentResult.algorithm})</span>
            </h3>

            <ScheduleGrid
              labs={labs}
              slots={['S1', 'S2', 'S3']}
              assignments={currentResult.assignments}
            />
          </div>

          {/* Detailed Assignment Records Table */}
          <div className="card table-card">
            <div className="card-header-between">
              <h3 className="card-title">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Assigned Requests Detail & Algorithmic Rationale ({currentResult.assignments.length})</span>
              </h3>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Department</th>
                    <th>Assigned Lab</th>
                    <th>Time Slot</th>
                    <th>Computers Demanded</th>
                    <th>Lab Capacity</th>
                    <th>Unused Seats (Waste)</th>
                    <th>Algorithmic Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResult.assignments.map((assignment) => (
                    <tr key={assignment.requestId}>
                      <td className="font-bold text-violet">{assignment.requestId}</td>
                      <td>
                        <span className="dept-tag">{assignment.department}</span>
                      </td>
                      <td className="font-bold text-bright">{assignment.labId}</td>
                      <td>
                        <span className="badge badge-blue">Slot {assignment.slot}</span>
                      </td>
                      <td className="font-mono">{assignment.computersNeeded}</td>
                      <td className="font-mono text-muted">{assignment.labCapacity}</td>
                      <td>
                        <span className={`waste-badge ${assignment.unusedSeats === 0 ? 'zero-waste' : 'has-waste'}`}>
                          {assignment.unusedSeats} seats
                        </span>
                      </td>
                      <td className="reasoning-cell" style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {assignment.reasoning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unallocated Requests Panel (if any) */}
          {currentResult.unallocated.length > 0 && (
            <div className="card unallocated-card">
              <div className="unallocated-header">
                <AlertTriangle size={18} className="text-amber" />
                <h3 className="card-title" style={{ margin: 0, color: '#fbbf24' }}>
                  Unallocated Requests ({currentResult.unallocated.length})
                </h3>
              </div>

              <div className="table-container" style={{ marginTop: 12 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Department</th>
                      <th>Computers Demanded</th>
                      <th>Allowed Slots</th>
                      <th>Constraint Diagnostic Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResult.unallocated.map((unalloc) => (
                      <tr key={unalloc.requestId}>
                        <td className="font-bold text-rose">{unalloc.requestId}</td>
                        <td>{unalloc.department}</td>
                        <td className="font-mono">{unalloc.computersNeeded}</td>
                        <td>
                          <div className="slots-pills-row">
                            {unalloc.allowedSlots.map((s) => (
                              <span key={s} className="slot-tag inactive">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ color: '#fda4af', fontSize: 13 }}>{unalloc.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step-by-Step Algorithmic Trace Logs */}
          <div className="card logs-card">
            <button
              className="logs-toggle-btn"
              onClick={() => setShowLogs(!showLogs)}
            >
              <div className="logs-toggle-title">
                {showLogs ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                <ListOrdered size={16} className="text-blue" />
                <span>Step-by-Step Decision Trace Log ({currentResult.stepLogs.length} events)</span>
              </div>
              <span className="badge badge-slate">{showLogs ? 'Collapse' : 'Expand Trace'}</span>
            </button>

            {showLogs && (
              <div className="step-logs-list">
                {currentResult.stepLogs.map((log, index) => (
                  <div key={index} className={`log-entry ${log.type ? log.type.toLowerCase() : ''}`}>
                    <span className="log-step-badge">Step {log.step}</span>
                    <span className="log-text">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-allocation-placeholder card">
          <Cpu size={48} className="text-muted" />
          <h3 style={{ marginTop: 16 }}>No Active Allocation Computed Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '8px auto 20px auto' }}>
            Click one of the execution buttons above to run First-Come First-Served or the Improved Heuristic
            on the current laboratory resources.
          </p>
          <button className="btn btn-primary" onClick={onRunBoth}>
            <Play size={16} fill="currentColor" />
            <span>Execute Both & Compare</span>
          </button>
        </div>
      )}
    </div>
  );
}
