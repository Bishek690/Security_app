const { AppDataSource } = require("../config/data-source");

/**
 * Logs user activities to the database
 * @param {Object} params - Activity log parameters
 * @param {String} params.action - The action performed
 * @param {Number} params.userId - User ID (optional)
 * @param {String} params.userEmail - User email (optional)
 * @param {String} params.details - Additional details about the action
 * @param {String} params.status - Status of the action (normal, success, danger, warning)
 * @param {String} params.ipAddress - IP address of the user (optional)
 * @returns {Promise} - The saved activity log
 */
async function logActivity({ action, userId = null, userEmail = null, details = "", status = "normal", ipAddress = null }) {
  try {
    const activityLogRepository = AppDataSource.getRepository("ActivityLog");
    
    const newActivity = {
      action,
      userId,
      userEmail,
      details,
      status,
      ipAddress,
      createdAt: new Date()
    };
    
    return await activityLogRepository.save(newActivity);
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw, just log the error so it doesn't break the main flow
    return null;
  }
}

/**
 * Extracts IP address from Express request object
 * @param {Object} req - Express request object
 * @returns {String} - IP address
 */
function getClientIP(req) {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         'Unknown';
}

module.exports = { logActivity, getClientIP };
