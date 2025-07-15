// src/controllers/blockedSettingsController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BlockedSettings from '../models/blockedSettings';
import Venue from '../models/venue';
import Section from '../models/section';

// Helper to normalize dates
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const createBlockedSetting = async (req: Request, res: Response) => {
  try {
    const { venueId, sectionId, startDate, endDate, days, timings, isRecurring, reason } = req.body;

    // Validate venue and section
    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ error: 'Venue not found' });

    const section = await Section.findOne({ _id: sectionId, venue: venueId });
    if (!section) return res.status(404).json({ error: 'Section not found or not belonging to venue' });

    // Create blocked setting
    const blockedSetting = new BlockedSettings({
      venue: venueId,
      section: sectionId,
      startDate: normalizeDate(new Date(startDate)),
      endDate: normalizeDate(new Date(endDate)),
      days: days || [],
      timings: timings || [],
      isRecurring: isRecurring || false,
      reason: reason || ''
    });

    await blockedSetting.save();

    res.status(201).json({
      message: 'Blocked setting created successfully',
      blockedSetting
    });
  } catch (error: any) {
    console.error('Create Blocked Setting Error:', error.message);
    res.status(500).json({ error: 'Error creating blocked setting', details: error.message });
  }
};

export const getBlockedSettings = async (req: Request, res: Response) => {
  try {
    const { venueId, sectionId } = req.params;
    
    const query: any = { venue: venueId };
    if (sectionId) query.section = sectionId;

    const blockedSettings = await BlockedSettings.find(query)
      .populate('venue', 'name')
      .populate('section', 'name sport');

    res.status(200).json({ blockedSettings });
  } catch (error: any) {
    console.error('Get Blocked Settings Error:', error.message);
    res.status(500).json({ error: 'Error fetching blocked settings', details: error.message });
  }
};

export const deleteBlockedSetting = async (req: Request, res: Response) => {
  try {
    const { blockedSettingId } = req.params;

    const blockedSetting = await BlockedSettings.findByIdAndDelete(blockedSettingId);
    if (!blockedSetting) return res.status(404).json({ error: 'Blocked setting not found' });

    res.status(200).json({ message: 'Blocked setting deleted successfully' });
  } catch (error: any) {
    console.error('Delete Blocked Setting Error:', error.message);
    res.status(500).json({ error: 'Error deleting blocked setting', details: error.message });
  }
};

// Helper function to check if a time is blocked
export const isTimeBlocked = async (venueId: string, sectionId: string, date: Date, startTime: string, endTime: string): Promise<boolean> => {
  const targetDate = normalizeDate(date);
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][targetDate.getDay()];

  // Convert times to minutes for comparison
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const slotStartMinutes = startHour * 60 + startMin;
  const slotEndMinutes = endHour * 60 + endMin;

  // Find all relevant blocked settings
  const blockedSettings = await BlockedSettings.find({
    venue: venueId,
    section: sectionId,
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate },
    $or: [
      { days: { $size: 0 } }, // Applies to all days
      { days: dayOfWeek } // Applies to specific day
    ]
  });

  // Check each blocked setting
  for (const setting of blockedSettings) {
    // If no specific timings, the whole day is blocked
    if (setting.timings.length === 0) return true;

    // Check each blocked time range
    for (const timing of setting.timings) {
      const [blockStartHour, blockStartMin] = timing.startTime.split(':').map(Number);
      const [blockEndHour, blockEndMin] = timing.endTime.split(':').map(Number);
      const blockStartMinutes = blockStartHour * 60 + blockStartMin;
      const blockEndMinutes = blockEndHour * 60 + blockEndMin;

      // Check for overlap
      if (slotStartMinutes < blockEndMinutes && slotEndMinutes > blockStartMinutes) {
        return true;
      }
    }
  }

  return false;
};