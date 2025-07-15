// src/controllers/bookingController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/booking';
import SlotSettings from '../models/slotSettings';
import Section from '../models/section';
import { isTimeBlocked } from './blockedSettingsController';
import { normalizeDate } from './blockedSettingsController';
import { ICustomPrice, ICustomDatePrice, ICustomDateRangePrice } from '../models/slotSettings';

// Helper function to validate booking time
const validateBookingTime = async (
  sectionId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<{ valid: boolean; message?: string; slotSettings?: any }> => {
  const targetDate = normalizeDate(date);
  
  // Find active slot settings
  const slotSettings = await SlotSettings.findOne({
    section: sectionId,
    isActive: true
  }).sort({ createdAt: -1 }).populate('section', 'name sport');

  if (!slotSettings) {
    return { valid: false, message: 'No active slot settings found' };
  }

  // Check date range
  if (targetDate < normalizeDate(slotSettings.startDate) ){
    return { valid: false, message: 'Booking date is before the allowed range' };
  }
  if (targetDate > normalizeDate(slotSettings.endDate)) {
    return { valid: false, message: 'Booking date is after the allowed range' };
  }

  // Check day of week
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][targetDate.getDay()];
  if (!slotSettings.days.includes(dayOfWeek)) {
    return { valid: false, message: 'No availability on this day' };
  }

  // Check booking advance
  const today = normalizeDate(new Date());
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > slotSettings.bookingAllowed) {
    return { valid: false, message: 'Booking not allowed this far in advance' };
  }
  if (diffDays < 0) {
    return { valid: false, message: 'Cannot book slots for past dates' };
  }

  // Check if time falls within any available time ranges
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const slotStartMinutes = startHour * 60 + startMin;
  const slotEndMinutes = endHour * 60 + endMin;

  let isValidTime = false;
  for (const timing of slotSettings.timings) {
    const [rangeStartHour, rangeStartMin] = timing.startTime.split(':').map(Number);
    const [rangeEndHour, rangeEndMin] = timing.endTime.split(':').map(Number);
    const rangeStartMinutes = rangeStartHour * 60 + rangeStartMin;
    const rangeEndMinutes = rangeEndHour * 60 + rangeEndMin;

    if (slotStartMinutes >= rangeStartMinutes && slotEndMinutes <= rangeEndMinutes) {
      isValidTime = true;
      break;
    }
  }

  if (!isValidTime) {
    return { valid: false, message: 'Selected time is not within available time ranges' };
  }

  // Check duration matches slot settings
  const durationMinutes = (slotEndMinutes - slotStartMinutes);
  if (durationMinutes !== slotSettings.duration) {
    return { valid: false, message: `Booking duration must be exactly ${slotSettings.duration} minutes` };
  }

  // Check if time is blocked
  const isBlocked = await isTimeBlocked(
    slotSettings.venue.toString(),
    sectionId,
    targetDate,
    startTime,
    endTime
  );

  if (isBlocked) {
    return { valid: false, message: 'Selected time is blocked' };
  }

  return { valid: true, slotSettings };
};

