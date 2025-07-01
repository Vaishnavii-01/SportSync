// // middlewares/verifyOwner.ts
// import { Request, Response, NextFunction } from 'express';
// import User from '../models/user';
// import Venue from '../models/venue';

// export const verifyOwner = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Check if user is authenticated
//     if (!req.user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     // Check if user is a vendor
//     const user = await User.findById(req.user._id);
//     if (!user || user.role !== 'vendor') {
//       return res.status(403).json({ error: 'Only vendors can manage venues' });
//     }

//     // For update/delete operations, verify the venue belongs to this owner
//     if (req.params.id) {
//       const venue = await Venue.findById(req.params.id);
//       if (!venue) {
//         return res.status(404).json({ error: 'Venue not found' });
//       }
//       if (venue.owner.toString() !== req.user._id.toString()) {
//         return res.status(403).json({ error: 'You can only manage your own venues' });
//       }
//       req.venue = venue; // Attach venue to request for later use
//     }

//     next();
//   } catch (error) {
//     console.error('Owner verification error:', error);
//     res.status(500).json({ error: 'Server error during owner verification' });
//   }
// };