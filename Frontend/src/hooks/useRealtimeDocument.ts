import { useEffect, useState } from 'react';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export function useRealtimeDocument<T>(collectionName: string, documentId: string | null) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!documentId) {
            setLoading(false);
            return;
        }

        const db = getFirestore(app);
        const docRef = doc(db, collectionName, documentId);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setData({ id: snapshot.id, ...snapshot.data() } as T);
                } else {
                    setData(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error(`Error fetching document ${documentId}:`, err);
                setError(err as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, documentId]);

    return { data, loading, error };
}
