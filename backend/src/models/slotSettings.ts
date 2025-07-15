import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITimeRange {
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface ICustomDayPrice {
  day: string; // "MON", "TUE", etc.
  price: number;
}

export interface ICustomDatePrice {
  date: Date;
  price: number;
}

export interface ICustomDateRangePrice {
  startDate: Date;
  endDate: Date;
  price: number;
}

export interface ISlotSettings extends Document {
  venue: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  name: string; // e.g., "Regular Hours", "Weekend Special"
  startDate: Date;
  endDate: Date;
  days: string[]; // ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  timings: ITimeRange[];
  duration: number; // slot duration in minutes
  price: number; // base price for one slot
  customDayPrice?: ICustomDayPrice[]; // custom price for specific days
  customDatePrice?: ICustomDatePrice[]; // custom price for specific dates
  customDateRangePrice?: ICustomDateRangePrice[]; // custom price for date ranges
  maxAdvanceBooking: number; // days in advance booking is allowed
  isActive: boolean;
  priority?: number; // higher number = higher priority when multiple settings overlap
  createdAt: Date;
  updatedAt: Date;
}

const timeRangeSchema = new Schema<ITimeRange>({
  startTime: { 
    type: String, 
    required: true, 
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ 
  },
  endTime: { 
    type: String, 
    required: true, 
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ 
  }
}, { _id: false });

const customDayPriceSchema = new Schema<ICustomDayPrice>({
  day: { 
    type: String, 
    required: true, 
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] 
  },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const customDatePriceSchema = new Schema<ICustomDatePrice>({
  date: { type: Date, required: true },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const customDateRangePriceSchema = new Schema<ICustomDateRangePrice>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const slotSettingsSchema = new Schema<ISlotSettings>({
  venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { 
    type: [String], 
    enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    required: true 
  },
  timings: { type: [timeRangeSchema], required: true },
  duration: { type: Number, required: true, min: 15, max: 480 }, // 15 min to 8 hours
  price: { type: Number, required: true, min: 0 },
  customDayPrice: { type: [customDayPriceSchema], default: [] },
  customDatePrice: { type: [customDatePriceSchema], default: [] },
  customDateRangePrice: { type: [customDateRangePriceSchema], default: [] },
  maxAdvanceBooking: { type: Number, required: true, min: 0, max: 365 },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 1 }
}, { timestamps: true });

// Indexes
slotSettingsSchema.index({ venue: 1, section: 1, isActive: 1 });
slotSettingsSchema.index({ startDate: 1, endDate: 1 });
slotSettingsSchema.index({ priority: -1 });

// Validation middleware
slotSettingsSchema.pre<ISlotSettings>('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }

  // Validate timings
  for (const timing of this.timings) {
    const [startHour, startMin] = timing.startTime.split(':').map(Number);
    const [endHour, endMin] = timing.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return next(new Error('Start time must be before end time'));
    }
  }

  // Validate custom date ranges
  for (const range of this.customDateRangePrice || []) {
    if (range.startDate >= range.endDate) {
      return next(new Error('Custom date range must have end date after start date'));
    }
  }

  next();
});

const SlotSettings: Model<ISlotSettings> = mongoose.model<ISlotSettings>('SlotSettings', slotSettingsSchema);
export default SlotSettings;