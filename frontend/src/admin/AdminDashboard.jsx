import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaUserShield, FaChartBar, FaCalendarAlt, FaBell, FaExclamationTriangle, 
  FaUserPlus, FaSpinner, FaSync, FaFilter, FaCalendarCheck, FaUserClock, FaTimesCircle,
  FaCog, FaList } from 'react-icons/fa';
import { MdSecurity, MdDashboard, MdNotifications } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getSecurityMetrics, getDashboardAnalytics, getRecentActivities } from '../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  
  // Stats for dashboard
  const [basicStats, setBasicStats] = useState({
    totalUsers: 0,
    activeAdmins: 0,
    newRegistrations: 0,
    pendingRequests: 0,
    failedLogins: 0,
    recentActivity: []
  });
  
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);
  
  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data in parallel for better performance
      const [statsData, metricsData, analyticsData, activitiesData] = await Promise.all([
        getAdminStats(timeRange),
        getSecurityMetrics(timeRange === '1d' ? 'day' : timeRange === '7d' ? 'week' : 'month', true),
        getDashboardAnalytics(timeRange),
        getRecentActivities(5) // Fetch the latest 5 activities
      ]);
      
      // Store raw data
      setBasicStats(statsData);
      setSecurityMetrics(metricsData);
      setAnalyticsData(analyticsData);
      setRecentActivity(activitiesData);
      setLastUpdated(new Date());
      
      // Format stats for display
      const formattedStats = [
          { 
            label: 'Total Users', 
            value: statsData.totalUsers, 
            icon: <FaUsers className="text-blue-600 text-3xl" />, 
            bgColor: 'bg-blue-100' 
          },
          { 
            label: 'Active Admins', 
            value: statsData.activeAdmins, 
            icon: <FaUserShield className="text-green-600 text-3xl" />, 
            bgColor: 'bg-green-100' 
          },
          { 
            label: 'New Registrations', 
            value: statsData.newRegistrations, 
            icon: <FaUserPlus className="text-purple-600 text-3xl" />, 
            bgColor: 'bg-purple-100' 
          },
          { 
            label: 'Pending Requests', 
            value: statsData.pendingRequests, 
            icon: <MdNotifications className="text-amber-600 text-3xl" />, 
            bgColor: 'bg-amber-100' 
          },
          { 
            label: 'Failed Logins', 
            value: statsData.failedLogins, 
            icon: <FaTimesCircle className="text-red-600 text-3xl" />, 
            bgColor: 'bg-red-100' 
          },
        ];
          setStats(formattedStats);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Use real admin info if available
  const admin = currentUser || {
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          {/* Time range selector */}
          <div className="flex items-center space-x-2 bg-white shadow rounded-lg p-2">
            <span className="text-sm text-gray-500">Time Range:</span>
            <select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="border-none bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          {/* Refresh button */}
          <button 
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome, {admin.username}!</h2>
            <p className="text-gray-500">Here's what's happening in your system.</p>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className={`${stat.bgColor} rounded-lg p-6 shadow hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-full bg-white bg-opacity-70">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          {/* Error message if data loading failed */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Security metrics overview */}
        {securityMetrics && !loading && (
          <div className="mb-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-50 p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg text-gray-700 flex items-center">
                <MdSecurity className="mr-2 text-blue-600" />
                Security Metrics Overview
              </h2>
              <Link to="/admin/security" className="text-blue-600 hover:underline text-sm">
                View detailed report →
              </Link>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Login Success Rate</p>
                    <p className="text-xl font-bold">{securityMetrics.metrics.loginAttempts.successRate}%</p>
                  </div>
                  {securityMetrics.previousPeriod && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      parseFloat(securityMetrics.previousPeriod.loginAttempts.successfulChange) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {parseFloat(securityMetrics.previousPeriod.loginAttempts.successfulChange) > 0 ? '+' : ''}
                      {securityMetrics.previousPeriod.loginAttempts.successfulChange}%
                    </span>
                  )}
                </div>
                <div className="mt-2 w-full bg-white rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${securityMetrics.metrics.loginAttempts.successRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="rounded p-4 bg-gradient-to-br from-red-50 to-red-100">
                <p className="text-xs text-gray-500 mb-1">Failed Logins</p>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">{securityMetrics.metrics.loginAttempts.failed}</p>
                  {securityMetrics.previousPeriod && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      parseFloat(securityMetrics.previousPeriod.loginAttempts.failedChange) < 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {parseFloat(securityMetrics.previousPeriod.loginAttempts.failedChange) > 0 ? '+' : ''}
                      {securityMetrics.previousPeriod.loginAttempts.failedChange}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="rounded p-4 bg-gradient-to-br from-amber-50 to-amber-100">
                <p className="text-xs text-gray-500 mb-1">Suspicious Activities</p>
                <p className="text-xl font-bold">{securityMetrics.metrics.suspiciousActivities || 0}</p>
              </div>
              
              <div className="rounded p-4 bg-gradient-to-br from-green-50 to-green-100">
                <p className="text-xs text-gray-500 mb-1">User Registrations</p>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">{securityMetrics.metrics.userRegistrations}</p>
                  {securityMetrics.previousPeriod && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      parseFloat(securityMetrics.previousPeriod.userRegistrationsChange) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {parseFloat(securityMetrics.previousPeriod.userRegistrationsChange) > 0 ? '+' : ''}
                      {securityMetrics.previousPeriod.userRegistrationsChange}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Activity and Quick Actions */}
        <div className=" gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <div>
                <FaCalendarAlt className="mr-2 text-blue-600 inline" /> 
                Recent Activity
              </div>
              {analyticsData && (
                <Link to="/admin/audit" className="text-sm text-blue-600 hover:underline">
                  View all →
                </Link>
              )}
            </h2>
            <div className="divide-y">
              {loading ? (
                <div className="py-4 text-center text-gray-500">Loading activity data...</div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <ActivityItem
                    key={activity.id}
                    action={activity.action}
                    user={activity.user}
                    time={activity.time}
                    status={activity.status}
                    details={activity.details}
                  />
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">No recent activity found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component for the dashboard
const ActivityItem = ({ action, user, time, status = 'normal', details = null }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'danger': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <div className="py-3 flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{user} · {time}</p>
      </div>
      <span className={`${getStatusColor()} text-xs px-2 py-1 rounded-full`}>
        {status === 'success' ? 'Success' : 
         status === 'danger' ? 'Alert' : 
         status === 'warning' ? 'Warning' : 'Info'}
      </span>
    </div>
  );
};

export default AdminDashboard;
