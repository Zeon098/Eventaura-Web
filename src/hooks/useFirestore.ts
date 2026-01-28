/**
 * Custom hook for Firestore real-time subscriptions
 */
import { useState, useEffect } from 'react';
import { QueryConstraint, type DocumentData, type Unsubscribe } from 'firebase/firestore';
import {
  subscribeToDocument,
  subscribeToCollection,
} from '../services/firebase/firestore.service';
import { logError } from '../utils/errorHandlers';

/**
 * Subscribe to a single document
 */
export const useDocument = <T = DocumentData>(
  collectionName: string,
  docId: string | null
): { data: T | null; loading: boolean; error: Error | null } => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(() => !!docId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = subscribeToDocument<T>(
        collectionName,
        docId,
        (docData) => {
          setData(docData);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      logError(err, `useDocument: ${collectionName}/${docId}`);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, docId]);

  return { data, loading, error };
};

/**
 * Subscribe to a collection with optional query constraints
 */
export const useCollection = <T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): { data: T[]; loading: boolean; error: Error | null } => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = subscribeToCollection<T>(
        collectionName,
        (collectionData) => {
          setData(collectionData);
          setLoading(false);
        },
        ...constraints
      );
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      logError(err, `useCollection: ${collectionName}`);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error };
};
