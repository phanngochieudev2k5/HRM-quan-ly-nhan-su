import ApiClient from './ApiClient';

export const OrgService = {
  async getOrgTree() {
    const res = await ApiClient.get('/org/tree');
    return res.data || { tree: [], departments: [], stats: {} };
  },

  async getDepartments() {
    const res = await ApiClient.get('/org/departments');
    return res.data || [];
  },

  async createDepartment(data) {
    const res = await ApiClient.post('/org/departments', data);
    return res.data;
  },

  async updateDepartment(id, data) {
    const res = await ApiClient.put(`/org/departments/${id}`, data);
    return res.data;
  },

  async deleteDepartment(id) {
    const res = await ApiClient.delete(`/org/departments/${id}`);
    return res.data;
  },

  async getPositions() {
    const res = await ApiClient.get('/org/positions');
    return res.data || [];
  },

  async createPosition(data) {
    const res = await ApiClient.post('/org/positions', data);
    return res.data;
  },

  async updatePosition(id, data) {
    const res = await ApiClient.put(`/org/positions/${id}`, data);
    return res.data;
  },

  async deletePosition(id) {
    const res = await ApiClient.delete(`/org/positions/${id}`);
    return res.data;
  },

  async getEmployees() {
    const res = await ApiClient.get('/org/employees');
    return res.data || [];
  },

  async assignEmployee(employeeId, data) {
    const res = await ApiClient.put(`/org/employees/${employeeId}/assign`, data);
    return res.data;
  },

  async batchTransferEmployees(data) {
    const res = await ApiClient.post('/org/employees/batch-transfer', data);
    return res.data;
  }
};

export default OrgService;
