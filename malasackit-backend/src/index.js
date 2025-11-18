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
import beneficiaryRoutes from './routes/beneficiaryRoutes.js';
import distributionRoutes from './routes/distributionRoutes.js';
import walkInRoutes from './routes/walkInRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';

const app = express();
const port = 3000;

// CORS configuration for cookies
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Your frontend URL
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
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/walkin', walkInRoutes);
app.use('/api/receipts', receiptRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});