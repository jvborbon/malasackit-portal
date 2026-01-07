import express from 'express';
import {
    getAvailableSlots,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    createEvent,
    getAllAppointments
} from '../controllers/appointmentControllers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

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

// POST /api/appointments/events - Create standalone event (Admin/Staff only)
router.post('/events', requireRole(['Resource Staff', 'Executive Admin']), createEvent);

// GET /api/appointments/all - Get all appointments (Admin/Staff only)
router.get('/all', requireRole(['Resource Staff', 'Executive Admin']), getAllAppointments);

export default router;