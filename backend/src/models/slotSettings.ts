import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBlockedTime {
  startTime: string; // "14:00"
  endTime: string;   // "15:00"
}

export interface ICustomPrice {
  day: string; // "MON", "TUE", etc.
  price: number; // Custom price for the specified day
}

export interface ICustomDatePrice {
  date: Date; // Specific date, e.g., "2025-08-15"
  price: number; // Custom price for the specific date
}

export interface ISlotSettings extends Document {
  venue: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: string[]; // ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  startTime: string; // "09:00"
  endTime: string;   // "21:00"
  blockedTimes: IBlockedTime[]; // Default blocked time ranges for all days
  blockedDays: string[]; // Blocked days of the week
  duration: number; // in minutes (e.g., 60 for 1-hour slots)
  bookingAllowed: number; // how many days in advance booking is allowed
  basePrice: number; // Base price per hour
  customPrices: ICustomPrice[]; // Custom prices for specific days
  customDatePrices: ICustomDatePrice[]; // Custom prices for specific dates
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blockedTimeSchema = new Schema<IBlockedTime>({
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  }
}, { _id: false });

const customPriceSchema = new Schema<ICustomPrice>({
  day: {
    type: String,
    required: true,
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  }
}, { _id: false });

const customDatePriceSchema = new Schema<ICustomDatePrice>({
  date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
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
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  days: {
    type: [String],
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    required: true,
    validate: {
      validator: (days: string[]) => days.length > 0,
      message: 'At least one day is required'
    }
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  blockedTimes: {
    type: [blockedTimeSchema],
    default: [],
  },
  blockedDays: {
    type: [String],
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    default: [],
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
  basePrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  customPrices: {
    type: [customPriceSchema],
    default: [],
  },
  customDatePrices: {
    type: [customDatePriceSchema],
    default: [],
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
slotSettingsSchema.pre<ISlotSettings>('save', async function(next) {
  // Validate startDate is before endDate
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }

  // Validate startTime is before endTime
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  if (startMinutes >= endMinutes) {
    return next(new Error('Start time must be before end time'));
  }

  // Validate blockedTimes
  for (const blocked of this.blockedTimes) {
    const [blockStartHour, blockStartMin] = blocked.startTime.split(':').map(Number);
    const [blockEndHour, blockEndMin] = blocked.endTime.split(':').map(Number);
    const blockStartMinutes = blockStartHour * 60 + blockStartMin;
    const blockEndMinutes = blockEndHour * 60 + blockEndMin;

    if (blockStartMinutes >= blockEndMinutes) {
      return next(new Error('Blocked start time must be before end time'));
    }

    if (blockStartMinutes < startMinutes || blockEndMinutes > endMinutes) {
      return next(new Error('Blocked times must be within operating hours'));
    }
  }

  // Validate blockedDays are in days array
  for (const blockedDay of this.blockedDays) {
    if (!this.days.includes(blockedDay)) {
      return next(new Error('Blocked days must be in the operational days array'));
    }
  }

  // Validate customDatePrices
  for (const customDatePrice of this.customDatePrices) {
    if (customDatePrice.date < this.startDate || customDatePrice.date > this.endDate) {
      return next(new Error(`Custom date price date ${customDatePrice.date.toISOString()} must be within start and end date range`));
    }
  }

  // Validate against Section's basePrice
  const section = await mongoose.model('Section').findById(this.section);
  if (!section) {
    return next(new Error('Section not found'));
  }
  if (!this.basePrice && !section.basePrice) {
    return next(new Error('Base price must be provided in SlotSettings or Section'));
  }

  next();
});

const SlotSettings: Model<ISlotSettings> = mongoose.model<ISlotSettings>('SlotSettings', slotSettingsSchema);
export default SlotSettings;