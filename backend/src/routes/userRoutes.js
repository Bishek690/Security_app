const express = require("express");
const { registerUser, loginUser, getUserData, getUserById, updateUser, deleteUser, 
    getAllUsers, forgotPassword, resetPassword, logoutUser } = require("../controllers/userController");

const { isAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user", isAuthenticated, getUserData);
router.get("/user/:id", isAuthenticated, getUserById).patch("/user/:id", isAuthenticated, updateUser).delete("/user/:id", isAuthenticated, deleteUser);
router.get("/users", isAuthenticated, getAllUsers);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);
router.post("/user/logout", logoutUser);

module.exports = router;
