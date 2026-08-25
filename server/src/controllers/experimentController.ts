import { Request, Response, NextFunction } from 'express';
import { ExperimentService } from '../services/experimentService';

export const getExperiments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experiments = await ExperimentService.getExperiments();
    res.json({ success: true, data: experiments });
  } catch (error) {
    next(error);
  }
};

export const getExperimentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experimentId = Array.isArray(req.params.experimentId) ? req.params.experimentId[0] : req.params.experimentId;
    const analysis = await ExperimentService.getExperimentById(experimentId);

    if (!analysis) {
      res.status(404).json({ success: false, message: `Experiment #${experimentId} not found` });
      return;
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

export const createExperiment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, metric, control, challenger } = req.body;

    if (!name || !control || !challenger) {
      res.status(400).json({ success: false, message: 'Missing required experiment parameters' });
      return;
    }

    const experiment = await ExperimentService.createExperiment({
      name,
      description: description || 'Recovery strategy optimization experiment',
      metric: metric || 'RECOVERY_RATE',
      control,
      challenger
    });

    const analysis = await ExperimentService.getExperimentById(experiment.experimentId);
    res.status(201).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

export const analyzeExperiment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experimentId = Array.isArray(req.params.experimentId) ? req.params.experimentId[0] : req.params.experimentId;
    const analysis = await ExperimentService.analyzeExperiment(experimentId);

    if (!analysis) {
      res.status(404).json({ success: false, message: `Experiment #${experimentId} not found` });
      return;
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

export const activateExperiment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experimentId = Array.isArray(req.params.experimentId) ? req.params.experimentId[0] : req.params.experimentId;
    const experiment = await ExperimentService.activateExperiment(experimentId);

    if (!experiment) {
      res.status(404).json({ success: false, message: `Experiment #${experimentId} not found` });
      return;
    }

    const analysis = await ExperimentService.getExperimentById(experimentId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

export const pauseExperiment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experimentId = Array.isArray(req.params.experimentId) ? req.params.experimentId[0] : req.params.experimentId;
    const experiment = await ExperimentService.pauseExperiment(experimentId);

    if (!experiment) {
      res.status(404).json({ success: false, message: `Experiment #${experimentId} not found` });
      return;
    }

    const analysis = await ExperimentService.getExperimentById(experimentId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};
