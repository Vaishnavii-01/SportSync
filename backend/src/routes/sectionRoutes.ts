// src/routes/sectionRoutes.ts
import express from 'express';
import {
  createSection,
  getVenueSections,
  getSectionById,
  updateSection,
  deleteSection
} from '../controllers/sectionController';

const router = express.Router();

// Section routes
router.post('/', createSection);
router.get('/venue/:venueId', getVenueSections);
router.get('/:sectionId', getSectionById);
router.put('/:sectionId', updateSection);
router.delete('/:sectionId', deleteSection);

export default router;

