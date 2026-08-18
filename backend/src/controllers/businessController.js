const { 
  Business, 
  Category, 
  User, 
  BusinessImage, 
  BusinessHour,
  Service,
  Review, 
  Deal, 
  Event,
  sequelize, 
  Op 
} = require('../models');

// ✅ Get all businesses
exports.getAllBusinesses = async (req, res) => {
  try {
    console.log('🔍 API called: /api/businesses');
    
    const {
      page = 1,
      limit = 20,
      search,
      category,
      location,
      neighborhood,
      price_range,
      rating,
      premium,
      featured,
      sort = 'rating'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = { status: 'active' };

    // Search
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      where.category_id = parseInt(category);
    }

    // Location filter
    if (location) {
      where.neighborhood = location;
    }

    if (neighborhood) {
      where.neighborhood = neighborhood;
    }

    if (price_range) {
      where.price_range = price_range;
    }

    if (rating) {
      where.rating = { [Op.gte]: parseFloat(rating) };
    }

    if (premium === 'true') {
      where.is_premium = true;
    }

    if (featured === 'true') {
      where.is_featured = true;
    }

    // Sorting
    let order = [];
    switch (sort) {
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'reviews':
        order = [['review_count', 'DESC']];
        break;
      case 'newest':
        order = [['createdAt', 'DESC']];
        break;
      case 'popular':
        order = [['views', 'DESC']];
        break;
      default:
        order = [['rating', 'DESC']];
    }

    // Include relations
    const include = [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: User, as: 'owner', attributes: ['id', 'full_name', 'email'] },
      { 
        model: BusinessImage, 
        as: 'images', 
        attributes: ['id', 'image_url', 'is_cover'],
        required: false,
        limit: 1
      }
    ];

    const result = await Business.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    console.log(`✅ Found ${result.count} businesses`);

    return res.json({
      success: true,
      data: {
        businesses: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(result.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get businesses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get businesses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Get business by slug
exports.getBusinessBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const business = await Business.findOne({
      where: { slug, status: 'active' },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email'] },
        { model: BusinessImage, as: 'images' },
        { model: BusinessHour, as: 'hours' },
        { model: Service, as: 'services', where: { is_active: true }, required: false },
        { 
          model: Review, 
          as: 'reviews', 
          where: { status: 'approved' }, 
          required: false,
          limit: 5,
          include: [
            { model: User, as: 'user', attributes: ['id', 'full_name', 'profile_image'] }
          ],
          order: [['createdAt', 'DESC']]
        },
        { 
          model: Deal, 
          as: 'deals', 
          where: { status: 'active', is_active: true }, 
          required: false,
          limit: 5
        },
        { 
          model: Event, 
          as: 'events', 
          where: { status: 'approved' }, 
          required: false,
          limit: 5
        }
      ]
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Increment view count
    business.views += 1;
    await business.save();

    const businessData = business.toJSON();
    
    // Calculate average rating
    const ratingResult = await Review.findOne({
      where: { business_id: business.id, status: 'approved' },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ]
    });

    businessData.rating = ratingResult ? parseFloat(ratingResult.dataValues.avgRating) || 0 : 0;
    businessData.review_count = ratingResult ? parseInt(ratingResult.dataValues.count) || 0 : 0;

    return res.json({
      success: true,
      data: { business: businessData }
    });

  } catch (error) {
    console.error('❌ Get business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get business'
    });
  }
};

// ✅ Debug endpoint
exports.debugBusinesses = async (req, res) => {
  try {
    const total = await Business.count();
    const active = await Business.count({ where: { status: 'active' } });
    const samples = await Business.findAll({
      limit: 5,
      attributes: ['id', 'name', 'status']
    });
    
    console.log('🔍 Debug - Total:', total, 'Active:', active);
    
    res.json({
      success: true,
      data: {
        total: total,
        active: active,
        samples: samples
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Register business
exports.registerBusiness = async (req, res) => {
  try {
    const {
      name,
      owner_name,
      email,
      phone,
      category_id,
      address,
      description,
      website
    } = req.body;

    const existingBusiness = await Business.findOne({
      where: { user_id: req.user.id }
    });

    if (existingBusiness) {
      return res.status(409).json({
        success: false,
        message: 'You already have a registered business'
      });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slugCheck = await Business.findOne({ where: { slug } });
    if (slugCheck) {
      slug = `${slug}-${Date.now()}`;
    }

    const business = await Business.create({
      user_id: req.user.id,
      name,
      slug,
      email: email || req.user.email,
      phone,
      category_id: parseInt(category_id),
      address,
      description,
      website,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Business registration submitted. Awaiting admin approval.',
      data: { business }
    });

  } catch (error) {
    console.error('❌ Register business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register business'
    });
  }
};

// ✅ Update business
exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = req.business;

    const {
      name,
      description,
      address,
      phone,
      website,
      email,
      price_range,
      latitude,
      longitude,
      neighborhood
    } = req.body;

    if (name && name !== business.name) {
      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slugCheck = await Business.findOne({ where: { slug, id: { [Op.ne]: id } } });
      if (slugCheck) {
        slug = `${slug}-${Date.now()}`;
      }
      business.slug = slug;
    }

    business.name = name || business.name;
    business.description = description || business.description;
    business.address = address || business.address;
    business.phone = phone || business.phone;
    business.website = website || business.website;
    business.email = email || business.email;
    business.price_range = price_range || business.price_range;
    business.latitude = latitude || business.latitude;
    business.longitude = longitude || business.longitude;
    business.neighborhood = neighborhood || business.neighborhood;

    await business.save();

    return res.json({
      success: true,
      message: 'Business updated successfully',
      data: { business }
    });

  } catch (error) {
    console.error('❌ Update business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update business'
    });
  }
};

// ✅ Add business image
exports.addBusinessImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, caption, is_cover } = req.body;

    const image = await BusinessImage.create({
      business_id: id,
      image_url,
      caption,
      is_cover: is_cover || false
    });

    return res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: { image }
    });

  } catch (error) {
    console.error('❌ Add image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add image'
    });
  }
};

