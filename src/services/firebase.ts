/**
 * Firebase configuration & helpers.
 *
 * Reads config from VITE_FIREBASE_* environment variables.
 * Exports the Realtime Database instance + typed read/write helpers.
 */

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  push,
  update,
  type DatabaseReference,
  type Unsubscribe,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ── Typed helpers ─────────────────────────────────────────────────────────────

export function dbRef(path: string): DatabaseReference {
  return ref(db, path);
}

export async function dbSet<T>(path: string, data: T): Promise<void> {
  await set(ref(db, path), data);
}

export async function dbGet<T>(path: string): Promise<T | null> {
  const snapshot = await get(ref(db, path));
  return snapshot.exists() ? (snapshot.val() as T) : null;
}

export function dbOnValue<T>(path: string, callback: (data: T | null) => void): Unsubscribe {
  return onValue(ref(db, path), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as T) : null);
  });
}

export async function dbPush<T>(path: string, data: T): Promise<string> {
  const newRef = push(ref(db, path));
  await set(newRef, data);
  return newRef.key!;
}

export async function dbUpdate(path: string, updates: Record<string, unknown>): Promise<void> {
  await update(ref(db, path), updates);
}

export { db };
