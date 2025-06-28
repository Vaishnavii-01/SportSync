//All the URL paths and which controller should handle them
import express from 'express';
import * as slotController from '../controllers/slot.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('vendor'));

router.route('/')
  .get(slotController.getSlots)
  .post(slotController.createSlots);

router.route('/:slotId/block')
  .delete(slotController.blockSlot);

export default router;