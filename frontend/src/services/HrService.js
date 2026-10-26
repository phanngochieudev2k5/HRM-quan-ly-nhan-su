import ApiClient from './ApiClient';

export const HrService = {
  
  async getEmployees() {
    try {
      const res = await ApiClient.get('/hr/employees');
      return res.data || [];
    } catch {
      return [];
    }
  }
};

export default HrService;
