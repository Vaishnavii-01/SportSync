// src/routes/bookingRoutes.ts
import express from 'express';
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  getAvailableSlots

} from '../controllers/bookingController';

const router = express.Router();
router.get('/:sectionId/available-slots', getAvailableSlots);
router.post('/',  createBooking);
router.get('/',  getUserBookings);
router.put('/:bookingId/cancel',  cancelBooking);


export default router;