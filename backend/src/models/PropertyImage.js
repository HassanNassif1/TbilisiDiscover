// models/PropertyImage.js
module.exports = (sequelize, DataTypes) => {
  const PropertyImage = sequelize.define('PropertyImage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    caption: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'property_images',
    timestamps: true,
    underscored: true
  });

  // Associations
  PropertyImage.associate = (db) => {
    PropertyImage.belongsTo(db.Property, {
      foreignKey: 'property_id',
      as: 'property',
      onDelete: 'CASCADE'
    });
  };

  return PropertyImage;
};