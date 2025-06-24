import mongoose, { Document, Schema, Model } from 'mongoose';

// Address sub-document interface
interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Available time sub-document interface
interface IAvailableTime {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

// Main venue interface
export interface IVenue extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  address: IAddress;
  sports: string[];
  amenities: string[];
  rules: string[];
  images: string[];
  availableTimes: IAvailableTime[];
  isActive: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const venueSchema: Schema<IVenue> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A venue must have a name'],
      trim: true,
      maxlength: [100, 'Venue name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'A venue must have a description'],
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A venue must have an owner'],
    },
    address: {
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      country: { type: String, required: [true, 'Country is required'] },
      zipCode: { type: String, required: [true, 'Zip code is required'] },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    sports: {
      type: [String],
      required: [true, 'Please specify at least one sport'],
      validate: {
        validator: function (val: string[]) {
          return val.length > 0;
        },
        message: 'Please specify at least one sport',
      },
    },
    amenities: [String],
    rules: [String],
    images: [String],
    availableTimes: [
      {
        day: {
          type: String,
          enum: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
          required: true,
        },
        openTime: { type: String, required: true },
        closeTime: { type: String, required: true },
        isClosed: { type: Boolean, default: false },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geospatial queries (if you want to implement location-based search)
venueSchema.index({ 'address.coordinates': '2dsphere' });

// Virtual populate to get all bookings for this venue
venueSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'venue',
  localField: '_id',
});

// Export the model
const Venue: Model<IVenue> = mongoose.model<IVenue>('Venue', venueSchema);
export default Venue;