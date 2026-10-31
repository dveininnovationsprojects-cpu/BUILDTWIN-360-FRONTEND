/**
 * Client-side Document & File Storage Utility (Memory + IndexedDB)
 * High-performance, non-blocking storage for blueprints, PDFs, images, and project documents.
 */

const DB_NAME = 'buildtwin_documents_db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// Instant in-memory fallback cache so file preview is instant and never hangs
const memoryFileCache = new Map();

function openDatabase() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      // Timeout guard: never hang more than 600ms
      const timeout = setTimeout(() => resolve(null), 600);

      request.onupgradeneeded = (event) => {
        try {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        } catch {
          // ignore upgrade errors
        }
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        resolve(request.target.result);
      };

      request.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };

      request.onblocked = () => {
        clearTimeout(timeout);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Stores a file Blob or File object with immediate in-memory caching and background IndexedDB persistence
 */
export async function storeDocumentFile(key, file) {
  if (!key || !file) return false;
  const keyStr = String(key);

  // 1. Instant in-memory cache
  memoryFileCache.set(keyStr, file);

  // 2. Background IndexedDB persistence (non-blocking)
  try {
    const db = await openDatabase();
    if (!db) return true;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(file, keyStr);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(true);
        tx.onabort = () => resolve(true);
      } catch {
        resolve(true);
      }
    });
  } catch (err) {
    console.warn('IndexedDB write skipped:', err?.message);
    return true;
  }
}

/**
 * Retrieves a stored file Blob or File
 */
export async function getDocumentFile(key) {
  if (!key) return null;
  const keyStr = String(key);

  // 1. Check in-memory cache first
  if (memoryFileCache.has(keyStr)) {
    return memoryFileCache.get(keyStr);
  }

  // 2. Check IndexedDB
  try {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(keyStr);
        req.onsuccess = () => {
          if (req.result) {
            memoryFileCache.set(keyStr, req.result);
            resolve(req.result);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Deletes a stored file
 */
export async function deleteDocumentFile(key) {
  if (!key) return;
  const keyStr = String(key);
  memoryFileCache.delete(keyStr);

  try {
    const db = await openDatabase();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(keyStr);
  } catch {
    // ignore
  }
}
