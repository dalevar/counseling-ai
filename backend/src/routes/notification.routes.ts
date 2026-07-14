import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

/**
 * @route   GET /api/v1/notifications
 * @desc    Get all notifications for logged-in user (with ?unread=true filter)
 * @access  Private
 */
router.get('/', auth, controller.list);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/unread-count', auth, controller.unreadCount);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', auth, controller.markAllAsRead);

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Delete all notifications
 * @access  Private
 */
router.delete('/', auth, controller.deleteAll);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
router.patch('/:id/read', auth, controller.markAsRead);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a single notification
 * @access  Private
 */
router.delete('/:id', auth, controller.delete);

export default router;
