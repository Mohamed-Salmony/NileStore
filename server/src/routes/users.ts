import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

// Current user routes
router.get('/me', requireAuth, userController.getCurrentUser);
router.put('/me', requireAuth, userController.updateUserProfile);
router.post('/welcome-notification', requireAuth, userController.createUserWelcomeNotification);

// Admin routes
router.get('/', requireAuth, requireAdmin, userController.getAllUsers);
router.patch('/:id/role', requireAuth, requireAdmin, userController.updateUserRole);
router.delete('/:id', requireAuth, requireAdmin, userController.deleteUser);

export default router;
