import { Request } from 'express';

export interface CreateSlotsRequest extends Request {
  body: {
    venueId: string;
    startDate?: string;
    endDate?: string;
    days?: string[];
    timings: Array<{
      startTime: string;
      endTime: string;
    }>;
    duration: number;
    sports: string[];
  };
}

export interface GetSlotsRequest extends Request {
  query: {
    venueId?: string;
    sectionId?: string;
    date?: string;
    sport?: string;
  };
}