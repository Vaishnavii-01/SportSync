import { Request, Response } from 'express';
import Booking from '../models/booking';
import mongoose, { FilterQuery } from 'mongoose';
import BlockedSettings from '../models/blockedSettings';
import Section from '../models/section';
import SlotSettings, { ISlotSettings } from '../models/slotSettings';
import Venue from '../models/venue';


// Helper function to normalize dates
const normalizeDate = (date: string | Date): Date => {
  const normalized = new Date(date);
  if (isNaN(normalized.getTime())) {
    throw new Error('Invalid date format');
  }
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

// Helper function to get day of week
const getDayOfWeek = (date: Date): string => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getUTCDay()];
};

// Helper function to calculate price for a slot
const calculateSlotPrice = (
  slotSetting: ISlotSettings,
  date: Date,
  dayOfWeek: string,
  duration: number
): number => {
  // Get base hourly price
  const hourlyPrice = slotSetting.customDayPrice?.find((cdp) => cdp.day === dayOfWeek)?.price 
    || slotSetting.price;
  
  // Calculate total price based on duration in hours
  const hours = duration / 60; // Convert duration from minutes to hours
  return hourlyPrice * hours;
};

// Helper function to check if time overlaps with blocked times
const isTimeBlocked = async (
  venueId: string,
  sectionId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<{ isBlocked: boolean; reason?: string }> => {
  try {
    const targetDate = normalizeDate(date);
    const dayOfWeek = getDayOfWeek(targetDate);

    // Parse time strings
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
      return { isBlocked: true, reason: 'Invalid time format' };
    }

    const slotStart = startHour * 60 + startMin;
    const slotEnd = endHour * 60 + endMin;

    // Find all active blocked settings that apply to this date
    const blockedSettings = await BlockedSettings.find({
      venue: venueId,
      section: sectionId,
      isActive: true,
      $or: [
        { days: { $size: 0 } }, // Applies to all days
        { days: dayOfWeek } // Applies to this specific day
      ],
      $and: [
        { 
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: targetDate } }
          ] 
        },
        { 
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: targetDate } }
          ] 
        }
      ]
    }).sort({ createdAt: -1 });

    for (const blocked of blockedSettings) {
      // If no specific timings, entire day is blocked
      if (!blocked.timings || blocked.timings.length === 0) {
        return { 
          isBlocked: true, 
          reason: blocked.reason || 'Entire day blocked' 
        };
      }

      // Check each blocked time range
      for (const timing of blocked.timings) {
        const [blockStartHour, blockStartMin] = timing.startTime.split(':').map(Number);
        const [blockEndHour, blockEndMin] = timing.endTime.split(':').map(Number);
        
        if (isNaN(blockStartHour) || isNaN(blockStartMin) || 
           isNaN(blockEndHour) || isNaN(blockEndMin)) {
          continue;
        }

        const blockStart = blockStartHour * 60 + blockStartMin;
        const blockEnd = blockEndHour * 60 + blockEndMin;

        // Check for time overlap
        if (!(slotEnd <= blockStart || slotStart >= blockEnd)) {
          return { 
            isBlocked: true, 
            reason: blocked.reason || 'Time slot conflicts with blocked period' 
          };
        }
      }
    }

    return { isBlocked: false };
  } catch (error) {
    console.error('Error in isTimeBlocked:', error);
    return { isBlocked: true, reason: 'Error checking availability' };
  }
};

