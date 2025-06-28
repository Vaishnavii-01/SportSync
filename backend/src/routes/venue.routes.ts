//All the URL paths and which controller should handle them
import express from 'express';
import * as venueController from '../controllers/venue.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('vendor'));

router.route('/')
  .get(venueController.getVenues)
  .post(venueController.createVenue);

router.route('/:id')
  .get(venueController.getVenue)
  .patch(venueController.updateVenue)
  .delete(venueController.deleteVenue);

export default router;