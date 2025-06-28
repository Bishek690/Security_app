import React, { useState } from 'react';
import { FaUserCog, FaLock, FaEnvelope, FaUserCircle, FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/authService';

const AdminProfile = () => {
  const { currentUser } = useAuth();
  
  // Use real admin info if available
  const admin = currentUser || {
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
    lastLogin: '2023-06-24 10:45 AM',
    createdAt: '2023-01-15',
  };
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: admin.username,
    email: admin.email,
    fullName: admin.fullName || '',
    phone: admin.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile(admin.id, formData);
      setNotification({ 
        type: 'success', 
        message: 'Profile updated successfully!' 
      });
      setEditMode(false);
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({ 
        type: 'error', 
        message: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Profile</h1>
      </div>
        <div className="p-6">
        {notification.message && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {notification.type === 'success' 
              ? <FaCheck className="mr-2" /> 
              : <FaExclamationTriangle className="mr-2" />}
            <span>{notification.message}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Profile Information</h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-4xl">
                  <FaUserCircle />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{admin.username}</h3>
                  <p className="text-gray-600">{admin.role}</p>
                  <p className="text-gray-500 text-sm mt-1">Member since {admin.createdAt}</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input 
                      type="text" 
                      name="username"
                      className={`w-full p-2 border border-gray-300 rounded-md ${
                        editMode 
                          ? 'focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-gray-50'
                      }`}
                      value={editMode ? formData.username : admin.username}
                      onChange={handleChange}
                      readOnly={!editMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className={`w-full p-2 border border-gray-300 rounded-md ${
                        editMode 
                          ? 'focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-gray-50'
                      }`}
                      value={editMode ? formData.email : admin.email}
                      onChange={handleChange}
                      readOnly={!editMode}
                    />
                  </div>
                  
                  {editMode && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          name="fullName"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input 
                          type="tel" 
                          name="phone"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                  
                  {!editMode && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                          value={admin.isAdmin}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                          value={admin.lastLogin}
                          readOnly
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  {editMode ? (
                    <>
                      <button 
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button" 
                      onClick={() => setEditMode(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
            {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Account Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setEditMode(true)}
                className="w-full flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-3 rounded-lg hover:bg-blue-200 transition"
              >
                <FaUserCog className="text-blue-600" /> Update Profile
              </button>
              <button 
                onClick={() => window.location.href = '/change-password'}
                className="w-full flex items-center gap-2 bg-green-100 text-green-800 px-4 py-3 rounded-lg hover:bg-green-200 transition"
              >
                <FaLock className="text-green-600" /> Change Password
              </button>
              <button 
                className="w-full flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-3 rounded-lg hover:bg-purple-200 transition"
              >
                <FaEnvelope className="text-purple-600" /> Update Email Preferences
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Security Status</h3>
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">🔒 Your account is secure</p>
                <p className="text-xs text-green-700 mt-1">Last security check: Today</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Created:</span>
                  <span className="font-medium">{admin.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium">{admin.lastLogin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{admin.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
