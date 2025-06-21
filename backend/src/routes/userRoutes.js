const express = require("express");
const { 
  registerUser, 
  loginUser, 
  getUserData, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getAllUsers, 
  forgotPassword, 
  resetPassword,
  changePassword,
  sendChangePasswordOtp, 
  logoutUser 
} = require("../controllers/userController");

const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);
router.post("/user/logout", logoutUser);

// Protected routes
router.get("/user", isAuthenticated, getUserData);
router.get("/users", isAuthenticated, getAllUsers);
router.post("/user/:id/send-change-password-otp", isAuthenticated, sendChangePasswordOtp);
router.post("/user/:id/change-password", isAuthenticated, changePassword);

// User-specific routes (separate for clarity)
router.get("/user/:id", isAuthenticated, getUserById);
router.patch("/user/:id", isAuthenticated, updateUser);
router.delete("/user/:id", isAuthenticated, deleteUser);


module.exports = router;