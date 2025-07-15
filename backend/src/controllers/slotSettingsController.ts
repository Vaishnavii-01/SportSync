import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SlotSettings from '../models/slotSettings';
import Section from '../models/section';
import Venue from '../models/venue';
import Booking from '../models/booking';
import { isTimeBlocked } from './blockedSettingsController';

// Helper function to normalize dates (ignore time component)
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

export const createSlotSettings = async (req: Request, res: Response) => {
  try {
    const {
      venueId,
      sectionId,
      startDate,
      endDate,
      days,
      startTime,
      endTime,
      blockedTimes,
      blockedDays,
      duration,
      bookingAllowed,
      basePrice,
      customPrices,
      customDatePrices
    } = req.body;

    // Validate venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Validate section exists and belongs to venue
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (section.venue.toString() !== venueId) {
      return res.status(400).json({ error: 'Section does not belong to this venue' });
    }

    // Use section's basePrice as fallback if not provided
    const finalBasePrice = basePrice !== undefined ? basePrice : section.basePrice;

    // Create new settings
    const slotSettings = new SlotSettings({
      venue: venueId,
      section: sectionId,
      startDate: startDate || new Date('2025-07-01'),
      endDate: endDate || new Date('2025-12-31'),
      days: days || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      startTime: startTime || '09:00',
      endTime: endTime || '21:00',
      blockedTimes: blockedTimes || [],
      blockedDays: blockedDays || [],
      duration: duration || 60,
      bookingAllowed: bookingAllowed || 30,
      basePrice: finalBasePrice,
      customPrices: customPrices || [],
      customDatePrices: customDatePrices || [],
      isActive: true
    });

    await slotSettings.save();

    res.status(201).json({
      message: 'Slot settings created successfully',
      slotSettings
    });
  } catch (error: any) {
    console.error('Create Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error creating slot settings', details: error.message });
  }
};

export const updateSlotSettings = async (req: Request, res: Response) => {
  try {
    const { slotSettingsId } = req.params;
    const {
      startDate,
      endDate,
      days,
      startTime,
      endTime,
      blockedTimes,
      blockedDays,
      duration,
      bookingAllowed,
      basePrice,
      customPrices,
      customDatePrices
    } = req.body;

    // Validate section for basePrice if provided
    if (basePrice !== undefined) {
      const section = await Section.findById(req.body.sectionId);
      if (!section) {
        return res.status(404).json({ error: 'Section not found' });
      }
    }

    const slotSettings = await SlotSettings.findByIdAndUpdate(
      slotSettingsId,
      {
        startDate,
        endDate,
        days,
        startTime,
        endTime,
        blockedTimes: blockedTimes || [],
        blockedDays: blockedDays || [],
        duration,
        bookingAllowed,
        basePrice: basePrice !== undefined ? basePrice : (await Section.findById(req.body.sectionId))?.basePrice,
        customPrices: customPrices || [],
        customDatePrices: customDatePrices || [],
        isActive: true
      },
      { new: true, runValidators: true }
    );

    if (!slotSettings) {
      return res.status(404).json({ error: 'Slot settings not found' });
    }

    res.status(200).json({
      message: 'Slot settings updated successfully',
      slotSettings
    });
  } catch (error: any) {
    console.error('Update Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error updating slot settings', details: error.message });
  }
};

export const getSlotSettings = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const slotSettings = await SlotSettings.find({ 
      section: sectionId, 
      isActive: true 
    }).populate('venue', 'name openingTime closingTime')
      .populate('section', 'name sport basePrice');

    if (!slotSettings || slotSettings.length === 0) {
      return res.status(404).json({ error: 'No slot settings found for this section' });
    }

    res.status(200).json({
      slotSettings
    });
  } catch (error: any) {
    console.error('Get Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error fetching slot settings', details: error.message });
  }
};

export const getVenueSlotSettings = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;

    const slotSettings = await SlotSettings.find({ 
      venue: venueId, 
      isActive: true 
    }).populate('section', 'name sport basePrice');

    res.status(200).json({
      venueId,
      slotSettings
    });
  } catch (error: any) {
    console.error('Get Venue Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error fetching venue slot settings', details: error.message });
  }
};

export const deleteSlotSettings = async (req: Request, res: Response) => {
  try {
    const { slotSettingsId } = req.params;

    const slotSettings = await SlotSettings.findByIdAndDelete(slotSettingsId);

    if (!slotSettings) {
      return res.status(404).json({ error: 'Slot settings not found' });
    }

    res.status(200).json({
      message: 'Slot settings deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error deleting slot settings', details: error.message });
  }
};

// Updated generateAvailableSlots function in slotSettingsController.ts
export const generateAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { sectionId, date } = req.query;
    if (!sectionId || !date) {
      return res.status(400).json({ error: 'Section ID and date are required' });
    }

    // Fetch slot settings
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true
    }).sort({ createdAt: -1 }).populate('section', 'name sport basePrice');

    if (!slotSettings) {
      return res.status(404).json({ error: 'No active slot settings found' });
    }

    const targetDate = normalizeDate(new Date(date as string));
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][targetDate.getDay()];

    // Validate date range
    if (targetDate < normalizeDate(slotSettings.startDate) || targetDate > normalizeDate(slotSettings.endDate)) {
      return res.status(400).json({ error: 'Date outside valid range' });
    }

    // Validate day of week
    if (!slotSettings.days.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'No availability on this day' });
    }

    // Check booking advance constraints
    const today = normalizeDate(new Date());
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > slotSettings.bookingAllowed) {
      return res.status(400).json({ error: 'Booking not allowed this far in advance' });
    }
    if (diffDays < 0) {
      return res.status(400).json({ error: 'Cannot book slots for past dates' });
    }

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
          // Calculate price with precedence:
          // 1. customDatePrice (specific date)
          // 2. customDateRangePrice (date range)
          // 3. customDayPrice (day of week)
          // 4. base price
          let price = slotSettings.price;

          // Check custom date price
          const customDatePrice = slotSettings.customDatePrice?.find(cdp => 
            normalizeDate(cdp.date).getTime() === targetDate.getTime()
          );
          if (customDatePrice) {
            price = customDatePrice.price;
          } else {
            // Check custom date range price
            const customRangePrice = slotSettings.customDateRangePrice?.find(cdrp => 
              targetDate >= normalizeDate(cdrp.startDate) && 
              targetDate <= normalizeDate(cdrp.endDate)
            );
            if (customRangePrice) {
              price = customRangePrice.price;
            } else {
              // Check custom day price
              const customDayPrice = slotSettings.customDayPrice?.find(cdp => cdp.day === dayOfWeek);
              if (customDayPrice) {
                price = customDayPrice.price;
              }
            }
          }

          availableSlots.push({
            id: `${sectionId}-${current.getTime()}`,
            sectionId,
            sectionName: section.name,
            sport: section.sport,
            date: targetDate.toISOString().split('T')[0],
            startTime: startTimeStr,
            endTime: endTimeStr,
            fullStartTime: new Date(current),
            fullEndTime: new Date(slotEndTime),
            duration: slotSettings.duration,
            price: price,
            isAvailable: true
          });
        }

        current = new Date(slotEndTime);
      }
    }

    // Check existing bookings
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      section: sectionId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const bookingMap = new Map();
    bookings.forEach(booking => {
      const key = `${booking.startTime.getTime()}-${booking.endTime.getTime()}`;
      bookingMap.set(key, booking);
    });

    const slotsWithStatus = availableSlots.map(slot => {
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
    console.error('Generate Available Slots Error:', error.message);
    res.status(500).json({ error: 'Error generating available slots', details: error.message });
  }
};