import ApiClient from './ApiClient';

export const AuthService = {
  async login(username, password) {
    const res = await ApiClient.post('/auth/login', { username, password });
    if (res.success && res.data) {
      this.setSession(res.data.token, res.data.user);
    }
    return res;
  },

  async register({ username, password, fullName, email, phone }) {
    const res = await ApiClient.post('/auth/register', {
      username,
      password,
      fullName,
      email,
      phone
    });
    if (res.success && res.data) {
      this.setSession(res.data.token, res.data.user);
    }
    return res;
  },

  async getMe() {
    return await ApiClient.get('/auth/me');
  },

  async updateProfile(profileData) {
    const res = await ApiClient.put('/auth/profile', profileData);
    if (res.success && res.data) {
      const current = this.getCurrentUser() || {};
      const updated = { ...current, ...res.data };
      this.setSession(null, updated);
    }
    return res;
  },

  async changePassword(currentPassword, newPassword) {
    return await ApiClient.post('/auth/change-password', { currentPassword, newPassword });
  },

  logout() {
    this.clearSession();
  },

  setSession(token, user) {
    if (token) localStorage.setItem('hrm_token', token);
    if (user) localStorage.setItem('hrm_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('hrm_token');
    localStorage.removeItem('hrm_user');
  },

  getToken() {
    return localStorage.getItem('hrm_token');
  },

  getCurrentUser() {
    const raw = localStorage.getItem('hrm_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  }
};

export default AuthService;
