import express, { Request, Response } from 'express';
import holidayService from '../services/holidayService';

const router = express.Router();

router.get('/:year', async (req: Request<{ year: string }>, res: Response): Promise<void> => {
    try {
        const year = parseInt(req.params.year, 10);

        if (isNaN(year) || year < 2000 || year > 2100) {
            res.status(400).json({ success: false, error: 'Invalid year' });
            return;
        }

        const holidays = await holidayService.getHolidays(year);
        res.json({ success: true, data: holidays });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch holidays' });
    }
});

export default router;
