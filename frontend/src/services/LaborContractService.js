import ApiClient from './ApiClient';

export const LaborContractService = {
  async getContracts(params = {}) {
    const res = await ApiClient.get('/labor-contracts', { params });
    return res.data || [];
  },

  async getStats() {
    const res = await ApiClient.get('/labor-contracts/stats');
    return res.data || {};
  },

  async getExpiringAlerts(days = 30) {
    const res = await ApiClient.get('/labor-contracts/expiring-alerts', { params: { days } });
    return res.data || [];
  },

  async getEmployeesOverview() {
    const res = await ApiClient.get('/labor-contracts/employees-overview');
    return res.data || [];
  },

  async getEmployeeContractHistory(employeeId) {
    const res = await ApiClient.get(`/labor-contracts/history/${employeeId}`);
    return res.data || { employee: null, history: [] };
  },

  async getContractById(id) {
    const res = await ApiClient.get(`/labor-contracts/${id}`);
    return res.data;
  },

  async createContract(data) {
    const res = await ApiClient.post('/labor-contracts', data);
    return res.data;
  },

  async updateContract(id, data) {
    const res = await ApiClient.put(`/labor-contracts/${id}`, data);
    return res.data;
  },

  async deleteContract(id) {
    const res = await ApiClient.delete(`/labor-contracts/${id}`);
    return res.data;
  },

  async renewContract(id, data) {
    const res = await ApiClient.post(`/labor-contracts/${id}/renew`, data);
    return res.data;
  },

  async terminateContract(id, data) {
    const res = await ApiClient.post(`/labor-contracts/${id}/terminate`, data);
    return res.data;
  },

  async respondResignation(id, data) {
    const res = await ApiClient.post(`/labor-contracts/${id}/respond-resignation`, data);
    return res.data;
  }
};

export default LaborContractService;
