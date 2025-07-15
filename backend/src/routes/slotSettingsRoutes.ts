import express from 'express';
   import {
     createSlotSettings,
     updateSlotSettings,
     getSlotSettings,
      getAvailableSlots,
     deleteSlotSettings,
     
   } from '../controllers/slotSettingsController';

   const router = express.Router();

   // Slot Settings Routes
router.post('/sections/:sectionId/slot-settings', createSlotSettings);
router.get('/sections/:sectionId/slot-settings', getSlotSettings);
router.get('/sections/:sectionId/available-slots', getAvailableSlots);
router.put('/slot-settings/:slotSettingsId', updateSlotSettings);
router.delete('/slot-settings/:slotSettingsId',  deleteSlotSettings);
   export default router;