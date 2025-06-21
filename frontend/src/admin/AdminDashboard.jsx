import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaUserShield, FaSignOutAlt, FaUserEdit, FaHome } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Dummy stats (replace with real API data)
  const stats = [
    { label: 'Total Users', value: 120, icon: <FaUsers className="text-blue-600 text-3xl" /> },
    { label: 'Active Admins', value: 3, icon: <FaUserShield className="text-green-600 text-3xl" /> },
  ];

  // Use real admin info if available
  const admin = currentUser || {
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
  };

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-blue-100 flex flex-col">
      <nav className="bg-white shadow flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <FaUserShield className="text-blue-700 text-2xl" />
          <span className="font-bold text-xl text-gray-800">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-800">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome, {admin.username}</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-8 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center bg-blue-50 rounded-lg p-6 shadow">
                {stat.icon}
                <span className="text-2xl font-bold mt-2">{stat.value}</span>
                <span className="text-gray-700 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-6">
            <Link to="/admin/users" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">
              <FaUsers /> Manage Users
            </Link>
            <Link to="/edit-profile" className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition">
              <FaUserEdit /> Edit Profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
