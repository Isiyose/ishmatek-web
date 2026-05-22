import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Configure log level to suppress benign connection warnings (e.g. idle stream disconnects)
setLogLevel('error');

// Initialize core Firebase utilities
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: The app will break without this line
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection verification test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("[FIREBASE] Connection response received successfully.");
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      // If the error is a permission error, it means we reached the Google Cloud servers and rules blocked us. This means the client is ONLINE.
      if (
        msg.includes('permission-denied') || 
        msg.includes('insufficient permissions') || 
        msg.includes('missing or insufficient permissions') ||
        msg.includes('unauthenticated')
      ) {
        console.log("[FIREBASE] Connection verified successfully. Google Cloud servers reached (authenticated context rules working).");
        return;
      }

      // If we are genuinely offline or cannot resolve the host
      if (
        msg.includes('the client is offline') || 
        msg.includes('failed to get document') ||
        msg.includes('could not connect') ||
        msg.includes('unavailable')
      ) {
        console.warn("[FIREBASE-WARN] Please check your Firebase configuration or internet connection. Firestore client returned offline.");
      } else {
        console.log("[FIREBASE] Raw connection response signature:", error.message);
      }
    }
  }
}
testConnection();

// Mandatory Structured Error Handlers for Diagnostics
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
