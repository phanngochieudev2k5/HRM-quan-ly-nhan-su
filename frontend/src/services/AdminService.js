import ApiClient from './ApiClient';

export const AdminService = {
  
  async getAccounts() {
    const res = await ApiClient.get('/admin/accounts');
    return res.data || [];
  },

  async updateUserRole(userId, roleCode) {
    const res = await ApiClient.put(`/admin/accounts/${userId}/role`, { roleCode });
    return res.data;
  },

  async toggleUserLock(userId) {
    const res = await ApiClient.put(`/admin/accounts/${userId}/lock`);
    return res.data;
  },

  async getAuditLogs() {
    const res = await ApiClient.get('/admin/logs');
    return res.data || [];
  }
};

export default AdminService;
