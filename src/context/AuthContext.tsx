import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AdminUser 
} from '../types/doctor';
import { 
  subscribeToAuthChanges, 
  sendAdminEmailLink, 
  completeEmailLinkSignIn, 
  checkIsEmailLinkSignIn,
  signInWithGoogle, 
  loginWithEmailAndPassword as apiLoginEmailPassword,
  registerWithEmailAndPassword as apiRegisterEmailPassword,
  activateDemoAdmin, 
  adminSignOut,
  isDemoAdminActive 
} from '../firebase/authService';

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  isDemoAdmin: boolean;
  loading: boolean;
  error: string | null;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  registerWithEmailPassword: (email: string, pass: string) => Promise<void>;
  sendEmailLink: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (isDemoAdminActive()) {
      return activateDemoAdmin();
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is completing passwordless email sign in
    if (checkIsEmailLinkSignIn()) {
      completeEmailLinkSignIn()
        .then((signedInUser) => {
          if (signedInUser) {
            setUser(signedInUser);
          }
        })
        .catch((err) => {
          console.error('Email link sign in failed:', err);
          setError(err instanceof Error ? err.message : 'فشل إكمال تسجيل الدخول عبر الرابط.');
        });
    }

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmailPassword = async (email: string, pass: string) => {
    setError(null);
    try {
      const admin = await apiLoginEmailPassword(email, pass);
      setUser(admin);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر تسجيل الدخول بالبريد وكلمة المرور.';
      setError(msg);
      throw err;
    }
  };

  const registerWithEmailPassword = async (email: string, pass: string) => {
    setError(null);
    try {
      const admin = await apiRegisterEmailPassword(email, pass);
      setUser(admin);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر إنشاء الحساب.';
      setError(msg);
      throw err;
    }
  };

  const sendEmailLink = async (email: string) => {
    setError(null);
    try {
      await sendAdminEmailLink(email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر إرسال رابط تسجيل الدخول.';
      setError(msg);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const admin = await signInWithGoogle();
      setUser(admin);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر تسجيل الدخول بحساب Google.';
      setError(msg);
      throw err;
    }
  };

  const loginAsDemoAdmin = () => {
    setError(null);
    const demo = activateDemoAdmin();
    setUser(demo);
  };

  const logout = async () => {
    try {
      await adminSignOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الخروج.');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: Boolean(user?.isAdmin),
        isDemoAdmin: Boolean(user?.isDemo),
        loading,
        error,
        loginWithEmailPassword,
        registerWithEmailPassword,
        sendEmailLink,
        loginWithGoogle,
        loginAsDemoAdmin,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
