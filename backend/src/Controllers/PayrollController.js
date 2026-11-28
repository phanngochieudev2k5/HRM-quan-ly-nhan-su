import { PayrollModel } from '../Models/PayrollModel.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

function parsePeriodQuery(source) {
  const now = new Date();
  let year = Number(source.year);
  let month = Number(source.month);

  if (source.period && typeof source.period === 'string' && source.period.includes('-')) {
    const [y, m] = source.period.split('-').map(Number);
    if (y > 2000 && m >= 1 && m <= 12) {
      year = y;
      month = m;
    }
  }

  if (!year || isNaN(year)) year = now.getFullYear();
  if (!month || isNaN(month) || month < 1 || month > 12) month = now.getMonth() + 1;

  return {
    year,
    month,
    standardWorkDays: source.standardWorkDays ? Number(source.standardWorkDays) : undefined
  };
}

export class PayrollController {
  static async getPeriods(req, res) {
    try {
      const periods = await PayrollModel.getPeriodsList(false);
      return sendSuccess(res, periods, 'Lấy danh sách kỳ lương thành công!');
    } catch (error) {
      console.error('[PayrollController.getPeriods]', error);
      return sendError(res, error.message || 'Lỗi tải danh sách kỳ lương', 500);
    }
  }

  static async getMyPeriods(req, res) {
    try {
      const periods = await PayrollModel.getPeriodsList(false);
      return sendSuccess(res, periods, 'Lấy danh sách kỳ lương thành công!');
    } catch (error) {
      console.error('[PayrollController.getMyPeriods]', error);
      return sendError(res, error.message || 'Lỗi tải danh sách kỳ lương', 500);
    }
  }

  static async getConfig(req, res) {
    try {
      const data = await PayrollModel.getFormulaConfig();
      return sendSuccess(res, data, 'Lấy cấu hình công thức lương thành công!');
    } catch (error) {
      console.error('[PayrollController.getConfig]', error);
      return sendError(res, error.message || 'Lỗi tải cấu hình công thức lương', 500);
    }
  }

  static async updateConfig(req, res) {
    try {
      const saved = await PayrollModel.saveFormulaConfig(req.body || {});
      return sendSuccess(res, saved, 'Lưu cấu hình công thức tính lương thành công!');
    } catch (error) {
      console.error('[PayrollController.updateConfig]', error);
      return sendError(res, error.message || 'Lỗi lưu cấu hình công thức', 500);
    }
  }

  static async getPayrollPreview(req, res) {
    try {
      const { year, month, standardWorkDays } = parsePeriodQuery(req.query);
      const data = await PayrollModel.aggregatePayrollData({ year, month, standardWorkDays });
      return sendSuccess(res, data, `Tổng hợp bảng lương kỳ ${data.periodCode} thành công!`);
    } catch (error) {
      console.error('[PayrollController.getPayrollPreview]', error);
      return sendError(res, error.message || 'Lỗi tổng hợp dữ liệu bảng lương', 500);
    }
  }

  static async calculateAndSaveDraft(req, res) {
    try {
      const { year, month, standardWorkDays } = parsePeriodQuery(req.body);
      const userId = req.user?.userId || req.user?.id || null;
      const data = await PayrollModel.savePayrollToDatabase({
        year,
        month,
        standardWorkDays,
        lock: false,
        userId
      });
      return sendSuccess(res, data, `Đã tính toán và lưu nháp bảng lương kỳ ${data.periodCode} vào CSDL!`);
    } catch (error) {
      console.error('[PayrollController.calculateAndSaveDraft]', error);
      return sendError(res, error.message || 'Lỗi tính toán và lưu bảng lương', 400);
    }
  }

  static async saveAdjustment(req, res) {
    try {
      const { periodCode, employeeId, manualWorkDays, bonusAmount, advanceAmount, otherDeduction, note } = req.body;
      if (!periodCode || !employeeId) {
        return sendError(res, 'Thiếu thông tin kỳ lương hoặc nhân viên!', 400);
      }

      await PayrollModel.saveAdjustment({
        periodCode,
        employeeId: Number(employeeId),
        manualWorkDays,
        bonusAmount,
        advanceAmount,
        otherDeduction,
        note
      });

      const [year, month] = periodCode.split('-').map(Number);
      const updated = await PayrollModel.aggregatePayrollData({ year, month });
      return sendSuccess(res, updated, 'Đã cập nhật khoản điều chỉnh & tính lại lương!');
    } catch (error) {
      console.error('[PayrollController.saveAdjustment]', error);
      return sendError(res, error.message || 'Lỗi cập nhật điều chỉnh lương', 400);
    }
  }

  static async lockPeriod(req, res) {
    try {
      const { year, month, standardWorkDays } = parsePeriodQuery(req.body);
      const userId = req.user?.userId || req.user?.id || null;
      const data = await PayrollModel.savePayrollToDatabase({
        year,
        month,
        standardWorkDays,
        lock: true,
        userId
      });
      return sendSuccess(res, data, `Đã chốt và khóa sổ bảng lương kỳ ${data.periodCode} thành công!`);
    } catch (error) {
      console.error('[PayrollController.lockPeriod]', error);
      return sendError(res, error.message || 'Lỗi chốt bảng lương', 400);
    }
  }

