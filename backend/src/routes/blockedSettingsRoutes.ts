// src/routes/blockedSettingsRoutes.ts
import express from 'express';
import {
  createBlockedSettings,
  getBlockedSettings,
  updateBlockedSettings,
  deleteBlockedSettings
} from '../controllers/blockedSettingsController';
const router = express.Router();

// Blocked Settings Routes
router.post('/sections/:sectionId/blocked-settings', createBlockedSettings);
router.get('/sections/:sectionId/blocked-settings', getBlockedSettings);
router.put('/blocked-settings/:blockedSettingsId', updateBlockedSettings);
router.delete('/blocked-settings/:blockedSettingsId',  deleteBlockedSettings);
export default router;