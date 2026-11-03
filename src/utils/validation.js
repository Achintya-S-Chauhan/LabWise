/**
 * LABWISE - Centralized Validation & Constraint Verification Engine
 * Strictly validates raw inputs and performs independent audit verification
 * on final schedules against all 7 hard constraints.
 */

/**
 * Validate a Laboratory input object
 * @param {Object} lab - Laboratory object
 * @param {Array} existingLabs - List of existing labs for duplicate check
 * @param {string} [currentId] - Current ID if editing an existing lab
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateLabInput(lab, existingLabs = [], currentId = null) {
  const errors = {};

  // ID Validation
  if (!lab.id || typeof lab.id !== 'string' || !lab.id.trim()) {
    errors.id = 'Laboratory ID is required.';
  } else {
    const trimmedId = lab.id.trim();
    const isDuplicate = existingLabs.some(
      (l) => l.id.toLowerCase() === trimmedId.toLowerCase() && (!currentId || l.id !== currentId)
    );
    if (isDuplicate) {
      errors.id = `Laboratory ID "${trimmedId}" already exists. Laboratory IDs must be unique.`;
    }
  }

  // Capacity Validation: positive integer
  const cap = Number(lab.capacity);
  if (lab.capacity === '' || lab.capacity === null || lab.capacity === undefined || isNaN(cap)) {
    errors.capacity = 'Capacity is required and must be a number.';
  } else if (!Number.isInteger(cap) || cap <= 0) {
    errors.capacity = 'Capacity must be a positive integer greater than zero.';
  } else if (cap > 1000) {
    errors.capacity = 'Capacity exceeds realistic laboratory bounds (max 1000).';
  }

  // Available Slots Validation
  if (!Array.isArray(lab.availableSlots) || lab.availableSlots.length === 0) {
    errors.availableSlots = 'At least one available slot must be selected.';
  } else {
    // Check duplicate slots
    const uniqueSlots = new Set(lab.availableSlots);
    if (uniqueSlots.size !== lab.availableSlots.length) {
      errors.availableSlots = 'Duplicate slots are not allowed.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate a Request input object
 * @param {Object} request - Request object
 * @param {Array} existingRequests - List of existing requests for duplicate check
 * @param {string} [currentId] - Current ID if editing an existing request
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateRequestInput(request, existingRequests = [], currentId = null) {
  const errors = {};

  // ID Validation
  if (!request.id || typeof request.id !== 'string' || !request.id.trim()) {
    errors.id = 'Request ID is required.';
  } else {
    const trimmedId = request.id.trim();
    const isDuplicate = existingRequests.some(
      (r) => r.id.toLowerCase() === trimmedId.toLowerCase() && (!currentId || r.id !== currentId)
    );
    if (isDuplicate) {
      errors.id = `Request ID "${trimmedId}" already exists. Request IDs must be unique.`;
    }
  }

  // Department Validation
  if (!request.department || typeof request.department !== 'string' || !request.department.trim()) {
    errors.department = 'Department name is required.';
  }

  // Computers Needed Validation: positive integer
  const reqComputers = Number(request.computersNeeded);
  if (
    request.computersNeeded === '' ||
    request.computersNeeded === null ||
    request.computersNeeded === undefined ||
    isNaN(reqComputers)
  ) {
    errors.computersNeeded = 'Computers needed is required and must be a number.';
  } else if (!Number.isInteger(reqComputers) || reqComputers <= 0) {
    errors.computersNeeded = 'Computers needed must be a positive integer greater than zero.';
  } else if (reqComputers > 1000) {
    errors.computersNeeded = 'Computers needed exceeds realistic bounds (max 1000).';
  }

  // Allowed Slots Validation
  if (!Array.isArray(request.allowedSlots) || request.allowedSlots.length === 0) {
    errors.allowedSlots = 'At least one allowed slot must be selected.';
  } else {
    // Check duplicate slots
    const uniqueSlots = new Set(request.allowedSlots);
    if (uniqueSlots.size !== request.allowedSlots.length) {
      errors.allowedSlots = 'Duplicate slots in allowed slots are not allowed.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Independent Validation & Conflict Detection Function
 * Audits a final schedule against all 7 mandatory hard constraints:
 * 1. A request cannot be split between labs.
 * 2. A lab can host at most one request per slot (no double booking).
 * 3. Lab capacity must be greater than or equal to computers required.
 * 4. A request can only use its allowed slots.
 * 5. A lab can only be used during its available slots.
 * 6. Each request must appear at most once.
 * 7. An invalid allocation must never be displayed as a successful allocation.
 *
 * @param {Array} assignments - Array of assignments: [{ requestId, labId, slot, computersNeeded, labCapacity, department }]
 * @param {Array} labs - Complete laboratory definitions
 * @param {Array} requests - Complete request definitions
 * @returns {{ isValid: boolean, conflictCount: number, conflicts: Array<{ code: string, message: string, requestId?: string, labId?: string, slot?: string }> }}
 */
