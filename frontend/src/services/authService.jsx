import axios from 'axios';

const API_URL = 'BACKEND_ORIGIN';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔐 Register
export const register = async (userData) => {
  try {
    const response = await api.post('/user/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

// 🔐 Login
export const login = async (credentials) => {
  try {
    const response = await api.post('/user/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

// 🔐 Logout
export const logout = () => {
  localStorage.removeItem('token');
};

// 👤 Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// 🔑 Check password strength
export const checkPasswordStrength = (password) => {
  let score = 0;
  const suggestions = [];

  if (password.length >= 8) score++;
  else suggestions.push("Use at least 8 characters");

  if (/[a-z]/.test(password)) score++;
  else suggestions.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push("Include uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else suggestions.push("Include numbers");

  if (/[\W_]/.test(password)) score++;
  else suggestions.push("Include symbols (e.g. @, #, $, etc.)");

  if (!/\s/.test(password)) score++;
  else suggestions.push("Avoid using spaces");

  let strength = "Weak";
  if (score >= 5) strength = "Strong";
  else if (score >= 3) strength = "Medium";

  return { strength, suggestions, score };
};

// 📧 Forgot Password (Send OTP)
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/user/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error sending OTP' };
  }
};

// 🔁 Reset Password with OTP
export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const response = await api.post('/user/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error resetting password' };
  }
};
