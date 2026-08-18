const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Deal = sequelize.define('Deal', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    discount_percent: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    coupon_code: {
      type: DataTypes.STRING(100)
    },
    terms: {
      type: DataTypes.TEXT
    },
    image_url: {
      type: DataTypes.STRING(500)
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'active', 'expired', 'cancelled']]
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'deals',
    timestamps: true
  });

  Deal.associate = (models) => {
    Deal.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  };

  Deal.beforeCreate(async (deal) => {
    if (!deal.slug) {
      const baseSlug = slugify(deal.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await Deal.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      deal.slug = slug;
    }
  });

  return Deal;
};