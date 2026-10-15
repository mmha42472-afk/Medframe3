import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

// Provisioned Firebase Applet Configuration defaults (ensures standalone build works on any machine/CI)
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "gen-lang-client-0271207340",
  appId: "1:143050958557:web:877901df18746e5a345d34",
  apiKey: "AIzaSyCIGuxGnGxK-vzSCE9W5rUr5pq8hGSwEuU",
  authDomain: "gen-lang-client-0271207340.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-98b8adb8-741c-4553-a4f5-5a1ce211c9c0",
  storageBucket: "gen-lang-client-0271207340.firebasestorage.app",
  messagingSenderId: "143050958557",
};

// Support both built-in defaults and environment variable overrides
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
};

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let isFirebaseConfigured = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Firestore with specific database ID if available
    dbInstance = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);

    authInstance = getAuth(app);
    isFirebaseConfigured = true;
  }
} catch (error) {
  isFirebaseConfigured = false;
}

// Export instances with null-safety
export const db = dbInstance as Firestore;
export const auth = authInstance as Auth;
export const isFirebaseReady = isFirebaseConfigured;
export { firebaseConfig };

// Safe background connection test conforming to Firebase Integration specification
export async function testFirestoreConnection(): Promise<boolean> {
  if (!dbInstance || !isFirebaseConfigured) {
    return false;
  }

  try {
    const checkPromise = getDocFromServer(doc(dbInstance, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 2000)
    );

    await Promise.race([checkPromise, timeoutPromise]);
    return true;
  } catch {
    return false;
  }
}

// Non-blocking boot check
if (isFirebaseConfigured && dbInstance) {
  testFirestoreConnection().catch(() => {});
}

// Error handling conforming to Firebase Integration specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = authInstance;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid,
      email: currentAuth?.currentUser?.email,
      emailVerified: currentAuth?.currentUser?.emailVerified,
      isAnonymous: currentAuth?.currentUser?.isAnonymous,
      tenantId: currentAuth?.currentUser?.tenantId,
      providerInfo: currentAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  throw new Error(JSON.stringify(errInfo));
}
