import express from 'express';
import {
    getAvailableSlots,
    createAppointment,
    updateAppointment,
    cancelAppointment
} from '../controllers/appointmentControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All appointment routes require authentication
router.use(authenticateToken);

// GET /api/appointments/available-slots?date=YYYY-MM-DD - Get available time slots for a date
router.get('/available-slots', getAvailableSlots);

// POST /api/appointments - Create a new appointment
router.post('/', createAppointment);

// PUT /api/appointments/:appointmentId - Update an appointment
router.put('/:appointmentId', updateAppointment);

// DELETE /api/appointments/:appointmentId - Cancel an appointment
router.delete('/:appointmentId', cancelAppointment);

export default router;