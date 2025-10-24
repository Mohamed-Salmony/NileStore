import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as governorateController from '../controllers/governorateController';

const router = Router();

router.get('/', governorateController.getAllGovernorates);
router.get('/:id', governorateController.getGovernorateById);
router.post('/', requireAuth, requireAdmin, governorateController.createGovernorate);
router.put('/:id', requireAuth, requireAdmin, governorateController.updateGovernorate);
router.delete('/:id', requireAuth, requireAdmin, governorateController.deleteGovernorate);
router.post('/bulk-update', requireAuth, requireAdmin, governorateController.bulkUpdateShippingCost);

export default router;
