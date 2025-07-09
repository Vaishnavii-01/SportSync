import { Request, Response } from 'express';
import Section from '../models/section';
import Venue from '../models/venue';
import SlotSettings from '../models/slotSettings';

// @desc Create a new section
export const createSection = async (req: Request, res: Response) => {
  try {
    const {
      name,
      venue,
      sport,
      capacity,
      description,
      images,
      rules
    } = req.body;

    // Validate that venue exists
    const venueExists = await Venue.findById(venue);
    if (!venueExists) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Create new section
    const newSection = new Section({
      name,
      venue,
      sport,
      capacity,
      description,
      images,
      rules
    });

    await newSection.save();

    res.status(201).json({
      message: 'Section created successfully',
      section: newSection
    });

  } catch (error: any) {
    console.error('Create Section Error:', error.message);
    res.status(500).json({ error: 'Error creating section', details: error.message });
  }
};

// @desc Get all sections for a venue
export const getVenueSections = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const { sport } = req.query;

    // Build query
    const query: any = { venue: venueId, isActive: true };
    if (sport) {
      query.sport = sport;
    }

    const sections = await Section.find(query)
      .populate('venue', 'name')
      .populate('slotSettings');

    res.status(200).json({
      venueId: venueId,
      sport: sport || 'all',
      sections: sections
    });

  } catch (error: any) {
    console.error('Get Venue Sections Error:', error.message);
    res.status(500).json({ error: 'Error fetching sections', details: error.message });
  }
};

// @desc Get section by ID
export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId)
      .populate('venue', 'name openingTime closingTime')
      .populate('slotSettings');

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.status(200).json({
      section: section
    });

  } catch (error: any) {
    console.error('Get Section Error:', error.message);
    res.status(500).json({ error: 'Error fetching section', details: error.message });
  }
};

// @desc Update section
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.status(200).json({
      message: 'Section updated successfully',
      section: updatedSection
    });

  } catch (error: any) {
    console.error('Update Section Error:', error.message);
    res.status(500).json({ error: 'Error updating section', details: error.message });
  }
};

// @desc Delete section
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    // Deactivate associated slot settings
    await SlotSettings.updateMany(
      { section: sectionId },
      { isActive: false }
    );

    const deletedSection = await Section.findByIdAndDelete(sectionId);

    if (!deletedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.status(200).json({
      message: 'Section and associated slot settings deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete Section Error:', error.message);
    res.status(500).json({ error: 'Error deleting section', details: error.message });
  }
};