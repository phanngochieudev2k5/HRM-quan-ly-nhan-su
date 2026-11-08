import ApiClient from './ApiClient';

export const LaborContractService = {
  /**
   * Lấy danh sách hợp đồng (hỗ trợ search, status, contractType, departmentId, expiringDays)
   */
  async getContracts(params = {}) {
    const res = await ApiClient.get('/labor-contracts', { params });
    return res.data || [];
  },

  /**
   * Lấy thống kê KPI và cảnh báo hợp đồng
   */
  async getStats() {
    const res = await ApiClient.get('/labor-contracts/stats');
    return res.data || {};
  },

  /**
   * Lấy danh sách các hợp đồng sắp hết hạn (trong vòng N ngày)
   */
  async getExpiringAlerts(days = 30) {
    const res = await ApiClient.get('/labor-contracts/expiring-alerts', { params: { days } });
    return res.data || [];
  },

  /**
   * Lấy danh sách nhân viên kèm trạng thái hợp đồng mới nhất
   */
  async getEmployeesOverview() {
    const res = await ApiClient.get('/labor-contracts/employees-overview');
    return res.data || [];
  },

  /**
   * Tra cứu toàn bộ lịch sử hợp đồng của 1 nhân viên theo từng giai đoạn làm việc
   */
  async getEmployeeContractHistory(employeeId) {
    const res = await ApiClient.get(`/labor-contracts/history/${employeeId}`);
    return res.data || { employee: null, history: [] };
  },

  /**
   * Lấy chi tiết 1 hợp đồng
   */
  async getContractById(id) {
    const res = await ApiClient.get(`/labor-contracts/${id}`);
    return res.data;
  },

  /**
   * Tạo mới hợp đồng lao động
   */
  async createContract(data) {
    const res = await ApiClient.post('/labor-contracts', data);
    return res.data;
  },

  /**
   * Cập nhật hợp đồng lao động
   */
  async updateContract(id, data) {
    const res = await ApiClient.put(`/labor-contracts/${id}`, data);
    return res.data;
  },

  /**
   * Xóa hợp đồng lao động
   */
  async deleteContract(id) {
    const res = await ApiClient.delete(`/labor-contracts/${id}`);
    return res.data;
  },

  /**
   * Gia hạn / Ký tiếp hợp đồng mới từ hợp đồng cũ
   */
  async renewContract(id, data) {
    const res = await ApiClient.post(`/labor-contracts/${id}/renew`, data);
    return res.data;
  }
};

export default LaborContractService;

