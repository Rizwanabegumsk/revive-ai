import { Request, Response, NextFunction } from 'express';
import { RecoveryService } from '../services/recoveryService';

export const getPayments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payments = await RecoveryService.getPayments();
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentId = Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId;
    const data = await RecoveryService.getPaymentById(paymentId);

    if (!data) {
      res.status(404).json({ error: { message: `Payment #${paymentId} not found`, status: 404 } });
      return;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
