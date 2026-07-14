import { Router } from 'express';
import { CounselingController } from '../controllers/counseling.controller';
import { auth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  bookSessionSchema,
  updateStatusSchema,
  addNotesSchema,
  submitFeedbackSchema,
} from '../validations/counseling.validation';

const router = Router();
const controller = new CounselingController();

router.post('/', auth, validate(bookSessionSchema), controller.bookSession);
router.get('/', auth, controller.listSessions);
router.get('/:id', auth, controller.getSessionDetail);
router.put('/:id/status', auth, validate(updateStatusSchema), controller.updateStatus);
router.put('/:id/notes', auth, validate(addNotesSchema), controller.addNotes);
router.put('/:id/feedback', auth, validate(submitFeedbackSchema), controller.submitFeedback);
router.get('/:id/chat', auth, controller.getChatHistory);

export default router;
