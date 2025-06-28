const { AppDataSource } = require("../config/data-source");

/**
 * Logs user activities to the database
 * @param {Object} params - Activity log parameters
 * @param {String} params.action - The action performed
 * @param {Number} params.userId - User ID (optional)
 * @param {String} params.userEmail - User email (optional)
 * @param {String} params.details - Additional details about the action
 * @param {String} params.status - Status of the action (normal, success, danger, warning)
 * @returns {Promise} - The saved activity log
 */
async function logActivity({ action, userId = null, userEmail = null, details = "", status = "normal" }) {
  try {
    const activityLogRepository = AppDataSource.getRepository("ActivityLog");
    
    const newActivity = {
      action,
      userId,
      userEmail,
      details,
      status,
      createdAt: new Date()
    };
    
    return await activityLogRepository.save(newActivity);
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw, just log the error so it doesn't break the main flow
    return null;
  }
}

module.exports = { logActivity };
