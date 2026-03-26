/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment lifecycle APIs
 */

/**
 * @swagger
 * /auth/appointments:
 *   post:
 *     summary: Create appointment
 *     description: Book a new appointment (Receptionist/Admin)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             doctorId: "64abc1234567890abcdef123"
 *             patientId: "64abc1234567890abcdef456"
 *             appointmentDate: "2026-03-30"
 *             appointmentTime: "10:00"
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Invalid input or slot issue
 */

/**
 * @swagger
 * /auth/appointments:
 *   get:
 *     summary: Get appointments
 *     description: Fetch paginated appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2026-03-30"
 *     responses:
 *       200:
 *         description: List of appointments
 */

/**
 * @swagger
 * /auth/appointments/{id}/check-in:
 *   patch:
 *     summary: Check-in patient
 *     description: Mark appointment as CHECKED_IN (Receptionist)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient checked in
 *       400:
 *         description: Invalid state
 */

/**
 * @swagger
 * /auth/appointments/{id}/complete:
 *   patch:
 *     summary: Complete appointment
 *     description: Mark appointment as COMPLETED (Doctor)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment completed
 *       400:
 *         description: Only valid appointments can be completed
 */

/**
 * @swagger
 * /auth/appointments/{id}/notes:
 *   patch:
 *     summary: Add appointment notes
 *     description: Add notes after completion (Doctor only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             notes: "Patient recovering well. Follow-up in 2 weeks."
 *     responses:
 *       200:
 *         description: Notes added
 */

/**
 * @swagger
 * /auth/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel appointment
 *     description: Cancel an appointment (Receptionist/Admin)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 */

/**
 * @swagger
 * /auth/appointments/{id}/reschedule:
 *   patch:
 *     summary: Reschedule appointment
 *     description: Change appointment date/time
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             appointmentDate: "2026-04-01"
 *             appointmentTime: "11:30"
 *     responses:
 *       200:
 *         description: Appointment rescheduled
 */

/**
 * @swagger
 * /auth/appointments/bulk:
 *   get:
 *     summary: Bulk appointment listing
 *     description: Get appointments in date range (Admin use)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-03-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-03-31"
 *     responses:
 *       200:
 *         description: Bulk appointments fetched
 */