// Get available slots (similar to your generateAvailableSlots but simplified)
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { sectionId, date } = req.query;
    if (!sectionId || !date) {
      return res.status(400).json({ error: 'Section ID and date are required' });
    }

    // Fetch slot settings
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true
    }).sort({ createdAt: -1 }).populate('section', 'name sport');

    if (!slotSettings) {
      return res.status(404).json({ error: 'No active slot settings found' });
    }

    const targetDate = normalizeDate(new Date(date as string));
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][targetDate.getDay()];

    // Generate slots for each time range
    const availableSlots = [];
    const section = slotSettings.section as any;

    for (const timing of slotSettings.timings) {
      const [startHour, startMin] = timing.startTime.split(':').map(Number);
      const [endHour, endMin] = timing.endTime.split(':').map(Number);

      const startTime = new Date(targetDate);
      startTime.setHours(startHour, startMin, 0, 0);
      const endTime = new Date(targetDate);
      endTime.setHours(endHour, endMin, 0, 0);

      let current = new Date(startTime);

      while (current < endTime) {
        const slotEndTime = new Date(current.getTime() + slotSettings.duration * 60000);
        if (slotEndTime > endTime) break;

        const startTimeStr = current.toTimeString().slice(0, 5);
        const endTimeStr = slotEndTime.toTimeString().slice(0, 5);

        // Check if this slot is blocked
        const isBlocked = await isTimeBlocked(
          slotSettings.venue.toString(),
          sectionId as string,
          targetDate,
          startTimeStr,
          endTimeStr
        );

        if (!isBlocked) {
          availableSlots.push({
            sectionId,
            sectionName: section.name,
            sport: section.sport,
            date: targetDate.toISOString().split('T')[0],
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration: slotSettings.duration,
            isAvailable: true
          });
        }

        current = new Date(slotEndTime);
      }
    }

    res.status(200).json({
      sectionId,
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek,
      availableSlots,
      count: availableSlots.length
    });
  } catch (error: any) {
    console.error('Get Available Slots Error:', error.message);
    res.status(500).json({ error: 'Error fetching available slots', details: error.message });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { sectionId, date, startTime, endTime, userId, notes } = req.body;

    // Validate input
    if (!sectionId || !date || !startTime || !endTime || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingDate = new Date(date);
    const validation = await validateBookingTime(sectionId, bookingDate, startTime, endTime);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const slotSettings = validation.slotSettings;

    // Check for existing booking
    const existingBooking = await Booking.findOne({
      section: sectionId,
      date: bookingDate,
      startTime: new Date(`${date}T${startTime}`),
      endTime: new Date(`${date}T${endTime}`),
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(409).json({ error: 'This slot is already booked' });
    }

    // Calculate price
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][bookingDate.getDay()];
    let price = slotSettings.price;

    // Check custom date price
    const customDatePrice = slotSettings.customDatePrice?.find((cdp: ICustomDatePrice) => 
  normalizeDate(cdp.date).getTime() === normalizeDate(bookingDate).getTime()
);
if (customDatePrice) {
  price = customDatePrice.price;
} else {
  // Check custom date range price
  const customRangePrice = slotSettings.customDateRangePrice?.find((cdrp: ICustomDateRangePrice) => 
    bookingDate >= normalizeDate(cdrp.startDate) && 
    bookingDate <= normalizeDate(cdrp.endDate)
  );
  if (customRangePrice) {
    price = customRangePrice.price;
  } else {
    // Check custom day price
    const customDayPrice = slotSettings.customDayPrice?.find((cdp: ICustomPrice) => cdp.day === dayOfWeek);
    if (customDayPrice) {
      price = customDayPrice.price;
    }
  }
}

    // Create booking
    const booking = new Booking({
      user: userId,
      section: sectionId,
      venue: slotSettings.venue,
      date: bookingDate,
      startTime: new Date(`${date}T${startTime}`),
      endTime: new Date(`${date}T${endTime}`),
      duration: slotSettings.duration,
      price,
      status: 'confirmed',
      notes: notes || '',
      createdAt: new Date()
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error: any) {
    console.error('Create Booking Error:', error.message);
    res.status(500).json({ error: 'Error creating booking', details: error.message });
  }
};

// Get bookings for a user
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, fromDate, toDate } = req.query;

    const query: any = { user: userId };
    
    if (status) {
      query.status = status;
    }
    
    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate as string),
        $lte: new Date(toDate as string)
      };
    }

    const bookings = await Booking.find(query)
      .populate('section', 'name sport')
      .populate('venue', 'name location')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ bookings });
  } catch (error: any) {
    console.error('Get User Bookings Error:', error.message);
    res.status(500).json({ error: 'Error fetching user bookings', details: error.message });
  }
};

// Cancel a booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, user: userId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not owned by user' });
    }

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error: any) {
    console.error('Cancel Booking Error:', error.message);
    res.status(500).json({ error: 'Error cancelling booking', details: error.message });
  }
};

// Get booking details
export const getBookingDetails = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('section', 'name sport')
      .populate('venue', 'name location')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({ booking });
  } catch (error: any) {
    console.error('Get Booking Details Error:', error.message);
    res.status(500).json({ error: 'Error fetching booking details', details: error.message });
  }
};