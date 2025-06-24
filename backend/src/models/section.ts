import mongoose, { Document, Schema, Model } from 'mongoose';

// Main section interface
export interface ISection extends Document {
  name: string;
  venue: mongoose.Types.ObjectId;
  sport: string;
  priceModel: 'perHour' | 'perSlot' | 'perSession';
  basePrice: number;
  capacity: number;
  description: string;
  images: string[];
  rules: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const sectionSchema: Schema<ISection> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A section must have a name'],
      trim: true,
      maxlength: [50, 'Section name cannot be more than 50 characters'],
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'A section must belong to a venue'],
    },
    sport: {
      type: String,
      required: [true, 'Please specify the sport for this section'],
    },
    priceModel: {
      type: String,
      enum: ['perHour', 'perSlot', 'perSession'],
      default: 'perHour',
    },
    basePrice: {
      type: Number,
      required: [true, 'A section must have a base price'],
      min: [0, 'Price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify the capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    description: {
      type: String,
      trim: true,
    },
    images: [String],
    rules: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster querying
sectionSchema.index({ venue: 1, sport: 1 });

// Middleware to validate that the sport is offered by the parent venue
sectionSchema.pre<ISection>('save', async function (next) {
  const venue = await mongoose.model('Venue').findById(this.venue);
  
  if (venue && !venue.sports.includes(this.sport)) {
    throw new Error(`The venue does not offer ${this.sport}`);
  }
  
  next();
});

// Virtual populate to get all slots for this section
sectionSchema.virtual('slots', {
  ref: 'Slot',
  foreignField: 'section',
  localField: '_id',
});

// Export the model
const Section: Model<ISection> = mongoose.model<ISection>('Section', sectionSchema);
export default Section;