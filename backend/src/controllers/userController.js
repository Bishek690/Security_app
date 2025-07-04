const bcrypt = require("bcryptjs");
const { AppDataSource } = require("../config/data-source");
const { User } = require("../entities/User");
const nodemailer = require("nodemailer");
const { validateRegistrationInput } = require("../validations/userValidation");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { logActivity, getClientIP } = require("../utils/activityLogger");

const verifyCaptcha = async (captchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    null,
    {
      params: {
        secret: secretKey,
        response: captchaToken,
      },
    }
  );
  return response.data.success;
};

const registerUser = async (req, res) => {
  const {
    username,
    email,
    phoneNumber,
    password,
    captchaToken,
    confirmPassword,
    isAdmin,
  } = req.body;

  // Verify CAPTCHA first (bypass in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Bypassing CAPTCHA validation for registration in development mode');
  } else {
    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: "Invalid CAPTCHA" });
    }
  }

  // Run validation
  const { isValid, errors, strength } = validateRegistrationInput({
    username,
    email,
    phoneNumber,
    password,
    confirmPassword,
    isAdmin,
  });

  if (!isValid) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors, strength });
  }

  try {
    const userRepo = AppDataSource.getRepository("User");

    const normalizedEmail = email.trim().toLowerCase();
    // Check if email exists
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check if phone number exists
    const existingPhone = await userRepo.findOneBy({ phoneNumber });
    if (existingPhone) {
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert boolean to enum value for database
    let userRole  = "user";
    if (isAdmin === true || isAdmin === "true") {
      userRole  = "admin";
    }

    // Save user
    const newUser = userRepo.create({
      username,
      email: normalizedEmail,
      phoneNumber,
      password: hashedPassword,
      isAdmin: userRole,
    });

    await userRepo.save(newUser);

    // Send welcome email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Welcome to Our Platform",
      html: `
        <h3>Welcome, ${username}!</h3>
        <p>Your registration was successful.</p>
        <p>You can now log in at: <a href="${process.env.APP_URL}/login">process.env.APP_URL/login</a></p>
        <p>We're excited to have you onboard!</p>`,};

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
      } else {
        console.log("Registration email sent:", info.response);
      }
    });

    // Log the successful registration activity
    await logActivity({
      action: "New user registered",
      userId: newUser.id,
      userEmail: newUser.email,
      details: `User ${username} registered successfully`,
      status: "normal"
    });
    
    res.status(201).json({ message: "User registered successfully", strength });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const loginUser = async (req, res) => {
  const { identifier, password, captchaToken } = req.body;

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'Invalid CAPTCHA' });
    }


  try {
    const userRepo = AppDataSource.getRepository("User");

    const user = await userRepo
      .createQueryBuilder("user")
      .where("user.email = :identifier OR user.username = :identifier", { identifier })
      .getOne();

    if (!user || !user.password) {
      // Log failed login attempt
      await logActivity({
        action: "Failed login attempt",
        userEmail: identifier,
        details: "Invalid credentials - user not found or no password",
        status: "danger"
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await logActivity({
        action: "Failed login attempt",
        userId: user.id,
        userEmail: user.email,
        details: "Invalid password provided",
        status: "danger"
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    const { password: _, ...safeUser } = user;

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 86400000),
    });
    
    // Log the successful login activity
    await logActivity({
      action: "User login",
      userId: user.id,
      userEmail: user.email,
      details: "User logged in successfully",
      status: "success",
      ipAddress: getClientIP(req)
    });

    res.status(200).json({ message: "Login successful", user: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getUserData = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository("User");
    const userId = req.user.id;

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude password from response
    const { password: _, ...safeUser } = user;

    res
      .status(200)
      .json({ message: "User data retrieved successfully", user: safeUser });
  } catch (error) {
    console.error("Get user data error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
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
    res
      .status(200)
      .json({ message: "User data retrieved successfully", user: safeUser });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

    // Email conflict check first
    if (email && email !== user.email) {
      const existingUser = await userRepo.findOneBy({ email });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    const updatedUser = await userRepo.save(user);

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
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
};

const getAllUsers = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository("User");
    const users = await userRepo.find();
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
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
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the old password",
        });
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


const sendChangePasswordOtp = async (req, res) => {
  const userId = req.params.id;
  try {
    const userRepo = AppDataSource.getRepository("User");
    const otpRepo = AppDataSource.getRepository("OTP");
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
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
      to: user.email,
      subject: "Change Password OTP",
      text: `Your OTP for changing password is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send error:", error);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
      res.json({ message: "OTP sent successfully" });
    });
  } catch (err) {
    console.error("Send change password OTP error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword, otp } = req.body;

  try {
    if (!currentPassword || !newPassword || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userRepo = AppDataSource.getRepository("User");
    const otpRepo = AppDataSource.getRepository("OTP");
    const user = await userRepo.findOneBy({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // OTP verification
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

    // Password verification
    const isSamePassword = await bcrypt.compare(currentPassword, user.password);
    if (!isSamePassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await userRepo.save(user);

    // Optionally delete the OTP
    await otpRepo.remove(otpRecord);

    // Log the password change activity
    await logActivity({
      action: "Password changed",
      userId: user.id,
      userEmail: user.email,
      details: "Password changed successfully via OTP verification",
      status: "success"
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    // If user is authenticated, log the logout activity
    if (req.user && req.user.id) {
      const userRepo = AppDataSource.getRepository("User");
      const user = await userRepo.findOneBy({ id: req.user.id });
      
      if (user) {
        await logActivity({
          action: "User logout",
          userId: user.id,
          userEmail: user.email,
          details: "User logged out successfully",
          status: "normal"
        });
      }
    }
    
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
  sendChangePasswordOtp,
  changePassword,
  logoutUser,
};
