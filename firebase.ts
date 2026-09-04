import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  ActionCodeSettings,
  User 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = (() => {
  try {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.warn("Failed initializing Firestore with custom databaseId, falling back to default db:", err);
    return getFirestore(app);
  }
})();
export const storage = getStorage(app);

// Provider setup with required RAG scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

// In-memory cache for access token (strictly complying with security/leak guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Configure Authentication Persistence (Remember Me)
 */
export const configureAuthPersistence = async (rememberMe: boolean = true) => {
  try {
    const persistenceMode = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceMode);
  } catch (err) {
    console.warn("Failed to set auth persistence mode:", err);
  }
};

/**
 * Send Password Reset Email with valid ActionCodeSettings to prevent "invalid page mode" error
 */
export const sendConfiguredPasswordResetEmail = async (email: string) => {
  const hostUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const actionCodeSettings: ActionCodeSettings = {
    url: `${hostUrl}/?mode=resetPassword`,
    handleCodeInApp: true
  };
  return firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
};

export const resetUserPasswordWithCode = async (oobCode: string, newPassword: string) => {
  return firebaseConfirmPasswordReset(auth, oobCode, newPassword);
};

export const initAuth = (
  onAuthSuccess?: (user: User, token?: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken || undefined);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (rememberMe: boolean = true): Promise<{ user: User; accessToken?: string } | null> => {
  try {
    isSigningIn = true;
    await configureAuthPersistence(rememberMe);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken || undefined };
  } catch (error: any) {
    console.warn('Firebase Auth sign-in popup warning:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const anonymousSignIn = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (err) {
    console.warn("Anonymous sign in warning:", err);
    return null;
  }
};

export const getAccessToken = () => {
  return cachedAccessToken;
};

// Unified Firestore Error Handler according to skill specs
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errStr = error instanceof Error ? error.message : String(error);
  if (
    errStr.includes("the client is offline") ||
    errStr.includes("unavailable") ||
    (error as any)?.code === "unavailable"
  ) {
    console.warn(`Firestore operating in offline mode for ${operationType} on ${path}:`, errStr);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
