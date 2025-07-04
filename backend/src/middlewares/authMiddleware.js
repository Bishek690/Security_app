const jwt = require("jsonwebtoken");
const { User } = require("../entities/User");
const { AppDataSource } = require("../config/data-source");

const isAuthenticated = (req, res, next) => {
  // // For development, check if we should bypass authentication
  // if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
  //   console.log('⚠️ WARNING: Authentication bypassed for development');
  //   req.user = { id: 1, role: 'admin' }; // Mock user data
  //   return next();
  // }

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const isAdmin = async (req, res, next) => {
  // // For development, check if we should bypass admin authorization
  // if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
  //   console.log('⚠️ WARNING: Admin authorization bypassed for development');
  //   return next();
  // }

  try {
    // Check if user is authenticated first
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has elevated role (admin, supervisor, or manager)
    const elevatedRoles = ['admin', 'supervisor', 'manager'];
    if (!elevatedRoles.includes(user.isAdmin)) {
      return res.status(403).json({ message: "Access denied. Administrative privileges required." });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    return res.status(500).json({ message: "Internal server error during authorization" });
  }
};

module.exports = { isAuthenticated, isAdmin };
