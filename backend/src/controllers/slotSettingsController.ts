// src/controllers/slotSettingsController.ts
import { Request, Response } from 'express';
import SlotSettings from '../models/slotSettings';
import BlockedSettings from '../models/blockedSettings';
import Booking from '../models/booking';
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
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate },
    $or: [
      { days: { $size: 0 } }, // No specific days = all days
      { days: dayOfWeek }
    ]
  });

  for (const blocked of blockedSettings) {
    // If no specific timings, entire day is blocked
    if (blocked.timings.length === 0) {
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
  
  // Priority: Specific Date > Date Range > Day of Week > Base Price
  
  // Check specific date price
  const specificDatePrice = slotSetting.customDatePrice?.find((cdp: any) => 
    normalizeDate(cdp.date).getTime() === targetDate.getTime()
  );
  if (specificDatePrice) {
    return specificDatePrice.price;
  }

  // Check date range price
  const dateRangePrice = slotSetting.customDateRangePrice?.find((cdrp: any) => 
    targetDate >= normalizeDate(cdrp.startDate) && 
    targetDate <= normalizeDate(cdrp.endDate)
  );
  if (dateRangePrice) {
    return dateRangePrice.price;
  }

  // Check day of week price
  const dayPrice = slotSetting.customDayPrice?.find((cdp: any) => cdp.day === dayOfWeek);
  if (dayPrice) {
    return dayPrice.price;
  }

  // Return base price
  return slotSetting.price;
};

// Create slot settings
export const createSlotSettings = async (req: Request, res: Response) => {
  try {
    const {
      venueId,
      sectionId,
      name,
      startDate,
      endDate,
      days,
      timings,
      duration,
      price,
      customDayPrice,
      customDatePrice,
      customDateRangePrice,
      maxAdvanceBooking,
      priority
    } = req.body;

    // Validate venue and section
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const section = await Section.findOne({ _id: sectionId, venue: venueId });
    if (!section) {
      return res.status(404).json({ error: 'Section not found or not belonging to venue' });
    }

    const slotSettings = new SlotSettings({
      venue: venueId,
      section: sectionId,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      timings,
      duration,
      price,
      customDayPrice: customDayPrice || [],
      customDatePrice: customDatePrice || [],
      customDateRangePrice: customDateRangePrice || [],
      maxAdvanceBooking,
      priority: priority || 1
    });

    await slotSettings.save();

    res.status(201).json({
      success: true,
      message: 'Slot settings created successfully',
      data: slotSettings
    });
  } catch (error: any) {
    console.error('Create Slot Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating slot settings', 
      details: error.message 
    });
  }
};

// Get available slots for a section on a specific date
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { sectionId, date } = req.query;

    if (!sectionId || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Section ID and date are required' 
      });
    }

    const targetDate = normalizeDate(new Date(date as string));
    const dayOfWeek = getDayOfWeek(targetDate);
    const today = normalizeDate(new Date());

    // Get all active slot settings for this section that apply to the target date
    const slotSettings = await SlotSettings.find({
      section: sectionId,
      isActive: true,
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
      days: dayOfWeek
    }).sort({ priority: -1 }); // Higher priority first

    if (slotSettings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No slot settings found for this section and date'
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
              isAvailable: true
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
      status: { $ne: 'cancelled' }
    });

    const bookedSlots = new Set();
    bookings.forEach(booking => {
      const startTime = booking.startTime.toTimeString().slice(0, 5);
      const slotId = `${sectionId}-${targetDate.toISOString().split('T')[0]}-${startTime}`;
      bookedSlots.add(slotId);
    });

    // Filter out booked slots
    const finalSlots = availableSlots.filter(slot => !bookedSlots.has(slot.slotId));

    res.status(200).json({
      success: true,
      data: {
        sectionId,
        date: targetDate.toISOString().split('T')[0],
        dayOfWeek,
        totalSlots: finalSlots.length,
        slots: finalSlots
      }
    });
  } catch (error: any) {
    console.error('Get Available Slots Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching available slots', 
      details: error.message 
    });
  }
};

// Get slot settings for a section
export const getSlotSettings = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const slotSettings = await SlotSettings.find({
      section: sectionId,
      isActive: true
    }).populate('venue', 'name')
      .populate('section', 'name sport')
      .sort({ priority: -1 });

    res.status(200).json({
      success: true,
      data: slotSettings
    });
  } catch (error: any) {
    console.error('Get Slot Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching slot settings', 
      details: error.message 
    });
  }
};

// Update slot settings
export const updateSlotSettings = async (req: Request, res: Response) => {
  try {
    const { slotSettingsId } = req.params;
    const updateData = req.body;

    const slotSettings = await SlotSettings.findByIdAndUpdate(
      slotSettingsId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!slotSettings) {
      return res.status(404).json({ 
        success: false, 
        error: 'Slot settings not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slot settings updated successfully',
      data: slotSettings
    });
  } catch (error: any) {
    console.error('Update Slot Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error updating slot settings', 
      details: error.message 
    });
  }
};

// Delete slot settings
export const deleteSlotSettings = async (req: Request, res: Response) => {
  try {
    const { slotSettingsId } = req.params;

    const slotSettings = await SlotSettings.findByIdAndUpdate(
      slotSettingsId,
      { isActive: false },
      { new: true }
    );

    if (!slotSettings) {
      return res.status(404).json({ 
        success: false, 
        error: 'Slot settings not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slot settings deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete Slot Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deleting slot settings', 
      details: error.message 
    });
  }
};