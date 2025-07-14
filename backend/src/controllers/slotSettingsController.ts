import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/booking';
import SlotSettings from '../models/slotSettings';
import Section from '../models/section';

// Helper function to normalize dates
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Helper function to check if a slot overlaps with a blocked time
const isSlotBlocked = (slotStartMinutes: number, slotEndMinutes: number, blockStartTime: string, blockEndTime: string): boolean => {
  const [blockStartHour, blockStartMin] = blockStartTime.split(':').map(Number);
  const [blockEndHour, blockEndMin] = blockEndTime.split(':').map(Number);
  const blockStartMinutes = blockStartHour * 60 + blockStartMin;
  const blockEndMinutes = blockEndHour * 60 + blockEndMin;
  return slotStartMinutes < blockEndMinutes && slotEndMinutes > blockStartMinutes;
};

export const createBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    // Validate inputs
    if (!userId || !venueId || !sectionId || !date || !startTime || !endTime || !slotId) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate section exists
    const section = await Section.findById(sectionId).session(session);
    if (!section) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Section not found' });
    }

    // Get active slot settings
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true
    }).sort({ createdAt: -1 }).session(session);

    if (!slotSettings) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'No active slot settings found' });
    }

    // Parse dates
    const bookingDate = normalizeDate(new Date(date));
    const bookingStartTime = new Date(startTime);
    const bookingEndTime = new Date(endTime);

    // Check booking constraints
    const bookingDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][bookingDate.getDay()];

    // Validate against slot settings
    if (bookingDate < normalizeDate(slotSettings.startDate) || bookingDate > normalizeDate(slotSettings.endDate)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Date outside valid range' });
    }

    if (slotSettings.days.length > 0 && !slotSettings.days.includes(bookingDay)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'No availability on this day' });
    }

    if (slotSettings.blockedDays.includes(bookingDay)) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'This day is blocked' });
    }

    // Validate time is within operating hours
    const [opStartHour, opStartMin] = slotSettings.startTime.split(':').map(Number);
    const [opEndHour, opEndMin] = slotSettings.endTime.split(':').map(Number);
    const opStartMinutes = opStartHour * 60 + opStartMin;
    const opEndMinutes = opEndHour * 60 + opEndMin;

    const bookingStartMinutes = bookingStartTime.getHours() * 60 + bookingStartTime.getMinutes();
    const bookingEndMinutes = bookingEndTime.getHours() * 60 + bookingEndTime.getMinutes();

    if (bookingStartMinutes < opStartMinutes || bookingEndMinutes > opEndMinutes) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Booking time outside operating hours' });
    }

    // Check blocked times
    const isBlocked = slotSettings.blockedTimes.some(block => 
      isSlotBlocked(bookingStartMinutes, bookingEndMinutes, block.startTime, block.endTime)
    );

    if (isBlocked) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Booking time falls within blocked hours' });
    }

    // Check for existing booking
    const existingBooking = await Booking.findOne({
      section: sectionId,
      date: bookingDate,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      status: { $ne: 'cancelled' }
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Slot already booked' });
    }

    // Calculate duration and price with precedence: customDatePrices > customPrices > basePrice
    const duration = (bookingEndTime.getTime() - bookingStartTime.getTime()) / (1000 * 60);
    let price = slotSettings.basePrice || section.basePrice;
    const customDatePrice = slotSettings.customDatePrices.find(cdp => 
      normalizeDate(cdp.date).toISOString() === bookingDate.toISOString()
    );
    if (customDatePrice) {
      price = customDatePrice.price;
    } else {
      const customPrice = slotSettings.customPrices.find(cp => cp.day === bookingDay);
      if (customPrice) {
        price = customPrice.price;
      }
    }

    const totalPrice = price * (duration / 60); // Per hour pricing

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
      status: 'confirmed',
      paymentStatus: 'completed'
    });

    await newBooking.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate booking details for response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('user', 'name email')
      .populate('venue', 'name address')
      .populate('section', 'name sport');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Create Booking Error:', error.message);
    res.status(500).json({
      error: 'Error creating booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

export const getAvailableSlotsWithBookings = async (req: Request, res: Response) => {
  try {
    const { sectionId, date } = req.query;

    // Validate inputs
    if (!sectionId || !date) {
      return res.status(400).json({ error: 'Section ID and date are required' });
    }

    // Get slot settings
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true
    }).sort({ createdAt: -1 }).populate('section', 'name sport basePrice');

    if (!slotSettings) {
      return res.status(404).json({ error: 'No slot settings found' });
    }

    if (!slotSettings.startTime || !slotSettings.endTime) {
      return res.status(400).json({ error: 'Slot settings missing startTime or endTime' });
    }

    const targetDate = normalizeDate(new Date(date as string));
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][targetDate.getDay()];

    // Validate date constraints
    if (targetDate < normalizeDate(slotSettings.startDate) || targetDate > normalizeDate(slotSettings.endDate)) {
      return res.status(400).json({ error: 'Date outside valid range' });
    }

    if (slotSettings.days.length > 0 && !slotSettings.days.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'No availability on this day' });
    }

    if (slotSettings.blockedDays.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'This day is blocked' });
    }

    // Generate all possible slots
    const allSlots = [];
    const section = slotSettings.section as any;

    const [startHour, startMin] = slotSettings.startTime.split(':').map(Number);
    const [endHour, endMin] = slotSettings.endTime.split(':').map(Number);

    const startTime = new Date(targetDate);
    startTime.setHours(startHour, startMin, 0, 0);
    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMin, 0, 0);

    let current = new Date(startTime);
    while (current < endTime) {
      const slotEndTime = new Date(current.getTime() + slotSettings.duration * 60000);
      if (slotEndTime > endTime) break;

      const currentMinutes = current.getHours() * 60 + current.getMinutes();
      const slotEndMinutes = slotEndTime.getHours() * 60 + slotEndTime.getMinutes();

      // Check if slot is blocked
      const isBlocked = slotSettings.blockedTimes.some(block => 
        isSlotBlocked(currentMinutes, slotEndMinutes, block.startTime, block.endTime)
      );

      if (!isBlocked) {
        // Calculate price with precedence: customDatePrices > customPrices > basePrice
        let price = slotSettings.basePrice || section.basePrice;
        const customDatePrice = slotSettings.customDatePrices.find(cdp => 
          normalizeDate(cdp.date).toISOString() === targetDate.toISOString()
        );
        if (customDatePrice) {
          price = customDatePrice.price;
        } else {
          const customPrice = slotSettings.customPrices.find(cp => cp.day === dayOfWeek);
          if (customPrice) {
            price = customPrice.price;
          }
        }

        allSlots.push({
          id: `${sectionId}-${current.getTime()}`,
          sectionId,
          sectionName: section.name,
          sport: section.sport,
          date: targetDate.toISOString().split('T')[0],
          startTime: current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: slotEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullStartTime: new Date(current),
          fullEndTime: new Date(slotEndTime),
          duration: slotSettings.duration,
          price: price * (slotSettings.duration / 60), // Per hour pricing
        });
      }

      current = new Date(slotEndTime);
    }

    // Get bookings in a single query
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      section: sectionId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).populate('user', 'name email');

    const bookingMap = new Map();
    bookings.forEach(booking => {
      const key = `${booking.startTime.getTime()}-${booking.endTime.getTime()}`;
      bookingMap.set(key, booking);
    });

    const slotsWithStatus = allSlots.map(slot => {
      const key = `${slot.fullStartTime.getTime()}-${slot.fullEndTime.getTime()}`;
      const booking = bookingMap.get(key);

      return {
        ...slot,
        isAvailable: !booking,
        booking: booking ? {
          id: booking._id,
          user: booking.user,
          status: booking.status
        } : null
      };
    });

    res.status(200).json({
      sectionId,
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek,
      slots: slotsWithStatus,
      meta: {
        total: slotsWithStatus.length,
        available: slotsWithStatus.filter(s => s.isAvailable).length,
        booked: slotsWithStatus.filter(s => !s.isAvailable).length
      }
    });
  } catch (error: any) {
    console.error('Get Slots Error:', error.message);
    res.status(500).json({
      error: 'Error fetching slots',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const bookings = await Booking.find({ user: userId })
      .populate('venue', 'name address')
      .populate('section', 'name sport')
      .sort({ date: -1, startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Booking.countDocuments({ user: userId });

    res.status(200).json({
      data: bookings,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error: any) {
    console.error('Get Bookings Error:', error.message);
    res.status(500).json({
      error: 'Error fetching bookings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    if (booking.startTime <= new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Cannot cancel past bookings' });
    }

    booking.status = 'cancelled';
    await booking.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Cancel Booking Error:', error.message);
    res.status(500).json({
      error: 'Error cancelling booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

export const getVenueBookings = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { date, status, page = 1, limit = 10 } = req.query;

    const query: any = { venue: venueId };

    if (date) {
      const targetDate = normalizeDate(new Date(date as string));
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('section', 'name sport')
      .sort({ date: 1, startTime: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      data: bookings,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    console.error('Get Venue Bookings Error:', error.message);
    res.status(500).json({
      error: 'Error fetching bookings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};