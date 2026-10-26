import { sendError } from '../Utils/ResponseHelper.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Truy cập bị từ chối! Quyền của bạn (${req.user?.role || 'Khách'}) không đủ để truy cập tài nguyên này.`,
        403
      );
    }
    next();
  };
};
