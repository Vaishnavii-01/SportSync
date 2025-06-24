import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slotId: {
    type: Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  venueId: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  sectionName: {
    type: String,
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
  }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
