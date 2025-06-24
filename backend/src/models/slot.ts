import mongoose, { Schema } from 'mongoose';
const slotSchema = new Schema({
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
    type: String,
    required: true,
  },
  duration: {
    type: Number, 
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Slot', slotSchema);
