import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  venue: mongoose.Types.ObjectId;
  section: mongoose.Types.ObjectId;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  price: number; // price for this specific slot
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  notes?: string;
  slotId: string; // format: sectionId-date-startTime
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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
  duration: {
    type: Number,
    required: true,
    min: 15,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  slotId: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Indexes
bookingSchema.index({ venue: 1, section: 1, date: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ slotId: 1 });

// Unique index to prevent double booking
bookingSchema.index({
  section: 1,
  date: 1,
  startTime: 1,
  endTime: 1
}, {
  unique: true,
  partialFilterExpression: { status: { $ne: 'cancelled' } }
});

const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);
export default Booking;