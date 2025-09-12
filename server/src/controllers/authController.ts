import { Request, Response } from 'express';
import Volunteer from '../models/volunteer';
import Admin from '../models/admin';
import sendEmail from '../services/emailService';
import firebase from '../services/firebaseService';
import { IRegisterBody } from '../types';

export const volunteerRegister = async (req: Request<{}, {}, IRegisterBody>, res: Response): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const newVolunteer = new Volunteer(null, email, firstName, lastName);

        const savedVolunteer = await newVolunteer.save(password);
        const adminsEmail = await Admin.getAll('email') as string[];

        await sendEmail(adminsEmail, 'New Volunteer', true, { name: savedVolunteer.firstName + ' ' + savedVolunteer.lastName });

        res.status(201).json({ success: true, data: savedVolunteer, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        const errorMessage = (error as Error).message || 'Internal Server Error';
        res.status(500).json({ error: errorMessage });
    }
};

export const adminRegister = async (req: Request<{}, {}, IRegisterBody>, res: Response): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const newAdmin = new Admin(null, email, firstName, lastName);

        const savedAdmin = await newAdmin.save(password);

        await sendEmail(email, 'New Admin', false, { name: savedAdmin.firstName + ' ' + savedAdmin.lastName });

        res.status(201).json({ success: true, data: savedAdmin, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering admin:', error);
        const errorMessage = (error as Error).message || 'Internal Server Error';
        res.status(500).json({ error: errorMessage });
    }
};

// One-time migration: Set admin claims for existing admins
export const migrateAdminClaims = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await Admin.getAll() as Array<{ id: string; email: string }>;
        const results: { email: string; success: boolean; error?: string }[] = [];

        for (const admin of admins) {
            try {
                await firebase.auth().setCustomUserClaims(admin.id, { admin: true });
                results.push({ email: admin.email, success: true });
            } catch (error) {
                results.push({ email: admin.email, success: false, error: (error as Error).message });
            }
        }

        res.json({ success: true, message: 'Migration complete', results });
    } catch (error) {
        console.error('Error migrating admin claims:', error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

export const deleteUser = async (req: Request<{}, {}, { email: string }>, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
    }

    try {
        const userRecord = await firebase.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        const firestore = firebase.firestore();
        const anonymizedData = {
            email: 'deleteduser',
            firstName: 'deleteduser',
            lastName: 'deleteduser'
        };

        const adminDocRef = firestore.collection('admins').doc(uid);
        const adminDoc = await adminDocRef.get();
        if (adminDoc.exists) {
            await adminDocRef.update(anonymizedData);
        }

        const volunteerDocRef = firestore.collection('volunteers').doc(uid);
        const volunteerDoc = await volunteerDocRef.get();
        if (volunteerDoc.exists) {
            await volunteerDocRef.update(anonymizedData);
        }

        await firebase.auth().deleteUser(uid);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = (error as Error).message || 'Internal Server Error';
        res.status(500).json({ success: false, error: errorMessage });
    }
};
