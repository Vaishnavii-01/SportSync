//What to do when a request comes (Create/Update/View logic per route)
import { Request, Response, NextFunction } from 'express';
import Venue from '../models/venue';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
//import { IVenue } from '../models/venue';

// TEMPORARY ID
const TEMP_OWNER_ID = '660b5b6e8c1d2470b4c7d8e3'; // Use a real ID from your DB

export const createVenue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newVenue = await Venue.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      venue: newVenue
    }
  });
});

export const getVenues = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const venues = await Venue.find({ owner: TEMP_OWNER_ID });
  res.status(200).json({
    status: 'success',
    results: venues.length,
    data: {
      venues
    }
  });
});

export const getVenue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const venue = await Venue.findOne({ _id: req.params.id, owner: TEMP_OWNER_ID });
  //REPLACE WITH req.user.id
  if (!venue) {
    return next(new AppError('No venue found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      venue
    }
  });
});

export const updateVenue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const venue = await Venue.findOneAndUpdate(
    { _id: req.params.id, owner: TEMP_OWNER_ID },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!venue) {
    return next(new AppError('No venue found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      venue
    }
  });
});

export const deleteVenue = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const venue = await Venue.findOneAndDelete({ _id: req.params.id, owner: TEMP_OWNER_ID});
  
  if (!venue) {
    return next(new AppError('No venue found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});