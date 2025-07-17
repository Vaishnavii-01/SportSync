import { Request, Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import SlotSettings, { ISlotSettings } from '../models/slotSettings';
import Booking from '../models/booking';
import Section from '../models/section';
import BlockedSettings from '../models/blockedSettings';
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
  const targetDate = normalizeDate(date);
  const dayOfWeek = getDayOfWeek(targetDate);

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
    throw new Error('Invalid time format');
  }
  const slotStart = startHour * 60 + startMin;
  const slotEnd = endHour * 60 + endMin;

  const query: FilterQuery<any> = {
    venue: venueId,
    section: sectionId,
    isActive: true,
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
      {
        $or: [
          { days: { $size: 0 } },
          { days: dayOfWeek },
        ],
      },
    ],
  };

  // Sort by createdAt descending to prioritize newer settings
  const blockedSettings = await BlockedSettings.find(query).sort({ createdAt: -1 });

  for (const blocked of blockedSettings) {
    if (!blocked.timings || blocked.timings.length === 0) {
      return { isBlocked: true, reason: blocked.reason || 'Entire day blocked' }; // Entire day is blocked
    }

    for (const timing of blocked.timings) {
      const [blockStartHour, blockStartMin] = timing.startTime.split(':').map(Number);
      const [blockEndHour, blockEndMin] = timing.endTime.split(':').map(Number);
      if (isNaN(blockStartHour) || isNaN(blockStartMin) || isNaN(blockEndHour) || isNaN(blockEndMin)) {
        continue; // Skip invalid timings
      }
      const blockStart = blockStartHour * 60 + blockStartMin;
      const blockEnd = blockEndHour * 60 + blockEndMin;

      if (slotStart < blockEnd && slotEnd > blockStart) {
        return { isBlocked: true, reason: blocked.reason || 'Time slot blocked' }; // Slot overlaps with blocked time
      }
    }
    // If a newer setting is found, stop checking older ones
    break;
  }

  return { isBlocked: false };
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
      maxAdvanceBooking,
    } = req.body;

    // Validate required fields
    if (!venueId || !sectionId || !name || !timings || !duration || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: venueId, sectionId, name, timings, duration, and price are required',
      });
    }

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(venueId) || !mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid venueId or sectionId',
      });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }

    const section = await Section.findOne({ _id: sectionId, venue: venueId });
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Section not found or not belonging to venue',
      });
    }

    // Validate timings format
    if (!Array.isArray(timings) || timings.some((t: any) => !t.startTime || !t.endTime)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timings format',
      });
    }

    const slotSettings = new SlotSettings({
      venue: venueId,
      section: sectionId,
      name,
      startDate: startDate ? normalizeDate(startDate) : undefined,
      endDate: endDate ? normalizeDate(endDate) : undefined,
      days: days || [],
      timings,
      duration,
      price, // This now represents price per hour
      customDayPrice: customDayPrice || [],
      maxAdvanceBooking: maxAdvanceBooking || 30,
    });

    await slotSettings.save();

    res.status(201).json({
      success: true,
      message: 'Slot settings created successfully',
      data: slotSettings,
    });
  } catch (error: any) {
    console.error('Create Slot Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating slot settings',
      details: error.message,
    });
  }
};

// Get available slots for a section on a specific date

// Get slot settings
export const getSlotSettings = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    if (!mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID',
      });
    }

    const slotSettings = await SlotSettings.find({
      section: sectionId,
      isActive: true,
    })
      .populate('venue', 'name')
      .populate('section', 'name sport');

    res.status(200).json({
      success: true,
      data: slotSettings,
    });
  } catch (error: any) {
    console.error('Get Slot Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching slot settings',
      details: error.message,
    });
  }
};

// Update slot settings
export const updateSlotSettings = async (req: Request, res: Response) => {
  try {
    const { slotSettingsId } = req.params;
    const updateData = req.body;

    if (!mongoose.isValidObjectId(slotSettingsId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid slot settings ID',
      });
    }

    // Normalize dates in updateData if present
    if (updateData.startDate) {
      updateData.startDate = normalizeDate(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = normalizeDate(updateData.endDate);
    }

    const slotSettings = await SlotSettings.findByIdAndUpdate(
      slotSettingsId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!slotSettings) {
      return res.status(404).json({
        success: false,
        error: 'Slot settings not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slot settings updated successfully',
      data: slotSettings,
    });
  } catch (error: any) {
    console.error('Update Slot Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating slot settings',
      details: error.message,
    });
  }
};

// Delete slot settings
export const deleteSlotSettings = async (req: Request, res: Response) => {
  try {
    const { slotSettingsId } = req.params;

    if (!mongoose.isValidObjectId(slotSettingsId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid slot settings ID',
      });
    }

    const slotSettings = await SlotSettings.findByIdAndUpdate(
      slotSettingsId,
      { isActive: false },
      { new: true }
    );

    if (!slotSettings) {
      return res.status(404).json({
        success: false,
        error: 'Slot settings not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Slot settings deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete Slot Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting slot settings',
      details: error.message,
    });
  }
};