import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import venueRoutes from './routes/venueRoutes';

import sectionRoutes from './routes/sectionRoutes'
import slotSettingsRoutes from './routes/slotSettingsRoutes';
import bookingRoutes from './routes/bookingRoutes'; // NEW: Add booking routes


dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes); 
app.use('/api/sections', sectionRoutes);
app.use('/api/slot-settings', slotSettingsRoutes); // Changed from '/api/slots' for consistency
app.use('/api/bookings', bookingRoutes); // NEW: Booking routes


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
