import { ShiftModel } from '../Models/ShiftModel.js';
import { ShiftScheduleModel } from '../Models/ShiftScheduleModel.js';
import { connectDb, sql } from '../Config/DbConfig.js';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Chuyển đổi chuỗi giờ HH:mm sang số phút tính từ 00:00
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(TIME_REGEX);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
};

/**
 * Tính toán tổng thời gian ca, thời gian nghỉ giữa ca và số giờ công chuẩn
 * Hỗ trợ ca đêm qua ngày hôm sau (VD: 22:00 - 06:00)
 */
export const calculateShiftMetrics = (startTime, endTime, breakStartTime, breakEndTime) => {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (startMin === null || endMin === null) {
    return {
      isOvernight: false,
      grossMinutes: 0,
      breakMinutes: 0,
      netMinutes: 0,
      totalWorkHours: 0
    };
  }

  const isOvernight = endMin <= startMin;
  const grossMinutes = isOvernight ? 1440 - startMin + endMin : endMin - startMin;

  let breakMinutes = 0;
  if (breakStartTime && breakEndTime) {
    const bStart = parseTimeToMinutes(breakStartTime);
    const bEnd = parseTimeToMinutes(breakEndTime);
    if (bStart !== null && bEnd !== null) {
      breakMinutes = bEnd <= bStart ? 1440 - bStart + bEnd : bEnd - bStart;
    }
  }

  const netMinutes = Math.max(0, grossMinutes - breakMinutes);
  const totalWorkHours = Number((netMinutes / 60).toFixed(2));

  return {
    isOvernight,
    grossMinutes,
    breakMinutes,
    netMinutes,
    totalWorkHours
  };
};

/**
 * Quy đổi một thời điểm bất kỳ sang offset phút tính từ StartTime (xử lý ca qua đêm)
 */
const offsetFromShiftStart = (timeMin, startMin) => {
  return timeMin >= startMin ? timeMin - startMin : 1440 - startMin + timeMin;
};

/**
 * Tạo mảng các ngày YYYY-MM-DD từ startDate đến endDate
 */
const expandDateRange = (startDate, endDate, excludeWeekends = false) => {
  const dates = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime()) || current > end) {
    return dates;
  }

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = CN, 6 = T7
    if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Tính số tuần chênh lệch tính theo Thứ 2 đầu tuần (ISO week start)
 */
const getMondayTimestamp = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.getTime();
};

const createHttpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const enrichShift = (shift) => {
  if (!shift) return null;
  const metrics = calculateShiftMetrics(
    shift.StartTime,
    shift.EndTime,
    shift.BreakStartTime,
    shift.BreakEndTime
  );
  return {
    ...shift,
    IsOvernight: metrics.isOvernight,
    BreakMinutes: metrics.breakMinutes,
    TotalWorkHours: metrics.totalWorkHours
  };
};

export class ShiftService {
  /**
   * Validate dữ liệu tạo/cập nhật ca làm việc
   */
  static validateShiftPayload(payload) {
    const {
      ShiftCode,
      ShiftName,
      StartTime,
      EndTime,
      BreakStartTime,
      BreakEndTime
    } = payload;

    if (!ShiftCode || !String(ShiftCode).trim()) {
      throw createHttpError('Mã ca làm việc (ShiftCode) là bắt buộc!', 400);
    }
    if (!ShiftName || !String(ShiftName).trim()) {
      throw createHttpError('Tên ca làm việc (ShiftName) là bắt buộc!', 400);
    }

    const startMin = parseTimeToMinutes(StartTime);
    const endMin = parseTimeToMinutes(EndTime);
    if (startMin === null) {
      throw createHttpError('Giờ bắt đầu vào ca (StartTime) không hợp lệ (định dạng HH:mm)!', 400);
    }
    if (endMin === null) {
      throw createHttpError('Giờ kết thúc ca (EndTime) không hợp lệ (định dạng HH:mm)!', 400);
    }

    const hasBreakStart = Boolean(BreakStartTime && String(BreakStartTime).trim());
    const hasBreakEnd = Boolean(BreakEndTime && String(BreakEndTime).trim());

    if (hasBreakStart !== hasBreakEnd) {
      throw createHttpError('Vui lòng nhập đầy đủ cả giờ bắt đầu nghỉ và giờ kết thúc nghỉ giữa ca!', 400);
    }

    const metrics = calculateShiftMetrics(StartTime, EndTime, BreakStartTime, BreakEndTime);
    if (metrics.grossMinutes <= 0) {
      throw createHttpError('Thời lượng ca làm việc phải lớn hơn 0!', 400);
    }

    if (hasBreakStart && hasBreakEnd) {
      const bStartMin = parseTimeToMinutes(BreakStartTime);
      const bEndMin = parseTimeToMinutes(BreakEndTime);
      if (bStartMin === null || bEndMin === null) {
        throw createHttpError('Khung giờ nghỉ giữa ca không hợp lệ (định dạng HH:mm)!', 400);
      }

      const bStartOffset = offsetFromShiftStart(bStartMin, startMin);
      const bEndOffset = bStartOffset + (bEndMin <= bStartMin ? 1440 - bStartMin + bEndMin : bEndMin - bStartMin);

      if (bStartOffset < 0 || bEndOffset > metrics.grossMinutes) {
        throw createHttpError('Khung giờ nghỉ giữa ca phải nằm trong khoảng thời gian làm việc của ca!', 400);
      }
      if (metrics.breakMinutes >= metrics.grossMinutes) {
        throw createHttpError('Thời gian nghỉ giữa ca phải nhỏ hơn tổng thời lượng ca làm việc!', 400);
      }
    }
  }

