import ApiClient from './ApiClient';

export const EmployeeService = {
  async getMyProfile() {
    const res = await ApiClient.get('/employees/me');
    return res.data;
  },

  async updateMyProfile(data) {
    const res = await ApiClient.put('/employees/me', data);
    return res.data;
  },

  async getTeamMembers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.positionId) query.append('positionId', params.positionId);
    if (params.faceStatus) query.append('faceStatus', params.faceStatus);
    const qs = query.toString();
    const endpoint = qs ? `/employees/team?${qs}` : '/employees/team';
    const res = await ApiClient.get(endpoint);
    return res.data;
  },

  async getTeamMemberDetail(id) {
    const res = await ApiClient.get(`/employees/team/${id}`);
    return res.data;
  }
};

export default EmployeeService;
