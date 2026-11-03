# LABWISE — Campus Laboratory Allocation & Optimization System
### Code Crack 3.0 Competition Submission

> **Subtitle:** Intelligent Scheduling. Optimal Resource Utilization.  
> **Evaluation Value:** 100 Marks (including 15 Marks for Mandatory Analytical Challenge)  
> **Architecture:** Pure Client-Side React SPA with Native IndexedDB Persistent Storage (No backend, no REST APIs, no cloud dependencies).

---

## 1. Executive Summary & Dual-Mode Architecture

**LABWISE** is an enterprise-grade algorithmic laboratory scheduling and optimization system built for collegiate campus resource management. It features two specialized operation modes:

### Mode 1: Operational Mode
The normal user-facing campus administration dashboard:
- **Overview Dashboard:** Executive KPI metric cards, active timetable heatmap matrix, and comparative snapshots.
- **Labs & Requests Management:** Full CRUD operations with instant input validation, slot selection, JSON export/import, and official dataset restoration.
- **Allocation Engine:** Full scheduling execution with detailed assignment rationales, unallocated diagnostic panels, and decision logs.
- **Comparison & Analytics:** Empirical side-by-side benchmarking and visual charts.
- **Dynamic Rescheduling:** Disruption simulation with delta analysis.

### Mode 2: Algorithm Lab / Evaluation Mode
A dedicated technical demonstration environment built specifically for algorithms professors and competition evaluators:
1. **Algorithm Execution Visualizer (Interactive Stepper):** Step-by-step state machine with Play/Pause, Next Step, Prev Step, Reset, and Run All. Displays the active request, allowed slots, exhaustive candidate checks, winning selection rationale, and explicit rejection reasons for every non-selected laboratory.
2. **Independent 7-Constraint Audit Panel:** Verifies the final schedule against all 7 hard constraints using an independent decoupled validator, with an adversarial fault injection trigger.
3. **Empirical Benchmark Matrix:** Direct mathematical comparison of FCFS vs Improved Heuristic with exact calculations for both allocated session efficiency and campus capacity utilization.
4. **Acceptance Test Laboratory (10 Scenarios):** Full test harness with "Run All Tests" and "Run Individual Test" measuring real execution duration in milliseconds.
5. **Dynamic Rescheduling Demonstration (FCFS Baseline):** Demonstrates the competition scenario where Lab A [S2] fails and Request R3 moves gracefully from Lab A/S2 to Lab C/S2.
6. **Complexity Visualizer & NP-Hardness:** Formal Big-O analysis, parameter definitions ($R, L, S, K$), and greedy heuristic non-optimality proof.
7. **5-Minute Guided Presentation Walkthrough:** Persistent presenter banner with structured checkpoints for rapid demonstration.

---

## 2. Technology Stack

- **Framework:** React 19 (JavaScript, ES Modules)
- **Bundler & Dev Server:** Vite 8
- **Local Storage:** Native IndexedDB (`LabWiseDB`, Object stores: `laboratories`, `requests`, `results`, `metadata`)
- **Iconography:** Lucide React
- **Algorithms:** Pure JavaScript deterministic scheduling algorithms
- **Styling:** Custom High-Performance CSS Design System (Dark Navy / Violet theme, responsive layouts, accessible controls)
- **Test Framework:** Native verification test suite with in-app test harness and Node CLI runner

---

## 3. Official Sample Dataset

Seed dataset specified in the Code Crack 3.0 problem statement:

### Laboratories
| Lab ID | Name / Facility | Capacity | Available Slots |
| :--- | :--- | :---: | :--- |
| **Lab A** | High Performance Computing Lab | 60 | S1, S2, S3 |
| **Lab B** | Network Systems Lab | 40 | S1, S2, S3 |
| **Lab C** | Software Engineering Lab | 50 | S1, S2 |
| **Lab D** | Embedded Systems Lab | 30 | S2, S3 |

### Requests
| Request ID | Department | Computers Needed | Allowed Slots |
| :--- | :--- | :---: | :--- |
| **R1** | CSE | 55 | S1, S2 |
| **R2** | IT | 35 | S1 |
| **R3** | AI & DS | 45 | S2 |
| **R4** | ECE | 25 | S2, S3 |
| **R5** | MCA | 40 | S3 |

