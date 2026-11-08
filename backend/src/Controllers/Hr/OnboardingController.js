import { OnboardingModel } from '../../Models/OnboardingModel.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class OnboardingController {
  static async getOnboardings(req, res) {
    try {
      await OnboardingModel.seedInitialDataIfEmpty();
      const { search, status, q } = req.query;
      const list = await OnboardingModel.getAll({
        search: search || q,
        status
      });
      return sendSuccess(res, list, 'Lấy danh sách tiếp nhận Onboarding thành công!');
    } catch (error) {
      console.error('[OnboardingController.getOnboardings] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  static async getOnboardingById(req, res) {
    try {
      const { id } = req.params;
      const onb = await OnboardingModel.getById(id);
      if (!onb) {
        return sendError(res, 'Không tìm thấy hồ sơ tiếp nhận!', 404);
      }
      return sendSuccess(res, onb, 'Lấy chi tiết hồ sơ tiếp nhận thành công!');
    } catch (error) {
      console.error('[OnboardingController.getOnboardingById] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  static async createOnboarding(req, res) {
    try {
      const { CandidateName, PositionName, DepartmentId } = req.body;
      if (!CandidateName || !DepartmentId) {
        return sendError(res, 'Vui lòng cung cấp Họ tên nhân viên và Phòng ban tiếp nhận!', 400);
      }

      const created = await OnboardingModel.create(req.body);
      return sendSuccess(res, created, 'Tạo hồ sơ tiếp nhận Onboarding thành công!', 201);
    } catch (error) {
      console.error('[OnboardingController.createOnboarding] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  static async updateChecklist(req, res) {
    try {
      const { id } = req.params;
      const updated = await OnboardingModel.updateChecklist(id, req.body);
      return sendSuccess(res, updated, 'Cập nhật tiến trình tiếp nhận Onboarding thành công!');
    } catch (error) {
      console.error('[OnboardingController.updateChecklist] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  static async createAccount(req, res) {
    try {
      const { id } = req.params;
      const result = await OnboardingModel.createAccount(id, req.body);
      return sendSuccess(res, result, 'Khởi tạo tài khoản nhân viên thành công!');
    } catch (error) {
      console.error('[OnboardingController.createAccount] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  static async sendAccountEmail(req, res) {
    try {
      const { id } = req.params;
      const result = await OnboardingModel.sendAccountEmail(id, req.body);
      return sendSuccess(res, result, 'Gửi email cấp tài khoản thành công!');
    } catch (error) {
      console.error('[OnboardingController.sendAccountEmail] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  static async convertToEmployee(req, res) {
    try {
      const { id } = req.params;
      const result = await OnboardingModel.convertToEmployee(id, req.body);
      return sendSuccess(res, result, 'Chuyển nhân sự thành Nhân viên chính thức thành công!');
    } catch (error) {
      console.error('[OnboardingController.convertToEmployee] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  static async deleteOnboarding(req, res) {
    try {
      const { id } = req.params;
      const result = await OnboardingModel.delete(id);
      return sendSuccess(res, result, 'Xóa hồ sơ tiếp nhận thành công!');
    } catch (error) {
      console.error('[OnboardingController.deleteOnboarding] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }
}