  static async getShifts(filter) {
    const shifts = await ShiftModel.getAll(filter);
    return shifts.map(enrichShift);
  }

  static async createShift(payload) {
    this.validateShiftPayload(payload);

    const existing = await ShiftModel.getByCode(payload.ShiftCode);
    if (existing) {
      throw createHttpError(`Mã ca "${String(payload.ShiftCode).trim().toUpperCase()}" đã tồn tại trong hệ thống!`, 409);
    }

    const created = await ShiftModel.create(payload);
    return enrichShift(created);
  }

  static async updateShift(id, payload) {
    const current = await ShiftModel.getById(id);
    if (!current) {
      throw createHttpError('Không tìm thấy ca làm việc cần cập nhật!', 404);
    }

    const merged = {
      ShiftCode: payload.ShiftCode ?? current.ShiftCode,
      ShiftName: payload.ShiftName ?? current.ShiftName,
      StartTime: payload.StartTime ?? current.StartTime,
      EndTime: payload.EndTime ?? current.EndTime,
      BreakStartTime: payload.BreakStartTime !== undefined ? payload.BreakStartTime : current.BreakStartTime,
      BreakEndTime: payload.BreakEndTime !== undefined ? payload.BreakEndTime : current.BreakEndTime,
      ShiftType: payload.ShiftType ?? current.ShiftType,
      IsActive: payload.IsActive !== undefined ? payload.IsActive : current.IsActive
    };

    this.validateShiftPayload(merged);

    const dupCode = await ShiftModel.getByCode(merged.ShiftCode, id);
    if (dupCode) {
      throw createHttpError(`Mã ca "${String(merged.ShiftCode).trim().toUpperCase()}" đã được sử dụng bởi ca khác!`, 409);
    }

    const updated = await ShiftModel.update(id, merged);
    return enrichShift(updated);
  }

  static async toggleShiftStatus(id, isActiveInput) {
    const current = await ShiftModel.getById(id);
    if (!current) {
      throw createHttpError('Không tìm thấy ca làm việc!', 404);
    }

    const nextStatus =
      isActiveInput !== undefined && isActiveInput !== null
        ? Boolean(isActiveInput === true || isActiveInput === 1 || isActiveInput === 'true')
        : !Boolean(current.IsActive);

    const updated = await ShiftModel.updateStatus(id, nextStatus);
    return enrichShift(updated);
  }

  static async getSchedule({ startDate, endDate, departmentId, search }) {
    if (!startDate || !DATE_REGEX.test(startDate) || !endDate || !DATE_REGEX.test(endDate)) {
      throw createHttpError('Vui lòng cung cấp startDate và endDate hợp lệ (YYYY-MM-DD)!', 400);
    }
    if (startDate > endDate) {
      throw createHttpError('Ngày bắt đầu (startDate) không được lớn hơn ngày kết thúc (endDate)!', 400);
    }

    const schedule = await ShiftScheduleModel.getSchedule({
      startDate,
      endDate,
      departmentId,
      search
    });

    // Bổ sung TotalWorkHours cho từng phân ca trong ma trận
    const employees = schedule.employees.map((emp) => {
      const enrichedAssignments = {};
      for (const [dateKey, cell] of Object.entries(emp.assignments)) {
        const metrics = calculateShiftMetrics(
          cell.StartTime,
          cell.EndTime,
          cell.BreakStartTime,
          cell.BreakEndTime
        );
        enrichedAssignments[dateKey] = {
          ...cell,
          IsOvernight: metrics.isOvernight,
          TotalWorkHours: metrics.totalWorkHours
        };
      }
      return {
        ...emp,
        assignments: enrichedAssignments
      };
    });

    return {
      ...schedule,
      employees
    };
  }

