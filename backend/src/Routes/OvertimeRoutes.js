import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { OvertimeController } from '../Controllers/OvertimeController.js';

const router = express.Router();

router.get('/my', verifyToken, OvertimeController.getMyRequests);
router.post('/my', verifyToken, OvertimeController.createRequest);
router.put('/my/:id/cancel', verifyToken, OvertimeController.cancelRequest);

router.get('/team', verifyToken, requireRole('Manager', 'Admin', 'HR'), OvertimeController.getTeamRequests);
router.put('/:id/approve', verifyToken, requireRole('Manager', 'Admin', 'HR'), OvertimeController.approveRequest);
router.put('/:id/reject', verifyToken, requireRole('Manager', 'Admin', 'HR'), OvertimeController.rejectRequest);

router.get('/', verifyToken, requireRole('HR', 'Admin'), OvertimeController.getAllRequests);

export default router;
