/**
 * LABWISE - Algorithm 2: Improved Constraint-Aware Multi-Pass Heuristic
 *
 * Mathematical Framing:
 * Campus Laboratory Allocation is a variant of the Multidimensional Knapsack Problem (MKP)
 * and Generalized Assignment Problem (GAP), both known to be NP-hard.
 *
 * Objective Function (Lexicographic):
 *   Primary:   Maximize count of scheduled requests (N_assigned)
 *   Secondary: Minimize sum of unused seats across all assigned sessions
 *              min sum_{i in Assigned} (Capacity(Lab_i) - ComputersNeeded_i)
 *
 * Heuristic Mechanics:
 * 1. Most-Constrained-First (Fewest Feasible Options / Domain Size):
 *    Requests with fewer eligible (lab, slot) pairings are scheduled first to prevent starvation.
 * 2. Best-Fit Laboratory Selection:
 *    Chooses the lab that minimizes (lab.capacity - computersNeeded), preserving larger labs for high-demand requests.
 * 3. Multi-Candidate Deterministic Search:
 *    Simulates multiple deterministic priority policies (Fewest Options First, Highest Demand First,
 *    Slot Flexibility, Best-Fit Original, and FCFS fallback).
 * 4. Deterministic Tie-Breaking:
 *    Uses lexicographical sorting on (fewest waste -> slot order -> lab ID -> request ID).
 *
 * Note on Optimality:
 * This is an engineering heuristic designed for high-performance deterministic scheduling.
 * Greedy heuristics may not find the global optimum on edge-case pathological inputs.
 */

import { computeAllocationMetrics } from '../utils/metrics.js';
import { validateSchedule } from '../utils/validation.js';
import { runFCFS } from './fcfs.js';

/**
 * Calculate the count of feasible (lab, slot) placements for a request
 */
