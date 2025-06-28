import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import venueRoutes from './routes/venue.routes'; // ✅ Add this line
import slotRoutes from './routes/slot.routes';   // ✅ If you have slots too

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/venues', venueRoutes); // ✅ Mount routes
app.use('/api/slots', slotRoutes);   // ✅ Optional: if you have slot-related routes

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
