import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { EmployeeController } from '../Controllers/Hr/EmployeeController.js';
import { ContractController } from '../Controllers/Hr/ContractController.js';
import { DepartmentController } from '../Controllers/Hr/DepartmentController.js';
import { RecruitmentController } from '../Controllers/Hr/RecruitmentController.js';

const router = express.Router();

router.use(verifyToken, requireRole('HR', 'Admin'));

// Employees
router.get('/employees', EmployeeController.getEmployees);
router.get('/employees/:id', EmployeeController.getEmployeeById);
router.post('/employees', EmployeeController.createEmployee);
router.put('/employees/:id', EmployeeController.updateEmployee);
router.delete('/employees/:id', EmployeeController.deleteEmployee);

// Contracts
router.get('/contracts', ContractController.getContracts);
router.get('/contracts/:id', ContractController.getContractById);
router.post('/contracts', ContractController.createContract);
router.put('/contracts/:id', ContractController.updateContract);
router.delete('/contracts/:id', ContractController.deleteContract);

// Departments & Positions
router.get('/departments', DepartmentController.getDepartments);
router.get('/positions', DepartmentController.getPositions);

// Recruitment Jobs (US-04)
router.get('/recruitment-jobs', RecruitmentController.getJobs);
router.get('/recruitment-jobs/:id', RecruitmentController.getJobById);
router.post('/recruitment-jobs', RecruitmentController.createJob);
router.put('/recruitment-jobs/:id/status', RecruitmentController.updateJobStatus);
router.put('/recruitment-jobs/:id', RecruitmentController.updateJob);
router.delete('/recruitment-jobs/:id', RecruitmentController.deleteJob);

// Candidates (US-05)
router.get('/candidates', RecruitmentController.getCandidates);
router.get('/candidates/:id', RecruitmentController.getCandidateById);
router.post('/candidates', RecruitmentController.createCandidate);
router.put('/candidates/:id/stage', RecruitmentController.updateCandidateStage);
router.put('/candidates/:id', RecruitmentController.updateCandidate);
router.delete('/candidates/:id', RecruitmentController.deleteCandidate);

export default router;
