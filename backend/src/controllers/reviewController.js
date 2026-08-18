const { Review, Business, User, AuditLog, Report, sequelize, Op } = require('../models');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { rating, title, content, images } = req.body;

    // Check if business exists and is active
    const business = await Business.findOne({
      where: { id: businessId, status: 'active' }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user already reviewed this business
    const existingReview = await Review.findOne({
      where: { business_id: businessId, user_id: req.user.id }
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this business'
      });
    }

    // Create review
    const review = await Review.create({
      business_id: businessId,
      user_id: req.user.id,
      rating,
      title,
      content,
      images: images || [],
      status: 'pending',
      is_verified: false
    });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'review_create',
      target_type: 'review',
      target_id: review.id
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Awaiting moderation.',
      data: { review }
    });

  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
};

// Get business reviews
exports.getBusinessReviews = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

    const offset = (page - 1) * limit;

    let order = [];
    switch (sort) {
      case 'newest':
        order = [['created_at', 'DESC']];
        break;
      case 'oldest':
        order = [['created_at', 'ASC']];
        break;
      case 'highest':
        order = [['rating', 'DESC']];
        break;
      case 'lowest':
        order = [['rating', 'ASC']];
        break;
      case 'helpful':
        order = [['helpful_count', 'DESC']];
        break;
      default:
        order = [['created_at', 'DESC']];
    }

    const { count, rows } = await Review.findAndCountAll({
      where: {
        business_id: businessId,
        status: 'approved'
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'profile_image'] }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get rating distribution
    const distribution = await Review.findAll({
      where: { business_id: businessId, status: 'approved' },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    const ratingDistribution = {};
    distribution.forEach(d => {
      ratingDistribution[d.rating] = parseInt(d.dataValues.count);
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
        },
        distribution: ratingDistribution
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

// Get review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'profile_image'] },
        { model: Business, as: 'business', attributes: ['id', 'name', 'slug'] }
      ]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    return res.json({
      success: true,
      data: { review }
    });

  } catch (error) {
    console.error('Get review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get review'
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content } = req.body;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Don't allow editing approved reviews without admin
    if (review.status === 'approved' && req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Approved reviews cannot be edited'
      });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.content = content || review.content;

    await review.save();

    return res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.destroy();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'review_delete',
      target_type: 'review',
      target_id: reviewId
    });

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

// Mark review as helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.helpful_count += 1;
    await review.save();

    return res.json({
      success: true,
      message: 'Marked as helpful',
      data: { helpful_count: review.helpful_count }
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
};

// Report review
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.reported = true;
    await review.save();

    // Create report
    await Report.create({
      reporter_id: req.user.id,
      target_type: 'review',
      target_id: reviewId,
      reason,
      description,
      status: 'pending'
    });

    return res.json({
      success: true,
      message: 'Review reported successfully'
    });

  } catch (error) {
    console.error('Report review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to report review'
    });
  }
};

// Moderate review (Admin only)
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, admin_notes } = req.body;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const oldStatus = review.status;
    review.status = status;
    review.admin_notes = admin_notes;

    if (status === 'approved') {
      review.is_verified = true;
    }

    await review.save();

    // Update business rating if approved
    if (status === 'approved' && oldStatus !== 'approved') {
      const business = await Business.findByPk(review.business_id);
      if (business) {
        const avgRating = await Review.findOne({
          where: { business_id: business.id, status: 'approved' },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
          ]
        });
        business.rating = avgRating ? parseFloat(avgRating.dataValues.avgRating) || 0 : 0;
        await business.save();
      }
    }

    await AuditLog.create({
      user_id: req.user.id,
      action: 'review_moderate',
      target_type: 'review',
      target_id: review.id,
      changes: { old_status: oldStatus, new_status: status, admin_notes }
    });

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