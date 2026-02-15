import api from './axios';

// ─── Auth ───
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    googleLogin: (data) => api.post('/auth/google', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Stores ───
export const storeAPI = {
    create: (data) => api.post('/stores', data),
    update: (data) => api.put('/stores', data),
    getMyStore: () => api.get('/stores/me/dashboard'),
    getById: (id) => api.get(`/stores/${id}`),
    getAll: (params) => api.get('/stores', { params }),
    getRevenue: (params) => api.get('/stores/me/revenue', { params }),
};

// ─── Products ───
export const productAPI = {
    create: (formData) => api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/products/${id}`),
    getById: (id) => api.get(`/products/${id}`),
    getAll: (params) => api.get('/products', { params }),
    getMy: (params) => api.get('/products/my/list', { params }),
};

// ─── Search ───
export const searchAPI = {
    search: (params) => api.get('/search', { params }),
};

// ─── Cart ───
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart', data),
    update: (id, data) => api.put(`/cart/${id}`, data),
    remove: (id) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart/clear'),
};

// ─── Orders ───
export const orderAPI = {
    checkout: (data) => api.post('/orders/checkout', data),
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    getSellerOrders: (params) => api.get('/orders/seller/list', { params }),
    updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

// ─── Reviews ───
export const reviewAPI = {
    addProductReview: (productId, data) => api.post(`/reviews/product/${productId}`, data),
    addStoreReview: (storeId, data) => api.post(`/reviews/store/${storeId}`, data),
    getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
    getStoreReviews: (storeId, params) => api.get(`/reviews/store/${storeId}`, { params }),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// ─── Notifications ───
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/read-all'),
};
