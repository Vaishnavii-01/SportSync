import { Request, Response } from 'express';
import Venue from '../models/Venue';

// Create a new venue
export const createVenue = async (req: Request, res: Response) => {
  try {
    const newVenue = new Venue(req.body);
    const savedVenue = await newVenue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(500).json({ message: 'Error creating venue', error });
  }
};

// Get all venues
export const getAllVenues = async (_req: Request, res: Response) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching venues', error });
  }
};

// Get a venue by ID
export const getVenueById = async (req: Request, res: Response) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching venue', error });
  }
};

// Update a venue
export const updateVenue = async (req: Request, res: Response) => {
  try {
    const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVenue) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json(updatedVenue);
  } catch (error) {
    res.status(500).json({ message: 'Error updating venue', error });
  }
};

// Delete a venue
export const deleteVenue = async (req: Request, res: Response) => {
  try {
    const deletedVenue = await Venue.findByIdAndDelete(req.params.id);
    if (!deletedVenue) return res.status(404).json({ message: 'Venue not found' });
    res.status(200).json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting venue', error });
  }
};