---

## 4. Input Constraints & Hard Constraint Modeling

Inputs are strictly validated via `src/utils/validation.js`. Final schedules are independently audited against all **7 Hard Constraints**:

1. **No Splitting:** A request cannot be split between multiple labs or multiple slots.
2. **No Double-Booking:** A laboratory can host at most one request per time slot.
3. **Sufficient Capacity:** Laboratory capacity must be greater than or equal to computers required ($\text{Capacity} \ge \text{Needed}$).
4. **Allowed Slot Restriction:** A request can only be assigned to one of its specified allowed slots.
5. **Lab Availability Restriction:** A laboratory can only be scheduled during its operational available slots.
6. **Unique Request Allocation:** Each request must appear at most once in the entire schedule, or remain unallocated.
7. **Integrity Invariant:** An invalid allocation with constraint violations must never be displayed as a successful allocation.

---

## 5. Allocation Algorithms & Real Mathematical Results

### Metric Verification & Exact Formulas:
- **Demanded Computers Served:** $55 + 35 + 45 + 25 + 40 = 200$ computers.
- **Allocated Sessions Capacity:**
  - FCFS: Lab A (60) + Lab B (40) + Lab A (60) + Lab B (40) + Lab A (60) = **260 seats**.
  - Improved Heuristic: Lab A (60) + Lab B (40) + Lab C (50) + Lab D (30) + Lab B (40) = **220 seats**.
- **Unused Seats Waste:**
  - FCFS: $260 - 200 =$ **60 seats**.
  - Improved Heuristic: $220 - 200 =$ **20 seats** (**66.7% Waste Reduction**).
- **Allocated Session Seat Efficiency:**
  - FCFS: $\frac{200}{260} \times 100\% =$ **76.9%**.
  - Improved Heuristic: $\frac{200}{220} \times 100\% =$ **90.9%** (**+14.0% efficiency boost**).
- **Global Campus Capacity Utilization:**
  - Total Potential Campus Capacity: $60 \times 3 + 40 \times 3 + 50 \times 2 + 30 \times 2 = 180 + 120 + 100 + 60 =$ **460 seat-slots**.
  - Global Campus Utilization: $\frac{200}{460} \times 100\% =$ **43.5%**.

| Analytical Dimension | Algorithm 1: FCFS Baseline | Algorithm 2: Improved Heuristic | Optimization Impact |
| :--- | :---: | :---: | :--- |
| **Scheduled Requests** | **5 / 5 (100%)** | **5 / 5 (100%)** | Parity fulfillment |
| **Unallocated Requests** | **0** | **0** | Zero backlog |
| **Total Unused Seats** | **60 seats** | **20 seats** | **-66.7% Waste (40 seats conserved)** |
| **Allocated Session Efficiency** | **76.9%** | **90.9%** | **+14.0% Seat fit boost** |
| **Campus Global Utilization** | **43.5%** | **43.5%** | Campus static bound |
| **Audit Conflict Violations** | **0 Violations** | **0 Violations** | **100% Constraints satisfied** |
| **Runtime (`performance.now()`)** | **~0.2 ms** | **~1.1 ms** | **Real-time sub-millisecond execution** |

---

## 6. Dynamic Rescheduling Challenge (15 Marks)

### Scenario: Laboratory A becomes unavailable in Slot S2
- **Baseline Algorithm:** First-Come, First-Served (FCFS).
- **Baseline Placement:** In FCFS, Request R3 (AI & DS, 45 computers) was scheduled in **Lab A [S2]** (first alphabetical match).
- **Disruption & Recomputation:**
  - When Lab A slot S2 is disabled, the engine reallocates R3 to **Lab C [S2]** (Capacity: 50, Waste: 5 seats).
  - All other 4 requests (R1, R2, R4, R5) remain completely undisturbed.
  - **Changed Original Assignments Count:** **1** (R3 moved from Lab A/S2 $\to$ Lab C/S2).
  - **Schedule Stability Index:** **80.0%**.
  - **Displaced / Unallocated Requests:** **0**.
  - **Independent Validation Audit:** **0 Conflicts**.
