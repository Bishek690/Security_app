import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * UserRoute component to protect regular user routes
 * Redirects non-regular users (like admins) to appropriate pages
 */
const UserRoute = ({ children }) => {
  const { isAuthenticated, isRegularUser, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated at all
    return <Navigate to="/login" />;
  }
  
  if (!isRegularUser()) {
    // If admin, redirect to admin dashboard
    if (isAdmin()) {
      return <Navigate to="/admin/dashboard" />;
    }
    // For other non-regular users, show access denied
    return <Navigate to="/access-denied" />;
  }
  
  // If user is a regular user, render the protected route
  return children;
};

export default UserRoute;
