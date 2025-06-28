import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot extends Document {
  venueId: mongoose.Types.ObjectId | IVenue;
  date: Date;
  startTime: Date;
  endTime: Date;
  price: number;
  sport: string;
  section: mongoose.Types.ObjectId;
  duration: number;
}

interface IVenue {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  // other venue fields you might need
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
  section: {
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
