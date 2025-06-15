// components/Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../navbar/navbar';

const Layout = () => {
  const location = useLocation();

  // Hide navbar on login/register/forgot/reset pages
  const hideNavbarPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="pt-4">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
