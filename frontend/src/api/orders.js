import api from './index'

export const orderApi = {
  create:  (data) => api.post('/orders', data),
  getAll:  ()     => api.get('/orders'),
  getById: (id)   => api.get(`/orders/${id}`),
}