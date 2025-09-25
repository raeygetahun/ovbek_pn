import express from 'express';
import * as volunteerController from '../controllers/volunteerController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

// All volunteer routes require authentication
router.use(authenticateUser);

router.post('/apply-for-time-slot', volunteerController.applyForTimeSlot);
router.get('/applied-time-slots/:email', volunteerController.getAppliedTimeSlots);
router.get('/my-time-slots/:email', volunteerController.getApprovedTimeSlots);
router.get('/cancellation-requests/:email', volunteerController.getCancellationRequests);
router.post('/request-cancellation', volunteerController.requestCancellation);

export default router;
