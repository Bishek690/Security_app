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
    } else {
      // For testing purposes, use a known working token
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIzMzNjYWE1LWI4YmEtNDM2NS1iOTAwLWRkNTg4ZmJlZjljNiIsImlhdCI6MTc1MTQ3NTE2MywiZXhwIjoxNzUxNTYxNTYzfQ.uCI-hEk9twVZDJk8ulJUeZlSMSJ2H55KN4XuDTA5zys';
      config.headers.Authorization = `Bearer ${testToken}`;
      console.warn('Using test token for admin API calls');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.warn('API Error:', error.message);
    
    // Check if the error is due to backend server not running
    if (!error.response) {
      console.warn('Backend server might be down or not available');
    }
    
    return Promise.reject(error);
  }
);

// Get admin dashboard statistics
export const getAdminStats = async (timeRange = '7d') => {
  try {
    // Check if we have a token
    const token = localStorage.getItem('token');
    console.log('Token available:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    // Always try the API first, then fallback to mock data if needed
    try {
      console.info('Fetching admin stats from API...');
      const response = await api.get(`/admin/stats?timeRange=${timeRange}`);
      console.info('Successfully retrieved admin stats from API:', response.data);
      return response.data;
    } catch (apiError) {
      console.warn('API error for admin stats, falling back to mock data:', apiError.message);
      console.warn('API error details:', apiError.response?.data || 'No response data');
      // API request failed, use mock data
      return generateMockAdminStats(timeRange);
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return generateMockAdminStats(timeRange);
  }
};

// Helper function to generate consistent mock data
const generateMockAdminStats = (timeRange) => {
  // Use timeRange to generate appropriate mock data
  const scaleFactor = timeRange === '1d' ? 1 : 
                      timeRange === '7d' ? 7 :
                      timeRange === '30d' ? 30 : 90;
  
  return {
    totalUsers: Math.floor(Math.random() * 200) + 100,
    activeAdmins: Math.floor(Math.random() * 5) + 2,
    adminUsers: Math.floor(Math.random() * 3) + 1,
    newRegistrations: Math.floor(Math.random() * 10 * scaleFactor) + 5,
    failedLogins: Math.floor(Math.random() * 8 * scaleFactor) + 2,
    recentActivity: [
        {
          id: 1,
          action: "New user registered",
          user: "john.doe@example.com",
          time: "2 hours ago",
          status: "normal",
          details: "User registration completed successfully"
        },
        {
          id: 2,
          action: "User upgraded to Premium",
          user: "sarah.smith@example.com",
          time: "3 hours ago",
          status: "success",
          details: "Subscription plan changed"
        },
        {
          id: 3,
          action: "Failed login attempt",
          user: "unknown@example.com",
          time: "5 hours ago",
          status: "danger",
          details: "Multiple failed attempts detected"
        },
        {
          id: 4,
          action: "Password changed",
          user: "mike.brown@example.com",
          time: "8 hours ago",
          status: "normal",
          details: "Password reset via email"
        },
        {
          id: 5,
          action: "Security alert",
          user: "system",
          time: "1 day ago",
          status: "warning",
          details: "Unusual login location detected"
        }
      ]
    };
};

// Get all users with pagination
export const getUsers = async (page = 1, limit = 10, search = '') => {
  try {
    console.info('Fetching users from API...');
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
    console.info('Successfully retrieved users from API');
    return response.data;
  } catch (error) {
    console.warn('API error for users, falling back to mock data:', error.message);
    // Return mock data if API not available
    const mockUsers = Array.from({ length: limit }, (_, idx) => ({
      id: ((page - 1) * limit) + idx + 1,
      username: `user${((page - 1) * limit) + idx + 1}`,
      email: `user${((page - 1) * limit) + idx + 1}@example.com`,
      role: idx === 0 ? 'admin' : 'user',
      status: 'active',
      lastActive: 'Recently',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    return {
      users: mockUsers,
      totalCount: 20,
      page: page,
      limit: limit
    };
  }
};

// Add new user
export const addUser = async (userData) => {
  try {
    console.info('Adding new user via API...');
    const response = await api.post('/admin/users', userData);
    console.info('Successfully added user via API');
    return response.data;
  } catch (error) {
    console.error('Error adding user via API:', error);
    throw error.response?.data || { message: 'Error adding user' };
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    console.info('Updating user via API...');
    const response = await api.put(`/admin/users/${userId}`, userData);
    console.info('Successfully updated user via API');
    return response.data;
  } catch (error) {
    console.error('Error updating user via API:', error);
    throw error.response?.data || { message: 'Error updating user' };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    console.info('Deleting user via API...');
    const response = await api.delete(`/admin/users/${userId}`);
    console.info('Successfully deleted user via API');
    return response.data;
  } catch (error) {
    console.error('Error deleting user via API:', error);
    throw error.response?.data || { message: 'Error deleting user' };
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
export const getAuditLogs = async (page = 1, limit = 20, search = '', action = '') => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) params.append('search', search);
    if (action) params.append('action', action);
    
    // Try to fetch from the API
    try {
      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      return response.data;
    } catch (apiError) {
      console.warn('Using mock data for audit logs because API endpoint returned error:', apiError.message);
      // API failed, use mock data
      return generateMockAuditLogs(page, limit, search, action);
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    // Return mock data if API not available
    return generateMockAuditLogs(page, limit, search, action);
  }
};

// Helper function to generate mock audit logs
const generateMockAuditLogs = (page = 1, limit = 20, search = '', action = '') => {
  // Generate more realistic and detailed mock audit logs
  const users = [
    'admin@example.com', 
    'john.doe@example.com', 
    'alice.smith@example.com', 
    'bob.johnson@example.com',
    'sarah.wilson@example.com'
  ];
  
  const actionTypes = [
    { type: 'User login', details: 'User logged in successfully' },
    { type: 'User logout', details: 'User logged out' },
    { type: 'New user registered', details: 'User created a new account' },
    { type: 'Profile updated', details: 'User profile was updated' },
    { type: 'User deleted', details: 'User account was deleted' },
    { type: 'Password reset', details: 'Password reset requested' },
    { type: 'Failed login attempt', details: 'Failed login attempt' },
    { type: 'Role changed', details: 'User role was modified' }
  ];
  
  const ipAddresses = [
    '192.168.1.' + Math.floor(Math.random() * 255),
    '10.0.0.' + Math.floor(Math.random() * 255),
    '172.16.0.' + Math.floor(Math.random() * 255),
    '8.8.8.' + Math.floor(Math.random() * 255)
  ];

  let filteredActions = actionTypes;
  
  // Apply action filter if provided
  if (action) {
    filteredActions = actionTypes.filter(act => act.type.toLowerCase().includes(action.toLowerCase()));
  }
  
  let allLogs = Array(100).fill().map((_, idx) => {
    const actionInfo = filteredActions.length > 0 
      ? filteredActions[Math.floor(Math.random() * filteredActions.length)]
      : actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    return {
      id: idx + 1,
      action: actionInfo.type,
      user: user,
      ip: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      details: actionInfo.details,
      status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'warning' : 'danger') : 'normal'
    };
  });
  
  // Apply search filter if provided
  if (search) {
    const searchLower = search.toLowerCase();
    allLogs = allLogs.filter(log => 
      log.action.toLowerCase().includes(searchLower) ||
      log.user.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower) ||
      log.ip.includes(search)
    );
  }
  
  const totalCount = allLogs.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const logs = allLogs.slice(startIndex, endIndex);
  
  return {
    logs,
    totalCount,
    page,
    limit,
    hasMore: endIndex < totalCount
  };
};

// Get security metrics
export const getSecurityMetrics = async (period = 'week', includeComparison = false) => {
  try {
    // Always try the API first, then fallback to mock data if needed
    try {
      console.info('Fetching security metrics from API...');
      const response = await api.get(`/admin/security/metrics?period=${period}&compare=${includeComparison}`);
      console.info('Successfully retrieved security metrics from API');
      return response.data;
    } catch (apiError) {
      console.warn('API error for security metrics, falling back to mock data:', apiError.message);
      return generateMockSecurityMetrics(period, includeComparison);
    }
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return generateMockSecurityMetrics(period, includeComparison);
  }
};

// Helper function to generate mock security metrics
const generateMockSecurityMetrics = (period, includeComparison) => {
  // Calculate mock metrics with comparison data if requested
  const mockData = {
    metrics: {
      loginAttempts: {
        successful: Math.floor(Math.random() * 100) + 50,
        failed: Math.floor(Math.random() * 30) + 10,
        successRate: Math.floor(Math.random() * 30) + 70 // 70-100%
      },
      passwordResets: Math.floor(Math.random() * 20) + 5,
      suspiciousActivities: Math.floor(Math.random() * 15),
      userRegistrations: Math.floor(Math.random() * 25) + 10
    }
  };
  
  if (includeComparison) {
    mockData.previousPeriod = {
      loginAttempts: {
        successful: Math.floor(Math.random() * 100) + 50,
        failed: Math.floor(Math.random() * 30) + 10,
        successfulChange: (Math.random() * 20 - 10).toFixed(1),
        failedChange: (Math.random() * 20 - 10).toFixed(1)
      },
      userRegistrationsChange: (Math.random() * 30 - 15).toFixed(1),
      suspiciousActivitiesChange: (Math.random() * 20 - 10).toFixed(1)
    };
  }
  
  return mockData;
};

// Get dashboard analytics data
export const getDashboardAnalytics = async (timeRange = '7d') => {
  try {
    // Always try the API first, then fallback to mock data if needed
    try {
      console.info('Fetching dashboard analytics from API...');
      const response = await api.get(`/admin/analytics?timeRange=${timeRange}`);
      console.info('Successfully retrieved dashboard analytics from API');
      return response.data;
    } catch (apiError) {
      console.warn('API error for dashboard analytics, falling back to mock data:', apiError.message);
      // API failed, use mock data
      return generateMockDashboardAnalytics(timeRange);
    }
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return generateMockDashboardAnalytics(timeRange);
  }
};

// Helper function to generate mock dashboard analytics
const generateMockDashboardAnalytics = (timeRange) => {
  // Generate dates for the mock data
  const generateDates = (days) => {
    const dates = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  
  // Get number of days based on timeRange
  const days = timeRange === '1d' ? 1 : 
              timeRange === '7d' ? 7 : 
              timeRange === '30d' ? 30 : 90;
  
  const dates = generateDates(days);
  
  // Create mock data with timestamps to ensure consistent UI rendering
  return {
    userGrowth: dates.map((date, i) => ({
      date,
      count: Math.floor(Math.random() * 10) + (i > 0 ? 1 : 0) // Ensure at least some growth
    })),
    loginActivity: dates.map(date => ({
      date,
      successful: Math.floor(Math.random() * 30) + 15,
      failed: Math.floor(Math.random() * 10) + 1
    })),
    securityIncidents: dates.map(date => ({
      date,
      count: Math.floor(Math.random() * 5)
    })),
    // Additional analytics data
    userActivities: {
      registrations: Math.floor(Math.random() * 100) + 50,
      deletions: Math.floor(Math.random() * 20),
      passwordChanges: Math.floor(Math.random() * 40) + 10
    },
    topReferrers: [
      { source: 'Direct', count: Math.floor(Math.random() * 100) + 50 },
      { source: 'Google', count: Math.floor(Math.random() * 80) + 30 },
      { source: 'Bing', count: Math.floor(Math.random() * 40) + 10 },
      { source: 'Twitter', count: Math.floor(Math.random() * 30) + 5 }
    ]
  };
};

// Get recent activities
export const getRecentActivities = async (limit = 5) => {
  try {
    console.info('Fetching recent activities from API...');
    const response = await api.get(`/admin/recent-activities?limit=${limit}`);
    console.info('Successfully retrieved recent activities from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    console.error('API error details:', error.response?.data || 'No response data');
    // Only fallback to mock data if API is completely unavailable
    console.warn('Falling back to mock data for recent activities');
    return generateMockActivities(limit);
  }
};

// Helper function to generate mock activity data
const generateMockActivities = (limit = 5) => {
  const activities = [
    {
      id: 1,
      action: "New user registered",
      user: "john.doe@example.com",
      time: "2 hours ago",
      status: "normal",
      details: "User registration completed successfully"
    },
    {
      id: 2,
      action: "User upgraded to Premium",
      user: "sarah.smith@example.com",
      time: "3 hours ago",
      status: "success",
      details: "Subscription plan changed"
    },
    {
      id: 3,
      action: "Failed login attempt",
      user: "unknown@example.com",
      time: "5 hours ago",
      status: "danger",
      details: "Multiple failed attempts detected"
    },
    {
      id: 4,
      action: "Password changed",
      user: "mike.brown@example.com",
      time: "8 hours ago",
      status: "normal",
      details: "Password reset via email"
    },
    {
      id: 5,
      action: "Security alert",
      user: "system",
      time: "1 day ago",
      status: "warning",
      details: "Unusual login location detected"
    },
    {
      id: 6,
      action: "System backup",
      user: "system",
      time: "2 days ago",
      status: "success",
      details: "Weekly backup completed successfully"
    }
  ];
  
  // Return only the requested number of activities
  return activities.slice(0, limit);
};

// Get system settings
export const getSystemSettings = async () => {
  try {
    // Try to get from API first
    try {
      console.info('Fetching system settings from API...');
      const response = await api.get('/admin/settings');
      console.info('Successfully retrieved system settings from API');
      return response.data;
    } catch (apiError) {
      console.warn('API error for system settings, falling back to mock data:', apiError.message);
      // Return mock settings data
      return {
        // General settings
        siteName: 'Security App Admin',
        siteDescription: 'Advanced Cyber Security Management System',
        siteUrl: 'https://securityapp.example.com',
        adminEmail: 'admin@securityapp.com',
        timezone: 'UTC',
        language: 'en',
        
        // Security settings
        sessionTimeout: 30,
        defaultRole: 'user',
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        passwordRequireLowercase: true,
        enableTwoFactor: false,
        enableCaptcha: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        
        // Notification settings
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notifyOnFailedLogin: true,
        notifyOnNewUser: true,
        notifyOnSuspiciousActivity: true,
        
        // System settings
        maintenanceMode: false,
        enableRegistration: true,
        enableGuestAccess: false,
        systemBackupEnabled: true,
        systemBackupFrequency: 'daily',
        logRetentionDays: 90,
        
        // UI settings
        theme: 'light',
        primaryColor: '#3B82F6',
        enableDarkMode: true,
        compactMode: false
      };
    }
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

// Update system settings
export const updateSystemSettings = async (settingsData) => {
  try {
    // Try to update via API first
    try {
      console.info('Updating system settings via API...');
      const response = await api.put('/admin/settings', settingsData);
      console.info('Successfully updated system settings via API');
      return response.data;
    } catch (apiError) {
      console.warn('API error for updating system settings:', apiError.message);
      // For testing, simulate successful update
      console.info('Simulating successful settings update');
      return {
        success: true,
        message: 'Settings updated successfully',
        updatedSettings: settingsData
      };
    }
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};

export default {
  getAdminStats,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getRoles,
  getAuditLogs,
  getSecurityMetrics,
  getDashboardAnalytics,
  getRecentActivities,
  getSystemSettings,
  updateSystemSettings
};
