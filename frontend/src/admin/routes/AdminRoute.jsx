import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminRoute component to protect admin routes
 * Redirects to home page if user is not an admin
 */
const AdminRoute = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated at all
    return <Navigate to="/login" />;
  }
  
  // Check if the user has admin role
  const isAdmin = currentUser?.isAdmin === true || 
                 currentUser?.isAdmin === 'admin' ||
                 currentUser?.role === 'admin' || 
                 currentUser?.role === 'Administrator';
  
  if (!isAdmin) {
    // Redirect non-admin users to the home page
    return <Navigate to="/" />;
  }
  
  // If user is admin, render the protected admin route
  return children;
};

export default AdminRoute;
