// src/controllers/slotController.ts
import { Request, Response } from 'express';
import Slot from '../models/slot';
import Section from '../models/section';
import Venue from '../models/venue';

// @desc Generate slots for a specific section and date
export const generateSlots = async (req: Request, res: Response) => {
  try {
    const { sectionId, date, slotDuration = 60 } = req.body; // slotDuration in minutes

    // Find the section and populate venue
    const section = await Section.findById(sectionId).populate('venue');
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const venue = section.venue as any;

    // Parse venue opening and closing times
    const [openHour, openMinute] = venue.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = venue.closingTime.split(':').map(Number);

    // Create date objects for the specific date
    const targetDate = new Date(date);
    const startTime = new Date(targetDate);
    startTime.setHours(openHour, openMinute, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(closeHour, closeMinute, 0, 0);

    // Check if slots already exist for this date and section
    const existingSlots = await Slot.find({
      section: sectionId,
      date: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingSlots.length > 0) {
      return res.status(400).json({ 
        error: 'Slots already exist for this date and section' 
      });
    }

    // Generate slots
    const slots = [];
    const current = new Date(startTime);

    while (current < endTime) {
      const slotEndTime = new Date(current.getTime() + slotDuration * 60000);
      
      if (slotEndTime > endTime) break;

      const slot = new Slot({
        venue: venue._id,
        section: sectionId,
        date: new Date(date),
        startTime: new Date(current),
        endTime: new Date(slotEndTime),
        price: section.basePrice,
        sport: section.sport,
        duration: slotDuration,
        isBooked: false,
      });

      slots.push(slot);
      current.setTime(current.getTime() + slotDuration * 60000);
    }

    // Save all slots
    await Slot.insertMany(slots);

    res.status(201).json({
      message: 'Slots generated successfully',
      count: slots.length,
      slots: slots
    });

  } catch (error: any) {
    console.error('Generate Slots Error:', error.message);
    res.status(500).json({ error: 'Error generating slots', details: error.message });
  }
};

// @desc Get available slots for a section on a specific date
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { sectionId, date } = req.query;

    if (!sectionId || !date) {
      return res.status(400).json({ 
        error: 'Section ID and date are required' 
      });
    }

    // Parse the date
    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Find all slots for the section on the specified date
    const slots = await Slot.find({
      section: sectionId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).populate('section', 'name sport')
      .populate('venue', 'name')
      .sort({ startTime: 1 });

    if (slots.length === 0) {
      return res.status(404).json({ 
        message: 'No slots found for this date. Generate slots first.' 
      });
    }

    // Separate available and booked slots
    const availableSlots = slots.filter(slot => !slot.isBooked);
    const bookedSlots = slots.filter(slot => slot.isBooked);

    res.status(200).json({
      date: date,
      sectionId: sectionId,
      totalSlots: slots.length,
      availableSlots: availableSlots,
      bookedSlots: bookedSlots,
      availableCount: availableSlots.length,
      bookedCount: bookedSlots.length
    });

  } catch (error: any) {
    console.error('Get Available Slots Error:', error.message);
    res.status(500).json({ error: 'Error fetching slots', details: error.message });
  }
};

// @desc Get slots for a specific venue (all sections)
export const getVenueSlots = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { date, sport } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Parse the date
    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Build query
    const query: any = {
      venue: venueId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    };

    if (sport) {
      query.sport = sport;
    }

    // Find all slots for the venue on the specified date
    const slots = await Slot.find(query)
      .populate('section', 'name sport capacity')
      .populate('venue', 'name')
      .sort({ sport: 1, startTime: 1 });

    // Group slots by sport and section
    const groupedSlots = slots.reduce((acc: any, slot) => {
      const sport = slot.sport;
      const sectionName = (slot.section as any).name;
      
      if (!acc[sport]) {
        acc[sport] = {};
      }
      
      if (!acc[sport][sectionName]) {
        acc[sport][sectionName] = {
          sectionId: slot.section,
          available: [],
          booked: []
        };
      }
      
      if (slot.isBooked) {
        acc[sport][sectionName].booked.push(slot);
      } else {
        acc[sport][sectionName].available.push(slot);
      }
      
      return acc;
    }, {});

    res.status(200).json({
      venueId: venueId,
      date: date,
      sport: sport || 'all',
      slots: groupedSlots
    });

  } catch (error: any) {
    console.error('Get Venue Slots Error:', error.message);
    res.status(500).json({ error: 'Error fetching venue slots', details: error.message });
  }
};

// @desc Book a slot
export const bookSlot = async (req: Request, res: Response) => {
  try {
    const { slotId, userId } = req.body;

    if (!slotId || !userId) {
      return res.status(400).json({ error: 'Slot ID and User ID are required' });
    }

    // Find the slot
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Check if slot is already booked
    if (slot.isBooked) {
      return res.status(400).json({ error: 'Slot is already booked' });
    }

    // Check if the slot is in the future
    if (slot.startTime <= new Date()) {
      return res.status(400).json({ error: 'Cannot book past slots' });
    }

    // Book the slot
    slot.isBooked = true;
    slot.bookedBy = userId;
    await slot.save();

    res.status(200).json({
      message: 'Slot booked successfully',
      slot: slot
    });

  } catch (error: any) {
    console.error('Book Slot Error:', error.message);
    res.status(500).json({ error: 'Error booking slot', details: error.message });
  }
};

// @desc Cancel a booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;

    // Find the slot
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Check if slot is booked
    if (!slot.isBooked) {
      return res.status(400).json({ error: 'Slot is not booked' });
    }

    // Cancel the booking
    slot.isBooked = false;
    slot.bookedBy = undefined;
    await slot.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      slot: slot
    });

  } catch (error: any) {
    console.error('Cancel Booking Error:', error.message);
    res.status(500).json({ error: 'Error cancelling booking', details: error.message });
  }
};