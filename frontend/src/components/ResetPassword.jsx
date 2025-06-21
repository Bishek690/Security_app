import React, { useState, useEffect } from 'react';
import { resetPassword } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpInputs = React.useRef([]);

  const navigate = useNavigate();

  // On mount, prefill email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // OTP input change handler
  const handleOtpChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      otpInputs.current[idx + 1]?.focus();
    }
  };

  // OTP input keydown handler for navigation
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpInputs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      otpInputs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && idx < 5) {
      otpInputs.current[idx + 1]?.focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await resetPassword({ email, otp: otp.join(''), newPassword });
      toast.success(res.message || 'Password reset successful');
      setOtp(['', '', '', '', '', '']);
      localStorage.removeItem('resetEmail');
      navigate('/login');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to reset password';
      if (errorMessage === "New password must be different from the old password") {
        toast.warn(errorMessage);
      } else if (errorMessage === "Invalid OTP") {
        toast.error("The OTP you entered is incorrect. Please try again.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">OTP</label>
        <div className="flex space-x-2 mb-4">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-10 h-12 text-center border boarder-gray-400 rounded text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={digit}
              onChange={(e) => handleOtpChange(e, idx)}
              onKeyDown={(e) => handleOtpKeyDown(e, idx)}
              ref={el => otpInputs.current[idx] = el}
              required
            />
          ))}
        </div>

        <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-2 border boarder-gray-400 rounded mb-2 pr-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        <PasswordStrengthIndicator password={newPassword} fullName={email.split('@')[0]} />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;