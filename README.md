# Security App - Advanced Cyber Security Management System

A comprehensive full-stack security management application with role-based authentication, real-time monitoring, and robust admin dashboard capabilities.


## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (Admin, Manager, Supervisor, User)
- Password encryption with bcrypt
- Session management with automatic logout
- Protected routes with middleware
- Real-time authentication state management

### 👨‍💼 Admin Dashboard
- **Real-time Statistics**: Total users, staff members, admins, new registrations, failed logins
- **User Management**: Complete CRUD operations with search and pagination
- **Security Metrics**: Login success rates, failed attempts, suspicious activities
- **Audit Logs**: Comprehensive activity tracking with IP address logging
- **System Settings**: Configurable security and application preferences
- **Analytics Dashboard**: Time-based filtering (1d, 7d, 30d, 90d)
- **Quick Stats Sidebar**: Real-time metrics in collapsible sidebar

### 🛡️ Security Features
- Real-time activity logging and monitoring
- Failed login attempt tracking and account lockout
- Suspicious activity detection with alerts
- IP address logging for comprehensive audit trails
- Secure password requirements and validation
- Automatic session timeout
- CSRF protection with secure cookies

### 📱 Modern UI/UX
- Fully responsive design with Tailwind CSS
- Mobile-friendly collapsible sidebar navigation
- Real-time data updates without page refresh
- Professional loading states and error handling
- Toast notifications for user feedback
- Dark/light theme support capability
- Accessible design with proper ARIA labels

## 🏗️ Technology Stack

### Backend Technologies
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: TypeORM with decorators
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS, cookie-parser, body-parser
- **Environment**: dotenv for configuration

### Frontend Technologies
- **Framework**: React 18 with Vite bundler
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with responsive design
- **Icons**: React Icons library
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Build Tool**: Vite for fast development and building


## 🚀 Quick Start Guide

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/Bishek690/Security_app.git
cd Security_App

# Setup backend
cd backend
npm install
cp .env.example .env    

# Create environment file
PORT=4500
APP_URL=http://localhost
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_TYPE=mysql
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=security_app
DB_PORT=3306

# JWT Configuration (IMPORTANT: Change in production)
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters-long
JWT_EXPIRES=1d

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:5173

# Email Configuration (Gmail - Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# reCAPTCHA Configuration (Optional)
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
npm start || npm run dev             # Start backend server

# Setup frontend (in new terminal)
cd ../frontend
npm install
# Create .env file 
# Backend API Configuration
BACKEND_ORIGIN=http://localhost:4500/api
VITE_RECAPTCHA_SITE_KEY=your recaptcha key
npm run dev           # Start frontend development server
```

### 2. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4500
- **Admin Dashboard**: http://localhost:5173/admin/dashboard (after login)

### 3. Create Admin Account
Use the registration form and set role to 'admin', or use the API endpoint provided below.

