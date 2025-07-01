// types/express.d.ts
import { Document } from 'mongoose';
import { IVenue } from '../src/models/venue';  // Adjusted path
import { IUser } from '../src/models/user';    // Adjusted path

declare global {
  namespace Express {
    interface Request {
      user?: IUser & Document;
      venue?: IVenue & Document;
    }
  }
}

