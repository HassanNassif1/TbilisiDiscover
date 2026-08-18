const { Location, Business, Category } = require('../models');

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    return res.json({
      success: true,
      data: { locations }
    });
  } catch (error) {
    console.error('Get locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get locations'
    });
  }
};

exports.getLocationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const location = await Location.findOne({
      where: {
        slug,
        is_active: true
      }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    return res.json({
      success: true,
      data: { location }
    });
  } catch (error) {
    console.error('Get location error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get location'
    });
  }
};

exports.getLocationBusinesses = async (req, res) => {
  try {
    const { id } = req.params;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 20, 1),
      100
    );

    const offset = (page - 1) * limit;

    const location = await Location.findByPk(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    const { count, rows } = await Business.findAndCountAll({
      where: {
        neighborhood: location.name,
        status: 'active'
      },
      include: [
        {
          model: Category,
          as: 'category'
        }
      ],
      order: [['rating', 'DESC']],
      limit,
      offset
    });

    return res.json({
      success: true,
      data: {
        location,
        businesses: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get location businesses error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to get location businesses'
    });
  }
};