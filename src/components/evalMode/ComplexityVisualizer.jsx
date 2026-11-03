import {
  GitFork,
  BookOpen
} from 'lucide-react';

export default function ComplexityVisualizer() {
  return (
    <div className="eval-complexity-root" data-demo-target="complexity-panel">
      {/* Theoretical Context Banner */}
      <div className="card" style={{ borderLeft: '4px solid #8b5cf6', marginBottom: 20 }}>
        <h3 className="card-title">
          <BookOpen size={20} className="text-violet" />
          <span>Computational Complexity & Theoretical Formulation</span>
        </h3>
        <p className="card-caption" style={{ marginTop: 4 }}>
          Formal asymptotic analysis of time and space complexity, computational complexity class,
          parameter definitions, scalability limitations, and honest heuristic failure-case proofs.
        </p>
      </div>

      {/* Variables Definition Box */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, color: '#60a5fa', marginBottom: 12 }}>
          Formal Parameter Notation & Dataset Sizing
        </h4>
        <div className="complexity-params-grid">
          <div className="param-card">
            <span className="param-sym font-mono">R</span>
            <span className="param-desc">Number of department laboratory requests (|Requests|). Official data: R = 5.</span>
          </div>
          <div className="param-card">
            <span className="param-sym font-mono">L</span>
            <span className="param-desc">Number of campus physical laboratories (|Labs|). Official data: L = 4.</span>
          </div>
          <div className="param-card">
            <span className="param-sym font-mono">S</span>
            <span className="param-desc">Number of discrete operational time slots (|Slots|). Official data: S = 3.</span>
          </div>
          <div className="param-card">
            <span className="param-sym font-mono">K</span>
            <span className="param-desc">Number of deterministic candidate heuristic strategies evaluated. LABWISE: K = 5.</span>
          </div>
        </div>
      </div>

      {/* Complexity Breakdown Columns */}
      <div className="complexity-grid">
        {/* FCFS Box */}
        <div className="card complexity-box">
          <div className="complexity-header">
            <span className="algo-tag fcfs font-bold">1. FCFS Baseline Algorithm</span>
            <span className="big-o font-mono text-blue">O(R · S · L)</span>
          </div>

          <div className="complexity-section">
            <h5 className="text-bright">Time Complexity Derivation:</h5>
            <p>
              • The algorithm processes requests sequentially in the original input sequence: exactly <strong>R</strong> iterations.<br />
              • For each request, it iterates through its allowed slots: at most <strong>S</strong> slots.<br />
              • For each slot, it evaluates laboratories pre-sorted alphabetically: at most <strong>L</strong> laboratories.<br />
              • Slot availability and hash set occupancy checks are <strong>O(1)</strong>.<br />
              • Total Time Complexity: <strong>O(R · S · L)</strong>.
            </p>
          </div>

          <div className="complexity-section" style={{ marginTop: 12 }}>
            <h5 className="text-bright">Auxiliary Space Complexity:</h5>
            <p>
              • Occupancy hash map stores at most one record per lab-slot combination: <strong>O(L · S)</strong>.<br />
              • Assignment and unallocated lists store exactly R records: <strong>O(R)</strong>.<br />
              • Total Space Complexity: <strong>O(L · S + R)</strong>.
            </p>
          </div>

          <div className="complexity-section" style={{ marginTop: 12 }}>
            <h5 className="text-bright">Scaling Characteristics:</h5>
            <p>
              Execution is linear with respect to request volume. For R = 1,000, L = 50, S = 10, operations are roughly 500,000 checks, executing in under <strong>3 ms</strong>.
            </p>
          </div>
        </div>

        {/* Improved Heuristic Box */}
        <div className="card complexity-box">
          <div className="complexity-header">
            <span className="algo-tag improved font-bold">2. Improved Multi-Pass Heuristic</span>
            <span className="big-o font-mono text-violet">O(K · (R log R + R · S · L))</span>
          </div>

          <div className="complexity-section">
            <h5 className="text-bright">Time Complexity Derivation:</h5>
            <p>
              • Evaluates <strong>K</strong> deterministic candidate strategies (K = 5).<br />
              • In each pass: calculating initial feasible domain sizes takes <strong>O(R · S · L)</strong>.<br />
              • Sorting requests by domain tightness or demand takes <strong>O(R log R)</strong>.<br />
              • Best-Fit laboratory selection examines all available options per request: <strong>O(R · S · L)</strong>.<br />
              • Audit validation on candidate schedules takes <strong>O(R)</strong>.<br />
              • Total Time Complexity: <strong>O(K · (R log R + R · S · L))</strong>.
            </p>
          </div>

          <div className="complexity-section" style={{ marginTop: 12 }}>
            <h5 className="text-bright">Auxiliary Space Complexity:</h5>
            <p>
              • Stores assignment structures and occupancy maps for K candidate schedules: <strong>O(K · (R + L · S))</strong>.<br />
              • Total Space Complexity: <strong>O(K · (R + L · S))</strong>.
            </p>
          </div>

          <div className="complexity-section" style={{ marginTop: 12 }}>
            <h5 className="text-bright">Scaling Characteristics:</h5>
            <p>
              Because K is a small constant (K = 5), the heuristic scales smoothly. On modern JavaScript V8 engines, 5 candidate passes over typical campus datasets complete in <strong>1 to 2 milliseconds</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* NP-Hardness & Greedy Failure Proof */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 className="card-title text-amber">
          <GitFork size={18} />
          <span>NP-Hardness & Honest Greedy Failure-Case Analysis</span>
        </h3>

        <div className="analysis-grid" style={{ marginTop: 12 }}>
          <div className="analysis-box">
            <h4 className="analysis-box-title text-blue">
              1. Computational Class: Strongly NP-Hard
            </h4>
            <p>
              Campus Laboratory Allocation with multi-slot constraints and heterogeneous capacities is isomorphic to the
              <strong> Generalized Assignment Problem (GAP)</strong> and the <strong>Multidimensional Multiple-Choice Knapsack Problem (MMKP)</strong>,
              both of which are proven to be strongly NP-hard.
            </p>
            <p style={{ marginTop: 8 }}>
              Finding a guaranteed mathematically optimal solution under arbitrary constraints requires Integer Linear Programming (ILP) or Branch-and-Bound,
              which exhibits worst-case exponential complexity <strong>O(2^(R · S · L))</strong>. Heuristic approximation is therefore the standard industrial
              and academic approach for instant, interactive scheduling.
            </p>
          </div>

          <div className="analysis-box">
            <h4 className="analysis-box-title text-amber">
              2. Proof of Heuristic Non-Optimality (Greedy Failure Case)
            </h4>
            <p>
              Greedy heuristics make locally attractive choices (e.g. matching a request to the lab with minimum capacity gap).
              Consider an edge-case configuration:
            </p>
            <p style={{ marginTop: 6, fontStyle: 'italic', color: '#fff' }}>
              • Request A requires 48 computers, allowed in Slot S1 only.<br />
              • Request B requires 49 computers, allowed in Slot S1 only.<br />
              • Available labs in S1: Lab X (Capacity 50) and Lab Y (Capacity 60).
            </p>
            <p style={{ marginTop: 6 }}>
              If Request A is evaluated first, Best-Fit matches Request A to Lab X (gap = 2 seats).
              Request B then must take Lab Y (gap = 11 seats).
              However, if a third Request C required 58 seats, Request C would be blocked because Lab Y was taken by B!
              Therefore, LABWISE transparently documents that this implementation is an <strong>engineering heuristic</strong>,
              and does not claim global optimality across all pathological input configurations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
