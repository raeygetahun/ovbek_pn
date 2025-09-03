import { Request, Response } from 'express';
import Application from '../models/application';
import Volunteer from '../models/volunteer';
import sendEmail from '../services/emailService';
import { IApplyTimeSlotBody, IVerifyApplicationBody, IVerifyVolunteerBody, IUpdateApplicationBody, AccountStatus } from '../types';
import { isValidVolunteerDate } from '../utils/dateValidation';

export const assignTimeSlot = async (
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

        const newApplication = new Application(null, applicationDate, slotId, volunteer.volunteerId, 'Approved');

        const savedApplication = await newApplication.save();

        const assignmentDate = appDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        await sendEmail(email, 'New Assignment', true, { name: volunteer.firstName + ' ' + volunteer.lastName, date: assignmentDate });

        res.json({ success: true, data: savedApplication, message: 'Application submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


export const verifyTimeSlotApplication = async (
    req: Request<{}, {}, IVerifyApplicationBody>,
    res: Response
): Promise<void> => {
    try {
        const { applicationId, status, note } = req.body;

        const updatedVolunteer = await Application.updateStatus(applicationId, status, note || null);

        if (updatedVolunteer) {
            if (status === 'Approved') {
                await sendEmail(updatedVolunteer.email, 'TimeSlot Approved');
            } else if (status === 'Rejected') {
                await sendEmail(updatedVolunteer.email, 'TimeSlot Rejected', false, { reason: note || '' });
            }
        }

        res.json({ success: true, message: 'Application status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const verifyNewVolunteerApplication = async (
    req: Request<{}, {}, IVerifyVolunteerBody>,
    res: Response
): Promise<void> => {
    try {
        const { volunteerId, status } = req.body;

        const updatedVolunteer = await Volunteer.updateStatus(volunteerId, status as AccountStatus);

        if (status === 'Approved') {
            await sendEmail(updatedVolunteer.email, 'Account Approved');
        } else if (status === 'Rejected') {
            await sendEmail(updatedVolunteer.email, 'Account Rejected');
        }

        res.json({ success: true, message: 'Application status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const deleteApplication = async (
    req: Request<{}, {}, { applicationId: string }>,
    res: Response
): Promise<void> => {
    try {
        const { applicationId } = req.body;

        await Application.deleteApplication(applicationId);

        res.json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateApplication = async (
    req: Request<{}, {}, IUpdateApplicationBody>,
    res: Response
): Promise<void> => {
    try {
        const { applicationId, slotId } = req.body;

        await Application.updateSlot(applicationId, slotId);

        res.json({ success: true, message: 'Application updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getPendingVolunteers = async (req: Request, res: Response): Promise<void> => {
    try {
        const pendingVolunteers = await Volunteer.getAll('Pending');
        res.json({ success: true, data: pendingVolunteers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getApprovedVolunteers = async (req: Request, res: Response): Promise<void> => {
    try {
        const approvedVolunteers = await Volunteer.getAll('Approved');
        res.json({ success: true, data: approvedVolunteers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getCancellationRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const applications = await Application.getAll('CancellationRequested');
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const approveCancellation = async (
    req: Request<{}, {}, { applicationId: string }>,
    res: Response
): Promise<void> => {
    try {
        const { applicationId } = req.body;

        const application = await Application.getById(applicationId);
        if (!application) {
            res.status(404).json({ success: false, error: 'Application not found' });
            return;
        }

        const volunteer = await Volunteer.getById(application.volunteerId);
        if (!volunteer) {
            res.status(404).json({ success: false, error: 'Volunteer not found' });
            return;
        }

        await Application.approveCancellation(applicationId);

        const dateStr = application.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const startTime = application.startTime
            ? application.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : 'N/A';
        const endTime = application.endTime
            ? application.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : 'N/A';
        const timeStr = `${startTime} - ${endTime}`;

        await sendEmail(volunteer.email, 'Cancellation Approved', false, {
            date: dateStr,
            time: timeStr
        });

        res.json({ success: true, message: 'Cancellation approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const rejectCancellation = async (
    req: Request<{}, {}, { applicationId: string }>,
    res: Response
): Promise<void> => {
    try {
        const { applicationId } = req.body;

        const application = await Application.getById(applicationId);
        if (!application) {
            res.status(404).json({ success: false, error: 'Application not found' });
            return;
        }

        const volunteer = await Volunteer.getById(application.volunteerId);
        if (!volunteer) {
            res.status(404).json({ success: false, error: 'Volunteer not found' });
            return;
        }

        await Application.rejectCancellation(applicationId);

        const dateStr = application.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const startTime = application.startTime
            ? application.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : 'N/A';
        const endTime = application.endTime
            ? application.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : 'N/A';
        const timeStr = `${startTime} - ${endTime}`;

        await sendEmail(volunteer.email, 'Cancellation Rejected', false, {
            date: dateStr,
            time: timeStr
        });

        res.json({ success: true, message: 'Cancellation rejected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
