// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import UserRoute from './components/UserRoute';
import EditProfile from './components/EditProfile';
import ChangePassword from './components/ChangePassword';
import AccessDenied from './components/AccessDenied';
import Layout from './components/Layout';

// Admin imports
import AdminRoute from './admin/routes/AdminRoute';
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import AdminProfile from './admin/pages/AdminProfile';
import SecurityMetrics from './admin/pages/SecurityMetrics';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes without navbar */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          

          {/* User routes under layout with navbar */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={
              <UserRoute>
                <Dashboard />
              </UserRoute>
            } />
            <Route path="/edit-profile" element={
              <UserRoute>
                <EditProfile />
              </UserRoute>
            } />
            <Route path="/change-password" element={
              <UserRoute>
                <ChangePassword />
              </UserRoute>
            } />
          </Route>

          {/* Admin routes with separate admin layout */}
          <Route element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/security" element={<SecurityMetrics />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