  static async unlockPeriod(req, res) {
    try {
      const { year, month } = parsePeriodQuery(req.body);
      await PayrollModel.unlockPeriod({ year, month });
      const data = await PayrollModel.aggregatePayrollData({ year, month });
      return sendSuccess(res, data, `Đã mở khóa bảng lương kỳ ${data.periodCode}!`);
    } catch (error) {
      console.error('[PayrollController.unlockPeriod]', error);
      return sendError(res, error.message || 'Lỗi mở khóa bảng lương', 400);
    }
  }

  static async getMyPayslip(req, res) {
    try {
      const { year, month } = parsePeriodQuery(req.query);
      const role = req.user?.role || '';
      const isPrivileged = ['Finance', 'Admin', 'HR'].includes(role);

      const hasExplicitTarget = isPrivileged && Boolean(req.query.employeeId || req.query.employeeCode);
      const employeeId = hasExplicitTarget
        ? (req.query.employeeId || null)
        : (req.user?.employeeId || req.user?.EmployeeId || null);
      const employeeCode = hasExplicitTarget
        ? (req.query.employeeCode || null)
        : (req.user?.employeeCode || req.user?.EmployeeCode || null);
      const userId = hasExplicitTarget ? null : (req.user?.userId || req.user?.id || null);
      const includeDraft = req.query.includeDraft !== 'false';

      const result = await PayrollModel.getEmployeePayslip({
        year,
        month,
        userId,
        employeeId,
        employeeCode,
        includeDraft
      });
      return sendSuccess(res, result, 'Lấy phiếu lương cá nhân thành công!');
    } catch (error) {
      console.error('[PayrollController.getMyPayslip]', error);
      return sendError(res, error.message || 'Lỗi lấy phiếu lương cá nhân', 500);
    }
  }

  static async submitFeedback(req, res) {
    try {
      const { periodCode, content } = req.body || {};
      if (!periodCode || !content || !content.trim()) {
        return sendError(res, 'Vui lòng nhập đầy đủ nội dung phản hồi kỳ lương!', 400);
      }

      const created = await PayrollModel.createFeedback({
        periodCode,
        userId: req.user?.userId || req.user?.id || null,
        employeeId: req.user?.employeeId || req.user?.EmployeeId || null,
        employeeCode: req.user?.employeeCode || req.user?.EmployeeCode || null,
        content
      });

      return sendSuccess(res, created, 'Đã gửi phản hồi kỳ lương tới Bộ phận Kế toán!', 201);
    } catch (error) {
      console.error('[PayrollController.submitFeedback]', error);
      return sendError(res, error.message || 'Lỗi gửi phản hồi kỳ lương', 400);
    }
  }

  static async getMyFeedbacks(req, res) {
    try {
      const periodCode = req.query.period || null;
      const list = await PayrollModel.getMyFeedbacks({
        periodCode,
        userId: req.user?.userId || req.user?.id || null,
        employeeId: req.user?.employeeId || req.user?.EmployeeId || null,
        employeeCode: req.user?.employeeCode || req.user?.EmployeeCode || null
      });
      return sendSuccess(res, list, 'Lấy lịch sử phản hồi kỳ lương thành công!');
    } catch (error) {
      console.error('[PayrollController.getMyFeedbacks]', error);
      return sendError(res, error.message || 'Lỗi lấy lịch sử phản hồi', 500);
    }
  }

  static async getAllFeedbacks(req, res) {
    try {
      const periodCode = req.query.period || null;
      const status = req.query.status || 'ALL';
      const list = await PayrollModel.getAllFeedbacks({ periodCode, status });
      return sendSuccess(res, list, 'Lấy danh sách phản hồi lương từ nhân viên thành công!');
    } catch (error) {
      console.error('[PayrollController.getAllFeedbacks]', error);
      return sendError(res, error.message || 'Lỗi lấy danh sách phản hồi lương', 500);
    }
  }

  static async resolveFeedback(req, res) {
    try {
      const { id } = req.params;
      const { status, accountantReply } = req.body || {};
      const updated = await PayrollModel.resolveFeedback({
        feedbackId: id,
        status: status || 'Đã xử lý',
        accountantReply,
        handledByUserId: req.user?.userId || req.user?.id || null
      });
      if (!updated) {
        return sendError(res, 'Không tìm thấy phản hồi cần xử lý!', 404);
      }
      return sendSuccess(res, updated, 'Đã cập nhật trạng thái phản hồi kỳ lương!');
    } catch (error) {
      console.error('[PayrollController.resolveFeedback]', error);
      return sendError(res, error.message || 'Lỗi xử lý phản hồi kỳ lương', 400);
    }
  }
}
