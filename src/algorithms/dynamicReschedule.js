/**
 * LABWISE - Dynamic Rescheduling & Sensitivity Engine (15 Marks Analytical Challenge)
 *
 * Implements real-time disruption simulation, recomputation, and delta analysis.
 * Primary Scenario: Laboratory A becomes unavailable in Slot S2 (hardware failure / power maintenance).
 */

import { runImprovedHeuristic } from './heuristic.js';
import { runFCFS } from './fcfs.js';

export const DEFAULT_FAILURE_SCENARIO = {
  labId: 'Lab A',
  slot: 'S2',
  reason: 'Emergency Unscheduled Power & HVAC Maintenance'
};

/**
 * Execute dynamic rescheduling when a lab slot becomes unavailable
 *
 * @param {Array} originalLabs - Baseline laboratories
 * @param {Array} originalRequests - Baseline requests
 * @param {Object} originalResult - Baseline allocation result
 * @param {Object} failureConfig - Disruption config { labId, slot, reason }
 * @param {string} [algorithmKey='improved'] - 'improved' or 'fcfs'
 * @returns {Object} Comprehensive delta analysis and rescheduled result
 */
export function executeDynamicRescheduling(
  originalLabs = [],
  originalRequests = [],
  originalResult = null,
  failureConfig = DEFAULT_FAILURE_SCENARIO,
  algorithmKey = 'improved'
) {
  // 1. Ensure we have baseline allocation
  const baseResult =
    originalResult ||
    (algorithmKey === 'fcfs'
      ? runFCFS(originalLabs, originalRequests)
      : runImprovedHeuristic(originalLabs, originalRequests));

  const originalAssignments = baseResult.assignments || [];
  const originalUnallocated = baseResult.unallocated || [];

  // Map original assignments by requestId
  const origAssignmentMap = new Map();
  for (const a of originalAssignments) {
    origAssignmentMap.set(a.requestId, a);
  }

  // 2. Clone labs and remove the disabled slot from the target lab
  const modifiedLabs = originalLabs.map((lab) => {
    if (lab.id === failureConfig.labId) {
      return {
        ...lab,
        availableSlots: lab.availableSlots.filter((s) => s !== failureConfig.slot)
      };
    }
    return {
      ...lab,
      availableSlots: [...lab.availableSlots]
    };
  });

  // 3. Re-run allocation algorithm on modified availability data
  const newResult =
    algorithmKey === 'fcfs'
      ? runFCFS(modifiedLabs, originalRequests)
      : runImprovedHeuristic(modifiedLabs, originalRequests);

  const newAssignments = newResult.assignments || [];
  const newUnallocated = newResult.unallocated || [];

  const newAssignmentMap = new Map();
  for (const a of newAssignments) {
    newAssignmentMap.set(a.requestId, a);
  }

  // 4. Compare original and new assignments
  // Rule: Count how many ORIGINALLY ASSIGNED requests changed assignment.
  // Changed assignment includes:
  // - Moved to different laboratory
  // - Moved to different slot
  // - Previously allocated becoming unallocated
  // Note: Requests that were originally unallocated are NOT counted as changed original assignments.

  const deltaDetails = [];
  let changedOriginalAssignmentsCount = 0;
  const movedRequests = [];
  const newlyUnallocatedRequests = [];
  const unchangedRequests = [];

  for (const orig of originalAssignments) {
    const updated = newAssignmentMap.get(orig.requestId);

    if (!updated) {
      // Was allocated originally, now unallocated!
      changedOriginalAssignmentsCount++;
      const deltaItem = {
        requestId: orig.requestId,
        department: orig.department,
        computersNeeded: orig.computersNeeded,
        status: 'NEWLY_UNALLOCATED',
        statusLabel: 'Displaced (Unallocated)',
        originalLabId: orig.labId,
        originalSlot: orig.slot,
        newLabId: null,
        newSlot: null,
        explanation: `Lost placement in ${orig.labId} [${orig.slot}]. Due to capacity pressure, no feasible replacement was found.`
      };
      deltaDetails.push(deltaItem);
      newlyUnallocatedRequests.push(deltaItem);
    } else if (updated.labId !== orig.labId || updated.slot !== orig.slot) {
      // Changed lab, slot, or both
      changedOriginalAssignmentsCount++;
      let changeType = 'MOVED_BOTH';
      let changeLabel = 'Shifted Lab & Slot';

      if (updated.labId !== orig.labId && updated.slot === orig.slot) {
        changeType = 'MOVED_LAB';
        changeLabel = 'Reallocated Laboratory';
      } else if (updated.labId === orig.labId && updated.slot !== orig.slot) {
        changeType = 'MOVED_SLOT';
        changeLabel = 'Rescheduled Time Slot';
      }

      const deltaItem = {
        requestId: orig.requestId,
        department: orig.department,
        computersNeeded: orig.computersNeeded,
        status: changeType,
        statusLabel: changeLabel,
        originalLabId: orig.labId,
        originalSlot: orig.slot,
        newLabId: updated.labId,
        newSlot: updated.slot,
        unusedSeatsBefore: orig.unusedSeats,
        unusedSeatsAfter: updated.unusedSeats,
        explanation: `Moved from ${orig.labId} [${orig.slot}] to ${updated.labId} [${updated.slot}].`
      };
      deltaDetails.push(deltaItem);
      movedRequests.push(deltaItem);
    } else {
      // Unchanged assignment
      const deltaItem = {
        requestId: orig.requestId,
        department: orig.department,
        computersNeeded: orig.computersNeeded,
        status: 'UNCHANGED',
        statusLabel: 'Stable / Unchanged',
        originalLabId: orig.labId,
        originalSlot: orig.slot,
        newLabId: updated.labId,
        newSlot: updated.slot,
        explanation: `Remained stable in ${orig.labId} [${orig.slot}].`
      };
      deltaDetails.push(deltaItem);
      unchangedRequests.push(deltaItem);
    }
  }

  // Check requests that were originally unallocated
  const originallyUnallocatedStatus = originalUnallocated.map((origUnalloc) => {
    const isNowAssigned = newAssignmentMap.get(origUnalloc.requestId);
    return {
      requestId: origUnalloc.requestId,
      department: origUnalloc.department,
      computersNeeded: origUnalloc.computersNeeded,
      status: isNowAssigned ? 'NEWLY_SCHEDULED' : 'STILL_UNALLOCATED',
      statusLabel: isNowAssigned ? 'Newly Scheduled' : 'Persistently Unallocated',
      originalLabId: null,
      originalSlot: null,
      newLabId: isNowAssigned ? isNowAssigned.labId : null,
      newSlot: isNowAssigned ? isNowAssigned.slot : null,
      countedAsOriginalChange: false // Explicitly false per competition criteria
    };
  });

  // Schedule stability score
  const totalOriginalAssigned = originalAssignments.length;
  const scheduleStabilityPct =
    totalOriginalAssigned > 0
      ? Math.round(
          ((totalOriginalAssigned - changedOriginalAssignmentsCount) / totalOriginalAssigned) * 1000
        ) / 10
      : 100;

  // Impact explanation generator
  const directVictim = originalAssignments.find(
    (a) => a.labId === failureConfig.labId && a.slot === failureConfig.slot
  );

  let narrativeExplanation = '';
  if (directVictim) {
    narrativeExplanation = `Direct Disruption: Request ${directVictim.requestId} (${directVictim.department}, ${directVictim.computersNeeded} computers) was originally booked in ${failureConfig.labId} during slot ${failureConfig.slot}. When ${failureConfig.labId} became unavailable in ${failureConfig.slot}, ${directVictim.requestId} had to be reallocated. This triggered ${changedOriginalAssignmentsCount} total assignment changes across the campus schedule.`;
  } else {
    narrativeExplanation = `No request was directly scheduled in ${failureConfig.labId} during ${failureConfig.slot} in the baseline schedule. However, reducing overall campus capacity caused ${changedOriginalAssignmentsCount} reassignments during global optimization.`;
  }

  return {
    failureConfig,
    algorithmUsed: newResult.algorithm,
    originalSchedule: {
      assignments: originalAssignments,
      unallocated: originalUnallocated,
      metrics: baseResult.metrics
    },
    updatedSchedule: {
      assignments: newAssignments,
      unallocated: newUnallocated,
      metrics: newResult.metrics
    },
    modifiedLabs,
    comparison: {
      totalOriginalAssigned,
      totalNewAssigned: newAssignments.length,
      changedOriginalAssignmentsCount,
      scheduleStabilityPct,
      movedCount: movedRequests.length,
      newlyUnallocatedCount: newlyUnallocatedRequests.length,
      unchangedCount: unchangedRequests.length
    },
    deltaDetails,
    movedRequests,
    newlyUnallocatedRequests,
    unchangedRequests,
    originallyUnallocatedStatus,
    narrativeExplanation,
    executedAt: new Date().toISOString()
  };
}

