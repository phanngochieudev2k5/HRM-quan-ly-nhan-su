import { LeaveService } from '../Services/LeaveService.js';
import { sendSuccess, sendError } from '../Utils/ResponseHelper.js';

export class LeaveController {
  /**
   * GET /api/leaves/types
   */
  static async getLeaveTypes(req, res) {
    try {
      const types = await LeaveService.getLeaveTypes();
      return sendSuccess(res, types, 'Lấy danh mục loại nghỉ phép thành công!');
    } catch (error) {
      console.error('[LeaveController.getLeaveTypes] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * GET /api/leaves/quota/:employeeId
   */
  static async getQuota(req, res) {
    try {
      let { employeeId } = req.params;
      if (!employeeId || employeeId === 'me' || employeeId === 'undefined' || employeeId === 'null') {
        employeeId = req.user?.employeeId;
      }
      const { year } = req.query;
      const effectiveEmpId = employeeId || req.user?.employeeId;
      const quota = await LeaveService.getQuota(effectiveEmpId, year);
      return sendSuccess(res, quota, 'Lấy thông tin hạn mức phép thành công!');
    } catch (error) {
      console.error('[LeaveController.getQuota] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * GET /api/leaves/my-requests
   */
  static async getMyRequests(req, res) {
    try {
      const employeeId = req.query.employeeId || req.user?.employeeId;
      const { year } = req.query;
      if (!employeeId) {
        return sendError(res, 'Vui lòng xác định mã nhân viên!', 400);
      }
      const requests = await LeaveService.getMyRequests(employeeId, year);
      return sendSuccess(res, requests, 'Lấy lịch sử đơn nghỉ phép cá nhân thành công!');
    } catch (error) {
      console.error('[LeaveController.getMyRequests] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * POST /api/leaves
   */
  static async createRequest(req, res) {
    try {
      const employeeId = req.body.employeeId || req.user?.employeeId;
      const payload = {
        ...req.body,
        employeeId
      };
      const created = await LeaveService.createLeaveRequest(payload);
      return sendSuccess(res, created, `Nộp đơn xin nghỉ phép [${created.RequestCode}] thành công!`, 201);
    } catch (error) {
      console.error('[LeaveController.createRequest] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * PATCH /api/leaves/:id/cancel
   */
  static async cancelRequest(req, res) {
    try {
      const { id } = req.params;
      const employeeId = req.body.employeeId || req.user?.employeeId;
      const cancelled = await LeaveService.cancelRequest(id, employeeId);
      return sendSuccess(res, cancelled, 'Hủy đơn xin nghỉ phép thành công!');
    } catch (error) {
      console.error('[LeaveController.cancelRequest] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * GET /api/leaves/team
   */
  static async getTeamRequests(req, res) {
    try {
      const managerId = req.query.managerId || req.user?.employeeId;
      const { status, search, q } = req.query;
      if (!managerId) {
        return sendError(res, 'Vui lòng xác định ID người quản lý (managerId)!', 400);
      }
      const requests = await LeaveService.getTeamRequests(managerId, status, search || q);
      return sendSuccess(res, requests, 'Lấy danh sách đơn nghỉ phép nhóm thành công!');
    } catch (error) {
      console.error('[LeaveController.getTeamRequests] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * PATCH /api/leaves/:id/approve
   */
  static async approveRequest(req, res) {
    try {
      const { id } = req.params;
      const approverEmployeeId = req.body.approverEmployeeId || req.user?.employeeId;
      const { responseNote } = req.body;
      const approved = await LeaveService.approveRequest(id, approverEmployeeId, responseNote);
      return sendSuccess(
        res,
        approved,
        `Đã phê duyệt đơn nghỉ phép [${approved.RequestCode}] thành công và đồng bộ dữ liệu vào bảng chấm công!`
      );
    } catch (error) {
      console.error('[LeaveController.approveRequest] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * PATCH /api/leaves/:id/reject
   */
  static async rejectRequest(req, res) {
    try {
      const { id } = req.params;
      const approverEmployeeId = req.body.approverEmployeeId || req.user?.employeeId;
      const { responseNote } = req.body;
      const rejected = await LeaveService.rejectRequest(id, approverEmployeeId, responseNote);
      return sendSuccess(res, rejected, `Đã từ chối đơn nghỉ phép [${rejected.RequestCode}]!`);
    } catch (error) {
      console.error('[LeaveController.rejectRequest] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * GET /api/leaves/all
   */
  static async getAllRequests(req, res) {
    try {
      const { departmentId, leaveTypeId, status, search, q } = req.query;
      const data = await LeaveService.getAllRequests({
        departmentId: departmentId || 'ALL',
        leaveTypeId: leaveTypeId || 'ALL',
        status: status || 'ALL',
        search: search || q || ''
      });
      return sendSuccess(res, data, 'Lấy toàn bộ đơn nghỉ phép công ty thành công!');
    } catch (error) {
      console.error('[LeaveController.getAllRequests] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * GET /api/leaves/colleagues
   */
  static async getColleagues(req, res) {
    try {
      const excludeEmployeeId = req.query.excludeEmployeeId || req.user?.employeeId;
      const { departmentId } = req.query;
      const colleagues = await LeaveService.getColleagues(excludeEmployeeId, departmentId);
      return sendSuccess(res, colleagues, 'Lấy danh sách đồng nghiệp thành công!');
    } catch (error) {
      console.error('[LeaveController.getColleagues] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }
}
