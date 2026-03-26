import api from './index'

// Backend routes:
// - POST /api/auth/register
// - POST /api/auth/login
// - GET  /api/auth/me
//
// `api` already uses baseURL: '/api' and automatically attaches the JWT header.
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}