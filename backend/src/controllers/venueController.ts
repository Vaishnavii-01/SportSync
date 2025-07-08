import { Request, Response } from 'express';
import Venue from '../models/venue';

// @desc Create a new venue
export const createVenue = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      address,
      sports,
      contactNumber,
      openingTime,
      closingTime,
      owner,
    } = req.body;

    const newVenue = new Venue({
      name,
      description,
      address,
      sports,
      contactNumber,
      openingTime,
      closingTime,
      owner,
      rating: 0,
    });

    await newVenue.save();

    res.status(201).json({
      message: 'Venue created successfully',
      venue: newVenue,
    });
  } catch (error: any) {
    console.error('Create Venue Error:', error.message);
    res.status(500).json({ error: 'Error creating venue', details: error.message });
  }
};

// @desc Get all active venues
export const getAllVenues = async (req: Request, res: Response) => {
  try {
    const venues = await Venue.find({ isActive: true });
    res.status(200).json(venues);
  } catch (error: any) {
    console.error('Get Venues Error:', error.message);
    res.status(500).json({ error: 'Error fetching venues', details: error.message });
  }
};

// @desc Get single venue by ID
export const getVenueById = async (req: Request, res: Response) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.status(200).json(venue);
  } catch (error: any) {
    console.error('Get Venue By ID Error:', error.message);
    res.status(500).json({ error: 'Error fetching venue', details: error.message });
  }
};

// @desc Update venue by ID
export const updateVenue = async (req: Request, res: Response) => {
  try {
    const updatedVenue = await Venue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVenue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.status(200).json({
      message: 'Venue updated successfully',
      venue: updatedVenue,
    });
  } catch (error: any) {
    console.error('Update Venue Error:', error.message);
    res.status(500).json({ error: 'Error updating venue', details: error.message });
  }
};

// @desc Delete venue by ID
export const deleteVenue = async (req: Request, res: Response) => {
  try {
    const deletedVenue = await Venue.findByIdAndDelete(req.params.id);

    if (!deletedVenue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.status(200).json({ message: 'Venue deleted successfully' });
  } catch (error: any) {
    console.error('Delete Venue Error:', error.message);
    res.status(500).json({ error: 'Error deleting venue', details: error.message });
  }
};