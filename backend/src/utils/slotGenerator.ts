import { ISlot } from '../models/slot';
import Section from '../models/section';
import { addMinutes, isWithinInterval, parse, setHours, setMinutes } from 'date-fns';
import mongoose from 'mongoose';

interface SlotGenerationParams {
  venueId: string;
  sections: any[];
  startDate: string;
  endDate: string;
  days: string[];
  timings: { startTime: string; endTime: string }[];
  duration: number;
}

export const generateSlots = async (params: SlotGenerationParams): Promise<ISlot[]> => {
  const { venueId, sections, startDate, endDate, days, timings, duration } = params;
  
  const slots: ISlot[] = [];
  const dayMap: Record<string, number> = {
    'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6, 'SUN': 0
  };
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Iterate through each day in the date range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
    
    // Check if this day is in the requested days
    if (days && days.length > 0 && (!dayName || !days.includes(dayName))) {
      continue;
    }
    
    // Generate slots for each timing period
    for (const timing of timings) {
      const startTime = parse(timing.startTime, 'HH:mm', date);
      const endTime = parse(timing.endTime, 'HH:mm', date);
      
      let currentSlotStart = new Date(startTime);
      
      // Generate slots until we reach the end time
      while (currentSlotStart < endTime) {
        const currentSlotEnd = addMinutes(currentSlotStart, duration);
        
        // Don't create a slot that would exceed the end time
        if (currentSlotEnd > endTime) {
          break;
        }
        
        // Create slots for each section
        for (const section of sections) {
          slots.push({
            venueId: new mongoose.Types.ObjectId(venueId),
            date: new Date(date.setHours(0, 0, 0, 0)),
            startTime: new Date(currentSlotStart),
            endTime: new Date(currentSlotEnd),
            price: section.basePrice,
            sport: section.sport,
            section: section._id,
            duration: duration
          } as ISlot);
        }
        
        // Move to next slot
        currentSlotStart = currentSlotEnd;
      }
    }
  }
  
  return slots;
};