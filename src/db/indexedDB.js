/**
 * LABWISE - Native IndexedDB Persistence Layer
 * Provides robust client-side storage for Laboratories, Requests,
 * Allocation Results, and Dynamic Rescheduling states.
 */

import { OFFICIAL_LABS, OFFICIAL_REQUESTS } from './sampleData.js';

const DB_NAME = 'LabWiseDB';
const DB_VERSION = 1;

const STORES = {
  LABS: 'laboratories',
  REQUESTS: 'requests',
  RESULTS: 'results',
  METADATA: 'metadata'
};

// In-memory fallback for environments without indexedDB (e.g. Node CLI testing)
const memoryStore = {
  [STORES.LABS]: new Map(),
  [STORES.REQUESTS]: new Map(),
  [STORES.RESULTS]: new Map(),
  [STORES.METADATA]: new Map()
};

const isIndexedDBAvailable = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
};

/**
 * Open or initialize IndexedDB connection
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.LABS)) {
        db.createObjectStore(STORES.LABS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.REQUESTS)) {
        db.createObjectStore(STORES.REQUESTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.RESULTS)) {
        db.createObjectStore(STORES.RESULTS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Execute a transaction on a single object store
 */
async function performTransaction(storeName, mode, callback) {
  const db = await openDB();

  if (!db) {
    // Use memory fallback
    const memMap = memoryStore[storeName];
    return callback({
      get: (key) => Promise.resolve(memMap.get(key)),
      getAll: () => Promise.resolve(Array.from(memMap.values())),
      put: (item) => {
        const key = item.id || item.key;
        memMap.set(key, item);
        return Promise.resolve(key);
      },
      delete: (key) => {
        memMap.delete(key);
        return Promise.resolve();
      },
      clear: () => {
        memMap.clear();
        return Promise.resolve();
      }
    });
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    let result;
    const storeProxy = {
      get: (key) =>
        new Promise((res, rej) => {
          const req = store.get(key);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
      getAll: () =>
        new Promise((res, rej) => {
          const req = store.getAll();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
      put: (item) =>
        new Promise((res, rej) => {
          const req = store.put(item);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
      delete: (key) =>
        new Promise((res, rej) => {
          const req = store.delete(key);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
      clear: () =>
        new Promise((res, rej) => {
          const req = store.clear();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        })
    };

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);

    Promise.resolve(callback(storeProxy))
      .then((res) => {
        result = res;
      })
      .catch((err) => {
        tx.abort();
        reject(err);
      });
  });
}

/**
 * Initialize database and seed official sample data on first launch
 */
export async function initializeDatabase() {
  const existingLabs = await getAllLaboratories();
  const existingRequests = await getAllRequests();

  if (existingLabs.length === 0 && existingRequests.length === 0) {
    // First time launch: seed official sample dataset
    await resetToOfficialDataset();
    return { seeded: true, source: 'official_sample' };
  }

  return { seeded: false, source: 'indexeddb_persisted', labCount: existingLabs.length, reqCount: existingRequests.length };
}

/**
 * Reset database to official sample dataset
 */
export async function resetToOfficialDataset() {
  // Clear existing
  await performTransaction(STORES.LABS, 'readwrite', async (store) => {
    await store.clear();
    for (const lab of OFFICIAL_LABS) {
      await store.put(JSON.parse(JSON.stringify(lab)));
    }
  });

  await performTransaction(STORES.REQUESTS, 'readwrite', async (store) => {
    await store.clear();
    for (const req of OFFICIAL_REQUESTS) {
      await store.put(JSON.parse(JSON.stringify(req)));
    }
  });

  await performTransaction(STORES.RESULTS, 'readwrite', async (store) => {
    await store.clear();
  });

  await performTransaction(STORES.METADATA, 'readwrite', async (store) => {
    await store.put({
      key: 'lastReset',
      timestamp: new Date().toISOString(),
      dataset: 'Official Code Crack 3.0 Dataset'
    });
  });

  return { success: true, labs: OFFICIAL_LABS, requests: OFFICIAL_REQUESTS };
}

// ================= LABORATORIES CRUD =================

export async function getAllLaboratories() {
  return performTransaction(STORES.LABS, 'readonly', (store) => store.getAll());
}

export async function getLaboratoryById(id) {
  return performTransaction(STORES.LABS, 'readonly', (store) => store.get(id));
}

export async function saveLaboratory(lab) {
  return performTransaction(STORES.LABS, 'readwrite', (store) => store.put(lab));
}

export async function deleteLaboratory(id) {
  return performTransaction(STORES.LABS, 'readwrite', (store) => store.delete(id));
}

export async function saveAllLaboratories(labs) {
  return performTransaction(STORES.LABS, 'readwrite', async (store) => {
    await store.clear();
    for (const lab of labs) {
      await store.put(lab);
    }
  });
}

// ================= REQUESTS CRUD =================

export async function getAllRequests() {
  return performTransaction(STORES.REQUESTS, 'readonly', (store) => store.getAll());
}

export async function getRequestById(id) {
  return performTransaction(STORES.REQUESTS, 'readonly', (store) => store.get(id));
}

export async function saveRequest(request) {
  return performTransaction(STORES.REQUESTS, 'readwrite', (store) => store.put(request));
}

export async function deleteRequest(id) {
  return performTransaction(STORES.REQUESTS, 'readwrite', (store) => store.delete(id));
}

export async function saveAllRequests(requests) {
  return performTransaction(STORES.REQUESTS, 'readwrite', async (store) => {
    await store.clear();
    for (const req of requests) {
      await store.put(req);
    }
  });
}

// ================= RESULTS CACHE =================

export async function getSavedResult(key) {
  return performTransaction(STORES.RESULTS, 'readonly', async (store) => {
    const item = await store.get(key);
    return item ? item.data : null;
  });
}

export async function saveResult(key, data) {
  return performTransaction(STORES.RESULTS, 'readwrite', (store) =>
    store.put({ key, data, timestamp: new Date().toISOString() })
  );
}

export async function clearAllResults() {
  return performTransaction(STORES.RESULTS, 'readwrite', (store) => store.clear());
}

// ================= IMPORT / EXPORT =================

export async function exportFullDatabaseJSON() {
  const labs = await getAllLaboratories();
  const requests = await getAllRequests();
  const fcfs = await getSavedResult('fcfs');
  const improved = await getSavedResult('improved');

  const exportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    system: 'LABWISE - Campus Laboratory Allocation & Optimization System',
    laboratories: labs,
    requests: requests,
    results: {
      fcfs,
      improved
    }
  };

  return JSON.stringify(exportData, null, 2);
}

export async function importFullDatabaseJSON(jsonString) {
  const parsed = JSON.parse(jsonString);

  if (!Array.isArray(parsed.laboratories) || !Array.isArray(parsed.requests)) {
    throw new Error('Invalid JSON format: missing laboratories or requests arrays.');
  }

  await saveAllLaboratories(parsed.laboratories);
  await saveAllRequests(parsed.requests);

  if (parsed.results?.fcfs) {
    await saveResult('fcfs', parsed.results.fcfs);
  }
  if (parsed.results?.improved) {
    await saveResult('improved', parsed.results.improved);
  }

  return {
    labsCount: parsed.laboratories.length,
    requestsCount: parsed.requests.length
  };
}

export { isIndexedDBAvailable };

