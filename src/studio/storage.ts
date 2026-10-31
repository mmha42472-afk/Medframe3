import type { Site } from './types';

/* Sites are stored in IndexedDB (room for uploaded images), with a localStorage fallback. */
const DB = 'medframe-studio';
const STORE = 'sites';
const LS_KEY = 'medframe-studio-sites';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no-idb')); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function lsRead(): Site[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsWrite(sites: Site[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(sites)); } catch { /* quota */ }
}

export async function listSites(): Promise<Site[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as Site[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      req.onerror = () => reject(req.error);
    });
  } catch {
    return lsRead().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export async function saveSite(site: Site): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(site);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const all = lsRead().filter(s => s.id !== site.id);
    lsWrite([site, ...all]);
  }
}

export async function deleteSite(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    lsWrite(lsRead().filter(s => s.id !== id));
  }
}
