import { Router } from 'express';
import { JournalController } from '../controllers/journal.controller';
import { auth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createJournalSchema, updateJournalSchema, logMoodSchema } from '../validations/journal.validation';

const router = Router();
const controller = new JournalController();

// ─── Mood Routes (before /:id to avoid param collision) ───────────────────

/**
 * @route   POST /api/v1/journals/mood
 * @desc    Log daily mood score with optional notes
 * @access  Private (Student)
 */
router.post('/mood', auth, validate(logMoodSchema), controller.logMood);

/**
 * @route   GET /api/v1/journals/mood/history
 * @desc    Get mood history for the past N days
 * @access  Private (Student)
 */
router.get('/mood/history', auth, controller.getMoodHistory);

/**
 * @route   GET /api/v1/journals/mood/stats
 * @desc    Get mood statistics (avg, min, max, trend)
 * @access  Private (Student)
 */
router.get('/mood/stats', auth, controller.getMoodStats);

// ─── Journal CRUD ─────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/journals
 * @desc    Create a new personal journal entry
 * @access  Private (Student)
 */
router.post('/', auth, validate(createJournalSchema), controller.create);

/**
 * @route   GET /api/v1/journals
 * @desc    Get all journals for logged-in student (with search & pagination)
 * @access  Private (Student)
 */
router.get('/', auth, controller.list);

/**
 * @route   GET /api/v1/journals/:id
 * @desc    Get a single journal entry by ID
 * @access  Private (Student - owner only)
 */
router.get('/:id', auth, controller.getById);

/**
 * @route   PUT /api/v1/journals/:id
 * @desc    Update a journal entry
 * @access  Private (Student - owner only)
 */
router.put('/:id', auth, validate(updateJournalSchema), controller.update);

/**
 * @route   DELETE /api/v1/journals/:id
 * @desc    Delete a journal entry
 * @access  Private (Student - owner only)
 */
router.delete('/:id', auth, controller.delete);

export default router;
