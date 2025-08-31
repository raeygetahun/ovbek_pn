import admin from '../services/firebaseService';
import Volunteer from './volunteer';
import Slot from './slot';
import { isValidVolunteerDate } from '../utils/dateValidation';
import {
    IApplication,
    ApplicationStatus,
    ISlot,
    ICoverageGap,
    IVolunteerStats,
    IPreferredDay,
    ISlotBreakdown,
    FirestoreDateField
} from '../types';

const firestore = admin.firestore();

interface CancellationResult {
    application: FirebaseFirestore.DocumentData;
    volunteer: Volunteer;
    slot: ISlot | undefined;
}

class Application implements IApplication {
    applicationId: string;
    date: Date;
    slotId: string;
    volunteerId: string;
    status: ApplicationStatus;
    note: string | null;
    volunteerName: string | null;
    startTime: Date | null;
    endTime: Date | null;
    slotName?: string;
    cancellationReason?: string;
    cancellationRequestedAt?: Date;

    constructor(
        applicationId: string | null,
        date: Date | string,
        slotId: string,
        volunteerId: string,
        status: ApplicationStatus,
        note: string | null = null,
        volunteerName: string | null = null,
        startTime: Date | null = null,
        endTime: Date | null = null
    ) {
        this.applicationId = applicationId || '';
        this.date = date instanceof Date ? date : new Date(date);
        this.slotId = slotId;
        this.volunteerId = volunteerId;
        this.status = status;
        this.note = note;
        this.volunteerName = volunteerName;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    resolveSlot(slot: ISlot | undefined): void {
        if (!slot) return;
        const year = this.date.getFullYear();
        const month = String(this.date.getMonth() + 1).padStart(2, '0');
        const day = String(this.date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        this.startTime = new Date(`${dateStr}T${slot.startTime}`);
        this.endTime = new Date(`${dateStr}T${slot.endTime}`);
    }

    async save(): Promise<Application> {
        try {
            const docRef = await firestore.collection('applications').add({
                date: this.date,
                slotId: this.slotId,
                volunteerId: this.volunteerId,
                status: this.status,
                note: null,
            });

            this.applicationId = docRef.id;
            return this;
        } catch (error) {
            throw new Error(`Application failed: ${(error as Error).message}`);
        }
    }

    private static async _getSlotMap(): Promise<Record<string, ISlot>> {
        const slots = await Slot.getAll();
        const slotMap: Record<string, ISlot> = {};
        slots.forEach((s) => {
            slotMap[s.slotId] = s;
        });
        return slotMap;
    }

    static async getAll(status: ApplicationStatus | null = null): Promise<Application[]> {
        let snapshot;
        if (status) {
            snapshot = await firestore
                .collection('applications')
                .where('status', '==', status)
                .get();
        } else {
            snapshot = await firestore.collection('applications').get();
        }

        const slotMap = await this._getSlotMap();
        const applications: Application[] = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const volunteerSnapshot = await firestore
                .collection('volunteers')
                .doc(data.volunteerId)
                .get();
            let volunteerName = '';
            if (volunteerSnapshot.exists) {
                const volunteerData = volunteerSnapshot.data()!;
                volunteerName = volunteerData.firstName + ' ' + volunteerData.lastName;
            }

            const app = new Application(
                doc.id,
                this.convertFirestoreTimestamp(data.date),
                data.slotId,
                data.volunteerId,
                data.status,
                data.note,
                volunteerName
            );
            app.resolveSlot(slotMap[data.slotId]);
            applications.push(app);
        }

        return applications;
    }

    static async getById(applicationId: string): Promise<Application | null> {
        const doc = await firestore
            .collection('applications')
            .doc(applicationId)
            .get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data()!;
        const slotMap = await this._getSlotMap();

        const app = new Application(
            doc.id,
            this.convertFirestoreTimestamp(data.date),
            data.slotId,
            data.volunteerId,
            data.status,
            data.note
        );
        app.resolveSlot(slotMap[data.slotId]);
        return app;
    }

    static async getByVolunteerId(volunteerId: string, status: ApplicationStatus | null = null): Promise<Application[]> {
        let snapshot;
        if (status === 'Approved') {
            snapshot = await firestore
                .collection('applications')
                .where('volunteerId', '==', volunteerId)
                .where('status', 'in', ['Approved', 'CancellationRequested'])
                .get();
        } else if (status) {
            snapshot = await firestore
                .collection('applications')
                .where('volunteerId', '==', volunteerId)
                .where('status', '==', status)
                .get();
        } else {
            snapshot = await firestore
                .collection('applications')
                .where('volunteerId', '==', volunteerId)
                .get();
        }

        const slotMap = await this._getSlotMap();
        const applications: Application[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            const app = new Application(
                doc.id,
                this.convertFirestoreTimestamp(data.date),
                data.slotId,
                data.volunteerId,
                data.status,
                data.note
            );
            app.resolveSlot(slotMap[data.slotId]);
            applications.push(app);
        });

        return applications;
    }

    static async updateStatus(applicationId: string, status: ApplicationStatus, note: string | null): Promise<Volunteer | null> {
        try {
            const docRef = firestore.collection('applications').doc(applicationId);
            await docRef.update({ status, note });
            const updatedDoc = await docRef.get();
            const updatedApplication = updatedDoc.data()!;
            return Volunteer.getById(updatedApplication.volunteerId);
        } catch (error) {
            console.error(`Failed to update status for application ${applicationId}: ${(error as Error).message}`);
            throw new Error(`Failed to update status for application ${applicationId}`);
        }
    }

