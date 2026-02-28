import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, QueryConstraint, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export function useRealtimeCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const db = getFirestore(app);
        const q = query(collection(db, collectionName), ...constraints);

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as T[];
                setData(items);
                setLoading(false);
            },
            (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                setError(err as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, JSON.stringify(constraints)]);

    return { data, loading, error };
}
