import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as paymentMethodController from '../controllers/paymentMethodController';

const router = Router();

router.get('/', paymentMethodController.getAllPaymentMethods);
router.get('/:type', paymentMethodController.getPaymentMethodByType);
router.put('/:type', requireAuth, requireAdmin, paymentMethodController.updatePaymentMethod);

export default router;
