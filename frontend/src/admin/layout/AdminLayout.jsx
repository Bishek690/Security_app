import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaUserShield, FaSignOutAlt, FaUserEdit, FaHome, FaBars, FaTimes, FaTachometerAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

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
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);
  
  // Set sidebar default state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Use real admin info if available
  const admin = currentUser || {
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
  };
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
        } lg:translate-x-0 transition duration-200 ease-in-out z-30 overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <FaUserShield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">Admin Panel</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1 rounded-full hover:bg-gray-700 focus:outline-none"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Admin info */}
        <div className="px-4 py-3 bg-gray-700 rounded-lg mx-2">
          <p className="text-white font-semibold">{admin.username}</p>
          <p className="text-gray-400 text-xs">{admin.email}</p>
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
            icon={<FaCog />}
            text="Settings"
            path="/admin/settings"
            onClick={() => {
              navigate('/admin/settings');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          />
          <SidebarLink
            icon={<FaUserEdit />}
            text="Edit Profile"
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
        className={`flex-1 overflow-y-auto h-screen transition-margin duration-200 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}

      >
        {/* Top mobile navbar spacer */}
        <div className="h-16 lg:hidden"></div>
        
        {/* Content area */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
