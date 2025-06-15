import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, checkPasswordStrength } from '../services/authService';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import ReCAPTCHA from 'react-google-recaptcha';

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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    
    // Handle select dropdown for isAdmin
    if (type === 'select-one' && name === 'isAdmin') {
      newValue = value === 'true';
    }
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // More robust email regex

    // Required field validations
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Password strength validation
    if (formData.password) {
      const { strength } = checkPasswordStrength(formData.password);
      if (strength !== 'Strong') {
        newErrors.password = 'Password must be strong (include uppercase, lowercase, numbers, and symbols)';
      }

      // Check if password is same as username
      const normalizedUsername = formData.username.trim().toLowerCase();
      const normalizedPassword = formData.password.trim().toLowerCase();
      
      if (normalizedPassword === normalizedUsername) {
        newErrors.password = 'Password cannot be the same as username';
      }
    }

    // CAPTCHA validation
    if (!captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const registrationData = {
        ...formData,
        captchaToken
      };

      await register(registrationData);
      
      // Success - navigate to login
      navigate('/login', {
        state: { 
          message: 'Registration successful! Please login with your credentials.',
          type: 'success'
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.join(', ');
      }
      
      setServerError(errorMessage);
      
      // Reset CAPTCHA on error
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    // Clear CAPTCHA error when user completes it
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: '' }));
    }
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const formFields = [
    { label: 'Username', name: 'username', type: 'text', placeholder: 'Enter your username' },
    { label: 'Email Address', name: 'email', type: 'email', placeholder: 'Enter your email' },
    { label: 'Phone Number', name: 'phoneNumber', type: 'tel', placeholder: 'Enter your phone number' },
    { label: 'Password', name: 'password', type: 'password', placeholder: 'Create a strong password' },
    { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: 'Confirm your password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-600 mt-2">Join us today and get started</p>
        </div>

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{serverError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {formFields.map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                className={`w-full px-3 py-2 border ${
                  errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200`}
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              />
              {errors[name] && (
                <p id={`${name}-error`} className="text-sm text-red-600 mt-1">
                  {errors[name]}
                </p>
              )}
              {name === 'password' && formData.password && (
                <div className="mt-2">
                  <PasswordStrengthIndicator
                    password={formData.password}
                    username={formData.username}
                  />
                </div>
              )}
            </div>
          ))}

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
            {errors.captcha && (
              <p className="text-sm text-red-600 mt-1">{errors.captcha}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;