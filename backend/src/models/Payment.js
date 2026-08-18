module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    business_id: {
      type: DataTypes.INTEGER
    },
    subscription_id: {
      type: DataTypes.INTEGER
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255)
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'succeeded', 'failed', 'refunded']]
      }
    },
    payment_method: {
      type: DataTypes.STRING(50)
    },
    description: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'payments',
    timestamps: true
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Payment.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
    Payment.belongsTo(models.Subscription, { foreignKey: 'subscription_id', as: 'subscription' });
  };

  return Payment;
};