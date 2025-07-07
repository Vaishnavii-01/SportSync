// src/routes/slotSettings.ts
import express from 'express';
import {
  createOrUpdateSlotSettings,
  getSlotSettings,
  getVenueSlotSettings,
  deleteSlotSettings,
  generateAvailableSlots
} from '../controllers/slotSettingsController';

const router = express.Router();

// Create or update slot settings
router.post('/', createOrUpdateSlotSettings);

// Get slot settings for a specific section
router.get('/section/:sectionId', getSlotSettings);

// Get all slot settings for a venue
router.get('/venue/:venueId', getVenueSlotSettings);

// Delete (deactivate) slot settings
router.delete('/section/:sectionId', deleteSlotSettings);

// Generate available slots for a specific date
router.get('/available-slots', generateAvailableSlots);

export default router;