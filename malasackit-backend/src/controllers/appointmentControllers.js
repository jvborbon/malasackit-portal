import { query } from '../db.js';

/**
 * Get available appointment slots
 */
export const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }

        // Get existing appointments for the date
        const existingQuery = `
            SELECT appointment_time, COUNT(*) as count
            FROM Appointments 
            WHERE appointment_date = $1 AND status IN ('Scheduled', 'Rescheduled')
            GROUP BY appointment_time
        `;
        
        const existing = await query(existingQuery, [date]);
        const bookedSlots = {};
        existing.rows.forEach(row => {
            bookedSlots[row.appointment_time] = parseInt(row.count);
        });

        // Define available time slots (you can customize this)
        const timeSlots = [
            '08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00', '10:30:00',
            '11:00:00', '11:30:00', '13:00:00', '13:30:00', '14:00:00', '14:30:00',
            '15:00:00', '15:30:00', '16:00:00', '16:30:00', '17:00:00'
        ];

        const maxSlotCapacity = 2; // Maximum appointments per slot

        const availableSlots = timeSlots.map(slot => ({
            time: slot,
            available: (bookedSlots[slot] || 0) < maxSlotCapacity,
            booked: bookedSlots[slot] || 0,
            capacity: maxSlotCapacity
        }));

        res.json({
            success: true,
            data: {
                date,
                slots: availableSlots
            },
            message: 'Available slots retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve available slots',
            error: error.message
        });
    }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (req, res) => {
    try {
        const { date, time, description } = req.body;
        const userId = req.user.userId;

        if (!date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Date and time are required'
            });
        }

        // Check if slot is available
        const checkQuery = `
            SELECT COUNT(*) as count 
            FROM Appointments 
            WHERE appointment_date = $1 AND appointment_time = $2 
            AND status IN ('Scheduled', 'Rescheduled')
        `;
        
        const checkResult = await query(checkQuery, [date, time]);
        const currentBookings = parseInt(checkResult.rows[0].count);

        if (currentBookings >= 2) { // Max 2 per slot
            return res.status(400).json({
                success: false,
                message: 'Selected time slot is fully booked. Please choose another time.'
            });
        }

        // Create appointment
        const insertQuery = `
            INSERT INTO Appointments (appointment_date, appointment_time, description, status)
            VALUES ($1, $2, $3, 'Scheduled')
            RETURNING *
        `;

        const result = await query(insertQuery, [
            date,
            time,
            description || `Appointment for ${userId}`
        ]);

        // Log activity
        const activityQuery = `
            INSERT INTO UserActivityLogs (user_id, action, description)
            VALUES ($1, 'appointment_scheduled', $2)
        `;
        await query(activityQuery, [
            userId,
            `Scheduled appointment for ${date} at ${time}`
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Appointment created successfully'
        });

    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create appointment',
            error: error.message
        });
    }
};

/**
 * Update an appointment
 */
export const updateAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { date, time, status, remarks } = req.body;
        const userId = req.user.userId;

        // Check if appointment exists
        const checkQuery = 'SELECT * FROM Appointments WHERE appointment_id = $1';
        const checkResult = await query(checkQuery, [appointmentId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (date) {
            updates.push(`appointment_date = $${paramCount++}`);
            values.push(date);
        }
        if (time) {
            updates.push(`appointment_time = $${paramCount++}`);
            values.push(time);
        }
        if (status) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }
        if (remarks !== undefined) {
            updates.push(`remarks = $${paramCount++}`);
            values.push(remarks);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(appointmentId);

        const updateQuery = `
            UPDATE Appointments 
            SET ${updates.join(', ')}
            WHERE appointment_id = $${paramCount}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        // Log activity
        const activityQuery = `
            INSERT INTO UserActivityLogs (user_id, action, description)
            VALUES ($1, 'appointment_updated', $2)
        `;
        await query(activityQuery, [
            userId,
            `Updated appointment ${appointmentId} - Status: ${status || 'unchanged'}`
        ]);

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Appointment updated successfully'
        });

    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update appointment',
            error: error.message
        });
    }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.userId;

        // Update appointment status to cancelled
        const updateQuery = `
            UPDATE Appointments 
            SET status = 'Cancelled', remarks = 'Cancelled by user'
            WHERE appointment_id = $1
            RETURNING *
        `;

        const result = await query(updateQuery, [appointmentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Log activity
        const activityQuery = `
            INSERT INTO UserActivityLogs (user_id, action, description)
            VALUES ($1, 'appointment_cancelled', $2)
        `;
        await query(activityQuery, [
            userId,
            `Cancelled appointment ${appointmentId}`
        ]);

        res.json({
            success: true,
            message: 'Appointment cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel appointment',
            error: error.message
        });
    }
};

/**
 * Create standalone event (Admin/Staff only)
 */
export const createEvent = async (req, res) => {
    try {
        const { date, time, description, remarks } = req.body;
        const userId = req.user.userId;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Description is required'
            });
        }

        // Create event/appointment
        const insertQuery = `
            INSERT INTO Appointments (appointment_date, appointment_time, description, status, remarks)
            VALUES ($1, $2, $3, 'Scheduled', $4)
            RETURNING *
        `;

        const result = await query(insertQuery, [
            date,
            time || null,
            description,
            remarks || null
        ]);

        // Log activity
        const activityQuery = `
            INSERT INTO UserActivityLogs (user_id, action, description)
            VALUES ($1, 'event_created', $2)
        `;
        await query(activityQuery, [
            userId,
            `Created event: ${description} on ${date}`
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Event created successfully'
        });

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error.message
        });
    }
};

/**
 * Get all appointments/events (Admin/Staff only)
 */
export const getAllAppointments = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        let whereConditions = [];
        let params = [];
        let paramCount = 1;

        if (startDate) {
            whereConditions.push(`appointment_date >= $${paramCount++}`);
            params.push(startDate);
        }

        if (endDate) {
            whereConditions.push(`appointment_date <= $${paramCount++}`);
            params.push(endDate);
        }

        if (status) {
            whereConditions.push(`status = $${paramCount++}`);
            params.push(status);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const appointmentsQuery = `
            SELECT * FROM Appointments
            ${whereClause}
            ORDER BY appointment_date DESC, appointment_time DESC
        `;

        const result = await query(appointmentsQuery, params);

        res.json({
            success: true,
            data: result.rows,
            message: 'Appointments retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve appointments',
            error: error.message
        });
    }
};