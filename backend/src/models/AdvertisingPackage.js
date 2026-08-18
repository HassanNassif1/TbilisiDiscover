module.exports = (sequelize, DataTypes) => {
  const AdvertisingPackage = sequelize.define('AdvertisingPackage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['featured', 'sponsored', 'homepage', 'category']]
      }
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
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'advertising_packages',
    timestamps: true
  });

  AdvertisingPackage.associate = (models) => {
    AdvertisingPackage.hasMany(models.AdvertisingCampaign, { foreignKey: 'package_id', as: 'campaigns' });
  };

  return AdvertisingPackage;
};