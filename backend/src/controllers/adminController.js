const { User } = require("../entities/User");
const { AppDataSource } = require("../config/data-source");

// Get admin dashboard statistics
exports.getAdminStats = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '7d';
    
    // Scale mock data based on time range
    const scaleFactor = timeRange === '1d' ? 1 : 
                      timeRange === '7d' ? 7 :
                      timeRange === '30d' ? 30 : 90;
                      
    // Generate mock stats - no database dependency
    const totalUsers = 120 + Math.floor(Math.random() * 30);
    const activeAdmins = 3 + Math.floor(Math.random() * 2);
    const newRegistrations = Math.floor(Math.random() * 10 * scaleFactor) + 5;
    const pendingRequests = Math.floor(Math.random() * 5 * scaleFactor) + 3;
    const failedLogins = Math.floor(Math.random() * 8 * scaleFactor) + 2;
    
    // Get recent activities from the database
    const activityLogRepository = AppDataSource.getRepository("ActivityLog");
    
    let recentActivity = [];
    
    try {
      // Fetch recent activities from the database
      const activities = await activityLogRepository.find({
        order: {
          createdAt: "DESC"
        },
        take: 5
      });
      
      // Format the activities for the frontend
      if (activities.length > 0) {
        recentActivity = activities.map(activity => ({
          id: activity.id,
          action: activity.action,
          user: activity.userEmail || 'system',
          time: formatTimeAgo(activity.createdAt),
          status: activity.status || 'normal',
          details: activity.details || ''
        }));
      }
        
    } catch (activityError) {
      console.error("Error fetching recent activities:", activityError);
      // Fallback to mock data if fetching activities fails
      recentActivity = [
        {
          id: 1,
          action: "System restarted",
          user: "system",
          time: "1 hour ago",
          status: "normal",
          details: "Scheduled maintenance"
        },
        {
          id: 2,
          action: "Database backup",
          user: "system",
          time: "4 hours ago",
          status: "success",
          details: "Daily backup completed"
        }
      ];
    }
    
    res.status(200).json({
      totalUsers,
      activeAdmins,
      newRegistrations,
      pendingRequests,
      failedLogins,
      recentActivity
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    // Return a more detailed error message for debugging
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get security metrics
exports.getSecurityMetrics = async (req, res) => {
  try {
    const period = req.query.period || 'week';
    const includeComparison = req.query.compare === 'true';
    
    // For demonstration, creating mock security metrics
    // In a real app, you would query the database for these metrics
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
    
    res.status(200).json(mockData);
  } catch (error) {
    console.error("Error fetching security metrics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get dashboard analytics data
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '7d';
    
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
    const mockData = {
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
    
    res.status(200).json(mockData);
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get users with pagination and search
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Filter by search term if provided
    let filteredUsers = mockUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = mockUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination
    const totalCount = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.status(200).json({
      users: paginatedUsers,
      totalCount,
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get audit logs with pagination
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Generate mock audit logs
    // In a real app, you would query the database for these logs
    const users = [
      'admin@example.com', 
      'john.doe@example.com', 
      'alice.smith@example.com', 
      'bob.johnson@example.com',
      'sarah.wilson@example.com'
    ];
    
    const actionTypes = [
      { type: 'Login', details: 'User logged in successfully' },
      { type: 'Logout', details: 'User logged out' },
      { type: 'Create', details: 'User created a new account' },
      { type: 'Update', details: 'User profile was updated' },
      { type: 'Delete', details: 'User account was deleted' },
      { type: 'Reset', details: 'Password reset requested' },
      { type: 'Failed', details: 'Failed login attempt' }
    ];
    
    const ipAddresses = [
      '192.168.1.' + Math.floor(Math.random() * 255),
      '10.0.0.' + Math.floor(Math.random() * 255),
      '172.16.0.' + Math.floor(Math.random() * 255),
      '8.8.8.' + Math.floor(Math.random() * 255)
    ];
    
    const logs = Array(limit).fill().map((_, idx) => {
      const actionInfo = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      return {
        id: ((page - 1) * limit) + idx + 1,
        action: actionInfo.type,
        user: users[Math.floor(Math.random() * users.length)],
        ip: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        details: actionInfo.details
      };
    });
    
    res.status(200).json({
      logs,
      totalCount: 100, // Mock total count
      page,
      limit
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get system settings
exports.getSystemSettings = async (req, res) => {
  try {
    // In a real app, you would fetch these from the database
    // For now, returning mock data
    res.status(200).json({
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
    });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // In a real app, you would validate and update these settings in the database
    // For now, just returning success
    res.status(200).json({ 
      message: "Settings updated successfully",
      settings
    });
  } catch (error) {
    console.error("Error updating system settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get roles
exports.getRoles = async (req, res) => {
  try {
    // In a real app, you would fetch these from the database
    // For now, returning mock data
    res.status(200).json([
      { id: 'admin', name: 'Administrator', permissions: ['all'] },
      { id: 'manager', name: 'Manager', permissions: ['users.view', 'users.edit', 'stats.view'] },
      { id: 'user', name: 'Standard User', permissions: ['profile.view', 'profile.edit'] },
      { id: 'guest', name: 'Guest', permissions: ['profile.view'] }
    ]);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;
    
    const activityLogRepository = AppDataSource.getRepository("ActivityLog");
    
    const activities = await activityLogRepository.find({
      order: {
        createdAt: "DESC"
      },
      take: limit,
      skip: offset
    });
    
    // If no activities are found, seed some initial data
    if (activities.length === 0) {
      // Just return empty array for now, or we could seed some initial data
      return res.status(200).json([]);
    }
    
    // Format the activities for the frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      user: activity.userEmail || 'system',
      time: formatTimeAgo(activity.createdAt),
      status: activity.status || 'normal',
      details: activity.details || ''
    }));
    
    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ 
      message: "Error fetching recent activities", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Seed activity logs for testing
exports.seedActivityLogs = async (count = 10) => {
  try {
    const activityLogRepository = AppDataSource.getRepository("ActivityLog");
    const existingCount = await activityLogRepository.count();
    
    if (existingCount > 0) {
      console.log(`${existingCount} activity logs already exist. Skipping seeding.`);
      return;
    }
    
    console.log(`Seeding ${count} activity logs...`);
    
    const actions = [
      "User login",
      "New user registered",
      "Password changed",
      "Failed login attempt",
      "User profile updated",
      "Security setting changed",
      "User logged out",
      "Account locked",
      "Account unlocked",
      "Password reset requested"
    ];
    
    const statuses = ["normal", "success", "warning", "danger"];
    
    const users = [
      "admin@example.com",
      "john.doe@example.com",
      "sarah.smith@example.com",
      "mike.brown@example.com",
      "system"
    ];
    
    const details = [
      "Successful operation",
      "Operation completed with warnings",
      "Failed operation",
      "Suspicious activity detected",
      "Multiple attempts detected",
      "Password reset via email",
      "User registration completed successfully",
      "Subscription plan changed",
      "Account verification completed",
      "IP address changed"
    ];
    
    const logs = [];
    
    for (let i = 0; i < count; i++) {
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 48)); // Random time in the past 48 hours
      
      logs.push({
        action: actions[Math.floor(Math.random() * actions.length)],
        userEmail: users[Math.floor(Math.random() * users.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        details: details[Math.floor(Math.random() * details.length)],
        createdAt: createdAt
      });
    }
    
    await activityLogRepository.save(logs);
    console.log(`Successfully seeded ${count} activity logs`);
  } catch (error) {
    console.error("Error seeding activity logs:", error);
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + ' years ago';
  if (interval === 1) return '1 year ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + ' months ago';
  if (interval === 1) return '1 month ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + ' days ago';
  if (interval === 1) return '1 day ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + ' hours ago';
  if (interval === 1) return '1 hour ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + ' minutes ago';
  if (interval === 1) return '1 minute ago';
  
  return 'just now';
}

// Test endpoint to check API connectivity
exports.testApi = async (req, res) => {
  console.log('Test API endpoint called');
  res.status(200).json({ message: "API is working", timestamp: new Date().toISOString() });
};

// Index route to list available endpoints
exports.listEndpoints = async (req, res) => {
  res.status(200).json({
    message: "Admin API Endpoints",
    endpoints: [
      { method: "GET", path: "/api/admin/test", description: "Test API connectivity" },
      { method: "GET", path: "/api/admin/stats", description: "Get admin dashboard statistics" },
      { method: "GET", path: "/api/admin/security/metrics", description: "Get security metrics" },
      { method: "GET", path: "/api/admin/analytics", description: "Get dashboard analytics data" },
      { method: "GET", path: "/api/admin/users", description: "Get users with pagination and search" },
      { method: "GET", path: "/api/admin/audit-logs", description: "Get audit logs with pagination" },
      { method: "GET", path: "/api/admin/settings", description: "Get system settings" },
      { method: "PUT", path: "/api/admin/settings", description: "Update system settings" },
      { method: "GET", path: "/api/admin/roles", description: "Get roles" },
      { method: "GET", path: "/api/admin/recent-activities", description: "Get recent activities" }
    ],
    timestamp: new Date().toISOString()
  });
};
