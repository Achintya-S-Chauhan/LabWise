/**
 * LABWISE - Algorithm Execution Visualizer Stepper Generator
 * Computes authentic, step-by-step decision states for both FCFS and Improved Heuristic.
 * Captures full evaluation matrices: slots tested, capacity checks, rejection reasons,
 * current schedule state, and remaining queue at each discrete algorithm step.
 */

/**
 * Generate discrete execution trace steps for FCFS Baseline
 * @param {Array} rawLabs
 * @param {Array} rawRequests
 * @returns {Array<StepState>}
 */
export function generateFCFSSteps(rawLabs = [], rawRequests = []) {
  const labs = JSON.parse(JSON.stringify(rawLabs));
  const requests = JSON.parse(JSON.stringify(rawRequests));
  const sortedLabs = [...labs].sort((a, b) => a.id.localeCompare(b.id));

  const occupiedSlots = new Map(); // `${labId}#${slot}` -> requestId
  const steps = [];
  const currentAssignments = [];
  const currentUnallocated = [];

  for (let reqIndex = 0; reqIndex < requests.length; reqIndex++) {
    const req = requests[reqIndex];
    const candidateEvaluations = [];
    let selectedAssignment = null;

    // Check all slots and labs to document complete decision matrix
    for (const slot of req.allowedSlots) {
      if (selectedAssignment) break;

      for (const lab of sortedLabs) {
        const slotKey = `${lab.id}#${slot}`;
        const isSlotAvailableInLab = lab.availableSlots.includes(slot);
        const isOccupied = occupiedSlots.has(slotKey);
        const occupiedBy = occupiedSlots.get(slotKey) || null;
        const hasSufficientCapacity = lab.capacity >= req.computersNeeded;

        let status = 'REJECTED';
        let decisionReason = '';

        if (!isSlotAvailableInLab) {
          decisionReason = `Lab "${lab.id}" is closed/unavailable in slot ${slot}.`;
        } else if (isOccupied) {
          decisionReason = `Lab "${lab.id}" is occupied in slot ${slot} by prior request "${occupiedBy}".`;
        } else if (!hasSufficientCapacity) {
          decisionReason = `Insufficient capacity: Lab capacity (${lab.capacity}) < Demanded (${req.computersNeeded}).`;
        } else {
          status = 'SELECTED';
          const waste = lab.capacity - req.computersNeeded;
          decisionReason = `First alphabetical laboratory available with sufficient capacity (${lab.capacity} >= ${req.computersNeeded}). Unused seats: ${waste}.`;
          
          selectedAssignment = {
            requestId: req.id,
            department: req.department,
            computersNeeded: req.computersNeeded,
            labId: lab.id,
            labName: lab.name || lab.id,
            labCapacity: lab.capacity,
            slot,
            unusedSeats: waste,
            stepIndex: reqIndex + 1,
            reasoning: decisionReason
          };
        }

        candidateEvaluations.push({
          slot,
          labId: lab.id,
          labCapacity: lab.capacity,
          computersNeeded: req.computersNeeded,
          isSlotAvailableInLab,
          isOccupied,
          occupiedBy,
          hasSufficientCapacity,
          capacityDiff: lab.capacity - req.computersNeeded,
          status,
          decisionReason
        });

        if (status === 'SELECTED') {
          occupiedSlots.set(slotKey, req.id);
          break; // FCFS stops at first valid match
        }
      }
    }

    if (selectedAssignment) {
      currentAssignments.push(selectedAssignment);
    } else {
      currentUnallocated.push({
        requestId: req.id,
        department: req.department,
        computersNeeded: req.computersNeeded,
        allowedSlots: req.allowedSlots,
        reason: `Exhausted all allowed slots [${req.allowedSlots.join(', ')}]. No eligible lab with capacity >= ${req.computersNeeded} was unoccupied.`
      });
    }

    const remainingRequests = requests.slice(reqIndex + 1);

    steps.push({
      stepNumber: reqIndex + 1,
      totalSteps: requests.length,
      algorithmName: 'FCFS Baseline',
      algorithmKey: 'fcfs',
      currentRequest: req,
      candidateEvaluations,
      selectedAssignment,
      isAllocated: !!selectedAssignment,
      currentAssignments: JSON.parse(JSON.stringify(currentAssignments)),
      currentUnallocated: JSON.parse(JSON.stringify(currentUnallocated)),
      remainingRequests: JSON.parse(JSON.stringify(remainingRequests)),
      occupiedSlotsMap: Object.fromEntries(occupiedSlots),
      stepSummary: selectedAssignment
        ? `Step ${reqIndex + 1}: Request ${req.id} (${req.department}, ${req.computersNeeded} seats) allocated to ${selectedAssignment.labId} [${selectedAssignment.slot}] with ${selectedAssignment.unusedSeats} unused seats.`
        : `Step ${reqIndex + 1}: Request ${req.id} (${req.department}) could not be allocated due to capacity or slot contention.`
    });
  }

  return steps;
}

/**
 * Generate discrete execution trace steps for Improved Heuristic (Winning Candidate)
 * @param {Array} rawLabs
 * @param {Array} rawRequests
 * @returns {Array<StepState>}
 */
