import axios from 'axios';

const API_URL = 'http://localhost:4500/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Get admin dashboard statistics
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return mock data if API not available
    return {
      totalUsers: Math.floor(Math.random() * 200) + 100,
      activeAdmins: Math.floor(Math.random() * 5) + 2,
      newRegistrations: Math.floor(Math.random() * 30) + 10,
      pendingRequests: Math.floor(Math.random() * 15) + 5,
      recentActivity: [
        {
          id: 1,
          action: "New user registered",
          user: "john.doe@example.com",
          time: "2 hours ago",
          status: "normal"
        },
        {
          id: 2,
          action: "User upgraded to Premium",
          user: "sarah.smith@example.com",
          time: "3 hours ago",
          status: "success"
        },
        {
          id: 3,
          action: "Failed login attempt",
          user: "unknown@example.com",
          time: "5 hours ago",
          status: "danger"
        },
        {
          id: 4,
          action: "Password changed",
          user: "mike.brown@example.com",
          time: "8 hours ago",
          status: "normal"
        },
        {
          id: 5,
          action: "Security alert",
          user: "system",
          time: "1 day ago",
          status: "warning"
        }
      ]
    };
  }
};

// Get all users with pagination
export const getUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return mock data if API not available
    return {
      users: [
        { id: 1, username: 'john_doe', email: 'john@example.com', role: 'user', lastActive: '2 days ago', status: 'active' },
        { id: 2, username: 'alice_smith', email: 'alice@example.com', role: 'admin', lastActive: '1 hour ago', status: 'active' },
        { id: 3, username: 'bob_jones', email: 'bob@example.com', role: 'manager', lastActive: '3 hours ago', status: 'active' },
        { id: 4, username: 'emma_wilson', email: 'emma@example.com', role: 'user', lastActive: '5 days ago', status: 'inactive' },
        { id: 5, username: 'mike_brown', email: 'mike@example.com', role: 'user', lastActive: '1 day ago', status: 'active' },
        { id: 6, username: 'sarah_johnson', email: 'sarah@example.com', role: 'manager', lastActive: '4 hours ago', status: 'active' },
        { id: 7, username: 'david_miller', email: 'david@example.com', role: 'user', lastActive: '1 week ago', status: 'inactive' },
      ],
      totalCount: 20, // Simulate more users for pagination
      page: page,
      limit: limit
    };
  }
};

// Add new user
export const addUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error adding user' };
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating user' };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting user' };
  }
};

// Get system settings
export const getSystemSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    // Return mock data if API not available
    return {
      siteName: 'Security App',
      siteDescription: 'Advanced security application for user authentication',
      sessionTimeout: 30,
      defaultRole: 'user',
      enableRegistration: true,
      requireEmailVerification: true,
      maxLoginAttempts: 5,
      passwordResetTimeout: 24,
      twoFactorAuth: false,
      twoFactorMethod: 'email'
    };
  }
};

// Update system settings
export const updateSystemSettings = async (settings) => {
  try {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating settings' };
  }
};

// Get roles
export const getRoles = async () => {
  try {
    const response = await api.get('/admin/roles');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    // Return mock data if API not available
    return [
      { id: 'admin', name: 'Administrator', permissions: ['all'] },
      { id: 'manager', name: 'Manager', permissions: ['users.view', 'users.edit', 'stats.view'] },
      { id: 'user', name: 'Standard User', permissions: ['profile.view', 'profile.edit'] },
      { id: 'guest', name: 'Guest', permissions: ['profile.view'] }
    ];
  }
};

// Get audit logs
export const getAuditLogs = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    // Return mock data if API not available
    return {
      logs: Array(limit).fill().map((_, idx) => ({
        id: idx + 1,
        action: ['Login', 'Logout', 'Create', 'Update', 'Delete'][Math.floor(Math.random() * 5)],
        user: ['admin', 'john_doe', 'alice_smith'][Math.floor(Math.random() * 3)],
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        details: 'Action performed on resource'
      })),
      totalCount: 100,
      page,
      limit
    };
  }
};

// Get security metrics
export const getSecurityMetrics = async (period = 'week') => {
  try {
    const response = await api.get(`/admin/security/metrics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    // Return mock data if API not available
    return {
      loginAttempts: {
        successful: Math.floor(Math.random() * 100) + 50,
        failed: Math.floor(Math.random() * 30) + 10
      },
      passwordResets: Math.floor(Math.random() * 20) + 5,
      securityAlerts: Math.floor(Math.random() * 15),
      userRegistrations: Math.floor(Math.random() * 25) + 10
    };
  }
};

export default {
  getAdminStats,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getSystemSettings,
  updateSystemSettings,
  getRoles,
  getAuditLogs,
  getSecurityMetrics
};
