import express from 'express';
import authRoutes from './authRoutes';
import volunteerRoutes from './volunteerRoutes';
import adminRoutes from './adminRoutes';
import applicationRoutes from './applicationRoutes';
import recommendationRoutes from './recommendationRoutes';
import slotRoutes from './slotRoutes';
import holidayRoutes from './holidayRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/volunteer', volunteerRoutes);
router.use('/admin', adminRoutes);
router.use('/application', applicationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/slots', slotRoutes);
router.use('/holidays', holidayRoutes);

export default router;
