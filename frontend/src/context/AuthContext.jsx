import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Login user
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData.user));
    setCurrentUser(userData.user);
  };

  // Logout user
  const logoutUser = () => {
    try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    } catch (error) {
      console.error('Error logging out user:', error);
      setCurrentUser(null);
    }
  };

  // Check if user has elevated privileges (admin, supervisor, manager)
  const isAdmin = () => {
    if (!currentUser) return false;
    const elevatedRoles = ['admin', 'supervisor', 'manager'];
    return (
      currentUser.isAdmin === true ||
      elevatedRoles.includes(currentUser.isAdmin) ||
      elevatedRoles.includes(currentUser.role) ||
      currentUser.role === 'Administrator'
    );
  };

  // Check if user is a regular user (not elevated)
  const isRegularUser = () => {
    if (!currentUser) return false;
    return (
      currentUser.isAdmin === false ||
      currentUser.isAdmin === 'user' ||
      currentUser.role === 'user' ||
      (!isAdmin())
    );
  };

  // Get user role
  const getUserRole = () => {
    if (!currentUser) return 'guest';
    return currentUser.isAdmin || currentUser.role || 'user';
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    const userRole = getUserRole();
    return userRole === role;
  };

  // Check if user can manage other users (admin and supervisor only)
  const canManageUsers = () => {
    if (!currentUser) return false;
    const userRole = getUserRole();
    return ['admin', 'supervisor'].includes(userRole);
  };

  // Get user's home page route
  const getUserHomeRoute = () => {
    if (!currentUser) return '/login';
    return isAdmin() ? '/admin/dashboard' : '/dashboard';
  };

  const value = {
    currentUser,
    login,
    logout: logoutUser,
    isAuthenticated: !!currentUser,
    isAdmin,
    isRegularUser,
    getUserHomeRoute,
    getUserRole,
    hasRole,
    canManageUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}