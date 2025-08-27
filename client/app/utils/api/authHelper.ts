import { auth } from '@/app/utils/Firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';

type AuthHeaders = {
    'Content-Type': string;
    'Authorization'?: string;
};

// Wait for Firebase auth to initialize and return current user
const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

export const getAuthHeaders = async (): Promise<AuthHeaders> => {
    const user = await getCurrentUser();
    if (user) {
        const token = await user.getIdToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }
    return {
        'Content-Type': 'application/json',
    };
};
