/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: Audit Logging
 */

/**
 * @swagger
 * /auth/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [AuditLog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 */