export function validateSchedule(assignments = [], labs = [], requests = []) {
  const conflicts = [];
  const labMap = new Map(labs.map((l) => [l.id, l]));
  const reqMap = new Map(requests.map((r) => [r.id, r]));

  // Tracking structures
  const assignedRequestCounts = new Map(); // requestId -> count
  const labSlotOccupancy = new Map(); // `${labId}-${slot}` -> requestId

  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];
    const { requestId, labId, slot } = assignment;

    // Constraint Check: Exists in dataset
    const req = reqMap.get(requestId);
    const lab = labMap.get(labId);

    if (!req) {
      conflicts.push({
        code: 'UNKNOWN_REQUEST',
        message: `Assignment references non-existent request "${requestId}".`,
        requestId,
        labId,
        slot
      });
      continue;
    }

    if (!lab) {
      conflicts.push({
        code: 'UNKNOWN_LAB',
        message: `Assignment references non-existent laboratory "${labId}".`,
        requestId,
        labId,
        slot
      });
      continue;
    }

    // HARD CONSTRAINT 1 & 6: Each request appears at most once (no splitting across multiple labs/slots)
    const existingCount = assignedRequestCounts.get(requestId) || 0;
    assignedRequestCounts.set(requestId, existingCount + 1);
    if (existingCount >= 1) {
      conflicts.push({
        code: 'DUPLICATE_OR_SPLIT_REQUEST',
        message: `Request "${requestId}" is allocated multiple times or split across labs/slots (Violates Hard Constraints 1 & 6).`,
        requestId,
        labId,
        slot
      });
    }

    // HARD CONSTRAINT 2: A lab can host at most one request per slot (No double booking)
    const labSlotKey = `${labId}-${slot}`;
    if (labSlotOccupancy.has(labSlotKey)) {
      const priorReqId = labSlotOccupancy.get(labSlotKey);
      conflicts.push({
        code: 'DOUBLE_BOOKING',
        message: `Laboratory "${labId}" is double-booked in slot "${slot}" between "${priorReqId}" and "${requestId}" (Violates Hard Constraint 2).`,
        requestId,
        labId,
        slot
      });
    } else {
      labSlotOccupancy.set(labSlotKey, requestId);
    }

    // HARD CONSTRAINT 3: Lab capacity must be >= computers required
    const labCapacity = lab.capacity;
    const computersNeeded = req.computersNeeded;
    if (labCapacity < computersNeeded) {
      conflicts.push({
        code: 'INSUFFICIENT_CAPACITY',
        message: `Laboratory "${labId}" capacity (${labCapacity}) is less than computers required by "${requestId}" (${computersNeeded}) (Violates Hard Constraint 3).`,
        requestId,
        labId,
        slot
      });
    }

    // HARD CONSTRAINT 4: A request can only use its allowed slots
    if (!req.allowedSlots.includes(slot)) {
      conflicts.push({
        code: 'DISALLOWED_SLOT',
        message: `Slot "${slot}" is not in the allowed slots [${req.allowedSlots.join(', ')}] of request "${requestId}" (Violates Hard Constraint 4).`,
        requestId,
        labId,
        slot
      });
    }

    // HARD CONSTRAINT 5: A lab can only be used during its available slots
    if (!lab.availableSlots.includes(slot)) {
      conflicts.push({
        code: 'UNAVAILABLE_LAB_SLOT',
        message: `Laboratory "${labId}" is not available in slot "${slot}" (Available: [${lab.availableSlots.join(', ')}]) (Violates Hard Constraint 5).`,
        requestId,
        labId,
        slot
      });
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflictCount: conflicts.length,
    conflicts
  };
}

