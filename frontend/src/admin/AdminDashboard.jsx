import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaUserShield, FaChartBar, FaCalendarAlt, FaBell, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getAdminStats } from '../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stats for dashboard
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        
        // Format stats for display
        const formattedStats = [
          { 
            label: 'Total Users', 
            value: data.totalUsers, 
            icon: <FaUsers className="text-blue-600 text-3xl" />, 
            bgColor: 'bg-blue-100' 
          },
          { 
            label: 'Active Admins', 
            value: data.activeAdmins, 
            icon: <FaUserShield className="text-green-600 text-3xl" />, 
            bgColor: 'bg-green-100' 
          },
          { 
            label: 'New Registrations', 
            value: data.newRegistrations, 
            icon: <FaChartBar className="text-purple-600 text-3xl" />, 
            bgColor: 'bg-purple-100' 
          },
          { 
            label: 'Pending Requests', 
            value: data.pendingRequests, 
            icon: <FaBell className="text-amber-600 text-3xl" />, 
            bgColor: 'bg-amber-100' 
          },
        ];
        
        setStats(formattedStats);
        setRecentActivity(data.recentActivity || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Use real admin info if available
  const admin = currentUser || {
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome, {admin.username}!</h2>
          <p className="text-gray-500">Here's what's happening in your system today.</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        
        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" /> Recent Activity
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
                  />
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">No recent activity found.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/users" className="flex items-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                <FaUsers /> Manage Users
              </Link>
              <Link to="/admin/profile" className="flex items-center gap-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">
                <FaUserShield /> Admin Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component for the dashboard
const ActivityItem = ({ action, user, time, status = 'normal' }) => {
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
