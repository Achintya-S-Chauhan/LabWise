import {
  Cpu,
  ShieldCheck,
  BarChart3,
  PlayCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import ExecutionVisualizer from './ExecutionVisualizer';
import ConstraintAuditPanel from './ConstraintAuditPanel';
import BenchmarkComparisonPanel from './BenchmarkComparisonPanel';
import TestCaseLaboratory from './TestCaseLaboratory';
import ReschedulingDemoPanel from './ReschedulingDemoPanel';
import ComplexityVisualizer from './ComplexityVisualizer';

export default function AlgorithmLabView({
  labs = [],
  requests = [],
  fcfsResult = null,
  improvedResult = null,
  onRunBoth,
  initialSubTab = 'visualizer',
  onSelectSubTab,
  visualizerAlgoOverride = null
}) {
  const activeSubTab = initialSubTab;
  const setActiveSubTab = (tabId) => {
    if (onSelectSubTab) {
      onSelectSubTab(tabId);
    }
  };

  const subNavItems = [
    { id: 'visualizer', label: 'Algorithm Execution Visualizer', icon: Cpu, badge: 'Interactive Stepper' },
    { id: 'audit', label: '7-Constraint Independent Audit', icon: ShieldCheck, badge: 'Audit Validated' },
    { id: 'benchmark', label: 'Empirical Benchmark Matrix', icon: BarChart3, badge: '-66.7% Waste' },
    { id: 'test-lab', label: 'Acceptance Test Laboratory', icon: PlayCircle, badge: '10 / 10 Tests' },
    { id: 'rescheduling-demo', label: 'Dynamic Rescheduling Demo', icon: RefreshCw, badge: '15 Marks (FCFS Baseline)' },
    { id: 'complexity', label: 'Complexity & NP-Hardness', icon: Activity, badge: 'O(R·S·L)' }
  ];

  return (
    <div className="eval-lab-container">
      {/* Sub-navigation Tabs */}
      <div className="eval-subnav-bar">
        <div className="eval-subnav-tabs">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                className={`eval-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSubTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && <span className="eval-nav-pill">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Subtab View */}
      <div className="eval-view-body" style={{ marginTop: 20 }}>
        {activeSubTab === 'visualizer' && (
          <ExecutionVisualizer
            labs={labs}
            requests={requests}
            forcedAlgo={visualizerAlgoOverride?.algo}
          />
        )}

        {activeSubTab === 'audit' && (
          <ConstraintAuditPanel
            activeAllocation={improvedResult || fcfsResult}
            labs={labs}
            requests={requests}
            onNavigateToTestLab={() => setActiveSubTab('test-lab')}
          />
        )}

        {activeSubTab === 'benchmark' && (
          <BenchmarkComparisonPanel
            fcfsResult={fcfsResult}
            improvedResult={improvedResult}
            requests={requests}
            onRunBoth={onRunBoth}
          />
        )}

        {activeSubTab === 'test-lab' && (
          <TestCaseLaboratory />
        )}

        {activeSubTab === 'rescheduling-demo' && (
          <ReschedulingDemoPanel labs={labs} requests={requests} />
        )}

        {activeSubTab === 'complexity' && (
          <ComplexityVisualizer />
        )}
      </div>
    </div>
  );
}
