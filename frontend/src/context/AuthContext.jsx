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

  const value = {
    currentUser,
    login,
    logout: logoutUser,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}