import { Router } from 'express';
import {
  getExperiments,
  getExperimentById,
  createExperiment,
  analyzeExperiment,
  activateExperiment,
  pauseExperiment
} from '../controllers/experimentController';

const router = Router();

router.get('/', getExperiments);
router.get('/:experimentId', getExperimentById);
router.post('/', createExperiment);
router.post('/:experimentId/analyze', analyzeExperiment);
router.post('/:experimentId/activate', activateExperiment);
router.post('/:experimentId/pause', pauseExperiment);

export default router;
