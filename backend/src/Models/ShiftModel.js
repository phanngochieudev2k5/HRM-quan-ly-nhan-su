import { connectDb, sql } from '../Config/DbConfig.js';

/**
 * Chuẩn hóa chuỗi giờ HH:mm hoặc HH:mm:ss thành HH:mm:ss để cast sang kiểu TIME của SQL Server
 */
const normalizeTimeString = (val) => {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  if (!trimmed) return null;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return trimmed;
};

export class ShiftModel {
  /**
   * Lấy danh sách tất cả các ca làm việc từ tblShift
   */
  static async getAll({ isActive, shiftType, search } = {}) {
    const pool = await connectDb();
    const request = pool.request();
    const conditions = ['1=1'];

    if (isActive !== undefined && isActive !== '' && isActive !== 'all') {
      const activeBit = isActive === true || isActive === 'true' || isActive === '1' || isActive === 1 ? 1 : 0;
      request.input('isActive', sql.Bit, activeBit);
      conditions.push('IsActive = @isActive');
    }

    if (shiftType && shiftType !== 'all') {
      request.input('shiftType', sql.NVarChar(50), shiftType);
      conditions.push('ShiftType = @shiftType');
    }

    if (search && search.trim()) {
      request.input('search', sql.NVarChar(100), `%${search.trim()}%`);
      conditions.push('(ShiftCode LIKE @search OR ShiftName LIKE @search)');
    }

    const result = await request.query(`
      SELECT
        ShiftId,
        ShiftCode,
        ShiftName,
        CONVERT(varchar(5), StartTime, 108) AS StartTime,
        CONVERT(varchar(5), EndTime, 108) AS EndTime,
        CASE WHEN BreakStartTime IS NOT NULL THEN CONVERT(varchar(5), BreakStartTime, 108) ELSE NULL END AS BreakStartTime,
        CASE WHEN BreakEndTime IS NOT NULL THEN CONVERT(varchar(5), BreakEndTime, 108) ELSE NULL END AS BreakEndTime,
        ShiftType,
        CAST(ISNULL(IsActive, 1) AS BIT) AS IsActive
      FROM tblShift
      WHERE ${conditions.join(' AND ')}
      ORDER BY IsActive DESC, ShiftId ASC
    `);

    return result.recordset;
  }

  /**
   * Lấy chi tiết ca làm việc theo ShiftId
   */
  static async getById(shiftId) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('id', sql.Int, parseInt(shiftId, 10));

    const result = await request.query(`
      SELECT
        ShiftId,
        ShiftCode,
        ShiftName,
        CONVERT(varchar(5), StartTime, 108) AS StartTime,
        CONVERT(varchar(5), EndTime, 108) AS EndTime,
        CASE WHEN BreakStartTime IS NOT NULL THEN CONVERT(varchar(5), BreakStartTime, 108) ELSE NULL END AS BreakStartTime,
        CASE WHEN BreakEndTime IS NOT NULL THEN CONVERT(varchar(5), BreakEndTime, 108) ELSE NULL END AS BreakEndTime,
        ShiftType,
        CAST(ISNULL(IsActive, 1) AS BIT) AS IsActive
      FROM tblShift
      WHERE ShiftId = @id
    `);

