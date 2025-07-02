import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { currentUser } = useAuth();
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Recently';
    }
  };
  
  // Use real admin info if available
  const admin = currentUser;

  // Debug: Log the currentUser to see what fields are available
  console.log('Current User Data:', currentUser);

  // Format the dates
  const lastLoginFormatted = formatDateTime(admin.lastLogin || admin.last_login || admin.updatedAt);

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Profile</h1>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Profile Information</h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-4xl">
                  <FaUserCircle />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{admin.username}</h3>
                  <p className="text-gray-600">{admin.isAdmin}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    value={admin.username}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    value={admin.email}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                    value={admin.isAdmin || admin.role}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                    value={admin.phoneNumber || 'Not provided'}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Account Information</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800 font-medium">🔒 Account Status: Active</p>
                <p className="text-xs text-green-700 mt-1">Your account is secure and verified</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Account ID:</span>
                  <span className="font-medium text-gray-900">{admin.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Last Login:</span>
                  <span className="font-medium text-gray-900">{lastLoginFormatted}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium text-blue-600">{admin.isAdmin || admin.role}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Security Level:</span>
                  <span className="font-medium text-green-600">High</span>
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
