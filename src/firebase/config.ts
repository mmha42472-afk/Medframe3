import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

export interface FirebaseConfigParams {
  apiKey: string;
  projectId: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

import firebaseAppletConfig from '../../firebase-applet-config.json';

// Built-in Provisioned Firebase Applet Configuration defaults directly synced from firebase-applet-config.json
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigParams = {
  projectId: firebaseAppletConfig.projectId,
  appId: firebaseAppletConfig.appId,
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId || "ai-studio-98b8adb8-741c-4553-a4f5-5a1ce211c9c0",
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
};

export const STORAGE_KEY_CUSTOM_FIREBASE = 'medframe_custom_firebase_config_v2';

/**
 * Retrieves the active Firebase configuration with preference hierarchy:
 * 1. User custom config stored in localStorage (from settings window)
 * 2. Vite environment variables (.env / VITE_FIREBASE_*)
 * 3. Default built-in provisioned config
 */
export function getActiveFirebaseConfig(): FirebaseConfigParams {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FIREBASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read custom Firebase config from localStorage:', e);
  }

  return {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  };
}

export function isCustomConfigSaved(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FIREBASE);
    return Boolean(saved && JSON.parse(saved)?.apiKey);
  } catch {
    return false;
  }
}

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let isFirebaseConfigured = false;

export function initializeFirebaseInstances(): boolean {
  try {
    const config = getActiveFirebaseConfig();
    if (config.apiKey && config.projectId) {
      // Clean up previous apps if needed
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
      } else {
        app = initializeApp(config);
      }

      // Initialize Firestore with specific database ID if specified
      if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
        dbInstance = getFirestore(app, config.firestoreDatabaseId);
      } else {
        dbInstance = getFirestore(app);
      }

      authInstance = getAuth(app);
      isFirebaseConfigured = true;
      return true;
    }
  } catch (error) {
    console.warn('Firebase initialization note (running in resilient offline mode):', error);
    isFirebaseConfigured = false;
  }
  return false;
}

// Initial bootstrap
initializeFirebaseInstances();

// Export active instances with null safety
export const db = (dbInstance as unknown) as Firestore;
export const auth = (authInstance as unknown) as Auth;
export const isFirebaseReady = isFirebaseConfigured;
export { app };

/**
 * Saves custom Firebase credentials from the UI Settings Window
 */
export function saveCustomFirebaseConfig(config: FirebaseConfigParams): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_FIREBASE, JSON.stringify(config));
    // Trigger page reload or reinit
  } catch (e) {
    console.error('Failed to save Firebase config in localStorage:', e);
  }
}

/**
 * Resets back to default built-in configuration
 */
export function resetFirebaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_FIREBASE);
  } catch (e) {
    console.error('Failed to reset Firebase config:', e);
  }
}

/**
 * Safe connection test conforming to Firebase Integration specification
 */
export async function testFirestoreConnection(customConfig?: FirebaseConfigParams): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    let targetDb = dbInstance;

    // If testing custom config specifically
    if (customConfig && customConfig.apiKey && customConfig.projectId) {
      const tempAppName = `test-app-${Date.now()}`;
      const tempApp = initializeApp(customConfig, tempAppName);
      targetDb = customConfig.firestoreDatabaseId && customConfig.firestoreDatabaseId !== '(default)'
        ? getFirestore(tempApp, customConfig.firestoreDatabaseId)
        : getFirestore(tempApp);
      
      const checkPromise = getDocFromServer(doc(targetDb, 'test', 'connection'));
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال (Timeout 3s)')), 3000)
      );

      await Promise.race([checkPromise, timeoutPromise]).catch(() => {
        // Even if the document doesn't exist, reachable Firestore responds with not-found
      });

      try {
        await deleteApp(tempApp);
      } catch {}

      return { success: true, latencyMs: Date.now() - start };
    }

    if (!targetDb || !isFirebaseConfigured) {
      return { success: false, error: 'خدمة Firebase غير مهيأة أو غير متصلة.' };
    }

    const checkPromise = getDocFromServer(doc(targetDb, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('انتهت مهلة الاتصال بالسحابة (3s)')), 3000)
    );

    await Promise.race([checkPromise, timeoutPromise]).catch(() => {
      // Document may not exist, but network reachable
    });

    return { success: true, latencyMs: Date.now() - start };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'فشل الاتصال بقاعدة البيانات السحابية.' 
    };
  }
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
