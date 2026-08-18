$analyticsController = @'
const { BusinessAnalytics, Business, User, Review, Favorite, sequelize, Op } = require('../models');

exports.getPublicStats = async (req, res) => {
  try {
    const totalBusinesses = await Business.count({ where: { status: 'active' } });
    const totalUsers = await User.count();
    const totalReviews = await Review.count({ where: { status: 'approved' } });

    return res.json({
      success: true,
      data: {
        total_businesses: totalBusinesses,
        total_users: totalUsers,
        total_reviews: totalReviews
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get public stats'
    });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [
        { model: Business, as: 'businesses' },
        { model: Review, as: 'reviews' },
        { model: Favorite, as: 'favorites' }
      ]
    });

    return res.json({
      success: true,
      data: {
        total_businesses: user.businesses?.length || 0,
        total_reviews: user.reviews?.length || 0,
        total_favorites: user.favorites?.length || 0,
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user analytics'
    });
  }
};

exports.getBusinessAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = '30d' } = req.query;

    const business = await Business.findByPk(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (business.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own business analytics'
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    const days = parseInt(period);
    startDate.setDate(startDate.getDate() - days);

    const analytics = await BusinessAnalytics.findAll({
      where: {
        business_id: businessId,
        date: { [Op.between]: [startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)] }
      },
      order: [['date', 'ASC']]
    });

    const totals = {
      views: analytics.reduce((sum, a) => sum + a.views, 0),
      search_appearances: analytics.reduce((sum, a) => sum + a.search_appearances, 0),
      phone_clicks: analytics.reduce((sum, a) => sum + a.phone_clicks, 0),
      website_clicks: analytics.reduce((sum, a) => sum + a.website_clicks, 0),
      map_clicks: analytics.reduce((sum, a) => sum + a.map_clicks, 0),
      menu_views: analytics.reduce((sum, a) => sum + a.menu_views, 0),
      deal_views: analytics.reduce((sum, a) => sum + a.deal_views, 0),
      booking_clicks: analytics.reduce((sum, a) => sum + a.booking_clicks, 0)
    };

    return res.json({
      success: true,
      data: {
        period: `${days}d`,
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          total_views: business.views
        },
        totals,
        daily: analytics
      }
    });
  } catch (error) {
    console.error('Get business analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get business analytics'
    });
  }
};

exports.trackEvent = async (req, res) => {
  try {
    const { event_type, business_id, metadata } = req.body;

    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const business = await Business.findByPk(business_id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    
    let analytics = await BusinessAnalytics.findOne({
      where: { business_id, date: today }
    });

    if (!analytics) {
      analytics = await BusinessAnalytics.create({
        business_id,
        date: today
      });
    }

    switch (event_type) {
      case 'view':
        analytics.views += 1;
        break;
      case 'search':
        analytics.search_appearances += 1;
        break;
      case 'phone_click':
        analytics.phone_clicks += 1;
        break;
      case 'website_click':
        analytics.website_clicks += 1;
        break;
      case 'map_click':
        analytics.map_clicks += 1;
        break;
      case 'menu_view':
        analytics.menu_views += 1;
        break;
      case 'deal_view':
        analytics.deal_views += 1;
        break;
      case 'booking_click':
        analytics.booking_clicks += 1;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid event type'
        });
    }

    await analytics.save();

    if (event_type === 'view') {
      business.views += 1;
      await business.save();
    }

    return res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Track event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
};
'@

# Write the file
$analyticsController | Out-File -FilePath "src\controllers\analyticsController.js" -Encoding utf8

Write-Host "✅ Created analyticsController.js"