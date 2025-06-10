import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setNotification(location.state.message);
    }
  }, [location]);


    const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = await login(formData);
      authLogin(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h1>
          <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
        </div>

        {notification && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">
            {notification}
          </div>
        )}

        {serverError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              type="text"
              name="identifier"
              id="identifier"
              placeholder="Enter your email or username"
              autoComplete="username"
              value={formData.identifier}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.identifier && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