function getFeasiblePlacementsCount(req, labs, occupiedSlots = new Map()) {
  let count = 0;
  for (const slot of req.allowedSlots) {
    for (const lab of labs) {
      const slotKey = `${lab.id}#${slot}`;
      if (
        lab.availableSlots.includes(slot) &&
        !occupiedSlots.has(slotKey) &&
        lab.capacity >= req.computersNeeded
      ) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Execute a single deterministic assignment pass given a request ordering
 * @param {Array} orderedRequests - Requests sorted according to candidate strategy
 * @param {Array} labs - Available laboratories
 * @param {string} candidateName - Label of the strategy
 * @returns {Object} Candidate schedule result
 */
function executeCandidatePass(orderedRequests, labs, candidateName) {
  const occupiedSlots = new Map(); // `${lab.id}#${slot}` -> requestId
  const assignments = [];
  const unallocated = [];
  const logs = [];

  for (let i = 0; i < orderedRequests.length; i++) {
    const req = orderedRequests[i];
    const candidatePlacements = [];

    // Identify all currently feasible placements for this request
    for (const slot of req.allowedSlots) {
      for (const lab of labs) {
        const slotKey = `${lab.id}#${slot}`;
        if (
          lab.availableSlots.includes(slot) &&
          !occupiedSlots.has(slotKey) &&
          lab.capacity >= req.computersNeeded
        ) {
          const waste = lab.capacity - req.computersNeeded;
          candidatePlacements.push({
            lab,
            slot,
            slotKey,
            waste,
            slotIndex: req.allowedSlots.indexOf(slot)
          });
        }
      }
    }

    if (candidatePlacements.length > 0) {
      // Best-Fit selection:
      // 1. Min unused seats (waste)
      // 2. Earliest allowed slot index in request's preference
      // 3. Alphabetical Lab ID for deterministic tie-breaking
      candidatePlacements.sort((a, b) => {
        if (a.waste !== b.waste) return a.waste - b.waste;
        if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
        return a.lab.id.localeCompare(b.lab.id);
      });

      const best = candidatePlacements[0];
      occupiedSlots.set(best.slotKey, req.id);

      assignments.push({
        requestId: req.id,
        department: req.department,
        computersNeeded: req.computersNeeded,
        labId: best.lab.id,
        labName: best.lab.name || best.lab.id,
        labCapacity: best.lab.capacity,
        slot: best.slot,
        unusedSeats: best.waste,
        assignedAtStep: i + 1,
        reasoning: `Assigned via Best-Fit to "${best.lab.id}" [${best.slot}]. Minimizes seat waste to ${best.waste} seats (${best.lab.capacity} cap - ${req.computersNeeded} req). ${candidatePlacements.length} options evaluated.`
      });

      logs.push({
        step: i + 1,
        requestId: req.id,
        labId: best.lab.id,
        slot: best.slot,
        type: 'ASSIGNED',
        waste: best.waste,
        message: `[${candidateName}] Assigned ${req.id} (${req.computersNeeded}) -> ${best.lab.id} [${best.slot}]. Unused seats: ${best.waste}`
      });
    } else {
      unallocated.push({
        requestId: req.id,
        department: req.department,
        computersNeeded: req.computersNeeded,
        allowedSlots: req.allowedSlots,
        reason: `Constraint exhaustion: All feasible slots [${req.allowedSlots.join(', ')}] with capacity >= ${req.computersNeeded} were occupied by prior allocations.`
      });

      logs.push({
        step: i + 1,
        requestId: req.id,
        type: 'UNALLOCATED',
        message: `[${candidateName}] Request ${req.id} (${req.computersNeeded} computers) could not be placed.`
      });
    }
  }

  const totalUnusedSeats = assignments.reduce((sum, a) => sum + a.unusedSeats, 0);

  return {
    candidateName,
    assignments,
    unallocated,
    logs,
    scheduledCount: assignments.length,
    totalUnusedSeats
  };
}

/**
 * Execute the Improved Heuristic with Multi-Candidate Evaluation
 *
 * @param {Array} rawLabs - Laboratory definitions
 * @param {Array} rawRequests - Request definitions
 * @returns {Object} Winning allocation and candidate breakdown
 */
export function runImprovedHeuristic(rawLabs = [], rawRequests = []) {
  const startTime = performance.now();

  const labs = JSON.parse(JSON.stringify(rawLabs));
  const requests = JSON.parse(JSON.stringify(rawRequests));

  // Run FCFS as baseline fallback candidate
  const fcfsFallback = runFCFS(labs, requests);

  // Generate Deterministic Candidate Orderings

  // Candidate 1: Fewest Initial Feasible Placements First (Most-Constrained-First),
  // tie-broken by Highest Computer Demand, then Request ID
  const candidate1Requests = [...requests].sort((a, b) => {
    const feasibleA = getFeasiblePlacementsCount(a, labs);
    const feasibleB = getFeasiblePlacementsCount(b, labs);
    if (feasibleA !== feasibleB) return feasibleA - feasibleB;
    if (b.computersNeeded !== a.computersNeeded) return b.computersNeeded - a.computersNeeded;
    return a.id.localeCompare(b.id);
  });
  const res1 = executeCandidatePass(
    candidate1Requests,
    labs,
    'Fewest Feasible Placements First (Domain-Size Heuristic)'
  );

  // Candidate 2: Highest Computer Demand First (LPT / Heavy-First Heuristic),
  // tie-broken by fewest allowed slots, then Request ID
  const candidate2Requests = [...requests].sort((a, b) => {
    if (b.computersNeeded !== a.computersNeeded) return b.computersNeeded - a.computersNeeded;
    if (a.allowedSlots.length !== b.allowedSlots.length) return a.allowedSlots.length - b.allowedSlots.length;
    return a.id.localeCompare(b.id);
  });
  const res2 = executeCandidatePass(
    candidate2Requests,
    labs,
    'Highest Computer Demand First (Heavy-Item Best-Fit)'
  );

  // Candidate 3: Original Request Sequence with Best-Fit Lab Selection
  const res3 = executeCandidatePass(
    requests,
    labs,
    'Original Request Order with Best-Fit Selection'
  );

  // Candidate 4: Fewest Allowed Slots First (Slot Tightness Heuristic)
  const candidate4Requests = [...requests].sort((a, b) => {
    if (a.allowedSlots.length !== b.allowedSlots.length) return a.allowedSlots.length - b.allowedSlots.length;
    if (b.computersNeeded !== a.computersNeeded) return b.computersNeeded - a.computersNeeded;
    return a.id.localeCompare(b.id);
  });
  const res4 = executeCandidatePass(
    candidate4Requests,
    labs,
    'Fewest Allowed Slots First (Tight-Window Heuristic)'
  );

  // Candidate 5: FCFS Result as fallback candidate
  const res5 = {
    candidateName: 'FCFS Baseline Fallback',
    assignments: fcfsFallback.assignments,
    unallocated: fcfsFallback.unallocated,
    logs: fcfsFallback.stepLogs,
    scheduledCount: fcfsFallback.assignments.length,
    totalUnusedSeats: fcfsFallback.metrics.totalUnusedSeats
  };

  const allCandidates = [res1, res2, res3, res4, res5];

  // Evaluate candidate schedules against hard constraints and score them lexicographically
  const evaluatedCandidates = allCandidates.map((cand, idx) => {
    const val = validateSchedule(cand.assignments, labs, requests);
    return {
      ...cand,
      candidateIndex: idx,
      isValid: val.isValid,
      conflictCount: val.conflictCount,
      // Lexicographic score: massive multiplier for scheduled count, penalty for unused seats
      lexicographicScore: val.isValid
        ? cand.scheduledCount * 1_000_000 - cand.totalUnusedSeats
        : -999_999_999
    };
  });

  // Pick best valid candidate:
  // 1. Highest scheduledCount
  // 2. Lowest totalUnusedSeats
  // 3. Deterministic candidate order
  evaluatedCandidates.sort((a, b) => {
    if (a.scheduledCount !== b.scheduledCount) return b.scheduledCount - a.scheduledCount;
    if (a.totalUnusedSeats !== b.totalUnusedSeats) return a.totalUnusedSeats - b.totalUnusedSeats;
    return a.candidateIndex - b.candidateIndex;
  });

  const winner = evaluatedCandidates[0];
  const runtimeMs = performance.now() - startTime;

  // Independent audit validation on the winning schedule
  const validation = validateSchedule(winner.assignments, labs, requests);
  const metrics = computeAllocationMetrics(
    winner.assignments,
    winner.unallocated,
    labs,
    requests,
    runtimeMs
  );

  return {
    algorithm: 'Improved Constraint-Aware Heuristic',
    algorithmKey: 'improved',
    winningStrategy: winner.candidateName,
    executedAt: new Date().toISOString(),
    runtimeMs: metrics.runtimeMs,
    assignments: winner.assignments,
    unallocated: winner.unallocated,
    metrics,
    stepLogs: winner.logs,
    candidatesSummary: evaluatedCandidates.map((c) => ({
      name: c.candidateName,
      scheduledCount: c.scheduledCount,
      unallocatedCount: c.unallocated.length,
      totalUnusedSeats: c.totalUnusedSeats,
      isValid: c.isValid,
      conflictCount: c.conflictCount
    })),
    validation,
    isValid: validation.isValid,
    conflictCount: validation.conflictCount,
    heuristicsRationale: {
      primaryObjective: 'Maximize total scheduled requests (Lexicographic tier 1)',
      secondaryObjective: 'Minimize unused computer seats across campus (Lexicographic tier 2)',
      domainPruning: 'Most-constrained requests evaluated first to avoid slot starvation',
      placementRule: 'Best-fit capacity gap (min capacity - demanded computers)',
      caveat: 'Heuristic algorithm. Solves NP-hard assignment efficiently without guaranteed global optimality.'
    }
  };
}

