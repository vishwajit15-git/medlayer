/**
 * @swagger
 * tags:
 *   name: Clinic
 *   description: Clinic management APIs
 */

/**
 * @swagger
 * /auth/register-clinic:
 *   post:
 *     summary: Register new clinic
 *     tags: [Clinic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             clinicName: "OmniCare Clinic"
 *             email: "admin@clinic.com"
 *             password: "secure123"
 *     responses:
 *       201:
 *         description: Clinic registered
 */

/**
 * @swagger
 * /auth/clinic/settings:
 *   put:
 *     summary: Update clinic settings (Admin only)
 *     tags: [Clinic]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             workingHours:
 *               startTime: "09:00"
 *               endTime: "18:00"
 *             settings:
 *               workingDays: ["MON","TUE","WED","THU","FRI"]
 *     responses:
 *       200:
 *         description: Settings updated
 */