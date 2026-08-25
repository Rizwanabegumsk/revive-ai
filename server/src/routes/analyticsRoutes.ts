import { Router } from 'express';
import {
  getAnalyticsOverview,
  getAnalyticsTrends,
  getAnalyticsMethods,
  getAnalyticsFailures,
  getAnalyticsGateways,
  getTopRecoverable
} from '../controllers/analyticsController';

const router = Router();

router.get('/overview', getAnalyticsOverview);
router.get('/trends', getAnalyticsTrends);
router.get('/methods', getAnalyticsMethods);
router.get('/failures', getAnalyticsFailures);
router.get('/gateways', getAnalyticsGateways);
router.get('/top-recoverable', getTopRecoverable);

export default router;
