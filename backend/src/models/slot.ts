// src/models/slot.ts (Updated)
import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot extends Document {
  venue: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  price: number;
  sport: string;
  duration: number; // in minutes
  isBooked: boolean;
  bookedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const slotSchema = new Schema<ISlot>({
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
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sport: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

// Index for faster querying
slotSchema.index({ venue: 1, section: 1, date: 1 });
slotSchema.index({ date: 1, startTime: 1 });

export default mongoose.model<ISlot>('Slot', slotSchema);