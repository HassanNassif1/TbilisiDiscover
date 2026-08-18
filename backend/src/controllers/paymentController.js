const { Payment, Business, Subscription, User, AuditLog, sequelize } = require('../models');

// Handle Stripe webhook (public)
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    // Process webhook events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// Helper functions for webhooks
async function handlePaymentSuccess(paymentIntent) {
  try {
    const payment = await Payment.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id }
    });
    if (payment) {
      payment.status = 'succeeded';
      await payment.save();
    }
  } catch (error) {
    console.error('Handle payment success error:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    const payment = await Payment.findOne({
      where: { stripe_payment_intent_id: paymentIntent.id }
    });
    if (payment) {
      payment.status = 'failed';
      await payment.save();
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
}

async function handleInvoicePaymentSuccess(invoice) {
  try {
    const subscription = await Subscription.findOne({
      where: { stripe_subscription_id: invoice.subscription }
    });
    if (subscription) {
      subscription.status = 'active';
      await subscription.save();
    }
  } catch (error) {
    console.error('Handle invoice payment success error:', error);
  }
}

// Create payment intent (protected)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'USD', description, business_id, subscription_id } = req.body;

    // For now, simulate payment creation
    // In production, use Stripe or another payment provider
    
    const payment = await Payment.create({
      user_id: req.user.id,
      business_id,
      subscription_id,
      amount,
      currency,
      status: 'pending',
      description,
      stripe_payment_intent_id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Simulate payment processing
    // In production, this would create a Stripe PaymentIntent

    return res.status(201).json({
      success: true,
      data: {
        payment,
        client_secret: `secret_${payment.id}` // Simulated
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
};

// Confirm payment (protected)
exports.confirmPayment = async (req, res) => {
  try {
    const { payment_id } = req.body;

    const payment = await Payment.findByPk(payment_id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Simulate confirmation
    payment.status = 'succeeded';
    await payment.save();

    // Update subscription if exists
    if (payment.subscription_id) {
      const subscription = await Subscription.findByPk(payment.subscription_id);
      if (subscription) {
        subscription.status = 'active';
        await subscription.save();
      }
    }

    await AuditLog.create({
      user_id: req.user.id,
      action: 'payment_confirm',
      target_type: 'payment',
      target_id: payment.id
    });

    return res.json({
      success: true,
      message: 'Payment confirmed',
      data: { payment }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

// Get payment history (protected)
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Payment.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        { model: Business, as: 'business', attributes: ['id', 'name', 'slug'] },
        { model: Subscription, as: 'subscription', include: ['plan'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      data: {
        payments: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
};

// Get payment details (protected)
exports.getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        { model: Business, as: 'business' },
        { model: Subscription, as: 'subscription', include: ['plan'] },
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.user_id !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own payments'
      });
    }

    return res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment details'
    });
  }
};

// Refund payment (protected)
exports.refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Only successful payments can be refunded'
      });
    }

    // Simulate refund
    payment.status = 'refunded';
    payment.metadata = {
      ...payment.metadata,
      refund_reason: reason || 'Customer requested refund',
      refunded_at: new Date().toISOString()
    };
    await payment.save();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'payment_refund',
      target_type: 'payment',
      target_id: payment.id,
      changes: { reason }
    });

    return res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refund payment'
    });
  }
};