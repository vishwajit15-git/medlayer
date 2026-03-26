/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management APIs
 */

/**
 * @swagger
 * /auth/users:
 *   post:
 *     summary: Create user (Admin only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "reception@clinic.com"
 *             password: "secure123"
 *             role: "receptionist"
 *     responses:
 *       201:
 *         description: User created
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "admin@clinic.com"
 *             password: "secure123"
 *     responses:
 *       200:
 *         description: Login successful (returns JWT)
 */