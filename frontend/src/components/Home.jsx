// components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-12 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Security App
      </h1>
      <p className="text-lg text-gray-700 max-w-md mb-8">
        Your trusted solution for advanced cyber security management and protection.
      </p>

      <div className="space-x-4">
        <Link
          to="/register"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="inline-block px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
