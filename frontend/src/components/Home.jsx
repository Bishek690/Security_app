import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaLock, FaUserShield } from 'react-icons/fa';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-white to-green-100 px-4 py-12 text-center">
      {currentUser && (
          <div className="my-4 text-green-700 font-semibold text-lg">
            Welcome back, {currentUser.username}!
          </div>
        )}
        <div className="flex items-center justify-center mb-6">
          <FaShieldAlt className="text-blue-600 text-5xl mr-2" />
          <span className="text-4xl font-extrabold text-gray-900">Security App</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your Cyber Security Hub
        </h1>
        <p className="text-lg text-gray-700 max-w-md mb-8">
          Protect your digital world with advanced security management, real-time monitoring, and robust protection.
        </p>
        <div className="flex justify-center gap-8 mb-8">
          <div className="flex flex-col items-center">
            <FaLock className="text-green-600 text-3xl mb-2" />
            <span className="font-semibold text-gray-700">Data Encryption</span>
          </div>
          <div className="flex flex-col items-center">
            <FaUserShield className="text-blue-500 text-3xl mb-2" />
            <span className="font-semibold text-gray-700">User Privacy</span>
          </div>
        </div>

        
    </div>
  );
};

export default Home;