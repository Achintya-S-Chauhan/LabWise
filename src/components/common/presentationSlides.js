/**
 * LABWISE - 5-Minute Guided Presentation Slides & Demo Script
 * Structured walkthrough for professors, evaluators, and algorithms competition judges.
 * Encapsulates the 5 evaluation checkpoints with programmatic routing and highlight targets.
 */

export const PRESENTATION_SLIDES = [
  {
    step: 1,
    title: '1. Campus Infrastructure & Curricular Demand',
    subtitle: 'Official Code Crack 3.0 Dataset (Persistent IndexedDB)',
    targetMode: 'operational',
    targetTab: 'labs-requests',
    labsSubTab: 'labs',
    highlightTarget: 'labs-table',
    talkingPoints: [
      '4 heterogeneous laboratories: Lab A (60 seats), Lab B (40), Lab C (50), Lab D (30) across slots S1, S2, S3.',
      '5 departmental requests: R1 (CSE, 55), R2 (IT, 35), R3 (AI & DS, 45), R4 (ECE, 25), R5 (MCA, 40).',
      'All state persisted locally via native IndexedDB client storage with zero external dependencies and instant reset.'
    ]
  },
  {
    step: 2,
    title: '2. Baseline Algorithm: FCFS Visualizer Trace',
    subtitle: 'Alphabetical First-Fit: 60 Unused Seats & Lab Bottlenecks',
    targetMode: 'evaluation',
    evalSubTab: 'visualizer',
    selectedAlgo: 'fcfs',
    resetStep: true,
    highlightTarget: 'execution-visualizer',
    talkingPoints: [
      'Processes requests in strict input order; greedily matches first available lab alphabetically (Lab A -> B -> C -> D).',
      'Severe Inefficiency: Lab A (60 seats) is repeatedly claimed by smaller requests, while Lab C and Lab D remain completely idle!',
      'Outcome: Schedules 5/5 requests, but leaves 60 unused computer seats (seat efficiency: 76.9%).'
    ]
  },
  {
    step: 3,
    title: '3. Improved Constraint-Aware Heuristic Trace',
    subtitle: 'Lexicographic Best-Fit: 66.7% Seat Waste Reduction',
    targetMode: 'evaluation',
    evalSubTab: 'visualizer',
    selectedAlgo: 'improved',
    resetStep: true,
    highlightTarget: 'candidate-matrix',
    talkingPoints: [
      'Lexicographical ordering: prioritizes most-constrained requests first based on feasible placement domain size.',
      'Best-Fit Laboratory Selection: minimizes seat waste (Lab Capacity - Demanded Computers).',
      'Empirical Result: Unused seats cut from 60 down to 20 seats (66.7% waste reduction; seat efficiency surges to 90.9%).'
    ]
  },
  {
    step: 4,
    title: '4. Independent 7-Constraint Verification Audit',
    subtitle: 'Mathematical Hard-Constraint Verification & Audit Proofs',
    targetMode: 'evaluation',
    evalSubTab: 'audit',
    highlightTarget: 'constraint-audit',
    talkingPoints: [
      'Independent audit engine audits final schedules against all 7 mandatory hard constraints.',
      'Enforces no request splitting, no double-booking, capacity sufficiency, allowed slots, and single allocation.',
      'Zero violations detected across all hard constraints (PASS [✓]). Direct link to Acceptance Test Laboratory.'
    ]
  },
  {
    step: 5,
    title: '5. Dynamic Rescheduling (15-Mark Challenge)',
    subtitle: 'Lab A [S2] Outage: 80% Schedule Stability & Minimal Disruption',
    targetMode: 'operational',
    targetTab: 'rescheduling',
    highlightTarget: 'dynamic-rescheduling',
    talkingPoints: [
      'Evaluates dynamic sensitivity when Lab A becomes unexpectedly unavailable during Slot S2.',
      'Baseline FCFS had Request R3 (AI & DS, 45 seats) booked in Lab A [S2].',
      'Engine dynamically reroutes R3 to Lab C [S2] (50 cap), maintaining 80% stability and zero cancellations.'
    ]
  }
];
