const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    interval: {
      type: DataTypes.STRING(50),
      defaultValue: 'monthly',
      validate: {
        isIn: [['monthly', 'yearly']]
      }
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    max_photos: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    max_deals: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    has_menu: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    has_analytics: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    has_booking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'subscription_plans',
    timestamps: true
  });

  SubscriptionPlan.associate = (models) => {
    SubscriptionPlan.hasMany(models.Subscription, { foreignKey: 'plan_id', as: 'subscriptions' });
    SubscriptionPlan.hasMany(models.Business, { foreignKey: 'subscription_plan_id', as: 'businesses' });
  };

  SubscriptionPlan.beforeCreate(async (plan) => {
    if (!plan.slug) {
      const baseSlug = slugify(plan.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await SubscriptionPlan.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      plan.slug = slug;
    }
  });

  return SubscriptionPlan;
};