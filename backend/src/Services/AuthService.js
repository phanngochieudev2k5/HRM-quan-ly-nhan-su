import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/UserModel.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../Config/JwtConfig.js';

export class AuthService {
  static async login({ username, password }) {
    if (!username || !password) {
      throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
    }

    const user = await UserModel.findByUsername(username.trim());
    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
    }

    if (user.IsLocked) {
      throw new Error('Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Quản trị viên (Admin).');
    }

    const isMatch = bcrypt.compareSync(password, user.PasswordHash);
    if (!isMatch) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
    }

    await UserModel.updateLastLogin(user.UserId);

    const tokenPayload = {
      userId: user.UserId,
      username: user.Username,
      fullName: user.FullName,
      email: user.Email,
      role: user.RoleCode,
      roleTitle: user.RoleName,
      employeeId: user.EmployeeId || null,
      avatar: user.AvatarUrl || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: user.UserId,
        username: user.Username,
        name: user.FullName,
        email: user.Email,
        role: user.RoleCode,
        roleTitle: user.RoleName,
        avatar: user.AvatarUrl || null,
        employeeId: user.EmployeeId || null,
        phone: user.Phone || null
      }
    };
  }

  static async register({ username, password, email, fullName, phone }) {
    if (!username || !password || !email || !fullName) {
      throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc: tên đăng nhập, mật khẩu, họ tên, email!');
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải có độ dài tối thiểu 6 ký tự!');
    }

    const existingUsername = await UserModel.findByUsername(username.trim());
    if (existingUsername) {
      throw new Error('Tên đăng nhập đã tồn tại trong hệ thống!');
    }

    const existingEmail = await UserModel.findByEmail(email.trim());
    if (existingEmail) {
      throw new Error('Địa chỉ email đã được sử dụng!');
    }

    const defaultRoleCode = 'Employee';
    const roleId = await UserModel.getRoleIdByCode(defaultRoleCode);
    if (!roleId) {
      throw new Error('Lỗi cấu hình hệ thống: Không tìm thấy vai trò Employee trong cơ sở dữ liệu!');
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = await UserModel.createUser({
      username: username.trim(),
      passwordHash,
      email: email.trim(),
      fullName: fullName.trim(),
      roleId
    });

    await UserModel.createDefaultEmployee({
      userId: newUser.UserId,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : ''
    });

    const tokenPayload = {
      userId: newUser.UserId,
      username: newUser.Username,
      fullName: newUser.FullName,
      email: newUser.Email,
      role: defaultRoleCode,
      roleTitle: 'Nhân viên (Cá nhân)',
      avatar: null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: newUser.UserId,
        username: newUser.Username,
        name: newUser.FullName,
        email: newUser.Email,
        role: defaultRoleCode,
        roleTitle: 'Nhân viên (Cá nhân)',
        avatar: null
      }
    };
  }

  static async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng!');
    }

    return {
      id: user.UserId,
      username: user.Username,
      name: user.FullName,
      email: user.Email,
      role: user.RoleCode,
      roleTitle: user.RoleName,
      department: user.DepartmentName || 'Khối Kỹ Thuật (IT)',
      position: user.PositionName || 'Nhân viên',
      avatar: user.AvatarUrl || null,
      phone: user.Phone || null
    };
  }
}
