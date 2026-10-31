import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { EmployeeController } from '../Controllers/Hr/EmployeeController.js';
import { ContractController } from '../Controllers/Hr/ContractController.js';
import { DepartmentController } from '../Controllers/Hr/DepartmentController.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

// Employees CRUD
router.get('/employees', EmployeeController.getEmployees);
router.get('/employees/:id', EmployeeController.getEmployeeById);
router.post('/employees', EmployeeController.createEmployee);
router.put('/employees/:id', EmployeeController.updateEmployee);
router.delete('/employees/:id', EmployeeController.deleteEmployee);

// Contracts CRUD
router.get('/contracts', ContractController.getContracts);
router.get('/contracts/:id', ContractController.getContractById);
router.post('/contracts', ContractController.createContract);
router.put('/contracts/:id', ContractController.updateContract);
router.delete('/contracts/:id', ContractController.deleteContract);

// Departments & Positions
router.get('/departments', DepartmentController.getDepartments);
router.get('/positions', DepartmentController.getPositions);

export default router;
