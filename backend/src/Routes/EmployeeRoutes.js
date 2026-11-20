import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { EmployeeController } from '../Controllers/Hr/EmployeeController.js';

const router = express.Router();

router.get('/me', verifyToken, EmployeeController.getMyProfile);
router.put('/me', verifyToken, EmployeeController.updateMyProfile);

router.get('/team', verifyToken, requireRole('Manager', 'Admin', 'HR'), EmployeeController.getTeamMembers);
router.get('/team/:id', verifyToken, requireRole('Manager', 'Admin', 'HR'), EmployeeController.getEmployeeById);

router.get('/unassigned-users', verifyToken, requireRole('HR', 'Admin'), EmployeeController.getUnassignedUsers);
router.get('/', verifyToken, requireRole('HR', 'Admin'), EmployeeController.getEmployees);
router.get('/:id', verifyToken, requireRole('HR', 'Admin'), EmployeeController.getEmployeeById);
router.post('/', verifyToken, requireRole('HR', 'Admin'), EmployeeController.createEmployee);
router.put('/:id', verifyToken, requireRole('HR', 'Admin'), EmployeeController.updateEmployee);
router.delete('/:id', verifyToken, requireRole('HR', 'Admin'), EmployeeController.deleteEmployee);

export default router;
