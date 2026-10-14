import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReady } from './config';
import { AdminUser } from '../types/doctor';

const BOOTSTRAP_ADMIN_EMAIL = 'mmha42472@gmail.com';
const STORAGE_KEY_EMAIL = 'medframe_admin_email_for_signin';
const STORAGE_KEY_DEMO_ADMIN = 'medframe_demo_admin_active';

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Sends a passwordless email sign-in link to the administrator.
 */
export async function sendAdminEmailLink(email: string): Promise<void> {
  if (!auth || !isFirebaseReady) {
    throw new Error('خدمة Firebase Auth غير مهيأة حالياً. يرجى تفعيل وضع المشرف التجريبي.');
  }

  const currentUrl = window.location.href.split('#')[0];
  const actionCodeSettings = {
    url: currentUrl,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  try {
    window.localStorage.setItem(STORAGE_KEY_EMAIL, email);
  } catch {}
}

/**
 * Checks if the current page load is completing a passwordless email link sign-in.
 */
export function checkIsEmailLinkSignIn(): boolean {
  if (!auth || !isFirebaseReady) return false;
  try {
    return isSignInWithEmailLink(auth, window.location.href);
  } catch {
    return false;
  }
}

/**
 * Completes sign-in with email link.
 */
export async function completeEmailLinkSignIn(): Promise<AdminUser | null> {
  if (!auth || !isFirebaseReady || !isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  let email: string | null = null;
  try {
    email = window.localStorage.getItem(STORAGE_KEY_EMAIL);
  } catch {}

  if (!email) {
    email = window.prompt('يرجى تأكيد بريدك الإلكتروني لإكمال تسجيل الدخول:');
  }

  if (!email) {
    throw new Error('البريد الإلكتروني مطلوب لإكمال عملية الدخول.');
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  try {
    window.localStorage.removeItem(STORAGE_KEY_EMAIL);
  } catch {}

  return verifyAndBuildAdminUser(result.user);
}

/**
 * Sign in with Google Popup (standard Firebase auth)
 */
export async function signInWithGoogle(): Promise<AdminUser> {
  if (!auth || !isFirebaseReady) {
    throw new Error('خدمة Firebase غير متصلة، يمكنك تفعيل وضع المشرف التجريبي للمعاينة.');
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return verifyAndBuildAdminUser(result.user);
}

/**
 * Verifies custom claims (admin: true) or Firestore /admins/{uid} doc or bootstrapped email.
 */
export async function verifyAndBuildAdminUser(firebaseUser: User): Promise<AdminUser> {
  try {
    // 1. Check custom claim on ID token
    const tokenResult = await firebaseUser.getIdTokenResult(true);
    let isAdminClaim = Boolean(tokenResult.claims.admin);

    // 2. Check bootstrapped admin email
    const isBootstrapAdmin = firebaseUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    // 3. Check /admins/{uid} collection in Firestore if db is ready
    let isAdminDocument = false;
    if (db) {
      try {
        const adminDocRef = doc(db, 'admins', firebaseUser.uid);
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists() && adminSnap.data().role === 'admin') {
          isAdminDocument = true;
        } else if (isBootstrapAdmin && !adminSnap.exists()) {
          // Auto-provision bootstrap admin document in Firestore
          await setDoc(adminDocRef, {
            email: firebaseUser.email,
            role: 'admin',
            createdAt: new Date().toISOString()
          });
          isAdminDocument = true;
        }
      } catch {
        // Fallback to token or bootstrap email
      }
    }

    const isVerifiedAdmin = isAdminClaim || isBootstrapAdmin || isAdminDocument;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'المشرف',
      isAdmin: isVerifiedAdmin,
      isDemo: false
    };
  } catch (error) {
    console.error('Error verifying admin authorization:', error);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || 'مستخدم',
      isAdmin: false,
      isDemo: false
    };
  }
}

/**
 * Demo Admin mode for immediate testing & sandbox demonstration
 */
export function activateDemoAdmin(): AdminUser {
  try {
    localStorage.setItem(STORAGE_KEY_DEMO_ADMIN, 'true');
  } catch {}
  return {
    uid: 'demo-admin-authorized-uid',
    email: 'admin@medframe.studio',
    displayName: 'د. المشرف الطبي (معتمد)',
    isAdmin: true,
    isDemo: true
  };
}

export function isDemoAdminActive(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_DEMO_ADMIN) === 'true';
  } catch {
    return false;
  }
}

export function deactivateDemoAdmin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DEMO_ADMIN);
  } catch {}
}

/**
 * Unified sign out
 */
export async function adminSignOut(): Promise<void> {
  deactivateDemoAdmin();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
  }
}

/**
 * Subscribes to Firebase Auth state changes
 */
export function subscribeToAuthChanges(callback: (user: AdminUser | null) => void): () => void {
  // If demo admin was active, return that immediately
  if (isDemoAdminActive()) {
    callback(activateDemoAdmin());
  }

  // If Firebase Auth is not available, provide fallback
  if (!auth || !isFirebaseReady) {
    if (!isDemoAdminActive()) {
      callback(null);
    }
    return () => {};
  }

  try {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const adminUser = await verifyAndBuildAdminUser(firebaseUser);
        callback(adminUser);
      } else if (isDemoAdminActive()) {
        callback(activateDemoAdmin());
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  } catch (err) {
    console.warn('onAuthStateChanged subscription error:', err);
    if (isDemoAdminActive()) {
      callback(activateDemoAdmin());
    } else {
      callback(null);
    }
    return () => {};
  }
}
