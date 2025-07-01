// routes/venueRoutes.ts
import express from 'express';
import {
  createVenue,
  getVenuesByOwner,
  getVenueById,
  updateVenue,
  deleteVenue,
} from '../controllers/venueController';


const router = express.Router();


// Create a new venue
router.post('/', createVenue);

// Get all venues owned by the current user
router.get('/', getVenuesByOwner);

// Get single venue (must be owned by current user)
router.get('/:id', getVenueById);

// Update venue (must be owned by current user)
router.put('/:id', updateVenue);

// Delete venue (must be owned by current user)
router.delete('/:id', deleteVenue);

export default router;