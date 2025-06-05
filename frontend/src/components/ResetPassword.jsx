import React, { useState, useEffect } from 'react';
import { resetPassword } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // On mount, prefill email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await resetPassword({ email, otp, newPassword });
      toast.success(res.message || 'Password reset successful');

      // Clear OTP and stored email to prevent reuse
      setOtp('');
      localStorage.removeItem('resetEmail');

      // Redirect to login
      navigate('/login');
    } catch (err) {
      // Get the error message returned from the backend
      const errorMessage = err?.response?.data?.message || 'Failed to reset password';

      // Show specific toast for known errors
      if (errorMessage === "New password must be different from the old password") {
        toast.warn(errorMessage); // Show a warning for the specific error
      } else {
        toast.error(errorMessage); // Default error toast
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
          disabled // Email should not be changed once OTP is sent
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">OTP</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded mb-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

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
