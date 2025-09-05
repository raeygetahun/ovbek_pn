import express from 'express';
import * as slotController from '../controllers/slotController';
import { requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public - anyone can view slots
router.get('/', slotController.getAllSlots);

// Admin only - create, update, delete slots
router.post('/', requireAdmin, slotController.createSlot);
router.put('/:slotId', requireAdmin, slotController.updateSlot);
router.delete('/:slotId', requireAdmin, slotController.deleteSlot);
router.post('/seed', requireAdmin, slotController.seedSlots);

export default router;