// Helper to convert time string to Date object
const timeStringToDate = (date: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

// Get available slots for a section on a specific date
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const { date } = req.query;

    if (!sectionId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Section ID and date are required',
      });
    }

    if (!mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID',
      });
    }

    let targetDate: Date;
    try {
      targetDate = normalizeDate(date as string);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    const dayOfWeek = getDayOfWeek(targetDate);
    const today = normalizeDate(new Date());

    if (targetDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Date cannot be in the past',
      });
    }

    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const query: FilterQuery<ISlotSettings> = {
      section: sectionId,
      isActive: true,
      days: dayOfWeek,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: targetDate } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: targetDate } },
          ],
        },
        { maxAdvanceBooking: { $gte: diffDays } },
      ],
    };

    // Sort by createdAt descending to prioritize newer settings
    const slotSettings = await SlotSettings.find(query).sort({ createdAt: -1 });

    if (slotSettings.length === 0) {
      // Check if the date is beyond maxAdvanceBooking for any slot settings
      const allSettings = await SlotSettings.find({
        section: sectionId,
        isActive: true,
        days: dayOfWeek,
        $and: [
          {
            $or: [
              { startDate: { $exists: false } },
              { startDate: { $lte: targetDate } },
            ],
          },
          {
            $or: [
              { endDate: { $exists: false } },
              { endDate: { $gte: targetDate } },
            ],
          },
        ],
      }).sort({ createdAt: -1 });

      if (allSettings.length > 0) {
        const earliestBookingDate = new Date(targetDate);
        const maxAdvanceBookingDays = Math.max(...allSettings.map(s => s.maxAdvanceBooking));
        earliestBookingDate.setDate(targetDate.getDate() - maxAdvanceBookingDays);
        earliestBookingDate.setUTCHours(0, 0, 0, 0);
        return res.status(400).json({
          success: false,
          error: `Bookings for ${targetDate.toISOString().split('T')[0]} will be available from ${earliestBookingDate.toISOString().split('T')[0]}`,
        });
      }

      return res.status(404).json({
        success: false,
        error: 'No slot settings found for this section and date',
      });
    }

    const section = await Section.findById(sectionId).populate('venue', 'name');
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
      });
    }

    const availableSlots: any[] = [];
    let blockedReason: string | undefined;

    // Use the most recent slot setting
    const setting = slotSettings[0]; // Take the newest setting based on createdAt
    for (const timing of setting.timings) {
      const [startHour, startMin] = timing.startTime.split(':').map(Number);
      const [endHour, endMin] = timing.endTime.split(':').map(Number);
      if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
        continue; // Skip invalid timings
      }
      let currentMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      while (currentMinutes + setting.duration <= endMinutes) {
        const slotStartHour = Math.floor(currentMinutes / 60);
        const slotStartMin = currentMinutes % 60;
        const slotEndMinutes = currentMinutes + setting.duration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;

        const startTimeStr = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`;
        const endTimeStr = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMin.toString().padStart(2, '0')}`;

        const { isBlocked, reason } = await isTimeBlocked(
          setting.venue.toString(),
          sectionId,
          targetDate,
          startTimeStr,
          endTimeStr
        );

        if (!isBlocked) {
          const price = calculateSlotPrice(setting, targetDate, dayOfWeek, setting.duration);
          const slotId = `${sectionId}-${targetDate.toISOString().split('T')[0]}-${startTimeStr}`;

          availableSlots.push({
            slotId,
            sectionId,
            sectionName: section.name,
            venueName: (section as any).venue.name,
            date: targetDate.toISOString().split('T')[0],
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration: setting.duration,
            price,
            settingName: setting.name,
            isActive: setting.isActive,
            isAvailable: true,
          });
        } else if (reason && !blockedReason) {
          blockedReason = reason; // Store the first reason encountered for blocked slots
        }

        currentMinutes += setting.duration;
      }
    }

    const bookings = await Booking.find({
      section: sectionId,
      date: targetDate,
      status: { $ne: 'cancelled' },
    });

    const bookedSlots = new Set<string>();
    bookings.forEach((booking) => {
      const startTime = booking.startTime.toTimeString().slice(0, 5);
      const slotId = `${sectionId}-${targetDate.toISOString().split('T')[0]}-${startTime}`;
      bookedSlots.add(slotId);
    });

    const finalSlots = availableSlots.filter((slot) => !bookedSlots.has(slot.slotId));

    // Prepare response
    const responseData: any = {
      success: true,
      data: {
        sectionId,
        date: targetDate.toISOString().split('T')[0],
        dayOfWeek,
        totalSlots: finalSlots.length,
        slots: finalSlots,
      },
    };

    if (finalSlots.length === 0 && blockedReason) {
      responseData.data.blockedReason = blockedReason;
    }

    res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Get Available Slots Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching available slots',
      details: error.message,
    });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    // For now, we'll use a placeholder user ID since auth is not set up
    const userId = '686b6f9111860fae9410ef09';
    const { sectionId, date, startTime, endTime, notes } = req.body;

    // Validate required fields
    if (!sectionId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Section ID, date, start time, and end time are required',
      });
    }

    const bookingDate = normalizeDate(new Date(date));
    const today = normalizeDate(new Date());

    // Check if booking date is in the past
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Cannot book for past dates',
      });
    }

    // Get the section and venue
    const section = await Section.findById(sectionId).populate('venue');
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found',
      });
    }

    // Check if the slot is available
    const slotId = `${sectionId}-${bookingDate.toISOString().split('T')[0]}-${startTime}`;

    // Check existing bookings
    const existingBooking = await Booking.findOne({
      slotId,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        error: 'This slot is already booked',
      });
    }

    // Get slot settings to calculate price
    const dayOfWeek = getDayOfWeek(bookingDate);
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: bookingDate } },
        { endDate: { $exists: false } },
        { endDate: { $gte: bookingDate } },
      ],
      days: dayOfWeek,
    });

    if (!slotSettings) {
      return res.status(400).json({
        success: false,
        error: 'No available slot settings for this date and time',
      });
    }

    // Calculate duration in minutes
    const durationMinutes = (new Date(timeStringToDate(bookingDate, endTime)).getTime() -
                           new Date(timeStringToDate(bookingDate, startTime)).getTime()) / (1000 * 60);

    // Calculate price with all required parameters
    const price = calculateSlotPrice(slotSettings, bookingDate, dayOfWeek, durationMinutes);

    // Create the booking
    const booking = new Booking({
      user: userId,
      venue: section.venue._id,
      section: sectionId,
      date: bookingDate,
      startTime: timeStringToDate(bookingDate, startTime),
      endTime: timeStringToDate(bookingDate, endTime),
      duration: durationMinutes,
      price,
      status: 'confirmed',
      paymentStatus: 'completed',
      notes,
      slotId,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Create Booking Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating booking',
      details: error.message,
    });
  }
};


// Get user's bookings (placeholder version without auth)
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('venue', 'name')
      .populate('section', 'name sport')
      .sort({ date: -1, startTime: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching bookings',
      details: error.message,
    });
  }
};

// Cancel a booking (placeholder version without auth)
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error cancelling booking',
      details: error.message,
    });
  }
};