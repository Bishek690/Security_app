import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaUserShield, FaSignOutAlt, FaUserEdit, FaBars, FaTimes, 
         FaTachometerAlt, FaCog, FaChevronLeft, FaChevronRight,
         FaShieldAlt, FaClipboardList, FaChartBar, FaUserPlus, 
         FaExclamationTriangle, FaList } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats } from '../../services/adminService';

// Sidebar link component
const SidebarLink = ({ icon, text, path, onClick, active = false }) => {
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{text}</span>
    </button>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickStats, setQuickStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    securityAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);
    // Fetch quick stats for sidebar
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        console.log('Fetching quick stats for sidebar...');
        const stats = await getAdminStats('1d');
        console.log('Received stats for sidebar:', stats);
        
        const newQuickStats = {
          totalUsers: stats.totalUsers || 0,
          newUsers: stats.newRegistrations || 0,
          securityAlerts: stats.failedLogins || 0
        };
        
        console.log('Setting quick stats:', newQuickStats);
        setQuickStats(newQuickStats);
      } catch (error) {
        console.error('Failed to fetch quick stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickStats();
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchQuickStats, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Set sidebar default state based on screen size and saved preference
  useEffect(() => {
    // Try to get user preference from localStorage
    const savedSidebarState = localStorage.getItem('adminSidebarOpen');
    
    const handleResize = () => {
      // On small screens, always close sidebar
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        // On large screens, use saved preference if available, otherwise open by default
        setSidebarOpen(savedSidebarState !== null ? savedSidebarState === 'true' : true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Save sidebar state to localStorage when it changes (only on desktop)
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      localStorage.setItem('adminSidebarOpen', sidebarOpen);
    }
  }, [sidebarOpen]);
  
  // Use real admin info if available
  const admin = currentUser;
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-blue-600 shadow-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>
      
      {/* Desktop sidebar toggle button */}
      <div className={`hidden lg:block fixed ${sidebarOpen ? 'left-64' : 'left-0'} top-4 z-30 transition-all duration-300`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
        </button>
      </div>

      {/* Backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition duration-300 ease-in-out z-30 overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-4 mt-4">
          <div className="flex items-center space-x-2">
            <FaUserShield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">Admin Panel</span>
          </div>
        </div>

        {/* Admin info */}
        <div className="px-4 py-3 bg-gray-700 rounded-lg mx-2">
          <p className="text-white font-semibold">{admin.username}</p>
          <p className="text-gray-400 text-xs">{admin.email}</p>
        </div>
        
        {/* Quick Stats */}
        <div className="px-4 py-3 bg-gray-700 rounded-lg mx-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-300">Quick Stats</h3>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  console.log('Manually refreshing quick stats...');
                  const stats = await getAdminStats('1d');
                  console.log('Manual refresh - received stats:', stats);
                  const newQuickStats = {
                    totalUsers: stats.totalUsers || 0,
                    newUsers: stats.newRegistrations || 0,
                    securityAlerts: stats.failedLogins || 0
                  };
                  console.log('Manual refresh - setting quick stats:', newQuickStats);
                  setQuickStats(newQuickStats);
                } catch (error) {
                  console.error('Manual refresh failed:', error);
                } finally {
                  setLoading(false);
                }
              }}
              className="text-xs text-blue-400 hover:text-blue-300 focus:outline-none"
              title="Refresh stats"
            >
              ⟳
            </button>
          </div>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mb-2">
            Last updated: {new Date().toLocaleTimeString()} | Loading: {loading ? 'Yes' : 'No'}
          </div>
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUsers className="text-blue-400 mr-2" />
                  <span className="text-xs text-gray-300">Total Users</span>
                </div>
                <span className="text-sm font-bold text-white">{quickStats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUserPlus className="text-green-400 mr-2" />
                  <span className="text-xs text-gray-300">New Users (24h)</span>
                </div>
                <span className="text-sm font-bold text-white">{quickStats.newUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-amber-400 mr-2" />
                  <span className="text-xs text-gray-300">Security Alerts</span>
                </div>
                <span className="text-sm font-bold text-white">{quickStats.securityAlerts}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2 px-2">
          <SidebarLink
            icon={<FaTachometerAlt />}
            text="Dashboard"
            path="/admin/dashboard"
            onClick={() => {
              navigate('/admin/dashboard');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<FaUsers />}
            text="User Management"
            path="/admin/users"
            onClick={() => {
              navigate('/admin/users');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<MdSecurity />}
            text="Security Metrics"
            path="/admin/security"
            onClick={() => {
              navigate('/admin/security');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<FaList />}
            text="Audit Logs"
            path="/admin/audit"
            onClick={() => {
              navigate('/admin/audit');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<FaUserEdit />}
            text="Admin Profile"
            path="/admin/profile"
            onClick={() => {
              navigate('/admin/profile');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          />
          <div className="pt-4 mt-4 border-t border-gray-700">
            <SidebarLink
              icon={<FaSignOutAlt />}
              text="Logout"
              onClick={handleLogout}
              className="text-red-400"
            />
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div 
        className={`flex-1 overflow-y-auto h-screen transition-all duration-300 ease-in-out 
          ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}
      >
        {/* Top navbar spacer - taller for mobile, shorter for desktop with toggle button */}
        <div className={`h-16 ${sidebarOpen ? 'lg:h-16' : 'lg:h-16'}`}></div>
        
        {/* Content area */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
