import express from 'express';
import { createVenue, getAllVenues, getVenueById, updateVenue, deleteVenue } from '../controllers/venue.controller';

const router = express.Router();

// POST /api/venues - Create a new venue
router.post('/', createVenue);

// GET /api/venues - Get all venues
router.get('/', getAllVenues);

// GET /api/venues/:id - Get a specific venue by ID
router.get('/:id', getVenueById);

// PUT /api/venues/:id - Update a venue
router.put('/:id', updateVenue);

// DELETE /api/venues/:id - Delete a venue
router.delete('/:id', deleteVenue);

export default router;
