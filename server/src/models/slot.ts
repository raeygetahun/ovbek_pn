import admin from '../services/firebaseService';
import { ISlot } from '../types';

const firestore = admin.firestore();

class Slot implements ISlot {
    slotId: string;
    name: string;
    startTime: string;
    endTime: string;
    main?: boolean;

    constructor(slotId: string | null, name: string, startTime: string, endTime: string) {
        this.slotId = slotId || '';
        this.name = name;
        this.startTime = startTime; // "HH:mm" format e.g. "11:00"
        this.endTime = endTime;     // "HH:mm" format e.g. "14:00"
    }

    async save(): Promise<Slot> {
        try {
            const docRef = await firestore.collection('slots').add({
                name: this.name,
                startTime: this.startTime,
                endTime: this.endTime,
            });
            this.slotId = docRef.id;
            return this;
        } catch (error) {
            throw new Error(`Failed to create slot: ${(error as Error).message}`);
        }
    }

    static async getAll(): Promise<Slot[]> {
        const snapshot = await firestore.collection('slots').get();
        const slots: Slot[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            slots.push(new Slot(doc.id, data.name, data.startTime, data.endTime));
        });
        // Sort by start time
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        return slots;
    }

    static async getCommon(): Promise<Slot[]> {
        const snapshot = await firestore.collection('slots').where('main', '==', true).get();
        const slots: Slot[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            slots.push(new Slot(doc.id, data.name, data.startTime, data.endTime));
        });
        // Sort by start time
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        return slots;
    }

    static async getById(slotId: string): Promise<Slot | null> {
        const doc = await firestore.collection('slots').doc(slotId).get();
        if (!doc.exists) return null;
        const data = doc.data()!;
        return new Slot(doc.id, data.name, data.startTime, data.endTime);
    }

    static async update(slotId: string, updates: Partial<ISlot>): Promise<Slot> {
        try {
            const docRef = firestore.collection('slots').doc(slotId);
            await docRef.update(updates);
            const updatedDoc = await docRef.get();
            const data = updatedDoc.data()!;
            return new Slot(slotId, data.name, data.startTime, data.endTime);
        } catch (error) {
            throw new Error(`Failed to update slot: ${(error as Error).message}`);
        }
    }

    static async delete(slotId: string): Promise<boolean> {
        try {
            await firestore.collection('slots').doc(slotId).delete();
            return true;
        } catch (error) {
            throw new Error(`Failed to delete slot: ${(error as Error).message}`);
        }
    }

    static getDisplayText(slot: ISlot): string {
        const formatTime = (time: string): string => {
            const [hours, minutes] = time.split(':').map(Number);
            return `${hours}${minutes > 0 ? ':' + String(minutes).padStart(2, '0') : ''}`;
        };
        return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    }

    static async isReferenced(slotId: string): Promise<boolean> {
        const snapshot = await firestore.collection('applications')
            .where('slotId', '==', slotId)
            .limit(1)
            .get();
        return !snapshot.empty;
    }
}

export default Slot;
