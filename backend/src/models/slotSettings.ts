import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITimingSlot {
  startTime: string; // "06:00"
  endTime: string;   // "11:00"
}

export interface ISlotSettings extends Document {
  venue: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  days: string[]; // ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  timings: ITimingSlot[];
  duration: number; // in minutes
  bookingAllowed: number; // how many days in advance booking is allowed
  priceModel: 'perHour' | 'perSlot' | 'perSession';
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timingSlotSchema = new Schema<ITimingSlot>({
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format validation
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format validation
  }
}, { _id: false });

const slotSettingsSchema = new Schema<ISlotSettings>({
  venue: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  section: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  days: {
    type: [String],
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    default: [],
  },
  timings: {
    type: [timingSlotSchema],
    required: true,
    validate: {
      validator: (timings: ITimingSlot[]) => timings.length > 0,
      message: 'At least one timing slot is required'
    }
  },
  duration: {
    type: Number,
    required: true,
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  bookingAllowed: {
    type: Number,
    required: true,
    min: [1, 'Booking must be allowed at least 1 day in advance'],
    max: [365, 'Booking cannot be allowed more than 365 days in advance']
  },
  priceModel: {
    type: String,
    enum: ['perHour', 'perSlot', 'perSession'],
    required: [true, 'A slot setting must have a price model'],
  },
  basePrice: {
    type: Number,
    required: [true, 'A slot setting must have a base price'],
    min: [0, 'Price cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

// Indexes for efficient querying
slotSettingsSchema.index({ venue: 1, section: 1 });
slotSettingsSchema.index({ venue: 1, isActive: 1 });

// Validation middleware
slotSettingsSchema.pre<ISlotSettings>('save', function(next) {
  // Validate that startDate is before endDate if both are provided
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  
  // Validate timing slots don't overlap and are in correct order
  for (const timing of this.timings) {
    const [startHour, startMin] = timing.startTime.split(':').map(Number);
    const [endHour, endMin] = timing.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      return next(new Error('Start time must be before end time for each timing slot'));
    }
  }
  
  next();
});

const SlotSettings: Model<ISlotSettings> = mongoose.model<ISlotSettings>('SlotSettings', slotSettingsSchema);
export default SlotSettings;