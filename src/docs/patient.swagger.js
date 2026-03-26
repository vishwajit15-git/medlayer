/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Patient management APIs
 */

/**
 * @swagger
 * /auth/patients:
 *   post:
 *     summary: Create patient
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Kevin Levin"
 *             age: 22
 *     responses:
 *       201:
 *         description: Patient created
 */

/**
 * @swagger
 * /auth/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 */
/**
 * @swagger
 * /auth/patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     tags: [Patient]
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
 *         description: Patient deleted successfully
 */
/**
 * @swagger
 * /auth/patients/search:
 *   get:
 *     summary: Search patients by name
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: "Ben"
 *     responses:
 *       200:
 *         description: Matching patients
 */