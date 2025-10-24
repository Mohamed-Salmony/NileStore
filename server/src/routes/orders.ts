import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/validation';
import * as orderController from '../controllers/orderController';

const router = Router();

router.get('/', requireAuth, orderController.getAllOrders);
router.get('/:id', requireAuth, orderController.getOrderById);
router.post('/', requireAuth, validate(createOrderSchema), orderController.createOrder);
router.patch('/:id/status', requireAuth, requireAdmin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
