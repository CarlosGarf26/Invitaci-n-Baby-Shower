import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  increment,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { RsvpData, RsvpRecord } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or checking connection.');
    }
  }
}

// Test initial connection as required by skill
if (typeof window !== 'undefined') {
  testConnection();
}

/**
 * Save guest RSVP in Firestore
 */
export async function saveRsvp(data: RsvpData): Promise<string> {
  const collectionPath = 'rsvps';
  try {
    const payload = {
      name: data.name.trim().slice(0, 100),
      adults: Number(data.adults) || 0,
      children: Number(data.children) || 0,
      arrivalDay: data.arrivalDay,
      notes: (data.notes || '').trim().slice(0, 500),
      phoneHost: (data.phoneHost || '').trim().slice(0, 30),
      status: data.status || 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

/**
 * Delete an RSVP record (Admin only)
 */
export async function deleteRsvp(id: string): Promise<void> {
  const docPath = `rsvps/${id}`;
  try {
    await deleteDoc(doc(db, 'rsvps', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Listen to real-time RSVP updates (Admin only)
 */
export function subscribeToRsvps(
  onData: (records: RsvpRecord[]) => void,
  onError: (err: Error) => void
) {
  const collectionPath = 'rsvps';
  const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    snapshot => {
      const records: RsvpRecord[] = snapshot.docs.map(d => {
        const dData = d.data();
        return {
          id: d.id,
          name: dData.name || '',
          adults: dData.adults ?? 0,
          children: dData.children ?? 0,
          arrivalDay: dData.arrivalDay || 'sabado',
          phoneHost: dData.phoneHost || '',
          notes: dData.notes || '',
          status: dData.status || 'confirmed',
          createdAt: dData.createdAt || '',
        };
      });
      onData(records);
    },
    error => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (e) {
        onError(e instanceof Error ? e : new Error(String(e)));
      }
    }
  );
}

/**
 * Admin Auth Helpers
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };

/**
 * Gender Poll Realtime and Persistence
 */
export interface FirestorePollData {
  boyVotes: number;
  girlVotes: number;
  updatedAt?: string;
}

export function subscribeToGenderPoll(
  onData: (data: FirestorePollData) => void,
  onError?: (err: Error) => void
) {
  const pollDocRef = doc(db, 'polls', 'gender_poll');
  return onSnapshot(
    pollDocRef,
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData({
          boyVotes: Number(data.boyVotes) || 0,
          girlVotes: Number(data.girlVotes) || 0,
          updatedAt: data.updatedAt,
        });
      } else {
        // Default initialized at 0 - 0
        onData({ boyVotes: 0, girlVotes: 0 });
      }
    },
    error => {
      console.warn('Gender poll listener error:', error);
      if (onError) onError(error);
    }
  );
}

export async function voteGenderPoll(gender: 'boy' | 'girl'): Promise<void> {
  const pollDocRef = doc(db, 'polls', 'gender_poll');
  await setDoc(
    pollDocRef,
    {
      [gender === 'boy' ? 'boyVotes' : 'girlVotes']: increment(1),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function resetGenderPoll(): Promise<void> {
  const pollDocRef = doc(db, 'polls', 'gender_poll');
  await setDoc(pollDocRef, {
    boyVotes: 0,
    girlVotes: 0,
    resetAt: new Date().toISOString(),
  });
}
