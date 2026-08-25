import { Router } from 'express';
import { getPayments, getPaymentById } from '../controllers/paymentController';

const router = Router();

router.get('/', getPayments);
router.get('/:paymentId', getPaymentById);

export default router;
