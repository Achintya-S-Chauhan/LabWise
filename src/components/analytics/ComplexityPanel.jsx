import { Activity, GitFork } from 'lucide-react';

export default function ComplexityPanel() {
  return (
    <div className="complexity-panel-root" data-demo-target="complexity-panel">
      <div className="card complexity-card">
        <h3 className="card-title">
          <Activity size={18} className="text-violet" />
          Algorithmic Complexity & Theoretical Formulation
        </h3>
        <p className="card-caption">
          Mathematical analysis of algorithmic time, space, and scaling characteristics for Campus Laboratory Allocation.
        </p>

        <div className="complexity-grid">
          {/* FCFS Baseline Card */}
          <div className="complexity-box">
            <div className="complexity-header">
              <span className="algo-tag fcfs">Algorithm 1: FCFS Baseline</span>
              <span className="big-o font-mono">O(R · S · L)</span>
            </div>
            <div className="complexity-body">
              <div className="param-list">
                <div><strong>R:</strong> Number of academic requests ({'|Requests|'})</div>
                <div><strong>S:</strong> Allowed slots per request ({'|Slots|'})</div>
                <div><strong>L:</strong> Number of campus laboratories ({'|Labs|'})</div>
              </div>

              <div className="complexity-section">
                <h4>Time Complexity Breakdown:</h4>
                <p>
                  For each of the R requests, the algorithm iterates through at most S allowed slots in input sequence.
                  For each slot, it traverses L laboratories pre-sorted alphabetically in O(L log L).
                  Testing availability and capacity check is O(1) via hash set lookups.
                  Total runtime is bounded by <strong>O(R · S · L)</strong>.
                </p>
              </div>

              <div className="complexity-section">
                <h4>Space Complexity:</h4>
                <p>
                  Occupancy tracking map requires at most <strong>O(L · S)</strong> space.
                  Assignment and unallocated queues require <strong>O(R)</strong> space.
                  Total auxiliary space: <strong>O(L · S + R)</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Improved Heuristic Card */}
          <div className="complexity-box">
            <div className="complexity-header">
              <span className="algo-tag improved">Algorithm 2: Improved Heuristic</span>
              <span className="big-o font-mono">O(K · R · (S · L + log R))</span>
            </div>
            <div className="complexity-body">
              <div className="param-list">
                <div><strong>K:</strong> Number of deterministic candidate strategies (K = 5)</div>
                <div><strong>R:</strong> Number of academic requests</div>
                <div><strong>S:</strong> Number of operational slots</div>
                <div><strong>L:</strong> Number of laboratories</div>
              </div>

              <div className="complexity-section">
                <h4>Time Complexity Breakdown:</h4>
                <p>
                  For each candidate pass k in [1, K], feasible placement counting evaluates O(R · S · L).
                  Sorting requests by constraint hardness or demand requires O(R log R).
                  Assignment with Best-Fit capacity gap minimization evaluates O(S · L) per request.
                  Overall deterministic runtime is <strong>O(K · (R log R + R · S · L))</strong>.
                </p>
              </div>

              <div className="complexity-section">
                <h4>Space Complexity:</h4>
                <p>
                  Evaluation buffers for K candidates maintain O(K · (R + L · S)) entries in memory.
                  Audit validation verifies assignments independently in O(R) time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Theoretical Context: NP-Hardness & Scaling Behavior */}
        <div className="np-hard-section">
          <div className="np-hard-header">
            <GitFork size={18} className="text-blue" />
            <h4>Computational Class & Practical Scaling Behavior</h4>
          </div>
          <div className="np-hard-content">
            <p>
              Campus Laboratory Allocation is isomorphic to the <strong>Multidimensional Knapsack Problem (MKP)</strong> and
              the <strong>Generalized Assignment Problem (GAP)</strong>, both established to be strongly <strong>NP-hard</strong>.
              Finding the mathematically guaranteed global optimum requires integer linear programming (ILP) or exhaustive
              branch-and-bound search, which incurs worst-case exponential time O(2^(R · L · S)).
            </p>
            <p style={{ marginTop: 8 }}>
              For real-world university campuses (R ≈ 200, L ≈ 30, S ≈ 8), an exact solver could experience
              combinatorial explosion. In contrast, LABWISE's multi-pass deterministic heuristic executes in under <strong>5 milliseconds</strong> on modern
              JavaScript runtimes, guaranteeing instant responsiveness, zero cloud dependencies, and zero constraint violations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
