import express from 'express';
import * as recommendationController from '../controllers/recommendationController';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Volunteer recommendations - requires authentication
router.get('/smart-recommendations/:email', authenticateUser, recommendationController.getSmartRecommendations);

// Admin recommendations - requires admin
router.get('/admin-recommendations', requireAdmin, recommendationController.getAdminRecommendations);

export default router;
