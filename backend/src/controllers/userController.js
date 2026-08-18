const { User, Business, Category, Favorite, Review, AuditLog, sequelize, Op } = require('../models');
const bcrypt = require('bcryptjs');

// Get user's businesses
exports.getUserBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Category, as: 'category' },
        { model: BusinessImage, as: 'images', limit: 1 }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: { businesses }
    });
  } catch (error) {
    console.error('Get user businesses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get businesses'
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Business, as: 'businesses' },
        { model: Review, as: 'reviews' },
        { model: Favorite, as: 'favorites' }
      ]
    });

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, profile_image } = req.body;

    const user = await User.findByPk(req.user.id);
    user.full_name = full_name || user.full_name;
    user.phone = phone || user.phone;
    user.profile_image = profile_image || user.profile_image;

    await user.save();

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

// Get user's favorites
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        { 
          model: Business, 
          as: 'business',
          where: { status: 'active' },
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: { favorites }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get favorites'
    });
  }
};

// Add favorite
exports.addFavorite = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findByPk(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const [favorite, created] = await Favorite.findOrCreate({
      where: {
        user_id: req.user.id,
        business_id: businessId
      }
    });

    if (!created) {
      return res.status(409).json({
        success: false,
        message: 'Business already in favorites'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: { favorite }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add favorite'
    });
  }
};

// Remove favorite
exports.removeFavorite = async (req, res) => {
  try {
    const { businessId } = req.params;

    const deleted = await Favorite.destroy({
      where: {
        user_id: req.user.id,
        business_id: businessId
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    return res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove favorite'
    });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { user_id: req.user.id },
      include: [
        { 
          model: Business, 
          as: 'business',
          attributes: ['id', 'name', 'slug', 'logo']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get reviews'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.scope('withPassword').findByPk(req.user.id);
    
    const validPassword = await user.validPassword(current_password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password_hash = hashedPassword;
    await user.save();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'password_change',
      target_type: 'user',
      target_id: req.user.id
    });

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    await user.destroy();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'account_delete',
      target_type: 'user',
      target_id: req.user.id
    });

    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};