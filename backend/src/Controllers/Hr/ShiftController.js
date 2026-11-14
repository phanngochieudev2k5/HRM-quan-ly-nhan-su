import { ShiftService } from '../../Services/ShiftService.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class ShiftController {
  /**
   * GET /api/shifts
   */
  static async getShifts(req, res) {
    try {
      const { isActive, shiftType, search, q } = req.query;
      const shifts = await ShiftService.getShifts({
        isActive,
        shiftType,
        search: search || q
      });
      return sendSuccess(res, shifts, 'Lấy danh sách ca làm việc thành công!');
    } catch (error) {
      console.error('[ShiftController.getShifts] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * POST /api/shifts
   */
  static async createShift(req, res) {
    try {
      const shift = await ShiftService.createShift(req.body);
      return sendSuccess(res, shift, 'Tạo ca làm việc mới thành công!', 201);
    } catch (error) {
      console.error('[ShiftController.createShift] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * PUT /api/shifts/:id
   */
  static async updateShift(req, res) {
    try {
      const { id } = req.params;
      const shift = await ShiftService.updateShift(id, req.body);
      return sendSuccess(res, shift, 'Cập nhật thông tin ca làm việc thành công!');
    } catch (error) {
      console.error('[ShiftController.updateShift] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * PATCH /api/shifts/:id/status
   */
  static async toggleShiftStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive, IsActive } = req.body || {};
      const inputVal = isActive !== undefined ? isActive : IsActive;
      const shift = await ShiftService.toggleShiftStatus(id, inputVal);
      return sendSuccess(
        res,
        shift,
        shift.IsActive ? 'Đã kích hoạt ca làm việc!' : 'Đã tạm ngưng ca làm việc!'
      );
    } catch (error) {
      console.error('[ShiftController.toggleShiftStatus] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * GET /api/shifts/schedule?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&departmentId=...
   */
  static async getSchedule(req, res) {
    try {
      const { startDate, endDate, departmentId, search, q } = req.query;
      const schedule = await ShiftService.getSchedule({
        startDate,
        endDate,
        departmentId,
        search: search || q
      });
      return sendSuccess(res, schedule, 'Lấy bảng phân ca làm việc thành công!');
    } catch (error) {
      console.error('[ShiftController.getSchedule] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * POST /api/shifts/assign
   */
  static async assignShifts(req, res) {
    try {
      const result = await ShiftService.assignShifts(req.body);
      return sendSuccess(
        res,
        result,
        `Phân ca thành công! Thêm mới: ${result.insertedCount}, Cập nhật: ${result.updatedCount}${
          result.skippedCheckedInCount > 0 ? `, Bỏ qua (đã check-in): ${result.skippedCheckedInCount}` : ''
        }`
      );
    } catch (error) {
      console.error('[ShiftController.assignShifts] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }

  /**
   * DELETE /api/shifts/assign/:attendanceId
   */
  static async removeAssignment(req, res) {
    try {
      const { attendanceId } = req.params;
      const result = await ShiftService.removeAssignment(attendanceId);
      return sendSuccess(res, result, 'Đã xóa lịch phân ca trong ngày!');
    } catch (error) {
      console.error('[ShiftController.removeAssignment] Error:', error);
      return sendError(res, error.message, error.statusCode || 500, error);
    }
  }
}
