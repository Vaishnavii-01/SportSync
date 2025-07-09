// src/routes/slotSettings.ts
import express from 'express';
import {
  createSlotSettings,
  updateSlotSettings,
  getSlotSettings,
  getVenueSlotSettings,
  deleteSlotSettings,
  generateAvailableSlots
} from '../controllers/slotSettingsController';

const router = express.Router();

// Create new slot settings
router.post('/', createSlotSettings);

// Update existing slot settings by ID
router.put('/:slotSettingsId', updateSlotSettings);

// Get slot settings for a specific section
router.get('/section/:sectionId', getSlotSettings);

// Get all slot settings for a venue
router.get('/venue/:venueId', getVenueSlotSettings);

// Deactivate (soft delete) slot settings by ID
router.delete('/:slotSettingsId', deleteSlotSettings);

// Generate available slots for a specific date and section
router.get('/available-slots', generateAvailableSlots);

export default router;
