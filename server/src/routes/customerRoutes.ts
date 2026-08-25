import { Router } from 'express';
import { getCustomers, getCustomerById } from '../controllers/customerController';

const router = Router();

router.get('/', getCustomers);
router.get('/:customerId', getCustomerById);

export default router;
