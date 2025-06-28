//What to do when a request comes (Create/Update/View logic per route)
import { Request, Response, NextFunction, request } from 'express';
import Slot from '../models/slot';
import Venue from '../models/venue';
import Section from '../models/section';
import catchAsync from '../utils/catchAsync';

import AppError from '../utils/appError';
import { generateSlots } from '../utils/slotGenerator';

//const { slotId } = request.params;
const TEMP_OWNER_ID = '660b5b6e8c1d2470b4c7d8e3';
export const createSlots = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { venueId, startDate, endDate, days, timings, duration, sports } = req.body;
  
  // 1. Verify venue exists and belongs to the owner
  const venue = await Venue.findOne({ _id: venueId, owner: TEMP_OWNER_ID });

  /// later replace TEMP_OWNER_ID with req.user.id
  if (!venue) {
    return next(new AppError('No venue found with that ID', 404));
  }
  
  // 2. Get all sections for the venue that match the sports
  const sections = await Section.find({ 
    venue: venueId, 
    sport: { $in: sports },
    isActive: true
  });
  
  if (sections.length === 0) {
    return next(new AppError('No matching sections found for the specified sports', 400));
  }
  
  // 3. Generate slots
  const slots = await generateSlots({
    venueId,
    sections,
    startDate,
    endDate,
    days,
    timings,
    duration
  });
  
  // 4. Save slots to database
  const createdSlots = await Slot.insertMany(slots);
  
  res.status(201).json({
    status: 'success',
    data: {
      slots: createdSlots
    }
  });
});

export const getSlots = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { venueId, sectionId, date, sport } = req.query;
  
  // 1. Build query
  let query: any = {};
  
  if (venueId) {
    // Verify venue belongs to owner
    const venue = await Venue.findOne({ _id: venueId, owner: TEMP_OWNER_ID });
    if (!venue) {
      return next(new AppError('No venue found with that ID', 404));
    }
    query.venueId = venueId;
  }
  
  if (sectionId) {
    query.section = sectionId;
  }
  
  if (date) {
    const dateObj = new Date(date as string);
    query.date = {
      $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
      $lte: new Date(dateObj.setHours(23, 59, 59, 999))
    };
  }
  
  if (sport) {
    query.sport = sport;
  }
  
  // 2. Execute query
  const slots = await Slot.find(query)
    .populate('section')
    .sort({ date: 1, startTime: 1 });
  
  res.status(200).json({
    status: 'success',
    results: slots.length,
    data: {
      slots
    }
  });
});

export const blockSlot = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slotId } = req.params;
  
  // 1. Find slot and verify it belongs to owner's venue
  const slot = await Slot.findById(slotId).populate({
    path: 'venueId',
    select: 'owner'
  });
  
  if (!slot) {
    return next(new AppError('No slot found with that ID', 404));
  }
  
  // if (slot.venueId.owner.toString() !== TEMP_OWNER_ID) {
  //   return next(new AppError('You are not authorized to block this slot', 403));
  // }
  
  // 2. Block the slot (implementation depends on your business logic)
  // For example, you might delete it or mark it as unavailable
  await Slot.findByIdAndDelete(slotId);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});