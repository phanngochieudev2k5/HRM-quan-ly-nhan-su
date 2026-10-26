import { connectDb, sql } from '../Config/DbConfig.js';

export class UserModel {
  static async findByUsername(username) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query(`
        SELECT u.UserId, u.Username, u.PasswordHash, u.Email, u.FullName, u.RoleId, u.IsLocked, u.TwoFactorEnabled,
               r.RoleCode, r.RoleName,
               e.EmployeeId, e.EmployeeCode, e.DepartmentId, e.PositionId, e.AvatarUrl, e.Phone
        FROM tblUser u
        JOIN tblRole r ON u.RoleId = r.RoleId
        LEFT JOIN tblEmployee e ON u.UserId = e.UserId
        WHERE u.Username = @username
      `);
    return result.recordset[0] || null;
  }

  static async findByEmail(email) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query(`SELECT UserId, Username, Email FROM tblUser WHERE Email = @email`);
    return result.recordset[0] || null;
  }

  static async findById(userId) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT u.UserId, u.Username, u.Email, u.FullName, u.RoleId, u.IsLocked, u.TwoFactorEnabled,
               r.RoleCode, r.RoleName,
               e.EmployeeId, e.EmployeeCode, e.DepartmentId, e.PositionId, e.AvatarUrl, e.Phone,
               d.DepartmentName, p.PositionName
        FROM tblUser u
        JOIN tblRole r ON u.RoleId = r.RoleId
        LEFT JOIN tblEmployee e ON u.UserId = e.UserId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
        WHERE u.UserId = @userId
      `);
    return result.recordset[0] || null;
  }

  static async getRoleIdByCode(roleCode) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('roleCode', sql.VarChar(20), roleCode)
      .query(`SELECT RoleId FROM tblRole WHERE RoleCode = @roleCode`);
    return result.recordset[0]?.RoleId || null;
  }

  static async createUser({ username, passwordHash, email, fullName, roleId }) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('passwordHash', sql.VarChar(255), passwordHash)
      .input('email', sql.VarChar(100), email)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('roleId', sql.Int, roleId)
      .query(`
        INSERT INTO tblUser (Username, PasswordHash, Email, FullName, RoleId, IsLocked, TwoFactorEnabled)
        OUTPUT INSERTED.UserId, INSERTED.Username, INSERTED.Email, INSERTED.FullName, INSERTED.RoleId
        VALUES (@username, @passwordHash, @email, @fullName, @roleId, 0, 0)
      `);
    return result.recordset[0];
  }

  static async createDefaultEmployee({ userId, fullName, email, phone }) {
    const pool = await connectDb();
    const countResult = await pool.request().query(`SELECT COUNT(*) as total FROM tblEmployee`);
    const newIndex = (countResult.recordset[0].total || 0) + 1;
    const empCode = `NV${String(newIndex).padStart(3, '0')}`;

    await pool.request()
      .input('empCode', sql.VarChar(20), empCode)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('email', sql.VarChar(100), email)
      .input('phone', sql.VarChar(20), phone || '')
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO tblEmployee (EmployeeCode, FullName, Email, Phone, DepartmentId, PositionId, UserId, JoinDate, WorkStatus, BaseSalary)
        VALUES (@empCode, @fullName, @email, @phone, 3, 6, @userId, CAST(GETDATE() AS DATE), N'Đang làm việc', 15000000)
      `);
    return empCode;
  }

  static async updateLastLogin(userId) {
    const pool = await connectDb();
    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`UPDATE tblUser SET LastLoginAt = SYSDATETIME() WHERE UserId = @userId`);
  }

  static async getAllUsers() {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT u.UserId, u.Username, u.Email, u.FullName, u.IsLocked, u.TwoFactorEnabled, u.LastLoginAt,
             r.RoleCode, r.RoleName,
             e.EmployeeCode, d.DepartmentName, p.PositionName
      FROM tblUser u
      JOIN tblRole r ON u.RoleId = r.RoleId
      LEFT JOIN tblEmployee e ON u.UserId = e.UserId
      LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
      LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
      ORDER BY u.UserId ASC
    `);
    return result.recordset;
  }

  static async updateUserRole(userId, newRoleCode) {
    const pool = await connectDb();
    const roleId = await this.getRoleIdByCode(newRoleCode);
    if (!roleId) {
      throw new Error(`Vai trò '${newRoleCode}' không tồn tại trong hệ thống!`);
    }
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('roleId', sql.Int, roleId)
      .query(`UPDATE tblUser SET RoleId = @roleId WHERE UserId = @userId`);
    return { userId, roleCode: newRoleCode };
  }

  static async toggleUserLock(userId) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE tblUser
        SET IsLocked = CASE WHEN IsLocked = 1 THEN 0 ELSE 1 END
        OUTPUT INSERTED.IsLocked
        WHERE UserId = @userId
      `);
    return result.recordset[0]?.IsLocked;
  }
}
