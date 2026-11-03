import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { generateFCFSSteps, generateHeuristicSteps } from '../../algorithms/visualizerSteps';
import ScheduleGrid from '../allocation/ScheduleGrid';

export default function ExecutionVisualizer({ labs = [], requests = [], forcedAlgo = null }) {
  const [selectedAlgo, setSelectedAlgo] = useState(forcedAlgo || 'fcfs'); // 'fcfs' | 'improved'
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  const [prevForcedAlgo, setPrevForcedAlgo] = useState(forcedAlgo);
  if (forcedAlgo && forcedAlgo !== prevForcedAlgo) {
    setPrevForcedAlgo(forcedAlgo);
    setSelectedAlgo(forcedAlgo);
    setStepIndex(0);
    setIsPlaying(false);
  }

  // Generate steps based on active algorithm
  const steps = selectedAlgo === 'fcfs' 
    ? generateFCFSSteps(labs, requests) 
    : generateHeuristicSteps(labs, requests);

  const currentStep = steps[stepIndex] || steps[0];

  // Auto-play stepper loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        if (stepIndex < steps.length - 1) {
          setStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1500);
    } else {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, stepIndex, steps.length]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };

  const handlePrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handleRunToCompletion = () => {
    setIsPlaying(false);
    setStepIndex(steps.length - 1);
  };

  return (
    <div className="eval-visualizer-root" data-demo-target="execution-visualizer">
      {/* Visualizer Header Controls */}
      <div className="card visualizer-controls-card">
        <div className="vis-controls-left">
          <div className="algo-selector-group" data-demo-target="algorithm-selector">
            <span className="control-label">Algorithm:</span>
            <button
              className={`algo-btn ${selectedAlgo === 'fcfs' ? 'active fcfs' : ''}`}
              onClick={() => {
                setSelectedAlgo('fcfs');
                handleReset();
              }}
            >
              <Clock size={15} />
              <span>FCFS Baseline</span>
            </button>
            <button
              className={`algo-btn ${selectedAlgo === 'improved' ? 'active improved' : ''}`}
              onClick={() => {
                setSelectedAlgo('improved');
                handleReset();
              }}
            >
              <Zap size={15} />
              <span>Improved Heuristic</span>
            </button>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="vis-controls-center">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            title="Reset to Step 1"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handlePrev}
            disabled={stepIndex === 0}
            title="Previous Step"
          >
            <SkipBack size={14} />
            <span>Prev</span>
          </button>

          <button
            className="btn btn-primary btn-sm play-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Stepper' : 'Auto Play Stepper'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleNext}
            disabled={stepIndex === steps.length - 1}
            title="Next Step"
          >
            <span>Next</span>
            <SkipForward size={14} />
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRunToCompletion}
            title="Jump to Final Step"
          >
            <span>Run All</span>
          </button>
        </div>

        {/* Step Counter Indicator */}
        <div className="vis-controls-right">
          <div className="step-counter-badge">
            <span className="step-text">STEP</span>
            <span className="step-numbers font-mono font-bold text-blue">
              {stepIndex + 1} / {steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Step Progression Timeline Bar */}
      <div className="step-timeline-bar">
        {steps.map((st, idx) => (
          <button
            key={idx}
            className={`timeline-step-dot ${idx === stepIndex ? 'active' : ''} ${idx < stepIndex ? 'completed' : ''}`}
            onClick={() => {
              setIsPlaying(false);
              setStepIndex(idx);
            }}
            title={`Step ${idx + 1}: Request ${st.currentRequest.id}`}
          >
            <span className="dot-label">{st.currentRequest.id}</span>
          </button>
        ))}
      </div>

      {currentStep && (
        <div className="visualizer-content-grid">
          {/* Left Column: Active Request & Decision Matrix */}
          <div className="vis-details-col">
            {/* Current Request Card */}
            <div className="card active-request-card">
              <div className="active-req-header">
                <div>
                  <span className="active-req-badge">ACTIVE EVALUATION OBJECT</span>
                  <h3 className="active-req-title">
                    Request {currentStep.currentRequest.id} ({currentStep.currentRequest.department})
                  </h3>
                </div>
                <span className="badge badge-violet">{currentStep.currentRequest.computersNeeded} Computers Demanded</span>
              </div>

              <div className="active-req-details">
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-val">{currentStep.currentRequest.department}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Computers Demanded:</span>
                  <span className="detail-val font-mono font-bold">{currentStep.currentRequest.computersNeeded}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Allowed Slots:</span>
                  <div className="slots-pills-row">
                    {currentStep.currentRequest.allowedSlots.map((s) => (
                      <span key={s} className="slot-tag allowed font-bold">{s}</span>
                    ))}
                  </div>
                </div>
                {currentStep.priorityPolicy && (
                  <div className="detail-item">
                    <span className="detail-label">Ordering Strategy:</span>
                    <span className="detail-val text-violet">{currentStep.priorityPolicy}</span>
                  </div>
                )}
              </div>

              {/* Step Summary Outcome */}
              <div className={`step-outcome-box ${currentStep.isAllocated ? 'allocated' : 'unallocated'}`}>
                {currentStep.isAllocated ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald" />
                    <div>
                      <strong>ALLOCATED:</strong> Matched to <strong>{currentStep.selectedAssignment.labId}</strong> in <strong>Slot {currentStep.selectedAssignment.slot}</strong>.
                      <div style={{ fontSize: 12, marginTop: 2, color: 'var(--text-secondary)' }}>
                        Capacity: {currentStep.selectedAssignment.labCapacity} | Unused Seats: {currentStep.selectedAssignment.unusedSeats}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-rose" />
                    <div>
                      <strong>UNALLOCATED:</strong> No valid laboratory with capacity &gt;= {currentStep.currentRequest.computersNeeded} was available during allowed slots.
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Candidate Laboratories Evaluation Matrix */}
            <div className="card evaluations-card" data-demo-target="candidate-matrix">
              <h3 className="card-title">
                <Info size={18} className="text-blue" />
                <span>Candidate Laboratories Evaluation Matrix</span>
              </h3>
              <p className="card-caption">
                Exhaustive check of all lab-slot options against constraints. Explains why a lab was chosen or rejected.
              </p>

              <div className="table-container" style={{ marginTop: 12 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      <th>Laboratory</th>
                      <th>Capacity</th>
                      <th>Demanded</th>
                      <th>Available?</th>
                      <th>Capacity Check</th>
                      <th>Decision Status</th>
                      <th>Decision Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStep.candidateEvaluations.map((cand, cIdx) => {
                      let statusBadge = 'badge-slate';
                      if (cand.status === 'SELECTED') statusBadge = 'badge-emerald';
                      else if (cand.status === 'FEASIBLE') statusBadge = 'badge-blue';
                      else if (cand.status === 'SUB_OPTIMAL') statusBadge = 'badge-amber';
                      else if (cand.status === 'REJECTED') statusBadge = 'badge-rose';

                      return (
                        <tr key={cIdx} className={cand.status === 'SELECTED' ? 'row-winner' : ''}>
                          <td>
                            <span className="badge badge-slate">Slot {cand.slot}</span>
                          </td>
                          <td className="font-bold">{cand.labId}</td>
                          <td className="font-mono">{cand.labCapacity}</td>
                          <td className="font-mono">{cand.computersNeeded}</td>
                          <td>
                            {cand.isSlotAvailableInLab && !cand.isOccupied ? (
                              <span className="text-emerald" style={{ fontSize: 12 }}>Open [✓]</span>
                            ) : cand.isOccupied ? (
                              <span className="text-amber" style={{ fontSize: 12 }}>Booked ({cand.occupiedBy})</span>
                            ) : (
                              <span className="text-rose" style={{ fontSize: 12 }}>Closed [✗]</span>
                            )}
                          </td>
                          <td>
                            {cand.hasSufficientCapacity ? (
                              <span className="text-emerald font-mono" style={{ fontSize: 12 }}>
                                {cand.labCapacity} &gt;= {cand.computersNeeded} [✓]
                              </span>
                            ) : (
                              <span className="text-rose font-mono" style={{ fontSize: 12 }}>
                                {cand.labCapacity} &lt; {cand.computersNeeded} [✗]
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${statusBadge}`}>
                              {cand.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {cand.decisionReason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Incremental Schedule Grid & Queue */}
          <div className="vis-schedule-col">
            {/* Real-time Incremental Timetable Grid */}
            <div className="card incremental-grid-card">
              <div className="card-header-between">
                <div>
                  <h3 className="card-title">
                    <Layers size={18} className="text-violet" />
                    <span>Schedule State at Step {stepIndex + 1}</span>
                  </h3>
                  <p className="card-caption">
                    Occupancy up to current step ({currentStep.currentAssignments.length} assigned sessions).
                  </p>
                </div>
              </div>

              <ScheduleGrid
                labs={labs}
                slots={['S1', 'S2', 'S3']}
                assignments={currentStep.currentAssignments}
                highlightChanges={false}
              />
            </div>

            {/* Remaining Queue Card */}
            <div className="card remaining-queue-card">
              <h3 className="card-title" style={{ fontSize: 14 }}>
                Remaining Requests in Scheduling Queue ({currentStep.remainingRequests.length})
              </h3>

              {currentStep.remainingRequests.length === 0 ? (
                <div style={{ color: '#34d399', fontSize: 13, padding: '10px 0' }}>
                  ✓ All {steps.length} requests have been evaluated.
                </div>
              ) : (
                <div className="queue-chips-row">
                  {currentStep.remainingRequests.map((r) => (
                    <div key={r.id} className="queue-chip">
                      <span className="chip-id">{r.id}</span>
                      <span className="chip-dept">{r.department}</span>
                      <span className="chip-need">{r.computersNeeded} seats</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
