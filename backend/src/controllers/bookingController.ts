// src/controllers/bookingController.ts
import { Request, Response } from 'express';
import Booking from '../models/booking';
import SlotSettings from '../models/slotSettings';
import Section from '../models/section';
import Venue from '../models/venue';

// @desc Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      venueId,
      sectionId,
      date,
      startTime,
      endTime,
      slotId
    } = req.body;

    // Validate section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Get slot settings to validate the booking
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true
    });

    if (!slotSettings) {
      return res.status(404).json({ error: 'No slot settings found for this section' });
    }

    // Parse dates
    const bookingDate = new Date(date);
    const bookingStartTime = new Date(startTime);
    const bookingEndTime = new Date(endTime);

    // Check if booking already exists for this slot
    const existingBooking = await Booking.findOne({
      section: sectionId,
      date: bookingDate,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'This slot is already booked' });
    }

    // Calculate duration and price
    const duration = (bookingEndTime.getTime() - bookingStartTime.getTime()) / (1000 * 60);
    const totalPrice = section.basePrice; // You can modify this based on your pricing logic

    // Create the booking
    const newBooking = new Booking({
      user: userId,
      venue: venueId,
      section: sectionId,
      date: bookingDate,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      totalPrice,
      duration,
      slotId,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await newBooking.save();

    // Populate the booking with related data
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('user', 'name email')
      .populate('venue', 'name address')
      .populate('section', 'name sport');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });

  } catch (error: any) {
    console.error('Create Booking Error:', error.message);
    res.status(500).json({ error: 'Error creating booking', details: error.message });
  }
};

// @desc Get available slots with booking status
export const getAvailableSlotsWithBookings = async (req: Request, res: Response) => {
  try {
    const { sectionId, date } = req.query;

    if (!sectionId || !date) {
      return res.status(400).json({ error: 'Section ID and date are required' });
    }

    // Get slot settings
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true
    }).populate('section', 'name sport basePrice');

    if (!slotSettings) {
      return res.status(404).json({ error: 'No slot settings found for this section' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][targetDate.getDay()];

    // Validate date constraints (same logic as before)
    if (slotSettings.startDate && targetDate < slotSettings.startDate) {
      return res.status(400).json({ error: 'Date is before the start date' });
    }

    if (slotSettings.endDate && targetDate > slotSettings.endDate) {
      return res.status(400).json({ error: 'Date is after the end date' });
    }

    if (slotSettings.days.length > 0 && !slotSettings.days.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'Slots are not available on this day' });
    }

    // Check booking window
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > slotSettings.bookingAllowed) {
      return res.status(400).json({ error: 'Booking is not allowed this far in advance' });
    }

    if (diffDays < 0) {
      return res.status(400).json({ error: 'Cannot book slots for past dates' });
    }

    // Generate all possible slots
    const allSlots = [];
    const section = slotSettings.section as any;

    for (const timing of slotSettings.timings) {
      const [startHour, startMin] = timing.startTime.split(':').map(Number);
      const [endHour, endMin] = timing.endTime.split(':').map(Number);

      const startTime = new Date(targetDate);
      startTime.setHours(startHour, startMin, 0, 0);

      const endTime = new Date(targetDate);
      endTime.setHours(endHour, endMin, 0, 0);

      const current = new Date(startTime);
      while (current < endTime) {
        const slotEndTime = new Date(current.getTime() + slotSettings.duration * 60000);
        
        if (slotEndTime > endTime) break;

        allSlots.push({
          id: `${sectionId}-${current.getTime()}`,
          sectionId: sectionId,
          sectionName: section.name,
          sport: section.sport,
          date: targetDate.toISOString().split('T')[0],
          startTime: current.toTimeString().slice(0, 5),
          endTime: slotEndTime.toTimeString().slice(0, 5),
          fullStartTime: new Date(current),
          fullEndTime: new Date(slotEndTime),
          duration: slotSettings.duration,
          price: section.basePrice,
          isAvailable: true
        });

        current.setTime(current.getTime() + slotSettings.duration * 60000);
      }
    }

    // Get all bookings for this date and section
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      section: sectionId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'cancelled' }
    }).populate('user', 'name email');

    // Mark slots as unavailable if they're booked
    const slotsWithBookingStatus = allSlots.map(slot => {
      const booking = bookings.find(b => 
        b.startTime.getTime() === slot.fullStartTime.getTime() &&
        b.endTime.getTime() === slot.fullEndTime.getTime()
      );

      return {
        ...slot,
        isAvailable: !booking,
        booking: booking ? {
          id: booking._id,
          user: booking.user,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        } : null
      };
    });

    const availableSlots = slotsWithBookingStatus.filter(slot => slot.isAvailable);
    const bookedSlots = slotsWithBookingStatus.filter(slot => !slot.isAvailable);

    res.status(200).json({
      sectionId: sectionId,
      date: date,
      dayOfWeek: dayOfWeek,
      totalSlots: slotsWithBookingStatus.length,
      availableSlots: availableSlots,
      bookedSlots: bookedSlots,
      availableCount: availableSlots.length,
      bookedCount: bookedSlots.length,
      allSlots: slotsWithBookingStatus
    });

  } catch (error: any) {
    console.error('Get Available Slots With Bookings Error:', error.message);
    res.status(500).json({ error: 'Error fetching slots', details: error.message });
  }
};

// @desc Get user bookings
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ user: userId })
      .populate('venue', 'name address')
      .populate('section', 'name sport')
      .sort({ date: -1, startTime: -1 });

    res.status(200).json({
      userId: userId,
      bookings: bookings
    });

  } catch (error: any) {
    console.error('Get User Bookings Error:', error.message);
    res.status(500).json({ error: 'Error fetching user bookings', details: error.message });
  }
};

// @desc Cancel a booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Check if booking can be cancelled (not in the past)
    if (booking.startTime <= new Date()) {
      return res.status(400).json({ error: 'Cannot cancel past bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking: booking
    });

  } catch (error: any) {
    console.error('Cancel Booking Error:', error.message);
    res.status(500).json({ error: 'Error cancelling booking', details: error.message });
  }
};

// @desc Get venue bookings
export const getVenueBookings = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { date, status } = req.query;

    const query: any = { venue: venueId };
    
    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('section', 'name sport')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      venueId: venueId,
      count: bookings.length,
      bookings: bookings
    });

  } catch (error: any) {
    console.error('Get Venue Bookings Error:', error.message);
    res.status(500).json({ error: 'Error fetching venue bookings', details: error.message });
  }
};