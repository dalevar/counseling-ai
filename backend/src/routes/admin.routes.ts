import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { auth } from '../middleware/auth.middleware';
import { uploadSpreadsheet } from '../middleware/upload.middleware';

const router = Router();
const controller = new AdminController();

// All admin routes require auth — role check is enforced in the controller

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform-wide dashboard statistics
 * @access  Admin only
 */
router.get('/stats', auth, controller.getDashboardStats);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users (with filtering by role, status, search)
 * @access  Admin only
 */
router.get('/users', auth, controller.getUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get detailed user profile with metadata
 * @access  Admin only
 */
router.get('/users/:id', auth, controller.getUserDetail);

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @desc    Activate, suspend, or set user status
 * @access  Admin only
 */
router.patch('/users/:id/status', auth, controller.updateUserStatus);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Permanently delete a user account
 * @access  Admin only
 */
router.delete('/users/:id', auth, controller.deleteUser);

/**
 * @route   GET /api/v1/admin/sessions
 * @desc    Get all counseling sessions (with status filter)
 * @access  Admin only
 */
router.get('/sessions', auth, controller.getAllSessions);

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    View audit trail of all sensitive actions
 * @access  Admin only
 */
router.get('/audit-logs', auth, controller.getAuditLogs);

/**
 * @route   GET /api/v1/admin/risk-alerts
 * @desc    View AI-detected high/critical risk conversations
 * @access  Admin only
 */
router.get('/risk-alerts', auth, controller.getRiskAlerts);

/**
 * @route   GET /api/v1/admin/assessment-summary
 * @desc    PHQ-9 and GAD-7 statistics across all users
 * @access  Admin only
 */
router.get('/assessment-summary', auth, controller.getAssessmentSummary);

/**
 * @route   GET /api/v1/admin/schools
 * @desc    Get schools available to current staff
 * @access  Admin | Teacher
 */
router.get('/schools', auth, controller.getSchools);

/**
 * @route   POST /api/v1/admin/schools
 * @desc    Register a new school
 * @access  Admin only
 */
router.post('/schools', auth, controller.createSchool);

/**
 * @route   POST /api/v1/admin/users
 * @desc    Create a new user account (Admin or Guru BK only).
 *          Public self-registration is disabled — all accounts are provisioned by staff.
 *          For STUDENT role, a parent account is auto-created if parentEmail is provided.
 * @access  Admin | Teacher (Guru BK)
 */
router.post('/users', auth, controller.createUser);

/**
 * @route   POST /api/v1/admin/students/import
 * @desc    Bulk import student accounts from Excel or CSV
 * @access  Admin | Teacher
 */
router.post('/students/import', auth, uploadSpreadsheet, controller.importStudents);

export default router;
