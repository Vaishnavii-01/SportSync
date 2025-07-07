// src/routes/booking.ts
import express from 'express';
import {
  createBooking,
  getAvailableSlotsWithBookings,
  getUserBookings,
  cancelBooking,
  getVenueBookings
} from '../controllers/bookingController';

const router = express.Router();

// Create a new booking
router.post('/', createBooking);

// Get available slots with booking status
router.get('/available-slots', getAvailableSlotsWithBookings);

// Get user bookings
router.get('/user/:userId', getUserBookings);

// Cancel a booking
router.put('/cancel/:bookingId', cancelBooking);

// Get venue bookings
router.get('/venue/:venueId', getVenueBookings);

export default router;