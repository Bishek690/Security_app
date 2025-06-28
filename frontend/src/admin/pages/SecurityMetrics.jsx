import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaUserLock, FaChartBar, 
         FaFilter, FaSync, FaCalendarAlt, FaUsers, FaUserPlus } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { getSecurityMetrics } from '../../services/adminService';

const SecurityMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityMetrics(period, true);
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching security metrics:', err);
      setError('Failed to load security metrics. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
          <MdSecurity className="mr-2 text-blue-600 text-3xl" />
          Security Metrics
        </h1>

        <div className="flex space-x-3">
          {/* Time period selector */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FaCalendarAlt className="text-gray-500" />
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && !refreshing && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <FaExclamationTriangle className="inline mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && !loading && (
        <div className="space-y-6">
          {/* Login Metrics */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-50 p-4 border-b">
              <h2 className="font-semibold text-lg text-gray-700">Login Security</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Login Success Rate</p>
                      <p className="text-2xl font-bold">{metrics.metrics.loginAttempts.successRate}%</p>
                    </div>
                    {metrics.previousPeriod && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        parseFloat(metrics.previousPeriod.loginAttempts.successfulChange) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(metrics.previousPeriod.loginAttempts.successfulChange) > 0 ? '+' : ''}
                        {metrics.previousPeriod.loginAttempts.successfulChange}%
                      </span>
                    )}
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${metrics.metrics.loginAttempts.successRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Successful Logins</p>
                    {metrics.previousPeriod && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        parseFloat(metrics.previousPeriod.loginAttempts.successfulChange) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(metrics.previousPeriod.loginAttempts.successfulChange) > 0 ? '+' : ''}
                        {metrics.previousPeriod.loginAttempts.successfulChange}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">{metrics.metrics.loginAttempts.successful}</p>
                  <div className="flex items-center mt-4">
                    <FaUserLock className="text-green-500 mr-2" />
                    <span className="text-sm text-gray-500">Authenticated Users</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Failed Logins</p>
                    {metrics.previousPeriod && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        parseFloat(metrics.previousPeriod.loginAttempts.failedChange) < 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(metrics.previousPeriod.loginAttempts.failedChange) > 0 ? '+' : ''}
                        {metrics.previousPeriod.loginAttempts.failedChange}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">{metrics.metrics.loginAttempts.failed}</p>
                  <div className="flex items-center mt-4">
                    <FaExclamationTriangle className="text-amber-500 mr-2" />
                    <span className="text-sm text-gray-500">Failed Authentication Attempts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Security */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-green-50 p-4 border-b">
              <h2 className="font-semibold text-lg text-gray-700">User Security</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">User Registrations</p>
                    {metrics.previousPeriod && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        parseFloat(metrics.previousPeriod.userRegistrationsChange) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(metrics.previousPeriod.userRegistrationsChange) > 0 ? '+' : ''}
                        {metrics.previousPeriod.userRegistrationsChange}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold mt-2">{metrics.metrics.userRegistrations}</p>
                  <div className="flex items-center mt-4">
                    <FaUserPlus className="text-blue-500 mr-2" />
                    <span className="text-sm text-gray-500">New Users</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Password Resets</p>
                  <p className="text-2xl font-bold mt-2">{metrics.metrics.passwordResets}</p>
                  <div className="flex items-center mt-4">
                    <FaUserLock className="text-purple-500 mr-2" />
                    <span className="text-sm text-gray-500">Reset Requests</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Suspicious Activities</p>
                  <p className="text-2xl font-bold mt-2">{metrics.metrics.suspiciousActivities}</p>
                  <div className="flex items-center mt-4">
                    <FaShieldAlt className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-500">Security Flags</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityMetrics;
