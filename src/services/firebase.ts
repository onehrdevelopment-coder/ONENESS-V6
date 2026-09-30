import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';
import { Case, Task, EvidenceItem, AuditRecord, DraftRecord, NotificationRecord } from '../types';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling according to Firebase Skill requirements
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore at boot time
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Authentication helpers
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Sign-in with Google error:', err);
    throw err;
  }
}

export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out error:', err);
    throw err;
  }
}

// Firestore operations with hardened error handlers
export async function syncCaseToFirestore(c: Case): Promise<void> {
  const path = `cases/${c.caseId}`;
  try {
    await setDoc(doc(db, 'cases', c.caseId), {
      caseId: c.caseId,
      type: c.type,
      empId: c.empId,
      title: c.title,
      status: c.status,
      stage: c.stage,
      owner: c.owner,
      priority: c.priority,
      source: c.source,
      opened: c.opened,
      keyDate: c.keyDate || '',
      blocker: c.blocker || '',
      validation: c.validation || '',
      evidence: c.evidence || '',
      exception: c.exception || '',
      payload: c.payload ? JSON.stringify(c.payload) : '',
      outcome: c.outcome || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncTaskToFirestore(caseId: string, task: Task): Promise<void> {
  const path = `cases/${caseId}/tasks/${task.taskId}`;
  try {
    await setDoc(doc(db, 'cases', caseId, 'tasks', task.taskId), {
      taskId: task.taskId,
      caseId: task.caseId,
      seq: task.seq,
      title: task.title,
      ownerRole: task.ownerRole,
      kind: task.kind,
      deps: JSON.stringify(task.deps || []),
      status: task.status,
      due: task.due || '',
      note: task.note || '',
      done: task.done || '',
      options: task.options ? JSON.stringify(task.options) : '',
      action: task.action || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncEvidenceToFirestore(caseId: string, ev: EvidenceItem): Promise<void> {
  const path = `cases/${caseId}/evidence/${ev.evId}`;
  try {
    await setDoc(doc(db, 'cases', caseId, 'evidence', ev.evId), {
      evId: ev.evId,
      caseId: ev.caseId,
      taskId: ev.taskId,
      label: ev.label,
      source: ev.source,
      by: ev.by,
      at: ev.at,
      ref: ev.ref || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncAuditToFirestore(record: AuditRecord): Promise<void> {
  const path = `audit/${record.auditId}`;
  try {
    await setDoc(doc(db, 'audit', record.auditId), {
      auditId: record.auditId,
      at: record.at,
      user: record.user,
      caseId: record.caseId || '',
      action: record.action,
      detail: record.detail || '',
      role: record.role || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncDraftToFirestore(draft: DraftRecord): Promise<void> {
  const path = `drafts/${draft.draftId}`;
  try {
    await setDoc(doc(db, 'drafts', draft.draftId), {
      draftId: draft.draftId,
      caseId: draft.caseId || '',
      empId: draft.empId || '',
      at: draft.at || '',
      by: draft.by || '',
      to: draft.to || '',
      cc: draft.cc || '',
      subject: draft.subject,
      body: draft.body || '',
      attach: draft.attach ? JSON.stringify(draft.attach) : '',
      status: draft.status,
      role: draft.role || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncNotificationToFirestore(notif: NotificationRecord): Promise<void> {
  const path = `notifications/${notif.notifId}`;
  try {
    await setDoc(doc(db, 'notifications', notif.notifId), {
      notifId: notif.notifId,
      at: notif.at,
      toRole: notif.toRole,
      toUser: notif.toUser,
      caseId: notif.caseId || '',
      message: notif.message,
      from: notif.from,
      read: notif.read ? 'yes' : 'no',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncSystemToFirestore(key: string, value: string, note?: string): Promise<void> {
  const path = `system/${key}`;
  try {
    await setDoc(doc(db, 'system', key), {
      key,
      value,
      by: auth.currentUser?.email || 'System',
      at: new Date().toISOString(),
      note: note || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch helper functions
export async function fetchAllCasesFromFirestore(): Promise<Case[]> {
  const path = 'cases';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(docSnap => docSnap.data() as Case);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchAllAuditFromFirestore(): Promise<AuditRecord[]> {
  const path = 'audit';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(docSnap => docSnap.data() as AuditRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Listeners with mandatory error handlers
export function subscribeToCases(callback: (cases: Case[]) => void) {
  const path = 'cases';
  return onSnapshot(
    collection(db, path),
    snapshot => {
      const cases = snapshot.docs.map(docSnap => docSnap.data() as Case);
      callback(cases);
    },
    error => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
