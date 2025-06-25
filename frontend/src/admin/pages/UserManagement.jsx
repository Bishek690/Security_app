import React, { useState, useEffect } from 'react';
import { FaUsers, FaEdit, FaTrash, FaUserPlus, FaSearch, FaExclamationTriangle, FaSpinner, FaCheck } from 'react-icons/fa';
import { getUsers, deleteUser, addUser, updateUser } from '../../services/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(''); // 'edit', 'add', or 'delete'
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch users when page, limit or search term changes
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        const data = await getUsers(currentPage, limit, searchTerm);
        setUsers(data.users || []);
        setTotalUsers(data.totalCount || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Use debounce for search to avoid too many requests
    const handler = setTimeout(() => {
      fetchUsersData();
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [currentPage, limit, searchTerm]);
  
  // Reset form when modal opens/closes or selected user changes
  useEffect(() => {
    if (showModal && actionType === 'edit' && selectedUser) {
      setFormData({
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        password: '',  // Don't populate password for edit
        role: selectedUser.role || 'user',
        status: selectedUser.status || 'active'
      });
    } else if (showModal && actionType === 'add') {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active'
      });
    }
    setFormErrors({});
  }, [showModal, actionType, selectedUser]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.email.includes('@')) errors.email = 'Enter a valid email';
    if (actionType === 'add' && !formData.password) errors.password = 'Password is required';
    if (actionType === 'add' && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle user form submit (add/edit)
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      if (actionType === 'add') {
        await addUser(formData);
        setNotification({ type: 'success', message: 'User added successfully!' });
      } else if (actionType === 'edit') {
        // Omit password if it's empty
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) delete dataToUpdate.password;
        
        await updateUser(selectedUser.id, dataToUpdate);
        setNotification({ type: 'success', message: 'User updated successfully!' });
      }
      
      // Refetch users to get updated data
      const data = await getUsers(currentPage, limit, searchTerm);
      setUsers(data.users || []);
      setTotalUsers(data.totalCount || 0);
      
      // Close modal and reset form
      setShowModal(false);
      setSelectedUser(null);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Error submitting user form:', err);
      setNotification({ 
        type: 'error', 
        message: err.message || 'An error occurred. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle user delete
  const handleDeleteUser = async (userId) => {
    try {
      setIsDeleting(true);
      await deleteUser(userId);
      
      // Show success notification
      setNotification({ type: 'success', message: 'User deleted successfully!' });
      
      // Refetch users after deletion
      const data = await getUsers(currentPage, limit, searchTerm);
      setUsers(data.users || []);
      setTotalUsers(data.totalCount || 0);
      
      // Close modal and reset
      setShowModal(false);
      setSelectedUser(null);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setNotification({ 
        type: 'error', 
        message: err.message || 'Failed to delete user. Please try again.' 
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Function to open modals
  const openModal = (type, user = null) => {
    setActionType(type);
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
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
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input 
                type="text" 
                className="pl-10 w-full md:w-64 border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => openModal('add')}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              <FaUserPlus /> Add New User
            </button>
          </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                      </div>
                      <p className="text-gray-500 mt-2">Loading users...</p>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => openModal('edit', user)} 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit className="inline mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => openModal('delete', user)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing {users.length} of {totalUsers} users
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                  currentPage === 1 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
              <span className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-blue-600 text-white">
                {currentPage}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={users.length < limit || loading}
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                  users.length < limit || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        {/* User Delete Confirmation Modal */}
        {showModal && actionType === 'delete' && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-6">
                Are you sure you want to delete user <span className="font-semibold">{selectedUser.username}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Add/Edit Modal */}
        {showModal && (actionType === 'add' || actionType === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {actionType === 'add' ? 'Add New User' : 'Edit User'}
              </h3>
              
              <form onSubmit={handleUserSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input 
                      type="text" 
                      name="username"
                      className={`w-full p-2 border rounded-md ${formErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter username" 
                      value={formData.username}
                      onChange={handleChange}
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className={`w-full p-2 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter email address" 
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {actionType === 'edit' && <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>}
                    </label>
                    <input 
                      type="password" 
                      name="password"
                      className={`w-full p-2 border rounded-md ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={actionType === 'add' ? "Enter password" : "Enter new password (optional)"}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      name="role"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      name="status"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="locked">Locked</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        {actionType === 'add' ? 'Adding...' : 'Saving...'}
                      </>
                    ) : (
                      actionType === 'add' ? 'Add User' : 'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
