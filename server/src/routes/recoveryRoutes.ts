import { Router } from 'express';
import {
  getRecoveryDecisions,
  getRecoveryDecisionById,
  getRecoveryOutcomes,
  evaluatePolicy,
  executeRecoveryController,
  getRecoveryEventsController
} from '../controllers/recoveryController';

const router = Router();

router.get('/decisions', getRecoveryDecisions);
router.get('/decisions/:decisionId', getRecoveryDecisionById);
router.get('/outcomes', getRecoveryOutcomes);
router.post('/evaluate', evaluatePolicy);
router.post('/evaluate/:paymentId', evaluatePolicy);
router.post('/execute', executeRecoveryController);
router.post('/execute/:paymentId', executeRecoveryController);
router.get('/events/:paymentId', getRecoveryEventsController);

export default router;
