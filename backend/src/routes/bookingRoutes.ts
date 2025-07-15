// src/routes/bookingRoutes.ts
import express from 'express';
import {
  getAvailableSlots,
  createBooking,
  getUserBookings,
  cancelBooking,
  getBookingDetails
} from '../controllers/bookingController';

const router = express.Router();

// Get available slots
router.get('/slots', getAvailableSlots);

// Create a new booking
router.post('/', createBooking);

// Get user bookings
router.get('/user/:userId', getUserBookings);

// Cancel booking
router.put('/cancel/:bookingId', cancelBooking);

// Get booking details
router.get('/:bookingId', getBookingDetails);

export default router;