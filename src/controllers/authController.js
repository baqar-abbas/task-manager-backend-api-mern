const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { validationResult } = require("express-validator");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */

const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: "user",
      isActive: true,
    });

    // Generate JWT token
    const token = generateToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password (since it's select: false)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from user object
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */

// const updateProfile = async (req, res) => {
//   try {
//     const { username, email } = req.body;
//     const userId = req.user.id;

//     // Check if username or email already taken by another user
//     if (username || email) {
//       const existingUser = await User.findOne({
//         $and: [{ _id: { $ne: userId } }, { $or: [] }],
//       });

//       if (username) {
//         existingUser.$or.push({ username });
//       }
//       if (email) {
//         existingUser.$or.push({ email });
//       }

//       if (existingUser && existingUser.$or.length > 0) {
//         const user = await User.findOne({
//           $and: [{ _id: { $ne: userId } }, { $or: existingUser.$or }],
//         });

//         if (user) {
//           return res.status(400).json({
//             success: false,
//             message: "Username or email already taken",
//           });
//         }
//       }
//     }

//     // Update user
//     const updateData = {};
//     if (username) updateData.username = username;
//     if (email) updateData.email = email;

//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       data: {
//         user: updatedUser,
//       },
//     });
//   } catch (error) {
//     console.error("Update profile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error updating profile",
//     });
//   }
// };

const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Check if username or email already taken by another user
    if (username || email) {
      const orConditions = [];

      if (username) {
        orConditions.push({ username });
      }
      if (email) {
        orConditions.push({ email });
      }

      if (orConditions.length > 0) {
        const existingUser = await User.findOne({
          _id: { $ne: userId },
          $or: orConditions,
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username or email already taken",
          });
        }
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Logout user (client-side token removal, server-side optional)
 * @route   POST /api/auth/logout
 * @access  Private
 */

const logout = async (req, res) => {
  try {
    // In a real production app, we might block the token here
    // For now, we'll just return success - client should remove token

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
};
