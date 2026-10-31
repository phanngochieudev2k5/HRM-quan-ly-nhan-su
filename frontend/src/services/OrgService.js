import ApiClient from './ApiClient';

export const OrgService = {
  /**
   * Lấy cây cơ cấu tổ chức và thống kê
   */
  async getOrgTree() {
    const res = await ApiClient.get('/org/tree');
    return res.data || { tree: [], departments: [], stats: {} };
  },

  /**
   * Lấy danh sách tất cả phòng ban
   */
  async getDepartments() {
    const res = await ApiClient.get('/org/departments');
    return res.data || [];
  },

  /**
   * Tạo phòng ban mới
   */
  async createDepartment(data) {
    const res = await ApiClient.post('/org/departments', data);
    return res.data;
  },

  /**
   * Cập nhật thông tin phòng ban
   */
  async updateDepartment(id, data) {
    const res = await ApiClient.put(`/org/departments/${id}`, data);
    return res.data;
  },

  /**
   * Xóa phòng ban
   */
  async deleteDepartment(id) {
    const res = await ApiClient.delete(`/org/departments/${id}`);
    return res.data;
  },

  /**
   * Lấy danh mục chức vụ
   */
  async getPositions() {
    const res = await ApiClient.get('/org/positions');
    return res.data || [];
  },

  /**
   * Thêm chức vụ mới
   */
  async createPosition(data) {
    const res = await ApiClient.post('/org/positions', data);
    return res.data;
  },

  /**
   * Cập nhật chức vụ
   */
  async updatePosition(id, data) {
    const res = await ApiClient.put(`/org/positions/${id}`, data);
    return res.data;
  },

  /**
   * Xóa chức vụ
   */
  async deletePosition(id) {
    const res = await ApiClient.delete(`/org/positions/${id}`);
    return res.data;
  },

  /**
   * Lấy danh sách nhân sự để điều chuyển / gán
   */
  async getEmployees() {
    const res = await ApiClient.get('/org/employees');
    return res.data || [];
  },

  /**
   * Điều chuyển hoặc gán nhân viên vào phòng ban
   */
  async assignEmployee(employeeId, data) {
    const res = await ApiClient.put(`/org/employees/${employeeId}/assign`, data);
    return res.data;
  },

  /**
   * Điều chuyển hàng loạt nhân sự
   */
  async batchTransferEmployees(data) {
    const res = await ApiClient.post('/org/employees/batch-transfer', data);
    return res.data;
  }
};

export default OrgService;

