// src/routes/slotRoutes.ts
import express from 'express';
import {
  generateSlots,
  getAvailableSlots,
  getVenueSlots,
  bookSlot,
  cancelBooking
} from '../controllers/slotController';

const router = express.Router();

// Slot routes
router.post('/generate', generateSlots);
router.get('/available', getAvailableSlots);
router.get('/venue/:venueId', getVenueSlots);
router.post('/book', bookSlot);
router.put('/cancel/:slotId', cancelBooking);

export default router;