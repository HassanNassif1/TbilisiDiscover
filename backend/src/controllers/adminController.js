const { 
  User, Business, Category, Location, Review, Deal, Event,
  SubscriptionPlan, AdvertisingPackage, Report, AuditLog,
  Payment, Subscription, BusinessImage, BusinessHour, Service,
  sequelize, Op
} = require('../models');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

// ============================================
// DASHBOARD STATS
// ============================================

exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalBusinesses,
      pendingBusinesses,
      premiumBusinesses,
      totalReviews,
      totalDeals,
      totalEvents,
      totalRevenue
    ] = await Promise.all([
      User.count(),
      User.count({ where: { deleted_at: null } }),
      Business.count({ where: { status: 'active' } }),
      Business.count({ where: { status: 'pending' } }),
      Business.count({ where: { is_premium: true, status: 'active' } }),
      Review.count({ where: { status: 'approved' } }),
      Deal.count({ where: { status: 'active' } }),
      Event.count({ where: { status: 'approved' } }),
      Payment.sum('amount', { where: { status: 'succeeded' } })
    ]);

    const recentUsers = await User.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'full_name', 'email', 'created_at']
    });

    const recentBusinesses = await Business.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'owner', attributes: ['full_name'] }]
    });

    return res.json({
      success: true,
      data: {
        stats: {
          total_users: totalUsers || 0,
          active_users: activeUsers || 0,
          total_businesses: totalBusinesses || 0,
          pending_businesses: pendingBusinesses || 0,
          premium_businesses: premiumBusinesses || 0,
          total_reviews: totalReviews || 0,
          total_deals: totalDeals || 0,
          total_events: totalEvents || 0,
          total_revenue: totalRevenue || 0
        },
        recent: {
          users: recentUsers || [],
          businesses: recentBusinesses || []
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { full_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'refresh_token'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
      include: [
        { model: Business, as: 'businesses' },
        { model: Review, as: 'reviews' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: 'User role updated',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (status === 'suspended') {
      user.deleted_at = new Date();
    } else if (status === 'active') {
      user.deleted_at = null;
    }

    await user.save();

    return res.json({
      success: true,
      message: `User ${status} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// ============================================
// BUSINESS MANAGEMENT
// ============================================
// Add this function
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['name', 'ASC']]
    });

    return res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
};
exports.getBusinesses = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) where.category_id = category;

    const { count, rows } = await Business.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],  // ← Changed from 'created_at' to 'createdAt'
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    return res.json({
      success: true,
      data: {
        businesses: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get businesses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email'] },
        { model: Category, as: 'category' },
        { model: BusinessImage, as: 'images' }
      ]
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    return res.json({
      success: true,
      data: { business }
    });
  } catch (error) {
    console.error('Get business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get business'
    });
  }
};

exports.createBusiness = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      neighborhood,
      phone,
      website,
      email,
      price_range,
      category_id,
      cover_image,
      logo,
      is_featured,
      is_premium,
      status
    } = req.body;

    if (!name || !address || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and category are required'
      });
    }

    let slug = slugify(name, { lower: true, strict: true });
    const existing = await Business.findOne({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const business = await Business.create({
      user_id: req.user.id,
      name,
      slug,
      description: description || '',
      address,
      city: city || 'Tbilisi',
      neighborhood: neighborhood || '',
      phone: phone || '',
      website: website || '',
      email: email || '',
      price_range: price_range || '$$',
      category_id: parseInt(category_id),
      cover_image: cover_image || '',
      logo: logo || '',
      is_featured: is_featured || false,
      is_premium: is_premium || false,
      status: status || 'active',
      rating: 0,
      review_count: 0
    });

    if (cover_image) {
      await BusinessImage.create({
        business_id: business.id,
        image_url: cover_image,
        is_cover: true,
        caption: business.name
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: { business }
    });
  } catch (error) {
    console.error('Create business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create business: ' + error.message
    });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (updates.name && updates.name !== business.name) {
      let slug = slugify(updates.name, { lower: true, strict: true });
      const existing = await Business.findOne({ 
        where: { slug, id: { [Op.ne]: id } } 
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
      updates.slug = slug;
    }

    await business.update(updates);

    return res.json({
      success: true,
      message: 'Business updated successfully',
      data: { business }
    });
  } catch (error) {
    console.error('Update business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update business'
    });
  }
};

exports.updateBusinessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    business.status = status;
    await business.save();

    return res.json({
      success: true,
      message: `Business ${status} successfully`,
      data: { business }
    });
  } catch (error) {
    console.error('Update business status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update business status'
    });
  }
};

exports.toggleFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (type === 'featured') {
      business.is_featured = !business.is_featured;
    } else if (type === 'premium') {
      business.is_premium = !business.is_premium;
    }

    await business.save();

    return res.json({
      success: true,
      message: `Business ${type} toggled`,
      data: { business }
    });
  } catch (error) {
    console.error('Toggle feature error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle business feature'
    });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    await business.destroy();

    return res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Delete business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete business'
    });
  }
};

// ============================================
// REVIEW MANAGEMENT
// ============================================

exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { model: Business, as: 'business', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        reviews: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get reviews'
    });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    await review.save();

    return res.json({
      success: true,
      message: 'Review moderated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to moderate review'
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.destroy();

    return res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

// ============================================
// DEALS MANAGEMENT
// ============================================

exports.getDeals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Deal.findAndCountAll({
      where,
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'slug'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        deals: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get deals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get deals'
    });
  }
};

exports.approveDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const deal = await Deal.findByPk(id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    deal.status = status;
    await deal.save();

    return res.json({
      success: true,
      message: 'Deal approved successfully',
      data: { deal }
    });
  } catch (error) {
    console.error('Approve deal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve deal'
    });
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findByPk(id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    await deal.destroy();

    return res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete deal'
    });
  }
};

// ============================================
// EVENTS MANAGEMENT
// ============================================

exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Event.findAndCountAll({
      where,
      include: [{ model: Business, as: 'business', attributes: ['id', 'name', 'slug'] }],
      order: [['event_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        events: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get events'
    });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.status = status;
    await event.save();

    return res.json({
      success: true,
      message: 'Event approved successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Approve event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve event'
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.destroy();

    return res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

// ============================================
// SUBSCRIPTIONS
// ============================================

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [
        { model: Business, as: 'business' },
        { model: SubscriptionPlan, as: 'plan' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: { subscriptions }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions'
    });
  }
};

exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC']]
    });

    return res.json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans'
    });
  }
};

exports.createSubscriptionPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      currency,
      interval,
      features,
      max_photos,
      max_deals,
      has_menu,
      has_analytics,
      has_booking,
      is_featured,
      display_order
    } = req.body;

    const plan = await SubscriptionPlan.create({
      name,
      description,
      price,
      currency: currency || 'USD',
      interval: interval || 'monthly',
      features: features || {},
      max_photos: max_photos || 5,
      max_deals: max_deals || 1,
      has_menu: has_menu || false,
      has_analytics: has_analytics || false,
      has_booking: has_booking || false,
      is_featured: is_featured || false,
      is_active: true,
      display_order: display_order || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription plan created',
      data: { plan }
    });
  } catch (error) {
    console.error('Create subscription plan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subscription plan'
    });
  }
};

exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await plan.update(updates);

    return res.json({
      success: true,
      message: 'Subscription plan updated',
      data: { plan }
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update subscription plan'
    });
  }
};

exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await plan.destroy();

    return res.json({
      success: true,
      message: 'Subscription plan deleted'
    });
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete subscription plan'
    });
  }
};

// ============================================
// REPORTS
// ============================================

exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'full_name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        reports: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    await report.save();

    return res.json({
      success: true,
      message: 'Report resolved successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve report'
    });
  }
};

// ============================================
// AUDIT LOGS
// ============================================

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get audit logs'
    });
  }
};

// ============================================
// CATEGORIES
// ============================================

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, parent_id, display_order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { name: name }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Generate slug - FIXED
    let slug = slugify(name, { lower: true, strict: true });
    // Check if slug exists and make it unique
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await Category.findOne({ where: { slug: finalSlug } });
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const category = await Category.create({
      name,
      slug: finalSlug,
      icon: icon || '',
      parent_id: parent_id || null,
      display_order: display_order || 0,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category: ' + error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, parent_id, display_order, is_active } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (parent_id !== undefined) updates.parent_id = parent_id;
    if (display_order !== undefined) updates.display_order = display_order;
    if (is_active !== undefined) updates.is_active = is_active;

    // Update slug if name changed - FIXED
    if (name && name !== category.name) {
      let slug = slugify(name, { lower: true, strict: true });
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const existing = await Category.findOne({ 
          where: { 
            slug: finalSlug,
            id: { [Op.ne]: id }
          } 
        });
        if (!existing) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      updates.slug = finalSlug;
    }

    await category.update(updates);

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category: ' + error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.destroy();

    return res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// ============================================
// LOCATIONS
// ============================================

exports.createLocation = async (req, res) => {
  try {
    const { name, city, latitude, longitude } = req.body;

    const location = await Location.create({
      name,
      city: city || 'Tbilisi',
      latitude: latitude || null,
      longitude: longitude || null,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Location created',
      data: { location }
    });
  } catch (error) {
    console.error('Create location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create location'
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    await location.update(updates);

    return res.json({
      success: true,
      message: 'Location updated',
      data: { location }
    });
  } catch (error) {
    console.error('Update location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    await location.destroy();

    return res.json({
      success: true,
      message: 'Location deleted'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete location'
    });
  }
};

// ============================================
// ADVERTISING PACKAGES
// ============================================

exports.getAdvertisingPackages = async (req, res) => {
  try {
    const packages = await AdvertisingPackage.findAll({
      where: { is_active: true },
      order: [['price', 'ASC']]
    });

    return res.json({
      success: true,
      data: { packages }
    });
  } catch (error) {
    console.error('Get advertising packages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get advertising packages'
    });
  }
};

exports.createAdvertisingPackage = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price,
      currency,
      duration_days,
      features
    } = req.body;

    const pkg = await AdvertisingPackage.create({
      name,
      type,
      description,
      price,
      currency: currency || 'USD',
      duration_days,
      features: features || {},
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Advertising package created',
      data: { package: pkg }
    });
  } catch (error) {
    console.error('Create advertising package error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create advertising package'
    });
  }
};

exports.updateAdvertisingPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const pkg = await AdvertisingPackage.findByPk(id);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await pkg.update(updates);

    return res.json({
      success: true,
      message: 'Advertising package updated',
      data: { package: pkg }
    });
  } catch (error) {
    console.error('Update advertising package error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update advertising package'
    });
  }
};

exports.deleteAdvertisingPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await AdvertisingPackage.findByPk(id);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await pkg.destroy();

    return res.json({
      success: true,
      message: 'Advertising package deleted'
    });
  } catch (error) {
    console.error('Delete advertising package error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete advertising package'
    });
  }
};

// ============================================
// SETTINGS
// ============================================

exports.getSettings = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        settings: {
          site_name: 'Discover Tbilisi',
          site_description: 'Discover the best of Tbilisi',
          currency: 'GEL',
          timezone: 'Asia/Tbilisi',
          registration_enabled: true,
          business_registration_enabled: true,
          review_moderation_enabled: true,
          default_currency: 'GEL',
          contact_email: 'support@discovertbilisi.ge'
        }
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    return res.json({
      success: true,
      message: 'Settings updated',
      data: { settings: updates }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};