import { connectDb, sql } from '../Config/DbConfig.js';

export class UserModel {
  static async findByUsername(username) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .query(`
        SELECT u.UserId, u.Username, u.PasswordHash, u.Email, u.FullName, u.Phone, u.RoleId, u.IsLocked, u.TwoFactorEnabled,
               r.RoleCode, r.RoleName,
               e.EmployeeId, e.EmployeeCode, e.DepartmentId, e.PositionId, e.AvatarUrl, e.WorkStatus,
               e.Gender, CONVERT(varchar, e.BirthDate, 23) as BirthDate, e.Address,
               e.IdCardNumber, CONVERT(varchar, e.IdCardDate, 23) as IdCardDate, e.IdCardPlace,
               e.BankName, e.BankAccountNumber, e.TaxCode, e.InsuranceBookNumber,
               CONVERT(varchar, e.JoinDate, 23) as JoinDate,
               d.DepartmentName, p.PositionName
        FROM tblUser u
        JOIN tblRole r ON u.RoleId = r.RoleId
        LEFT JOIN tblEmployee e ON u.UserId = e.UserId
        LEFT JOIN tblDepartment d ON e.DepartmentId = d.DepartmentId
        LEFT JOIN tblPosition p ON e.PositionId = p.PositionId
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
        SELECT u.UserId, u.Username, u.PasswordHash, u.Email, u.FullName, u.Phone, u.RoleId, u.IsLocked, u.TwoFactorEnabled,
               r.RoleCode, r.RoleName,
               e.EmployeeId, e.EmployeeCode, e.DepartmentId, e.PositionId, e.AvatarUrl, e.WorkStatus,
               e.Gender, CONVERT(varchar, e.BirthDate, 23) as BirthDate, e.Address,
               e.IdCardNumber, CONVERT(varchar, e.IdCardDate, 23) as IdCardDate, e.IdCardPlace,
               e.BankName, e.BankAccountNumber, e.TaxCode, e.InsuranceBookNumber,
               CONVERT(varchar, e.JoinDate, 23) as JoinDate,
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

  static async createUser({ username, passwordHash, email, fullName, phone, roleId }) {
    const pool = await connectDb();
    const result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('passwordHash', sql.VarChar(255), passwordHash)
      .input('email', sql.VarChar(100), email)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('phone', sql.VarChar(20), phone || null)
      .input('roleId', sql.Int, roleId)
      .query(`
        INSERT INTO tblUser (Username, PasswordHash, Email, FullName, Phone, RoleId, IsLocked, TwoFactorEnabled)
        OUTPUT INSERTED.UserId, INSERTED.Username, INSERTED.Email, INSERTED.FullName, INSERTED.Phone, INSERTED.RoleId
        VALUES (@username, @passwordHash, @email, @fullName, @phone, @roleId, 0, 0)
      `);
    return result.recordset[0];
  }

  static async updatePassword(userId, newPasswordHash) {
    const pool = await connectDb();
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('passwordHash', sql.VarChar(255), newPasswordHash)
      .query(`UPDATE tblUser SET PasswordHash = @passwordHash WHERE UserId = @userId`);
  }

  static async updateProfile(userId, { fullName, phone, email, gender, birthDate, address, idCardNumber, bankName, bankAccountNumber }) {
    const pool = await connectDb();

    const userReq = pool.request();
    userReq.input('userId', sql.Int, userId);
    userReq.input('fullName', sql.NVarChar(100), fullName || null);
    userReq.input('phone', sql.VarChar(20), phone || null);
    userReq.input('email', sql.VarChar(100), email || null);
    await userReq.query(`
      UPDATE tblUser SET
        FullName = COALESCE(@fullName, FullName),
        Phone = COALESCE(@phone, Phone),
        Email = COALESCE(@email, Email)
      WHERE UserId = @userId
    `);

    const empCheck = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT EmployeeId FROM tblEmployee WHERE UserId = @userId');

    if (empCheck.recordset.length > 0) {
      const empReq = pool.request();
      empReq.input('userId', sql.Int, userId);
      empReq.input('fullName', sql.NVarChar(100), fullName || null);
      empReq.input('phone', sql.VarChar(20), phone || null);
      empReq.input('email', sql.VarChar(100), email || null);
      empReq.input('gender', sql.NVarChar(10), gender || null);
      empReq.input('birthDate', sql.Date, birthDate || null);
      empReq.input('address', sql.NVarChar(255), address || null);
      empReq.input('idCardNumber', sql.VarChar(20), idCardNumber || null);
      empReq.input('bankName', sql.NVarChar(100), bankName || null);
      empReq.input('bankAccountNumber', sql.VarChar(30), bankAccountNumber || null);

      await empReq.query(`
        UPDATE tblEmployee SET
          FullName = COALESCE(@fullName, FullName),
          Phone = COALESCE(@phone, Phone),
          Email = COALESCE(@email, Email),
          Gender = COALESCE(@gender, Gender),
          BirthDate = @birthDate,
          Address = COALESCE(@address, Address),
          IdCardNumber = COALESCE(@idCardNumber, IdCardNumber),
          BankName = COALESCE(@bankName, BankName),
          BankAccountNumber = COALESCE(@bankAccountNumber, BankAccountNumber),
          UpdatedAt = SYSDATETIME()
        WHERE UserId = @userId
      `);
    }
  }

  static async getUnassignedUsers() {
    const pool = await connectDb();
    const result = await pool.request().query(`
      SELECT u.UserId, u.Username, u.Email, u.FullName, u.Phone, u.CreatedAt
      FROM tblUser u
      JOIN tblRole r ON u.RoleId = r.RoleId
      LEFT JOIN tblEmployee e ON u.UserId = e.UserId
      WHERE r.RoleCode = 'Employee' AND (e.EmployeeId IS NULL OR e.DepartmentId IS NULL)
      ORDER BY u.UserId DESC
    `);
    return result.recordset;
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
      SELECT u.UserId, u.Username, u.Email, u.FullName, u.Phone, u.IsLocked, u.TwoFactorEnabled, u.LastLoginAt,
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
