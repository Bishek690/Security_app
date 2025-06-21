import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendChangePasswordOtp, changePassword } from '../services/authService';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangePassword = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    try {
      await sendChangePasswordOtp(currentUser.id);
      setOtpSent(true);
      setSuccess('OTP sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 1) return;
    const newArr = [...otpArray];
    newArr[idx] = value;
    setOtpArray(newArr);
    // Move to next box if value entered
    if (value && idx < 5) {
      document.getElementById(`otp-${idx + 1}`).focus();
    }
    // Move to previous box on backspace
    if (!value && idx > 0 && e.nativeEvent.inputType === 'deleteContentBackward') {
      document.getElementById(`otp-${idx - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    const otp = otpArray.join('');
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email');
      setLoading(false);
      return;
    }

    try {
      const response = await changePassword(currentUser.id, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        otp
      });
      setSuccess(response.message || 'Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        otp: ''
      });
      setOtpArray(['', '', '', '', '', '']);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                name="currentPassword"
                id="currentPassword"
                required
                value={formData.currentPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowCurrent((prev) => !prev)}
                tabIndex={-1}
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                id="newPassword"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowNew((prev) => !prev)}
                tabIndex={-1}
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={formData.newPassword} fullName={currentUser?.email?.split('@')[0] || ''} />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmNewPassword"
                id="confirmNewPassword"
                required
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowConfirm((prev) => !prev)}
                tabIndex={-1}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSendOtp}
              className="mb-2 bg-gray-200 px-3 py-1 rounded"
              disabled={loading}
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
            <div className="flex gap-2 mt-2">
              {otpArray.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(e, idx)}
                  className="w-10 h-10 text-center border border-gray-400 rounded text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;