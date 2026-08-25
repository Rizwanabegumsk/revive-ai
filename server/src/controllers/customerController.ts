import { Request, Response, NextFunction } from 'express';
import { RecoveryService } from '../services/recoveryService';

export const getCustomers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customers = await RecoveryService.getCustomers();
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customerId = Array.isArray(req.params.customerId) ? req.params.customerId[0] : req.params.customerId;
    const customer = await RecoveryService.getCustomerById(customerId);

    if (!customer) {
      res.status(404).json({ error: { message: `Customer #${customerId} not found`, status: 404 } });
      return;
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};
