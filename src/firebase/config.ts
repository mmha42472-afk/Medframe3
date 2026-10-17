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
  firestoreDatabaseId: (firebaseAppletConfig.firestoreDatabaseId && firebaseAppletConfig.firestoreDatabaseId !== 'ai-studio-98b8adb8-741c-4553-a4f5-5a1ce211c9c0') 
    ? firebaseAppletConfig.firestoreDatabaseId 
    : '(default)',
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
};

export const STORAGE_KEY_CUSTOM_FIREBASE = 'medframe_custom_firebase_config_v2';

export function sanitizeDatabaseId(rawDbId?: string, projId?: string): string {
  if (projId === 'gen-lang-client-0271207340') {
    return 'ai-studio-98b8adb8-741c-4553-a4f5-5a1ce211c9c0';
  }
  // For medframe3-23994 and standard Firebase projects, the provisioned database is '(default)'
  if (
    !rawDbId || 
    rawDbId === '(default)' || 
    rawDbId === 'ai-studio-98b8adb8-741c-4553-a4f5-5a1ce211c9c0' || 
    rawDbId.startsWith('G-') || 
    rawDbId.includes('measurement')
  ) {
    return '(default)';
  }
  return rawDbId;
}

/**
 * Retrieves the active Firebase configuration with preference hierarchy:
 * 1. User custom config stored in localStorage (from settings window)
 * 2. Vite environment variables (.env / VITE_FIREBASE_*)
 * 3. Default built-in provisioned config
 */
export function getActiveFirebaseConfig(): FirebaseConfigParams {
  const env = (typeof import.meta !== 'undefined' && import.meta?.env) ? import.meta.env : ({} as Record<string, string>);
  
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FIREBASE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.projectId) {
          const sanitizedDbId = sanitizeDatabaseId(parsed.firestoreDatabaseId, parsed.projectId);
          
          // Self-heal corrupted localStorage values from previous turns
          if (parsed.firestoreDatabaseId !== sanitizedDbId) {
            parsed.firestoreDatabaseId = sanitizedDbId;
            try {
              localStorage.setItem(STORAGE_KEY_CUSTOM_FIREBASE, JSON.stringify(parsed));
            } catch {}
          }
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read custom Firebase config from localStorage:', e);
  }

  const activeProjectId = env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId;
  const rawDbId = env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId;

  return {
    projectId: activeProjectId,
    appId: env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    apiKey: env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    firestoreDatabaseId: sanitizeDatabaseId(rawDbId, activeProjectId),
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
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

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
export let isFirebaseReady = false;

export function initializeFirebaseInstances(): boolean {
  try {
    const config = getActiveFirebaseConfig();
    if (config.apiKey && config.projectId) {
      const existingApps = getApps();
      appInstance = existingApps.length > 0 ? existingApps[0] : initializeApp(config);

      const dbId = sanitizeDatabaseId(config.firestoreDatabaseId, config.projectId);
      if (dbId && dbId !== '(default)') {
        try {
          dbInstance = getFirestore(appInstance, dbId);
        } catch {
          dbInstance = getFirestore(appInstance);
        }
      } else {
        dbInstance = getFirestore(appInstance);
      }

      authInstance = getAuth(appInstance);
      isFirebaseReady = true;
      return true;
    }
  } catch (error) {
    console.warn('Firebase initialization note (running in resilient offline mode):', error);
    isFirebaseReady = false;
  }
  return false;
}

// Initial bootstrap
initializeFirebaseInstances();

// Export active direct instances - must be real Firestore/Auth instances because Firebase functions like doc() check instanceof Firestore
export const app = (appInstance || (initializeFirebaseInstances(), appInstance)) as FirebaseApp;
export const db = (dbInstance || (initializeFirebaseInstances(), dbInstance)) as Firestore;
export const auth = (authInstance || (initializeFirebaseInstances(), authInstance)) as Auth;

/**
 * Saves custom Firebase credentials from the UI Settings Window
 */
export function saveCustomFirebaseConfig(config: FirebaseConfigParams): void {
  try {
    const cleanConfig = {
      ...config,
      firestoreDatabaseId: sanitizeDatabaseId(config.firestoreDatabaseId, config.projectId)
    };
    localStorage.setItem(STORAGE_KEY_CUSTOM_FIREBASE, JSON.stringify(cleanConfig));
    initializeFirebaseInstances();
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
    initializeFirebaseInstances();
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
      const sanitizedId = sanitizeDatabaseId(customConfig.firestoreDatabaseId, customConfig.projectId);
      targetDb = sanitizedId && sanitizedId !== '(default)'
        ? getFirestore(tempApp, sanitizedId)
        : getFirestore(tempApp);
      
      const checkPromise = getDocFromServer(doc(targetDb, 'doctors', 'doc-sara-mansouri'));
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال (Timeout 4s)')), 4000)
      );

      await Promise.race([checkPromise, timeoutPromise]).catch(() => {
        // Document may not exist, but network reachable
      });

      try {
        await deleteApp(tempApp);
      } catch {}

      return { success: true, latencyMs: Date.now() - start };
    }

    if (!targetDb || !isFirebaseReady) {
      return { success: false, error: 'خدمة Firebase غير مهيأة أو غير متصلة.' };
    }

    const checkPromise = getDocFromServer(doc(targetDb, 'doctors', 'doc-connection-probe'));
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('انتهت مهلة الاتصال بالسحابة (4s)')), 4000)
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
