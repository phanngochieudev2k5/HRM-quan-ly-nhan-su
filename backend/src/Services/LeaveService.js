import { LeaveModel } from '../Models/LeaveModel.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const createHttpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

export class LeaveService {
  /**
   * Lấy danh mục loại nghỉ phép
   */
  static async getLeaveTypes() {
    return await LeaveModel.getLeaveTypes();
  }

  /**
   * Lấy hạn mức và số dư ngày phép của nhân viên
   */
  static async getQuota(employeeId, year) {
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const empId = parseInt(employeeId, 10);
    if (!empId || Number.isNaN(empId)) {
      return {
        employee: null,
        year: targetYear,
        standardAnnualQuota: 12.0,
        approvedAnnualDays: 0,
        pendingAnnualDays: 0,
        remainingAnnualDays: 12.0,
        availableAnnualDays: 12.0,
        usedSickDays: 0,
        usedUnpaidDays: 0,
        usedOtherDays: 0
      };
    }
    return await LeaveModel.getQuota(empId, targetYear);
  }

  /**
   * Tạo đơn xin nghỉ phép mới (Employee - US-23)
   */
  static async createLeaveRequest({
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    totalDays,
    reason,
    handoverToEmployeeId
  }) {
    const empId = parseInt(employeeId, 10);
    if (!empId || Number.isNaN(empId)) {
      throw createHttpError('Vui lòng xác định nhân viên nộp đơn (employeeId)!', 400);
    }

    const typeId = parseInt(leaveTypeId, 10);
    if (!typeId || Number.isNaN(typeId)) {
      throw createHttpError('Vui lòng chọn loại nghỉ phép hợp lệ!', 400);
    }

    if (!startDate || !DATE_REGEX.test(startDate)) {
      throw createHttpError('Ngày bắt đầu (startDate) không hợp lệ (định dạng YYYY-MM-DD)!', 400);
    }
    if (!endDate || !DATE_REGEX.test(endDate)) {
      throw createHttpError('Ngày kết thúc (endDate) không hợp lệ (định dạng YYYY-MM-DD)!', 400);
    }
    if (startDate > endDate) {
      throw createHttpError('Ngày bắt đầu không được lớn hơn ngày kết thúc!', 400);
    }

    if (!reason || !String(reason).trim()) {
      throw createHttpError('Vui lòng nhập lý do xin nghỉ phép!', 400);
    }

    // 1. Kiểm tra loại nghỉ phép có tồn tại
    const leaveType = await LeaveModel.getLeaveTypeById(typeId);
    if (!leaveType) {
      throw createHttpError('Loại nghỉ phép không tồn tại trong hệ thống!', 404);
    }

    // 2. Tính toán số ngày nghỉ
    let calculatedDays = totalDays !== undefined && totalDays !== null ? parseFloat(totalDays) : null;
    if (calculatedDays === null || Number.isNaN(calculatedDays) || calculatedDays <= 0) {
      const startD = new Date(`${startDate}T00:00:00`);
      const endD = new Date(`${endDate}T00:00:00`);
      calculatedDays = Math.round((endD.getTime() - startD.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    }

    // 3. Kiểm tra trùng lặp khoảng thời gian nghỉ
    const overlap = await LeaveModel.checkOverlap(empId, startDate, endDate);
    if (overlap) {
      throw createHttpError(
        `Bạn đã có đơn nghỉ phép [${overlap.RequestCode}] (${overlap.TypeName}) từ ngày ${overlap.StartDate} đến ${overlap.EndDate} đang ở trạng thái "${overlap.Status}"!`,
        409
      );
    }

    // 4. Nếu là Nghỉ phép năm (ANNUAL) -> Kiểm tra số dư ngày phép
    if (leaveType.TypeCode === 'ANNUAL') {
      const startYear = new Date(`${startDate}T00:00:00`).getFullYear();
      const quota = await LeaveModel.getQuota(empId, startYear);
      if (quota.remainingAnnualDays < calculatedDays) {
        throw createHttpError(
          `Số ngày phép năm còn lại trong năm ${startYear} (${quota.remainingAnnualDays} ngày) không đủ để xin nghỉ ${calculatedDays} ngày!`,
          400
        );
      }
    }

    // 5. Tự động sinh mã đơn
    const requestCode = await LeaveModel.generateRequestCode();

    const handoverId = handoverToEmployeeId ? parseInt(handoverToEmployeeId, 10) : null;

    return await LeaveModel.createLeaveRequest({
      requestCode,
      employeeId: empId,
      leaveTypeId: typeId,
      startDate,
      endDate,
      totalDays: calculatedDays,
      reason: String(reason).trim(),
      handoverToEmployeeId: handoverId && !Number.isNaN(handoverId) ? handoverId : null
    });
  }

  /**
   * Lấy lịch sử đơn xin nghỉ phép cá nhân (Employee - US-23)
   */
  static async getMyRequests(employeeId, year) {
    const empId = parseInt(employeeId, 10);
    if (!empId || Number.isNaN(empId)) {
      throw createHttpError('ID nhân viên không hợp lệ!', 400);
    }
    const targetYear = year ? parseInt(year, 10) : null;
    return await LeaveModel.getMyRequests(empId, targetYear);
  }

  /**
   * Hủy đơn xin nghỉ phép cá nhân (Employee - US-23)
   */
  static async cancelRequest(requestId, employeeId) {
    const reqId = parseInt(requestId, 10);
    const empId = parseInt(employeeId, 10);
    if (!reqId || Number.isNaN(reqId)) {
      throw createHttpError('Mã đơn không hợp lệ!', 400);
    }
    return await LeaveModel.cancelRequest(reqId, empId);
  }

  /**
   * Lấy danh sách đơn nghỉ phép của nhóm trực thuộc (Manager - US-17)
   */
  static async getTeamRequests(managerEmployeeId, status, search) {
    const mgrId = parseInt(managerEmployeeId, 10);
    if (!mgrId || Number.isNaN(mgrId)) {
      throw createHttpError('ID người quản lý không hợp lệ!', 400);
    }
    return await LeaveModel.getTeamRequests(mgrId, status, search);
  }

  /**
   * Phê duyệt đơn xin nghỉ phép (Manager / HR - US-17, US-12)
   */
  static async approveRequest(requestId, approverEmployeeId, responseNote) {
    const reqId = parseInt(requestId, 10);
    const apprvId = parseInt(approverEmployeeId, 10);
    if (!reqId || Number.isNaN(reqId)) {
      throw createHttpError('Mã đơn không hợp lệ!', 400);
    }
    if (!apprvId || Number.isNaN(apprvId)) {
      throw createHttpError('ID người phê duyệt không hợp lệ!', 400);
    }

    return await LeaveModel.approveRequest(reqId, apprvId, responseNote);
  }

  /**
   * Từ chối đơn xin nghỉ phép (Manager / HR - US-17, US-12)
   */
  static async rejectRequest(requestId, approverEmployeeId, responseNote) {
    const reqId = parseInt(requestId, 10);
    const apprvId = parseInt(approverEmployeeId, 10);
    if (!reqId || Number.isNaN(reqId)) {
      throw createHttpError('Mã đơn không hợp lệ!', 400);
    }
    if (!apprvId || Number.isNaN(apprvId)) {
      throw createHttpError('ID người phê duyệt không hợp lệ!', 400);
    }

    return await LeaveModel.rejectRequest(reqId, apprvId, responseNote);
  }

  /**
   * Lấy toàn bộ đơn nghỉ phép toàn công ty & Thống kê (HR - US-12)
   */
  static async getAllRequests(filters) {
    return await LeaveModel.getAllRequests(filters);
  }

  /**
   * Lấy danh sách đồng nghiệp để chọn người nhận bàn giao
   */
  static async getColleagues(excludeEmployeeId, departmentId) {
    const excId = excludeEmployeeId ? parseInt(excludeEmployeeId, 10) : null;
    return await LeaveModel.getColleagues(excId, departmentId);
  }
}
