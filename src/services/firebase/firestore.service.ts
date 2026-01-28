/**
 * Firestore service for database operations
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { logError } from '../../utils/errorHandlers';

/**
 * Generic get document
 */
export const getDocument = async <T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as T;
  } catch (error) {
    logError(error, `getDocument: ${collectionName}/${docId}`);
    throw error;
  }
};

/**
 * Generic set document
 */
export const setDocument = async (
  collectionName: string,
  docId: string,
  data: DocumentData
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logError(error, `setDocument: ${collectionName}/${docId}`);
    throw error;
  }
};

/**
 * Generic update document
 */
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logError(error, `updateDocument: ${collectionName}/${docId}`);
    throw error;
  }
};

/**
 * Generic delete document
 */
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    logError(error, `deleteDocument: ${collectionName}/${docId}`);
    throw error;
  }
};

/**
 * Generic add document with auto-generated ID
 */
export const addDocument = async (
  collectionName: string,
  data: DocumentData
): Promise<string> => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    logError(error, `addDocument: ${collectionName}`);
    throw error;
  }
};

/**
 * Generic query documents
 */
export const queryDocuments = async <T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    logError(error, `queryDocuments: ${collectionName}`);
    throw error;
  }
};

/**
 * Subscribe to document changes
 */
export const subscribeToDocument = <T = DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): Unsubscribe => {
  const docRef = doc(db, collectionName, docId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as T);
      } else {
        callback(null);
      }
    },
    (error) => {
      logError(error, `subscribeToDocument: ${collectionName}/${docId}`);
      callback(null);
    }
  );
};

/**
 * Subscribe to collection changes
 */
export const subscribeToCollection = <T = DocumentData>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(data);
    },
    (error) => {
      logError(error, `subscribeToCollection: ${collectionName}`);
      callback([]);
    }
  );
};

/**
 * Parse Firestore timestamp to Date
 */
export const parseTimestamp = (timestamp: Timestamp | Date | string | null | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (typeof timestamp === 'string') return new Date(timestamp);
  return new Date();
};

// Export commonly used query constraints for convenience
export { where, orderBy, limit, collection, doc };
