import firebase from '../services/firebaseService';
import { IAdmin } from '../types';

const firestore = firebase.firestore();

class Admin implements IAdmin {
    adminId: string;
    email: string;
    firstName: string;
    lastName: string;

    constructor(id: string | null, email: string, firstName: string, lastName: string) {
        this.adminId = id || '';
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    async save(password: string): Promise<Admin> {
        try {
            const existingUser = await Admin.getByEmail(this.email);

            if (existingUser) {
                throw new Error('Email already in use');
            }

            const userRecord = await firebase.auth().createUser({
                email: this.email,
                password: password,
                displayName: `${this.firstName} ${this.lastName}`.trim(),
            });

            // Set admin custom claim on the Firebase Auth user
            await firebase.auth().setCustomUserClaims(userRecord.uid, { admin: true });

            const adminDocRef = firestore.collection('admins').doc(userRecord.uid);
            await adminDocRef.set({
                email: this.email,
                firstName: this.firstName,
                lastName: this.lastName,
            });

            this.adminId = adminDocRef.id;

            return this;
        } catch (error) {
            throw new Error(`Registration failed: ${(error as Error).message}`);
        }
    }

    static async getByEmail(email: string): Promise<Admin | null> {
        try {
            const query = firestore.collection('admins').where('email', '==', email);
            const snapshot = await query.get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();
                return new Admin(doc.id, data.email, data.firstName, data.lastName);
            }

            return null;
        } catch (error) {
            throw new Error(`Error retrieving Admin by email: ${(error as Error).message}`);
        }
    }

    static async getAll(emailOnly: "email" | null = null): Promise<string[] | Array<{ id: string; email: string; firstName: string; lastName: string }>> {
        const adminsSnapshot = await firestore.collection('admins').get();

        if (emailOnly === "email") {
            const emails: string[] = [];
            adminsSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.email) {
                    emails.push(data.email);
                }
            });
            return emails;
        }

        const admins: Array<{ id: string; email: string; firstName: string; lastName: string }> = [];
        adminsSnapshot.forEach((doc) => {
            const data = doc.data();
            admins.push({ id: doc.id, ...data } as { id: string; email: string; firstName: string; lastName: string });
        });

        return admins;
    }
}

export default Admin;
