import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { ContractController } from '../Controllers/Hr/ContractController.js';

const router = express.Router();

router.get('/my-contracts', verifyToken, ContractController.getMyContracts);
router.post('/:id/sign', verifyToken, ContractController.signContract);

router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/', ContractController.getContracts);
router.get('/:id', ContractController.getContractById);
router.post('/', ContractController.createContract);
router.put('/:id', ContractController.updateContract);
router.delete('/:id', ContractController.deleteContract);

export default router;
