/**
 * LABWISE - Campus Laboratory Allocation & Optimization System
 * Official Sample Dataset (from Code Crack 3.0 Problem Statement)
 */

export const OFFICIAL_LABS = [
  {
    id: 'Lab A',
    name: 'Lab A - High Performance Computing',
    capacity: 60,
    availableSlots: ['S1', 'S2', 'S3'],
    type: 'General / HPC'
  },
  {
    id: 'Lab B',
    name: 'Lab B - Network Systems Lab',
    capacity: 40,
    availableSlots: ['S1', 'S2', 'S3'],
    type: 'Networking'
  },
  {
    id: 'Lab C',
    name: 'Lab C - Software Engineering Lab',
    capacity: 50,
    availableSlots: ['S1', 'S2'],
    type: 'Software Dev'
  },
  {
    id: 'Lab D',
    name: 'Lab D - Embedded Systems Lab',
    capacity: 30,
    availableSlots: ['S2', 'S3'],
    type: 'Hardware / IoT'
  }
];

export const OFFICIAL_REQUESTS = [
  {
    id: 'R1',
    department: 'CSE',
    computersNeeded: 55,
    allowedSlots: ['S1', 'S2'],
    priority: 'Normal',
    courseName: 'Advanced Algorithms Lab'
  },
  {
    id: 'R2',
    department: 'IT',
    computersNeeded: 35,
    allowedSlots: ['S1'],
    priority: 'Normal',
    courseName: 'Cloud Computing Lab'
  },
  {
    id: 'R3',
    department: 'AI & DS',
    computersNeeded: 45,
    allowedSlots: ['S2'],
    priority: 'High',
    courseName: 'Deep Learning Practical'
  },
  {
    id: 'R4',
    department: 'ECE',
    computersNeeded: 25,
    allowedSlots: ['S2', 'S3'],
    priority: 'Normal',
    courseName: 'Digital Signal Processing'
  },
  {
    id: 'R5',
    department: 'MCA',
    computersNeeded: 40,
    allowedSlots: ['S3'],
    priority: 'Normal',
    courseName: 'Enterprise App Development'
  }
];

export const STANDARD_SLOTS = [
  { id: 'S1', label: 'Slot S1 (09:00 - 11:00 AM)', time: '09:00 - 11:00 AM' },
  { id: 'S2', label: 'Slot S2 (11:30 AM - 01:30 PM)', time: '11:30 AM - 01:30 PM' },
  { id: 'S3', label: 'Slot S3 (02:00 - 04:00 PM)', time: '02:00 - 04:00 PM' }
];

export const SLOT_IDS = ['S1', 'S2', 'S3'];

