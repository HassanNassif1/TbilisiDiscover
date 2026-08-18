module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stripe_subscription_id: {
      type: DataTypes.STRING(255)
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'expired', 'cancelled', 'past_due']]
      }
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'subscriptions',
    timestamps: true
  });

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
    Subscription.belongsTo(models.SubscriptionPlan, { foreignKey: 'plan_id', as: 'plan' });
    Subscription.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Subscription.hasMany(models.Payment, { foreignKey: 'subscription_id', as: 'payments' });
  };

  return Subscription;
};