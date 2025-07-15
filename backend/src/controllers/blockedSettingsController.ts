import { Request, Response } from 'express';
import BlockedSettings from '../models/blockedSettings';
import Venue from '../models/venue';
import Section from '../models/section';

// Helper to normalize dates
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Create blocked settings
export const createBlockedSettings = async (req: Request, res: Response) => {
  try {
    const {
      venueId,
      sectionId,
      name,
      startDate,
      endDate,
      days,
      timings,
      reason
    } = req.body;

    // Validate venue and section
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }

    const section = await Section.findOne({ _id: sectionId, venue: venueId });
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        error: 'Section not found or not belonging to venue' 
      });
    }

    const blockedSettings = new BlockedSettings({
      venue: venueId,
      section: sectionId,
      name,
      startDate: startDate ? normalizeDate(new Date(startDate)) : undefined,
      endDate: endDate ? normalizeDate(new Date(endDate)) : undefined,
      days: days || [],
      timings: timings || [],
      reason: reason || '',
      isActive: true
    });

    await blockedSettings.save();

    res.status(201).json({
      success: true,
      message: 'Blocked settings created successfully',
      data: blockedSettings
    });
  } catch (error: any) {
    console.error('Create Blocked Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating blocked settings', 
      details: error.message 
    });
  }
};

// Get blocked settings for a section
export const getBlockedSettings = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const blockedSettings = await BlockedSettings.find({
      section: sectionId,
      isActive: true
    }).populate('venue', 'name')
      .populate('section', 'name sport')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blockedSettings
    });
  } catch (error: any) {
    console.error('Get Blocked Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching blocked settings', 
      details: error.message 
    });
  }
};

// Update blocked settings
export const updateBlockedSettings = async (req: Request, res: Response) => {
  try {
    const { blockedSettingsId } = req.params;
    const updateData = req.body;

    // If dates are being updated, normalize them
    if (updateData.startDate) {
      updateData.startDate = normalizeDate(new Date(updateData.startDate));
    }
    if (updateData.endDate) {
      updateData.endDate = normalizeDate(new Date(updateData.endDate));
    }

    const blockedSettings = await BlockedSettings.findByIdAndUpdate(
      blockedSettingsId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!blockedSettings) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blocked settings not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blocked settings updated successfully',
      data: blockedSettings
    });
  } catch (error: any) {
    console.error('Update Blocked Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error updating blocked settings', 
      details: error.message 
    });
  }
};

// Delete (deactivate) blocked settings
export const deleteBlockedSettings = async (req: Request, res: Response) => {
  try {
    const { blockedSettingsId } = req.params;

    const blockedSettings = await BlockedSettings.findByIdAndUpdate(
      blockedSettingsId,
      { isActive: false },
      { new: true }
    );

    if (!blockedSettings) {
      return res.status(404).json({ 
        success: false, 
        error: 'Blocked settings not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blocked settings deactivated successfully'
    });
  } catch (error: any) {
    console.error('Delete Blocked Settings Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error deactivating blocked settings', 
      details: error.message 
    });
  }
};