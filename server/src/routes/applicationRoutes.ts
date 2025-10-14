import express from 'express';
import * as applicationController from '../controllers/applicationController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

// All application routes require authentication
router.use(authenticateUser);

router.get('/approved-timeslots', applicationController.getApprovedApplications);
router.get('/pending-timeslots', applicationController.getPendingApplications);

export default router;
