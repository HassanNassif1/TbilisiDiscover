const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
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
    category_id: {
      type: DataTypes.INTEGER
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      defaultValue: 'Tbilisi'
    },
    neighborhood: {
      type: DataTypes.STRING(100)
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    phone: {
      type: DataTypes.STRING(50)
    },
    website: {
      type: DataTypes.STRING(255)
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING(500)
    },
    cover_image: {
      type: DataTypes.STRING(500)
    },
    price_range: {
      type: DataTypes.STRING(10),
      validate: {
        isIn: [['$', '$$', '$$$', '$$$$']]
      }
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'active', 'suspended', 'rejected']]
      }
    },
    is_premium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    subscription_plan_id: {
      type: DataTypes.INTEGER
    },
    subscription_expires_at: {
      type: DataTypes.DATE
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    place_id: {
      type: DataTypes.STRING(255)
    },
    photo_reference: {
      type: DataTypes.STRING(500)
    },
    deleted_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'businesses',
    paranoid: true,
    timestamps: true
  });

  Business.associate = (models) => {
    Business.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
    Business.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Business.hasMany(models.BusinessImage, { foreignKey: 'business_id', as: 'images' });
    Business.hasMany(models.BusinessHour, { foreignKey: 'business_id', as: 'hours' });
    Business.hasMany(models.Service, { foreignKey: 'business_id', as: 'services' });
    Business.hasMany(models.Menu, { foreignKey: 'business_id', as: 'menus' });
    Business.hasMany(models.Review, { foreignKey: 'business_id', as: 'reviews' });
    Business.hasMany(models.Favorite, { foreignKey: 'business_id', as: 'favorites' });
    Business.hasMany(models.Deal, { foreignKey: 'business_id', as: 'deals' });
    Business.hasMany(models.Event, { foreignKey: 'business_id', as: 'events' });
    Business.hasOne(models.Subscription, { foreignKey: 'business_id', as: 'subscription' });
  };

  Business.beforeCreate(async (business) => {
    if (!business.slug) {
      const baseSlug = slugify(business.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await Business.findOne({ where: { slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      business.slug = slug;
    }
  });

  return Business;
};