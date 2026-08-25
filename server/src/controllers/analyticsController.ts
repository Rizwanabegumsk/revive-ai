import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export const getAnalyticsOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AnalyticsService.getRecoveryOverview();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsTrends = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AnalyticsService.getRecoveryTrends();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsMethods = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AnalyticsService.getRecoveryByMethod();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsFailures = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AnalyticsService.getRecoveryByFailureReason();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsGateways = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AnalyticsService.getRecoveryByGateway();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTopRecoverable = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await AnalyticsService.getTopRecoverablePayments();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
