const { Business, Category, Location, Deal, Event, sequelize, Op } = require('../models');

exports.search = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      location, 
      type = 'all',
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (page - 1) * limit;
    const results = {};

    if (type === 'all' || type === 'businesses') {
      const where = { status: 'active' };
      
      if (q) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ];
      }
      
      if (category) {
        where.category_id = category;
      }
      
      if (location) {
        where[Op.or] = [
          { neighborhood: { [Op.iLike]: `%${location}%` } },
          { address: { [Op.iLike]: `%${location}%` } }
        ];
      }

      const { count, rows } = await Business.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'category' }
        ],
        order: [['rating', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      results.businesses = {
        total: count,
        items: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    }

    if (type === 'all' || type === 'deals') {
      const where = { status: 'active', is_active: true };
      
      if (q) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ];
      }

      const { count, rows } = await Deal.findAndCountAll({
        where,
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'slug', 'logo'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      results.deals = {
        total: count,
        items: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    }

    if (type === 'all' || type === 'events') {
      const where = { status: 'approved' };
      
      if (q) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } }
        ];
      }

      const { count, rows } = await Event.findAndCountAll({
        where,
        include: [
          { model: Business, as: 'business', attributes: ['id', 'name', 'slug', 'logo'] }
        ],
        order: [['event_date', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      results.events = {
        total: count,
        items: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    }

    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search'
    });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Get business suggestions
    const businesses = await Business.findAll({
      where: {
        status: 'active',
        name: { [Op.iLike]: `%${q}%` }
      },
      attributes: ['id', 'name', 'slug', 'logo'],
      limit: parseInt(limit)
    });

    // Get category suggestions
    const categories = await Category.findAll({
      where: {
        is_active: true,
        name: { [Op.iLike]: `%${q}%` }
      },
      attributes: ['id', 'name', 'slug'],
      limit: parseInt(limit)
    });

    // Get location suggestions
    const locations = await Location.findAll({
      where: {
        is_active: true,
        name: { [Op.iLike]: `%${q}%` }
      },
      attributes: ['id', 'name', 'slug'],
      limit: parseInt(limit)
    });

    const suggestions = [
      ...businesses.map(b => ({ type: 'business', ...b.toJSON() })),
      ...categories.map(c => ({ type: 'category', ...c.toJSON() })),
      ...locations.map(l => ({ type: 'location', ...l.toJSON() }))
    ];

    return res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};

exports.autocomplete = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: { results: [] }
      });
    }

    const results = await Business.findAll({
      where: {
        status: 'active',
        name: { [Op.iLike]: `%${q}%` }
      },
      attributes: ['id', 'name', 'slug', 'address', 'neighborhood'],
      limit: parseInt(limit)
    });

    return res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get autocomplete results'
    });
  }
};