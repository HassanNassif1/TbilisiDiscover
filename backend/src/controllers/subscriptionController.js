const { Subscription, SubscriptionPlan, Business, Payment, AuditLog, sequelize, Op } = require('../models');

// Get all subscription plans (public)
exports.getPlans = async (req, res) => {
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
    console.error('Get plans error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans'
    });
  }
};

// Get plan by slug (public)
exports.getPlanBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const plan = await SubscriptionPlan.findOne({
      where: { slug, is_active: true }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    return res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    console.error('Get plan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subscription plan'
    });
  }
};

// Get current subscription (protected)
exports.getCurrentSubscription = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { user_id: req.user.id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'No business found for this user'
      });
    }

    const subscription = await Subscription.findOne({
      where: { 
        business_id: business.id,
        status: 'active'
      },
      include: [
        { model: SubscriptionPlan, as: 'plan' }
      ]
    });

    return res.json({
      success: true,
      data: { 
        subscription,
        is_subscribed: !!subscription,
        business: business
      }
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get current subscription'
    });
  }
};

// Subscribe to a plan (protected)
exports.subscribe = async (req, res) => {
  try {
    const { plan_id, payment_method } = req.body;

    // Check if plan exists
    const plan = await SubscriptionPlan.findByPk(plan_id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if user has a business
    const business = await Business.findOne({
      where: { user_id: req.user.id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'No business found for this user. Please register your business first.'
      });
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      where: {
        business_id: business.id,
        status: 'active'
      }
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    // Create subscription
    const startsAt = new Date();
    const expiresAt = new Date();
    if (plan.interval === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const subscription = await Subscription.create({
      business_id: business.id,
      plan_id: plan.id,
      status: 'active',
      starts_at: startsAt,
      expires_at: expiresAt,
      auto_renew: true
    });

    // Update business
    business.subscription_plan_id = plan.id;
    business.subscription_expires_at = expiresAt;
    business.is_premium = plan.is_featured || plan.price > 0;
    business.is_featured = plan.is_featured;
    await business.save();

    // Create payment record
    const payment = await Payment.create({
      user_id: req.user.id,
      business_id: business.id,
      subscription_id: subscription.id,
      amount: plan.price,
      currency: plan.currency || 'USD',
      status: 'pending',
      payment_method: payment_method || 'stripe',
      description: `${plan.name} subscription - ${business.name}`
    });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'subscription_create',
      target_type: 'subscription',
      target_id: subscription.id,
      changes: { plan_id: plan.id, business_id: business.id }
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: { 
        subscription,
        payment,
        plan
      }
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
};

// Cancel subscription (protected)
exports.cancelSubscription = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { user_id: req.user.id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'No business found for this user'
      });
    }

    const subscription = await Subscription.findOne({
      where: {
        business_id: business.id,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    subscription.status = 'cancelled';
    subscription.auto_renew = false;
    await subscription.save();

    // Update business
    business.subscription_plan_id = null;
    business.subscription_expires_at = null;
    business.is_premium = false;
    business.is_featured = false;
    await business.save();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'subscription_cancel',
      target_type: 'subscription',
      target_id: subscription.id
    });

    return res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: { subscription }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};

// Resume subscription (protected)
exports.resumeSubscription = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { user_id: req.user.id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'No business found for this user'
      });
    }

    const subscription = await Subscription.findOne({
      where: {
        business_id: business.id,
        status: 'cancelled'
      },
      include: [
        { model: SubscriptionPlan, as: 'plan' }
      ]
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No cancelled subscription found'
      });
    }

    // Check if subscription expired
    if (new Date(subscription.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Subscription has expired. Please create a new subscription.'
      });
    }

    subscription.status = 'active';
    subscription.auto_renew = true;
    await subscription.save();

    // Update business
    business.subscription_plan_id = subscription.plan_id;
    business.subscription_expires_at = subscription.expires_at;
    business.is_premium = subscription.plan.is_featured || subscription.plan.price > 0;
    business.is_featured = subscription.plan.is_featured;
    await business.save();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'subscription_resume',
      target_type: 'subscription',
      target_id: subscription.id
    });

    return res.json({
      success: true,
      message: 'Subscription resumed successfully',
      data: { subscription }
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resume subscription'
    });
  }
};

// Get subscription history (protected)
exports.getSubscriptionHistory = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { user_id: req.user.id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'No business found for this user'
      });
    }

    const subscriptions = await Subscription.findAll({
      where: {
        business_id: business.id
      },
      include: [
        { model: SubscriptionPlan, as: 'plan' },
        { model: Payment, as: 'payments' }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({
      success: true,
      data: { subscriptions }
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subscription history'
    });
  }
};