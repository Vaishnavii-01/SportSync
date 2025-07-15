import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import venueRoutes from './routes/venueRoutes';
import sectionRoutes from './routes/sectionRoutes';
import slotSettingsRoutes from './routes/slotSettingsRoutes';
import bookingRoutes from './routes/bookingRoutes';
import blockedSettingsRoutes from './routes/blockedSettingsRoutes'; // Added missing blockedSettingsRoutes

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/slot-settings', slotSettingsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/blocked-settings', blockedSettingsRoutes); // Added blocked settings routes

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    details: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at ${new Date().toISOString()}`);
});