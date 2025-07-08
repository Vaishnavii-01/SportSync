import express from 'express';
import {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} from '../controllers/venueController';

const router = express.Router();

// Create a new venue
router.post('/', createVenue);

// Get all active venues
router.get('/', getAllVenues);

// Get single venue
router.get('/:id', getVenueById);

// Update venue
router.put('/:id', updateVenue);

// Delete venue
router.delete('/:id', deleteVenue);

export default router;