/**
 * LABWISE - Comprehensive Analytical Metrics Calculator
 * Accurately derives all operational and efficiency metrics from schedule results.
 */

import { validateSchedule } from './validation.js';

/**
 * Compute exhaustive metrics for an allocation result
 * @param {Array} assignments - Array of assignments
 * @param {Array} unallocated - Array of unallocated requests
 * @param {Array} labs - Complete laboratory list
 * @param {Array} requests - Complete request list
 * @param {number} runtimeMs - Execution time in milliseconds
 * @returns {Object} Metric summary
 */
export function computeAllocationMetrics(assignments = [], unallocated = [], labs = [], requests = [], runtimeMs = 0) {
  const totalRequests = requests.length;
  const scheduledCount = assignments.length;
  const unallocatedCount = unallocated.length;

  // Total computers requested across all requests
  const totalComputersDemanded = requests.reduce((sum, r) => sum + Number(r.computersNeeded || 0), 0);
  const scheduledComputersServed = assignments.reduce((sum, a) => sum + Number(a.computersNeeded || 0), 0);

  // Unused Seats: Sum of (Lab Capacity - Computers Required) for every assigned session
  let totalUnusedSeats = 0;
  let totalAllocatedCapacity = 0;

  for (const a of assignments) {
    const lab = labs.find((l) => l.id === a.labId);
    const capacity = lab ? lab.capacity : a.labCapacity || 0;
    const computersNeeded = a.computersNeeded || 0;
    const unused = Math.max(0, capacity - computersNeeded);
    totalUnusedSeats += unused;
    totalAllocatedCapacity += capacity;
  }

  // Conflict validation audit
  const validation = validateSchedule(assignments, labs, requests);

  // 1. Allocated Session Seat Efficiency (%):
  // Measures utilization ONLY across laboratory sessions that were actually booked.
  // Formula: (Demanded Computers in Scheduled Sessions / Total Capacity of Scheduled Labs) * 100
  // e.g. FCFS: 200 / 260 = 76.9%, Heuristic: 200 / 220 = 90.9%
  const seatEfficiencyPct =
    totalAllocatedCapacity > 0
      ? Math.round((scheduledComputersServed / totalAllocatedCapacity) * 1000) / 10
      : 0;

  // 2. Global Campus Capacity Utilization (%):
  // Measures utilization across ALL laboratories and ALL their open time slots.
  // Formula: (Demanded Computers in Scheduled Sessions / Total Potential Campus Seat-Slots) * 100
  // e.g. 200 / (180 + 120 + 100 + 60 = 460) = 43.5%
  const totalCampusCapacity = labs.reduce((sum, l) => sum + Number(l.capacity || 0) * (l.availableSlots?.length || 0), 0);
  const campusCapacityUtilizationPct =
    totalCampusCapacity > 0
      ? Math.round((scheduledComputersServed / totalCampusCapacity) * 1000) / 10
      : 0;

  // Schedule Fulfillment Rate (%)
  const scheduleRatePct =
    totalRequests > 0 ? Math.round((scheduledCount / totalRequests) * 1000) / 10 : 0;

  // Demand Fulfillment Rate (%)
  const demandFulfillmentPct =
    totalComputersDemanded > 0
      ? Math.round((scheduledComputersServed / totalComputersDemanded) * 1000) / 10
      : 0;

  // Per-Laboratory utilization stats
  const labUtilization = labs.map((lab) => {
    const labAssignments = assignments.filter((a) => a.labId === lab.id);
    const sessionsScheduled = labAssignments.length;
    const maxPossibleSessions = lab.availableSlots.length;
    const computersServed = labAssignments.reduce((sum, a) => sum + a.computersNeeded, 0);
    const unusedSeats = labAssignments.reduce((sum, a) => sum + (lab.capacity - a.computersNeeded), 0);
    const totalPotentialCapacity = lab.capacity * maxPossibleSessions;
    const labEfficiency =
      labAssignments.length > 0 && lab.capacity > 0
        ? Math.round((computersServed / (lab.capacity * sessionsScheduled)) * 1000) / 10
        : 0;
    const labOccupancyRate =
      maxPossibleSessions > 0
        ? Math.round((sessionsScheduled / maxPossibleSessions) * 1000) / 10
        : 0;

    return {
      labId: lab.id,
      labName: lab.name || lab.id,
      capacity: lab.capacity,
      availableSlotsCount: maxPossibleSessions,
      sessionsScheduled,
      computersServed,
      unusedSeats,
      totalPotentialCapacity,
      labEfficiency,
      labOccupancyRate
    };
  });

  // Per-Slot distribution
  const allSlotIds = Array.from(
    new Set([...labs.flatMap((l) => l.availableSlots), ...requests.flatMap((r) => r.allowedSlots)])
  ).sort();

  const slotUtilization = allSlotIds.map((slotId) => {
    const slotAssignments = assignments.filter((a) => a.slot === slotId);
    const labsAvailableInSlot = labs.filter((l) => l.availableSlots.includes(slotId)).length;
    const computersServed = slotAssignments.reduce((sum, a) => sum + a.computersNeeded, 0);
    const unusedSeats = slotAssignments.reduce((sum, a) => sum + (a.labCapacity - a.computersNeeded), 0);

    return {
      slotId,
      scheduledCount: slotAssignments.length,
      labsAvailable: labsAvailableInSlot,
      computersServed,
      unusedSeats,
      occupancyRate:
        labsAvailableInSlot > 0
          ? Math.round((slotAssignments.length / labsAvailableInSlot) * 1000) / 10
          : 0
    };
  });

  return {
    totalRequests,
    scheduledCount,
    unallocatedCount,
    scheduleRatePct,
    totalComputersDemanded,
    scheduledComputersServed,
    demandFulfillmentPct,
    totalAllocatedCapacity,
    totalCampusCapacity,
    totalUnusedSeats,
    seatEfficiencyPct,
    allocatedCapacityUtilizationPct: seatEfficiencyPct,
    campusCapacityUtilizationPct,
    runtimeMs: Math.round(runtimeMs * 100) / 100,
    conflictCount: validation.conflictCount,
    isValid: validation.isValid,
    conflicts: validation.conflicts,
    labUtilization,
    slotUtilization
  };
}
