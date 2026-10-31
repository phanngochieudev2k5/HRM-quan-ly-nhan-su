import express from 'express';
import { OrgStructureController } from '../Controllers/OrgStructureController.js';
import { verifyToken } from '../Middlewares/AuthMiddleware.js';

const router = express.Router();

const flexibleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

router.use(flexibleAuth);

router.get('/tree', OrgStructureController.getOrgTree);
router.get('/departments', OrgStructureController.getDepartments);
router.post('/departments', OrgStructureController.createDepartment);
router.put('/departments/:id', OrgStructureController.updateDepartment);
router.delete('/departments/:id', OrgStructureController.deleteDepartment);

router.get('/positions', OrgStructureController.getPositions);
router.post('/positions', OrgStructureController.createPosition);
router.put('/positions/:id', OrgStructureController.updatePosition);
router.delete('/positions/:id', OrgStructureController.deletePosition);

router.get('/employees', OrgStructureController.getEmployees);
router.put('/employees/:id/assign', OrgStructureController.assignEmployee);
router.post('/employees/batch-transfer', OrgStructureController.batchTransferEmployees);
router.post('/sync-roles', OrgStructureController.syncAllUserRoles);

export default router;
