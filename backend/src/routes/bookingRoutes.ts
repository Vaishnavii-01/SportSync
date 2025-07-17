// src/routes/bookingRoutes.ts
import express from 'express';
import {
  createBooking,
  getUserBookings,
  cancelBooking,
  getAvailableSlots

} from '../controllers/bookingController';

const router = express.Router();
router.get('/sections/:sectionId/available-slots', getAvailableSlots);
router.post('/',  createBooking);
router.get('/bookings',  getUserBookings);
router.put('/bookings/:bookingId/cancel',  cancelBooking);


export default router;