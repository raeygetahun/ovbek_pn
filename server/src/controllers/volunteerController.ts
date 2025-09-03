import { Request, Response } from 'express';
import Volunteer from '../models/volunteer';
import Application from '../models/application';
import Admin from '../models/admin';
import sendEmail from '../services/emailService';
import cacheService from '../services/cacheService';
import { isValidVolunteerDate } from '../utils/dateValidation';
import { IApplyTimeSlotBody, ICancellationRequestBody } from '../types';

export const applyForTimeSlot = async (
    req: Request<{}, {}, IApplyTimeSlotBody>,
    res: Response
): Promise<void> => {
    try {
        const { email, applicationDate, slotId } = req.body;

        const volunteer = await Volunteer.getByEmail(email);

        if (!volunteer) {
            res.status(400).json({ success: false, error: 'Volunteer does not exist' });
            return;
        }

        if (volunteer.accountStatus !== 'Approved') {
            res.status(400).json({ success: false, error: 'Volunteer not approved' });
            return;
        }

        const appDate = new Date(applicationDate);
        const isValidDate = await isValidVolunteerDate(appDate);
        if (!isValidDate) {
            res.status(400).json({ success: false, error: 'Volunteers are only needed on weekends and public holidays' });
            return;
        }

        const newApplication = new Application(null, applicationDate, slotId, volunteer.volunteerId, 'Pending');

        const savedApplication = await newApplication.save();

        const adminsEmail = await Admin.getAll('email') as string[];

        await sendEmail(adminsEmail, 'New TimeSlot', true, { name: volunteer.firstName + ' ' + volunteer.lastName });

        res.json({ success: true, data: savedApplication, message: 'Application submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getAppliedTimeSlots = async (
    req: Request<{ email: string }>,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.params;
        const volunteer = await Volunteer.getByEmail(email);

        if (volunteer) {
            const applications = await Application.getByVolunteerId(volunteer.volunteerId, 'Pending');
            res.json({ success: true, data: applications });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getApprovedTimeSlots = async (
    req: Request<{ email: string }>,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.params;
        const volunteer = await Volunteer.getByEmail(email);

        if (volunteer) {
            const volunteerName = volunteer.firstName + ' ' + volunteer.lastName;
            const applications = await Application.getByVolunteerId(volunteer.volunteerId, 'Approved');
            applications.forEach(application => {
                application.volunteerName = volunteerName;
            });
            res.json({ success: true, data: applications });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getCancellationRequests = async (
    req: Request<{ email: string }>,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.params;
        const volunteer = await Volunteer.getByEmail(email);

        if (!volunteer) {
            res.status(404).json({ success: false, error: 'Volunteer not found' });
            return;
        }

        const applications = await Application.getByVolunteerId(volunteer.volunteerId, 'CancellationRequested');
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const requestCancellation = async (
    req: Request<{}, {}, ICancellationRequestBody>,
    res: Response
): Promise<void> => {
    try {
        const { applicationId, reason } = req.body;

        if (!applicationId || !reason) {
            res.status(400).json({ success: false, error: 'Application ID and reason are required' });
            return;
        }

        const result = await Application.requestCancellation(applicationId, reason);

        if (!result) {
            res.status(404).json({ success: false, error: 'Application not found' });
            return;
        }

        const { application, volunteer, slot } = result;

        const appDate = application.date.toDate ? application.date.toDate() : new Date(application.date);
        const dateStr = appDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = slot ? `${slot.startTime} - ${slot.endTime}` : 'N/A';

        const adminsEmail = await Admin.getAll('email') as string[];
        await sendEmail(adminsEmail, 'Cancellation Request', true, {
            name: volunteer.firstName + ' ' + volunteer.lastName,
            date: dateStr,
            time: timeStr,
            reason: reason
        });

        res.json({ success: true, message: 'Cancellation request submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
