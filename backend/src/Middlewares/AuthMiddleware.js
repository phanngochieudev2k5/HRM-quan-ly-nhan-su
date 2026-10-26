import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../Config/JwtConfig.js';
import { sendError } from '../Utils/ResponseHelper.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Chưa đăng nhập! Vui lòng cung cấp token hợp lệ.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 401);
    }
    return sendError(res, 'Token không hợp lệ!', 401, error);
  }
};
