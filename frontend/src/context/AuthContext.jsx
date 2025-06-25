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
    logout();
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Check if user is admin
  const isAdmin = () => {
    if (!currentUser) return false;
    return (
      currentUser.isAdmin === true ||
      currentUser.isAdmin === 'admin' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'Administrator'
    );
  };

  // Check if user is a regular user (not an admin)
  const isRegularUser = () => {
    if (!currentUser) return false;
    return (
      currentUser.isAdmin === false ||
      currentUser.isAdmin === 'user' ||
      currentUser.role === 'user' ||
      (currentUser.isAdmin !== true &&
       currentUser.isAdmin !== 'admin' &&
       currentUser.role !== 'admin' &&
       currentUser.role !== 'Administrator')
    );
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}