// src/controllers/slotSettingsController.ts
import { Request, Response } from 'express';
import SlotSettings from '../models/slotSettings';
import Section from '../models/section';
import Venue from '../models/venue';

// @desc Create or update slot settings for a section
export const createOrUpdateSlotSettings = async (req: Request, res: Response) => {
  try {
    const {
      venueId,
      sectionId,
      startDate,
      endDate,
      days,
      timings,
      duration,
      bookingAllowed
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

    // Check if slot settings already exist for this section
    let slotSettings = await SlotSettings.findOne({ 
      venue: venueId, 
      section: sectionId 
    });

    if (slotSettings) {
      // Update existing settings
      slotSettings.startDate = startDate || null;
      slotSettings.endDate = endDate || null;
      slotSettings.days = days || [];
      slotSettings.timings = timings;
      slotSettings.duration = duration;
      slotSettings.bookingAllowed = bookingAllowed;
      slotSettings.isActive = true;
      
      await slotSettings.save();
      
      res.status(200).json({
        message: 'Slot settings updated successfully',
        slotSettings: slotSettings
      });
    } else {
      // Create new settings
      slotSettings = new SlotSettings({
        venue: venueId,
        section: sectionId,
        startDate: startDate || null,
        endDate: endDate || null,
        days: days || [],
        timings,
        duration,
        bookingAllowed,
        isActive: true
      });

      await slotSettings.save();

      res.status(201).json({
        message: 'Slot settings created successfully',
        slotSettings: slotSettings
      });
    }

  } catch (error: any) {
    console.error('Create/Update Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error managing slot settings', details: error.message });
  }
};

// @desc Get slot settings for a section
export const getSlotSettings = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const slotSettings = await SlotSettings.findOne({ 
      section: sectionId, 
      isActive: true 
    }).populate('venue', 'name openingTime closingTime')
      .populate('section', 'name sport basePrice');

    if (!slotSettings) {
      return res.status(404).json({ error: 'No slot settings found for this section' });
    }

    res.status(200).json({
      slotSettings: slotSettings
    });

  } catch (error: any) {
    console.error('Get Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error fetching slot settings', details: error.message });
  }
};

// @desc Get all slot settings for a venue
export const getVenueSlotSettings = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;

    const slotSettings = await SlotSettings.find({ 
      venue: venueId, 
      isActive: true 
    }).populate('section', 'name sport basePrice');

    res.status(200).json({
      venueId: venueId,
      slotSettings: slotSettings
    });

  } catch (error: any) {
    console.error('Get Venue Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error fetching venue slot settings', details: error.message });
  }
};

// @desc Delete slot settings
export const deleteSlotSettings = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const slotSettings = await SlotSettings.findOneAndUpdate(
      { section: sectionId },
      { isActive: false },
      { new: true }
    );

    if (!slotSettings) {
      return res.status(404).json({ error: 'Slot settings not found' });
    }

    res.status(200).json({
      message: 'Slot settings deactivated successfully'
    });

  } catch (error: any) {
    console.error('Delete Slot Settings Error:', error.message);
    res.status(500).json({ error: 'Error deleting slot settings', details: error.message });
  }
};

// @desc Generate available slots for a specific date based on slot settings
export const generateAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { sectionId, date } = req.query;

    if (!sectionId || !date) {
      return res.status(400).json({ error: 'Section ID and date are required' });
    }

    // Get slot settings for the section
    const slotSettings = await SlotSettings.findOne({
      section: sectionId,
      isActive: true
    }).populate('section', 'name sport basePrice');

    if (!slotSettings) {
      return res.status(404).json({ error: 'No slot settings found for this section' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][targetDate.getDay()];

    // Check if the requested date is within the allowed range
    if (slotSettings.startDate && targetDate < slotSettings.startDate) {
      return res.status(400).json({ error: 'Date is before the start date' });
    }

    if (slotSettings.endDate && targetDate > slotSettings.endDate) {
      return res.status(400).json({ error: 'Date is after the end date' });
    }

    // Check if the day is allowed
    if (slotSettings.days.length > 0 && !slotSettings.days.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'Slots are not available on this day' });
    }

    // Check if booking is allowed for this date
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > slotSettings.bookingAllowed) {
      return res.status(400).json({ error: 'Booking is not allowed this far in advance' });
    }

    if (diffDays < 0) {
      return res.status(400).json({ error: 'Cannot book slots for past dates' });
    }

    // Generate slots for each timing period
    const availableSlots = [];
    const section = slotSettings.section as any;

    for (const timing of slotSettings.timings) {
      const [startHour, startMin] = timing.startTime.split(':').map(Number);
      const [endHour, endMin] = timing.endTime.split(':').map(Number);

      const startTime = new Date(targetDate);
      startTime.setHours(startHour, startMin, 0, 0);

      const endTime = new Date(targetDate);
      endTime.setHours(endHour, endMin, 0, 0);

      // Generate slots within this timing period
      const current = new Date(startTime);
      while (current < endTime) {
        const slotEndTime = new Date(current.getTime() + slotSettings.duration * 60000);
        
        if (slotEndTime > endTime) break;

        const slot = {
          id: `${sectionId}-${current.getTime()}`, // Virtual ID for the slot
          sectionId: sectionId,
          sectionName: section.name,
          sport: section.sport,
          date: targetDate.toISOString().split('T')[0],
          startTime: current.toTimeString().slice(0, 5), // HH:MM format
          endTime: slotEndTime.toTimeString().slice(0, 5), // HH:MM format
          fullStartTime: new Date(current),
          fullEndTime: new Date(slotEndTime),
          duration: slotSettings.duration,
          price: section.basePrice,
          isAvailable: true // We'll check bookings separately
        };

        availableSlots.push(slot);
        current.setTime(current.getTime() + slotSettings.duration * 60000);
      }
    }

    res.status(200).json({
      sectionId: sectionId,
      date: date,
      dayOfWeek: dayOfWeek,
      totalSlots: availableSlots.length,
      slots: availableSlots,
      slotSettings: {
        duration: slotSettings.duration,
        bookingAllowed: slotSettings.bookingAllowed,
        timings: slotSettings.timings
      }
    });

  } catch (error: any) {
    console.error('Generate Available Slots Error:', error.message);
    res.status(500).json({ error: 'Error generating available slots', details: error.message });
  }
};