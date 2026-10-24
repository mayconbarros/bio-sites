/**
 * IndexedDB storage utility for large media files (videos, high-res images).
 * Prevents localStorage QuotaExceededError while ensuring media persists across sessions.
 */

const DB_NAME = 'biosaas_media_db';
const STORE_NAME = 'media_files';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Save a media file (Blob, File, or Data URL) into IndexedDB
 */
export async function saveMedia(key: string, data: Blob | File | string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[mediaStorage] Failed to save media key '${key}':`, err);
  }
}

/**
 * Retrieve a media file from IndexedDB
 */
export async function getMedia(key: string): Promise<Blob | File | string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[mediaStorage] Failed to get media key '${key}':`, err);
    return null;
  }
}

/**
 * Retrieve media and return a playable/displayable URL (Object URL for Blobs or string as-is)
 */
export async function getMediaUrl(key: string): Promise<string | null> {
  try {
    const data = await getMedia(key);
    if (!data) return null;
    if (data instanceof Blob) {
      return URL.createObjectURL(data);
    }
    if (typeof data === 'string') {
      return data;
    }
    return null;
  } catch (err) {
    console.warn(`[mediaStorage] Failed to get media url for '${key}':`, err);
    return null;
  }
}

/**
 * Delete a media item from IndexedDB
 */
export async function deleteMedia(key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[mediaStorage] Failed to delete media key '${key}':`, err);
  }
}
