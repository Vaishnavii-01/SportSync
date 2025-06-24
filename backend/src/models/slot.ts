import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot extends Document {
  venueId: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  price: number;
  sport: string;
  sectionName: string;
  duration: number;
}

const slotSchema = new Schema<ISlot>({
  venueId: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
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
  sectionName: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model<ISlot>('Slot', slotSchema);
