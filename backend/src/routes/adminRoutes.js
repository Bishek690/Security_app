const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// All admin routes should be protected with both isAuthenticated and isAdmin middleware

// Index and test routes - no auth required
router.get("/", adminController.listEndpoints);
router.get("/test", adminController.testApi);

// For development purposes, temporarily remove authentication from these endpoints
router.get("/stats", adminController.getAdminStats);
router.get("/security/metrics", adminController.getSecurityMetrics);
router.get("/analytics", adminController.getDashboardAnalytics);
router.get("/recent-activities", adminController.getRecentActivities);

// User management routes
router.get("/users", adminController.getUsers);
router.post("/users", adminController.addUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Audit logs
router.get("/audit-logs", isAuthenticated, isAdmin, adminController.getAuditLogs);

// System settings
router.get("/settings", isAuthenticated, isAdmin, adminController.getSystemSettings);
router.put("/settings", isAuthenticated, isAdmin, adminController.updateSystemSettings);

// Role management
router.get("/roles", isAuthenticated, isAdmin, adminController.getRoles);

module.exports = router;
