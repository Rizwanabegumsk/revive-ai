import { Request, Response, NextFunction } from 'express';
import { RecoveryService } from '../services/recoveryService';
import { PolicyService } from '../services/policyService';
import { RecoveryExecutionService } from '../services/recoveryExecutionService';
import { RecoveryExecutor } from '../services/recoveryExecutor';

export const getRecoveryDecisions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const decisions = await RecoveryService.getRecoveryDecisions();
    res.json(decisions);
  } catch (error) {
    next(error);
  }
};

export const getRecoveryDecisionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const decisionId = Array.isArray(req.params.decisionId) ? req.params.decisionId[0] : req.params.decisionId;
    const decision = await RecoveryService.getRecoveryDecisionById(decisionId);

    if (!decision) {
      res.status(404).json({ success: false, message: `Recovery decision #${decisionId} not found` });
      return;
    }

    res.json(decision);
  } catch (error) {
    next(error);
  }
};

export const getRecoveryOutcomes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const outcomes = await RecoveryService.getRecoveryOutcomes();
    res.json(outcomes);
  } catch (error) {
    next(error);
  }
};

export const evaluatePolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentId = req.body?.paymentId || (Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId);
    if (!paymentId) {
      res.status(400).json({ success: false, message: 'paymentId is required' });
      return;
    }

    const result = await PolicyService.evaluateAndPersist(paymentId);

    if (!result) {
      res.status(404).json({ success: false, message: `Payment #${paymentId} not found` });
      return;
    }

    res.json({
      paymentId: result.payment.paymentId,
      decisionId: result.decision.decisionId,
      policyResult: result.policyResult
    });
  } catch (error) {
    next(error);
  }
};

export const executeRecoveryController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentId = req.body?.paymentId || (Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId);
    if (!paymentId) {
      res.status(400).json({ success: false, message: 'paymentId is required' });
      return;
    }

    const forceFailure = req.body?.simulateFailure === true;
    const result = await RecoveryExecutionService.executeRecovery(paymentId, forceFailure);

    if (result.status === 'NOT_FOUND') {
      res.status(404).json(result);
      return;
    }

    if (result.status === 'BLOCKED') {
      res.status(403).json(result);
      return;
    }

    if (result.status === 'ALREADY_RECOVERED') {
      res.status(409).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getRecoveryEventsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentId = Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId;
    const events = await RecoveryExecutor.getPaymentEvents(paymentId);
    res.json(events);
  } catch (error) {
    next(error);
  }
};
