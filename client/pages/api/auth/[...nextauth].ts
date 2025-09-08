import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, getNameByEmail } from "@/app/utils/Firebase/config";

export const authOptions = {
  pages: {
    signIn: '/signin'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials): Promise<any> {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            (credentials as any).email || '',
            (credentials as any).password || ''
          );

          // Get custom claims from token (includes admin: true if set)
          const idTokenResult = await userCredential.user.getIdTokenResult();
          const isAdmin = idTokenResult.claims.admin === true;

          const name = await getNameByEmail(userCredential.user.email, isAdmin);

          if (userCredential.user) {
            return {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              name: name,
              isAdmin: isAdmin
            };
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error('Incorrect email or password');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.isAdmin = token.isAdmin;
      return session;
    }
  }
};

export default NextAuth(authOptions);