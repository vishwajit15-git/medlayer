/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Doctor management & schedule APIs
 */

/**
 * @swagger
 * /auth/doctors:
 *   post:
 *     summary: Create doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Dr Ben Tennyson"
 *             specialization: "Cardiology"
 *             availability:
 *               - startTime: "09:00"
 *                 endTime: "13:00"
 *               - startTime: "16:00"
 *                 endTime: "20:00"
 *     responses:
 *       201:
 *         description: Doctor created
 */

/**
 * @swagger
 * /auth/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 */

/**
 * @swagger
 * /auth/doctors/{doctorId}/available-slots:
 *   get:
 *     summary: Get available slots
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-03-30"
 *     responses:
 *       200:
 *         description: Available slots
 */

/**
 * @swagger
 * /auth/doctors/{doctorId}/schedule:
 *   get:
 *     summary: Get doctor schedule
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full day schedule
 */
/**
 * @swagger
 * /auth/doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     tags: [Doctor]
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
 *         description: Doctor deleted successfully
 */
/**
 * @swagger
 * /auth/doctor-breaks:
 *   post:
 *     summary: Create doctor break
 *     tags: [DoctorBreak]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             doctorId: "64f123abc..."
 *             date: "2026-03-30"
 *             startTime: "13:00"
 *             endTime: "14:00"
 *     responses:
 *       201:
 *         description: Break created
 */
/**
 * @swagger
 * /auth/doctor-holidays:
 *   post:
 *     summary: Create doctor holiday
 *     tags: [DoctorHoliday]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             doctorId: "64f123abc..."
 *             date: "2026-04-01"
 *     responses:
 *       201:
 *         description: Holiday created
 */
/**
 * @swagger
 * /auth/doctor-holidays:
 *   get:
 *     summary: Get doctor holidays
 *     tags: [DoctorHoliday]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of holidays
 */
/**
 * @swagger
 * /auth/doctor-holidays/{id}:
 *   delete:
 *     summary: Delete doctor holiday
 *     tags: [DoctorHoliday]
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
 *         description: Holiday deleted
 */