  /**
   * Phân ca hàng loạt & Xoay ca tự động theo tuần
   */
  static async assignShifts(payload) {
    // Trường hợp 1: Client gửi trực tiếp mảng assignments [{ EmployeeId, AttendanceDate, ShiftId }]
    if (Array.isArray(payload.assignments) && payload.assignments.length > 0) {
      for (const item of payload.assignments) {
        if (!item.EmployeeId || !item.ShiftId || !DATE_REGEX.test(item.AttendanceDate || '')) {
          throw createHttpError('Dữ liệu phân ca không hợp lệ (cần EmployeeId, ShiftId và AttendanceDate YYYY-MM-DD)!', 400);
        }
      }
      return await ShiftScheduleModel.bulkAssign(payload.assignments);
    }

    // Trường hợp 2: Phân ca hàng loạt theo danh sách EmployeeId[] (hoặc DepartmentId) và Dates[] / [startDate..endDate]
    let employeeIds = Array.isArray(payload.employeeIds)
      ? payload.employeeIds.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id))
      : [];

    if (employeeIds.length === 0 && payload.departmentId) {
      const pool = await connectDb();
      const empRes = await pool
        .request()
        .input('deptId', sql.Int, parseInt(payload.departmentId, 10))
        .query("SELECT EmployeeId FROM tblEmployee WHERE DepartmentId = @deptId AND (WorkStatus IS NULL OR WorkStatus <> N'Đã nghỉ việc')");
      employeeIds = empRes.recordset.map((r) => r.EmployeeId);
    }

    if (employeeIds.length === 0) {
      throw createHttpError('Vui lòng chọn ít nhất một nhân viên để phân ca!', 400);
    }

    let dates = Array.isArray(payload.dates)
      ? payload.dates.filter((d) => DATE_REGEX.test(String(d)))
      : [];

    if (dates.length === 0 && payload.startDate && payload.endDate) {
      if (!DATE_REGEX.test(payload.startDate) || !DATE_REGEX.test(payload.endDate)) {
        throw createHttpError('Khoảng thời gian startDate / endDate không đúng định dạng YYYY-MM-DD!', 400);
      }
      dates = expandDateRange(payload.startDate, payload.endDate, Boolean(payload.excludeWeekends));
    }

    if (dates.length === 0) {
      throw createHttpError('Không có ngày làm việc nào hợp lệ trong khoảng thời gian đã chọn!', 400);
    }

    dates.sort();

    const mode = payload.mode === 'rotating' ? 'rotating' : 'fixed';
    const items = [];

    if (mode === 'fixed') {
      const shiftId = parseInt(payload.shiftId || payload.ShiftId, 10);
      if (!shiftId) {
        throw createHttpError('Vui lòng chọn ca làm việc cần phân công!', 400);
      }

      const shift = await ShiftModel.getById(shiftId);
      if (!shift) {
        throw createHttpError('Ca làm việc được chọn không tồn tại!', 404);
      }

      for (const empId of employeeIds) {
        for (const dateStr of dates) {
          items.push({
            EmployeeId: empId,
            AttendanceDate: dateStr,
            ShiftId: shiftId
          });
        }
      }
    } else {
      const rotationShiftIds = Array.isArray(payload.rotationShiftIds)
        ? payload.rotationShiftIds.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id))
        : [];

      if (rotationShiftIds.length < 2) {
        throw createHttpError('Chế độ xoay ca cần ít nhất 2 ca làm việc để luân chuyển theo tuần!', 400);
      }

      // Kiểm tra các ShiftId tồn tại
      const allShifts = await ShiftModel.getAll();
      const validIds = new Set(allShifts.map((s) => s.ShiftId));
      for (const sId of rotationShiftIds) {
        if (!validIds.has(sId)) {
          throw createHttpError(`Ca làm việc ID=${sId} không tồn tại trong hệ thống!`, 404);
        }
      }

      const baseMonday = getMondayTimestamp(dates[0]);
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;

      for (const empId of employeeIds) {
        for (const dateStr of dates) {
          const currentMonday = getMondayTimestamp(dateStr);
          const weekIndex = Math.max(0, Math.round((currentMonday - baseMonday) / msPerWeek));
          const shiftId = rotationShiftIds[weekIndex % rotationShiftIds.length];

          items.push({
            EmployeeId: empId,
            AttendanceDate: dateStr,
            ShiftId: shiftId
          });
        }
      }
    }

    return await ShiftScheduleModel.bulkAssign(items);
  }

  static async removeAssignment(attendanceId) {
    const existing = await ShiftScheduleModel.getAssignmentById(attendanceId);
    if (!existing) {
      throw createHttpError('Không tìm thấy lịch phân ca cần xóa!', 404);
    }

    if (existing.TimeIn !== null && existing.TimeIn !== undefined) {
      throw createHttpError('Không thể xóa lịch phân ca vì nhân viên đã thực hiện check-in trong ngày này!', 400);
    }

    return await ShiftScheduleModel.removeAssignment(attendanceId);
  }
}
