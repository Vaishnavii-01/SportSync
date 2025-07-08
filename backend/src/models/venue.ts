import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVenue extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  sports: string[];
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  rating: number;
}

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    sports: { 
      type: [String], 
      required: true,
      validate: {
        validator: (sports: string[]) => sports.length > 0,
        message: 'At least one sport must be specified'
      }
    },
    contactNumber: { type: String, required: true },
    openingTime: { type: String, default: '08:00' },
    closingTime: { type: String, default: '22:00' },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Index for faster sports-based queries
venueSchema.index({ sports: 1 });

const Venue: Model<IVenue> = mongoose.model<IVenue>('Venue', venueSchema);
export default Venue;