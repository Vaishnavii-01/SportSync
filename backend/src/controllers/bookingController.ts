import { Request, Response } from 'express';
import Booking from '../models/booking';
import SlotSettings from '../models/slotSettings';
import BlockedSettings from '../models/blockedSettings';
import Section from '../models/section';
import Venue from '../models/venue';

// Helper function to normalize dates
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Helper function to get day of week
const getDayOfWeek = (date: Date): string => {
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
};

// Helper function to check if time overlaps with blocked times
const isTimeBlocked = async (
  venueId: string,
  sectionId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  const targetDate = normalizeDate(date);
  const dayOfWeek = getDayOfWeek(targetDate);

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const slotStart = startHour * 60 + startMin;
  const slotEnd = endHour * 60 + endMin;

  const blockedSettings = await BlockedSettings.find({
    venue: venueId,
    section: sectionId,
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: targetDate } },
      { endDate: { $exists: false } },
      { endDate: { $gte: targetDate } },
      { days: { $size: 0 } },
      { days: dayOfWeek },
    ],
  });

  for (const blocked of blockedSettings) {
    // If no specific timings, entire day is blocked
    if (!blocked.timings || blocked.timings.length === 0) {
      return true;
    }

    // Check each blocked time range
    for (const timing of blocked.timings) {
      const [blockStartHour, blockStartMin] = timing.startTime.split(':').map(Number);
      const [blockEndHour, blockEndMin] = timing.endTime.split(':').map(Number);
      const blockStart = blockStartHour * 60 + blockStartMin;
      const blockEnd = blockEndHour * 60 + blockEndMin;

      // Check for overlap
      if (slotStart < blockEnd && slotEnd > blockStart) {
        return true;
      }
    }
  }

  return false;
};

// Helper function to calculate price for a slot
const calculateSlotPrice = (
  slotSetting: any,
  date: Date,
  dayOfWeek: string
): number => {
  const targetDate = normalizeDate(date);

  // Check day of week price
  const dayPrice = slotSetting.customDayPrice?.find((cdp: any) => cdp.day === dayOfWeek);
  if (dayPrice) {
    return dayPrice.price;
  }

  // Return base price
  return slotSetting.price;
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
    const { sectionId, date } = req.query;

    if (!sectionId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Section ID and date are required',
      });
    }

    const targetDate = normalizeDate(new Date(date as string));
    const dayOfWeek = getDayOfWeek(targetDate);
    const today = normalizeDate(new Date());

    // Get all active slot settings for this section that apply to the target date
    const slotSettings = await SlotSettings.find({
      section: sectionId as string,
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: targetDate } },
        { endDate: { $exists: false } },
        { endDate: { $gte: targetDate } },
      ],
      days: dayOfWeek,
    });

    if (slotSettings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No slot settings found for this section and date',
      });
    }

    const availableSlots = [];
    const section = await Section.findById(sectionId).populate('venue', 'name');

    for (const setting of slotSettings) {
      // Check advance booking limit
      const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > setting.maxAdvanceBooking) {
        continue; // Skip this setting
      }

      // Generate slots for each timing range
      for (const timing of setting.timings) {
        const [startHour, startMin] = timing.startTime.split(':').map(Number);
        const [endHour, endMin] = timing.endTime.split(':').map(Number);

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

          // Check if slot is blocked
          const isBlocked = await isTimeBlocked(
            setting.venue.toString(),
            sectionId as string,
            targetDate,
            startTimeStr,
            endTimeStr
          );

          if (!isBlocked) {
            const price = calculateSlotPrice(setting, targetDate, dayOfWeek);
            const slotId = `${sectionId}-${targetDate.toISOString().split('T')[0]}-${startTimeStr}`;

            availableSlots.push({
              slotId,
              sectionId,
              sectionName: section?.name,
              venueName: (section as any)?.venue?.name,
              date: targetDate.toISOString().split('T')[0],
              startTime: startTimeStr,
              endTime: endTimeStr,
              duration: setting.duration,
              price,
              settingName: setting.name,
              isAvailable: true,
            });
          }

          currentMinutes += setting.duration;
        }
      }
    }

    // Check existing bookings
    const bookings = await Booking.find({
      section: sectionId,
      date: targetDate,
      status: { $ne: 'cancelled' },
    });

    const bookedSlots = new Set();
    bookings.forEach((booking) => {
      const startTime = booking.startTime.toTimeString().slice(0, 5);
      const slotId = `${sectionId}-${targetDate.toISOString().split('T')[0]}-${startTime}`;
      bookedSlots.add(slotId);
    });

    // Filter out booked slots
    const finalSlots = availableSlots.filter((slot) => !bookedSlots.has(slot.slotId));

    res.status(200).json({
      success: true,
      data: {
        sectionId,
        date: targetDate.toISOString().split('T')[0],
        dayOfWeek,
        totalSlots: finalSlots.length,
        slots: finalSlots,
      },
    });
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
    const {
      user,
      section,
      venue,
      slotId,
      date,
      startTime,
      endTime,
      duration,
      price,
      notes
    } = req.body;

    // Validate required fields
    if (!duration || !price || !venue || !section || !user) {
      return res.status(400).json({
        success: false,
        error: "Duration, price, venue, section, and user are required fields"
      });
    }

    // Check if the slot is available
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

    const booking = new Booking({
      user,
      venue,
      section,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      price,
      status: 'confirmed',
      paymentStatus: 'completed',
      notes: notes || '',
      slotId
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: savedBooking,
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