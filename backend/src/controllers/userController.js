const bcrypt = require("bcryptjs");
const { AppDataSource } = require("../config/data-source");
const { User } = require("../entities/User");
const nodemailer = require('nodemailer');
const { validateRegistrationInput } = require("../validations/userValidation");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { username, email, phoneNumber, password, confirmPassword, isAdmin } = req.body;

  // Run validation
  const { isValid, errors, strength } = validateRegistrationInput({
    username,
    email,
    phoneNumber,
    password,
    confirmPassword,
    isAdmin,
  });

  // Enforce strong password requirement
  if (strength !== "Strong") {
    return res.status(400).json({
      message: "Password is not strong enough. Please improve your password.",
      errors,
      strength,
    });
  }

  if (!isValid) {
    return res.status(400).json({ message: "Validation failed", errors, strength });
  }

  try {
    const userRepo = AppDataSource.getRepository("User");

    // Check if email exists
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check if phone number exists
    const existingPhone = await userRepo.findOneBy({ phoneNumber });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // If isAdmin is not provided, default to false
    const isAdminValue = isAdmin === undefined ? false : isAdmin;
    // Save user
    const newUser = userRepo.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      isAdmin: isAdminValue,
    });

    await userRepo.save(newUser);
    res.status(201).json({ message: "User registered successfully", strength });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be either email or username

  try {
    const userRepo = AppDataSource.getRepository("User");

    // Check if user exists by email or username
    const user = await userRepo.findOne({
      where: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Exclude password from response
    const { password: _, ...safeUser } = user;

    res.cookie("token", token, { httpOnly: true, secure: true, expires: new Date(Date.now() + 86400000) }); // 1 day expiration

    res.status(200).json({ message: "Login successful", user: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserData = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository("User");
    const userId = req.user.id; // Assuming you have middleware to set req.user

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude password from response
    const { password: _, ...safeUser } = user;

    res.status(200).json({ message: "User data retrieved successfully", user: safeUser });
  } catch (error) {
    console.error("Get user data error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Exclude password from response
    const { password: _, ...safeUser } = user;
    res.status(200).json({ message: "User data retrieved successfully", user: safeUser });
  }
  catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, phoneNumber, isAdmin } = req.body || {};

  if (!username && !email && !phoneNumber && isAdmin === undefined) {
    return res.status(400).json({ message: "No update data provided" });
  }

  try {
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    // If email is updated, check if it already exists
    if (email) {
      const existingUser = await userRepo.findOneBy({ email });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updatedUser = await userRepo.save(user);

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const userRepo = AppDataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRepo.remove(user);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const getAllUsers = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository("User");
    const users = await userRepo.find();
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userRepo = AppDataSource.getRepository("User");
    const otpRepo = AppDataSource.getRepository("OTP");

    const user = await userRepo.findOneBy({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP in OTP entity
    const otpRecord = otpRepo.create({
      otp,
      otpExpires: expiresAt,
      user: user,
    });

    await otpRepo.save(otpRecord);

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send error:", error);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
      res.json({ message: "OTP sent successfully" });
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  try {
    const userRepo = AppDataSource.getRepository("User");
    const otpRepo = AppDataSource.getRepository("OTP");

    const user = await userRepo.findOneBy({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the latest OTP for the user
    const otpRecord = await otpRepo.findOne({
      where: { user: { id: user.id }, otp },
      order: { createdAt: "DESC" },
      relations: ["user"],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(otpRecord.otpExpires)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Compare new password with old hashed password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from the old password" });
    }
    

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await userRepo.save(user);

    // Optionally delete the OTP
    await otpRepo.remove(otpRecord);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { 
    registerUser,
    loginUser,
    getUserData,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
    forgotPassword,
    resetPassword,
    logoutUser
 };
