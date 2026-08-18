module.exports = (sequelize, DataTypes) => {
  const AdvertisingCampaign = sequelize.define('AdvertisingCampaign', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['featured', 'sponsored', 'homepage', 'category']]
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    package_id: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'active', 'completed', 'cancelled']]
      }
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'advertising_campaigns',
    timestamps: true
  });

  AdvertisingCampaign.associate = (models) => {
    AdvertisingCampaign.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
    AdvertisingCampaign.belongsTo(models.AdvertisingPackage, { foreignKey: 'package_id', as: 'package' });
  };

  return AdvertisingCampaign;
};