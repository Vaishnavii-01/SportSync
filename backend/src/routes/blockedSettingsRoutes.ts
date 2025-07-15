// src/routes/blockedSettingsRoutes.ts
import express from 'express';
import {
  createBlockedSetting,
  getBlockedSettings,
  deleteBlockedSetting
} from '../controllers/blockedSettingsController';

const router = express.Router();

// Create a new blocked setting
router.post('/', createBlockedSetting);

// Get blocked settings for a venue/section
router.get('/:venueId/:sectionId?', getBlockedSettings);

// Delete a blocked setting
router.delete('/:blockedSettingId', deleteBlockedSetting);

export default router;