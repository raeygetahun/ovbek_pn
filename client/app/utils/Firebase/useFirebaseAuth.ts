import { useEffect, useState } from 'react';
import { User, getIdTokenResult, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/utils/Firebase/config';

type FirebaseAuthState = {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
};

export const useFirebaseAuth = (): FirebaseAuthState => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            setUser(currentUser);
            try {
                const tokenResult = await getIdTokenResult(currentUser);
                setIsAdmin(tokenResult.claims.admin === true);
            } catch (error) {
                console.error('Error reading auth claims:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, isAdmin, loading };
};
