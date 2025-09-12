import express from 'express';
import * as authController from '../controllers/authController';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public - anyone can register as volunteer
router.post('/volunteer-register', authController.volunteerRegister);

// Admin only
router.post('/admin-register', requireAdmin, authController.adminRegister);
router.delete('/delete-user', authenticateUser, authController.deleteUser);
router.post('/migrate-admin-claims', requireAdmin, authController.migrateAdminClaims);

export default router;
