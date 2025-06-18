import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, checkPasswordStrength } from '../services/authService';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import ReCAPTCHA from 'react-google-recaptcha';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (name === 'email') {
      newValue = value.toLowerCase();
    }
    if (type === 'select-one' && name === 'isAdmin') {
      newValue = value === 'true';
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    if (!formData.password) newErrors.password = 'Password is required';

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password) {
      const { strength } = checkPasswordStrength(formData.password);
      if (strength !== 'Strong') {
        newErrors.password = 'Password must be strong (uppercase, lowercase, number, symbol)';
      }

      const normalizedUsername = formData.username.trim().toLowerCase();
      const normalizedPassword = formData.password.trim().toLowerCase();
      if (normalizedPassword === normalizedUsername) {
        newErrors.password = 'Password cannot be the same as username';
      }
    }

    if (!captchaToken) newErrors.captcha = 'Please complete the CAPTCHA verification';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
      const registrationData = { ...formData, captchaToken };
      await register(registrationData);
      navigate('/login', {
        state: {
          message: 'Registration successful! Please login with your credentials.',
          type: 'success',
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message) errorMessage = error.message;
      else if (error.errors?.length) errorMessage = error.errors.join(', ');
      setServerError(errorMessage);
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: '' }));
  };

  const handleCaptchaExpired = () => setCaptchaToken(null);

  const renderInput = (label, name, type, placeholder, showToggle, toggleVisibility, show) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={show ? 'text' : type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required
        className={`w-full px-3 py-2 pr-10 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute top-9 right-3 text-gray-600 focus:outline-none"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
      {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name]}</p>}
      {name === 'password' && formData.password && (
        <div className="mt-2">
          <PasswordStrengthIndicator password={formData.password} username={formData.username} />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-600 mt-2">Join us today and get started</p>
        </div>

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {renderInput('Username', 'username', 'text', 'Enter your username')}
          {renderInput('Email', 'email', 'email', 'Enter your email')}
          {renderInput('Phone Number', 'phoneNumber', 'tel', 'Enter your phone number')}
          {renderInput('Password', 'password', 'password', 'Create a strong password', true, () => setShowPassword(!showPassword), showPassword)}
          {renderInput('Confirm Password', 'confirmPassword', 'password', 'Confirm your password', true, () => setShowConfirmPassword(!showConfirmPassword), showConfirmPassword)}

          <div>
            <label htmlFor="isAdmin" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="isAdmin"
              name="isAdmin"
              value={formData.isAdmin.toString()}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              <option value="false">User</option>
              <option value="true">Admin</option>
            </select>
          </div>

          <div>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              onExpired={handleCaptchaExpired}
              theme="light"
            />
            {errors.captcha && <p className="text-sm text-red-600 mt-1">{errors.captcha}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </div>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition duration-200">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
