import ApiClient from './ApiClient';

export const LeaveService = {
  /**
   * Lấy danh mục loại nghỉ phép
   */
  async getLeaveTypes() {
    return await ApiClient.get('/leaves/types');
  },

  /**
   * Lấy thông tin hạn mức và số dư ngày phép
   */
  async getQuota(employeeId, year) {
    const query = year ? `?year=${year}` : '';
    return await ApiClient.get(`/leaves/quota/${employeeId}${query}`);
  },

  /**
   * Lấy lịch sử đơn xin nghỉ cá nhân (Employee - US-23)
   */
  async getMyRequests(employeeId, year) {
    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (year) params.append('year', year);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await ApiClient.get(`/leaves/my-requests${queryString}`);
  },

  /**
   * Nộp đơn xin nghỉ phép mới (Employee - US-23)
   */
  async createRequest(payload) {
    return await ApiClient.post('/leaves', payload);
  },

  /**
   * Hủy đơn xin nghỉ phép đang chờ duyệt (Employee - US-23)
   */
  async cancelRequest(requestId, employeeId) {
    return await ApiClient.patch(`/leaves/${requestId}/cancel`, { employeeId });
  },

  /**
   * Lấy danh sách đơn nghỉ của nhóm trực thuộc (Manager - US-17)
   */
  async getTeamRequests(managerId, status = 'ALL', search = '') {
    const params = new URLSearchParams();
    if (managerId) params.append('managerId', managerId);
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await ApiClient.get(`/leaves/team${queryString}`);
  },

  /**
   * Phê duyệt đơn xin nghỉ phép (Manager / HR - US-17, US-12)
   */
  async approveRequest(requestId, approverEmployeeId, responseNote = '') {
    return await ApiClient.patch(`/leaves/${requestId}/approve`, {
      approverEmployeeId,
      responseNote
    });
  },

  /**
   * Từ chối đơn xin nghỉ phép (Manager / HR - US-17, US-12)
   */
  async rejectRequest(requestId, approverEmployeeId, responseNote = '') {
    return await ApiClient.patch(`/leaves/${requestId}/reject`, {
      approverEmployeeId,
      responseNote
    });
  },

  /**
   * Lấy toàn bộ đơn nghỉ phép toàn công ty (HR - US-12)
   */
  async getAllRequests({ departmentId = 'ALL', leaveTypeId = 'ALL', status = 'ALL', search = '' } = {}) {
    const params = new URLSearchParams();
    if (departmentId && departmentId !== 'ALL') params.append('departmentId', departmentId);
    if (leaveTypeId && leaveTypeId !== 'ALL') params.append('leaveTypeId', leaveTypeId);
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await ApiClient.get(`/leaves/all${queryString}`);
  },

  /**
   * Lấy danh sách đồng nghiệp để chọn người nhận bàn giao công việc
   */
  async getColleagues(excludeEmployeeId, departmentId) {
    const params = new URLSearchParams();
    if (excludeEmployeeId) params.append('excludeEmployeeId', excludeEmployeeId);
    if (departmentId && departmentId !== 'ALL') params.append('departmentId', departmentId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await ApiClient.get(`/leaves/colleagues${queryString}`);
  }
};

export default LeaveService;
