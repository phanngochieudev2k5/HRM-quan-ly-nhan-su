import { AuthService } from '../Services/AuthService.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

export class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login({ username, password });
      return sendSuccess(res, data, 'Đăng nhập thành công!');
    } catch (error) {
      return sendError(res, error.message, 400, error);
    }
  }

  static async register(req, res) {
    try {
      const { username, password, email, fullName, phone } = req.body;
      const data = await AuthService.register({ username, password, email, fullName, phone });
      return sendSuccess(res, data, 'Đăng ký tài khoản thành công! Phân quyền mặc định: Nhân viên (Employee).', 201);
    } catch (error) {
      return sendError(res, error.message, 400, error);
    }
  }

  static async getMe(req, res) {
    try {
      const userId = req.user.userId;
      const data = await AuthService.getMe(userId);
      return sendSuccess(res, data, 'Lấy thông tin tài khoản thành công!');
    } catch (error) {
      return sendError(res, error.message, 400, error);
    }
  }

  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(userId, currentPassword, newPassword);
      return sendSuccess(res, null, 'Đổi mật khẩu thành công!');
    } catch (error) {
      return sendError(res, error.message, 400, error);
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updatedUser = await AuthService.updateProfile(userId, req.body);
      return sendSuccess(res, updatedUser, 'Cập nhật thông tin tài khoản thành công!');
    } catch (error) {
      return sendError(res, error.message, 400, error);
    }
  }

  static async logout(req, res) {
    return sendSuccess(res, null, 'Đăng xuất thành công!');
  }
}