export function generateHeuristicSteps(rawLabs = [], rawRequests = []) {
  const labs = JSON.parse(JSON.stringify(rawLabs));
  const requests = JSON.parse(JSON.stringify(rawRequests));

  // Determine feasible placement count for each request
  const feasibleCount = (req) => {
    let count = 0;
    for (const s of req.allowedSlots) {
      for (const l of labs) {
        if (l.availableSlots.includes(s) && l.capacity >= req.computersNeeded) count++;
      }
    }
    return count;
  };

  // Sort by Domain Size (Most-Constrained-First), tie-break by Higher Demand, then ID
  const orderedRequests = [...requests].sort((a, b) => {
    const fA = feasibleCount(a);
    const fB = feasibleCount(b);
    if (fA !== fB) return fA - fB;
    if (b.computersNeeded !== a.computersNeeded) return b.computersNeeded - a.computersNeeded;
    return a.id.localeCompare(b.id);
  });

  const occupiedSlots = new Map(); // `${labId}#${slot}` -> requestId
  const steps = [];
  const currentAssignments = [];
  const currentUnallocated = [];

  for (let reqIndex = 0; reqIndex < orderedRequests.length; reqIndex++) {
    const req = orderedRequests[reqIndex];
    const candidateEvaluations = [];
    const validCandidates = [];

    // Evaluate all combinations
    for (const slot of req.allowedSlots) {
      for (const lab of labs) {
        const slotKey = `${lab.id}#${slot}`;
        const isSlotAvailableInLab = lab.availableSlots.includes(slot);
        const isOccupied = occupiedSlots.has(slotKey);
        const occupiedBy = occupiedSlots.get(slotKey) || null;
        const hasSufficientCapacity = lab.capacity >= req.computersNeeded;
        const waste = lab.capacity - req.computersNeeded;

        let status = 'REJECTED';
        let decisionReason = '';

        if (!isSlotAvailableInLab) {
          decisionReason = `Lab "${lab.id}" is closed/unavailable in slot ${slot}.`;
        } else if (isOccupied) {
          decisionReason = `Lab "${lab.id}" is occupied in slot ${slot} by "${occupiedBy}".`;
        } else if (!hasSufficientCapacity) {
          decisionReason = `Insufficient capacity: Lab capacity (${lab.capacity}) < Demanded (${req.computersNeeded}).`;
        } else {
          status = 'FEASIBLE';
          decisionReason = `Feasible candidate. Waste: ${waste} seats.`;
          validCandidates.push({
            lab,
            slot,
            slotKey,
            waste,
            slotIndex: req.allowedSlots.indexOf(slot)
          });
        }

        candidateEvaluations.push({
          slot,
          labId: lab.id,
          labCapacity: lab.capacity,
          computersNeeded: req.computersNeeded,
          isSlotAvailableInLab,
          isOccupied,
          occupiedBy,
          hasSufficientCapacity,
          capacityDiff: waste,
          status,
          decisionReason
        });
      }
    }

    let selectedAssignment = null;

    if (validCandidates.length > 0) {
      // Best-Fit Sizing: Min waste -> slot index -> Lab ID
      validCandidates.sort((a, b) => {
        if (a.waste !== b.waste) return a.waste - b.waste;
        if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
        return a.lab.id.localeCompare(b.lab.id);
      });

      const winner = validCandidates[0];
      occupiedSlots.set(winner.slotKey, req.id);

      // Update candidate evaluations to highlight winning choice and reasons for others
      candidateEvaluations.forEach((cand) => {
        if (cand.labId === winner.lab.id && cand.slot === winner.slot) {
          cand.status = 'SELECTED';
          cand.decisionReason = `BEST-FIT WINNER: Minimizes unused seats to ${winner.waste} seats (${winner.lab.capacity} cap - ${req.computersNeeded} req).`;
        } else if (cand.status === 'FEASIBLE') {
          cand.status = 'SUB_OPTIMAL';
          cand.decisionReason = `Feasible but rejected: Waste (${cand.capacityDiff}) > Winning Best-Fit Waste (${winner.waste}).`;
        }
      });

      selectedAssignment = {
        requestId: req.id,
        department: req.department,
        computersNeeded: req.computersNeeded,
        labId: winner.lab.id,
        labName: winner.lab.name || winner.lab.id,
        labCapacity: winner.lab.capacity,
        slot: winner.slot,
        unusedSeats: winner.waste,
        stepIndex: reqIndex + 1,
        reasoning: `Assigned via Best-Fit Heuristic to "${winner.lab.id}" [${winner.slot}] (Capacity ${winner.lab.capacity} >= Needed ${req.computersNeeded}). Unused seats: ${winner.waste}. Ranked #1 of ${validCandidates.length} feasible options.`
      };

      currentAssignments.push(selectedAssignment);
    } else {
      currentUnallocated.push({
        requestId: req.id,
        department: req.department,
        computersNeeded: req.computersNeeded,
        allowedSlots: req.allowedSlots,
        reason: `Exhausted all feasible options. All valid labs in allowed slots [${req.allowedSlots.join(', ')}] were booked.`
      });
    }

    const remainingRequests = orderedRequests.slice(reqIndex + 1);

    steps.push({
      stepNumber: reqIndex + 1,
      totalSteps: orderedRequests.length,
      algorithmName: 'Improved Constraint-Aware Heuristic',
      algorithmKey: 'improved',
      currentRequest: req,
      priorityPolicy: `Most-Constrained-First (Feasible domain count: ${feasibleCount(req)})`,
      candidateEvaluations,
      selectedAssignment,
      isAllocated: !!selectedAssignment,
      currentAssignments: JSON.parse(JSON.stringify(currentAssignments)),
      currentUnallocated: JSON.parse(JSON.stringify(currentUnallocated)),
      remainingRequests: JSON.parse(JSON.stringify(remainingRequests)),
      occupiedSlotsMap: Object.fromEntries(occupiedSlots),
      stepSummary: selectedAssignment
        ? `Step ${reqIndex + 1}: Request ${req.id} (${req.department}) matched to Best-Fit Lab "${selectedAssignment.labId}" [${selectedAssignment.slot}], minimizing waste to ${selectedAssignment.unusedSeats} seats.`
        : `Step ${reqIndex + 1}: Request ${req.id} could not be placed.`
    });
  }

  return steps;
}

