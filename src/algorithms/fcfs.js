/**
 * LABWISE - Algorithm 1: First-Come, First-Served (FCFS) Baseline
 * Deterministic baseline algorithm that processes requests in their original input sequence.
 */

import { computeAllocationMetrics } from '../utils/metrics.js';
import { validateSchedule } from '../utils/validation.js';

/**
 * Execute First-Come, First-Served (FCFS) Laboratory Allocation
 *
 * Algorithm Rules:
 * 1. Process requests strictly in the original input order.
 * 2. For each request, iterate through its allowed slots in specified order.
 * 3. For each slot, iterate through laboratories sorted in ascending alphabetical order (by ID).
 * 4. Select the FIRST laboratory that has the slot available, is not currently occupied,
 *    and has capacity >= request.computersNeeded.
 * 5. If no valid placement is found across all allowed slots and labs, mark unallocated.
 * 6. Guarantee that no lab is double-booked in any slot.
 *
 * @param {Array} rawLabs - Laboratory definitions
 * @param {Array} rawRequests - Request definitions
 * @returns {Object} Comprehensive FCFS allocation results
 */
export function runFCFS(rawLabs = [], rawRequests = []) {
  const startTime = performance.now();

  // Deep clone inputs to strictly prevent mutating caller data
  const labs = JSON.parse(JSON.stringify(rawLabs));
  const requests = JSON.parse(JSON.stringify(rawRequests));

  // Sort laboratories alphabetically by ID (e.g. Lab A, Lab B, Lab C, Lab D)
  const sortedLabs = [...labs].sort((a, b) => a.id.localeCompare(b.id));

  // Occupancy tracker: key is `${labId}#${slot}` -> assigned requestId
  const occupiedSlots = new Map();

  const assignments = [];
  const unallocated = [];
  const stepLogs = [];

  for (let reqIndex = 0; reqIndex < requests.length; reqIndex++) {
    const req = requests[reqIndex];
    let allocated = false;
    const attemptedSlots = [];

    stepLogs.push({
      step: reqIndex + 1,
      requestId: req.id,
      department: req.department,
      computersNeeded: req.computersNeeded,
      allowedSlots: req.allowedSlots,
      type: 'EVALUATING',
      message: `Evaluating Request ${req.id} (${req.department}, ${req.computersNeeded} computers)...`
    });

    // Iterate through allowed slots in specified order
    for (const slot of req.allowedSlots) {
      if (allocated) break;
      attemptedSlots.push(slot);

      // Iterate through laboratories in alphabetical order
      for (const lab of sortedLabs) {
        const slotKey = `${lab.id}#${slot}`;

        // Check availability
        const isSlotAvailableInLab = lab.availableSlots.includes(slot);
        const isSlotOccupied = occupiedSlots.has(slotKey);
        const hasSufficientCapacity = lab.capacity >= req.computersNeeded;

        if (isSlotAvailableInLab && !isSlotOccupied && hasSufficientCapacity) {
          // Success: Assign to this first matching lab
          occupiedSlots.set(slotKey, req.id);
          const unusedSeats = lab.capacity - req.computersNeeded;

          const assignmentRecord = {
            requestId: req.id,
            department: req.department,
            computersNeeded: req.computersNeeded,
            labId: lab.id,
            labName: lab.name || lab.id,
            labCapacity: lab.capacity,
            slot: slot,
            unusedSeats: unusedSeats,
            assignedAtStep: reqIndex + 1,
            reasoning: `Matched slot ${slot} in alphabetically first available lab "${lab.id}" (Capacity ${lab.capacity} >= Needed ${req.computersNeeded}). Unused seats: ${unusedSeats}.`
          };

          assignments.push(assignmentRecord);
          allocated = true;

          stepLogs.push({
            step: reqIndex + 1,
            requestId: req.id,
            labId: lab.id,
            slot: slot,
            type: 'ASSIGNED',
            message: `Assigned ${req.id} -> ${lab.id} [${slot}] (Capacity: ${lab.capacity}, Needed: ${req.computersNeeded}, Unused: ${unusedSeats})`
          });
          break;
        }
      }
    }

    if (!allocated) {
      // Could not allocate
      const unallocatedRecord = {
        requestId: req.id,
        department: req.department,
        computersNeeded: req.computersNeeded,
        allowedSlots: req.allowedSlots,
        reason: `No eligible lab with capacity >= ${req.computersNeeded} was free during allowed slots [${req.allowedSlots.join(', ')}].`
      };
      unallocated.push(unallocatedRecord);

      stepLogs.push({
        step: reqIndex + 1,
        requestId: req.id,
        type: 'UNALLOCATED',
        message: `Failed to allocate ${req.id}: Insufficient capacity or all allowed slots [${req.allowedSlots.join(', ')}] were booked.`
      });
    }
  }

  const runtimeMs = performance.now() - startTime;

  // Independent audit validation
  const validation = validateSchedule(assignments, labs, requests);

  // Compute comprehensive metrics
  const metrics = computeAllocationMetrics(assignments, unallocated, labs, requests, runtimeMs);

  return {
    algorithm: 'FCFS Baseline',
    algorithmKey: 'fcfs',
    executedAt: new Date().toISOString(),
    runtimeMs: metrics.runtimeMs,
    assignments,
    unallocated,
    metrics,
    stepLogs,
    validation,
    isValid: validation.isValid,
    conflictCount: validation.conflictCount
  };
}

