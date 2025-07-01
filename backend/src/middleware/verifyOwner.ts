import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Venue from '../models/venue';

export const verifyOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - We'll skip type checking for req.user
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    // @ts-ignore
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can manage venues' });
    }

    if (req.params.id) {
      const venue = await Venue.findById(req.params.id);
      if (!venue) return res.status(404).json({ error: 'Venue not found' });
      
      // @ts-ignore
      if (venue.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You can only manage your own venues' });
      }
      
      // @ts-ignore - Attach to request without type checking
      req.venue = venue;
    }

    next();
  } catch (error) {
    console.error('Owner verification error:', error);
    res.status(500).json({ error: 'Server error during owner verification' });
  }
};