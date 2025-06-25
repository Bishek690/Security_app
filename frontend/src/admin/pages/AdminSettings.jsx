import React, { useState, useEffect } from 'react';
import { FaCog, FaGlobe, FaLock, FaBell, FaEnvelope, FaDatabase, FaPalette, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { getSystemSettings, updateSystemSettings } from '../../services/adminService';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // All settings in one state object
  const [settings, setSettings] = useState({
    // General settings
    siteName: '',
    siteDescription: '',
    
    // Security settings
    sessionTimeout: 30,
    defaultRole: 'user',
    enableRegistration: true,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    passwordResetTimeout: 24,
    twoFactorAuth: false,
    twoFactorMethod: 'email',
    
    // Notification settings
    emailNotifications: true,
    securityAlerts: true,
    loginAlerts: false,
    
    // Email settings
    smtpServer: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    emailFrom: '',
    useSsl: true,
    
    // Database settings
    dbBackupSchedule: 'daily',
    dbRetentionDays: 30,
    
    // Appearance settings
    theme: 'light',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    
    // Localization settings
    defaultLanguage: 'en',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'UTC'
  });
  
  // Store original settings for reset
  const [originalSettings, setOriginalSettings] = useState({});
  
  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSystemSettings();
        setSettings(data);
        setOriginalSettings(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSystemSettings(settings);
      setNotification({
        type: 'success',
        message: 'Settings saved successfully!'
      });
      setOriginalSettings(settings);
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Reset settings to original values
  const handleReset = () => {
    setSettings(originalSettings);
    setNotification({
      type: 'info',
      message: 'Settings reset to last saved values.'
    });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  // Settings navigation array
  const settingsNav = [
    { name: 'General', icon: <FaCog className="text-blue-600" /> },
    { name: 'Security', icon: <FaLock className="text-red-600" /> },
    { name: 'Notifications', icon: <FaBell className="text-yellow-600" /> },
    { name: 'Email', icon: <FaEnvelope className="text-green-600" /> },
    { name: 'Database', icon: <FaDatabase className="text-purple-600" /> },
    { name: 'Appearance', icon: <FaPalette className="text-pink-600" /> },
    { name: 'Localization', icon: <FaGlobe className="text-indigo-600" /> }
  ];
  
  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-semibold text-gray-800">System Settings</h1>
      </div>
        <div className="p-6">
        {notification.message && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : notification.type === 'info'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {notification.type === 'success' 
              ? <FaCheck className="mr-2" /> 
              : <FaExclamationTriangle className="mr-2" />}
            <span>{notification.message}</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Settings Navigation */}
            <div className="md:col-span-1">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Settings</h2>
              <nav className="space-y-1">
                {settingsNav.map((setting) => (
                  <button 
                    key={setting.name}
                    onClick={() => setActiveTab(setting.name)}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === setting.name
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{setting.icon}</span>
                    <span>{setting.name}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Settings Content */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
                {activeTab} Settings
                {loading && <FaSpinner className="inline ml-2 animate-spin" />}
              </h2>
              
              {error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{error}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* General Settings */}
                  {activeTab === 'General' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                        <input 
                          type="text" 
                          name="siteName"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          placeholder="Security App"
                          value={settings.siteName}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                        <textarea 
                          name="siteDescription"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          rows={3}
                          placeholder="Advanced security application for user authentication"
                          value={settings.siteDescription}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Security Settings */}
                  {activeTab === 'Security' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                          <input 
                            type="number" 
                            name="sessionTimeout"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                            value={settings.sessionTimeout}
                            onChange={handleChange}
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Default User Role</label>
                          <select 
                            name="defaultRole"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={settings.defaultRole}
                            onChange={handleChange}
                          >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                            <option value="guest">Guest</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                          <input 
                            type="number" 
                            name="maxLoginAttempts"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                            value={settings.maxLoginAttempts}
                            onChange={handleChange}
                            min="1"
                            max="10"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password Reset Timeout (hours)</label>
                          <input 
                            type="number" 
                            name="passwordResetTimeout"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                            value={settings.passwordResetTimeout}
                            onChange={handleChange}
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="enable_registration" 
                          name="enableRegistration"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                          checked={settings.enableRegistration}
                          onChange={handleChange}
                        />
                        <label htmlFor="enable_registration" className="ml-2 block text-sm text-gray-700">
                          Enable public registration
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="require_email_verification" 
                          name="requireEmailVerification"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                          checked={settings.requireEmailVerification}
                          onChange={handleChange}
                        />
                        <label htmlFor="require_email_verification" className="ml-2 block text-sm text-gray-700">
                          Require email verification
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="two_factor_auth" 
                          name="twoFactorAuth"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                          checked={settings.twoFactorAuth}
                          onChange={handleChange}
                        />
                        <label htmlFor="two_factor_auth" className="ml-2 block text-sm text-gray-700">
                          Enable two-factor authentication
                        </label>
                      </div>
                      
                      {settings.twoFactorAuth && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Two-Factor Method</label>
                          <select 
                            name="twoFactorMethod"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={settings.twoFactorMethod}
                            onChange={handleChange}
                          >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="app">Authenticator App</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Notifications Settings */}
                  {activeTab === 'Notifications' && (
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="email_notifications" 
                          name="emailNotifications"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                          checked={settings.emailNotifications}
                          onChange={handleChange}
                        />
                        <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-700">
                          Send email notifications
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="security_alerts" 
                          name="securityAlerts"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                          checked={settings.securityAlerts}
                          onChange={handleChange}
                        />
                        <label htmlFor="security_alerts" className="ml-2 block text-sm text-gray-700">
                          Send security alerts
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="login_alerts" 
                          name="loginAlerts"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                          checked={settings.loginAlerts}
                          onChange={handleChange}
                        />
                        <label htmlFor="login_alerts" className="ml-2 block text-sm text-gray-700">
                          Send login alerts
                        </label>
                      </div>
                      
                      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                        <p className="text-sm">
                          Configure which notifications and alerts are sent to users and administrators.
                          More notification types will be added in future updates.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Email Settings */}
                  {activeTab === 'Email' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
                        <input 
                          type="text" 
                          name="smtpServer"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          placeholder="smtp.example.com"
                          value={settings.smtpServer}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                          <input 
                            type="number" 
                            name="smtpPort"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                            value={settings.smtpPort}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="flex items-center h-full pt-6">
                          <input 
                            type="checkbox" 
                            id="use_ssl" 
                            name="useSsl"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                            checked={settings.useSsl}
                            onChange={handleChange}
                          />
                          <label htmlFor="use_ssl" className="ml-2 block text-sm text-gray-700">
                            Use SSL/TLS
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                        <input 
                          type="text" 
                          name="smtpUser"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          placeholder="username@example.com"
                          value={settings.smtpUser}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                        <input 
                          type="password" 
                          name="smtpPassword"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          placeholder="•••••••••••"
                          value={settings.smtpPassword}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Email Address</label>
                        <input 
                          type="email" 
                          name="emailFrom"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          placeholder="no-reply@yourapp.com"
                          value={settings.emailFrom}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button 
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Test Email
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Database Settings */}
                  {activeTab === 'Database' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Backup Schedule</label>
                        <select 
                          name="dbBackupSchedule"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={settings.dbBackupSchedule}
                          onChange={handleChange}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Backup Retention (days)</label>
                        <input 
                          type="number" 
                          name="dbRetentionDays"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          value={settings.dbRetentionDays}
                          onChange={handleChange}
                          min="1"
                        />
                      </div>
                      
                      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                        <p className="text-sm">
                          Database management features are coming soon. This will include backup scheduling,
                          retention policies, and database optimization.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Appearance Settings */}
                  {activeTab === 'Appearance' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                        <select 
                          name="theme"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={settings.theme}
                          onChange={handleChange}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System Default</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                          <div className="flex items-center">
                            <input 
                              type="color" 
                              name="primaryColor"
                              className="h-8 w-12 p-0 border border-gray-300 rounded-md" 
                              value={settings.primaryColor}
                              onChange={handleChange}
                            />
                            <input 
                              type="text" 
                              name="primaryColor"
                              className="ml-2 flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                              value={settings.primaryColor}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                          <div className="flex items-center">
                            <input 
                              type="color" 
                              name="accentColor"
                              className="h-8 w-12 p-0 border border-gray-300 rounded-md" 
                              value={settings.accentColor}
                              onChange={handleChange}
                            />
                            <input 
                              type="text" 
                              name="accentColor"
                              className="ml-2 flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                              value={settings.accentColor}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                        <p className="text-sm">
                          Theme customization will be applied in the next release. You can configure appearance settings now,
                          and they will be applied when the feature is available.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Localization Settings */}
                  {activeTab === 'Localization' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                        <select 
                          name="defaultLanguage"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={settings.defaultLanguage}
                          onChange={handleChange}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                        <select 
                          name="dateFormat"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={settings.dateFormat}
                          onChange={handleChange}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select 
                          name="timezone"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={settings.timezone}
                          onChange={handleChange}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button 
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Reset
                    </button>
                    <button 
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