    static async updateSlot(applicationId: string, slotId: string): Promise<boolean> {
        try {
            const docRef = firestore.collection('applications').doc(applicationId);
            await docRef.update({ slotId });
            return true;
        } catch (error) {
            console.error(`Failed to update slot for application ${applicationId}: ${(error as Error).message}`);
            throw new Error(`Failed to update slot for application ${applicationId}`);
        }
    }

    static async deleteApplication(applicationId: string): Promise<boolean> {
        try {
            const docRef = firestore.collection('applications').doc(applicationId);
            await docRef.delete();
            return true;
        } catch (error) {
            console.error(`Failed to delete application ${applicationId}: ${(error as Error).message}`);
            throw new Error(`Failed to delete application ${applicationId}`);
        }
    }

    static async requestCancellation(applicationId: string, reason: string): Promise<CancellationResult | null> {
        try {
            const docRef = firestore.collection('applications').doc(applicationId);
            await docRef.update({
                status: 'CancellationRequested',
                cancellationReason: reason,
                cancellationRequestedAt: new Date(),
            });

            const updatedDoc = await docRef.get();
            const data = updatedDoc.data()!;

            const volunteer = await Volunteer.getById(data.volunteerId);
            if (!volunteer) return null;

            const slotMap = await this._getSlotMap();
            const slot = slotMap[data.slotId];

            return {
                application: data,
                volunteer,
                slot,
            };
        } catch (error) {
            console.error(`Failed to request cancellation for application ${applicationId}: ${(error as Error).message}`);
            throw new Error(`Failed to request cancellation for application ${applicationId}`);
        }
    }

    static async approveCancellation(applicationId: string): Promise<boolean> {
        try {
            const docRef = firestore.collection('applications').doc(applicationId);
            await docRef.delete();
            return true;
        } catch (error) {
            console.error(`Failed to approve cancellation for application ${applicationId}: ${(error as Error).message}`);
            throw new Error(`Failed to approve cancellation for application ${applicationId}`);
        }
    }

    static async rejectCancellation(applicationId: string): Promise<boolean> {
        try {
            const docRef = firestore.collection('applications').doc(applicationId);
            await docRef.update({
                status: 'Approved',
                cancellationReason: null,
                cancellationRequestedAt: null,
            });
            return true;
        } catch (error) {
            console.error(`Failed to reject cancellation for application ${applicationId}: ${(error as Error).message}`);
            throw new Error(`Failed to reject cancellation for application ${applicationId}`);
        }
    }

    static async getCoverageGaps(startDate: Date, numberOfGaps: number): Promise<ICoverageGap[]> {
        const snapshot = await firestore
            .collection('applications')
            .where('status', 'in', ['Approved', 'Pending', 'CancellationRequested'])
            .get();

        const coveredSlots = new Set<string>();
        snapshot.forEach((doc) => {
            const data = doc.data();
            const date = this.convertFirestoreTimestamp(data.date);
            if (date && data.slotId) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                coveredSlots.add(`${dateStr}_${data.slotId}`);
            }
        });

        const allSlots = await Slot.getCommon();
        const gaps: ICoverageGap[] = [];
        const current = new Date(startDate);

        if (!allSlots || allSlots.length === 0) {
            return [];
        }

        while (gaps.length < numberOfGaps) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const dayOfWeek = current.toLocaleDateString('en-US', { weekday: 'long' });

            const isValidDate = await isValidVolunteerDate(current);

            if (isValidDate) {
                for (const slot of allSlots) {
                    if (!coveredSlots.has(`${dateStr}_${slot.slotId}`)) {
                        gaps.push({
                            date: dateStr,
                            slotId: slot.slotId,
                            slotName: slot.name,
                            slotDisplay: Slot.getDisplayText(slot),
                            dayOfWeek,
                        });

                        if (gaps.length >= numberOfGaps) {
                            break;
                        }
                    }
                }
            }

            current.setDate(current.getDate() + 1);
        }

        return gaps;
    }

    static async getVolunteerStats(volunteerId: string): Promise<IVolunteerStats> {
        const applications = await this.getByVolunteerId(volunteerId, 'Approved');

        if (applications.length === 0) {
            return { totalShifts: 0, preferredDays: [], lastVolunteered: null };
        }

        const daySlotCounts: Record<string, Record<string, { count: number; name: string }>> = {};
        let lastDate: Date | null = null;

        applications.forEach((app) => {
            const date = app.date instanceof Date ? app.date : new Date(app.date);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

            if (!daySlotCounts[dayOfWeek]) {
                daySlotCounts[dayOfWeek] = {};
            }

            if (!daySlotCounts[dayOfWeek][app.slotId]) {
                daySlotCounts[dayOfWeek][app.slotId] = {
                    count: 0,
                    name: app.slotName || app.slotId,
                };
            }
            daySlotCounts[dayOfWeek][app.slotId].count++;

            if (!lastDate || date > lastDate) {
                lastDate = date;
            }
        });

        const preferredDays: IPreferredDay[] = Object.entries(daySlotCounts)
            .map(([day, slots]) => {
                const slotBreakdown: ISlotBreakdown[] = Object.entries(slots).map(([slotId, info]) => ({
                    slotId,
                    slotName: info.name,
                    count: info.count,
                }));
                const total = slotBreakdown.reduce((sum, s) => sum + s.count, 0);

                return {
                    day,
                    total,
                    slots: slotBreakdown,
                };
            })
            .sort((a, b) => b.total - a.total);

        return {
            totalShifts: applications.length,
            preferredDays,
            lastVolunteered: lastDate,
        };
    }

    static convertFirestoreTimestamp(timestamp: FirestoreDateField | null | undefined): Date {
        if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
            return timestamp.toDate();
        }
        if (timestamp instanceof Date) {
            return timestamp;
        }
        return new Date();
    }
}

export default Application;
