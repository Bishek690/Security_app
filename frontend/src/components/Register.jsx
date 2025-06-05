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
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Password strength and username check logic
    const { strength } = checkPasswordStrength(formData.password || '');
    const normalizedName = formData.username.trim().toLowerCase();
    const normalizedPassword = formData.password.trim().toLowerCase();

    if (formData.password && strength !== 'Strong') {
      newErrors.password = 'Password is not strong enough';
    }

    if (normalizedPassword === normalizedName) {
      newErrors.password = 'Password cannot be the same as username';
    }

    if (!captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({ ...formData, captchaToken });
      navigate('/login', {
        state: { message: 'Registration successful! Please login.' },
      });
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
        </div>

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Username', name: 'username', type: 'text' },
            { label: 'Email Address', name: 'email', type: 'email' },
            { label: 'Phone Number', name: 'phoneNumber', type: 'tel' },
            { label: 'Password', name: 'password', type: 'password' },
            { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
          ].map(({ label, name, type }) => (
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
                required
                className={`w-full px-3 py-2 border ${
                  errors[name] ? 'border-red-500' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-invalid={!!errors[name]}
              />
              {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name]}</p>}
              {name === 'password' && formData.password && (
                <PasswordStrengthIndicator
                  password={formData.password}
                  username={formData.username}
                />
              )}
            </div>
          ))}

          <div>
            <ReCAPTCHA
              sitekey="YOUR_SITE_KEY" // Replace with your Google reCAPTCHA site key
              onChange={handleCaptchaChange}
            />
            {errors.captcha && <p className="text-sm text-red-600 mt-1">{errors.captcha}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;