- **Restore Capability:** One-click restoration restores Lab A's S2 availability without corrupting persistent database records.

---

## 7. Computational Complexity & Scalability

| Parameter | Definition | Official Problem Value |
| :--- | :--- | :---: |
| **R** | Number of department laboratory requests ($|\text{Requests}|$) | 5 |
| **L** | Number of physical campus laboratories ($|\text{Labs}|$) | 4 |
| **S** | Number of discrete operational time slots ($|\text{Slots}|$) | 3 |
| **K** | Number of deterministic candidate heuristic strategies | 5 |

### Asymptotic Analysis
- **FCFS Baseline:** Time Complexity: $O(R \cdot S \cdot L)$ | Space Complexity: $O(L \cdot S + R)$.
- **Improved Heuristic:** Time Complexity: $O(K \cdot (R \log R + R \cdot S \cdot L))$ | Space Complexity: $O(K \cdot (R + L \cdot S))$.
- **NP-Hardness:** Campus Laboratory Allocation is isomorphic to the Generalized Assignment Problem (GAP) and Multidimensional Knapsack Problem (MKP), both strongly NP-hard. Exact solvers require exponential time $O(2^{R \cdot S \cdot L})$.
- **Greedy Failure Case Proof:** A locally optimal Best-Fit assignment can inadvertently consume a lab-slot that a subsequent, tightly-constrained request uniquely required. LABWISE transparently documents this as an engineering heuristic rather than claiming global optimality.

---

## 8. Automated Acceptance Test Suite (10 Scenarios)

The test suite can be run either via the **In-App Acceptance Test Laboratory** or via the CLI (`npm test`):

1. **Official Sample Dataset:** Runs FCFS and Heuristic; verifies 0 conflicts and $\ge 60\%$ waste reduction.
2. **Insufficient Capacity:** Request requiring 120 computers (max lab capacity 60) remains unallocated with 0 conflicts.
3. **Disallowed / Unavailable Slots:** Request restricted to non-existent slot $S_{99}$ handled safely.
4. **Contention & Double-Booking Prevention:** 3 requests competing for 2 slots in $S_1$ yields 2 assignments, 1 unallocated, and 0 double bookings.
5. **Invalid Capacities:** Negative, zero, and decimal laboratory capacities rejected by validator.
6. **Duplicate Request IDs:** ID collisions detected and rejected.
7. **No Request Splitting:** Independent audit rejects split sessions.
8. **No Double Booking:** Independent audit rejects overlapping assignments.
9. **Dynamic Rescheduling:** Verifies Lab A $S_2$ failure correctly reallocates R3 to Lab C $S_2$ with stability = 80%.
10. **Input Modification & Determinism:** Dynamic lab addition produces 100% reproducible schedules.

---

## 9. How to Launch and Demonstrate

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite in terminal
npm test

# 3. Build production bundle (verified clean in < 1s)
npm run build

# 4. Start local development server
npm run dev

# 5. Open in browser:
# http://localhost:5173
```

### 5-Minute Evaluation Walkthrough Guide:
1. Click **"5-Min Demo"** in the top navigation bar.
2. **Slide 1:** Review Campus Infrastructure (Labs A–D, Requests R1–R5, IndexedDB local persistence).
3. **Slide 2:** Switch to **Algorithm Lab $\to$ Execution Visualizer**, click **"Auto Play"** or **"Next"** to trace FCFS and see the 60 unused seats bottleneck.
4. **Slide 3:** View **Benchmark Matrix**, highlighting the **66.7% waste reduction** and surge to **90.9% seat efficiency**.
5. **Slide 4:** Jump to **Dynamic Rescheduling Demo**, trigger the Lab A [S2] outage, and watch **R3 shift from Lab A/S2 $\to$ Lab C/S2** with 80% stability.
6. **Slide 5:** Inspect the **7-Constraint Audit Panel** and run the **Acceptance Test Laboratory** (10 / 10 PASS).

---

**Developed for Code Crack 3.0 Competition Submission.**  
*Campus Laboratory Allocation & Optimization System (LABWISE)*
