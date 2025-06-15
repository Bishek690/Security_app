import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { getCurrentUser, logout } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </Link>
        <Link to="/" className="text-white px-5 py-2 rounded-md hover:underline hover:text-gray-300 transition duration-300">
          Home
        </Link>
      </div>

      {user ? (
        <div className="flex items-center space-x-4">
          <span>Welcome, {user.username}</span>

          <Link to="/dashboard" className="hover:text-gray-300">
            <FaUserCircle className="text-2xl" />
          </Link>
        </div>
      ) : (
        <div>
            <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
            >
                Login
            </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
