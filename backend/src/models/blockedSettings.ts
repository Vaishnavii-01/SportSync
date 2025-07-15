import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockedTime {
  startTime: string;
  endTime: string;
}

export interface IBlockedSettings extends Document {
  venue: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  name: string;
  startDate?: Date;
  endDate?: Date;
  days: string[];
  timings: IBlockedTime[];
  reason?: string;
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
  },
});

const blockedSettingsSchema = new Schema<IBlockedSettings>(
  {
    venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
    section: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    days: { 
      type: [String], 
      enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], 
      default: [] 
    },
    timings: { type: [blockedTimeSchema], default: [] },
    reason: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Validate startDate and endDate
blockedSettingsSchema.pre('save', function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error('startDate must be less than or equal to endDate'));
  }

  // Validate timings
  if (this.timings && this.timings.length > 0) {
    for (const timing of this.timings) {
      const [startHour, startMin] = timing.startTime.split(':').map(Number);
      const [endHour, endMin] = timing.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      if (startMinutes >= endMinutes) {
        return next(new Error('startTime must be less than endTime in timings'));
      }
    }
  }

  next();
});

// Indexes for performance
blockedSettingsSchema.index({ venue: 1, section: 1, isActive: 1 });
blockedSettingsSchema.index({ section: 1, startDate: 1, endDate: 1, days: 1 });

export default mongoose.model<IBlockedSettings>('BlockedSettings', blockedSettingsSchema);