const API_BASE = 'http://localhost:3001';

/**
 * Centralized API client for the Dashboard backend.
 * All requests include credentials for session-based auth.
 */
async function request(endpoint, options = {}) {
    const { body, method = 'GET', headers: customHeaders = {} } = options;

    const token = localStorage.getItem('auth_token');

    const config = {
        method,
        credentials: 'include',
        headers: {
            ...customHeaders,
        },
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && !(body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        config.body = body;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `API Error: ${res.status}`);
    }

    // Handle empty responses (204, etc.)
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// ──── Auth ────
export const auth = {
    login: (email, password) =>
        request('/api/auth/sign-in/email', { method: 'POST', body: { email, password } }),
    loginNik: (nik) =>
        request('/api/auth/login-nik', { method: 'POST', body: { nik } }),
    register: (email, password, name) =>
        request('/api/auth/sign-up/email', { method: 'POST', body: { email, password, name } }),
    logout: () =>
        request('/api/auth/sign-out', { method: 'POST' }),
    getSession: () =>
        request('/api/auth/get-session'),
};

// ──── Dashboard ────
export const dashboard = {
    getStats: () => request('/api/dashboard/stats'),
    getIPLChart: (year) => request(`/api/dashboard/ipl-chart?year=${year || new Date().getFullYear()}`),
    getRecentActivity: (limit = 10) => request(`/api/dashboard/recent-activity?limit=${limit}`),
};

// ──── Households ────
export const households = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/households?${query}`);
    },
    get: (id) => request(`/api/households/${id}`),
    create: (data) => request('/api/households', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/households/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/api/households/${id}`, { method: 'DELETE' }),
};

// ──── Residents ────
export const residents = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/residents?${query}`);
    },
    get: (id) => request(`/api/residents/${id}`),
    create: (data) => request('/api/residents', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/residents/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/api/residents/${id}`, { method: 'DELETE' }),
};

// ──── IPL Payments ────
export const ipl = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/ipl?${query}`);
    },
    summary: (month, year) => request(`/api/ipl/summary?month=${month}&year=${year}`),
    get: (id) => request(`/api/ipl/${id}`),
    create: (data) => request('/api/ipl', { method: 'POST', body: data }),
    verify: (id, notes) => request(`/api/ipl/${id}/verify`, { method: 'PATCH', body: { notes } }),
    reject: (id, notes) => request(`/api/ipl/${id}/reject`, { method: 'PATCH', body: { notes } }),
    remind: (data) => request('/api/ipl/remind', { method: 'POST', body: data }),
};

// ──── Permits ────
export const permits = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/permits?${query}`);
    },
    stats: () => request('/api/permits/stats'),
    get: (id) => request(`/api/permits/${id}`),
    create: (data) => request('/api/permits', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/permits/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/api/permits/${id}`, { method: 'DELETE' }),
    approve: (id, rtNotes) => request(`/api/permits/${id}/approve`, { method: 'PATCH', body: { rtNotes } }),
    reject: (id, rtNotes) => request(`/api/permits/${id}/reject`, { method: 'PATCH', body: { rtNotes } }),
};

// ──── Mutations ────
export const mutations = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/mutations?${query}`);
    },
    stats: () => request('/api/mutations/stats'),
    get: (id) => request(`/api/mutations/${id}`),
    create: (data) => request('/api/mutations', { method: 'POST', body: data }),
    verify: (id) => request(`/api/mutations/${id}/verify`, { method: 'PATCH' }),
};

// ──── Reports ────
export const reports = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/reports?${query}`);
    },
    get: (id) => request(`/api/reports/${id}`),
    create: (data) => request('/api/reports', { method: 'POST', body: data }),
    updateStatus: (id, status) => request(`/api/reports/${id}/status`, { method: 'PATCH', body: { status } }),
    respond: (id, response) => request(`/api/reports/${id}/respond`, { method: 'POST', body: { response } }),
};

// ──── Activity Logs ────
export const logs = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/logs?${query}`);
    },
};

// ──── Upload ────
export const upload = {
    file: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return request('/api/upload', { method: 'POST', body: formData });
    },
};

// ──── Notifications ────
export const notifications = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/notifications?${query}`);
    },
    unreadCount: () => request('/api/notifications/unread-count'),
    markAsRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () => request('/api/notifications/read-all', { method: 'PATCH' }),
};
