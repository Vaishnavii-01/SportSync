import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  venueId: mongoose.Types.ObjectId;
  sectionName: string;
  status: 'booked' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'failed';
  transactionId?: string;
  bookedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slotId: {
    type: Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  venueId: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  sectionName: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed'],
    default: 'booked',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', bookingSchema);
