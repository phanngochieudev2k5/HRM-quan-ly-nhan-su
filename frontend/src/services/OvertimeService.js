import ApiClient from './ApiClient';

export const OvertimeService = {
  async getMyRequests() {
    const res = await ApiClient.get('/overtime/my');
    return res.data;
  },

  async createRequest(data) {
    const res = await ApiClient.post('/overtime/my', data);
    return res.data;
  },

  async cancelRequest(id) {
    const res = await ApiClient.put(`/overtime/my/${id}/cancel`);
    return res.data;
  },

  async getTeamRequests(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    const endpoint = qs ? `/overtime/team?${qs}` : '/overtime/team';
    const res = await ApiClient.get(endpoint);
    return res.data;
  },

  async approveRequest(id, comment) {
    const res = await ApiClient.put(`/overtime/${id}/approve`, { comment });
    return res.data;
  },

  async rejectRequest(id, comment) {
    const res = await ApiClient.put(`/overtime/${id}/reject`, { comment });
    return res.data;
  },

  async getAllRequests(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.departmentId) query.append('departmentId', params.departmentId);
    const qs = query.toString();
    const endpoint = qs ? `/overtime?${qs}` : '/overtime';
    const res = await ApiClient.get(endpoint);
    return res.data;
  }
};

export default OvertimeService;