// ✅ Remove business image
exports.removeBusinessImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    await BusinessImage.destroy({ where: { id: imageId } });
    return res.json({
      success: true,
      message: 'Image removed successfully'
    });
  } catch (error) {
    console.error('❌ Remove image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove image'
    });
  }
};

// ✅ Set business hours
exports.setBusinessHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours } = req.body;

    await BusinessHour.destroy({ where: { business_id: id } });

    const newHours = await BusinessHour.bulkCreate(
      hours.map(h => ({
        business_id: id,
        day_of_week: h.day_of_week,
        opens_at: h.opens_at || null,
        closes_at: h.closes_at || null,
        is_closed: h.is_closed || false
      }))
    );

    return res.json({
      success: true,
      message: 'Business hours updated',
      data: { hours: newHours }
    });

  } catch (error) {
    console.error('❌ Set hours error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to set business hours'
    });
  }
};

// ✅ Add service
exports.addService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration_minutes } = req.body;

    const service = await Service.create({
      business_id: id,
      name,
      description,
      price,
      duration_minutes,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: { service }
    });

  } catch (error) {
    console.error('❌ Add service error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add service'
    });
  }
};

// ✅ Delete service
exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    await Service.destroy({ where: { id: serviceId } });
    return res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete service error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
};

// ✅ Claim business
exports.claimBusiness = async (req, res) => {
  try {
    const { slug } = req.params;
    const { reason } = req.body;

    const business = await Business.findOne({ where: { slug } });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (business.user_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You already own this business'
      });
    }

    // Check if there's a pending claim
    const existingClaim = await AuditLog.findOne({
      where: {
        target_type: 'business',
        target_id: business.id,
        action: 'business_claim',
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'A claim request has already been submitted for this business'
      });
    }

    // Create claim request
    await AuditLog.create({
      user_id: req.user.id,
      action: 'business_claim',
      target_type: 'business',
      target_id: business.id,
      changes: { reason, user_email: req.user.email, user_name: req.user.full_name }
    });

    return res.json({
      success: true,
      message: 'Claim request submitted. We will review it and contact you.'
    });

  } catch (error) {
    console.error('❌ Claim business error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit claim'
    });
  }
};