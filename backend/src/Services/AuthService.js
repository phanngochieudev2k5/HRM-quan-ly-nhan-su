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

    const isPending = user.RoleCode === 'Employee' && (!user.EmployeeId || !user.DepartmentId);
    const roleTitle = isPending ? 'Nhân viên (Chờ tiếp nhận)' : (user.RoleName || user.RoleCode);

    const tokenPayload = {
      userId: user.UserId,
      username: user.Username,
      fullName: user.FullName,
      email: user.Email,
      role: user.RoleCode,
      roleTitle,
      employeeId: user.EmployeeId || null,
      departmentId: user.DepartmentId || null,
      isPending,
      avatar: user.AvatarUrl || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: user.UserId,
        userId: user.UserId,
        username: user.Username,
        name: user.FullName,
        fullName: user.FullName,
        email: user.Email,
        phone: user.Phone || null,
        role: user.RoleCode,
        roleTitle,
        avatar: user.AvatarUrl || null,
        employeeId: user.EmployeeId || null,
        employeeCode: user.EmployeeCode || null,
        departmentId: user.DepartmentId || null,
        department: user.DepartmentName || null,
        position: user.PositionName || null,
        gender: user.Gender || 'Nam',
        birthDate: user.BirthDate || '',
        address: user.Address || '',
        idCardNumber: user.IdCardNumber || '',
        bankName: user.BankName || '',
        bankAccountNumber: user.BankAccountNumber || '',
        joinDate: user.JoinDate || '',
        workStatus: user.WorkStatus || '',
        isPending
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
      phone: phone ? phone.trim() : null,
      roleId
    });

    const tokenPayload = {
      userId: newUser.UserId,
      username: newUser.Username,
      fullName: newUser.FullName,
      email: newUser.Email,
      role: defaultRoleCode,
      roleTitle: 'Nhân viên (Chờ tiếp nhận)',
      employeeId: null,
      departmentId: null,
      isPending: true,
      avatar: null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      user: {
        id: newUser.UserId,
        userId: newUser.UserId,
        username: newUser.Username,
        name: newUser.FullName,
        fullName: newUser.FullName,
        email: newUser.Email,
        phone: newUser.Phone || (phone ? phone.trim() : null),
        role: defaultRoleCode,
        roleTitle: 'Nhân viên (Chờ tiếp nhận)',
        employeeId: null,
        employeeCode: null,
        departmentId: null,
        department: null,
        position: null,
        gender: 'Nam',
        birthDate: '',
        address: '',
        idCardNumber: '',
        bankName: '',
        bankAccountNumber: '',
        joinDate: '',
        workStatus: '',
        isPending: true,
        avatar: null
      }
    };
  }

  static async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng!');
    }

    const isPending = user.RoleCode === 'Employee' && (!user.EmployeeId || !user.DepartmentId);
    const roleTitle = isPending ? 'Nhân viên (Chờ tiếp nhận)' : (user.RoleName || user.RoleCode);

    return {
      id: user.UserId,
      userId: user.UserId,
      username: user.Username,
      name: user.FullName,
      fullName: user.FullName,
      email: user.Email,
      phone: user.Phone || null,
      role: user.RoleCode,
      roleTitle,
      employeeId: user.EmployeeId || null,
      employeeCode: user.EmployeeCode || null,
      departmentId: user.DepartmentId || null,
      department: user.DepartmentName || null,
      position: user.PositionName || null,
      avatar: user.AvatarUrl || null,
      gender: user.Gender || 'Nam',
      birthDate: user.BirthDate || '',
      address: user.Address || '',
      idCardNumber: user.IdCardNumber || '',
      idCardDate: user.IdCardDate || '',
      idCardPlace: user.IdCardPlace || '',
      bankName: user.BankName || '',
      bankAccountNumber: user.BankAccountNumber || '',
      taxCode: user.TaxCode || '',
      insuranceBookNumber: user.InsuranceBookNumber || '',
      joinDate: user.JoinDate || '',
      workStatus: user.WorkStatus || '',
      isPending
    };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới!');
    }

    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
    }

    if (currentPassword === newPassword) {
      throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ!');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.PasswordHash);
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không chính xác!');
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await UserModel.updatePassword(userId, newHash);
    return true;
  }

  static async updateProfile(userId, profileData) {
    const { fullName, phone, email, gender, birthDate, address, idCardNumber, bankName, bankAccountNumber } = profileData;

    if (!fullName || !fullName.trim()) {
      throw new Error('Họ và tên không được để trống!');
    }

    if (!email || !email.trim()) {
      throw new Error('Email không được để trống!');
    }

    await UserModel.updateProfile(userId, {
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : null,
      email: email.trim(),
      gender: gender || 'Nam',
      birthDate: birthDate ? birthDate : null,
      address: address ? address.trim() : null,
      idCardNumber: idCardNumber ? idCardNumber.trim() : null,
      bankName: bankName ? bankName.trim() : null,
      bankAccountNumber: bankAccountNumber ? bankAccountNumber.trim() : null
    });

    return await this.getMe(userId);
  }
}
