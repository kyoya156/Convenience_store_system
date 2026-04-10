import api from './index'

export const cartApi = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart', data),
    update: (productId, data) => api.put(`/cart/${productId}`, data),
    remove: (productId) => api.delete(`/cart/${productId}`),
    clear: () => api.delete('/cart')
}