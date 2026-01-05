// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../../utils/firebase';

// export const loginUser = async (email: string, password: string): Promise<string | null> => {
//     try {
//         // Authenticate user with Firebase
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         // Get ID token (JWT) from Firebase
//         const token = await userCredential.user.getIdToken();
//         return token;
//     } catch (error) {
//         console.error('Login failed:', error);
//         return null;
//     }
// };
