import { Request, Response } from 'express';
import Application from '../models/application';

export const getApprovedApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const approvedApplications = await Application.getAll('Approved');
        res.json({ success: true, data: approvedApplications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getPendingApplications = async (req: Request, res: Response): Promise<void> => {
    try {
        const pendingApplications = await Application.getAll('Pending');
        res.json({ success: true, data: pendingApplications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
