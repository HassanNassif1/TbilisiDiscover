module.exports = (sequelize, DataTypes) => {
  const BusinessImage = sequelize.define('BusinessImage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    caption: {
      type: DataTypes.STRING(255)
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'business_images',
    timestamps: true
  });

  BusinessImage.associate = (models) => {
    BusinessImage.belongsTo(models.Business, { foreignKey: 'business_id', as: 'business' });
  };

  return BusinessImage;
};