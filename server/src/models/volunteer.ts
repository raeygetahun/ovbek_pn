import firebase from '../services/firebaseService';
import { IVolunteer, AccountStatus } from '../types';

const firestore = firebase.firestore();

class Volunteer implements IVolunteer {
    volunteerId: string;
    email: string;
    firstName: string;
    lastName: string;
    accountStatus: AccountStatus | null;

    constructor(
        id: string | null,
        email: string,
        firstName: string,
        lastName: string,
        accountStatus: AccountStatus | null = null
    ) {
        this.volunteerId = id || '';
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.accountStatus = accountStatus;
    }

    async save(password: string): Promise<Volunteer> {
        try {
            const existingUser = await Volunteer.getByUsername(this.email);

            if (existingUser) {
                throw new Error('Username or email already in use');
            }

            // Create a new user in Firebase Authentication
            const userRecord = await firebase.auth().createUser({
                email: this.email,
                password: password,
                displayName: `${this.firstName} ${this.lastName}`.trim(),
            });

            // Store additional user data in Firestore
            const volunteerDocRef = firestore.collection('volunteers').doc(userRecord.uid);
            await volunteerDocRef.set({
                email: this.email,
                firstName: this.firstName,
                lastName: this.lastName,
                accountStatus: "Pending",
            });

            this.volunteerId = volunteerDocRef.id;

            return this;
        } catch (error) {
            throw new Error(`Registration failed: ${(error as Error).message}`);
        }
    }

    static async getByUsername(email: string): Promise<Volunteer | null> {
        try {
            const query = firestore.collection('volunteers').where('email', '==', email);
            const snapshot = await query.get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();
                return new Volunteer(doc.id, data.email, data.firstName, data.lastName, data.accountStatus);
            }

            return null;
        } catch (error) {
            throw new Error(`Error retrieving volunteer by username or email: ${(error as Error).message}`);
        }
    }

    static async getById(volunteerId: string): Promise<Volunteer | null> {
        const doc = await firestore.collection('volunteers').doc(volunteerId).get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data()!;
        return new Volunteer(doc.id, data.email, data.firstName, data.lastName, data.accountStatus);
    }

    static async getByEmail(email: string): Promise<Volunteer | null> {
        const query = firestore.collection('volunteers').where('email', '==', email);
        const snapshot = await query.get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            return new Volunteer(doc.id, data.email, data.firstName, data.lastName, data.accountStatus);
        }
        return null;
    }

    static async getAll(status: AccountStatus | null = null): Promise<Volunteer[]> {
        let volunteersSnapshot;
        if (status) {
            volunteersSnapshot = await firestore.collection('volunteers').where('accountStatus', '==', status).get();
        } else {
            volunteersSnapshot = await firestore.collection('volunteers').get();
        }
        const volunteers: Volunteer[] = [];

        volunteersSnapshot.forEach((doc) => {
            const data = doc.data();
            volunteers.push(new Volunteer(doc.id, data.email, data.firstName, data.lastName, data.accountStatus));
        });

        return volunteers;
    }

    static async updateStatus(volunteerId: string, accountStatus: AccountStatus): Promise<Volunteer> {
        try {
            const docRef = firestore.collection('volunteers').doc(volunteerId);
            await docRef.update({ accountStatus });

            const updatedDoc = await docRef.get();
            const updatedVolunteer = updatedDoc.data()!;
            return new Volunteer(
                volunteerId,
                updatedVolunteer.email,
                updatedVolunteer.firstName,
                updatedVolunteer.lastName,
                updatedVolunteer.accountStatus
            );
        } catch (error) {
            console.error(`Failed to update status for volunteer ${volunteerId}: ${(error as Error).message}`);
            throw new Error(`Failed to update status for volunteer ${volunteerId}`);
        }
    }
}

export default Volunteer;