    return result.recordset[0] || null;
  }

  /**
   * Kiểm tra trùng mã ca ShiftCode
   */
  static async getByCode(shiftCode, excludeShiftId = null) {
    const pool = await connectDb();
    const request = pool.request();
    request.input('code', sql.VarChar(50), String(shiftCode).trim().toUpperCase());

    let query = `SELECT ShiftId, ShiftCode FROM tblShift WHERE UPPER(ShiftCode) = @code`;
    if (excludeShiftId) {
      request.input('excludeId', sql.Int, parseInt(excludeShiftId, 10));
      query += ` AND ShiftId <> @excludeId`;
    }

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  /**
   * Tạo mới loại ca làm việc trong tblShift
   */
  static async create({
    ShiftCode,
    ShiftName,
    StartTime,
    EndTime,
    BreakStartTime = null,
    BreakEndTime = null,
    ShiftType = 'Administrative',
    IsActive = true
  }) {
    const pool = await connectDb();
    const request = pool.request();

    request.input('ShiftCode', sql.VarChar(50), String(ShiftCode).trim().toUpperCase());
    request.input('ShiftName', sql.NVarChar(150), String(ShiftName).trim());
    request.input('StartTime', sql.VarChar(10), normalizeTimeString(StartTime));
    request.input('EndTime', sql.VarChar(10), normalizeTimeString(EndTime));
    request.input('BreakStartTime', sql.VarChar(10), normalizeTimeString(BreakStartTime));
    request.input('BreakEndTime', sql.VarChar(10), normalizeTimeString(BreakEndTime));
    request.input('ShiftType', sql.NVarChar(50), ShiftType || 'Administrative');
    request.input('IsActive', sql.Bit, IsActive === false || IsActive === 0 ? 0 : 1);

    const result = await request.query(`
      INSERT INTO tblShift (
        ShiftCode, ShiftName, StartTime, EndTime, BreakStartTime, BreakEndTime, ShiftType, IsActive
      )
      OUTPUT INSERTED.ShiftId
      VALUES (
        @ShiftCode,
        @ShiftName,
        CAST(@StartTime AS TIME),
        CAST(@EndTime AS TIME),
        CASE WHEN @BreakStartTime IS NOT NULL THEN CAST(@BreakStartTime AS TIME) ELSE NULL END,
        CASE WHEN @BreakEndTime IS NOT NULL THEN CAST(@BreakEndTime AS TIME) ELSE NULL END,
        @ShiftType,
        @IsActive
      )
    `);

    const insertedId = result.recordset[0]?.ShiftId;
    return await this.getById(insertedId);
  }

  /**
   * Cập nhật thông tin ca làm việc
   */
  static async update(shiftId, {
    ShiftCode,
    ShiftName,
    StartTime,
    EndTime,
    BreakStartTime = null,
    BreakEndTime = null,
    ShiftType,
    IsActive
  }) {
    const pool = await connectDb();
    const request = pool.request();

    request.input('id', sql.Int, parseInt(shiftId, 10));
    request.input('ShiftCode', sql.VarChar(50), String(ShiftCode).trim().toUpperCase());
    request.input('ShiftName', sql.NVarChar(150), String(ShiftName).trim());
    request.input('StartTime', sql.VarChar(10), normalizeTimeString(StartTime));
    request.input('EndTime', sql.VarChar(10), normalizeTimeString(EndTime));
    request.input('BreakStartTime', sql.VarChar(10), normalizeTimeString(BreakStartTime));
    request.input('BreakEndTime', sql.VarChar(10), normalizeTimeString(BreakEndTime));
    request.input('ShiftType', sql.NVarChar(50), ShiftType || 'Administrative');
    request.input('IsActive', sql.Bit, IsActive === false || IsActive === 0 ? 0 : 1);

    await request.query(`
      UPDATE tblShift
      SET
        ShiftCode = @ShiftCode,
        ShiftName = @ShiftName,
        StartTime = CAST(@StartTime AS TIME),
        EndTime = CAST(@EndTime AS TIME),
        BreakStartTime = CASE WHEN @BreakStartTime IS NOT NULL THEN CAST(@BreakStartTime AS TIME) ELSE NULL END,
        BreakEndTime = CASE WHEN @BreakEndTime IS NOT NULL THEN CAST(@BreakEndTime AS TIME) ELSE NULL END,
        ShiftType = @ShiftType,
        IsActive = @IsActive
      WHERE ShiftId = @id
    `);

    return await this.getById(shiftId);
  }

  /**
   * Bật/tắt trạng thái IsActive của ca làm việc
   */
  static async updateStatus(shiftId, isActive) {
    const pool = await connectDb();
    const request = pool.request();

    request.input('id', sql.Int, parseInt(shiftId, 10));
    request.input('isActive', sql.Bit, isActive ? 1 : 0);

    await request.query(`
      UPDATE tblShift
      SET IsActive = @isActive
      WHERE ShiftId = @id
    `);

    return await this.getById(shiftId);
  }
}
