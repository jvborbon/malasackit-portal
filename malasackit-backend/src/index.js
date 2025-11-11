// src/index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // Add this
import locationRoutes from './routes/locationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import donationRequestRoutes from './routes/donationRequestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

const app = express();
const port = 3000;

// CORS configuration for cookies
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true // Allow cookies
}));

app.use(cookieParser()); // Add cookie parser middleware
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api', locationRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/donation-requests', donationRequestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inventory', inventoryRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});