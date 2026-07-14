import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { auth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  chatSchema,
  analyzeEmotionSchema,
  assessRiskSchema,
  recommendationSchema,
  assessmentSchema,
} from '../validations/ai.validation';

const router = Router();
const controller = new AIController();

/**
 * @route   POST /api/v1/ai/chat
 * @desc    Send a message to the AI counselor (create or continue a conversation)
 * @access  Private
 */
router.post('/chat', auth, validate(chatSchema), controller.chat);

/**
 * @route   POST /api/v1/ai/analyze-emotion
 * @desc    Analyze emotion and sentiment of a given text
 * @access  Private
 */
router.post('/analyze-emotion', auth, validate(analyzeEmotionSchema), controller.analyzeEmotion);

/**
 * @route   POST /api/v1/ai/assess-risk
 * @desc    Assess self-harm or mental health risk level in a text
 * @access  Private
 */
router.post('/assess-risk', auth, validate(assessRiskSchema), controller.assessRisk);

/**
 * @route   POST /api/v1/ai/recommendations
 * @desc    Get personalized coping strategy recommendations
 * @access  Private
 */
router.post('/recommendations', auth, validate(recommendationSchema), controller.getRecommendations);

/**
 * @route   GET /api/v1/ai/conversations
 * @desc    Get all AI conversations for the logged-in user
 * @access  Private
 */
router.get('/conversations', auth, controller.getConversations);

/**
 * @route   GET /api/v1/ai/conversations/:id
 * @desc    Get conversation detail with all messages
 * @access  Private
 */
router.get('/conversations/:id', auth, controller.getConversationDetail);

/**
 * @route   POST /api/v1/ai/conversations/:id/summarize
 * @desc    Summarize a conversation using AI
 * @access  Private
 */
router.post('/conversations/:id/summarize', auth, controller.summarize);

/**
 * @route   DELETE /api/v1/ai/conversations/:id
 * @desc    Soft-delete a conversation
 * @access  Private
 */
router.delete('/conversations/:id', auth, controller.deleteConversation);

/**
 * @route   POST /api/v1/ai/assessment
 * @desc    Submit PHQ-9 or GAD-7 mental health assessment
 * @access  Private
 */
router.post('/assessment', auth, validate(assessmentSchema), controller.submitAssessment);

/**
 * @route   GET /api/v1/ai/assessment/history
 * @desc    Get mental health assessment history for the logged-in user
 * @access  Private
 */
router.get('/assessment/history', auth, controller.getAssessmentHistory);

export default router;
