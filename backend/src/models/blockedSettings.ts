// src/models/blockedSettings.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBlockedTime {
  startTime: string; // "14:00"
  endTime: string;   // "15:00"
}

export interface IBlockedSettings extends Document {
  venue: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: string[]; // ["MON", "TUE", etc.]
  timings: IBlockedTime[];
  isRecurring: boolean;
  reason: string;
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

const blockedSettingsSchema = new Schema<IBlockedSettings>({
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
    default: [],
  },
  timings: {
    type: [blockedTimeSchema],
    default: [],
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    maxlength: 200,
  }
}, { timestamps: true });

// Indexes for efficient querying
blockedSettingsSchema.index({ venue: 1, section: 1 });
blockedSettingsSchema.index({ startDate: 1, endDate: 1 });

// Validation middleware
blockedSettingsSchema.pre<IBlockedSettings>('save', function(next) {
  // Validate startDate is before endDate
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }

  // Validate timings
  for (const timing of this.timings) {
    const [startHour, startMin] = timing.startTime.split(':').map(Number);
    const [endHour, endMin] = timing.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return next(new Error('Blocked start time must be before end time'));
    }
  }

  next();
});

const BlockedSettings: Model<IBlockedSettings> = mongoose.model<IBlockedSettings>('BlockedSettings', blockedSettingsSchema);
export default BlockedSettings;