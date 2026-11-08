import express from 'express';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';
import { requireRole } from '../Middlewares/RoleMiddleware.js';
import { LaborContractController } from '../Controllers/LaborContractController.js';
import { terminationUpload } from '../Utils/UploadHelper.js';
import { sendError } from '../Utils/ResponseHelper.js';

const router = express.Router();

const uploadTerminationFiles = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    terminationUpload.fields([
      { name: 'decisionFile', maxCount: 1 },
      { name: 'meetingFile', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        return sendError(res, err.message, 400);
      }
      next();
    });
  } else {
    next();
  }
};

router.use(verifyToken, requireRole('HR', 'Admin'));

router.get('/', LaborContractController.getContracts);
router.get('/stats', LaborContractController.getContractStats);
router.get('/expiring-alerts', LaborContractController.getExpiringAlerts);
router.get('/employees-overview', LaborContractController.getEmployeeContractOverview);
router.get('/history/:employeeId', LaborContractController.getEmployeeContractHistory);
router.get('/:id', LaborContractController.getContractById);
router.post('/', LaborContractController.createContract);
router.put('/:id', LaborContractController.updateContract);
router.delete('/:id', LaborContractController.deleteContract);
router.post('/:id/renew', LaborContractController.renewContract);
router.post('/:id/terminate', uploadTerminationFiles, LaborContractController.terminateContract);
router.post('/:id/respond-resignation', LaborContractController.respondResignation);

export default router;
