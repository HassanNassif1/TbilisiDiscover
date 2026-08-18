const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, AuditLog, Agent } = require('../models');
const { Op } = require('sequelize');

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// ============================================
// AGENT REGISTER
// ============================================
// controllers/authController.js - Agent Register with better error handling

exports.agentRegister = async (req, res) => {
  try {
    console.log('📝 Agent registration request received:', req.body);

    const { 
      full_name, 
      email, 
      password, 
      phone, 
      company, 
      license_number, 
      years_experience, 
      bio 
    } = req.body;

    // ✅ Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email and password are required'
      });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // ✅ Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // ✅ Create user with agent role
    const user = await User.create({
      email,
      password_hash,
      full_name,
      phone: phone || null,  // ✅ Handle null values
      role: 'agent',
      is_email_verified: process.env.NODE_ENV === 'development' ? true : false
    });

    console.log('✅ User created:', user.id);

    // ✅ Create agent profile
    const agent = await Agent.create({
      user_id: user.id,
      name: full_name,
      phone: phone || '',
      email: email,
      company: company || '',
      license_number: license_number || '',
      years_experience: parseInt(years_experience) || 0,
      bio: bio || '',
      is_verified: false
    });

    console.log('✅ Agent profile created:', agent.id);

    // ✅ Log audit (if AuditLog model exists)
    if (AuditLog) {
      await AuditLog.create({
        user_id: user.id,
        action: 'agent_register',
        target_type: 'user',
        target_id: user.id
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Agent registration successful. Please wait for admin verification.',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          is_verified: agent.is_verified
        },
        agent
      }
    });

  } catch (error) {
    console.error('❌ Agent registration error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // ✅ Send detailed error for debugging
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ============================================
// REGISTER (Regular user - DISABLED)
// ============================================
exports.register = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Registration is only available for agents. Please use /agent-register endpoint.'
  });
};

// ============================================
// LOGIN (Updated for Admin & Agents only)
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is deleted
    if (user.deleted_at) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check if user is admin or agent (No regular users allowed)
    if (!['admin', 'super_admin', 'agent'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and agents can access this platform.'
      });
    }

    // Verify password
    const validPassword = await user.validPassword(password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // In development, auto-verify email
    if (process.env.NODE_ENV === 'development' && !user.is_email_verified) {
      user.is_email_verified = true;
      await user.save();
    }

    // Check if email is verified (production only)
    if (!user.is_email_verified && process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Get agent profile if user is agent
    let agent = null;
    if (user.role === 'agent') {
      agent = await Agent.findOne({ 
        where: { user_id: user.id }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    user.refresh_token = refreshToken;
    await user.save();

    // Log audit
    await AuditLog.create({
      user_id: user.id,
      action: 'user_login',
      target_type: 'user',
      target_id: user.id
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          is_verified: agent?.is_verified || false,
          company: agent?.company || '',
          profile_image: user.profile_image
        },
        agent,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  }
};

// ============================================
// REFRESH TOKEN
// ============================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret');
    
    // Find user with refresh token
    const user = await User.scope('withRefreshToken').findByPk(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update refresh token
    user.refresh_token = newRefreshToken;
    await user.save();

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// ============================================
// LOGOUT
// ============================================
exports.logout = async (req, res) => {
  try {
    const user = await User.scope('withRefreshToken').findByPk(req.user.id);
    
    if (user) {
      user.refresh_token = null;
      await user.save();
    }

    await AuditLog.create({
      user_id: req.user.id,
      action: 'user_logout',
      target_type: 'user',
      target_id: req.user.id
    });

    return res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// ============================================
// VERIFY EMAIL
// ============================================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token required'
      });
    }

    const user = await User.findOne({
      where: { email_verification_token: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.is_email_verified = true;
    user.email_verification_token = null;
    await user.save();

    await AuditLog.create({
      user_id: user.id,
      action: 'email_verified',
      target_type: 'user',
      target_id: user.id
    });

    return res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// ============================================
// REQUEST PASSWORD RESET
// ============================================
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.password_reset_token = resetToken;
    user.password_reset_expires = resetExpires;
    await user.save();

    // In development, return the token
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        message: 'Password reset token generated',
        data: { resetToken }
      });
    }

    return res.json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Password reset request failed'
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password required'
      });
    }

    const user = await User.scope('withPassword').findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    user.password_hash = password_hash;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();

    await AuditLog.create({
      user_id: user.id,
      action: 'password_reset',
      target_type: 'user',
      target_id: user.id
    });

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: ['favorites', 'reviews']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get agent profile if agent
    let agent = null;
    if (user.role === 'agent') {
      agent = await Agent.findOne({ 
        where: { user_id: user.id }
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          ...user.toJSON(),
          is_verified: agent?.is_verified || false,
          company: agent?.company || ''
        },
        agent
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, profile_image } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.full_name = full_name || user.full_name;
    user.phone = phone || user.phone;
    user.profile_image = profile_image || user.profile_image;

    await user.save();

    // Update agent profile if agent
    if (user.role === 'agent') {
      const agent = await Agent.findOne({ where: { user_id: user.id } });
      if (agent) {
        agent.name = full_name || agent.name;
        agent.phone = phone || agent.phone;
        await agent.save();
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};