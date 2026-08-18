// controllers/realEstateController.js
const db = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');

// ============================================
// PROPERTY CONTROLLERS
// ============================================

exports.getProperties = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, location, bedrooms, sort, limit = 12, page = 1 } = req.query;
    
    const where = { status: 'available' };
    
    if (type && type !== 'all') where.type = type;
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (bedrooms) where.bedrooms = { [Op.gte]: parseInt(bedrooms) };
    if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'newest') order = [['created_at', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await db.Property.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [
        { model: db.PropertyImage, as: 'images', limit: 3 },
        { model: db.Agent, as: 'agent', attributes: ['id', 'name', 'profile_image', 'rating'] }
      ]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await db.Property.findOne({
      where: { 
        [Op.or]: [
          { id: isNaN(id) ? 0 : parseInt(id) },
          { slug: id }
        ]
      },
      include: [
        { model: db.PropertyImage, as: 'images' },
        { model: db.Agent, as: 'agent' },
        { model: db.User, as: 'owner', attributes: ['id', 'full_name', 'email'] }
      ]
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    await property.increment('views');

    res.json({ success: true, data: property });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/realEstateController.js

// controllers/realEstateController.js - createProperty with better slug handling

exports.createProperty = async (req, res) => {
  try {
    const propertyData = req.body;
    const userId = req.user.id;
    
    // ✅ Get agent ID from the logged-in user
    let agentId = null;
    
    if (req.user.role === 'agent') {
      const agent = await db.Agent.findOne({ where: { user_id: userId } });
      if (agent) {
        agentId = agent.id;
        console.log('✅ Agent found:', agent.id, agent.name);
      }
    }

    console.log('📝 Creating property:', propertyData.title);

    // ✅ Generate unique slug in controller (as backup)
    if (!propertyData.slug && propertyData.title) {
      const baseSlug = slugify(propertyData.title, { 
        lower: true, 
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existing = await db.Property.findOne({ 
          where: { slug } 
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      propertyData.slug = slug;
      console.log('✅ Generated unique slug:', slug);
    }

    // ✅ Create the property
    const property = await db.Property.create({
      title: propertyData.title,
      slug: propertyData.slug,
      description: propertyData.description || '',
      price: propertyData.price,
      type: propertyData.type || 'rent',
      location: propertyData.location,
      address: propertyData.address || '',
      bedrooms: propertyData.bedrooms || 1,
      bathrooms: propertyData.bathrooms || 1,
      sqft: propertyData.sqft || 0,
      status: propertyData.status || 'available',
      is_featured: propertyData.is_featured || false,
      agent_id: agentId,
      user_id: userId
    });

    console.log('✅ Property created, ID:', property.id);
    console.log('✅ Slug:', property.slug);

    // ✅ Handle images
    const imageUrls = propertyData.images || [];
    console.log('📸 Image URLs to save:', imageUrls);

    if (imageUrls.length > 0) {
      const images = imageUrls.map((url, index) => ({
        property_id: property.id,
        image_url: url,
        is_cover: index === 0,
        order: index,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      await db.PropertyImage.bulkCreate(images);
      console.log(`✅ ${images.length} images saved`);
    }

    // ✅ Fetch the complete property with images
    const completeProperty = await db.Property.findByPk(property.id, {
      include: [
        { model: db.PropertyImage, as: 'images' },
        { model: db.Agent, as: 'agent' }
      ]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Property created successfully',
      data: completeProperty 
    });
  } catch (error) {
    console.error('❌ Error creating property:', error);
    
    // ✅ Handle duplicate slug error specifically
    if (error.name === 'SequelizeUniqueConstraintError' && error.fields?.slug) {
      return res.status(409).json({
        success: false,
        message: 'A property with this title already exists. Please use a different title.',
        error: 'DUPLICATE_SLUG'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const property = await db.Property.findByPk(id, {
      include: [
        { model: db.PropertyImage, as: 'images' },
        { model: db.Agent, as: 'agent' }
      ]
    });

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // Check permissions
    const isAdmin = ['admin', 'super_admin'].includes(userRole);
    let hasPermission = false;
    
    if (isAdmin) {
      hasPermission = true;
    } else if (property.user_id === userId) {
      hasPermission = true;
    } else {
      const agent = await db.Agent.findOne({ where: { user_id: userId } });
      if (agent && property.agent_id === agent.id) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this property.'
      });
    }

    // Update the property
    await property.update({
      title: updateData.title || property.title,
      description: updateData.description !== undefined ? updateData.description : property.description,
      price: updateData.price || property.price,
      type: updateData.type || property.type,
      location: updateData.location || property.location,
      address: updateData.address !== undefined ? updateData.address : property.address,
      bedrooms: updateData.bedrooms || property.bedrooms,
      bathrooms: updateData.bathrooms || property.bathrooms,
      sqft: updateData.sqft || property.sqft,
      status: updateData.status || property.status,
      is_featured: updateData.is_featured !== undefined ? updateData.is_featured : property.is_featured
    });

    // Handle images
    const imageUrls = updateData.images || [];
    if (imageUrls.length > 0) {
      await db.PropertyImage.destroy({ where: { property_id: property.id } });
      const images = imageUrls.map((url, index) => ({
        property_id: property.id,
        image_url: url,
        is_cover: index === 0,
        order: index,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await db.PropertyImage.bulkCreate(images);
    } else if (updateData.images !== undefined && imageUrls.length === 0) {
      await db.PropertyImage.destroy({ where: { property_id: property.id } });
    }

    const updatedProperty = await db.Property.findByPk(property.id, {
      include: [
        { model: db.PropertyImage, as: 'images' },
        { model: db.Agent, as: 'agent' }
      ]
    });

    res.json({ 
      success: true, 
      message: 'Property updated successfully', 
      data: updatedProperty 
    });
  } catch (error) {
    console.error('❌ Error updating property:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
};

// ✅ FIXED: Delete property - Make sure this is properly defined
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await db.Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    await property.destroy();
    res.json({ 
      success: true, 
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ============================================
// REQUEST CONTROLLERS
// ============================================

// controllers/realEstateController.js

// ✅ Create property request
// controllers/realEstateController.js

// ✅ Create property request (allow both authenticated and unauthenticated)
exports.createRequest = async (req, res) => {
  try {
    const { 
      type, 
      minPrice, 
      maxPrice, 
      location, 
      bedrooms, 
      bathrooms, 
      description,
      name, 
      phone, 
      email 
    } = req.body;

    console.log('📝 Creating property request:', req.body);

    // ✅ Get user_id from authenticated user (or null if not logged in)
    const userId = req.user?.id || null;

    // ✅ Validate required fields
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }
    if (!minPrice || !maxPrice) {
      return res.status(400).json({
        success: false,
        message: 'Price range is required'
      });
    }
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    const request = await db.PropertyRequest.create({
      user_id: userId,
      type: type || 'rent',
      min_price: parseFloat(minPrice),
      max_price: parseFloat(maxPrice),
      location,
      bedrooms: bedrooms ? parseInt(bedrooms) : 0,
      bathrooms: bathrooms ? parseInt(bathrooms) : 0,
      description: description || '',
      name: name || req.user?.full_name || '',
      phone: phone || req.user?.phone || '',
      email: email || req.user?.email || '',
      status: 'pending'
    });

    console.log('✅ Request created, ID:', request.id);

    res.status(201).json({ 
      success: true, 
      message: 'Request submitted successfully',
      data: request 
    });
  } catch (error) {
    console.error('❌ Error creating request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await db.PropertyRequest.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { 
          model: db.User, 
          as: 'user', 
          attributes: ['id', 'full_name', 'email'] 
        }
      ]
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await db.PropertyRequest.findByPk(id, {
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'full_name', 'email'] }
      ]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await db.PropertyRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await request.update({ status });
    res.json({ success: true, message: 'Request status updated', data: request });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// AGENT CONTROLLERS
// ============================================

// controllers/realEstateController.js - Fixed getAgents

// controllers/realEstateController.js - Simplified getAgents

/**
 * Get all agents - Simplified version
 * GET /api/real-estate/agents
 */
exports.getAgents = async (req, res) => {
  try {
    console.log('📡 Fetching all agents from database...');
    
    // ✅ Get ALL agents
    const agents = await db.Agent.findAll({
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${agents.length} agents`);
    
    // ✅ Get user data separately for each agent
    const formattedAgents = [];
    for (const agent of agents) {
      // Get user data
      const user = await db.User.findByPk(agent.user_id, {
        attributes: ['id', 'full_name', 'email', 'phone', 'profile_image', 'createdAt', 'updatedAt']
      });
      
      formattedAgents.push({
        id: agent.id,
        user_id: agent.user_id,
        name: agent.name || user?.full_name || 'Unknown Agent',
        email: agent.email || user?.email || '',
        phone: agent.phone || user?.phone || '',
        company: agent.company || '',
        profile_image: agent.profile_image || user?.profile_image || '',
        bio: agent.bio || '',
        rating: agent.rating || 0,
        total_reviews: agent.total_reviews || 0,
        is_verified: agent.is_verified || false,
        license_number: agent.license_number || '',
        years_experience: agent.years_experience || 0,
        contact_hours: agent.contact_hours || 'Mon-Fri 9:00 AM - 6:00 PM',
        response_time: agent.response_time || 'Within 24 hours',
        show_phone: agent.show_phone !== undefined ? agent.show_phone : true,
        show_email: agent.show_email !== undefined ? agent.show_email : false,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        user: user ? {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          profile_image: user.profile_image,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        } : null
      });
    }

    res.json({
      success: true,
      data: formattedAgents,
      count: formattedAgents.length
    });
  } catch (error) {
    console.error('❌ Error fetching agents:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch agents'
    });
  }
};

exports.getAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await db.Agent.findByPk(id, {
      include: [
        { 
          model: db.User, 
          as: 'user', 
          attributes: ['id', 'full_name', 'email', 'phone', 'profile_image'] 
        }
      ]
    });

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    console.error('❌ Error fetching agent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await db.Agent.findByPk(id);
    
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    const allowedFields = [
      'name', 'phone', 'email', 'company', 
      'profile_image', 'bio', 'is_verified', 
      'license_number', 'years_experience',
      'show_phone', 'show_email', 'contact_hours', 'response_time'
    ];
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await agent.update(updateData);

    if (req.body.name || req.body.phone) {
      await db.User.update(
        {
          full_name: req.body.name || undefined,
          phone: req.body.phone || undefined
        },
        { where: { id: agent.user_id } }
      );
    }

    const updatedAgent = await db.Agent.findByPk(id, {
      include: [
        { 
          model: db.User, 
          as: 'user', 
          attributes: ['id', 'full_name', 'email', 'phone'] 
        }
      ]
    });

    res.json({ 
      success: true, 
      message: 'Agent updated successfully', 
      data: updatedAgent 
    });
  } catch (error) {
    console.error('❌ Error updating agent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await db.Agent.findByPk(id);
    
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    const userId = agent.user_id;
    await agent.destroy();
    await db.User.update({ role: 'user' }, { where: { id: userId } });

    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting agent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/realEstateController.js

// ============================================
// AGENT PROFILE CONTROLLERS
// ============================================

// Get agent's own profile
exports.getAgentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.User.findByPk(userId);
    const agent = await db.Agent.findOne({ where: { user_id: userId } });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...agent.toJSON(),
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('Error getting agent profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update agent's own profile
exports.updateAgentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      company,
      bio,
      license_number,
      years_experience,
      contact_hours,
      response_time
    } = req.body;

    await db.User.update({ full_name, phone }, { where: { id: userId } });

    const agent = await db.Agent.findOne({ where: { user_id: userId } });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    await agent.update({
      name: full_name || agent.name,
      phone: phone || agent.phone,
      company: company || agent.company,
      bio: bio || agent.bio,
      license_number: license_number || agent.license_number,
      years_experience: years_experience || agent.years_experience,
      contact_hours: contact_hours || agent.contact_hours,
      response_time: response_time || agent.response_time
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: agent
    });
  } catch (error) {
    console.error('Error updating agent profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update agent settings - FIXED
exports.updateAgentSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      show_phone, 
      show_email, 
      notification_email, 
      notification_sms,
      notification_property_matches,
      notification_messages,
      notification_marketing,
      contact_hours,
      response_time
    } = req.body;

    console.log('📝 Updating agent settings for user:', userId);
    console.log('📝 Settings data:', req.body);

    const agent = await db.Agent.findOne({ where: { user_id: userId } });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    await agent.update({
      show_phone: show_phone !== undefined ? show_phone : agent.show_phone,
      show_email: show_email !== undefined ? show_email : agent.show_email,
      notification_email: notification_email !== undefined ? notification_email : agent.notification_email,
      notification_sms: notification_sms !== undefined ? notification_sms : agent.notification_sms,
      notification_property_matches: notification_property_matches !== undefined ? notification_property_matches : agent.notification_property_matches,
      notification_messages: notification_messages !== undefined ? notification_messages : agent.notification_messages,
      notification_marketing: notification_marketing !== undefined ? notification_marketing : agent.notification_marketing,
      contact_hours: contact_hours || agent.contact_hours,
      response_time: response_time || agent.response_time
    });

    console.log('✅ Settings updated for agent:', agent.id);

    const updatedAgent = await db.Agent.findByPk(agent.id, {
      include: [
        { 
          model: db.User, 
          as: 'user', 
          attributes: ['id', 'full_name', 'email', 'phone'] 
        }
      ]
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedAgent
    });
  } catch (error) {
    console.error('❌ Error updating agent settings:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get agent's properties
exports.getAgentProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const agent = await db.Agent.findOne({ where: { user_id: userId } });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    const properties = await db.Property.findAll({
      where: { agent_id: agent.id },
      include: [
        { model: db.PropertyImage, as: 'images', limit: 1 }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Error getting agent properties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSavedProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const saved = await db.SavedProperty.findAll({
      where: { user_id: userId },
      include: [
        { 
          model: db.Property, 
          as: 'property',
          include: [
            { model: db.PropertyImage, as: 'images', limit: 1 },
            { model: db.Agent, as: 'agent' }
          ]
        }
      ]
    });

    res.json({ success: true, data: saved.map(s => s.property) });
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const property = await db.Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const [saved, created] = await db.SavedProperty.findOrCreate({
      where: { user_id: userId, property_id: propertyId },
      defaults: { user_id: userId, property_id: propertyId }
    });

    res.json({ 
      success: true, 
      message: created ? 'Property saved' : 'Already saved',
      saved: created
    });
  } catch (error) {
    console.error('Error saving property:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unsaveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const deleted = await db.SavedProperty.destroy({
      where: { user_id: userId, property_id: propertyId }
    });

    res.json({ 
      success: true, 
      message: deleted ? 'Property unsaved' : 'Property was not saved'
    });
  } catch (error) {
    console.error('Error unsaving property:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LOCATION CONTROLLER
// ============================================

exports.getLocations = async (req, res) => {
  try {
    const locations = await db.RealEstateLocation.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    if (!locations || locations.length === 0) {
      const defaultLocations = [
        { id: 1, name: 'Vake' },
        { id: 2, name: 'Saburtalo' },
        { id: 3, name: 'Old Tbilisi' },
        { id: 4, name: 'Mtatsminda' },
        { id: 5, name: 'Vera' },
        { id: 6, name: 'Chughureti' },
        { id: 7, name: 'Avlabari' },
        { id: 8, name: 'Didube' },
        { id: 9, name: 'Gldani' },
        { id: 10, name: 'Isani' },
        { id: 11, name: 'Samgori' },
        { id: 12, name: 'Krkheli' }
      ];
      return res.json({ success: true, data: defaultLocations });
    }

    res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    const defaultLocations = [
      { id: 1, name: 'Vake' },
      { id: 2, name: 'Saburtalo' },
      { id: 3, name: 'Old Tbilisi' },
      { id: 4, name: 'Mtatsminda' },
      { id: 5, name: 'Vera' },
      { id: 6, name: 'Chughureti' },
      { id: 7, name: 'Avlabari' },
      { id: 8, name: 'Didube' },
      { id: 9, name: 'Gldani' },
      { id: 10, name: 'Isani' },
      { id: 11, name: 'Samgori' },
      { id: 12, name: 'Krkheli' }
    ];
    res.json({ success: true, data: defaultLocations });
  }
};

// ============================================
// MODULE EXPORTS - ALL FUNCTIONS
// ============================================

