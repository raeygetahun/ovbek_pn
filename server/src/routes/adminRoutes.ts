import express from 'express';
import * as adminController from '../controllers/adminController';
import { requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

router.post('/verify-time-slot-application', adminController.verifyTimeSlotApplication);
router.post('/verify-new-volunteer-application', adminController.verifyNewVolunteerApplication);
router.delete('/delete-application', adminController.deleteApplication);
router.put('/update-application', adminController.updateApplication);
router.get('/pending-volunteers', adminController.getPendingVolunteers);
router.get('/approved-volunteers', adminController.getApprovedVolunteers);
router.get('/cancellation-requests', adminController.getCancellationRequests);
router.post('/approve-cancellation', adminController.approveCancellation);
router.post('/reject-cancellation', adminController.rejectCancellation);
router.post('/assign-time-slot', adminController.assignTimeSlot);

export default router;
